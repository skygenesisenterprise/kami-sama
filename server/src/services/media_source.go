package services

import (
	"context"
	"encoding/json"
	"time"

	"github.com/skygenesisenterprise/kami-sama/server/src/config"
	"github.com/skygenesisenterprise/kami-sama/server/src/models"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

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
	switch {
	case cfg.Type == "jellyfin" && cfg.Enabled:
		s.jellyfin = NewJellyfinClient(JellyfinConfig{
			URL:    cfg.Jellyfin.URL,
			APIKey: cfg.Jellyfin.APIKey,
			UserID: cfg.Jellyfin.UserID,
		})
	case cfg.Type == "plex" && cfg.Enabled:
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
	if s.jellyfin == nil && s.plex == nil {
		s.local = NewLocalMediaSource(db)
	}
	return s
}

func (s *MediaSourceService) providerName() string {
	if s.plex != nil {
		return "plex"
	}
	if s.jellyfin != nil {
		return "jellyfin"
	}
	return "local"
}

// Plex exposes the active Plex provider (or nil when Plex is not selected).
// Callers such as the dedicated /api/v1/integrations/plex handler use this
// to bypass the multiplexer while still keeping a single configured provider.
func (s *MediaSourceService) Plex() *PlexMediaSource {
	return s.plex
}

// Enabled reports whether the active provider is fully wired.
func (s *MediaSourceService) Enabled() bool {
	return s.plex != nil || s.jellyfin != nil
}

func (s *MediaSourceService) ListLibraries(ctx context.Context) ([]map[string]interface{}, error) {
	if s.plex != nil {
		return s.plex.ListLibraries(ctx)
	}
	if s.jellyfin != nil {
		return s.jellyfin.ListLibraries(ctx)
	}
	return s.local.ListLibraries(ctx)
}

func (s *MediaSourceService) GetLibrary(ctx context.Context, id string) (map[string]interface{}, error) {
	if s.plex != nil {
		return s.plex.GetLibrary(ctx, id)
	}
	if s.jellyfin != nil {
		return s.jellyfin.GetLibrary(ctx, id)
	}
	return s.local.GetLibrary(ctx, id)
}

func (s *MediaSourceService) ListItems(ctx context.Context, libraryID string, limit, offset int, sortBy, query string) ([]map[string]interface{}, int, error) {
	if s.plex != nil {
		return s.plex.ListItems(ctx, libraryID, limit, offset, sortBy, query)
	}
	if s.jellyfin != nil {
		return s.jellyfin.ListItems(ctx, libraryID, limit, offset, sortBy, query)
	}
	return s.local.ListItems(ctx, libraryID, limit, offset, sortBy, query)
}

func (s *MediaSourceService) GetItem(ctx context.Context, id string) (map[string]interface{}, error) {
	if s.plex != nil {
		return s.plex.GetItem(ctx, id)
	}
	if s.jellyfin != nil {
		return s.jellyfin.GetItem(ctx, id)
	}
	return s.local.GetItem(ctx, id)
}

func (s *MediaSourceService) SearchItems(ctx context.Context, query string, limit int) ([]map[string]interface{}, error) {
	if s.plex != nil {
		return s.plex.SearchItems(ctx, query, limit)
	}
	if s.jellyfin != nil {
		return s.jellyfin.SearchItems(ctx, query, limit)
	}
	return s.local.SearchItems(ctx, query, limit)
}

func (s *MediaSourceService) GetStreamURL(ctx context.Context, itemID string, profile string) (string, error) {
	if s.plex != nil {
		return s.plex.GetStreamURL(ctx, itemID, profile)
	}
	if s.jellyfin != nil {
		// Jellyfin's GetStreamURL still takes a boolean; "static" is what
		// every client of this multiplexer historically forwarded so we
		// keep that contract intact while the active provider bridges
		// through the Plex profile string elsewhere.
		_ = profile
		return s.jellyfin.GetStreamURL(ctx, itemID, true)
	}
	return s.local.GetStreamURL(ctx, itemID, true)
}

func (s *MediaSourceService) GetPlaybackInfo(ctx context.Context, itemID string) (map[string]interface{}, error) {
	if s.plex != nil {
		return s.plex.GetPlaybackInfo(ctx, itemID)
	}
	if s.jellyfin != nil {
		return s.jellyfin.GetPlaybackInfo(ctx, itemID)
	}
	return s.local.GetPlaybackInfo(ctx, itemID)
}

func (s *MediaSourceService) ReportPlaybackProgress(ctx context.Context, itemID string, positionTicks int64, stopped bool) error {
	if s.plex != nil {
		return s.plex.ReportPlaybackProgress(ctx, itemID, positionTicks, stopped)
	}
	if s.jellyfin != nil {
		return s.jellyfin.ReportPlaybackProgress(ctx, itemID, positionTicks, stopped)
	}
	return s.local.ReportPlaybackProgress(ctx, itemID, positionTicks, stopped)
}

func (s *MediaSourceService) SyncLibrary(ctx context.Context, libraryID string) (map[string]interface{}, error) {
	now := time.Now().UTC()
	log := models.SourceSyncLog{
		Common:      models.Common{ID: now.Format("20060102150405") + "-" + libraryID, CreatedAt: now, UpdatedAt: now},
		LibraryID:   libraryID,
		SourceType:  s.providerName(),
		Status:      "running",
		StartedAt:   now,
	}
	s.db.Create(&log)

	var result map[string]interface{}
	var err error
	if s.plex != nil {
		result, err = s.plex.SyncLibrary(ctx, libraryID)
	} else if s.jellyfin != nil {
		result, err = s.syncJellyfinLibrary(ctx, libraryID)
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

func (s *MediaSourceService) syncJellyfinLibrary(ctx context.Context, libraryID string) (map[string]interface{}, error) {
	items, total, err := s.jellyfin.ListItems(ctx, libraryID, 100, 0, "SortName", "")
	if err != nil {
		return nil, err
	}

	created, updated := 0, 0
	for _, item := range items {
		sourceID, _ := item["sourceId"].(string)
		if sourceID == "" {
			continue
		}

		rawMeta, _ := json.Marshal(item)
		existing := models.Anime{}
		result := s.db.Where("source = ? AND metadata->>'sourceId' = ?", "jellyfin", sourceID).First(&existing)
		if result.Error == gorm.ErrRecordNotFound {
			anime := models.Anime{
				Common:         models.Common{ID: sourceID, CreatedAt: time.Now().UTC(), UpdatedAt: time.Now().UTC()},
				Slug:           uniqueSlug(ctx, s.db, generateSlug(item["name"].(string))),
				Title:          item["name"].(string),
				JapaneseTitle:  getString(item, "originalTitle"),
				Synopsis:       getString(item, "overview"),
				CoverImageUrl:  "",
				Status:         "released",
				Rating:         getFloat64(item, "rating"),
				ReleaseYear:    getInt(item, "year"),
				Source:         "jellyfin",
				Metadata:       datatypes.JSON(rawMeta),
			}
			s.db.Create(&anime)
			created++
		} else if result.Error == nil {
			existing.Title = item["name"].(string)
			existing.UpdatedAt = time.Now().UTC()
			existing.Metadata = datatypes.JSON(rawMeta)
			s.db.Save(&existing)
			updated++
		}
	}

	return map[string]interface{}{
		"libraryId":    libraryID,
		"itemsCreated": created,
		"itemsUpdated": updated,
		"itemsRemoved": 0,
		"totalItems":   total,
		"startedAt":    time.Now().UTC(),
		"completedAt":  time.Now().UTC(),
	}, nil
}

func (s *MediaSourceService) GetSyncStatus(ctx context.Context, libraryID string) (map[string]interface{}, error) {
	if s.plex != nil {
		return s.plex.GetSyncStatus(ctx, libraryID)
	}
	if s.jellyfin != nil {
		var log models.SourceSyncLog
		s.db.Where("library_id = ?", libraryID).Order("created_at DESC").First(&log)
		return map[string]interface{}{
			"libraryId":  libraryID,
			"lastSyncAt": log.CompletedAt,
			"status":     log.Status,
			"itemCount":  log.ItemsCreated + log.ItemsUpdated,
		}, nil
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

func getString(m map[string]interface{}, key string) string {
	if v, ok := m[key].(string); ok {
		return v
	}
	return ""
}

func getFloat64(m map[string]interface{}, key string) float64 {
	if v, ok := m[key].(float64); ok {
		return v
	}
	return 0
}

func getInt(m map[string]interface{}, key string) int {
	if v, ok := m[key].(int); ok {
		return v
	}
	return 0
}
