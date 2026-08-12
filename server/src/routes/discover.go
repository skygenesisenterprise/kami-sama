package routes

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/skygenesisenterprise/kami-sama/server/src/interfaces"
	"github.com/skygenesisenterprise/kami-sama/server/src/models"
	"github.com/skygenesisenterprise/kami-sama/server/src/services"
	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
)

// ──────────────────────────────────────────────────────────────
// API response types – mirrors apps/types/api/discover.ts
// ──────────────────────────────────────────────────────────────

type ApiImage struct {
	URL    string `json:"url"`
	Width  *int   `json:"width,omitempty"`
	Height *int   `json:"height,omitempty"`
}

type ApiImages struct {
	Poster   ApiImage  `json:"poster"`
	Backdrop ApiImage  `json:"backdrop"`
	Logo     *ApiImage `json:"logo,omitempty"`
}

type ApiContentMetadata struct {
	Genres        []string `json:"genres"`
	Studio        string   `json:"studio"`
	Rating        float64  `json:"rating"`
	RatingCount   *int     `json:"ratingCount,omitempty"`
	AgeRating     string   `json:"ageRating,omitempty"`
	Year          int      `json:"year"`
	JapaneseTitle string   `json:"japaneseTitle,omitempty"`
	Synopsis      string   `json:"synopsis,omitempty"`
}

type ApiContentAvailability struct {
	Watchable bool `json:"watchable"`
	Episodes  int  `json:"episodes"`
	Seasons   *int `json:"seasons,omitempty"`
}

type ApiContentItem struct {
	ID           string                 `json:"id"`
	Slug         string                 `json:"slug"`
	Title        string                 `json:"title"`
	Type         string                 `json:"type"`
	Format       string                 `json:"format"`
	Status       string                 `json:"status"`
	Year         int                    `json:"year"`
	Images       ApiImages              `json:"images"`
	Metadata     ApiContentMetadata     `json:"metadata"`
	Availability ApiContentAvailability `json:"availability"`
}

type ApiSection struct {
	ID       string           `json:"id"`
	Title    string           `json:"title"`
	Type     string           `json:"type"`
	Subtitle string           `json:"subtitle,omitempty"`
	CtaLabel string           `json:"ctaLabel,omitempty"`
	CtaHref  string           `json:"ctaHref,omitempty"`
	Items    []ApiContentItem `json:"items"`
}

type DiscoverPageResponse struct {
	Page      string       `json:"page"`
	UpdatedAt string       `json:"updatedAt"`
	Sections  []ApiSection `json:"sections"`
}

type ContinueWatchingItem struct {
	Content         ApiContentItem `json:"content"`
	EpisodeNumber   int            `json:"episodeNumber"`
	SeasonNumber    int            `json:"seasonNumber"`
	ProgressPercent int            `json:"progressPercent"`
	Duration        int            `json:"duration"`
	CurrentTime     int            `json:"currentTime"`
	WatchedAt       string         `json:"watchedAt"`
}

// ──────────────────────────────────────────────────────────────
// Handler
// ──────────────────────────────────────────────────────────────

type DiscoverHandler struct {
	deps Dependencies
	// keys caches provider stream-key resolutions (slug + episodeId) so the
	// /stream metadata endpoint and the same-origin proxy don't each pay the
	// cost of a media-server title search on every episode switch.
	keys *streamKeyCache
	// bridgeMu guards bridgeInflight: the set of in-flight Plex→Jellyfin
	// bridges keyed by stream key so concurrent callers share ONE bridge
	// instead of racing over the same .strm file (see bridgeStreamKey).
	bridgeMu       sync.Mutex
	bridgeInflight map[string]*bridgeCall
}

func NewDiscoverHandler(deps Dependencies) *DiscoverHandler {
	return &DiscoverHandler{
		deps: deps,
		keys: newStreamKeyCache(deps.Config.MediaSource.Jellyfin.CacheTTL),
	}
}

// streamKeyCache memoises stream-key resolutions in-process. Resolving a key
// against the media-server can require a title search (findJellyfinItem) which
// is far too slow to run twice per episode — once for the /stream metadata
// check, once for the first proxy/manifest fetch. Entries expire after
// MEDIA_SOURCE_CACHE_TTL (default 5m) and the map is bounded: when full, it is
// simply reset so a misbehaving caller can't grow memory unbounded.
type streamKeyCacheEntry struct {
	key           string
	isMovie       bool
	provider      string // "jellyfin" or "plex"
	mediaSourceId string // Jellyfin MediaSourceId when bridging Plex→Jellyfin
	bridgeFailed  bool   // Plex→Jellyfin bridge was attempted and failed
	// sessionQuery is the upstream master URL's query params (DeviceId,
	// MediaSourceId, forced VideoCodec/AudioCodec, …). The proxy re-injects
	// them into every variant/segment upstream request so the whole playback
	// binds to ONE transcode session with the browser-decodable codecs — see
	// setSessionQuery / mergeSessionParams.
	sessionQuery url.Values
	// masterURL is the PlaybackInfo-negotiated HLS master URL when negotiation
	// succeeded, so /stream and the proxy share one PlaybackInfo probe instead
	// of each paying its (slow, remote-probing) cost. Empty = not negotiated.
	masterURL string
	err       error
	expires   time.Time
}

type streamKeyCache struct {
	mu      sync.Mutex
	ttl     time.Duration
	max     int
	entries map[string]streamKeyCacheEntry
}

func newStreamKeyCache(ttl time.Duration) *streamKeyCache {
	if ttl <= 0 {
		ttl = 5 * time.Minute
	}
	return &streamKeyCache{
		ttl:     ttl,
		max:     512,
		entries: make(map[string]streamKeyCacheEntry, 64),
	}
}

func (sc *streamKeyCache) get(cacheKey string) (streamKeyCacheEntry, bool) {
	sc.mu.Lock()
	defer sc.mu.Unlock()
	ent, ok := sc.entries[cacheKey]
	if !ok {
		return streamKeyCacheEntry{}, false
	}
	if time.Now().After(ent.expires) {
		delete(sc.entries, cacheKey)
		return streamKeyCacheEntry{}, false
	}
	return ent, true
}

func (sc *streamKeyCache) set(cacheKey, key, provider string, isMovie bool, err error) {
	sc.mu.Lock()
	defer sc.mu.Unlock()
	if len(sc.entries) >= sc.max {
		sc.entries = make(map[string]streamKeyCacheEntry, 64)
	}
	sc.entries[cacheKey] = streamKeyCacheEntry{
		key:      key,
		isMovie:  isMovie,
		provider: provider,
		err:      err,
		expires:  time.Now().Add(sc.ttl),
	}
}

func (sc *streamKeyCache) setMediaSourceId(cacheKey, mediaSourceId string) {
	sc.mu.Lock()
	defer sc.mu.Unlock()
	if ent, ok := sc.entries[cacheKey]; ok {
		ent.mediaSourceId = mediaSourceId
		sc.entries[cacheKey] = ent
	}
}

// setSessionQuery records the upstream master URL's query params so the
// proxy can re-inject them into every variant/segment request. Jellyfin's
// media playlists are not guaranteed to echo the full session query on every
// URL line; without the injection each request would start its OWN session
// with DEFAULT codecs (typically an HEVC remux for a bridged Plex source),
// which Chromium's MSE cannot decode — the player dies with hls.js
// bufferAppendingError.
func (sc *streamKeyCache) setSessionQuery(cacheKey string, q url.Values) {
	if len(q) == 0 {
		return
	}
	copy := make(url.Values, len(q))
	for k, vs := range q {
		copy[k] = append([]string(nil), vs...)
	}
	sc.mu.Lock()
	defer sc.mu.Unlock()
	if ent, ok := sc.entries[cacheKey]; ok {
		ent.sessionQuery = copy
		sc.entries[cacheKey] = ent
	}
}

// setMasterURL caches a PlaybackInfo-negotiated master URL for a stream key
// (see DiscoverHandler.jellyfinMasterURL).
func (sc *streamKeyCache) setMasterURL(cacheKey, masterURL string) {
	if masterURL == "" {
		return
	}
	sc.mu.Lock()
	defer sc.mu.Unlock()
	if ent, ok := sc.entries[cacheKey]; ok {
		ent.masterURL = masterURL
		sc.entries[cacheKey] = ent
	}
}

// markBridgeFailed records that the Plex→Jellyfin bridge was attempted for
// this item and failed, so callers skip it and fall straight back to Plex
// HLS instead of repeating the (slow) failed bridge on every request.
func (sc *streamKeyCache) markBridgeFailed(cacheKey string) {
	sc.mu.Lock()
	defer sc.mu.Unlock()
	if ent, ok := sc.entries[cacheKey]; ok {
		ent.bridgeFailed = true
		sc.entries[cacheKey] = ent
	}
}

// del removes a stream-key entry (key, provider, mediaSourceId, negotiated
// master and session query) so the next request re-resolves from scratch.
// Used to heal poisoned entries — a MediaSourceId or negotiated master that
// went stale because a concurrent bridge re-created the .strm item, or a
// transcode session that died — instead of replaying the dead resolution for
// the whole cache TTL (the master request would keep answering HTTP 400).
func (sc *streamKeyCache) del(cacheKey string) {
	sc.mu.Lock()
	defer sc.mu.Unlock()
	delete(sc.entries, cacheKey)
}

// GetDiscover returns the full discover page with all sections.
func (h *DiscoverHandler) GetDiscover(c *gin.Context) {
	ctx := c.Request.Context()
	now := time.Now().UTC()

	// Determine which season we are in
	season := currentSeason(now)
	year := now.Year()

	// Fetch trending (popular now)
	trending, err := h.deps.AnilistService.GetTrending(ctx, "ANIME", 1, 20)
	if err != nil {
		h.deps.Logger.Error("failed to fetch trending from anilist", "error", err)
		utils.Error(c, err)
		return
	}

	// Fetch popular of all time
	popular, err := h.deps.AnilistService.GetPopular(ctx, "ANIME", 1, 20)
	if err != nil {
		h.deps.Logger.Error("failed to fetch popular from anilist", "error", err)
		utils.Error(c, err)
		return
	}

	// Fetch current season
	seasonal, err := h.deps.AnilistService.GetSeasonal(ctx, season, year, 1, 20)
	if err != nil {
		h.deps.Logger.Warn("failed to fetch seasonal from anilist", "error", err)
	}

	// Build sections
	sections := []ApiSection{
		{
			ID:       "trending",
			Title:    "Tendances actuelles",
			Type:     "carousel",
			Subtitle: "Les anime les plus populaires du moment",
			CtaLabel: "Voir tout",
			CtaHref:  "/catalog?sort=trending",
			Items:    mapAnilistMediaToContentItems(trending.Media),
		},
		{
			ID:       "popular",
			Title:    "Les plus populaires",
			Type:     "carousel",
			Subtitle: "Les anime les mieux notés de tous les temps",
			CtaLabel: "Voir tout",
			CtaHref:  "/catalog?sort=popular",
			Items:    mapAnilistMediaToContentItems(popular.Media),
		},
	}

	// Add seasonal section if we have data
	if seasonal != nil && len(seasonal.Media) > 0 {
		seasonLabel := seasonDisplayName(season)
		sections = append(sections, ApiSection{
			ID:       "seasonal",
			Title:    fmt.Sprintf("%s %d - Nouveautés", seasonLabel, year),
			Type:     "carousel",
			Subtitle: "Les anime de cette saison",
			CtaLabel: "Voir tout",
			CtaHref:  fmt.Sprintf("/catalog?season=%s&year=%d", strings.ToLower(season), year),
			Items:    mapAnilistMediaToContentItems(seasonal.Media),
		})
	}

	// Add genre-based sections (top items from trending grouped by genre)
	genreSections := buildGenreSections(trending.Media, popular.Media)
	sections = append(sections, genreSections...)

	resp := DiscoverPageResponse{
		Page:      "discover",
		UpdatedAt: now.Format(time.RFC3339),
		Sections:  sections,
	}

	utils.Success(c, http.StatusOK, resp)
}

