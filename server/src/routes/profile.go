package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/skygenesisenterprise/kami-sama/server/src/middleware"
	"github.com/skygenesisenterprise/kami-sama/server/src/services"
	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
)

type ProfileHandler struct {
	deps Dependencies
}

func NewProfileHandler(deps Dependencies) *ProfileHandler {
	return &ProfileHandler{deps: deps}
}

func (h *ProfileHandler) List(c *gin.Context) {
	principal, ok := middleware.GetPrincipal(c)
	if !ok {
		utils.Error(c, utils.ErrUnauthorized)
		return
	}
	profiles, err := h.deps.ProfileService.ListByUser(c.Request.Context(), principal.UserID)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"profiles": profiles})
}

func (h *ProfileHandler) GetByID(c *gin.Context) {
	principal, ok := middleware.GetPrincipal(c)
	if !ok {
		utils.Error(c, utils.ErrUnauthorized)
		return
	}
	profileID := c.Param("profileId")
	profile, err := h.deps.ProfileService.GetByID(c.Request.Context(), profileID, principal.UserID)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, profile)
}

func (h *ProfileHandler) Create(c *gin.Context) {
	principal, ok := middleware.GetPrincipal(c)
	if !ok {
		utils.Error(c, utils.ErrUnauthorized)
		return
	}
	var req services.CreateProfileInput
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	profile, err := h.deps.ProfileService.Create(c.Request.Context(), principal.UserID, req)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusCreated, profile)
}

func (h *ProfileHandler) Update(c *gin.Context) {
	principal, ok := middleware.GetPrincipal(c)
	if !ok {
		utils.Error(c, utils.ErrUnauthorized)
		return
	}
	profileID := c.Param("profileId")
	var req services.ProfileUpdateInput
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	profile, err := h.deps.ProfileService.Update(c.Request.Context(), profileID, principal.UserID, req)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, profile)
}

func (h *ProfileHandler) Delete(c *gin.Context) {
	principal, ok := middleware.GetPrincipal(c)
	if !ok {
		utils.Error(c, utils.ErrUnauthorized)
		return
	}
	profileID := c.Param("profileId")
	if err := h.deps.ProfileService.Delete(c.Request.Context(), profileID, principal.UserID); err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"deleted": true})
}

func (h *ProfileHandler) Select(c *gin.Context) {
	principal, ok := middleware.GetPrincipal(c)
	if !ok {
		utils.Error(c, utils.ErrUnauthorized)
		return
	}
	profileID := c.Param("profileId")
	profile, err := h.deps.ProfileService.SelectProfile(c.Request.Context(), profileID, principal.UserID)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{
		"profile": profile,
		"token":   principal.SessionID,
	})
}

func (h *ProfileHandler) VerifyPin(c *gin.Context) {
	principal, ok := middleware.GetPrincipal(c)
	if !ok {
		utils.Error(c, utils.ErrUnauthorized)
		return
	}
	var req services.VerifyPinInput
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}

	// Verify the profile belongs to the user
	profile, err := h.deps.ProfileService.GetByID(c.Request.Context(), req.ProfileID, principal.UserID)
	if err != nil {
		utils.Error(c, err)
		return
	}

	valid, err := h.deps.ProfileService.VerifyPin(c.Request.Context(), req.ProfileID, req.PinCode)
	if err != nil {
		utils.Error(c, err)
		return
	}

	if !valid {
		utils.Error(c, utils.NewError(http.StatusUnauthorized, "INVALID_PIN", "The PIN code is incorrect.", nil))
		return
	}

	// Update last used
	_, _ = h.deps.ProfileService.SelectProfile(c.Request.Context(), req.ProfileID, principal.UserID)

	utils.Success(c, http.StatusOK, gin.H{
		"valid":   true,
		"profile": profile,
	})
}

func (h *ProfileHandler) SetPin(c *gin.Context) {
	principal, ok := middleware.GetPrincipal(c)
	if !ok {
		utils.Error(c, utils.ErrUnauthorized)
		return
	}
	profileID := c.Param("profileId")
	var req struct {
		PinCode string `json:"pinCode"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	if err := h.deps.ProfileService.SetPin(c.Request.Context(), profileID, principal.UserID, req.PinCode); err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"updated": true})
}
