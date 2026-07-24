package routes

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
)

type MediaSourceHandler struct {
	deps Dependencies
}

func NewMediaSourceHandler(deps Dependencies) *MediaSourceHandler {
	return &MediaSourceHandler{deps: deps}
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
	result, err := h.deps.MediaSourceService.SyncLibrary(c.Request.Context(), id)
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
	status, err := h.deps.MediaSourceService.GetSyncStatus(c.Request.Context(), id)
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