// GetDiscoverSections returns the discover sections built from published collections
// that have the discover flag enabled, ordered by discover_order.
func (h *DiscoverHandler) GetDiscoverSections(c *gin.Context) {
	collections, err := h.deps.CollectionService.ListDiscover(c.Request.Context())
	if err != nil {
		utils.Error(c, err)
		return
	}
	sections := make([]ApiSection, 0, len(collections))
	for i := range collections {
		col := &collections[i]
		title := coalesceStr(col.DiscoverTitle, col.Title)
		subtitle := coalesceStr(col.DiscoverSubtitle, col.Description)
		ctaHref := coalesceStr(col.DiscoverHref, "/catalog")
		items := make([]ApiContentItem, 0, len(col.Entries))
		for j := range col.Entries {
			items = append(items, animeModelToContentItem(&col.Entries[j].Anime))
		}
		sections = append(sections, ApiSection{
			ID:       col.ID,
			Title:    title,
			Type:     "carousel",
			Subtitle: subtitle,
			CtaLabel: col.DiscoverCta,
			CtaHref:  ctaHref,
			Items:    items,
		})
	}
	utils.Success(c, http.StatusOK, gin.H{"sections": sections})
}

// ──────────────────────────────────────────────────────────────
// Discover catalog algorithm
//
// GetPublishedCatalog builds the public page automatically from whatever is
// published in the admin catalog (status = 'published'), so no manual
// collection curation is required. The algorithm is deliberately generous:
// it fetches the WHOLE published pool (paginated, not a fixed first page),
// never truncates a rail, and returns one genre rail per genre with enough
// content — so as much of the available catalog as possible is proposed.
//
// It returns:
//   - hero:    up to 5 slides selected automatically (rating + featured +
//     having a backdrop, most recent as tie-breaker)
//   - sections: auto-generated rails — À la une (featured), popular, latest,
//     genre rails — all excluding the hero titles to avoid redundancy.
//
// ──────────────────────────────────────────────────────────────

// discoverPoolPageSize is the page size used to load the full published
// catalog that backs the discover algorithm.
const discoverPoolPageSize = 100

// discoverPoolMaxItems is a safety ceiling for the pool. The algorithm loads
// the whole catalog (5× the old 100-item first page) so every rail — auto and
// frontend manual collections — can draw from the full published catalog.
// The repository List() preloads all relationships per item (N+1), and every
// pool item becomes a DOM tile + hover card, so an unbounded pool would
// degrade both the response and the page.
const discoverPoolMaxItems = 500

// maxGenreSections caps how many auto genre rails the page returns. Genres
// are a themed re-grouping of the pool (which already carries every item),
// so only the biggest genres get their own rail — frontend personal + manual
// collections still get room.
const maxGenreSections = 8

// loadPublishedPool fetches every published catalog item (top-rated), walking
// pages until the catalog is exhausted. Returns the full pool so every rail
// (auto + frontend manual collections) can draw from the complete catalog.
func (h *DiscoverHandler) loadPublishedPool(ctx context.Context) ([]models.Anime, error) {
	pool := make([]models.Anime, 0, discoverPoolPageSize)
	for page := 1; ; page++ {
		items, _, err := h.deps.AnimeService.List(ctx, interfaces.ListAnimeOpts{
			Page:   page,
			Limit:  discoverPoolPageSize,
			Status: "published",
			Sort:   "rating",
		})
		if err != nil {
			return nil, err
		}
		pool = append(pool, items...)
		if len(items) < discoverPoolPageSize || len(pool) >= discoverPoolMaxItems {
			break
		}
	}
	return pool, nil
}

func (h *DiscoverHandler) GetPublishedCatalog(c *gin.Context) {
	ctx := c.Request.Context()

	// Raw material: the whole published catalog (top-rated pool) + latest.
	// The pool is no longer capped at a fixed first page — the algorithm
	// proposes as much of the catalog as available.
	pool, err := h.loadPublishedPool(ctx)
	if err != nil {
		h.deps.Logger.Error("failed to load published catalog (pool)", "error", err)
		utils.Error(c, err)
		return
	}
	latest, _, err := h.deps.AnimeService.List(ctx, interfaces.ListAnimeOpts{Page: 1, Limit: discoverPoolPageSize, Status: "published", Sort: "created_at"})
	if err != nil {
		h.deps.Logger.Error("failed to load published catalog (latest)", "error", err)
		utils.Error(c, err)
		return
	}
	featuredFlag := true
	featured, _, _ := h.deps.AnimeService.List(ctx, interfaces.ListAnimeOpts{Page: 1, Limit: discoverPoolPageSize, Status: "published", Featured: &featuredFlag})

	// Hero: up to 5 automatically selected slides, no manual curation.
	hero := selectHeroItems(pool, 5)
	exclude := make(map[string]bool, len(hero))
	for _, item := range hero {
		exclude[item.ID] = true
	}

	sections := make([]ApiSection, 0, 8)

	if featItems := contentItemsExcluding(featured, exclude); len(featItems) > 0 {
		sections = append(sections, ApiSection{
			ID:       "catalog-featured",
			Title:    "À la une",
			Type:     "carousel",
			Subtitle: "Les incontournables de la plateforme",
			CtaLabel: "Voir tout",
			CtaHref:  "/catalog?sort=featured",
			Items:    featItems,
		})
	}

	// Full pool — no truncation: the rail shows every published title so as
	// much content as possible is proposed.
	topItems := contentItemsExcluding(pool, exclude)
	sections = append(sections, ApiSection{
		ID:       "catalog-top",
		Title:    "Les plus populaires",
		Type:     "carousel",
		Subtitle: "Les titres les mieux notés de la plateforme",
		CtaLabel: "Voir tout",
		CtaHref:  "/catalog?sort=popular",
		Items:    topItems,
	})

	latestItems := contentItemsExcluding(latest, exclude)
	sections = append(sections, ApiSection{
		ID:       "catalog-latest",
		Title:    "Nouveautés du catalogue",
		Type:     "carousel",
		Subtitle: "Les dernières sorties publiées sur la plateforme",
		CtaLabel: "Voir tout",
		CtaHref:  "/catalog?sort=latest",
		Items:    latestItems,
	})

	sections = append(sections, buildAnimeGenreSections(pool, exclude)...)

	utils.Success(c, http.StatusOK, gin.H{"hero": hero, "sections": sections})
}

// Search returns published catalog items matching the query, shaped as the
// same ApiContentItem used by the rest of the public discover API so public
// pages (e.g. /search) can render results directly with the existing adapters.
func (h *DiscoverHandler) Search(c *gin.Context) {
	q := strings.TrimSpace(c.Query("q"))
	if q == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "24"))
	if limit < 1 || limit > 50 {
		limit = 24
	}

	items, total, err := h.deps.AnimeService.List(c.Request.Context(), interfaces.ListAnimeOpts{
		Page:   page,
		Limit:  limit,
		Query:  q,
		Status: "published",
		Sort:   "rating",
	})
	if err != nil {
		h.deps.Logger.Error("failed to search published catalog", "query", q, "error", err)
		utils.Error(c, err)
		return
	}

	content := make([]ApiContentItem, 0, len(items))
	for i := range items {
		content = append(content, animeModelToContentItem(&items[i]))
	}
	utils.Success(c, http.StatusOK, gin.H{"items": content, "total": total})
}

// ──────────────────────────────────────────────────────────────
// Detail — single published item by slug (public series/movie pages)
// ──────────────────────────────────────────────────────────────

type ApiEpisode struct {
	ID           string  `json:"id"`
	Number       int     `json:"number"`
	Title        string  `json:"title"`
	Synopsis     string  `json:"synopsis,omitempty"`
	ThumbnailUrl string  `json:"thumbnailUrl"`
	Duration     float64 `json:"duration"`
	IsSubbed     bool    `json:"isSubbed"`
	IsDubbed     bool    `json:"isDubbed"`
}

type ApiSeasonDetail struct {
	ID           string       `json:"id"`
	Number       int          `json:"number"`
	Title        string       `json:"title"`
	EpisodeCount int          `json:"episodeCount"`
	Episodes     []ApiEpisode `json:"episodes"`
}

type ApiContentDetailResponse struct {
	Item    ApiContentItem    `json:"item"`
	Seasons []ApiSeasonDetail `json:"seasons"`
}

// GetItemBySlug returns a single published catalog item — plus its seasons and
// episodes — by slug. It is the real data feed behind the public series/movie
// detail pages (previously served by mock data).
func (h *DiscoverHandler) GetItemBySlug(c *gin.Context) {
	slug := strings.TrimSpace(c.Param("slug"))
	if slug == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	item, err := h.publishedItemBySlug(c.Request.Context(), slug)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, animeModelToDetail(item))
}

// publishedItemBySlug resolves a published catalog item by its slug, falling
// back to the row ID for legacy URLs that carried the provider source id
// (e.g. /movies/848238) before slugs became human-readable.
func (h *DiscoverHandler) publishedItemBySlug(ctx context.Context, slug string) (*models.Anime, error) {
	item, err := h.deps.AnimeService.GetBySlug(ctx, slug)
	if appErr := utils.AsAppError(err); appErr.Status == http.StatusNotFound {
		if legacy, legacyErr := h.deps.AnimeService.GetByID(ctx, slug); legacyErr == nil {
			item = legacy
			err = nil
		}
	}
	if err != nil {
		return nil, err
	}
	// Public safety: only published content is exposed through the public API.
	if item.Status != "published" {
		return nil, utils.NewError(http.StatusNotFound, "ANIME_NOT_FOUND", "The requested anime was not found.", nil)
	}
	return item, nil
}

// plexClient resolves the configured Plex client (see plexClientFromDeps).
func (h *DiscoverHandler) plexClient(ctx context.Context) (*services.PlexClient, error) {
	return plexClientFromDeps(ctx, h.deps)
}

// plexClientFromDeps resolves the configured Plex client, mirroring the admin
// integration's resolution order: persisted source config, active media
// source, then environment config. Shared by the stream resolver and the
// admin per-item sync so both use the exact same client.
func plexClientFromDeps(ctx context.Context, deps Dependencies) (*services.PlexClient, error) {
	if deps.LibraryService != nil {
		if cfg, err := deps.LibraryService.GetBySourceType(ctx, "plex"); err == nil && cfg != nil && cfg.Enabled {
			if client, cerr := services.PlexClientFromSourceConfig(cfg); cerr == nil && client.Enabled() {
				return client, nil
			}
		}
	}
	if deps.MediaSourceService != nil {
		if plex := deps.MediaSourceService.Plex(); plex != nil {
			if client := plex.GetClient(); client != nil && client.Enabled() {
				return client, nil
			}
		}
	}
	cfg := deps.Config.MediaSource.Plex
	if cfg.URL != "" && cfg.Token != "" {
		return services.NewPlexClient(services.PlexConfig{
			URL:              cfg.URL,
			Token:            cfg.Token,
			ClientIdentifier: cfg.ClientIdentifier,
			Product:          cfg.Product,
			Version:          cfg.Version,
			Device:           cfg.Device,
			Timeout:          cfg.Timeout,
		}), nil
	}
	return nil, utils.NewError(http.StatusServiceUnavailable, "PLEX_DISABLED", "Plex integration is not enabled or not configured.", nil)
}

// jellyfinClient resolves the configured media-server (Jellyfin) client,
// mirroring plexClient's resolution order: active media source first, then
// environment config. Playback is delegated to this client whenever it is
// configured — Plex (and the other dashboard sources) only feed the catalog.
func (h *DiscoverHandler) jellyfinClient(ctx context.Context) (*services.JellyfinClient, error) {
	if h.deps.MediaSourceService != nil {
		if jf := h.deps.MediaSourceService.Jellyfin(); jf != nil && jf.Enabled() {
			return jf, nil
		}
	}
	cfg := h.deps.Config.MediaSource.Jellyfin
	if cfg.URL != "" && cfg.APIKey != "" && cfg.UserID != "" {
		return services.NewJellyfinClient(services.JellyfinConfig{
			URL:             cfg.URL,
			APIKey:          cfg.APIKey,
			UserID:          cfg.UserID,
			StrmDir:         cfg.StrmDir,
			StrmLibraryName: cfg.StrmLibraryName,
			StrmLibraryPath: cfg.StrmLibraryPath,
		}), nil
	}
	return nil, utils.NewError(http.StatusServiceUnavailable, "MEDIA_SERVER_DISABLED", "The media server (Jellyfin) is not configured.", nil)
}

