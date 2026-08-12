package routes

import (
	"context"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/skygenesisenterprise/kami-sama/server/src/services"
	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
)

type MediaSourceHandler struct {
	deps     Dependencies
	resolver *plexClientResolver
}

func NewMediaSourceHandler(deps Dependencies) *MediaSourceHandler {
	return &MediaSourceHandler{deps: deps, resolver: newPlexClientResolver(deps)}
}

// plexMediaSource returns a Plex media source backed by the shared
// plexClientResolver (persisted source_configs row → env provider → env raw
// config). The generic MediaSourceService is seeded from the env config only,
// so a Plex server configured through the UI would otherwise fall back to the
// empty local source and import nothing. Returns nil when Plex is unusable so
// callers keep the multiplexed fallback.
func (h *MediaSourceHandler) plexMediaSource(ctx context.Context) *services.PlexMediaSource {
	client, err := h.resolver.resolve(ctx)
	if err != nil || client == nil {
		return nil
	}
	return services.NewPlexMediaSource(client, h.deps.Database.Gorm())
}

func (h *MediaSourceHandler) ListLibraries(c *gin.Context) {
	ctx := c.Request.Context()
	items, err := h.deps.MediaSourceService.ListLibraries(ctx)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"items": items})
}

func (h *MediaSourceHandler) GetLibrary(c *gin.Context) {
	id := c.Param("libraryId")
	if id == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	item, err := h.deps.MediaSourceService.GetLibrary(c.Request.Context(), id)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

func (h *MediaSourceHandler) ListItems(c *gin.Context) {
	libraryID := c.Query("libraryId")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	sortBy := c.Query("sortBy")
	query := c.Query("q")
	if limit < 1 || limit > 100 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}

	items, total, err := h.deps.MediaSourceService.ListItems(c.Request.Context(), libraryID, limit, offset, sortBy, query)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"items": items, "total": total})
}

func (h *MediaSourceHandler) GetItem(c *gin.Context) {
	id := c.Param("itemId")
	if id == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	item, err := h.deps.MediaSourceService.GetItem(c.Request.Context(), id)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

func (h *MediaSourceHandler) SearchItems(c *gin.Context) {
	query := c.Query("q")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if limit < 1 || limit > 100 {
		limit = 20
	}
	if query == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}

	items, err := h.deps.MediaSourceService.SearchItems(c.Request.Context(), query, limit)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"items": items})
}

func (h *MediaSourceHandler) GetStreamURL(c *gin.Context) {
	id := c.Param("itemId")
	if id == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	profile := c.DefaultQuery("profile", "native")
	streamURL, err := h.deps.MediaSourceService.GetStreamURL(c.Request.Context(), id, profile)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"streamUrl": streamURL, "profile": profile})
}

func (h *MediaSourceHandler) GetPlaybackInfo(c *gin.Context) {
	id := c.Param("itemId")
	if id == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	info, err := h.deps.MediaSourceService.GetPlaybackInfo(c.Request.Context(), id)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, info)
}

func (h *MediaSourceHandler) ReportProgress(c *gin.Context) {
	id := c.Param("itemId")
	if id == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	var req struct {
		PositionTicks int64 `json:"positionTicks"`
		Stopped       bool  `json:"stopped"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	if err := h.deps.MediaSourceService.ReportPlaybackProgress(c.Request.Context(), id, req.PositionTicks, req.Stopped); err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"reported": true})
}

func (h *MediaSourceHandler) SyncLibrary(c *gin.Context) {
	id := c.Param("libraryId")
	if id == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	ctx := c.Request.Context()
	// Prefer a resolver-backed Plex source so library sync works when Plex is
	// configured through the UI (persisted source_configs row). The generic
	// MediaSourceService is env-seeded only and would import nothing.
	if plex := h.plexMediaSource(ctx); plex != nil {
		result, err := plex.SyncLibrary(ctx, id)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusOK, result)
		return
	}
	result, err := h.deps.MediaSourceService.SyncLibrary(ctx, id)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, result)
}

func (h *MediaSourceHandler) GetSyncStatus(c *gin.Context) {
	id := c.Param("libraryId")
	if id == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	ctx := c.Request.Context()
	if plex := h.plexMediaSource(ctx); plex != nil {
		status, err := plex.GetSyncStatus(ctx, id)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusOK, status)
		return
	}
	status, err := h.deps.MediaSourceService.GetSyncStatus(ctx, id)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, status)
}

func (h *MediaSourceHandler) ListSyncLogs(c *gin.Context) {
	libraryID := c.Query("libraryId")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if limit < 1 || limit > 100 {
		limit = 20
	}
	logs, err := h.deps.MediaSourceService.ListSyncLogs(c.Request.Context(), libraryID, limit)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"items": logs})
}
