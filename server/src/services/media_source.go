package services

import (
	"context"
	"time"

	"github.com/skygenesisenterprise/kami-sama/server/src/config"
	"github.com/skygenesisenterprise/kami-sama/server/src/models"
	"gorm.io/gorm"
)

// MediaSourceService multiplexes the CONTENT provider behind /api/v1/source/*.
// A content provider feeds the catalog database (Plex via the dashboard, or
// the empty local source). Jellyfin is NOT a content provider: the
// media-server container only backs STREAMING, so it is wired independently
// below and never participates in library sync / import.
type MediaSourceService struct {
	db       *gorm.DB
	provider string
	jellyfin *JellyfinClient
	plex     *PlexMediaSource
	local    *LocalMediaSource
}

func NewMediaSourceService(db *gorm.DB, cfg config.MediaSourceConfig) *MediaSourceService {
	s := &MediaSourceService{
		db:       db,
		provider: cfg.Type,
	}
	// Content provider: Plex only (MEDIA_SOURCE_TYPE=plex). "jellyfin" is no
	// longer a valid content type — the catalog is fed by the other dashboard
	// sources, and the media-server only serves streams.
	if cfg.Type == "plex" && cfg.Enabled {
		if cfg.Plex.URL != "" && cfg.Plex.Token != "" {
			plexClient := NewPlexClient(PlexConfig{
				URL:              cfg.Plex.URL,
				Token:            cfg.Plex.Token,
				ClientIdentifier: cfg.Plex.ClientIdentifier,
				Product:          cfg.Plex.Product,
				Version:          cfg.Plex.Version,
				Device:           cfg.Plex.Device,
				Timeout:          cfg.Plex.Timeout,
			})
			s.plex = NewPlexMediaSource(plexClient, db)
		}
	}
	// Streaming provider (media-server): wired whenever Jellyfin credentials
	// are present, independently of the content provider selection. The watch
	// page delegates ALL playback to it (routes/discover.go).
	if cfg.Jellyfin.URL != "" && cfg.Jellyfin.APIKey != "" && cfg.Jellyfin.UserID != "" {
		s.jellyfin = NewJellyfinClient(JellyfinConfig{
			URL:             cfg.Jellyfin.URL,
			APIKey:          cfg.Jellyfin.APIKey,
			UserID:          cfg.Jellyfin.UserID,
			StrmDir:         cfg.Jellyfin.StrmDir,
			StrmLibraryName: cfg.Jellyfin.StrmLibraryName,
			StrmLibraryPath: cfg.Jellyfin.StrmLibraryPath,
		})
	}
	if s.plex == nil {
		s.local = NewLocalMediaSource(db)
	}
	return s
}

func (s *MediaSourceService) providerName() string {
	if s.plex != nil {
		return "plex"
	}
	return "local"
}

// Plex exposes the active content provider (or nil when Plex is not
// selected). Callers such as the dedicated /api/v1/integrations/plex handler
// use this to bypass the multiplexer while still keeping a single configured
// content provider.
func (s *MediaSourceService) Plex() *PlexMediaSource {
	return s.plex
}

// Jellyfin exposes the media-server (Jellyfin) STREAMING client (or nil when
// not configured). The public /watch page delegates ALL stream resolution to
// the media-server container, so discover.go resolves and proxies playback
// through this client. Jellyfin never feeds the catalog — that is the job of
// the content providers above.
func (s *MediaSourceService) Jellyfin() *JellyfinClient {
	return s.jellyfin
}

// Enabled reports whether a content provider is wired.
func (s *MediaSourceService) Enabled() bool {
	return s.plex != nil || s.local != nil
}

func (s *MediaSourceService) ListLibraries(ctx context.Context) ([]map[string]interface{}, error) {
	if s.plex != nil {
		return s.plex.ListLibraries(ctx)
	}
	return s.local.ListLibraries(ctx)
}

func (s *MediaSourceService) GetLibrary(ctx context.Context, id string) (map[string]interface{}, error) {
	if s.plex != nil {
		return s.plex.GetLibrary(ctx, id)
	}
	return s.local.GetLibrary(ctx, id)
}

