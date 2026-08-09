package routes

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/skygenesisenterprise/kami-sama/server/src/middleware"
	"github.com/skygenesisenterprise/kami-sama/server/src/models"
	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
	"gorm.io/datatypes"
)

type LibraryHandler struct {
	deps Dependencies
}

func NewLibraryHandler(deps Dependencies) *LibraryHandler {
	return &LibraryHandler{deps: deps}
}

func (h *LibraryHandler) List(c *gin.Context) {
	items, err := h.deps.LibraryService.List(c.Request.Context())
	if err != nil {
		utils.Error(c, err)
		return
	}
	out := make([]gin.H, 0, len(items))
	for _, item := range items {
		out = append(out, sanitizeSourceConfigForBrowser(&item))
	}
	utils.Success(c, http.StatusOK, gin.H{"items": out})
}

func (h *LibraryHandler) GetByID(c *gin.Context) {
	id := c.Param("libraryId")
	if id == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	item, err := h.deps.LibraryService.GetByID(c.Request.Context(), id)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, sanitizeSourceConfigForBrowser(item))
}

func (h *LibraryHandler) Create(c *gin.Context) {
	principal, ok := middleware.GetPrincipal(c)
	if !ok {
		utils.Error(c, utils.ErrUnauthorized)
		return
	}
	var req struct {
		SourceType string      `json:"sourceType"`
		Enabled    bool        `json:"enabled"`
		Config     interface{} `json:"config"`
	}
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	var configJSON datatypes.JSON
	if req.Config != nil {
		b, err := json.Marshal(req.Config)
		if err != nil {
			utils.Error(c, utils.ErrValidationFailed)
			return
		}
		configJSON = b
	}
	item, err := h.deps.LibraryService.Create(c.Request.Context(), principal.UserID, req.SourceType, req.Enabled, configJSON)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusCreated, sanitizeSourceConfigForBrowser(item))
}

func (h *LibraryHandler) Update(c *gin.Context) {
	id := c.Param("libraryId")
	if id == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	principal, ok := middleware.GetPrincipal(c)
	if !ok {
		utils.Error(c, utils.ErrUnauthorized)
		return
	}
	var req struct {
		SourceType *string     `json:"sourceType"`
		Enabled    *bool       `json:"enabled"`
		Config     interface{} `json:"config"`
	}
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	var configJSON datatypes.JSON
	if req.Config != nil {
		b, err := json.Marshal(req.Config)
		if err != nil {
			utils.Error(c, utils.ErrValidationFailed)
			return
		}
		configJSON = b
	}
	type updateReq struct {
		SourceType *string        `json:"sourceType"`
		Enabled    *bool          `json:"enabled"`
		Config     datatypes.JSON `json:"config"`
	}
	ur := updateReq{
		SourceType: req.SourceType,
		Enabled:    req.Enabled,
		Config:     configJSON,
	}
	item, err := h.deps.LibraryService.Update(c.Request.Context(), principal.UserID, id, ur)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, sanitizeSourceConfigForBrowser(item))
}

func (h *LibraryHandler) Delete(c *gin.Context) {
	id := c.Param("libraryId")
	if id == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	if err := h.deps.LibraryService.Delete(c.Request.Context(), id); err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"deleted": true})
}

// sanitizeSourceConfigForBrowser strips credentials out of a SourceConfig
// before it is returned to the front-end. For the plex source the token must
// never leave the server; other sources keep their config unchanged.
func sanitizeSourceConfigForBrowser(item *models.SourceConfig) gin.H {
	if item == nil {
		return nil
	}
	out := gin.H{
		"id":         item.ID,
		"sourceType": item.SourceType,
		"enabled":    item.Enabled,
		"config":     sanitizeConfig(item),
		"createdAt":  item.CreatedAt,
		"updatedAt":  item.UpdatedAt,
	}
	if item.LastSyncAt != nil {
		out["lastSyncAt"] = item.LastSyncAt
	}
	return out
}

func sanitizeConfig(item *models.SourceConfig) map[string]interface{} {
	var m map[string]interface{}
	if err := json.Unmarshal(item.Config, &m); err != nil {
		return map[string]interface{}{}
	}
	if item.SourceType == "plex" {
		delete(m, "token")
		delete(m, "authToken")
		delete(m, "accountToken")
	}
	return m
}