// streamResolver holds the provider client that will back the /watch page
// playback. Jellyfin (media-server) is preferred when configured; Plex is
// kept as a fallback so legacy setups keep working.
type streamResolver struct {
	jf   *services.JellyfinClient
	plex *services.PlexClient
}

func (h *DiscoverHandler) streamClient(ctx context.Context) (*streamResolver, error) {
	var resolver streamResolver
	jfErr := error(nil)
	plexErr := error(nil)

	if jf, err := h.jellyfinClient(ctx); err == nil {
		resolver.jf = jf
	} else {
		jfErr = err
	}
	if client, err := h.plexClient(ctx); err == nil {
		resolver.plex = client
	} else {
		plexErr = err
	}

	if resolver.jf == nil && resolver.plex == nil {
		return nil, utils.NewError(http.StatusNotFound, "STREAM_UNAVAILABLE", "This title has no streamable source yet.", nil)
	}
	_ = jfErr
	_ = plexErr
	return &resolver, nil
}

// findLocalEpisode locates a catalog episode row by ID and returns its
// season number and row. Returns nil when the episode is not under the item.
func findLocalEpisode(item *models.Anime, episodeID string) (int, *models.Episode) {
	for i := range item.Seasons {
		season := &item.Seasons[i]
		for j := range season.Episodes {
			if season.Episodes[j].ID == episodeID {
				return season.Number, &season.Episodes[j]
			}
		}
	}
	return 0, nil
}

// resolveStreamKey maps a published item (+ optional episode) to the provider
// item key that backs the HLS stream. Tries Jellyfin first (streaming engine),
// then falls back to Plex (content provider) when the item isn't found.
func resolveStreamKey(ctx context.Context, r *streamResolver, item *models.Anime, episodeID string) (key string, isMovie bool, provider string, err error) {
	if r.jf != nil {
		key, isMovie, jfErr := resolveJellyfinStreamKey(ctx, r.jf, item, episodeID)
		if jfErr == nil {
			return key, isMovie, "jellyfin", nil
		}
		// Jellyfin didn't find it — fall back to Plex if available.
		if r.plex != nil {
			key, isMovie, plexErr := resolvePlexStreamKey(ctx, r.plex, item, episodeID)
			if plexErr == nil {
				return key, isMovie, "plex", nil
			}
			return "", false, "", jfErr
		}
		return "", false, "", jfErr
	}
	if r.plex != nil {
		key, isMovie, plexErr := resolvePlexStreamKey(ctx, r.plex, item, episodeID)
		if plexErr == nil {
			return key, isMovie, "plex", nil
		}
		return "", false, "", plexErr
	}
	return "", false, "", utils.NewError(http.StatusNotFound, "STREAM_UNAVAILABLE", "No stream provider is configured.", nil)
}

// resolveStreamKeyCached resolves the provider stream key for an item +
// episode, memoising the result in-process. The /stream metadata endpoint and
// the same-origin proxy both call this; without the cache, title-matching
// items would hit the media server's search API twice per episode switch.
func (h *DiscoverHandler) resolveStreamKeyCached(ctx context.Context, resolver *streamResolver, item *models.Anime, episodeID string) (string, bool, string, string, error) {
	cacheKey := item.Slug + "\x00" + episodeID
	if ent, ok := h.keys.get(cacheKey); ok {
		return ent.key, ent.isMovie, ent.provider, ent.mediaSourceId, ent.err
	}
	key, isMovie, provider, err := resolveStreamKey(ctx, resolver, item, episodeID)
	h.keys.set(cacheKey, key, provider, isMovie, err)
	return key, isMovie, provider, "", err
}

// resolveJellyfinStreamKey resolves the Jellyfin item ID for a movie or an
// episode of a series. Catalog rows imported from Jellyfin already carry
// their Jellyfin ID in metadata.sourceId; rows imported from content-only
// providers (Plex, AniList, …) are matched by title (+year) on the media
// server, then episodes are resolved via the Jellyfin API.
func resolveJellyfinStreamKey(ctx context.Context, jf *services.JellyfinClient, item *models.Anime, episodeID string) (string, bool, error) {
	if episodeID == "" {
		// Movie / standalone item.
		if item.Source == "jellyfin" {
			if sid := providerSourceIDFromMetadata(item); sid != "" {
				return sid, true, nil
			}
		}
		key, err := findJellyfinItem(ctx, jf, item.Title, item.ReleaseYear, "Movie")
		if err != nil {
			return "", false, err
		}
		return key, true, nil
	}

	seasonNumber, episode := findLocalEpisode(item, episodeID)
	if episode == nil {
		return "", false, utils.ErrEpisodeNotFound
	}
	seriesKey := ""
	if item.Source == "jellyfin" {
		seriesKey = providerSourceIDFromMetadata(item)
	}
	if seriesKey == "" {
		key, err := findJellyfinItem(ctx, jf, item.Title, item.ReleaseYear, "Series")
		if err != nil {
			return "", false, err
		}
		seriesKey = key
	}
	episodeKey, err := jf.ResolveEpisodeKey(ctx, seriesKey, seasonNumber, episode.Number)
	if err != nil {
		return "", false, utils.NewError(http.StatusNotFound, "STREAM_UNAVAILABLE", err.Error(), nil)
	}
	return episodeKey, false, nil
}

// findJellyfinItem locates a Jellyfin item matching a catalog title on the
// media server. It prefers an exact case-insensitive title match (year as a
// tie-breaker) of the wanted type, then falls back to any item of that type.
func findJellyfinItem(ctx context.Context, jf *services.JellyfinClient, title string, year int, wantType string) (string, error) {
	if title == "" {
		return "", utils.NewError(http.StatusNotFound, "STREAM_UNAVAILABLE", "This title has no streamable source yet.", nil)
	}
	items, err := jf.SearchItems(ctx, title, 10)
	if err != nil {
		return "", utils.NewError(http.StatusBadGateway, "STREAM_UNAVAILABLE", "Could not reach the media server: "+err.Error(), nil)
	}
	needle := strings.ToLower(strings.TrimSpace(title))
	var fallback string
	for _, it := range items {
		if !strings.EqualFold(discoverStr(it, "type"), wantType) {
			continue
		}
		id := discoverStr(it, "id")
		if id == "" {
			continue
		}
		if strings.EqualFold(strings.TrimSpace(discoverStr(it, "name")), needle) {
			if year > 0 && discoverInt(it, "year") == year {
				return id, nil
			}
			if fallback == "" {
				fallback = id
			}
		}
	}
	if fallback != "" {
		return fallback, nil
	}
	for _, it := range items {
		if strings.EqualFold(discoverStr(it, "type"), wantType) {
			if id := discoverStr(it, "id"); id != "" {
				return id, nil
			}
		}
	}
	return "", utils.NewError(http.StatusNotFound, "STREAM_UNAVAILABLE", fmt.Sprintf("No %s matching %q found on the media server.", wantType, title), nil)
}

// resolvePlexStreamKey is the legacy Plex stream-key resolution, kept intact
// as the fallback path when no media-server is configured.
func resolvePlexStreamKey(ctx context.Context, client *services.PlexClient, item *models.Anime, episodeID string) (string, bool, error) {
	if client == nil || !client.Enabled() {
		return "", false, utils.NewError(http.StatusServiceUnavailable, "STREAM_UNAVAILABLE", "No stream provider is configured.", nil)
	}
	if item.Source != "plex" {
		return "", false, utils.NewError(http.StatusNotFound, "STREAM_UNAVAILABLE", "This title has no streamable source yet.", nil)
	}
	if episodeID == "" {
		key := providerSourceIDFromMetadata(item)
		if key == "" {
			return "", false, utils.NewError(http.StatusNotFound, "STREAM_UNAVAILABLE", "This title has no streamable source yet.", nil)
		}
		return key, true, nil
	}
	seasonNumber, episode := findLocalEpisode(item, episodeID)
	if episode == nil {
		return "", false, utils.ErrEpisodeNotFound
	}
	showKey := providerSourceIDFromMetadata(item)
	if showKey == "" {
		return "", false, utils.NewError(http.StatusNotFound, "STREAM_UNAVAILABLE", "This title has no streamable source yet.", nil)
	}
	key, err := services.ResolvePlexEpisodeKey(ctx, client, showKey, seasonNumber, episode.Number)
	if err != nil {
		return "", false, err
	}
	return key, false, nil
}

// isTransientBridgeError reports whether a Plex→Jellyfin bridge failure is
// worth retrying instead of poisoning the stream-key cache. Client-side
// cancellations (the user navigated away / the 90s budget expired) and
// transport-level failures (DNS lookup errors — e.g. Docker's resolver
// returning SERVFAIL for *.plex.direct — connection refused, connect
// timeouts, anything surfaced as a *net.OpError) are transient: the bridge
// is idempotent and typically succeeds on the next request once the network
// recovers. Anything else (a Jellyfin API 4xx/5xx, a .strm item that never
// resolves even after the recovery re-scan) is definitive and must latch so
// we don't re-run a slow failing bridge on every request.
func isTransientBridgeError(err error) bool {
	if err == nil {
		return false
	}
	if errors.Is(err, context.Canceled) || errors.Is(err, context.DeadlineExceeded) {
		return true
	}
	var dnsErr *net.DNSError
	if errors.As(err, &dnsErr) {
		return true
	}
	var opErr *net.OpError
	if errors.As(err, &opErr) {
		return true
	}
	return false
}

// isBridgeAuthFailure reports whether a Plex→Jellyfin bridge failure is an
// authentication / configuration problem on the Jellyfin side (HTTP 401/403,
// "Invalid token", "not configured", …). Jellyfin answers 401 to every
// authenticated call when the configured API key does not exist — typically a
// stale MEDIA_SOURCE_JELLYFIN_API_KEY / _USER_ID after the media-server was
// reinstalled (the key lives in the Jellyfin dashboard, it can never be set
// from env alone). In that state the legacy Plex HLS fallback is a dead end
// on servers that don't serve HLS transcodes, so callers surface a clear
// error instead — and must NOT latch the failure: the bridge fails fast and
// self-heals as soon as the operator fixes the key.
func isBridgeAuthFailure(err error) bool {
	if err == nil {
		return false
	}
	s := strings.ToLower(err.Error())
	for _, marker := range []string{
		"401", "403",
		"invalid token", "not authenticated", "unauthorized",
		"not configured", "authentication",
	} {
		if strings.Contains(s, marker) {
			return true
		}
	}
	return false
}

// mediaServerAuthError is the error surfaced when the Plex→Jellyfin bridge is
// blocked by the media-server's authentication. The bridge cannot work until
// the operator fixes the Jellyfin config, and the legacy Plex HLS fallback is
// a dead end — so we return a distinct, user-facing error (the watch page
// renders an actionable message for STREAM_MEDIA_SERVER_UNAVAILABLE) instead
// of letting the player retry a manifest that will always answer 400.
func mediaServerAuthError() error {
	return utils.NewError(http.StatusServiceUnavailable, "STREAM_MEDIA_SERVER_UNAVAILABLE",
		"The media server rejected the stream bridge: authentication failed. Check the Jellyfin API key and user id (MEDIA_SOURCE_JELLYFIN_API_KEY / MEDIA_SOURCE_JELLYFIN_USER_ID).", nil)
}

// bridgeCall captures the result of a single in-flight Plex→Jellyfin bridge
// so concurrent callers can share it.
type bridgeCall struct {
	done          chan struct{}
	jfItemID      string
	mediaSourceID string
	err           error
}

