package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"math"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/skygenesisenterprise/kami-sama/server/src/config"
	"github.com/skygenesisenterprise/kami-sama/server/src/models"
	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
	"gorm.io/datatypes"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

const (
	malSourceType    = "myanimelist"
	malMaxJobs       = 50
	malMaxLogs       = 100
	malRateLimitHour = 60
)

// ──────────────────────────────────────────────────────────────
// Settings (mirrors the ProviderSettings shape on the front-end)
// ──────────────────────────────────────────────────────────────

type MalSettings struct {
	APIKey               string `json:"apiKey"`
	APIURL               string `json:"apiUrl"`
	Timeout              int    `json:"timeout"`
	RateLimitPerSecond   int    `json:"rateLimitPerSecond"`
	CacheEnabled         bool   `json:"cacheEnabled"`
	CacheTTLHours        int    `json:"cacheTtlHours"`
	MaxCacheSizeMb       int    `json:"maxCacheSizeMb"`
	AutoSync             bool   `json:"autoSync"`
	SyncInterval         int    `json:"syncInterval"`
	RetryOnFail          bool   `json:"retryOnFail"`
	MaxRetries           int    `json:"maxRetries"`
	NotificationsEnabled bool   `json:"notificationsEnabled"`
	WebhookEnabled       bool   `json:"webhookEnabled"`
	WebhookURL           string `json:"webhookUrl"`
	IncludeNsfw          bool   `json:"includeNsfw"`
	IncludeManga         bool   `json:"includeManga"`
	SeasonalSync         bool   `json:"seasonalSync"`
	FetchCharacters      bool   `json:"fetchCharacters"`
	FetchReviews         bool   `json:"fetchReviews"`
	FetchRecommendations bool   `json:"fetchRecommendations"`
}

func defaultMalSettings(cfg config.MyAnimeListConfig) MalSettings {
	return MalSettings{
		APIKey:               cfg.ClientID,
		APIURL:               cfg.BaseURL,
		Timeout:              15,
		RateLimitPerSecond:   3,
		CacheEnabled:         true,
		CacheTTLHours:        48,
		MaxCacheSizeMb:       4096,
		AutoSync:             true,
		SyncInterval:         3600,
		RetryOnFail:          true,
		MaxRetries:           3,
		NotificationsEnabled: true,
		WebhookEnabled:       false,
		IncludeNsfw:          false,
		IncludeManga:         true,
		SeasonalSync:         true,
		FetchCharacters:      true,
		FetchReviews:         true,
		FetchRecommendations: true,
	}
}

// ──────────────────────────────────────────────────────────────
// Snapshot DTOs (mirror the front-end types in mal-provider-data.ts)
// ──────────────────────────────────────────────────────────────

type MalProviderInfo struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Slug        string  `json:"slug"`
	Type        string  `json:"type"`
	Status      string  `json:"status"`
	Version     string  `json:"version"`
	APIURL      string  `json:"apiUrl"`
	LastSyncAt  *string `json:"lastSyncAt"`
	MediaCount  int     `json:"mediaCount"`
	APIKeyValid bool    `json:"apiKeyValid"`
}

type MalStats struct {
	TotalAnime       int    `json:"totalAnime"`
	TotalManga       int    `json:"totalManga"`
	AiringAnime      int    `json:"airingAnime"`
	CompleteAnime    int    `json:"completeAnime"`
	UpcomingAnime    int    `json:"upcomingAnime"`
	CachedEntries    int    `json:"cachedEntries"`
	CacheSize        string `json:"cacheSize"`
	CacheTotalSize   string `json:"cacheTotalSize"`
	APICallsToday    int    `json:"apiCallsToday"`
	APICallsLimit    int    `json:"apiCallsLimit"`
	LastSyncDuration string `json:"lastSyncDuration"`
	SyncErrors       int    `json:"syncErrors"`
	BandwidthSaved   string `json:"bandwidthSaved"`
	AverageResponseMs int   `json:"averageResponseMs"`
}

type MalCategory struct {
	ID           string  `json:"id"`
	Type         string  `json:"type"`
	Label        string  `json:"label"`
	Count        int     `json:"count"`
	SyncedCount  int     `json:"syncedCount"`
	LastSyncedAt *string `json:"lastSyncedAt"`
	Enabled      bool    `json:"enabled"`
	AutoSync     bool    `json:"autoSync"`
	Season       *string `json:"season,omitempty"`
}

type MalJob struct {
	ID             string  `json:"id"`
	Type           string  `json:"type"`
	Status         string  `json:"status"`
	Category       *string `json:"category"`
	StartedAt      string  `json:"startedAt"`
	CompletedAt    *string `json:"completedAt"`
	Progress       int     `json:"progress"`
	ItemsProcessed int     `json:"itemsProcessed"`
	ItemsTotal     int     `json:"itemsTotal"`
	Errors         int     `json:"errors"`
	Duration       *string `json:"duration"`
	TriggeredBy    string  `json:"triggeredBy"`
}

type MalMapping struct {
	ID           string            `json:"id"`
	KamiID       string            `json:"kamiId"`
	KamiTitle    string            `json:"kamiTitle"`
	MalID        string            `json:"malId"`
	MediaType    string            `json:"mediaType"`
	MalType      string            `json:"malType"`
	Status       string            `json:"status"`
	ExternalIDs  map[string]string `json:"externalIds"`
	LastSyncedAt string            `json:"lastSyncedAt"`
	MatchScore   int               `json:"matchScore"`
	Episodes     *int              `json:"episodes"`
	Score        float64           `json:"score"`
}

type MalCapability struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Supported   bool   `json:"supported"`
	Enabled     bool   `json:"enabled"`
	Version     string `json:"version,omitempty"`
}

type MalLog struct {
	ID        string  `json:"id"`
	Timestamp string  `json:"timestamp"`
	Level     string  `json:"level"`
	Message   string  `json:"message"`
	Source    string  `json:"source"`
	Details   *string `json:"details,omitempty"`
}

