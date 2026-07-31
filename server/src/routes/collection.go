package routes

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/skygenesisenterprise/kami-sama/server/src/middleware"
	"github.com/skygenesisenterprise/kami-sama/server/src/models"
	"github.com/skygenesisenterprise/kami-sama/server/src/services"
	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
)

type CollectionHandler struct {
	deps Dependencies
}

func NewCollectionHandler(deps Dependencies) *CollectionHandler {
	return &CollectionHandler{deps: deps}
}

// ──────────────────────────────────────────────────────────────
// Response DTOs – mirror apps/types/api/collections.ts
// ──────────────────────────────────────────────────────────────

type CollectionEntryResponse struct {
	AnimeID     string `json:"animeId"`
	SeriesTitle string `json:"seriesTitle"`
	Position    int    `json:"position"`
	AddedAt     string `json:"addedAt"`
}

type CollectionSourceResponse struct {
	Provider     string `json:"provider"`
	ExternalID   string `json:"externalId"`
	Status       string `json:"status"`
	LastSyncedAt string `json:"lastSyncedAt"`
}

type CollectionDiscoverResponse struct {
	Enabled  bool   `json:"enabled"`
	Order    int    `json:"order"`
	Title    string `json:"title,omitempty"`
	Subtitle string `json:"subtitle,omitempty"`
	CtaLabel string `json:"ctaLabel,omitempty"`
	Href     string `json:"href,omitempty"`
}

type CollectionResponse struct {
	ID             string                     `json:"id"`
	Slug           string                     `json:"slug"`
	Title          string                     `json:"title"`
	Description    string                     `json:"description"`
	Type           string                     `json:"type"`
	Status         string                     `json:"status"`
	Visibility     string                     `json:"visibility"`
	Tags           []string                   `json:"tags"`
	Assets         map[string]string          `json:"assets"`
	Sources        []CollectionSourceResponse `json:"sources"`
	MetadataStatus string                     `json:"metadataStatus"`
	Discover       CollectionDiscoverResponse `json:"discover"`
	Entries        []CollectionEntryResponse  `json:"entries"`
	UpdatedBy      string                     `json:"updatedBy"`
	UpdatedByID    string                     `json:"updatedById"`
	CreatedAt      time.Time                  `json:"createdAt"`
	UpdatedAt      time.Time                  `json:"updatedAt"`
}

// ──────────────────────────────────────────────────────────────
// Handlers
// ──────────────────────────────────────────────────────────────

func (h *CollectionHandler) List(c *gin.Context) {
	status := c.Query("status")
	collectionType := c.Query("type")
	visibility := c.Query("visibility")
	discoverOnly := false
	switch c.Query("discover") {
	case "true", "1":
		discoverOnly = true
	}
	items, err := h.deps.CollectionService.List(c.Request.Context(), status, collectionType, visibility, discoverOnly)
	if err != nil {
		utils.Error(c, err)
		return
	}
	response := make([]CollectionResponse, 0, len(items))
	for i := range items {
		response = append(response, collectionToResponse(&items[i]))
	}
	utils.Success(c, http.StatusOK, gin.H{"items": response})
}

func (h *CollectionHandler) GetByID(c *gin.Context) {
	id := c.Param("collectionId")
	if id == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	item, err := h.deps.CollectionService.GetByID(c.Request.Context(), id)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, collectionToResponse(item))
}

func (h *CollectionHandler) GetBySlug(c *gin.Context) {
	slug := c.Param("slug")
	if slug == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	item, err := h.deps.CollectionService.GetBySlug(c.Request.Context(), slug)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, collectionToResponse(item))
}

func (h *CollectionHandler) Create(c *gin.Context) {
	principal, ok := middleware.GetPrincipal(c)
	if !ok {
		utils.Error(c, utils.ErrUnauthorized)
		return
	}
	var req services.CollectionInput
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	item, err := h.deps.CollectionService.Create(c.Request.Context(), principal.UserID, req)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusCreated, collectionToResponse(item))
}

func (h *CollectionHandler) Update(c *gin.Context) {
	id := c.Param("collectionId")
	if id == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	principal, ok := middleware.GetPrincipal(c)
	if !ok {
		utils.Error(c, utils.ErrUnauthorized)
		return
	}
	var req services.CollectionInput
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	item, err := h.deps.CollectionService.Update(c.Request.Context(), principal.UserID, id, req)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, collectionToResponse(item))
}

func (h *CollectionHandler) Delete(c *gin.Context) {
	id := c.Param("collectionId")
	if id == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	if err := h.deps.CollectionService.Delete(c.Request.Context(), id); err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"deleted": true})
}

// ──────────────────────────────────────────────────────────────
// Mappers
// ──────────────────────────────────────────────────────────────

func collectionToResponse(c *models.Collection) CollectionResponse {
	entries := make([]CollectionEntryResponse, 0, len(c.Entries))
	for _, entry := range c.Entries {
		seriesTitle := entry.Anime.Title
		if seriesTitle == "" {
			seriesTitle = entry.AnimeID
		}
		entries = append(entries, CollectionEntryResponse{
			AnimeID:     entry.AnimeID,
			SeriesTitle: seriesTitle,
			Position:    entry.Position,
			AddedAt:     entry.CreatedAt.UTC().Format(time.RFC3339),
		})
	}
	sources := make([]CollectionSourceResponse, 0, len(c.Sources))
	for _, source := range c.Sources {
		lastSyncedAt := ""
		if source.LastSyncedAt != nil {
			lastSyncedAt = source.LastSyncedAt.UTC().Format(time.RFC3339)
		}
		sources = append(sources, CollectionSourceResponse{
			Provider:     source.Provider,
			ExternalID:   source.ExternalID,
			Status:       source.Status,
			LastSyncedAt: lastSyncedAt,
		})
	}
	updatedBy := "system"
	if c.UpdatedBy != nil && c.UpdatedBy.DisplayName != "" {
		updatedBy = c.UpdatedBy.DisplayName
	}
	return CollectionResponse{
		ID:          c.ID,
		Slug:        c.Slug,
		Title:       c.Title,
		Description: c.Description,
		Type:        c.Type,
		Status:      c.Status,
		Visibility:  c.Visibility,
		Tags:        c.Tags,
		Assets: map[string]string{
			"poster": c.PosterUrl,
			"banner": c.BannerUrl,
		},
		Sources:        sources,
		MetadataStatus: c.MetadataStatus,
		Discover: CollectionDiscoverResponse{
			Enabled:  c.DiscoverEnabled,
			Order:    c.DiscoverOrder,
			Title:    c.DiscoverTitle,
			Subtitle: c.DiscoverSubtitle,
			CtaLabel: c.DiscoverCta,
			Href:     c.DiscoverHref,
		},
		Entries:     entries,
		UpdatedBy:   updatedBy,
		UpdatedByID: c.UpdatedByID,
		CreatedAt:   c.CreatedAt,
		UpdatedAt:   c.UpdatedAt,
	}
}
