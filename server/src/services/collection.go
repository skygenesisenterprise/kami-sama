package services

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/skygenesisenterprise/kami-sama/server/src/models"
	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
	"gorm.io/gorm"
)

type CollectionDiscoverInput struct {
	Enabled  *bool   `json:"enabled"`
	Order    *int    `json:"order"`
	Title    *string `json:"title"`
	Subtitle *string `json:"subtitle"`
	CtaLabel *string `json:"ctaLabel"`
	Href     *string `json:"href"`
}

type CollectionInput struct {
	Title       *string                  `json:"title"`
	Slug        *string                  `json:"slug"`
	Description *string                  `json:"description"`
	Type        *string                  `json:"type"`
	Status      *string                  `json:"status"`
	Visibility  *string                  `json:"visibility"`
	PosterUrl   *string                  `json:"posterUrl"`
	BannerUrl   *string                  `json:"bannerUrl"`
	Tags        *[]string                `json:"tags"`
	EntryIDs    *[]string                `json:"entryIds"`
	Discover    *CollectionDiscoverInput `json:"discover"`
}

type CollectionService struct {
	db *gorm.DB
}

func NewCollectionService(db *gorm.DB) *CollectionService {
	return &CollectionService{db: db}
}

func (s *CollectionService) Create(ctx context.Context, userID string, input CollectionInput) (*models.Collection, error) {
	title := strings.TrimSpace(coalescePtr(input.Title, ""))
	if title == "" {
		return nil, utils.ErrValidationFailed
	}
	slug := strings.TrimSpace(coalescePtr(input.Slug, ""))
	if slug == "" {
		slug = generateSlug(title)
	}
	now := time.Now().UTC()
	collection := &models.Collection{
		Common:      models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
		Slug:        slug,
		Title:       title,
		Description: coalescePtr(input.Description, ""),
		Type:        coalescePtr(input.Type, "editorial"),
		Status:      coalescePtr(input.Status, "Draft"),
		Visibility:  coalescePtr(input.Visibility, "private"),
		PosterUrl:   coalescePtr(input.PosterUrl, ""),
		BannerUrl:   coalescePtr(input.BannerUrl, ""),
		Tags:        []string{},
		UpdatedByID: userID,
	}
	if input.Tags != nil {
		collection.Tags = *input.Tags
	}
	if input.Discover != nil {
		applyDiscoverInput(collection, input.Discover)
	}
	if err := s.db.WithContext(ctx).Create(collection).Error; err != nil {
		return nil, err
	}
	if input.EntryIDs != nil {
		if err := s.replaceEntries(ctx, collection.ID, *input.EntryIDs, now); err != nil {
			return nil, err
		}
	}
	return s.GetByID(ctx, collection.ID)
}

func (s *CollectionService) Update(ctx context.Context, userID, id string, input CollectionInput) (*models.Collection, error) {
	collection, err := s.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if input.Title != nil {
		collection.Title = *input.Title
	}
	if input.Slug != nil {
		collection.Slug = *input.Slug
	}
	if input.Description != nil {
		collection.Description = *input.Description
	}
	if input.Type != nil {
		collection.Type = *input.Type
	}
	if input.Status != nil {
		collection.Status = *input.Status
	}
	if input.Visibility != nil {
		collection.Visibility = *input.Visibility
	}
	if input.PosterUrl != nil {
		collection.PosterUrl = *input.PosterUrl
	}
	if input.BannerUrl != nil {
		collection.BannerUrl = *input.BannerUrl
	}
	if input.Tags != nil {
		collection.Tags = *input.Tags
	}
	if input.Discover != nil {
		applyDiscoverInput(collection, input.Discover)
	}
	collection.UpdatedByID = userID
	collection.UpdatedAt = time.Now().UTC()
	if err := s.db.WithContext(ctx).Omit("Entries", "Sources", "UpdatedBy").Save(collection).Error; err != nil {
		return nil, err
	}
	if input.EntryIDs != nil {
		if err := s.replaceEntries(ctx, collection.ID, *input.EntryIDs, time.Now().UTC()); err != nil {
			return nil, err
		}
	}
	return s.GetByID(ctx, collection.ID)
}

