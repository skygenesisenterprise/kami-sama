package routes

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/skygenesisenterprise/kami-sama/server/src/middleware"
	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
)

type RecommendationHandler struct {
	deps Dependencies
}

func NewRecommendationHandler(deps Dependencies) *RecommendationHandler {
	return &RecommendationHandler{deps: deps}
}

// GetRecommendations returns personalized recommendations computed from the
// authenticated user's watched content.
func (h *RecommendationHandler) GetRecommendations(c *gin.Context) {
	principal, ok := middleware.GetPrincipal(c)
	if !ok {
		utils.Error(c, utils.ErrUnauthorized)
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if limit < 1 || limit > 50 {
		limit = 20
	}

	items, err := h.deps.RecommendationService.Recommend(c.Request.Context(), principal.UserID, limit)
	if err != nil {
		utils.Error(c, err)
		return
	}

	utils.Success(c, http.StatusOK, gin.H{"items": items})
}
