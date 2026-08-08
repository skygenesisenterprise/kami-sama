package models

import (
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Anime struct {
	Common
	Slug           string         `gorm:"column:slug;type:text;uniqueIndex;not null" json:"slug"`
	Title          string         `gorm:"column:title;type:text;not null" json:"title"`
	JapaneseTitle  string         `gorm:"column:japanese_title;type:text" json:"japaneseTitle"`
	Synopsis       string         `gorm:"column:synopsis;type:text" json:"synopsis"`
	CoverImageUrl  string         `gorm:"column:cover_image_url;type:text" json:"coverImageUrl"`
	BannerImageUrl string         `gorm:"column:banner_image_url;type:text" json:"bannerImageUrl"`
	TrailerUrl     string         `gorm:"column:trailer_url;type:text" json:"trailerUrl"`
	Status         string         `gorm:"column:status;type:text;not null;default:'upcoming'" json:"status"`
	Rating         float64        `gorm:"column:rating;type:real;default:0" json:"rating"`
	TotalEpisodes  int            `gorm:"column:total_episodes;default:0" json:"totalEpisodes"`
	ReleaseYear    int            `gorm:"column:release_year;default:0" json:"releaseYear"`
	Season         string         `gorm:"column:season;type:text" json:"season"`
	Source         string         `gorm:"column:source;type:text" json:"source"`
	AgeRating      string         `gorm:"column:age_rating;type:text" json:"ageRating"`
	IsFeatured     bool           `gorm:"column:is_featured;default:false" json:"isFeatured"`
	IsTrending     bool           `gorm:"column:is_trending;default:false" json:"isTrending"`
	ParentAnimeID  *string        `gorm:"column:parent_anime_id;type:text;index" json:"parentAnimeId,omitempty"`
	Metadata       datatypes.JSON `gorm:"column:metadata;type:jsonb" json:"metadata,omitempty"`
	Genres         []Genre        `gorm:"many2many:anime_genres;" json:"genres,omitempty"`
	Studios        []Studio       `gorm:"many2many:anime_studios;" json:"studios,omitempty"`
	Characters     []Character    `gorm:"many2many:anime_characters;" json:"characters,omitempty"`
	Seasons        []AnimeSeason  `gorm:"foreignKey:AnimeID" json:"seasons,omitempty"`
	Children       []Anime        `gorm:"foreignKey:ParentAnimeID" json:"children,omitempty"`
	DeletedAt      gorm.DeletedAt `gorm:"column:deleted_at;index" json:"-"`
}

func (Anime) TableName() string { return "anime" }

type AnimeSeason struct {
	Common
	AnimeID      string    `gorm:"column:anime_id;type:text;index;not null" json:"animeId"`
	Number       int       `gorm:"column:number;not null" json:"number"`
	Title        string    `gorm:"column:title;type:text" json:"title"`
	EpisodeCount int       `gorm:"column:episode_count;default:0" json:"episodeCount"`
	AirDate      *string   `gorm:"column:air_date;type:text" json:"airDate,omitempty"`
	Episodes     []Episode `gorm:"foreignKey:SeasonID" json:"episodes,omitempty"`
}

func (AnimeSeason) TableName() string { return "anime_seasons" }

type AnimeGenre struct {
	AnimeID string `gorm:"column:anime_id;type:text;primaryKey"`
	GenreID string `gorm:"column:genre_id;type:text;primaryKey"`
}

func (AnimeGenre) TableName() string { return "anime_genres" }

type AnimeStudio struct {
	AnimeID  string `gorm:"column:anime_id;type:text;primaryKey"`
	StudioID string `gorm:"column:studio_id;type:text;primaryKey"`
}

func (AnimeStudio) TableName() string { return "anime_studios" }

type AnimeCharacter struct {
	AnimeID     string `gorm:"column:anime_id;type:text;primaryKey"`
	CharacterID string `gorm:"column:character_id;type:text;primaryKey"`
	Role        string `gorm:"column:role;type:text" json:"role"`
}

func (AnimeCharacter) TableName() string { return "anime_characters" }

type Tag struct {
	Common
	Name string `gorm:"column:name;type:text;uniqueIndex;not null" json:"name"`
	Slug string `gorm:"column:slug;type:text;uniqueIndex;not null" json:"slug"`
}

func (Tag) TableName() string { return "tags" }
