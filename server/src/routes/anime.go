package routes

import (
	"context"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/skygenesisenterprise/kami-sama/server/src/interfaces"
	"github.com/skygenesisenterprise/kami-sama/server/src/middleware"
	"github.com/skygenesisenterprise/kami-sama/server/src/services"
	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
)

type AnimeHandler struct {
	deps Dependencies
}

func NewAnimeHandler(deps Dependencies) *AnimeHandler {
	return &AnimeHandler{deps: deps}
}

func (h *AnimeHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 1000 {
		limit = 20
	}

	opts := interfaces.ListAnimeOpts{
		Page:  page,
		Limit: limit,
		Query: strings.TrimSpace(c.Query("q")),
		Sort:  strings.TrimSpace(c.DefaultQuery("sort", "created_at")),

	}
	if status := strings.TrimSpace(c.Query("status")); status != "" {
		opts.Status = status
	}
	if studio := strings.TrimSpace(c.Query("studio")); studio != "" {
		opts.Studio = studio
	}
	if yearStr := c.Query("year"); yearStr != "" {
		if y, err := strconv.Atoi(yearStr); err == nil {
			opts.Year = y
		}
	}
	if season := strings.TrimSpace(c.Query("season")); season != "" {
		opts.Season = season
	}
	if genres := c.QueryArray("genre"); len(genres) > 0 {
		opts.Genres = genres
	}
	if c.Query("featured") == "true" {
		v := true
		opts.Featured = &v
	}
	if c.Query("trending") == "true" {
		v := true
		opts.Trending = &v
	}

	items, total, err := h.deps.AnimeService.List(c.Request.Context(), opts)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"items": items, "total": total})
}

func (h *AnimeHandler) GetByID(c *gin.Context) {
	id := c.Param("animeId")
	if id == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	item, err := h.deps.AnimeService.GetByID(c.Request.Context(), id)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

func (h *AnimeHandler) GetBySlug(c *gin.Context) {
	slug := c.Param("slug")
	if slug == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	item, err := h.deps.AnimeService.GetBySlug(c.Request.Context(), slug)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

func (h *AnimeHandler) Create(c *gin.Context) {
	principal, ok := middleware.GetPrincipal(c)
	if !ok {
		utils.Error(c, utils.ErrUnauthorized)
		return
	}
	var req struct {
		Title          string               `json:"title"`
		JapaneseTitle  string               `json:"japaneseTitle"`
		Synopsis       string               `json:"synopsis"`
		CoverImageUrl  string               `json:"coverImageUrl"`
		BannerImageUrl string               `json:"bannerImageUrl"`
		TrailerUrl     string               `json:"trailerUrl"`
		Status         string               `json:"status"`
		Rating         float64              `json:"rating"`
		TotalEpisodes  int                  `json:"totalEpisodes"`
		ReleaseYear    int                  `json:"releaseYear"`
		Season         string               `json:"season"`
		Source         string               `json:"source"`
		AgeRating      string               `json:"ageRating"`
		AiringStatus   string               `json:"airingStatus"`
		ExternalIDs    map[string]string    `json:"externalIds"`
		Sources        []services.AnimeSourceRef `json:"sources"`
		GenreIDs       []string             `json:"genreIds"`
		StudioIDs      []string             `json:"studioIds"`
	}
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	item, err := h.deps.AnimeService.Create(c.Request.Context(), principal.UserID, services.CreateAnimeInput{
		Title:          req.Title,
		JapaneseTitle:  req.JapaneseTitle,
		Synopsis:       req.Synopsis,
		CoverImageUrl:  req.CoverImageUrl,
		BannerImageUrl: req.BannerImageUrl,
		TrailerUrl:     req.TrailerUrl,
		Status:         req.Status,
		Rating:         req.Rating,
		TotalEpisodes:  req.TotalEpisodes,
		ReleaseYear:    req.ReleaseYear,
		Season:         req.Season,
		Source:         req.Source,
		AgeRating:      req.AgeRating,
		AiringStatus:   req.AiringStatus,
		ExternalIDs:    req.ExternalIDs,
		Sources:        req.Sources,
		GenreIDs:       req.GenreIDs,
		StudioIDs:      req.StudioIDs,
	})
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusCreated, item)
}

func (h *AnimeHandler) Update(c *gin.Context) {
	id := c.Param("animeId")
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
		Title          *string             `json:"title"`
		JapaneseTitle  *string             `json:"japaneseTitle"`
		Synopsis       *string             `json:"synopsis"`
		CoverImageUrl  *string             `json:"coverImageUrl"`
		BannerImageUrl *string             `json:"bannerImageUrl"`
		TrailerUrl     *string             `json:"trailerUrl"`
		Status         *string             `json:"status"`
		Rating         *float64            `json:"rating"`
		TotalEpisodes  *int                `json:"totalEpisodes"`
		ReleaseYear    *int                `json:"releaseYear"`
		Season         *string             `json:"season"`
		Source         *string             `json:"source"`
		AgeRating      *string             `json:"ageRating"`
		IsFeatured     *bool               `json:"isFeatured"`
		IsTrending     *bool               `json:"isTrending"`
		AiringStatus   *string             `json:"airingStatus"`
		ExternalIDs    *map[string]string  `json:"externalIds"`
		Sources        *[]services.AnimeSourceRef `json:"sources"`
		GenreIDs       []string            `json:"genreIds"`
		StudioIDs      []string            `json:"studioIds"`
	}
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	item, err := h.deps.AnimeService.Update(c.Request.Context(), principal.UserID, id, req)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

func (h *AnimeHandler) Delete(c *gin.Context) {
	id := c.Param("animeId")
	if id == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	if err := h.deps.AnimeService.Delete(c.Request.Context(), id); err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"deleted": true})
}

