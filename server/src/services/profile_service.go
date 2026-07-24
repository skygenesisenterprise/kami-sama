package services

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"strings"
	"time"

	"github.com/skygenesisenterprise/kami-sama/server/src/interfaces"
	"github.com/skygenesisenterprise/kami-sama/server/src/models"
	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
	"gorm.io/gorm"
)

type ProfileService struct {
	db    interfaces.Database
	repos *Repositories
}

func NewProfileService(db interfaces.Database, repos *Repositories) *ProfileService {
	return &ProfileService{
		db:    db,
		repos: repos,
	}
}

// ProfileDTO is the public representation of a profile (without PIN hash)
type ProfileDTO struct {
	ID          string  `json:"id"`
	UserID      string  `json:"userId"`
	DisplayName string  `json:"displayName"`
	AvatarURL   *string `json:"avatarUrl,omitempty"`
	PinEnabled  bool    `json:"pinEnabled"`
	IsDefault   bool    `json:"isDefault"`
	SortOrder   int     `json:"sortOrder"`
	LastUsedAt  *string `json:"lastUsedAt,omitempty"`
	CreatedAt   string  `json:"createdAt"`
	UpdatedAt   string  `json:"updatedAt"`
}

type CreateProfileInput struct {
	DisplayName string  `json:"displayName"`
	AvatarURL   *string `json:"avatarUrl,omitempty"`
	PinCode     *string `json:"pinCode,omitempty"`
	IsDefault   *bool   `json:"isDefault,omitempty"`
}

type ProfileUpdateInput struct {
	DisplayName *string `json:"displayName,omitempty"`
	AvatarURL   *string `json:"avatarUrl,omitempty"`
	PinCode     *string `json:"pinCode,omitempty"`
	IsDefault   *bool   `json:"isDefault,omitempty"`
	SortOrder   *int    `json:"sortOrder,omitempty"`
}

type VerifyPinInput struct {
	ProfileID string `json:"profileId"`
	PinCode   string `json:"pinCode"`
}

func (s *ProfileService) ListByUser(ctx context.Context, userID string) ([]ProfileDTO, error) {
	profiles, err := s.repos.Profiles().GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	dtos := make([]ProfileDTO, 0, len(profiles))
	for _, p := range profiles {
		dtos = append(dtos, s.toDTO(&p))
	}
	return dtos, nil
}

func (s *ProfileService) GetByID(ctx context.Context, profileID, userID string) (*ProfileDTO, error) {
	profile, err := s.repos.Profiles().GetByID(ctx, profileID)
	if err != nil {
		return nil, err
	}
	if profile.UserID != userID {
		return nil, utils.NewError(http.StatusForbidden, "FORBIDDEN", "You do not have access to this profile.", nil)
	}
	dto := s.toDTO(profile)
	return &dto, nil
}