// bridgeStreamKey serializes the Plex→Jellyfin bridge per stream key so
// concurrent callers (the /stream pre-warm racing a fast client's first
// proxy fetch, or two browser tabs on the same title) share ONE bridge
// result. Two parallel bridges on the same .strm file can both enter the
// ensureStrmItemRemote recovery (delete + rewrite + full library scan),
// re-creating the item mid-resolution and leaving one caller with a dead
// item ID — the master playlist request then answers HTTP 400 "The specified
// media source could not be found" for the whole cache TTL.
//
// The bridge runs on a context detached from the first caller (bounded to
// 90s) so the first caller navigating away mid-bridge cannot cancel the
// shared work the waiters depend on.
func (h *DiscoverHandler) bridgeStreamKey(ctx context.Context, cacheKey string, plexClient *services.PlexClient, jf *services.JellyfinClient, item *models.Anime, plexKey string) (string, string, error) {
	h.bridgeMu.Lock()
	if call, ok := h.bridgeInflight[cacheKey]; ok {
		h.bridgeMu.Unlock()
		select {
		case <-call.done:
			return call.jfItemID, call.mediaSourceID, call.err
		case <-ctx.Done():
			return "", "", ctx.Err()
		}
	}
	call := &bridgeCall{done: make(chan struct{})}
	if h.bridgeInflight == nil {
		h.bridgeInflight = make(map[string]*bridgeCall)
	}
	h.bridgeInflight[cacheKey] = call
	h.bridgeMu.Unlock()

	bctx, cancel := context.WithTimeout(context.WithoutCancel(ctx), 90*time.Second)
	call.jfItemID, call.mediaSourceID, call.err = bridgePlexToJellyfin(bctx, plexClient, jf, item, plexKey)
	cancel()
	close(call.done)

	h.bridgeMu.Lock()
	if h.bridgeInflight[cacheKey] == call {
		delete(h.bridgeInflight, cacheKey)
	}
	h.bridgeMu.Unlock()
	return call.jfItemID, call.mediaSourceID, call.err
}

// bridgePlexToJellyfin takes a Plex stream key and sets up Jellyfin as the
// transcoding engine: it fetches the direct file URL from Plex and hands it
// to Jellyfin's library scanner via a .strm file (see
// JellyfinClient.BridgeRemoteMedia), so Jellyfin transcodes the remote media
// into HLS.
//
// Returns the Jellyfin item ID and its real MediaSourceId to pass to
// HLSManifestURLWithSource. The media source id is resolved from the item
// itself: Jellyfin gives .strm items a distinct MediaSourceInfo.Id (NOT the
// item id), so assuming equality makes the master playlist request answer
// HTTP 400 "The specified media source could not be found". When the id
// cannot be resolved, an empty string is returned so callers fall back to
// an unpinned master (a single-source .strm item plays without it).
func bridgePlexToJellyfin(ctx context.Context, plexClient *services.PlexClient, jf *services.JellyfinClient, item *models.Anime, plexKey string) (jfItemID string, mediaSourceID string, err error) {
	directURL, _, derr := plexClient.GetDirectFileURL(ctx, plexKey)
	if derr != nil {
		return "", "", fmt.Errorf("could not get Plex direct URL: %w", derr)
	}

	jfItemID, merr := jf.BridgeRemoteMedia(ctx, item.Title, directURL)
	if merr != nil {
		return "", "", fmt.Errorf("could not bridge Plex media to Jellyfin: %w", merr)
	}
	mediaSourceID, serr := jf.ResolveMediaSourceID(ctx, jfItemID)
	if serr != nil {
		mediaSourceID = ""
	}
	return jfItemID, mediaSourceID, nil
}

func discoverStr(m map[string]interface{}, key string) string {
	if v, ok := m[key].(string); ok {
		return v
	}
	return ""
}

func discoverInt(m map[string]interface{}, key string) int {
	switch v := m[key].(type) {
	case float64:
		return int(v)
	case int:
		return v
	case string:
		i, _ := strconv.Atoi(v)
		return i
	}
	return 0
}

// providerSourceIDFromMetadata reads the provider item key persisted on a
// catalog row (metadata.sourceId). For series it is the show key; for movies
// the item key. Works for any provider (plex, jellyfin, …) — the same JSON
// shape is written by every library sync.
func providerSourceIDFromMetadata(a *models.Anime) string {
	if len(a.Metadata) == 0 {
		return ""
	}
	var meta map[string]any
	if err := json.Unmarshal(a.Metadata, &meta); err != nil {
		return ""
	}
	if id, ok := meta["sourceId"].(string); ok {
		return id
	}
	return ""
}

// jellyfinMasterURL returns the HLS master URL backing a Jellyfin item,
// preferring a PlaybackInfo-negotiated transcode URL. Hand-building the
// master (HLSManifestURLWithSource) lets Jellyfin launch ffmpeg with DEFAULT
// encoders for bridged remote (.strm) items whose scan-time probe failed —
// the output AAC then has no timestamps/channel config and Chromium's MSE
// rejects every append (bufferAppendingError). PlaybackInfo forces Jellyfin
// to probe the source live and emit a proper -map/-c transcode command
// (verified: h264 High + aac LC 2ch). The negotiated URL is cached per stream
// key so the /stream endpoint and the proxy pay the PlaybackInfo cost once.
func (h *DiscoverHandler) jellyfinMasterURL(ctx context.Context, cacheKey string, jf *services.JellyfinClient, key, msID string) string {
	if ent, ok := h.keys.get(cacheKey); ok && ent.masterURL != "" {
		return ent.masterURL
	}
	if jf != nil {
		nctx, cancel := context.WithTimeout(ctx, 20*time.Second)
		negotiated := jf.TranscodeMasterURL(nctx, key, msID)
		cancel()
		if negotiated != "" {
			h.keys.setMasterURL(cacheKey, negotiated)
			return negotiated
		}
	}
	if msID != "" {
		return jf.HLSManifestURLWithSource(key, msID)
	}
	return jf.HLSManifestURL(key)
}

// GetStreamURL returns a playable stream URL for a published item — a movie
// streams directly from the item's provider key, a series resolves the
// requested episode against the provider. Stream resolution is delegated to
// the media-server (Jellyfin) container whenever it is configured; Plex (and
// the other dashboard sources) only feed the catalog, they never back
// playback. The legacy Plex path is kept as a fallback. Titles without a
// provider source get a STREAM_UNAVAILABLE error so the player can show a
// friendly state.
func (h *DiscoverHandler) GetStreamURL(c *gin.Context) {
	ctx := c.Request.Context()
	slug := strings.TrimSpace(c.Param("slug"))
	episodeID := strings.TrimSpace(c.Query("episodeId"))
	if slug == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	item, err := h.publishedItemBySlug(ctx, slug)
	if err != nil {
		utils.Error(c, err)
		return
	}

	resolver, err := h.streamClient(ctx)
	if err != nil {
		utils.Error(c, err)
		return
	}
	key, isMovie, provider, cachedMsID, err := h.resolveStreamKeyCached(ctx, resolver, item, episodeID)
	if err != nil {
		utils.Error(c, err)
		return
	}

	var streamURL string
	if provider == "jellyfin" && resolver.jf != nil {
		streamURL = h.jellyfinMasterURL(ctx, item.Slug+"\x00"+episodeID, resolver.jf, key, cachedMsID)
	} else if provider == "plex" && resolver.jf != nil && resolver.plex != nil {
		cacheKey := item.Slug + "\x00" + episodeID
		cached, _ := h.keys.get(cacheKey)
		if cachedMsID != "" {
			// Bridge already succeeded — key is the Jellyfin item ID.
			streamURL = h.jellyfinMasterURL(ctx, cacheKey, resolver.jf, key, cachedMsID)
		} else if cached.bridgeFailed {
			// Bridge previously failed — fall straight back to Plex HLS.
			streamURL, err = services.BuildPlexStreamURL(ctx, resolver.plex, key, "native")
			if err != nil {
				utils.Error(c, err)
				return
			}
		} else {
			jfItemID, msID, berr := h.bridgeStreamKey(ctx, cacheKey, resolver.plex, resolver.jf, item, key)
			if berr != nil {
				// Jellyfin rejects the configured API key / user (401/403):
				// the whole bridge is dead and the legacy Plex HLS fallback
				// answers 400 on servers that don't serve HLS transcodes.
				// Surface the real cause and DON'T latch — the bridge fails
				// fast and self-heals once the config is fixed.
				if isBridgeAuthFailure(berr) {
					h.deps.Logger.Warn("plex→jellyfin bridge blocked by media-server authentication", "error", berr)
					utils.Error(c, mediaServerAuthError())
					return
				}
				h.deps.Logger.Warn("plex→jellyfin bridge failed, falling back to Plex HLS", "error", berr)
				// A canceled request (client navigated away / timed out) and
				// TRANSIENT transport errors (a DNS hiccup, connect timeout —
				// Docker's resolver can SERVFAIL on *.plex.direct) must NOT
				// latch the failure: the bridge may still have completed
				// server-side or succeed on the very next request. Poisoning
				// on those forced every subsequent play down the legacy Plex
				// HLS path for the whole TTL — and that endpoint answers HTTP
				// 400 to every request on this Plex server. Only definitive
				// failures (Jellyfin API 4xx/5xx, item never resolves) poison.
				if !isTransientBridgeError(berr) {
					h.keys.markBridgeFailed(cacheKey)
				}
				streamURL, err = services.BuildPlexStreamURL(ctx, resolver.plex, key, "native")
				if err != nil {
					utils.Error(c, err)
					return
				}
			} else {
				h.keys.set(cacheKey, jfItemID, "jellyfin", isMovie, nil)
				h.keys.setMediaSourceId(cacheKey, msID)
				streamURL = h.jellyfinMasterURL(ctx, cacheKey, resolver.jf, jfItemID, msID)
			}
		}
	} else {
		streamURL, err = services.BuildPlexStreamURL(ctx, resolver.plex, key, "native")
		if err != nil {
			utils.Error(c, err)
			return
		}
	}

	// Start the media-server transcode NOW (fire-and-forget) so the browser's
	// first variant request hits a warm session. The master playlist is served
	// instantly but the variant is what launches ffmpeg — on a cold session it
	// must probe the remote source first, adding several seconds of asset-only
	// (poster) time to the first play. Warming it here means the player starts
	// the moment hls.js pulls the variant, instead of after the ffmpeg startup.
	if resolver.jf != nil && strings.Contains(streamURL, "/master.m3u8") {
		go func() {
			wctx, cancel := context.WithTimeout(context.Background(), 45*time.Second)
			defer cancel()
			resolver.jf.PreWarmTranscode(wctx, streamURL)
		}()
	}
	utils.Success(c, http.StatusOK, gin.H{
		"streamUrl": streamURL,
		"title":     item.Title,
		"isMovie":   isMovie,
	})
}