// plexClient resolves the configured Plex client (see plexClientFromDeps),
// shared with the stream resolver so the admin sync uses the same client.
func (h *AnimeHandler) plexClient(ctx context.Context) (*services.PlexClient, error) {
	return plexClientFromDeps(ctx, h.deps)
}

func (h *AnimeHandler) Sync(c *gin.Context) {
	id := c.Param("animeId")
	if id == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	item, err := h.deps.AnimeService.GetByID(c.Request.Context(), id)
	if err != nil {
		utils.Error(c, err)
		return
	}
	// Always try to enrich with seasons/episodes from AniList — except for
	// Plex-sourced rows, whose real season/episode grid lives on the provider
	// and is imported below. AniList's title-search fallback would otherwise
	// stamp placeholder episodes onto Plex rows.
	if h.deps.AnilistService != nil {
		principal, _ := middleware.GetPrincipal(c)
		h.deps.AnilistService.RefreshFromAnilist(c.Request.Context(), item, principal.UserID)
		if item.Source != "plex" {
			h.deps.AnilistService.EnsureSeasonsAndEpisodes(c.Request.Context(), item, nil)
		}
	}
	// Plex-sourced rows carry their REAL episode grid only on the provider:
	// refresh it from Plex (metadata.sourceId) so series imported before the
	// episode importer existed get their episodes backfilled on sync. AniList
	// cannot fill those — it is metadata-only for most Plex titles.
	if item.Source == "plex" {
		if showKey := providerSourceIDFromMetadata(item); showKey != "" {
			if client, cerr := h.plexClient(c.Request.Context()); cerr == nil {
				if db := h.deps.Database.Gorm(); db != nil {
					ctx := c.Request.Context()
					n, ierr := services.ImportPlexShowEpisodes(ctx, db, client, item.ID, showKey)
					if ierr == nil && n > 0 {
						h.deps.Logger.Info("imported plex episodes during sync", "animeId", item.ID, "episodes", n)
					} else if ierr != nil {
						h.deps.Logger.Warn("plex episode import failed during sync", "animeId", item.ID, "error", ierr)
					}
				}
			}
		}
	}
	// Reload from DB to get updated data
	item, err = h.deps.AnimeService.GetByID(c.Request.Context(), id)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}