type MalProviderSnapshot struct {
	Provider     MalProviderInfo `json:"provider"`
	Stats        MalStats        `json:"stats"`
	Categories   []MalCategory   `json:"categories"`
	Jobs         []MalJob        `json:"jobs"`
	Mappings     []MalMapping    `json:"mappings"`
	Capabilities []MalCapability `json:"capabilities"`
	Logs         []MalLog        `json:"logs"`
	Settings     MalSettings     `json:"settings"`
}

// MalSearchItem is a normalized MAL search hit mirroring the shared
// SourceResultItem shape used by the catalog source pickers.
type MalSearchItem struct {
	ID        string   `json:"id"`
	Source    string   `json:"source"`
	Title     string   `json:"title"`
	Subtitle  *string  `json:"subtitle,omitempty"`
	Type      string   `json:"type,omitempty"`
	Year      int      `json:"year,omitempty"`
	Rating    float64  `json:"rating,omitempty"`
	Genres    []string `json:"genres,omitempty"`
	Overview  string   `json:"overview,omitempty"`
	ImageURL  string   `json:"imageUrl,omitempty"`
	ArtURL    string   `json:"artUrl,omitempty"`
	ExtraMeta []string `json:"extraMeta,omitempty"`
}

var malCapabilities = []MalCapability{
	{ID: "anime-metadata", Name: "Anime Metadata", Description: "Fetch titles, synopses, scores, genres for anime entries", Supported: true, Enabled: true, Version: "2.0"},
	{ID: "manga-metadata", Name: "Manga Metadata", Description: "Fetch manga titles, chapters, volumes, scores", Supported: true, Enabled: true, Version: "2.0"},
	{ID: "seasonal-anime", Name: "Seasonal Anime", Description: "Fetch seasonal anime schedules and lineups", Supported: true, Enabled: true, Version: "1.0"},
	{ID: "top-lists", Name: "Top Lists", Description: "Fetch top rated anime and manga", Supported: true, Enabled: true},
	{ID: "search", Name: "Search", Description: "Search anime and manga by title", Supported: true, Enabled: true, Version: "2.0"},
	{ID: "character-data", Name: "Character Data", Description: "Fetch characters and voice actors (requires OAuth)", Supported: false, Enabled: false},
	{ID: "reviews", Name: "Reviews", Description: "Fetch user reviews (requires OAuth)", Supported: false, Enabled: false},
	{ID: "recommendations", Name: "Recommendations", Description: "Fetch similar anime/manga recommendations (requires OAuth)", Supported: false, Enabled: false},
	{ID: "user-lists", Name: "User Lists", Description: "Fetch user watchlist and reading list data (requires OAuth)", Supported: false, Enabled: false, Version: "1.0"},
	{ID: "forum-data", Name: "Forum Data", Description: "Fetch forum discussion topics (requires OAuth)", Supported: false, Enabled: false},
	{ID: "club-data", Name: "Club Data", Description: "Fetch anime/manga club information (requires OAuth)", Supported: false, Enabled: false},
	{ID: "news-feed", Name: "News Feed", Description: "Fetch latest anime/manga news articles (requires OAuth)", Supported: false, Enabled: false},
}

// ──────────────────────────────────────────────────────────────
// Service
// ──────────────────────────────────────────────────────────────

type MalService struct {
	db       *gorm.DB
	logger   *slog.Logger
	cfg      config.MyAnimeListConfig

	mu         sync.Mutex
	client     *MalClient
	clientKey  string
	clientNone bool

	jobs    []MalJob
	logs    []MalLog
	syncing bool

	apiCalls    int64
	latencySum  int64
	latencyN    int64
	lastSyncAt  *time.Time
	lastSyncDur time.Duration
}

func NewMalService(cfg config.MyAnimeListConfig, db *gorm.DB, logger *slog.Logger) *MalService {
	if logger == nil {
		logger = slog.Default()
	}
	s := &MalService{db: db, logger: logger, cfg: cfg}
	s.log("info", "scheduler", "MyAnimeList integration initialized", nil)
	return s
}

// resolveClient returns the active MAL client, preferring a persisted
// source_configs row (enabled) so UI changes apply immediately, then falling
// back to the env-configured client ID.
func (s *MalService) resolveClient(ctx context.Context) (*MalClient, error) {
	if s.db != nil {
		var row models.SourceConfig
		err := s.db.WithContext(ctx).Where("source_type = ?", malSourceType).First(&row).Error
		if err == nil && row.Enabled {
			key := row.UpdatedAt.String()
			if s.client == nil || s.clientKey != key {
				client, cerr := MalClientFromSourceConfig(&row)
				if cerr == nil && client.Enabled() {
					s.client = client
					s.clientKey = key
					s.clientNone = false
				} else {
					s.client = nil
					s.clientKey = ""
				}
			}
			if s.client != nil && !s.clientNone {
				return s.client, nil
			}
		} else if s.clientNone && s.client != nil {
			return s.client, nil
		}
	}

	if s.cfg.ClientID != "" {
		s.client = NewMalClient(MalConfig{ClientID: s.cfg.ClientID, BaseURL: s.cfg.BaseURL, Timeout: 15 * time.Second}, s.logger)
		s.clientKey = ""
		s.clientNone = true
		return s.client, nil
	}

	return nil, utils.NewError(http.StatusServiceUnavailable, "MYANIMELIST_DISABLED", "MyAnimeList integration is not enabled or not configured.", nil)
}

// loadSettings returns the effective settings, merging persisted values over
// defaults. When no row exists yet, env values are used.
func (s *MalService) loadSettings(ctx context.Context) MalSettings {
	settings := defaultMalSettings(s.cfg)
	if s.db == nil {
		return settings
	}
	var row models.SourceConfig
	err := s.db.WithContext(ctx).Where("source_type = ?", malSourceType).First(&row).Error
	if err != nil || len(row.Config) == 0 {
		return settings
	}
	if uerr := json.Unmarshal(row.Config, &settings); uerr != nil {
		s.logger.Warn("mal: failed to decode persisted settings", "error", uerr)
	}
	return settings
}

