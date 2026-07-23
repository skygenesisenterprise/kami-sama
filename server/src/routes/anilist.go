package routes

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/skygenesisenterprise/kami-sama/server/src/middleware"
	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
)

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