// ProxyStream serves the playable HLS manifest (and every segment / variant
// it references) as a *same-origin* asset. Neither Jellyfin (media-server)
// nor Plex sends CORS headers reliably, so handing their URLs directly to
// hls.js yields NETWORK_ERROR on every browser. This proxy resolves the slug
// + optional episodeId server-side, fetches the upstream URL with the auth
// credential attached as a HEADER (X-Emby-Token for the media-server,
// X-Plex-Token for the legacy Plex fallback), and writes the response back
// to the browser untouched.
//
// Two routes feed into this handler:
//
//   - GET /api/v1/discover/item/:slug/stream/proxy/manifest
//                                       -> master playlist (rewritten)
//   - GET /api/v1/discover/item/:slug/stream/proxy/segment/*origin
//                                       -> segment / variant proxied upstream
//
// We don't rely on relative URL resolution against the manifest URL because
// upstream variants carry ABSOLUTE URLs (browser would CORS-fail) and
// segments resolve to directories we don't control. Instead the manifest
// rewriter turns every URL line in the playlist into an absolute URL
// pointing at our own `/segment/<origin>` endpoint with the upstream path
// URL-encoded in the trailing segment. hls.js then issues fully-absolute
// same-origin requests that always land back in this same handler.
func (h *DiscoverHandler) ProxyStream(c *gin.Context) {
	ctx := c.Request.Context()
	slug := strings.TrimSpace(c.Param("slug"))
	episodeID := strings.TrimSpace(c.Query("episodeId"))
	// gin returns the wildcard without a leading slash for paths like
	// /proxy/segment/foo.ts and as "/" for the bare /proxy route. Normalise.
	subpath := strings.TrimLeft(strings.TrimPrefix(c.Param("subpath"), "/"), "/")

	h.deps.Logger.Info("stream proxy request", "slug", slug, "subpath", subpath, "full_path", c.Request.URL.Path, "query", c.Request.URL.RawQuery)

	if slug == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}

	item, err := h.publishedItemBySlug(ctx, slug)
	if err != nil {
		utils.Error(c, err)
		return
	}

	resolver, err := h.streamClient(ctx)
	if err != nil {
		utils.Error(c, err)
		return
	}
	key, _, provider, cachedMsID, err := h.resolveStreamKeyCached(ctx, resolver, item, episodeID)
	if err != nil {
		utils.Error(c, err)
		return
	}

	// `subpath` is either:
	//   - ""          -> root /stream/proxy route, serve the master playlist
	//   - "manifest"  -> explicit /stream/proxy/manifest route, ditto
	//   - "<origin>"  -> /stream/proxy/segment/* route: serve that sub-resource
	//                    (the "/segment/" prefix is consumed by the route pattern)
	//
	// Anything else ("manifest/<something>", etc.) we treat as a
	// malformed request and 404.
	serveManifest := subpath == "" || subpath == "manifest"
	var segmentRelativeRef string
	if !serveManifest {
		// The route /segment/*subpath captures everything after /segment/ as
		// subpath. subpath IS the upstream reference (e.g. `/Videos/…/0.ts`).
		// decodeSegmentRef normalises it and re-attaches any query a
		// path-normalising proxy (Next.js dev rewrites) split out of the
		// path — without that re-attachment the upstream variant/segment
		// request would start a FRESH Jellyfin transcode session with default
		// codecs, which hls.js sees as levelLoadTimeOut + bufferAppendingError.
		segmentRelativeRef = decodeSegmentRef(subpath, c.Request.URL.RawQuery)
		// Session-pin: Jellyfin's media playlists are not guaranteed to echo
		// the master's query (DeviceId / MediaSourceId / forced codecs) on
		// every URL line. A variant/segment request that misses them creates
		// its OWN session — for a bridged HEVC source that is a REMUX, and
		// the browser MSE can't decode the resulting HEVC segments
		// (bufferAppendingError). Re-inject the master's params so playback
		// stays on the one h264/aac transcode session.
		if ent, ok := h.keys.get(item.Slug + "\x00" + episodeID); ok {
			segmentRelativeRef = mergeSessionParams(segmentRelativeRef, ent.sessionQuery)
		}
		h.deps.Logger.Info("stream proxy segment", "raw", subpath, "decoded", segmentRelativeRef)
	}

	scheme := "http"
	if c.Request.TLS != nil || strings.EqualFold(c.GetHeader("X-Forwarded-Proto"), "https") {
		scheme = "https"
	}
	proxyBaseURL := scheme + "://" + c.Request.Host

	var targetURL string
	bridged := false
	if provider == "jellyfin" && resolver.jf != nil {
		// Jellyfin owns this stream.
		if serveManifest {
			targetURL = h.jellyfinMasterURL(ctx, item.Slug+"\x00"+episodeID, resolver.jf, key, cachedMsID)
		} else {
			targetURL, err = resolver.jf.BuildSegmentURL(key, segmentRelativeRef)
			if err != nil {
				utils.Error(c, utils.NewError(http.StatusBadGateway, "STREAM_PROXY_FAILED", "Could not build segment URL: "+err.Error(), nil))
				return
			}
		}
	} else if provider == "plex" && resolver.jf != nil && resolver.plex != nil {
		// Plex provides the file, bridge through Jellyfin for HLS transcoding.
		cacheKey := item.Slug + "\x00" + episodeID
		cached, _ := h.keys.get(cacheKey)
		if cachedMsID != "" {
			// Already bridged from GetStreamURL — key is already the JF item ID.
			bridged = true
			if serveManifest {
				targetURL = h.jellyfinMasterURL(ctx, cacheKey, resolver.jf, key, cachedMsID)
			} else {
				targetURL, err = resolver.jf.BuildSegmentURL(key, segmentRelativeRef)
				if err != nil {
					utils.Error(c, utils.NewError(http.StatusBadGateway, "STREAM_PROXY_FAILED", "Could not build segment URL: "+err.Error(), nil))
					return
				}
			}
		} else if cached.bridgeFailed {
			// Bridge previously failed — use Plex HLS directly.
			manifestURL, merr := services.BuildPlexStreamURL(ctx, resolver.plex, key, "native")
			if merr != nil {
				utils.Error(c, merr)
				return
			}
			if serveManifest {
				targetURL = manifestURL
			} else {
				targetURL, err = buildPlexSegmentURL(manifestURL, segmentRelativeRef)
				if err != nil {
					utils.Error(c, utils.NewError(http.StatusBadGateway, "STREAM_PROXY_FAILED", "Could not build segment URL: "+err.Error(), nil))
					return
				}
			}
		} else {
			jfItemID, msID, berr := h.bridgeStreamKey(ctx, cacheKey, resolver.plex, resolver.jf, item, key)
			if berr != nil {
				// Same as GetStreamURL: an authentication failure (401/403)
				// means the bridge can never succeed and the Plex HLS fallback
				// would only answer 400 — return the clear error instead.
				if isBridgeAuthFailure(berr) {
					h.deps.Logger.Warn("plex→jellyfin bridge blocked by media-server authentication", "error", berr)
					utils.Error(c, mediaServerAuthError())
					return
				}
				h.deps.Logger.Warn("plex→jellyfin bridge failed, falling back to Plex proxy", "error", berr)
				// See GetStreamURL: transient transport failures (DNS hiccups
				// on *.plex.direct, connect timeouts) and client cancellations
				// must not poison the cache — the bridge is retried on the next
				// request, where it usually succeeds. Only definitive failures
				// latch so we don't re-run a slow broken bridge every time.
				if !isTransientBridgeError(berr) {
					h.keys.markBridgeFailed(cacheKey)
				}
				manifestURL, merr := services.BuildPlexStreamURL(ctx, resolver.plex, key, "native")
				if merr != nil {
					utils.Error(c, merr)
					return
				}
				if serveManifest {
					targetURL = manifestURL
				} else {
					targetURL, err = buildPlexSegmentURL(manifestURL, segmentRelativeRef)
					if err != nil {
						utils.Error(c, utils.NewError(http.StatusBadGateway, "STREAM_PROXY_FAILED", "Could not build segment URL: "+err.Error(), nil))
						return
					}
				}
			} else {
				h.keys.set(cacheKey, jfItemID, "jellyfin", true, nil)
				h.keys.setMediaSourceId(cacheKey, msID)
				bridged = true
				if serveManifest {
					targetURL = h.jellyfinMasterURL(ctx, cacheKey, resolver.jf, jfItemID, msID)
				} else {
					targetURL, err = resolver.jf.BuildSegmentURL(jfItemID, segmentRelativeRef)
					if err != nil {
						utils.Error(c, utils.NewError(http.StatusBadGateway, "STREAM_PROXY_FAILED", "Could not build segment URL: "+err.Error(), nil))
						return
					}
				}
			}
		}
	} else if resolver.plex != nil {
		// Plex owns this stream (no Jellyfin available).
		manifestURL, merr := services.BuildPlexStreamURL(ctx, resolver.plex, key, "native")
		if merr != nil {
			utils.Error(c, merr)
			return
		}
		if serveManifest {
			targetURL = manifestURL
		} else {
			targetURL, err = buildPlexSegmentURL(manifestURL, segmentRelativeRef)
			if err != nil {
				utils.Error(c, utils.NewError(http.StatusBadGateway, "STREAM_PROXY_FAILED", "Could not build segment URL: "+err.Error(), nil))
				return
			}
		}
	} else {
		utils.Error(c, utils.NewError(http.StatusServiceUnavailable, "STREAM_UNAVAILABLE", "No provider available for this stream.", nil))
		return
	}

	// Track whether the upstream is actually Jellyfin — true when the stream
	// was natively Jellyfin or when we bridged Plex→Jellyfin.
	targetIsJellyfin := resolver.jf != nil && (provider == "jellyfin" || bridged)
	// Remember the master's session query so later variant/segment requests
	// can be pinned to the same transcode session + forced codecs (see
	// mergeSessionParams).
	if serveManifest && targetIsJellyfin {
		if mu, merr := url.Parse(targetURL); merr == nil {
			h.keys.setSessionQuery(item.Slug+"\x00"+episodeID, mu.Query())
		}
	}

	var resp *http.Response
	if targetIsJellyfin {
		h.deps.Logger.Info("stream proxy requesting jellyfin", "url", targetURL)
		resp, err = resolver.jf.DoWithAuth(ctx, targetURL)
	} else {
		// Strip the token from the query string — it travels in the
		// header for upstream requests. Keeping it in both places causes
		// some Plex servers to return 400.
		cleanURL := targetURL
		if pu, puerr := url.Parse(targetURL); puerr == nil {
			pq := pu.Query()
			pq.Del("X-Plex-Token")
			// Ensure a session ID is present — Plex transcode
			// endpoints return 400 without one.
			if pq.Get("session") == "" {
				pq.Set("session", "kamisama-"+key)
			}
			pu.RawQuery = pq.Encode()
			cleanURL = pu.String()
		}
		req, rerr := http.NewRequestWithContext(ctx, http.MethodGet, cleanURL, nil)
		if rerr != nil {
			utils.Error(c, utils.NewError(http.StatusBadGateway, "STREAM_PROXY_FAILED", "Could not build upstream request: "+rerr.Error(), nil))
			return
		}
		req.Header.Set("Accept", "*/*")
		req.Header.Set("X-Plex-Token", resolver.plex.Token())
		for k, v := range resolver.plex.PlexIdentity() {
			if v != "" {
				req.Header.Set(k, v)
			}
		}
		req.Header.Set("X-Plex-Platform", "Go")
		h.deps.Logger.Info("stream proxy requesting plex", "url", cleanURL, "token_len", len(resolver.plex.Token()))
		httpClient := &http.Client{Timeout: 90 * time.Second}
		resp, err = httpClient.Do(req)
	}
	if err != nil {
		utils.Error(c, utils.NewError(http.StatusBadGateway, "STREAM_UNAVAILABLE", "Could not reach the media stream endpoint: "+err.Error(), nil))
		return
	}
	defer resp.Body.Close()

	// Whether the upstream response is an HLS playlist that must be rewritten
	// before being handed to the browser. The MASTER is always one; so is any
	// VARIANT / media playlist (same content-type) — its segment URL lines
	// must become explicit same-origin /segment/ references too, otherwise
	// hls.js resolves them against the proxy URL and either 404s, trips CORS
	// or receives non-segment data, which surfaces as bufferAppendingError.
	servePlaylist := serveManifest || isPlaylistContentType(resp.Header.Get("Content-Type"))
	// Forward the cacheability / content headers as the upstream sent them.