// saveSettings upserts the persisted source_configs row for myanimelist.
func (s *MalService) saveSettings(ctx context.Context, settings MalSettings) error {
	if s.db == nil {
		return utils.NewError(http.StatusInternalServerError, "MYANIMELIST_SAVE_FAILED", "Database unavailable.", nil)
	}
	if strings.TrimSpace(settings.APIKey) == "" {
		return utils.NewError(http.StatusBadRequest, "MYANIMELIST_KEY_REQUIRED", "An API key is required to enable the MyAnimeList integration.", nil)
	}
	if settings.APIURL == "" {
		settings.APIURL = defaultMalSettings(s.cfg).APIURL
	}
	raw, err := json.Marshal(settings)
	if err != nil {
		return utils.NewError(http.StatusInternalServerError, "MYANIMELIST_SAVE_FAILED", "Failed to encode settings: "+err.Error(), nil)
	}
	now := time.Now().UTC()
	row := &models.SourceConfig{
		Common:     models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
		SourceType: malSourceType,
		Enabled:    true,
		Config:     datatypes.JSON(raw),
	}
	err = s.db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "source_type"}},
		DoUpdates: clause.AssignmentColumns([]string{"enabled", "config", "updated_at"}),
	}).Create(row).Error
	if err != nil {
		return utils.NewError(http.StatusInternalServerError, "MYANIMELIST_SAVE_FAILED", "Failed to persist settings: "+err.Error(), nil)
	}
	// Force the client to be rebuilt from the fresh row on the next request.
	s.mu.Lock()
	s.client = nil
	s.clientKey = ""
	s.mu.Unlock()
	s.log("info", "settings", "MyAnimeList settings saved", nil)
	return nil
}

// GetSettings returns the effective settings (persisted row merged over env).
func (s *MalService) GetSettings(ctx context.Context) MalSettings {
	return s.loadSettings(ctx)
}

// SaveSettings persists the settings row and resets the cached client so the
// next request picks up the new configuration.
func (s *MalService) SaveSettings(ctx context.Context, settings MalSettings) error {
	return s.saveSettings(ctx, settings)
}

// GetSnapshot assembles the full dashboard payload.
func (s *MalService) GetSnapshot(ctx context.Context) (*MalProviderSnapshot, error) {
	settings := s.loadSettings(ctx)
	client, clientErr := s.resolveClient(ctx)
	enabled := clientErr == nil && client != nil && client.Enabled()

	status := "disconnected"
	if enabled {
		status = "connected"
	}
	s.mu.Lock()
	if s.syncing {
		status = "syncing"
	}
	syncing := s.syncing
	s.mu.Unlock()
	if syncing {
		status = "syncing"
	}

	animeCount, mangaCount, airingAnime, completeAnime, upcomingAnime, cached, lastAnime, lastManga, lastSyncAt, err := s.mediaCounts(ctx)
	if err != nil {
		return nil, err
	}

	lastSyncStr := s.lastSyncString(lastSyncAt)
	provider := MalProviderInfo{
		ID:          "myanimelist",
		Name:        "MyAnimeList",
		Slug:        malSourceType,
		Type:        "mal",
		Status:      status,
		Version:     "API v2",
		APIURL:      settings.APIURL,
		LastSyncAt:  lastSyncStr,
		MediaCount:  animeCount + mangaCount,
		APIKeyValid: enabled,
	}

	snapshot := &MalProviderSnapshot{
		Provider:     provider,
		Stats:        s.buildStats(settings, animeCount, mangaCount, airingAnime, completeAnime, upcomingAnime, cached, err == nil && lastSyncAt != nil),
		Categories:   s.buildCategories(settings, animeCount, mangaCount, lastAnime, lastManga),
		Jobs:         s.snapshotJobs(),
		Mappings:     s.buildMappings(ctx),
		Capabilities: malCapabilities,
		Logs:         s.snapshotLogs(),
		Settings:     settings,
	}
	return snapshot, nil
}

func (s *MalService) buildStats(settings MalSettings, anime, manga, airing, complete, upcoming, cached int, hasSync bool) MalStats {
	s.mu.Lock()
	apiCalls := int(s.apiCalls)
	avgMs := 0
	if s.latencyN > 0 {
		avgMs = int(s.latencySum / s.latencyN)
	}
	duration := s.lastSyncDur
	s.mu.Unlock()

	syncErrors := 0
	jobs := s.snapshotJobs()
	for _, j := range jobs {
		if j.Status == "failed" {
			syncErrors++
		}
	}

	lastSyncDuration := "Never"
	if hasSync || duration > 0 {
		lastSyncDuration = humanizeDuration(duration)
	}

	return MalStats{
		TotalAnime:        anime,
		TotalManga:        manga,
		AiringAnime:       airing,
		CompleteAnime:     complete,
		UpcomingAnime:     upcoming,
		CachedEntries:     cached,
		CacheSize:         "0 MB",
		CacheTotalSize:    strconv.Itoa(settings.MaxCacheSizeMb) + " MB",
		APICallsToday:     apiCalls,
		APICallsLimit:     malRateLimitHour,
		LastSyncDuration:  lastSyncDuration,
		SyncErrors:        syncErrors,
		BandwidthSaved:    "0 MB",
		AverageResponseMs: avgMs,
	}
}

func (s *MalService) buildCategories(settings MalSettings, anime, manga int, lastAnime, lastManga *time.Time) []MalCategory {
	animeEnabled := true
	mangaEnabled := settings.IncludeManga
	autoSync := settings.AutoSync
	season := currentSeasonLabel()

	catAnime := MalCategory{
		ID: "anime", Type: "anime", Label: "Anime",
		Count: anime, SyncedCount: anime,
		Enabled: animeEnabled, AutoSync: autoSync,
		Season: &season,
	}
	catManga := MalCategory{
		ID: "manga", Type: "manga", Label: "Manga",
		Count: manga, SyncedCount: manga,
		Enabled: mangaEnabled, AutoSync: autoSync,
	}
	if lastAnime != nil {
		ts := lastAnime.Format(time.RFC3339)
		catAnime.LastSyncedAt = &ts
	}
	if lastManga != nil {
		ts := lastManga.Format(time.RFC3339)
		catManga.LastSyncedAt = &ts
	}
	return []MalCategory{catAnime, catManga}
}