func (s *ProfileService) Create(ctx context.Context, userID string, input CreateProfileInput) (*ProfileDTO, error) {
	displayName := strings.TrimSpace(input.DisplayName)
	if displayName == "" {
		return nil, utils.NewError(http.StatusBadRequest, "VALIDATION_ERROR", "Display name is required.", nil)
	}
	if len(displayName) < 2 {
		return nil, utils.NewError(http.StatusBadRequest, "VALIDATION_ERROR", "Display name must be at least 2 characters.", nil)
	}

	existing, err := s.repos.Profiles().GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if len(existing) >= 10 {
		return nil, utils.NewError(http.StatusBadRequest, "MAX_PROFILES", "Maximum of 10 profiles per user.", nil)
	}

	now := time.Now().UTC()
	sortOrder := len(existing)
	var pinHash *string
	if input.PinCode != nil && *input.PinCode != "" {
		h := hashPin(*input.PinCode)
		pinHash = &h
	}

	isDefault := len(existing) == 0
	if input.IsDefault != nil {
		isDefault = *input.IsDefault
	}

	profile := &models.Profile{
		Common:      models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
		UserID:      userID,
		DisplayName: displayName,
		AvatarURL:   input.AvatarURL,
		PinCode:     pinHash,
		PinEnabled:  pinHash != nil,
		IsDefault:   isDefault,
		SortOrder:   sortOrder,
	}

	err = s.db.Transaction(ctx, func(tx *gorm.DB) error {
		txRepos := s.repos.WithDB(tx)
		if err := txRepos.Profiles().Create(ctx, profile); err != nil {
			return err
		}
		if isDefault {
			if err := txRepos.Profiles().ClearOtherDefaults(ctx, userID, profile.ID); err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		return nil, err
	}

	dto := s.toDTO(profile)
	return &dto, nil
}

func (s *ProfileService) Update(ctx context.Context, profileID, userID string, input ProfileUpdateInput) (*ProfileDTO, error) {
	profile, err := s.repos.Profiles().GetByID(ctx, profileID)
	if err != nil {
		return nil, err
	}
	if profile.UserID != userID {
		return nil, utils.NewError(http.StatusForbidden, "FORBIDDEN", "You do not have access to this profile.", nil)
	}

	if input.DisplayName != nil {
		name := strings.TrimSpace(*input.DisplayName)
		if name == "" || len(name) < 2 {
			return nil, utils.NewError(http.StatusBadRequest, "VALIDATION_ERROR", "Display name must be at least 2 characters.", nil)
		}
		profile.DisplayName = name
	}

	if input.AvatarURL != nil {
		profile.AvatarURL = input.AvatarURL
	}

	if input.PinCode != nil {
		if *input.PinCode == "" {
			profile.PinCode = nil
			profile.PinEnabled = false
		} else {
			h := hashPin(*input.PinCode)
			profile.PinCode = &h
			profile.PinEnabled = true
		}
	}

	if input.IsDefault != nil {
		profile.IsDefault = *input.IsDefault
	}

	if input.SortOrder != nil {
		profile.SortOrder = *input.SortOrder
	}

	profile.UpdatedAt = time.Now().UTC()

	err = s.db.Transaction(ctx, func(tx *gorm.DB) error {
		txRepos := s.repos.WithDB(tx)
		if err := txRepos.Profiles().Update(ctx, profile); err != nil {
			return err
		}
		if profile.IsDefault {
			if err := txRepos.Profiles().ClearOtherDefaults(ctx, userID, profile.ID); err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		return nil, err
	}

	dto := s.toDTO(profile)
	return &dto, nil
}

func (s *ProfileService) Delete(ctx context.Context, profileID, userID string) error {
	profile, err := s.repos.Profiles().GetByID(ctx, profileID)
	if err != nil {
		return err
	}
	if profile.UserID != userID {
		return utils.NewError(http.StatusForbidden, "FORBIDDEN", "You do not have access to this profile.", nil)
	}

	existing, err := s.repos.Profiles().GetByUserID(ctx, userID)
	if err != nil {
		return err
	}
	if len(existing) <= 1 {
		return utils.NewError(http.StatusBadRequest, "LAST_PROFILE", "Cannot delete the last profile.", nil)
	}

	return s.repos.Profiles().Delete(ctx, profileID)
}

func (s *ProfileService) SelectProfile(ctx context.Context, profileID, userID string) (*ProfileDTO, error) {
	profile, err := s.repos.Profiles().GetByID(ctx, profileID)
	if err != nil {
		return nil, err
	}
	if profile.UserID != userID {
		return nil, utils.NewError(http.StatusForbidden, "FORBIDDEN", "You do not have access to this profile.", nil)
	}

	now := time.Now().UTC()
	if err := s.repos.Profiles().SetLastUsed(ctx, profileID, now); err != nil {
		return nil, err
	}

	dto := s.toDTO(profile)
	lastUsed := now.Format(time.RFC3339)
	dto.LastUsedAt = &lastUsed
	return &dto, nil
}

func (s *ProfileService) VerifyPin(ctx context.Context, profileID, pinCode string) (bool, error) {
	profile, err := s.repos.Profiles().GetByID(ctx, profileID)
	if err != nil {
		return false, err
	}

	if !profile.PinEnabled || profile.PinCode == nil {
		return true, nil
	}

	if pinCode == "" {
		return false, nil
	}

	hash := hashPin(pinCode)
	return hash == *profile.PinCode, nil
}

func (s *ProfileService) SetPin(ctx context.Context, profileID, userID, pinCode string) error {
	profile, err := s.repos.Profiles().GetByID(ctx, profileID)
	if err != nil {
		return err
	}
	if profile.UserID != userID {
		return utils.NewError(http.StatusForbidden, "FORBIDDEN", "You do not have access to this profile.", nil)
	}

	if pinCode == "" {
		profile.PinCode = nil
		profile.PinEnabled = false
	} else {
		if len(pinCode) < 4 || len(pinCode) > 6 {
			return utils.NewError(http.StatusBadRequest, "VALIDATION_ERROR", "PIN must be between 4 and 6 characters.", nil)
		}
		h := hashPin(pinCode)
		profile.PinCode = &h
		profile.PinEnabled = true
	}
	profile.UpdatedAt = time.Now().UTC()

	return s.repos.Profiles().Update(ctx, profile)
}

// EnsureDefaultProfile creates a default profile for a user during onboarding
func (s *ProfileService) EnsureDefaultProfile(ctx context.Context, userID, displayName string) (*ProfileDTO, error) {
	profiles, err := s.repos.Profiles().GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if len(profiles) > 0 {
		dto := s.toDTO(&profiles[0])
		return &dto, nil
	}

	return s.Create(ctx, userID, CreateProfileInput{
		DisplayName: displayName,
		IsDefault:   boolPtr(true),
	})
}

func (s *ProfileService) toDTO(p *models.Profile) ProfileDTO {
	dto := ProfileDTO{
		ID:          p.ID,
		UserID:      p.UserID,
		DisplayName: p.DisplayName,
		AvatarURL:   p.AvatarURL,
		PinEnabled:  p.PinEnabled,
		IsDefault:   p.IsDefault,
		SortOrder:   p.SortOrder,
		CreatedAt:   p.CreatedAt.Format(time.RFC3339),
		UpdatedAt:   p.UpdatedAt.Format(time.RFC3339),
	}
	if p.LastUsedAt != nil {
		lastUsed := p.LastUsedAt.Format(time.RFC3339)
		dto.LastUsedAt = &lastUsed
	}
	return dto
}

func hashPin(pin string) string {
	sum := sha256.Sum256([]byte(pin))
	return hex.EncodeToString(sum[:])
}

func boolPtr(b bool) *bool {
	return &b
}