// Skip Content-Length when rewriting a playlist since body size changes.
	copyHeaders := []string{"Content-Type", "Cache-Control", "Last-Modified", "ETag"}
	if !servePlaylist {
		copyHeaders = append(copyHeaders, "Content-Length")
	}
	for _, k := range copyHeaders {
		if v := resp.Header.Get(k); v != "" {
			c.Header(k, v)
		}
	}

	// Every rewritten playlist URL is CONSTANT (…/stream/proxy/manifest or
	// …/segment/<encoded-origin>), but the transcode session it points at
	// changes on every resolution. If the browser heuristically caches one
	// (or the Jellyfin upstream allows it), the next play fetches a STALE
	// variant/segment list whose session is dead — the player stalls forever
	// on the item poster. Force no-store so hls.js always pulls fresh
	// playlists bound to a live session.
	if servePlaylist {
		c.Header("Cache-Control", "no-store")
	}

	// Write the upstream status BEFORE piping the body. Letting Gin default
	// to 200 then asking it to override after `io.CopyN` (which flushes the
	// response) emits the famous GIN warning "Headers were already written.
	// Wanted to override status code 200 with N" and leaves the wire status
	// mismatched from the body — the browser then treats a 400-upstream page
	// like a successful HLS manifest.
	c.Writer.WriteHeader(resp.StatusCode)

	// Always log upstream's status, even on 2xx. Catches conflict cases
	// where transit / relay servers reject media endpoints with 400/500
	// while metadata/library stay reachable — without this trace, the
	// operator can't tell "code bug" from "media server unreachable".
	h.deps.Logger.Info(
		"stream proxy upstream response",
		"provider", provider,
		"slug", slug,
		"serve_manifest", serveManifest,
		"upstream_status", resp.StatusCode,
		"upstream_content_type", resp.Header.Get("Content-Type"),
	)

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		// The upstream refused the session we pinned — most often a stale
		// MediaSourceId / negotiated master (a concurrent bridge re-created
		// the .strm item, or the transcode session died). Drop the cached
		// resolution so the player's next manifest retry re-resolves (and
		// re-bridges if needed) instead of replaying a dead session for the
		// whole cache TTL — that is what makes the manifest 400 forever.
		h.keys.del(item.Slug + "\x00" + episodeID)
		// Surface the upstream's error verbatim so the user understands it's
		// a source issue (server unreachable, transcode refused) and not
		// something the proxy introduced.
		body, _ := io.ReadAll(io.LimitReader(resp.Body, 8<<10))
		h.deps.Logger.Warn(
			"stream proxy upstream non-2xx",
			"provider", provider,
			"slug", slug,
			"status", resp.StatusCode,
			"body", strings.TrimSpace(string(body)),
		)
		_, _ = c.Writer.Write(body)
		return
	}

	if servePlaylist && resp.StatusCode >= 200 && resp.StatusCode < 300 {
		// Read & rewrite the playlist so every URL line points at our proxy's
		// segment endpoint instead of the upstream's CORS-blocked URL. This
		// covers the master AND every variant/media playlist — leaving a
		// media playlist untouched makes hls.js resolve its segment lines
		// against the proxy URL, which 404s, trips CORS or yields
		// non-segment data (bufferAppendingError).
		body, err := io.ReadAll(io.LimitReader(resp.Body, 2<<20))
		if err == nil {
			rewritten := rewriteStreamManifest(string(body), proxyBaseURL, slug, episodeID, targetIsJellyfin)
			c.Header("Content-Type", "application/vnd.apple.mpegurl")
			_, _ = c.Writer.WriteString(rewritten)
			return
		}
		// Fall through to streaming if buffer fails. Status is already
		// written above.
	}

	_, _ = io.Copy(c.Writer, resp.Body)
}

// buildPlexSegmentURL pivots the upstream master playlist URL into the URL
// of a specific sub-resource (variant playlist or .ts segment). The master
// playlist address Plex returns for a transcode session is:
//
//	{base}/video/:/transcode/universal/start?path=…&X-Plex-Token=…
//
// The relative references inside that playlist resolve to files served
// next to `start`, e.g. `{base}/video/:/transcode/universal/0.m3u8` or
// `{base}/video/:/transcode/universal/segment-0.ts`. Absolute references
// in the master are usually the full upstream URL with the `start` segment
// replaced by the variant filename. Both shapes are accepted via the
// `origin` parameter: an absolute path (`/video/…`) is appended after the
// upstream host, a relative name (`0.m3u8`) is appended under the transcode
// prefix (replacing `/start`).
func buildPlexSegmentURL(manifestURL, origin string) (string, error) {
	u, err := url.Parse(manifestURL)
	if err != nil {
		return "", err
	}
	// Plex appends the transcode session (and often X-Plex-Token) to EVERY
	// URL line in its playlists (e.g. `/video/:/transcode/universal/0.m3u8?
	// session=…&X-Plex-Platform=…`). That query string must ride as real
	// query params: baking it into the Path field makes url.URL percent-
	// escape the `?` into `%3F`, so the upstream Plex receives a mangled URL
	// and answers 500 — which the player sees as the very first
	// levelLoadError after the (rewritten) master parsed fine.
	ref := origin
	if !strings.HasPrefix(ref, "/") {
		// Bare filename — append under the transcode universal prefix,
		// replacing the `start` leaf that kick-started the session.
		ref = strings.TrimSuffix(u.Path, "/start") + "/" + ref
	}
	refPath, refQuery, hasQuery := strings.Cut(ref, "?")
	u.Path = refPath
	q := url.Values{}
	if hasQuery {
		// The reference carries its own session params — those are what Plex
		// needs to bind this sub-resource to the on-going transcode session.
		if parsed, perr := url.ParseQuery(refQuery); perr == nil {
			q = parsed
		}
	} else {
		// No query on the reference — inherit the manifest's transcode
		// params (session, path, …) instead so the session still binds.
		q = u.Query()
	}
	// The token travels in the header, not the URL — never forward an
	// X-Plex-Token that the manifest rewriter kept inside the origin.
	q.Del("X-Plex-Token")
	u.RawQuery = q.Encode()
	return u.String(), nil
}

// rewriteStreamManifest converts every URL reference in an HLS manifest into
// an absolute URL pointing at our same-origin proxy. Two kinds of references
// are rewritten:
//
//  1. Bare URL lines (variant playlists, media segments, init segments) —
//     whether absolute (`http://media-server:8096/...`), root-relative
//     (`/Videos/...`) or bare (`0.ts`).
//  2. `URI="..."` attributes inside HLS tag lines — `#EXT-X-MEDIA` audio /
//     subtitle groups, `#EXT-X-MAP` init segments, `#EXT-X-KEY` keys and
//     `#EXT-X-I-FRAME-STREAM-INF` thumbnails. Jellyfin emits audio-group URIs
//     as root-relative `/Videos/...` references; leaving them untouched makes
//     the browser fetch them straight from the media server and trip CORS —
//     exactly the failure this proxy exists to prevent (silent no-audio or a
//     hard NETWORK_ERROR).
//
// Non-stream lines and non-stream tag attributes (data URIs, etc.) are copied
// verbatim. The rewritten reference carries the upstream path URL-encoded in a
// single trailing segment (`/segment/<origin>`); the proxy receives it already
// percent-decoded (net/http decodes URL.Path before gin matches), so no
// server-side unescape is needed and nothing can be double-decoded.
//
// When the master was requested for a specific episode, `episodeId` is
// appended to every rewritten URL: segment / variant requests would otherwise
// reach the proxy without it and re-resolve the stream key as a MOVIE (the
// episode lookup falls back to the series title), breaking series playback.
//
// `declareCodecs` controls whether variants missing a CODECS attribute get the
// h264 High + AAC declaration (see streamCodecsAttr). Only Jellyfin sessions
// are eligible — they always force VideoCodec=h264&AudioCodec=aac upstream and
// the transcode output is h264 High. The legacy Plex fallback path must NOT
// get the declaration: its output profile is not under our control.
func rewriteStreamManifest(manifest, proxyBaseURL, slug, episodeID string, declareCodecs bool) string {
	qs := ""
	if episodeID != "" {
		qs = "?episodeId=" + url.QueryEscape(episodeID)
	}
	var out strings.Builder
	lines := strings.Split(manifest, "\n")
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" {
			out.WriteString(line)
			out.WriteString("\n")
			continue
		}
		if strings.HasPrefix(trimmed, "#") {
			// #EXT-X-STREAM-INF describes the playlist on its NEXT line, so it is
			// not a URI-bearing tag — but its attribute list may be missing the
			// CODECS declaration that hls.js needs to size the MSE SourceBuffer.
			// Jellyfin never emits CODECS (its web client learns codecs from the
			// PlaybackInfo API); without it hls.js falls back to its own guess
			// (often H.264 Baseline) and Chromium's MSE rejects the High-profile
			// segments the transcode actually produces — bufferAppendingError on
			// every append. Declare the codecs we forced upstream instead.
			if strings.HasPrefix(trimmed, "#EXT-X-STREAM-INF:") {
				if declareCodecs {
					out.WriteString(injectStreamCodecs(line))
				} else {
					out.WriteString(line)
				}
			} else if isURIBearingTag(trimmed) {
				out.WriteString(rewriteTagURIs(line, proxyBaseURL, slug, qs))
			} else {
				out.WriteString(line)
			}
			out.WriteString("\n")
			continue
		}
		out.WriteString(rewriteStreamReference(line, proxyBaseURL, slug, qs))
		out.WriteString("\n")
	}
	return out.String()
}

// streamCodecsAttr is the CODECS value we declare on variants whose
// #EXT-X-STREAM-INF line omits it. The proxy forces VideoCodec=h264&
// AudioCodec=aac on every Jellyfin master (see services.hlsCodecParams) and
// the transcoded output is H.264 High + AAC-LC (libx264's default profile;
// verified with ffprobe on the live segments). High up to level 5.1
// (avc1.640033) covers every resolution the transcode can emit — declaring a
// level higher than the actual stream is always valid for MSE, while the
// default hls.js guess (Baseline avc1.42e01e) rejects High-profile data.
const streamCodecsAttr = `CODECS="avc1.640033,mp4a.40.2"`

// injectStreamCodecs appends a CODECS attribute to an #EXT-X-STREAM-INF line
// that does not already declare one. HLS attribute lists are unordered
// key=value pairs, so appending at the end is spec-valid; a trailing \r (CRLF
// playlists) is preserved.
func injectStreamCodecs(line string) string {
	if strings.Contains(line, "CODECS=") {
		return line
	}
	trimmed := strings.TrimSuffix(line, "\r")
	if trimmed == line {
		return line + "," + streamCodecsAttr
	}
	return trimmed + "," + streamCodecsAttr + "\r"
}

// isURIBearingTag reports whether an HLS tag carries a URI="..." attribute
// whose value must be proxied alongside the bare URL lines. Tags that only
// describe playlists on their *next* line (#EXT-X-STREAM-INF) are not listed:
// their URI rides on the following plain line, which the main loop rewrites.
func isURIBearingTag(tag string) bool {
	for _, prefix := range []string{
		"#EXT-X-MEDIA:",
		"#EXT-X-MAP:",
		"#EXT-X-KEY:",
		"#EXT-X-I-FRAME-STREAM-INF:",
	} {
		if strings.HasPrefix(tag, prefix) {
			return true
		}
	}
	return false
}

// rewriteStreamReference maps one stream URL reference to our same-origin
// proxy segment endpoint. Absolute URLs lose their origin (the request is
// always forwarded to the configured media server), but keep any query string
// so provider-specific parameters (MediaSourceId, VideoCodec, …) survive the
// trip. Non-stream references pass through unchanged.
//
// The origin is encoded with escapeOriginSegment: EVERY byte outside the RFC
// 3986 unreserved set (`A-Za-z0-9-_.~`) is percent-escaped — including the
// sub-delims (`&`, `=`, `+`, `:`, `;`, …) that url.PathEscape leaves raw.
// A raw `&` inside a path makes the URL ambiguous to any intermediate that
// parses query separators (Next.js dev rewrites, CDNs), and raw `=`/`+` can
// be re-interpreted by parsers; full escaping makes the origin a single
// opaque path segment that a single decode — which net/http already performed
// before gin matched the route — restores byte-for-byte. `qs` (the proxy's
// own query string, e.g. `?episodeId=…`) rides as a real query on the
// rewritten URL, never inside the encoded origin.
func rewriteStreamReference(ref, proxyBaseURL, slug, qs string) string {
	trimmed := strings.TrimSpace(ref)
	if trimmed == "" || !looksLikeStreamURL(trimmed) {
		return ref
	}
	origin := trimmed
	if u, err := url.Parse(trimmed); err == nil && u.Scheme != "" && u.Host != "" {
		origin = strings.TrimPrefix(u.Path, "/")
		if u.RawQuery != "" {
			origin += "?" + u.RawQuery
		}
	}
	return fmt.Sprintf(
		"%s%s/api/v1/discover/item/%s/stream/proxy/segment/%s%s",
		proxyBaseURL, basePathFromRequest(proxyBaseURL), slug, escapeOriginSegment(origin), qs,
	)
}