func (s *MalService) buildMappings(ctx context.Context) []MalMapping {
	if s.db == nil {
		return []MalMapping{}
	}
	var items []models.Anime
	s.db.WithContext(ctx).
		Where("metadata->>'mal_id' IS NOT NULL AND metadata->>'mal_id' <> ''").
		Order("updated_at DESC").
		Limit(50).
		Find(&items)
	mappings := make([]MalMapping, 0, len(items))
	for _, a := range items {
		malID := jsonValue(a.Metadata, "mal_id")
		if malID == "" {
			continue
		}
		mediaType := jsonValue(a.Metadata, "mal_type")
		if mediaType == "" {
			mediaType = "anime"
		}
		external := map[string]string{}
		if v := jsonValue(a.Metadata, "anilist_id"); v != "" {
			external["anilist"] = v
		}
		airingStatus := jsonValue(a.Metadata, "airing_status")
		if airingStatus == "" {
			airingStatus = a.Status
		}
		m := MalMapping{
			ID:           a.ID,
			KamiID:       a.ID,
			KamiTitle:    a.Title,
			MalID:        malID,
			MediaType:    mediaType,
			MalType:      mapFrontendMalType(jsonValue(a.Metadata, "media_type"), mediaType),
			Status:       normalizeAnimeStatus(airingStatus),
			ExternalIDs:  external,
			LastSyncedAt: a.UpdatedAt.Format(time.RFC3339),
			MatchScore:   100,
			Score:        a.Rating,
		}
		if a.TotalEpisodes > 0 {
			ep := a.TotalEpisodes
			m.Episodes = &ep
		}
		mappings = append(mappings, m)
	}
	if mappings == nil {
		mappings = []MalMapping{}
	}
	return mappings
}

// TestConnection validates the configured API key against the real MAL API.
func (s *MalService) TestConnection(ctx context.Context) (map[string]any, error) {
	client, err := s.resolveClient(ctx)
	if err != nil {
		return nil, err
	}
	start := time.Now()
	if err := s.measure(ctx, client, func() error {
		return client.Validate(ctx)
	}); err != nil {
		s.log("error", "auth", "MyAnimeList API key validation failed: "+err.Error(), nil)
		return nil, err
	}
	latency := time.Since(start)
	s.log("info", "auth", "MyAnimeList API key validated successfully", nil)
	return map[string]any{
		"reachable":     true,
		"latencyMs":     latency.Milliseconds(),
		"apiKeyValid":   true,
		"clientId":      client.ClientID(),
		"apiUrl":        client.BaseURL(),
	}, nil
}

