package services

import (
	"context"
	"encoding/json"
	"log/slog"
	"strconv"
	"sync"
	"time"

	"gorm.io/gorm"

	"github.com/skygenesisenterprise/kami-sama/server/src/models"
)

// JellyfinMirrorStats aggregates the outcome of one DB → Jellyfin mirror run.
// The catalog (fed by the content providers — Plex) is pushed into the
// media-server's library via the .strm bridge so Jellyfin reflects the exact
// same titles (and their real episode grids), and the watch page delegates
// ALL HLS playback to it.
type JellyfinMirrorStats struct {
	Status          string     `json:"status"` // idle | running | completed | failed
	ItemsScanned    int        `json:"itemsScanned"`
	ItemsCreated    int        `json:"itemsCreated"`
	ItemsUpdated    int        `json:"itemsUpdated"`
	ItemsFailed     int        `json:"itemsFailed"`
	EpisodesScanned int        `json:"episodesScanned"`
	EpisodesCreated int        `json:"episodesCreated"`
	EpisodesUpdated int        `json:"episodesUpdated"`
	EpisodesFailed  int        `json:"episodesFailed"`
	StartedAt       time.Time  `json:"startedAt"`
	CompletedAt     *time.Time `json:"completedAt,omitempty"`
	ErrorMessage    string     `json:"errorMessage,omitempty"`
}

// JellyfinMirrorSync mirrors the persisted catalog (models.Anime rows with a
// Plex source link) into the Jellyfin media-server library. Every bridged
// item is created exactly like the play-time Plex→Jellyfin bridge
// (GetDirectFileURL + BridgeRemoteMedia with the same .strm file name), so
// the mirror is idempotent: re-running it only re-verifies existing items,
// and the first play of an already-mirrored title never pays the bridge cost.
//
// Series rows are expanded episode by episode — a series has no direct file
// URL of its own, only its episodes do — which is what makes the "miroir
// complet" claim true: the Jellyfin library ends up containing every playable
// unit of the catalog.
type JellyfinMirrorSync struct {
	db     *gorm.DB
	logger *slog.Logger

	mu      sync.Mutex
	running bool
	last    JellyfinMirrorStats
}

func NewJellyfinMirrorSync(db *gorm.DB, logger *slog.Logger) *JellyfinMirrorSync {
	return &JellyfinMirrorSync{db: db, logger: logger}
}

// Status returns the last run outcome (or an idle placeholder before any run).
func (s *JellyfinMirrorSync) Status() JellyfinMirrorStats {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.last.Status == "" {
		return JellyfinMirrorStats{Status: "idle"}
	}
	return s.last
}

// Start launches the mirror in the background and returns immediately. When a
// run is already in flight the existing run is reported instead of starting a
// second one — the mirror is a single-flight operation (Jellyfin scans are
// heavy, two concurrent bridges over the same .strm files would race).
func (s *JellyfinMirrorSync) Start(ctx context.Context, plex *PlexClient, jf *JellyfinClient) JellyfinMirrorStats {
	s.mu.Lock()
	if s.running {
		stats := s.last
		s.mu.Unlock()
		return stats
	}
	s.running = true
	s.last = JellyfinMirrorStats{Status: "running", StartedAt: time.Now().UTC()}
	s.mu.Unlock()

	go func() {
		// Detach from the caller's context: the HTTP request that triggered
		// the run is answered (202 Accepted) before the mirror does any real
		// work, so its context is cancelled by the time this goroutine runs.
		// Without detaching, every DB query and Jellyfin call in the run
		// fails with context.Canceled and nothing is ever bridged into the
		// media-server library.
		rctx := context.WithoutCancel(ctx)
		stats := s.Run(rctx, plex, jf)
		s.mu.Lock()
		s.last = stats
		s.running = false
		s.mu.Unlock()
	}()
	return s.Status()
}

// Run executes the mirror synchronously and returns the outcome. It walks the
// persisted catalog page by page, resolving each Plex-linked row's direct file
// URL and bridging it into the Jellyfin library (movies once, series episode
// by episode). Best-effort per item: one failing title never aborts the rest
// of the run.
func (s *JellyfinMirrorSync) Run(ctx context.Context, plex *PlexClient, jf *JellyfinClient) JellyfinMirrorStats {
	stats := JellyfinMirrorStats{Status: "running", StartedAt: time.Now().UTC()}
	if s.db == nil {
		stats.Status = "failed"
		stats.ErrorMessage = "database unavailable"
		s.writeSyncLog(ctx, stats)
		return stats
	}
	if plex == nil || !plex.Enabled() {
		stats.Status = "failed"
		stats.ErrorMessage = "Plex client unavailable"
		s.writeSyncLog(ctx, stats)
		return stats
	}
	if jf == nil || !jf.Enabled() {
		stats.Status = "failed"
		stats.ErrorMessage = "media server (Jellyfin) unavailable"
		s.writeSyncLog(ctx, stats)
		return stats
	}

	const pageSize = 100
	for offset := 0; ; offset += pageSize {
		var rows []models.Anime
		// Only rows with a real Plex source link can be bridged: metadata.sourceId
		// is the Plex ratingKey that GetDirectFileURL resolves.
		err := s.db.WithContext(ctx).
			Preload("Seasons.Episodes").
			Where("source = ? AND metadata->>'sourceId' IS NOT NULL AND metadata->>'sourceId' != ''", "plex").
			Order("title ASC").
			Limit(pageSize).Offset(offset).
			Find(&rows).Error
		if err != nil {
			stats.Status = "failed"
			stats.ErrorMessage = "could not read catalog: " + err.Error()
			break
		}
		if len(rows) == 0 {
			break
		}
		for i := range rows {
			s.bridgeRow(ctx, plex, jf, &rows[i], &stats)
			if ctx.Err() != nil {
				stats.Status = "failed"
				stats.ErrorMessage = "mirror interrupted: " + ctx.Err().Error()
				break
			}
		}
		if ctx.Err() != nil {
			break
		}
		if len(rows) < pageSize {
			break
		}
	}

	now := time.Now().UTC()
	if stats.Status != "failed" {
		stats.Status = "completed"
	}
	stats.CompletedAt = &now
	s.logger.Info("jellyfin mirror run finished",
		"status", stats.Status,
		"itemsScanned", stats.ItemsScanned,
		"itemsCreated", stats.ItemsCreated,
		"itemsUpdated", stats.ItemsUpdated,
		"itemsFailed", stats.ItemsFailed,
		"episodesScanned", stats.EpisodesScanned,
		"episodesCreated", stats.EpisodesCreated,
		"episodesUpdated", stats.EpisodesUpdated,
		"episodesFailed", stats.EpisodesFailed,
		"error", stats.ErrorMessage)
	s.writeSyncLog(ctx, stats)
	return stats
}

