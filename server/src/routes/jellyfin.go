package routes

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/skygenesisenterprise/kami-sama/server/src/services"
	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
)

// JellyfinHandler exposes the media-server (Jellyfin) integration endpoints:
// a health probe plus the DB → Jellyfin mirror sync (the "miroir": the
// catalog rows fed by Plex are pushed into the Jellyfin library so the watch
// page delegates ALL HLS playback to it). The mirror runs in the background
// and its outcome is exposed through /sync/status.
type JellyfinHandler struct {
	deps   Dependencies
	mirror *services.JellyfinMirrorSync
}

func NewJellyfinHandler(deps Dependencies) *JellyfinHandler {
	h := &JellyfinHandler{
		deps:   deps,
		mirror: services.NewJellyfinMirrorSync(deps.Database.Gorm(), deps.Logger),
	}
	h.startScheduler()
	return h
}

// jellyfinClient resolves the configured media-server (Jellyfin) client,
// mirroring DiscoverHandler's resolution order: active media source first,
// then environment config. Shared so the integration endpoints and the
// stream resolver always talk to the same server.
func (h *JellyfinHandler) jellyfinClient(ctx context.Context) (*services.JellyfinClient, error) {
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

// startScheduler runs the mirror periodically so the Jellyfin library stays
// in sync with the catalog without manual triggers. The interval comes from
// MEDIA_SOURCE_SYNC_INTERVAL (default 1h); when it is unset the mirror is
// only triggered manually / from the dashboard. Best-effort: a failing run
// never crashes the loop, the next tick retries.
func (h *JellyfinHandler) startScheduler() {
	interval := h.deps.Config.MediaSource.Jellyfin.SyncInterval
	if interval <= 0 {
		return
	}
	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()
		for range ticker.C {
			ctx := context.Background()
			if _, err := h.jellyfinClient(ctx); err != nil {
				continue // not configured — nothing to mirror
			}
			plex, err := h.plexClient(ctx)
			if err != nil {
				continue // no content provider — nothing to bridge
			}
			jf, err := h.jellyfinClient(ctx)
			if err != nil {
				continue
			}
			h.mirror.Start(ctx, plex, jf)
		}
	}()
}

// HealthCheck probes the media-server and reports reachability + latency.
func (h *JellyfinHandler) HealthCheck(c *gin.Context) {
	jf, err := h.jellyfinClient(c.Request.Context())
	if err != nil {
		utils.Error(c, err)
		return
	}
	start := time.Now()
	info, err := jf.Health(c.Request.Context())
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{
		"reachable": true,
		"latencyMs": time.Since(start).Milliseconds(),
		"serverName": firstString(info["ServerName"]),
		"version":   firstString(info["Version"]),
	})
}

// Sync launches the DB → Jellyfin mirror (background) and returns the current
// status. The mirror walks the persisted catalog (Plex-sourced rows) and
// bridges every title — and every episode of series — into the Jellyfin
// library, so the media-server reflects the catalog and the watch page can
// delegate HLS playback to it.
func (h *JellyfinHandler) Sync(c *gin.Context) {
	plex, err := h.plexClient(c.Request.Context())
	if err != nil {
		utils.Error(c, err)
		return
	}
	jf, err := h.jellyfinClient(c.Request.Context())
	if err != nil {
		utils.Error(c, err)
		return
	}
	stats := h.mirror.Start(c.Request.Context(), plex, jf)
	utils.Success(c, http.StatusAccepted, gin.H{"started": true, "status": stats})
}

// SyncStatus returns the outcome of the last (or in-flight) mirror run.
func (h *JellyfinHandler) SyncStatus(c *gin.Context) {
	utils.Success(c, http.StatusOK, h.mirror.Status())
}

// plexClient resolves the configured content provider (Plex) client through
// the shared resolver — persisted source_configs row first, then env.
func (h *JellyfinHandler) plexClient(ctx context.Context) (*services.PlexClient, error) {
	return plexClientFromDeps(ctx, h.deps)
}

func firstString(v interface{}) string {
	if s, ok := v.(string); ok {
		return s
	}
	return ""
}