func (s *CollectionService) Delete(ctx context.Context, id string) error {
	collection, err := s.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if err := s.db.WithContext(ctx).Where("collection_id = ?", id).Delete(&models.CollectionEntry{}).Error; err != nil {
		return err
	}
	if err := s.db.WithContext(ctx).Where("collection_id = ?", id).Delete(&models.CollectionSource{}).Error; err != nil {
		return err
	}
	return s.db.WithContext(ctx).Delete(&models.Collection{}, "id = ?", collection.ID).Error
}

func (s *CollectionService) List(ctx context.Context, status, collectionType, visibility string, discoverOnly bool) ([]models.Collection, error) {
	q := s.db.WithContext(ctx).Model(&models.Collection{})
	if status != "" {
		q = q.Where("status = ?", status)
	}
	if collectionType != "" {
		q = q.Where("type = ?", collectionType)
	}
	if visibility != "" {
		q = q.Where("visibility = ?", visibility)
	}
	if discoverOnly {
		q = q.Order("discover_order ASC").Order("title ASC")
	} else {
		q = q.Order("updated_at DESC")
	}
	var collections []models.Collection
	if err := s.withPreloads(q).Find(&collections).Error; err != nil {
		return nil, err
	}
	return collections, nil
}

func (s *CollectionService) ListDiscover(ctx context.Context) ([]models.Collection, error) {
	return s.List(ctx, "Published", "", "", true)
}

func (s *CollectionService) GetByID(ctx context.Context, id string) (*models.Collection, error) {
	var collection models.Collection
	err := s.withPreloads(s.db.WithContext(ctx)).First(&collection, "id = ?", id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, utils.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &collection, nil
}

func (s *CollectionService) GetBySlug(ctx context.Context, slug string) (*models.Collection, error) {
	var collection models.Collection
	err := s.withPreloads(s.db.WithContext(ctx)).First(&collection, "slug = ?", slug).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, utils.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &collection, nil
}

func (s *CollectionService) withPreloads(q *gorm.DB) *gorm.DB {
	return q.
		Preload("Entries", func(db *gorm.DB) *gorm.DB {
			return db.Order("position ASC")
		}).
		Preload("Entries.Anime").
		Preload("Entries.Anime.Genres").
		Preload("Entries.Anime.Studios").
		Preload("Sources").
		Preload("UpdatedBy")
}

func (s *CollectionService) replaceEntries(ctx context.Context, collectionID string, animeIDs []string, now time.Time) error {
	if err := s.db.WithContext(ctx).Where("collection_id = ?", collectionID).Delete(&models.CollectionEntry{}).Error; err != nil {
		return err
	}
	entries := make([]models.CollectionEntry, 0, len(animeIDs))
	for i, animeID := range animeIDs {
		entries = append(entries, models.CollectionEntry{
			Common:       models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
			CollectionID: collectionID,
			AnimeID:      animeID,
			Position:     i,
		})
	}
	if len(entries) == 0 {
		return nil
	}
	return s.db.WithContext(ctx).Create(&entries).Error
}

func applyDiscoverInput(collection *models.Collection, input *CollectionDiscoverInput) {
	if input.Enabled != nil {
		collection.DiscoverEnabled = *input.Enabled
	}
	if input.Order != nil {
		collection.DiscoverOrder = *input.Order
	}
	if input.Title != nil {
		collection.DiscoverTitle = *input.Title
	}
	if input.Subtitle != nil {
		collection.DiscoverSubtitle = *input.Subtitle
	}
	if input.CtaLabel != nil {
		collection.DiscoverCta = *input.CtaLabel
	}
	if input.Href != nil {
		collection.DiscoverHref = *input.Href
	}
}

func coalescePtr[T comparable](value *T, fallback T) T {
	if value != nil {
		return *value
	}
	return fallback
}