// bridgeRow pushes a single catalog row into Jellyfin. Movies are bridged
// once from metadata.sourceId; series are expanded into their episodes (the
// only playable units) using the episode rows' Plex ratingKeys. Every item is
// named with the series/movie title — exactly like the play-time bridge — so
// the generated .strm file matches what GetStreamURL would create on demand.
func (s *JellyfinMirrorSync) bridgeRow(ctx context.Context, plex *PlexClient, jf *JellyfinClient, row *models.Anime, stats *JellyfinMirrorStats) {
	sourceID := mirrorSourceID(row)
	if sourceID == "" {
		return
	}
	hasEpisodes := false
	for i := range row.Seasons {
		if len(row.Seasons[i].Episodes) > 0 {
			hasEpisodes = true
			break
		}
	}

	if !hasEpisodes {
		stats.ItemsScanned++
		created, err := s.bridgeOne(ctx, plex, jf, row.Title, sourceID)
		switch {
		case err != nil:
			stats.ItemsFailed++
			s.logger.Warn("mirror: movie bridge failed", "title", row.Title, "error", err)
		case created:
			stats.ItemsCreated++
		default:
			stats.ItemsUpdated++
		}
		return
	}

	for i := range row.Seasons {
		for j := range row.Seasons[i].Episodes {
			ep := &row.Seasons[i].Episodes[j]
			// Episodes imported from Plex carry the Plex ratingKey as their id
			// (importPlexShowEpisodes). Placeholder episodes (AniList-only rows,
			// manual adds) have no playable Plex media — skip them instead of
			// burning a failing bridge round-trip.
			if !isNumericID(ep.ID) {
				continue
			}
			stats.EpisodesScanned++
			created, err := s.bridgeOne(ctx, plex, jf, row.Title, ep.ID)
			switch {
			case err != nil:
				stats.EpisodesFailed++
				s.logger.Warn("mirror: episode bridge failed", "title", row.Title, "episode", ep.ID, "error", err)
			case created:
				stats.EpisodesCreated++
			default:
				stats.EpisodesUpdated++
			}
		}
	}
}

// bridgeOne resolves the direct Plex file URL of a ratingKey and bridges it
// into Jellyfin. Returns whether the .strm item was newly created (vs already
// bridged by a previous run or a play-time bridge).
func (s *JellyfinMirrorSync) bridgeOne(ctx context.Context, plex *PlexClient, jf *JellyfinClient, title, ratingKey string) (bool, error) {
	directURL, _, err := plex.GetDirectFileURL(ctx, ratingKey)
	if err != nil {
		return false, err
	}
	existed := jf.StrmFileExists(title, directURL)
	if _, err := jf.BridgeRemoteMedia(ctx, title, directURL); err != nil {
		return false, err
	}
	return !existed, nil
}

// writeSyncLog records the run in source_sync_logs so the Sources → sync logs
// surface the mirror like any other provider sync.
func (s *JellyfinMirrorSync) writeSyncLog(ctx context.Context, stats JellyfinMirrorStats) {
	if s.db == nil {
		return
	}
	now := time.Now().UTC()
	errorMessage := stats.ErrorMessage
	log := models.SourceSyncLog{
		Common: models.Common{
			ID:        "jellyfin-mirror-" + now.Format("20060102150405"),
			CreatedAt: now,
			UpdatedAt: now,
		},
		LibraryID:    "mirror",
		SourceType:   "jellyfin",
		Status:       stats.Status,
		ItemsCreated: stats.ItemsCreated + stats.EpisodesCreated,
		ItemsUpdated: stats.ItemsUpdated + stats.EpisodesUpdated,
		ItemsRemoved: 0,
		StartedAt:    stats.StartedAt,
		CompletedAt:  stats.CompletedAt,
	}
	if errorMessage != "" {
		log.ErrorMessage = &errorMessage
	}
	_ = s.db.WithContext(ctx).Create(&log).Error
}

// mirrorSourceID reads the provider item key persisted on a catalog row
// (metadata.sourceId) — the Plex ratingKey backing the row.
func mirrorSourceID(a *models.Anime) string {
	if a == nil || len(a.Metadata) == 0 {
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

// isNumericID reports whether an episode id looks like a provider (Plex)
// numeric ratingKey rather than a generated placeholder id.
func isNumericID(id string) bool {
	if id == "" {
		return false
	}
	_, err := strconv.ParseUint(id, 10, 64)
	return err == nil
}