// escapeOriginSegment percent-escapes every byte of a stream reference except
// RFC 3986 unreserved characters, so the result is one opaque, unambiguous
// URL path segment. Unlike url.PathEscape it does NOT leave `&`, `=`, `+`,
// `:` or `;` raw (those would be misparsed by URL/query-aware intermediaries),
// and unlike url.QueryEscape it never uses `+` for spaces (a literal `+` in
// the origin must survive the round trip). A single path decode on the
// receiving side restores the origin exactly.
func escapeOriginSegment(s string) string {
	const hex = "0123456789ABCDEF"
	var b strings.Builder
	b.Grow(len(s))
	for i := 0; i < len(s); i++ {
		c := s[i]
		if (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') ||
			c == '-' || c == '_' || c == '.' || c == '~' {
			b.WriteByte(c)
			continue
		}
		b.WriteByte('%')
		b.WriteByte(hex[c>>4])
		b.WriteByte(hex[c&0x0F])
	}
	return b.String()
}

// decodeSegmentRef turns the gin subpath of a /segment/* request into the
// upstream reference handed to the provider's BuildSegmentURL. gin/net-http
// already percent-decoded the request path, so the reference is used
// verbatim — a second unescape would corrupt origins that legitimately
// contain `%XX` sequences (Plex `path=%2F…` params double-decode into raw
// slashes) and mangle literal `+`/`%` bytes. Some proxies (Next.js dev
// rewrites) additionally split the origin's query out of the path into the
// request's real query string; mergeSegmentQuery re-attaches it.
func decodeSegmentRef(subpath, rawQuery string) string {
	return mergeSegmentQuery(strings.TrimLeft(subpath, "/"), rawQuery)
}

// mergeSessionParams injects the master's transcode session + forced codec
// params (DeviceId, MediaSourceId, VideoCodec, AudioCodec, …) into a
// variant/segment reference that omitted them. Jellyfin's media playlists are
// not guaranteed to echo the full query on every URL line; without the
// injection each upstream request would start its own session with DEFAULT
// codecs (an HEVC remux for bridged sources), which Chromium's MSE cannot
// decode — the player dies with bufferAppendingError. Params already present
// on the reference win (they are authoritative); api_key is skipped
// (BuildSegmentURL injects our own).
func mergeSessionParams(ref string, q url.Values) string {
	if len(q) == 0 || ref == "" {
		return ref
	}
	pathPart, rawQuery, _ := strings.Cut(ref, "?")
	merged, err := url.ParseQuery(rawQuery)
	if err != nil {
		merged = url.Values{}
	}
	changed := false
	for k, vs := range q {
		if k == "api_key" {
			continue
		}
		if _, ok := merged[k]; !ok {
			merged[k] = vs
			changed = true
		}
	}
	if !changed {
		return ref
	}
	return pathPart + "?" + merged.Encode()
}

// mergeSegmentQuery re-attaches a proxy-decoded query string to a segment
// reference. Proxies that normalize request paths (Next.js dev rewrites)
// split the origin's encoded query out of the path and hand it to us as a
// real query string; without merging it back, the upstream variant / segment
// request loses its transcode session and codec params (DeviceId,
// MediaSourceId, VideoCodec, …) and Jellyfin starts a fresh session with
// default codecs. The proxy's own episodeId param is never part of the
// origin and is excluded. If the reference already carries its query (the
// path survived intact), the request query is ignored.
func mergeSegmentQuery(segmentRelativeRef, rawQuery string) string {
	if rawQuery == "" || strings.Contains(segmentRelativeRef, "?") {
		return segmentRelativeRef
	}
	q, err := url.ParseQuery(rawQuery)
	if err != nil {
		return segmentRelativeRef
	}
	q.Del("episodeId")
	if len(q) == 0 {
		return segmentRelativeRef
	}
	return segmentRelativeRef + "?" + q.Encode()
}

// rewriteTagURIs rewrites every URI="..." attribute inside an HLS tag line in
// place, delegating each value to rewriteStreamReference (so non-stream URIs
// stay untouched). Handles one or several URI attributes per line.
func rewriteTagURIs(line, proxyBaseURL, slug, qs string) string {
	var out strings.Builder
	out.Grow(len(line) + 96)
	rest := line
	for {
		idx := strings.Index(rest, "URI=")
		if idx < 0 {
			out.WriteString(rest)
			break
		}
		out.WriteString(rest[:idx+len("URI=")])
		rest = rest[idx+len("URI="):]
		// Skip whitespace before the opening quote (the HLS spec allows none,
		// but stay tolerant of sloppy generators).
		skip := 0
		for skip < len(rest) && (rest[skip] == ' ' || rest[skip] == '\t') {
			skip++
		}
		out.WriteString(rest[:skip])
		rest = rest[skip:]
		if len(rest) == 0 || rest[0] != '"' {
			// Unterminated / unquoted attribute — copy the remainder verbatim.
			out.WriteString(rest)
			break
		}
		out.WriteString(`"`)
		rest = rest[1:]
		closeIdx := strings.IndexByte(rest, '"')
		if closeIdx < 0 {
			out.WriteString(rest)
			break
		}
		out.WriteString(rewriteStreamReference(rest[:closeIdx], proxyBaseURL, slug, qs))
		out.WriteString(`"`)
		rest = rest[closeIdx+1:]
	}
	return out.String()
}

// basePathFromRequest strips the scheme+host from a base URL so the rewritten
// segment URL can be rebuilt as `<host><basepath>/api/v1/...` regardless of
// whether the operator serves everything at `/` or under a sub-path.
func basePathFromRequest(baseURL string) string {
	if i := strings.Index(baseURL, "://"); i >= 0 {
		baseURL = baseURL[i+3:]
		if j := strings.Index(baseURL, "/"); j >= 0 {
			return baseURL[j:]
		}
	}
	return ""
}

// isPlaylistContentType reports whether an upstream Content-Type identifies
// an HLS playlist (master or media). Segment responses (video/mp2t,
// video/mp4, application/octet-stream) are NOT playlists and must stream
// untouched.
func isPlaylistContentType(ct string) bool {
	lower := strings.ToLower(ct)
	return strings.Contains(lower, "mpegurl") || strings.Contains(lower, "x-mpegurl")
}

func looksLikeStreamURL(s string) bool {
	// Some Plex manifests append a `?session=…` query to each URL line; strip
	// it before checking the suffix so we still recognise the file extension.
	check := s
	if i := strings.Index(check, "?"); i >= 0 {
		check = check[:i]
	}
	for _, suffix := range []string{".m3u8", ".ts", ".aac", ".mp4", ".webm", ".vtt", ".m4s", ".mpd", ".key", ".hls"} {
		if strings.HasSuffix(check, suffix) {
			return true
		}
	}
	return false
}

// animeModelToDetail builds the public detail payload (item header + seasons
// with their episodes) from a catalog row, reusing animeModelToContentItem for
// the header so every public surface stays consistent.
func animeModelToDetail(a *models.Anime) ApiContentDetailResponse {
	seasons := make([]ApiSeasonDetail, 0, len(a.Seasons))
	for _, s := range a.Seasons {
		episodes := make([]ApiEpisode, 0, len(s.Episodes))
		for _, e := range s.Episodes {
			episodes = append(episodes, ApiEpisode{
				ID:           e.ID,
				Number:       e.Number,
				Title:        e.Title,
				Synopsis:     e.Synopsis,
				ThumbnailUrl: e.ThumbnailUrl,
				Duration:     e.Duration,
				IsSubbed:     e.IsSubbed,
				IsDubbed:     e.IsDubbed,
			})
		}
		seasons = append(seasons, ApiSeasonDetail{
			ID:           s.ID,
			Number:       s.Number,
			Title:        s.Title,
			EpisodeCount: s.EpisodeCount,
			Episodes:     episodes,
		})
	}
	return ApiContentDetailResponse{
		Item:    animeModelToContentItem(a),
		Seasons: seasons,
	}
}

// GetDiscoverContinueWatching returns continue-watching items for the authenticated user.
func (h *DiscoverHandler) GetDiscoverContinueWatching(c *gin.Context) {
	// This requires a logged-in user. The watch progress is stored in the DB.
	// For now, return empty list — the watch service already has /watch/continue.
	utils.Success(c, http.StatusOK, gin.H{
		"items": []ContinueWatchingItem{},
	})
}

// GetContentDetail returns a single content item by AniList ID.
func (h *DiscoverHandler) GetContentDetail(c *gin.Context) {
	idStr := c.Param("anilistId")
	anilistID, err := strconv.Atoi(idStr)
	if err != nil || anilistID <= 0 {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}

	media, err := h.deps.AnilistService.GetMedia(c.Request.Context(), anilistID)
	if err != nil {
		utils.Error(c, err)
		return
	}

	item := anilistMediaToContentItem(media)
	utils.Success(c, http.StatusOK, item)
}

// ──────────────────────────────────────────────────────────────
// Mappers
// ──────────────────────────────────────────────────────────────

func anilistMediaToContentItem(media *services.AnilistMedia) ApiContentItem {
	title := media.Title.English
	if title == "" {
		title = media.Title.Romaji
	}

	slug := strings.ToLower(title)
	slug = strings.ReplaceAll(slug, " ", "-")
	slug = strings.ReplaceAll(slug, "--", "-")

	// Map status
	status := "upcoming"
	switch strings.ToUpper(media.Status) {
	case "FINISHED":
		status = "finished"
	case "RELEASING":
		status = "airing"
	case "NOT_YET_RELEASED":
		status = "upcoming"
	case "CANCELLED":
		status = "cancelled"
	case "HIATUS":
		status = "hiatus"
	}

	contentType := "anime"
	if media.Format == "MOVIE" {
		contentType = "movie"
	}

	// Studio name
	studioName := ""
	for _, edge := range media.Studios.Edges {
		if edge.IsMain {
			studioName = edge.Node.Name
			break
		}
	}
	if studioName == "" && len(media.Studios.Edges) > 0 {
		studioName = media.Studios.Edges[0].Node.Name
	}

	episodes := 0
	if media.Episodes != nil {
		episodes = *media.Episodes
	}

	var rating float64
	if media.AverageScore != nil {
		rating = float64(*media.AverageScore) / 10.0
	}

	var ratingCount *int
	if media.Popularity != nil {
		ratingCount = media.Popularity
	}

	ageRating := ""
	year := 0
	if media.SeasonYear != nil {
		year = *media.SeasonYear
	}

	seasons := 1
	// For simplicity, estimate seasons from episode count
	if episodes > 12 {
		seasons = (episodes + 11) / 12
	}

	return ApiContentItem{
		ID:     fmt.Sprintf("anilist-%d", media.ID),
		Slug:   slug,
		Title:  title,
		Type:   contentType,
		Format: strings.ToLower(string(media.Format)),
		Status: status,
		Year:   year,
		Images: ApiImages{
			Poster: ApiImage{
				URL: media.CoverImage.Large,
			},
			Backdrop: ApiImage{
				URL: coalesceStr(media.BannerImage, media.CoverImage.Large),
			},
		},
		Metadata: ApiContentMetadata{
			Genres:        media.Genres,
			Studio:        studioName,
			Rating:        rating,
			RatingCount:   ratingCount,
			AgeRating:     ageRating,
			Year:          year,
			JapaneseTitle: media.Title.Native,
			Synopsis:      cleanDesc(media.Description),
		},
		Availability: ApiContentAvailability{
			Watchable: false,
			Episodes:  episodes,
			Seasons:   &seasons,
		},
	}
}

// selectHeroItems scores published items (rating, featured flag, backdrop,
// recency as tie-breaker) and returns the top N as hero slides — so the hero
// is always populated automatically, no manual curation needed.
func selectHeroItems(items []models.Anime, max int) []ApiContentItem {
	type scored struct {
		item  ApiContentItem
		score float64
	}
	all := make([]scored, 0, len(items))
	for i := range items {
		a := &items[i]
		score := a.Rating
		if a.IsFeatured {
			score += 30
		}
		if a.BannerImageUrl != "" {
			score += 10
		}
		score += float64(a.ReleaseYear) / 1000.0
		all = append(all, scored{item: animeModelToContentItem(a), score: score})
	}
	sort.SliceStable(all, func(i, j int) bool { return all[i].score > all[j].score })
	out := make([]ApiContentItem, 0, max)
	for _, s := range all {
		if len(out) >= max {
			break
		}
		out = append(out, s.item)
	}
	return out
}

// contentItemsExcluding maps models to API items, skipping any id in exclude
// so rails don't repeat the hero titles.
func contentItemsExcluding(items []models.Anime, exclude map[string]bool) []ApiContentItem {
	out := make([]ApiContentItem, 0, len(items))
	for i := range items {
		if !exclude[items[i].ID] {
			out = append(out, animeModelToContentItem(&items[i]))
		}
	}
	return out
}

func mapAnilistMediaToContentItems(media []services.AnilistMedia) []ApiContentItem {
	items := make([]ApiContentItem, 0, len(media))
	for i := range media {
		items = append(items, anilistMediaToContentItem(&media[i]))
	}
	return items
}

// contentFormatFromMetadata resolves the public content type/format of a
// catalog row from its stored provider metadata. AniList imports record the
// media format (e.g. "MOVIE", "TV", "OVA") while Plex imports record the
// canonical library type ("Movie", "Series") — both are already persisted on
// the anime rows created from the admin catalog. Rows without any type hint
// default to a series so nothing is mislabelled.
func contentFormatFromMetadata(meta map[string]any) (contentType, format string) {
	contentType, format = "anime", "tv"
	if raw, ok := meta["format"].(string); ok {
		switch strings.ToLower(raw) {
		case "movie":
			return "movie", "movie"
		case "tv", "tv_short":
			return "anime", strings.ToLower(raw)
		case "ova", "ona", "special":
			return strings.ToLower(raw), strings.ToLower(raw)
		}
	}
	if raw, ok := meta["type"].(string); ok {
		switch strings.ToLower(raw) {
		case "movie":
			return "movie", "movie"
		// Any TV-show flavour (Plex "Series", "show", a future
		// "tv-show"/"tvshow"…) is accepted as series content: it maps to the
		// anime/tv payload the public page renders on the /series rails.
		case "series", "show", "tv-show", "tvshow":
			return "anime", "tv"
		}
	}
	return contentType, format
}

func animeModelToContentItem(a *models.Anime) ApiContentItem {
	genres := make([]string, 0, len(a.Genres))
	for _, genre := range a.Genres {
		genres = append(genres, genre.Name)
	}
	studioName := ""
	if len(a.Studios) > 0 {
		studioName = a.Studios[0].Name
	}
	status := a.Status
	if status == "" {
		status = "upcoming"
	}

	// Preserve the real content type published from the admin catalog: a
	// movie must stay a movie (e.g. /movies/ route, “Film” label) instead of
	// being flattened into a series. Also surface the provider popularity as
	// the rating count shown on the public detail pages.
	var ratingCount *int
	contentType, format := "anime", "tv"
	if len(a.Metadata) > 0 {
		var meta map[string]any
		if err := json.Unmarshal(a.Metadata, &meta); err == nil {
			contentType, format = contentFormatFromMetadata(meta)
			if pop, ok := meta["popularity"].(float64); ok && pop > 0 {
				n := int(pop)
				ratingCount = &n
			}
		}
	}

	episodes := a.TotalEpisodes
	seasons := len(a.Seasons)
	if seasons == 0 {
		seasons = 1
		if episodes > 12 {
			seasons = (episodes + 11) / 12
		}
	}
	// Movies carry no seasons; omit the count so the frontend maps them to a
	// movie (no season rail, /movies/ path).
	var seasonCount *int
	if contentType != "movie" {
		seasonCount = &seasons
	}
	return ApiContentItem{
		ID:     a.ID,
		Slug:   a.Slug,
		Title:  a.Title,
		Type:   contentType,
		Format: format,
		Status: status,
		Year:   a.ReleaseYear,
		Images: ApiImages{
			Poster: ApiImage{
				URL: a.CoverImageUrl,
			},
			Backdrop: ApiImage{
				URL: coalesceStr(a.BannerImageUrl, a.CoverImageUrl),
			},
		},
		Metadata: ApiContentMetadata{
			Genres:        genres,
			Studio:        studioName,
			Rating:        a.Rating,
			RatingCount:   ratingCount,
			AgeRating:     a.AgeRating,
			Year:          a.ReleaseYear,
			JapaneseTitle: a.JapaneseTitle,
			Synopsis:      a.Synopsis,
		},
		Availability: ApiContentAvailability{
			// A published item is watchable only when a media provider actually
			// backs it (metadata.sourceId written by the library sync). Rows
			// imported without media — e.g. AniList/MAL metadata-only entries —
			// must not be presented as playable: the stream resolver would only
			// fail ("No Series matching … found on the media server") after a
			// slow provider search.
			Watchable: a.Status == "published" && providerSourceIDFromMetadata(a) != "",
			Episodes:  episodes,
			Seasons:   seasonCount,
		},
	}
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

func currentSeason(now time.Time) string {
	m := now.Month()
	switch {
	case m >= 1 && m <= 3:
		return "WINTER"
	case m >= 4 && m <= 6:
		return "SPRING"
	case m >= 7 && m <= 9:
		return "SUMMER"
	default:
		return "FALL"
	}
}

func seasonDisplayName(season string) string {
	switch strings.ToUpper(season) {
	case "WINTER":
		return "Hiver"
	case "SPRING":
		return "Printemps"
	case "SUMMER":
		return "Été"
	case "FALL":
		return "Automne"
	default:
		return season
	}
}

// Shared genre display labels & catalog query slugs for the discover rails.
var discoverGenreLabels = map[string]string{
	"Action":        "Action & Aventure",
	"Adventure":     "Aventure",
	"Comedy":        "Comédie",
	"Drama":         "Drames poignants",
	"Fantasy":       "Fantastique",
	"Horror":        "Horreur & Suspense",
	"Romance":       "Romance",
	"Sci-Fi":        "Science-Fiction",
	"Slice of Life": "Tranche de vie",
	"Suspense":      "Suspense",
	"Thriller":      "Thrillers",
	"Supernatural":  "Surnaturel",
	"Mystery":       "Mystère",
	"Sports":        "Sports",
	"Music":         "Musique",
	"Mecha":         "Mecha",
	"Seinen":        "Seinen",
	"Shounen":       "Shounen",
	"Shoujo":        "Shoujo",
	"Josei":         "Josei",
	"Kids":          "Enfants",
	"Ecchi":         "Ecchi",
	"Hentai":        "Hentai",
	"Yuri":          "Yuri",
	"Yaoi":          "Yaoi",
	"Isekai":        "Isekai",
}

var discoverGenreQuery = map[string]string{
	"Action":       "action",
	"Fantasy":      "fantasy",
	"Romance":      "romance",
	"Sci-Fi":       "scifi",
	"Supernatural": "supernatural",
	"Mystery":      "mystery",
	"Thriller":     "thriller",
	"Sports":       "sports",
}

func buildGenreSections(trending, popular []services.AnilistMedia) []ApiSection {
	// Deduplicate and collect genres from the first N items
	genreMap := make(map[string][]ApiContentItem)

	allMedia := append(trending, popular...)
	added := make(map[int]bool)
	for i := range allMedia {
		if added[allMedia[i].ID] {
			continue
		}
		added[allMedia[i].ID] = true

		item := anilistMediaToContentItem(&allMedia[i])
		for _, genre := range allMedia[i].Genres {
			genreMap[genre] = append(genreMap[genre], item)
		}
	}

	// Take the top genres with at least 4 items
	type genreEntry struct {
		name  string
		items []ApiContentItem
	}
	var entries []genreEntry
	for name, items := range genreMap {
		if len(items) >= 4 {
			entries = append(entries, genreEntry{name: name, items: items})
		}
	}

	// Limit to 5 genre sections max
	if len(entries) > 5 {
		entries = entries[:5]
	}

	sections := make([]ApiSection, 0, len(entries))

	for _, entry := range entries {
		label, ok := discoverGenreLabels[entry.name]
		if !ok {
			label = entry.name
		}
		query, _ := discoverGenreQuery[entry.name]
		ctaHref := "/catalog"
		if query != "" {
			ctaHref = fmt.Sprintf("/catalog?genre=%s", query)
		}

		sections = append(sections, ApiSection{
			ID:       fmt.Sprintf("genre-%s", strings.ToLower(entry.name)),
			Title:    label,
			Type:     "carousel",
			Subtitle: fmt.Sprintf("Les meilleurs %s", strings.ToLower(label)),
			CtaLabel: "Voir tout",
			CtaHref:  ctaHref,
			Items:    entry.items,
		})
	}

	return sections
}

// buildAnimeGenreSections groups published catalog items by genre into rails
// (genres with at least 3 items, biggest first, capped at maxGenreSections),
// mirroring the AniList rails. Items whose id is in exclude (e.g. hero slides)
// are skipped. Sorting by size guarantees the fullest genre rails — the ones
// that propose the most content — surface first.
func buildAnimeGenreSections(items []models.Anime, exclude map[string]bool) []ApiSection {
	genreMap := make(map[string][]ApiContentItem)
	seen := make(map[string]bool)
	for i := range items {
		if exclude[items[i].ID] || seen[items[i].ID] {
			continue
		}
		seen[items[i].ID] = true
		item := animeModelToContentItem(&items[i])
		for _, genre := range items[i].Genres {
			genreMap[genre.Name] = append(genreMap[genre.Name], item)
		}
	}

	type genreEntry struct {
		name  string
		items []ApiContentItem
	}
	var entries []genreEntry
	for name, items := range genreMap {
		if len(items) >= 3 {
			entries = append(entries, genreEntry{name: name, items: items})
		}
	}
	// Biggest rails first so the algorithm surfaces the genres with the most
	// content (deterministic — map iteration order is not stable in Go).
	sort.Slice(entries, func(i, j int) bool {
		if len(entries[i].items) != len(entries[j].items) {
			return len(entries[i].items) > len(entries[j].items)
		}
		return entries[i].name < entries[j].name
	})
	if len(entries) > maxGenreSections {
		entries = entries[:maxGenreSections]
	}

	sections := make([]ApiSection, 0, len(entries))
	for _, entry := range entries {
		label, ok := discoverGenreLabels[entry.name]
		if !ok {
			label = entry.name
		}
		query, _ := discoverGenreQuery[entry.name]
		ctaHref := "/catalog"
		if query != "" {
			ctaHref = fmt.Sprintf("/catalog?genre=%s", query)
		}
		sections = append(sections, ApiSection{
			ID:       fmt.Sprintf("genre-%s", strings.ToLower(entry.name)),
			Title:    label,
			Type:     "carousel",
			Subtitle: fmt.Sprintf("Les meilleurs %s", strings.ToLower(label)),
			CtaLabel: "Voir tout",
			CtaHref:  ctaHref,
			Items:    entry.items,
		})
	}
	return sections
}

func coalesceStr(values ...string) string {
	for _, v := range values {
		if v != "" {
			return v
		}
	}
	return ""
}

func cleanDesc(desc string) string {
	desc = strings.ReplaceAll(desc, "<br>", "\n")
	desc = strings.ReplaceAll(desc, "<br/>", "\n")
	desc = strings.ReplaceAll(desc, "<br />", "\n")
	for {
		start := strings.Index(desc, "<")
		if start == -1 {
			break
		}
		end := strings.Index(desc[start:], ">")
		if end == -1 {
			break
		}
		desc = desc[:start] + desc[start+end+1:]
	}
	return strings.TrimSpace(desc)
}