func (s *MediaSourceService) ListItems(ctx context.Context, libraryID string, limit, offset int, sortBy, query string) ([]map[string]interface{}, int, error) {
	if s.plex != nil {
		return s.plex.ListItems(ctx, libraryID, limit, offset, sortBy, query)
	}
	return s.local.ListItems(ctx, libraryID, limit, offset, sortBy, query)
}

func (s *MediaSourceService) GetItem(ctx context.Context, id string) (map[string]interface{}, error) {
	if s.plex != nil {
		return s.plex.GetItem(ctx, id)
	}
	return s.local.GetItem(ctx, id)
}

func (s *MediaSourceService) SearchItems(ctx context.Context, query string, limit int) ([]map[string]interface{}, error) {
	if s.plex != nil {
		return s.plex.SearchItems(ctx, query, limit)
	}
	return s.local.SearchItems(ctx, query, limit)
}

func (s *MediaSourceService) GetStreamURL(ctx context.Context, itemID string, profile string) (string, error) {
	if s.plex != nil {
		return s.plex.GetStreamURL(ctx, itemID, profile)
	}
	return s.local.GetStreamURL(ctx, itemID, true)
}

func (s *MediaSourceService) GetPlaybackInfo(ctx context.Context, itemID string) (map[string]interface{}, error) {
	if s.plex != nil {
		return s.plex.GetPlaybackInfo(ctx, itemID)
	}
	return s.local.GetPlaybackInfo(ctx, itemID)
}

func (s *MediaSourceService) ReportPlaybackProgress(ctx context.Context, itemID string, positionTicks int64, stopped bool) error {
	if s.plex != nil {
		return s.plex.ReportPlaybackProgress(ctx, itemID, positionTicks, stopped)
	}
	return s.local.ReportPlaybackProgress(ctx, itemID, positionTicks, stopped)
}

func (s *MediaSourceService) SyncLibrary(ctx context.Context, libraryID string) (map[string]interface{}, error) {
	now := time.Now().UTC()
	log := models.SourceSyncLog{
		Common:     models.Common{ID: now.Format("20060102150405") + "-" + libraryID, CreatedAt: now, UpdatedAt: now},
		LibraryID:  libraryID,
		SourceType: s.providerName(),
		Status:     "running",
		StartedAt:  now,
	}
	s.db.Create(&log)

	var result map[string]interface{}
	var err error
	if s.plex != nil {
		result, err = s.plex.SyncLibrary(ctx, libraryID)
	} else {
		result, err = s.local.SyncLibrary(ctx, libraryID)
	}

	completedAt := time.Now().UTC()
	log.CompletedAt = &completedAt
	if err != nil {
		log.Status = "failed"
		errMsg := err.Error()
		log.ErrorMessage = &errMsg
		s.db.Save(&log)
		return nil, err
	}

	if created, ok := result["itemsCreated"].(int); ok {
		log.ItemsCreated = created
	}
	if updated, ok := result["itemsUpdated"].(int); ok {
		log.ItemsUpdated = updated
	}
	if removed, ok := result["itemsRemoved"].(int); ok {
		log.ItemsRemoved = removed
	}
	log.Status = "completed"
	s.db.Save(&log)
	return result, nil
}

func (s *MediaSourceService) GetSyncStatus(ctx context.Context, libraryID string) (map[string]interface{}, error) {
	if s.plex != nil {
		return s.plex.GetSyncStatus(ctx, libraryID)
	}
	return s.local.GetSyncStatus(ctx, libraryID)
}

func (s *MediaSourceService) ListSyncLogs(ctx context.Context, libraryID string, limit int) ([]models.SourceSyncLog, error) {
	var logs []models.SourceSyncLog
	tx := s.db.Model(&models.SourceSyncLog{})
	if libraryID != "" {
		tx = tx.Where("library_id = ?", libraryID)
	}
	if err := tx.Order("created_at DESC").Limit(limit).Find(&logs).Error; err != nil {
		return nil, err
	}
	return logs, nil
}