// Search performs a title search against the MAL API and normalizes the hits
// into the shared source-result shape used by the catalog source pickers.
func (s *MalService) Search(ctx context.Context, query, mediaType string, limit int) ([]MalSearchItem, error) {
	client, err := s.resolveClient(ctx)
	if err != nil {
		return nil, err
	}
	if limit < 1 || limit > 50 {
		limit = 8
	}
	var items []MalSearchItem
	err = s.measure(ctx, client, func() error {
		resp, rerr := client.Search(ctx, query, mediaType, limit)
		if rerr != nil {
			return rerr
		}
		for _, li := range resp.Data {
			n := li.Node
			item := MalSearchItem{
				ID:       strconv.Itoa(n.ID),
				Source:   "MyAnimeList",
				Title:    n.Title,
				Type:     n.MediaType,
				Overview: n.Synopsis,
			}
			if n.MainPicture != nil {
				item.ImageURL = n.MainPicture.Medium
				item.ArtURL = n.MainPicture.Large
			}
			if n.AlternativeTitles != nil {
				if n.AlternativeTitles.Ja != "" && n.AlternativeTitles.Ja != n.Title {
					sub := n.AlternativeTitles.Ja
					item.Subtitle = &sub
				} else if n.AlternativeTitles.En != "" && n.AlternativeTitles.En != n.Title {
					sub := n.AlternativeTitles.En
					item.Subtitle = &sub
				}
			}
			if len(n.StartDate) >= 4 {
				if y, yerr := strconv.Atoi(n.StartDate[:4]); yerr == nil {
					item.Year = y
				}
			}
			if n.Mean != nil {
				item.Rating = math.Round((*n.Mean)*10*10) / 10
			}
			for _, g := range n.Genres {
				item.Genres = append(item.Genres, g.Name)
			}
			if strings.EqualFold(mediaType, "manga") {
				if n.NumVolumes > 0 {
					item.ExtraMeta = append(item.ExtraMeta, fmt.Sprintf("%d vol", n.NumVolumes))
				}
				if n.NumChapters > 0 {
					item.ExtraMeta = append(item.ExtraMeta, fmt.Sprintf("%d ch", n.NumChapters))
				}
			} else if n.NumEpisodes > 0 {
				item.ExtraMeta = append(item.ExtraMeta, fmt.Sprintf("%d eps", n.NumEpisodes))
			}
			items = append(items, item)
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	if items == nil {
		items = []MalSearchItem{}
	}
	return items, nil
}

// measure runs fn and records API call + latency counters.
func (s *MalService) measure(ctx context.Context, client *MalClient, fn func() error) error {
	s.mu.Lock()
	s.apiCalls++
	s.mu.Unlock()
	start := time.Now()
	err := fn()
	latency := time.Since(start).Milliseconds()
	s.mu.Lock()
	s.latencySum += latency
	s.latencyN++
	s.mu.Unlock()
	return err
}

// RunSync triggers a real synchronization against the MAL API.
func (s *MalService) RunSync(ctx context.Context, jobType, triggeredBy string) (MalJob, error) {
	s.mu.Lock()
	if s.syncing {
		s.mu.Unlock()
		return MalJob{}, utils.NewError(http.StatusConflict, "SYNC_IN_PROGRESS", "A MyAnimeList sync is already running.", nil)
	}
	s.syncing = true
	s.mu.Unlock()
	defer func() {
		s.mu.Lock()
		s.syncing = false
		s.mu.Unlock()
	}()

	client, err := s.resolveClient(ctx)
	if err != nil {
		return MalJob{}, err
	}

	now := time.Now().UTC()
	job := MalJob{
		ID:          utils.NewID(),
		Type:        jobType,
		Status:      "running",
		StartedAt:   now.Format(time.RFC3339),
		Progress:    0,
		TriggeredBy: triggeredBy,
	}
	s.prependJob(job)

	switch jobType {
	case "anime-sync":
		job = s.syncSeasonalAnime(ctx, client, job)
	case "seasonal-sync":
		job = s.syncSeasonalAnime(ctx, client, job)
	case "manga-sync":
		job = s.syncMangaRanking(ctx, client, job)
	default:
		job = s.syncUnsupported(ctx, job)
	}

	return job, nil
}

func (s *MalService) syncSeasonalAnime(ctx context.Context, client *MalClient, job MalJob) MalJob {
	year, season := currentYearSeason(time.Now())
	err := s.measure(ctx, client, func() error {
		r, rerr := client.GetSeasonalAnime(ctx, strconv.Itoa(year), season)
		if rerr != nil {
			return rerr
		}
		return s.importList(ctx, r.Data, "anime", &job)
	})
	if err != nil {
		return s.failJob(job, err)
	}
	job.Progress = 100
	completed := time.Now().UTC()
	job.Status = "completed"
	job.CompletedAt = strPtr(completed.Format(time.RFC3339))
	duration := completed.Sub(parseTime(job.StartedAt))
	job.Duration = strPtr(humanizeDuration(duration))
	s.updateJob(job)

	s.mu.Lock()
	s.lastSyncAt = &completed
	s.lastSyncDur = duration
	s.mu.Unlock()
	s.updateLastSyncAt(ctx, completed)

	s.log("info", "anime-sync", fmt.Sprintf("Anime sync completed: %d entries", job.ItemsProcessed),
		strPtr(fmt.Sprintf("%d errors. %s total.", job.Errors, humanizeDuration(duration))))
	return job
}

func (s *MalService) syncMangaRanking(ctx context.Context, client *MalClient, job MalJob) MalJob {
	err := s.measure(ctx, client, func() error {
		r, rerr := client.GetMangaRanking(ctx, "all", 100)
		if rerr != nil {
			return rerr
		}
		return s.importList(ctx, r.Data, "manga", &job)
	})
	if err != nil {
		return s.failJob(job, err)
	}
	job.Progress = 100
	completed := time.Now().UTC()
	job.Status = "completed"
	job.CompletedAt = strPtr(completed.Format(time.RFC3339))
	duration := completed.Sub(parseTime(job.StartedAt))
	job.Duration = strPtr(humanizeDuration(duration))
	s.updateJob(job)

	s.mu.Lock()
	s.lastSyncAt = &completed
	s.lastSyncDur = duration
	s.mu.Unlock()
	s.updateLastSyncAt(ctx, completed)

	s.log("info", "manga-sync", fmt.Sprintf("Manga sync completed: %d entries", job.ItemsProcessed),
		strPtr(fmt.Sprintf("%d errors. %s total.", job.Errors, humanizeDuration(duration))))
	return job
}

// syncUnsupported marks OAuth-gated job types as completed no-ops.
func (s *MalService) syncUnsupported(ctx context.Context, job MalJob) MalJob {
	completed := time.Now().UTC()
	job.Status = "completed"
	job.CompletedAt = strPtr(completed.Format(time.RFC3339))
	job.Progress = 100
	duration := completed.Sub(parseTime(job.StartedAt))
	job.Duration = strPtr(humanizeDuration(duration))
	s.updateJob(job)
	s.log("warn", job.Type, fmt.Sprintf("%s skipped: requires OAuth user token", job.Type), nil)
	return job
}

func (s *MalService) failJob(job MalJob, err error) MalJob {
	completed := time.Now().UTC()
	job.Status = "failed"
	job.CompletedAt = strPtr(completed.Format(time.RFC3339))
	job.Duration = strPtr(humanizeDuration(completed.Sub(parseTime(job.StartedAt))))
	s.updateJob(job)
	s.log("error", job.Type, "Sync failed: "+err.Error(), nil)
	return job
}

// importList upserts every item in the MAL payload and tracks job progress.
func (s *MalService) importList(ctx context.Context, items []malListItem, mediaType string, job *MalJob) error {
	total := len(items)
	job.ItemsTotal = total
	for i, item := range items {
		if err := s.upsertMalNode(ctx, item.Node, mediaType); err != nil {
			job.Errors++
			s.log("error", mediaType+"-sync", fmt.Sprintf("Failed to import MAL #%d (%s): %s", item.Node.ID, item.Node.Title, err.Error()), nil)
			continue
		}
		job.ItemsProcessed = i + 1
		if total > 0 {
			job.Progress = (i + 1) * 100 / total
		}
		s.updateJob(*job)
	}
	return nil
}

// upsertMalNode creates or updates an Anime row identified by metadata mal_id.
func (s *MalService) upsertMalNode(ctx context.Context, node malNode, mediaType string) error {
	malID := strconv.Itoa(node.ID)
	title := malTitle(node)

	// If MAL doesn't provide episode count, try to fetch from AniList
	totalEpisodes := node.NumEpisodes
	anilistID := 0
	if totalEpisodes == 0 && mediaType == "anime" {
		totalEpisodes = s.fetchEpisodeCountFromAnilist(ctx, title)
		anilistID = s.fetchAnilistIdFromTitle(ctx, title)
	}

	var existing models.Anime
	err := s.db.WithContext(ctx).Where("metadata->>'mal_id' = ?", malID).First(&existing).Error
	if err == nil {
		existing.Title = title
		existing.JapaneseTitle = malAltTitle(node, "ja")
		existing.Synopsis = cleanDescription(node.Synopsis)
		if pic := malPicture(node); pic != "" {
			existing.CoverImageUrl = pic
		}
		// Keep the editorial status once a curator has set one; only promote
		// legacy airing-style values to the staging "added" state.
		if isLegacyAiringStatus(existing.Status) {
			existing.Status = "added"
		}
		existing.Rating = malMean(node)
		existing.TotalEpisodes = totalEpisodes
		if node.StartSeason != nil {
			existing.ReleaseYear = node.StartSeason.Year
			existing.Season = strings.ToLower(node.StartSeason.Season)
		}
		existing.Source = strings.ToLower(node.Source)
		existing.AgeRating = strings.ToLower(node.Rating)
		existing.Metadata = buildMalMetadata(node, mediaType)
		existing.UpdatedAt = time.Now().UTC()
		if err := s.db.WithContext(ctx).Save(&existing).Error; err != nil {
			return err
		}
		s.ensureSeasonsAndEpisodes(ctx, &existing, nil)
		return nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	now := time.Now().UTC()
	metadata := buildMalMetadata(node, mediaType)
	// Add anilist_id to metadata if found
	if anilistID > 0 {
		var metaMap map[string]any
		if len(metadata) > 0 {
			_ = json.Unmarshal(metadata, &metaMap)
		}
		if metaMap == nil {
			metaMap = make(map[string]any)
		}
		metaMap["anilist_id"] = anilistID
		raw, _ := json.Marshal(metaMap)
		metadata = datatypes.JSON(raw)
	}

	anime := &models.Anime{
		Common:         models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
		Slug:           uniqueSlug(ctx, s.db, generateSlug(title)),
		Title:          title,
		JapaneseTitle:  malAltTitle(node, "ja"),
		Synopsis:       cleanDescription(node.Synopsis),
		CoverImageUrl:  malPicture(node),
		Status:         "added",
		Rating:         malMean(node),
		TotalEpisodes:  totalEpisodes,
		Source:         strings.ToLower(node.Source),
		AgeRating:      strings.ToLower(node.Rating),
		Metadata:       metadata,
	}
	if node.StartSeason != nil {
		anime.ReleaseYear = node.StartSeason.Year
		anime.Season = strings.ToLower(node.StartSeason.Season)
	}
	if err := s.db.WithContext(ctx).Create(anime).Error; err != nil {
		return err
	}
	s.ensureSeasonsAndEpisodes(ctx, anime, nil)
	return nil
}

// fetchEpisodeCountFromAnilist tries to get the episode count from AniList
// when MAL doesn't provide it. Returns 0 if not found.
func (s *MalService) fetchEpisodeCountFromAnilist(ctx context.Context, title string) int {
	query := `{"query":"{ Media(search: \"` + strings.ReplaceAll(title, `"`, `\\"`) + `\", type: ANIME) { episodes } }"}`
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Post("https://graphql.anilist.co", "application/json", strings.NewReader(query))
	if err != nil {
		return 0
	}
	defer resp.Body.Close()
	var result struct {
		Data struct {
			Media struct {
				Episodes *int `json:"episodes"`
			} `json:"Media"`
		} `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return 0
	}
	if result.Data.Media.Episodes != nil {
		return *result.Data.Media.Episodes
	}
	return 0
}

// fetchAnilistIdFromTitle searches AniList for an anime by title and returns the AniList ID.
// Returns 0 if not found.
func (s *MalService) fetchAnilistIdFromTitle(ctx context.Context, title string) int {
	client := NewAnilistClient(s.logger)
	return client.SearchMediaID(ctx, title)
}

func (s *MalService) updateLastSyncAt(ctx context.Context, ts time.Time) {
	if s.db == nil {
		return
	}
	s.db.WithContext(ctx).Model(&models.SourceConfig{}).
		Where("source_type = ?", malSourceType).
		Update("last_sync_at", ts)
}

// ──────────────────────────────────────────────────────────────
// Job / log ring buffers
// ──────────────────────────────────────────────────────────────

func (s *MalService) prependJob(job MalJob) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.jobs = append([]MalJob{job}, s.jobs...)
	if len(s.jobs) > malMaxJobs {
		s.jobs = s.jobs[:malMaxJobs]
	}
}

func (s *MalService) updateJob(job MalJob) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i := range s.jobs {
		if s.jobs[i].ID == job.ID {
			s.jobs[i] = job
			return
		}
	}
}

func (s *MalService) snapshotJobs() []MalJob {
	s.mu.Lock()
	defer s.mu.Unlock()
	out := make([]MalJob, len(s.jobs))
	copy(out, s.jobs)
	if out == nil {
		out = []MalJob{}
	}
	return out
}

func (s *MalService) log(level, source, message string, details *string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.logs = append([]MalLog{{
		ID:        utils.NewID(),
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Level:     level,
		Message:   message,
		Source:    source,
		Details:   details,
	}}, s.logs...)
	if len(s.logs) > malMaxLogs {
		s.logs = s.logs[:malMaxLogs]
	}
}

func (s *MalService) snapshotLogs() []MalLog {
	s.mu.Lock()
	defer s.mu.Unlock()
	out := make([]MalLog, len(s.logs))
	copy(out, s.logs)
	if out == nil {
		out = []MalLog{}
	}
	return out
}

// ──────────────────────────────────────────────────────────────
// DB aggregates
// ──────────────────────────────────────────────────────────────

// mediaCounts returns (anime, manga, airing, complete, upcoming, cached,
// lastAnime, lastManga, lastSyncAt, err). Manga entries are stored in the
// anime table and distinguished via metadata->>'mal_type'.
func (s *MalService) mediaCounts(ctx context.Context) (int, int, int, int, int, int, *time.Time, *time.Time, *time.Time, error) {
	if s.db == nil {
		return 0, 0, 0, 0, 0, 0, nil, nil, nil, nil
	}
	var totalAnime, totalManga, airing, complete, upcoming, cached int64

	s.db.WithContext(ctx).Model(&models.Anime{}).
		Where("(metadata->>'mal_type') IS DISTINCT FROM 'manga'").
		Count(&totalAnime)
	s.db.WithContext(ctx).Model(&models.Anime{}).
		Where("metadata->>'mal_type' = 'manga'").
		Count(&totalManga)
	s.db.WithContext(ctx).Model(&models.Anime{}).
		Where("COALESCE(metadata->>'airing_status', status) = 'airing' AND (metadata->>'mal_type') IS DISTINCT FROM 'manga'").
		Count(&airing)
	s.db.WithContext(ctx).Model(&models.Anime{}).
		Where("COALESCE(metadata->>'airing_status', status) IN ('completed','complete') AND (metadata->>'mal_type') IS DISTINCT FROM 'manga'").
		Count(&complete)
	s.db.WithContext(ctx).Model(&models.Anime{}).
		Where("COALESCE(metadata->>'airing_status', status) IN ('upcoming','not_yet_aired') AND (metadata->>'mal_type') IS DISTINCT FROM 'manga'").
		Count(&upcoming)
	s.db.WithContext(ctx).Model(&models.Anime{}).
		Where("metadata->>'mal_id' IS NOT NULL AND metadata->>'mal_id' <> ''").
		Count(&cached)

	var lastAnime, lastManga time.Time
	s.db.WithContext(ctx).Model(&models.Anime{}).
		Where("(metadata->>'mal_type') IS DISTINCT FROM 'manga'").
		Order("updated_at DESC").Limit(1).Pluck("updated_at", &lastAnime)
	s.db.WithContext(ctx).Model(&models.Anime{}).
		Where("metadata->>'mal_type' = 'manga'").
		Order("updated_at DESC").Limit(1).Pluck("updated_at", &lastManga)

	var lastSync time.Time
	s.db.WithContext(ctx).Model(&models.SourceConfig{}).
		Where("source_type = ?", malSourceType).
		Order("last_sync_at DESC").Limit(1).Pluck("last_sync_at", &lastSync)

	var lastSyncPtr *time.Time
	if !lastSync.IsZero() {
		lastSyncPtr = &lastSync
	}
	return int(totalAnime), int(totalManga), int(airing), int(complete), int(upcoming), int(cached),
		timeOrNil(lastAnime), timeOrNil(lastManga), lastSyncPtr, nil
}

func (s *MalService) lastSyncString(ts *time.Time) *string {
	if ts == nil {
		return nil
	}
	v := ts.Format(time.RFC3339)
	return &v
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

func malTitle(node malNode) string {
	if strings.TrimSpace(node.Title) != "" {
		return node.Title
	}
	if t := malAltTitle(node, "en"); t != "" {
		return t
	}
	return malAltTitle(node, "ja")
}

func malAltTitle(node malNode, lang string) string {
	if node.AlternativeTitles == nil {
		return ""
	}
	switch lang {
	case "en":
		return node.AlternativeTitles.En
	case "ja":
		return node.AlternativeTitles.Ja
	}
	return ""
}

func malPicture(node malNode) string {
	if node.MainPicture == nil {
		return ""
	}
	if node.MainPicture.Large != "" {
		return node.MainPicture.Large
	}
	return node.MainPicture.Medium
}

func malMean(node malNode) float64 {
	if node.Mean == nil {
		return 0
	}
	return *node.Mean
}

// mapMalStatus converts MAL API statuses to the front-end AnimeStatus set.
func mapMalStatus(status string) string {
	switch strings.ToLower(status) {
	case "currently_airing", "currently_publishing":
		return "airing"
	case "finished_airing", "finished":
		return "complete"
	case "not_yet_aired", "not_yet_published":
		return "upcoming"
	}
	return "upcoming"
}

// mapFrontendMalType converts MAL media types to the front-end malType set.
func mapFrontendMalType(malType, mediaType string) string {
	switch strings.ToLower(malType) {
	case "tv", "movie", "ova", "ona", "special":
		return strings.ToLower(malType)
	case "novel":
		return "light_novel"
	case "doujinshi":
		return "doujin"
	case "one_shot", "manhwa", "manhua", "manga":
		return strings.ToLower(malType)
	}
	if mediaType == "manga" {
		return "manga"
	}
	return "tv"
}

func normalizeAnimeStatus(status string) string {
	switch status {
	case "airing":
		return "airing"
	case "complete", "completed":
		return "complete"
	case "upcoming", "not_yet_aired":
		return "upcoming"
	case "hiatus":
		return "hiatus"
	case "cancelled":
		return "hiatus"
	}
	return "upcoming"
}

// isLegacyAiringStatus reports whether the stored editorial status is actually
// a legacy airing value (or empty), meaning it can safely be promoted to the
// staging "added" state by an importer without clobbering curation.
func isLegacyAiringStatus(status string) bool {
	switch status {
	case "", "airing", "complete", "completed", "upcoming", "not_yet_aired", "hiatus", "cancelled", "released":
		return true
	}
	return false
}

func buildMalMetadata(node malNode, mediaType string) datatypes.JSON {
	m := map[string]any{
		"mal_id":       node.ID,
		"mal_type":     mediaType,
		"media_type":   node.MediaType,
		"source":       node.Source,
		"rating":       node.Rating,
		"mean_score":   node.Mean,
		"rank":         node.Rank,
		"popularity":   node.Popularity,
		"airing_status": mapMalStatus(node.Status),
		"mal_status":    node.Status,
	}
	if node.NumChapters > 0 {
		m["num_chapters"] = node.NumChapters
	}
	if node.NumVolumes > 0 {
		m["num_volumes"] = node.NumVolumes
	}
	if len(node.Genres) > 0 {
		names := make([]string, 0, len(node.Genres))
		for _, g := range node.Genres {
			names = append(names, g.Name)
		}
		m["genres"] = names
	}
	raw, _ := json.Marshal(m)
	return datatypes.JSON(raw)
}

func jsonValue(raw datatypes.JSON, key string) string {
	if len(raw) == 0 {
		return ""
	}
	var m map[string]any
	if err := json.Unmarshal(raw, &m); err != nil {
		return ""
	}
	switch v := m[key].(type) {
	case string:
		return v
	case float64:
		return strconv.FormatFloat(v, 'f', -1, 64)
	case int:
		return strconv.Itoa(v)
	case int64:
		return strconv.FormatInt(v, 10)
	}
	return ""
}

func timeOrNil(t time.Time) *time.Time {
	if t.IsZero() {
		return nil
	}
	return &t
}

func strPtr(s string) *string { return &s }

func parseTime(s string) time.Time {
	t, err := time.Parse(time.RFC3339, s)
	if err != nil {
		return time.Now().UTC()
	}
	return t
}

func humanizeDuration(d time.Duration) string {
	if d < time.Second {
		return "0s"
	}
	d = d.Round(time.Second)
	parts := []string{}
	if h := int(d.Hours()); h > 0 {
		parts = append(parts, fmt.Sprintf("%dh", h))
	}
	if m := int(d.Minutes()) % 60; m > 0 {
		parts = append(parts, fmt.Sprintf("%dm", m))
	}
	if s := int(d.Seconds()) % 60; s > 0 || len(parts) == 0 {
		parts = append(parts, fmt.Sprintf("%ds", s))
	}
	return strings.Join(parts, " ")
}

func currentYearSeason(t time.Time) (int, string) {
	m := t.Month()
	season := "winter"
	switch {
	case m >= 1 && m <= 3:
		season = "winter"
	case m >= 4 && m <= 6:
		season = "spring"
	case m >= 7 && m <= 9:
		season = "summer"
	default:
		season = "fall"
	}
	return t.Year(), season
}

func currentSeasonLabel() string {
	year, season := currentYearSeason(time.Now())
	return fmt.Sprintf("%s %d", strings.Title(season), year)
}

// ensureSeasonsAndEpisodes creates a default Season 1 with placeholder
// episodes when no seasons exist yet for the given anime.
// parentID is always nil for MAL imports (no relation data available yet).
func (s *MalService) ensureSeasonsAndEpisodes(ctx context.Context, anime *models.Anime, parentID *string) {
	// If total episodes is 0, try to fetch from AniList
	if anime.TotalEpisodes <= 0 {
		anilistID := 0
		if anime.Metadata != nil {
			var metaMap map[string]any
			if err := json.Unmarshal(anime.Metadata, &metaMap); err == nil {
				if v, ok := metaMap["anilist_id"].(float64); ok {
					anilistID = int(v)
				}
			}
		}
		// If no anilist_id in metadata, search by title
		if anilistID == 0 {
			anilistID = s.fetchAnilistIdFromTitle(ctx, anime.Title)
			// Store anilist_id in metadata for future use
			if anilistID > 0 {
				var metaMap map[string]any
				if anime.Metadata != nil {
					_ = json.Unmarshal(anime.Metadata, &metaMap)
				}
				if metaMap == nil {
					metaMap = make(map[string]any)
				}
				metaMap["anilist_id"] = anilistID
				raw, _ := json.Marshal(metaMap)
				anime.Metadata = datatypes.JSON(raw)
				s.db.WithContext(ctx).Model(anime).Update("metadata", anime.Metadata)
			}
		}
		if anilistID > 0 {
			episodeCount := s.fetchEpisodeCountByID(ctx, anilistID)
			if episodeCount > 0 {
				anime.TotalEpisodes = episodeCount
				s.db.WithContext(ctx).Model(anime).Update("total_episodes", anime.TotalEpisodes)
			}
		}
		if anime.TotalEpisodes <= 0 {
			return
		}
	}

	targetAnimeID := anime.ID
	var seasonNumber int
	var maxEpisodeNumber int

	if parentID != nil {
		targetAnimeID = *parentID
		var maxSeason int
		s.db.WithContext(ctx).
			Model(&models.AnimeSeason{}).
			Where("anime_id = ?", *parentID).
			Select("COALESCE(MAX(number), 0)").
			Scan(&maxSeason)
		seasonNumber = maxSeason + 1
		// Get max episode number across all existing seasons
		s.db.WithContext(ctx).
			Model(&models.Episode{}).
			Where("anime_id = ?", *parentID).
			Select("COALESCE(MAX(number), 0)").
			Scan(&maxEpisodeNumber)
	} else {
		var count int64
		s.db.WithContext(ctx).Model(&models.AnimeSeason{}).Where("anime_id = ?", anime.ID).Count(&count)
		if count > 0 {
			return
		}
		seasonNumber = 1
		maxEpisodeNumber = 0
	}

	now := time.Now().UTC()
	season := &models.AnimeSeason{
		Common:       models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
		AnimeID:      targetAnimeID,
		Number:       seasonNumber,
		Title:        fmt.Sprintf("Season %d", seasonNumber),
		EpisodeCount: anime.TotalEpisodes,
	}
	if err := s.db.WithContext(ctx).Create(season).Error; err != nil {
		return
	}
	for ep := 1; ep <= anime.TotalEpisodes; ep++ {
		episode := &models.Episode{
			Common:   models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
			AnimeID:  targetAnimeID,
			SeasonID: &season.ID,
			Number:   maxEpisodeNumber + ep,
			Title:    fmt.Sprintf("Episode %d", maxEpisodeNumber+ep),
			IsSubbed: true,
		}
		s.db.WithContext(ctx).Create(episode)
	}
}

// fetchEpisodeCountByID fetches episode count from AniList by ID.
func (s *MalService) fetchEpisodeCountByID(ctx context.Context, anilistID int) int {
	query := fmt.Sprintf(`{"query":"{ Media(id: %d, type: ANIME) { episodes } }"}`, anilistID)
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Post("https://graphql.anilist.co", "application/json", strings.NewReader(query))
	if err != nil {
		return 0
	}
	defer resp.Body.Close()
	var result struct {
		Data struct {
			Media struct {
				Episodes *int `json:"episodes"`
			} `json:"Media"`
		} `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return 0
	}
	if result.Data.Media.Episodes != nil {
		return *result.Data.Media.Episodes
	}
	return 0
}
