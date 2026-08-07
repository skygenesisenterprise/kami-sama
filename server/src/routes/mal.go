package routes

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/skygenesisenterprise/kami-sama/server/src/services"
	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
)

type MalHandler struct {
	deps Dependencies
}

func NewMalHandler(deps Dependencies) *MalHandler {
	return &MalHandler{deps: deps}
}

func (h *MalHandler) GetSnapshot(c *gin.Context) {
	snapshot, err := h.deps.MalService.GetSnapshot(c.Request.Context())
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, snapshot)
}

func (h *MalHandler) GetSettings(c *gin.Context) {
	ctx := c.Request.Context()
	settings := h.deps.MalService.GetSettings(ctx)
	utils.Success(c, http.StatusOK, settings)
}

func (h *MalHandler) SaveSettings(c *gin.Context) {
	var req services.MalSettings
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	if err := h.deps.MalService.SaveSettings(c.Request.Context(), req); err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"saved": true})
}

func (h *MalHandler) TestConnection(c *gin.Context) {
	result, err := h.deps.MalService.TestConnection(c.Request.Context())
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, result)
}

func (h *MalHandler) Search(c *gin.Context) {
	q := strings.TrimSpace(c.Query("q"))
	if q == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	mediaType := c.DefaultQuery("type", "anime")
	limit := 8
	if l, err := strconv.Atoi(c.Query("limit")); err == nil && l > 0 {
		limit = l
	}
	items, err := h.deps.MalService.Search(c.Request.Context(), q, mediaType, limit)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"items": items})
}

func (h *MalHandler) RunSync(c *gin.Context) {
	var req struct {
		JobType     string `json:"jobType"`
		TriggeredBy string `json:"triggeredBy"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	if req.JobType == "" {
		req.JobType = "anime-sync"
	}
	if req.TriggeredBy == "" {
		req.TriggeredBy = "manual"
	}
	job, err := h.deps.MalService.RunSync(c.Request.Context(), req.JobType, req.TriggeredBy)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, job)
}
