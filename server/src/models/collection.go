package models

import (
	"time"

	"gorm.io/gorm"
)

type Collection struct {
	Common
	Slug             string             `gorm:"column:slug;type:text;uniqueIndex;not null" json:"slug"`
	Title            string             `gorm:"column:title;type:text;not null" json:"title"`
	Description      string             `gorm:"column:description;type:text" json:"description"`
	Type             string             `gorm:"column:type;type:text;not null;default:'editorial'" json:"type"`
	Status           string             `gorm:"column:status;type:text;not null;default:'Draft'" json:"status"`
	Visibility       string             `gorm:"column:visibility;type:text;not null;default:'private'" json:"visibility"`
	PosterUrl        string             `gorm:"column:poster_url;type:text" json:"posterUrl"`
	BannerUrl        string             `gorm:"column:banner_url;type:text" json:"bannerUrl"`
	MetadataStatus   string             `gorm:"column:metadata_status;type:text;not null;default:'missing'" json:"metadataStatus"`
	Tags             StringArray        `gorm:"column:tags;type:text[]" json:"tags,omitempty"`
	DiscoverEnabled  bool               `gorm:"column:discover_enabled;default:false" json:"discoverEnabled"`
	DiscoverOrder    int                `gorm:"column:discover_order;default:0;index" json:"discoverOrder"`
	DiscoverTitle    string             `gorm:"column:discover_title;type:text" json:"discoverTitle,omitempty"`
	DiscoverSubtitle string             `gorm:"column:discover_subtitle;type:text" json:"discoverSubtitle,omitempty"`
	DiscoverCta      string             `gorm:"column:discover_cta;type:text" json:"discoverCta,omitempty"`
	DiscoverHref     string             `gorm:"column:discover_href;type:text" json:"discoverHref,omitempty"`
	UpdatedByID      string             `gorm:"column:updated_by_id;type:text;index" json:"updatedById,omitempty"`
	UpdatedBy        *User              `gorm:"foreignKey:UpdatedByID" json:"updatedBy,omitempty"`
	Entries          []CollectionEntry  `gorm:"foreignKey:CollectionID" json:"entries,omitempty"`
	Sources          []CollectionSource `gorm:"foreignKey:CollectionID" json:"sources,omitempty"`
	DeletedAt        gorm.DeletedAt     `gorm:"column:deleted_at;index" json:"-"`
}

func (Collection) TableName() string { return "collections" }

type CollectionEntry struct {
	Common
	CollectionID string     `gorm:"column:collection_id;type:text;uniqueIndex:idx_collection_anime;not null" json:"collectionId"`
	AnimeID      string     `gorm:"column:anime_id;type:text;uniqueIndex:idx_collection_anime;index;not null" json:"animeId"`
	Position     int        `gorm:"column:position;default:0" json:"position"`
	Anime        Anime      `gorm:"foreignKey:AnimeID;references:ID" json:"anime,omitempty"`
	Collection   Collection `gorm:"foreignKey:CollectionID;references:ID" json:"collection,omitempty"`
}

func (CollectionEntry) TableName() string { return "collection_entries" }

type CollectionSource struct {
	Common
	CollectionID string     `gorm:"column:collection_id;type:text;uniqueIndex:idx_collection_provider;index;not null" json:"collectionId"`
	Provider     string     `gorm:"column:provider;type:text;uniqueIndex:idx_collection_provider;not null" json:"provider"`
	ExternalID   string     `gorm:"column:external_id;type:text" json:"externalId"`
	Status       string     `gorm:"column:status;type:text;default:'active'" json:"status"`
	LastSyncedAt *time.Time `gorm:"column:last_synced_at" json:"lastSyncedAt,omitempty"`
}

func (CollectionSource) TableName() string { return "collection_sources" }
