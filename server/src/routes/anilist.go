package routes

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/skygenesisenterprise/kami-sama/server/src/middleware"
	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
)

func currentSeasonStr() string {
	m := time.Now().Month()
	switch {
	case m >= 1 && m <= 3:
		return "WINTER"
	case m >= 4 && m <= 6:
		return "SPRING"
	case m >= 7 && m <= 9:
		return "SUMMER"
	default:
		return "FALL"
	}
}

type AnilistHandler struct {
	deps Dependencies
}

func NewAnilistHandler(deps Dependencies) *AnilistHandler {
	return &AnilistHandler{deps: deps}
}

func (h *AnilistHandler) Search(c *gin.Context) {
	q := c.Query("q")
	if q == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	mediaType := c.DefaultQuery("type", "ANIME")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("perPage", "10"))

	result, err := h.deps.AnilistService.Search(c.Request.Context(), q, mediaType, page, perPage)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{
		"items":  result.Media,
		"total":  result.PageInfo.Total,
		"page":   result.PageInfo.CurrentPage,
		"hasNext": result.PageInfo.HasNextPage,
	})
}

func (h *AnilistHandler) GetMedia(c *gin.Context) {
	idStr := c.Param("anilistId")
	anilistID, err := strconv.Atoi(idStr)
	if err != nil || anilistID <= 0 {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}

	media, err := h.deps.AnilistService.GetMedia(c.Request.Context(), anilistID)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, media)
}

func (h *AnilistHandler) Trending(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("perPage", "20"))
	mediaType := c.DefaultQuery("type", "ANIME")

	result, err := h.deps.AnilistService.GetTrending(c.Request.Context(), mediaType, page, perPage)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{
		"items":    result.Media,
		"total":    result.PageInfo.Total,
		"page":     result.PageInfo.CurrentPage,
		"hasNext":  result.PageInfo.HasNextPage,
	})
}

func (h *AnilistHandler) Popular(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("perPage", "20"))
	mediaType := c.DefaultQuery("type", "ANIME")

	result, err := h.deps.AnilistService.GetPopular(c.Request.Context(), mediaType, page, perPage)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{
		"items":    result.Media,
		"total":    result.PageInfo.Total,
		"page":     result.PageInfo.CurrentPage,
		"hasNext":  result.PageInfo.HasNextPage,
	})
}

func (h *AnilistHandler) Seasonal(c *gin.Context) {
	season := c.DefaultQuery("season", currentSeasonStr())
	yearStr := c.DefaultQuery("year", "")
	year, _ := strconv.Atoi(yearStr)
	if year == 0 {
		year = time.Now().Year()
	}
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("perPage", "20"))

	result, err := h.deps.AnilistService.GetSeasonal(c.Request.Context(), season, year, page, perPage)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{
		"items":    result.Media,
		"total":    result.PageInfo.Total,
		"page":     result.PageInfo.CurrentPage,
		"hasNext":  result.PageInfo.HasNextPage,
	})
}

func (h *AnilistHandler) AiringSchedule(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("perPage", "20"))
	notYetAired := c.DefaultQuery("notYetAired", "true") == "true"

	schedules, pageInfo, err := h.deps.AnilistService.GetAiringSchedule(c.Request.Context(), page, perPage, notYetAired)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{
		"items":    schedules,
		"total":    pageInfo.Total,
		"page":     pageInfo.CurrentPage,
		"hasNext":  pageInfo.HasNextPage,
	})
}

func (h *AnilistHandler) GetCharacter(c *gin.Context) {
	idStr := c.Param("characterId")
	charID, err := strconv.Atoi(idStr)
	if err != nil || charID <= 0 {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}

	character, err := h.deps.AnilistService.GetCharacterDetail(c.Request.Context(), charID)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, character)
}

func (h *AnilistHandler) GetStaff(c *gin.Context) {
	idStr := c.Param("staffId")
	staffID, err := strconv.Atoi(idStr)
	if err != nil || staffID <= 0 {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}

	staff, err := h.deps.AnilistService.GetStaffDetail(c.Request.Context(), staffID)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, staff)
}

func (h *AnilistHandler) ImportMedia(c *gin.Context) {
	principal, ok := middleware.GetPrincipal(c)
	if !ok {
		utils.Error(c, utils.ErrUnauthorized)
		return
	}

	idStr := c.Param("anilistId")
	anilistID, err := strconv.Atoi(idStr)
	if err != nil || anilistID <= 0 {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}

	anime, err := h.deps.AnilistService.ImportMedia(c.Request.Context(), anilistID, principal.UserID)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{
		"anime":   anime,
		"message": "Media imported successfully from Anilist",
	})
}
