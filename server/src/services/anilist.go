package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/skygenesisenterprise/kami-sama/server/src/config"
	"github.com/skygenesisenterprise/kami-sama/server/src/models"
	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
	"gorm.io/datatypes"
)

type AnilistService struct {
	client *AnilistClient
	repos  *Repositories
	cfg    config.AnilistConfig
	logger *slog.Logger
}

func NewAnilistService(cfg config.AnilistConfig, repos *Repositories, logger *slog.Logger) *AnilistService {
	return &AnilistService{
		client: NewAnilistClient(logger),
		repos:  repos,
		cfg:    cfg,
		logger: logger,
	}
}

type AnilistSearchItem struct {
	AnilistID     int      `json:"anilistId"`
	Title         string   `json:"title"`
	JapaneseTitle string   `json:"japaneseTitle"`
	Format        string   `json:"format"`
	Status        string   `json:"status"`
	CoverImage    string   `json:"coverImage"`
	BannerImage   string   `json:"bannerImage"`
	Episodes      *int     `json:"episodes"`
	AverageScore  *int     `json:"averageScore"`
	Genres        []string `json:"genres"`
	SiteURL       string   `json:"siteUrl"`
}

func (s *AnilistService) Search(ctx context.Context, query string, mediaType string, page, perPage int) (*AnilistSearchResult, error) {
	if !s.cfg.Enabled {
		return nil, utils.NewError(http.StatusServiceUnavailable, "ANILIST_DISABLED", "Anilist integration is not enabled.", nil)
	}
	if strings.TrimSpace(query) == "" {
		return nil, utils.ErrValidationFailed
	}
	return s.client.SearchMedia(ctx, query, mediaType, page, perPage)
}

func (s *AnilistService) GetMedia(ctx context.Context, anilistID int) (*AnilistMedia, error) {
	if !s.cfg.Enabled {
		return nil, utils.NewError(http.StatusServiceUnavailable, "ANILIST_DISABLED", "Anilist integration is not enabled.", nil)
	}
	return s.client.GetMediaByID(ctx, anilistID)
}

func (s *AnilistService) ImportMedia(ctx context.Context, anilistID int, userID string) (*models.Anime, error) {
	if !s.cfg.Enabled {
		return nil, utils.NewError(http.StatusServiceUnavailable, "ANILIST_DISABLED", "Anilist integration is not enabled.", nil)
	}

	media, err := s.client.GetMediaByID(ctx, anilistID)
	if err != nil {
		return nil, err
	}

	existing, err := s.findByAnilistID(ctx, anilistID)
	if err == nil && existing != nil {
		return s.updateFromAnilist(ctx, existing, media)
	}

	return s.createAnimeFromAnilist(ctx, media, userID)
}

func (s *AnilistService) findByAnilistID(ctx context.Context, anilistID int) (*models.Anime, error) {
	idStr := strconv.Itoa(anilistID)
	var anime models.Anime
	err := s.repos.db.WithContext(ctx).
		Where("metadata->>'anilist_id' = ?", idStr).
		First(&anime).Error
	if err != nil {
		return nil, err
	}
	return &anime, nil
}

func (s *AnilistService) createAnimeFromAnilist(ctx context.Context, media *AnilistMedia, userID string) (*models.Anime, error) {
	now := time.Now().UTC()
	title := media.Title.English
	if title == "" {
		title = media.Title.Romaji
	}
	slug := generateSlug(title)

	anime := &models.Anime{
		Common:         models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
		Slug:           slug,
		Title:          title,
		JapaneseTitle:  media.Title.Native,
		Synopsis:       cleanDescription(media.Description),
		CoverImageUrl:  media.CoverImage.Large,
		BannerImageUrl: media.BannerImage,
		TrailerUrl:     buildTrailerURL(media.Trailer),
		Status:         mapAnilistStatus(media.Status),
		TotalEpisodes:  derefInt(media.Episodes),
		ReleaseYear:    derefInt(media.SeasonYear),
		Season:         strings.ToLower(media.Season),
		Source:         strings.ToLower(media.Source),
		Metadata:       buildAnilistMetadata(media),
	}

	if err := s.repos.Anime().Create(ctx, anime); err != nil {
		return nil, err
	}

	s.syncGenres(ctx, anime.ID, media.Genres)
	s.syncStudios(ctx, anime.ID, media.Studios.Edges)
	s.syncCharacters(ctx, anime.ID, media.Characters.Edges)

	return anime, nil
}

func (s *AnilistService) updateFromAnilist(ctx context.Context, anime *models.Anime, media *AnilistMedia) (*models.Anime, error) {
	anime.Title = coalesce(media.Title.English, media.Title.Romaji, anime.Title)
	anime.JapaneseTitle = media.Title.Native
	anime.Synopsis = cleanDescription(media.Description)
	anime.CoverImageUrl = media.CoverImage.Large
	anime.BannerImageUrl = media.BannerImage
	anime.TrailerUrl = buildTrailerURL(media.Trailer)
	anime.Status = mapAnilistStatus(media.Status)
	anime.TotalEpisodes = derefInt(media.Episodes)
	anime.ReleaseYear = derefInt(media.SeasonYear)
	anime.Season = strings.ToLower(media.Season)
	anime.Source = strings.ToLower(media.Source)
	anime.Metadata = buildAnilistMetadata(media)
	anime.UpdatedAt = time.Now().UTC()

	if err := s.repos.Anime().Update(ctx, anime); err != nil {
		return nil, err
	}

	s.syncGenres(ctx, anime.ID, media.Genres)
	s.syncStudios(ctx, anime.ID, media.Studios.Edges)
	s.syncCharacters(ctx, anime.ID, media.Characters.Edges)

	return anime, nil
}

func (s *AnilistService) syncGenres(ctx context.Context, animeID string, genreNames []string) {
	s.repos.db.WithContext(ctx).Exec("DELETE FROM anime_genres WHERE anime_id = ?", animeID)
	for _, name := range genreNames {
		genre := s.findOrCreateGenre(ctx, name)
		if genre != nil {
			s.repos.db.WithContext(ctx).Exec(
				"INSERT INTO anime_genres (anime_id, genre_id) VALUES (?, ?) ON CONFLICT DO NOTHING",
				animeID, genre.ID,
			)
		}
	}
}

func (s *AnilistService) findOrCreateGenre(ctx context.Context, name string) *models.Genre {
	slug := generateSlug(name)
	var genre models.Genre
	err := s.repos.db.WithContext(ctx).Where("slug = ?", slug).First(&genre).Error
	if err == nil {
		return &genre
	}
	now := time.Now().UTC()
	genre = models.Genre{
		Common: models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
		Name:   name,
		Slug:   slug,
	}
	if err := s.repos.db.WithContext(ctx).Create(&genre).Error; err != nil {
		s.logger.Warn("failed to create genre from anilist", "name", name, "error", err)
		return nil
	}
	return &genre
}

func (s *AnilistService) syncStudios(ctx context.Context, animeID string, edges []struct {
	IsMain bool `json:"isMain"`
	Node   struct {
		ID   int    `json:"id"`
		Name string `json:"name"`
	} `json:"node"`
}) {
	s.repos.db.WithContext(ctx).Exec("DELETE FROM anime_studios WHERE anime_id = ?", animeID)
	for _, edge := range edges {
		studio := s.findOrCreateStudio(ctx, edge.Node.Name)
		if studio != nil {
			s.repos.db.WithContext(ctx).Exec(
				"INSERT INTO anime_studios (anime_id, studio_id) VALUES (?, ?) ON CONFLICT DO NOTHING",
				animeID, studio.ID,
			)
		}
	}
}

func (s *AnilistService) findOrCreateStudio(ctx context.Context, name string) *models.Studio {
	slug := generateSlug(name)
	var studio models.Studio
	err := s.repos.db.WithContext(ctx).Where("slug = ?", slug).First(&studio).Error
	if err == nil {
		return &studio
	}
	now := time.Now().UTC()
	studio = models.Studio{
		Common: models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
		Name:   name,
		Slug:   slug,
	}
	if err := s.repos.db.WithContext(ctx).Create(&studio).Error; err != nil {
		s.logger.Warn("failed to create studio from anilist", "name", name, "error", err)
		return nil
	}
	return &studio
}

func (s *AnilistService) syncCharacters(ctx context.Context, animeID string, edges []struct {
	Role string `json:"role"`
	Node struct {
		ID   int    `json:"id"`
		Name struct {
			Full string `json:"full"`
		} `json:"name"`
		Image struct {
			Medium string `json:"medium"`
		} `json:"image"`
		Gender *string `json:"gender"`
	} `json:"node"`
}) {
	s.repos.db.WithContext(ctx).Exec("DELETE FROM anime_characters WHERE anime_id = ?", animeID)
	for _, edge := range edges {
		char := s.findOrCreateCharacter(ctx, edge.Node)
		if char != nil {
			s.repos.db.WithContext(ctx).Exec(
				"INSERT INTO anime_characters (anime_id, character_id, role) VALUES (?, ?, ?) ON CONFLICT DO NOTHING",
				animeID, char.ID, strings.ToLower(edge.Role),
			)
		}
	}
}

func (s *AnilistService) findOrCreateCharacter(ctx context.Context, node struct {
	ID   int    `json:"id"`
	Name struct {
		Full string `json:"full"`
	} `json:"name"`
	Image struct {
		Medium string `json:"medium"`
	} `json:"image"`
	Gender *string `json:"gender"`
}) *models.Character {
	slug := generateSlug(node.Name.Full)
	var char models.Character
	err := s.repos.db.WithContext(ctx).Where("slug = ?", slug).First(&char).Error
	if err == nil {
		return &char
	}
	now := time.Now().UTC()
	char = models.Character{
		Common:   models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
		Name:     node.Name.Full,
		Slug:     slug,
		ImageUrl: node.Image.Medium,
	}
	if node.Gender != nil {
		char.Gender = *node.Gender
	}
	if err := s.repos.db.WithContext(ctx).Create(&char).Error; err != nil {
		s.logger.Warn("failed to create character from anilist", "name", node.Name.Full, "error", err)
		return nil
	}
	return &char
}

func buildAnilistMetadata(media *AnilistMedia) datatypes.JSON {
	m := map[string]any{
		"anilist_id":  media.ID,
		"site_url":    media.SiteURL,
		"format":      media.Format,
		"source":      media.Source,
		"popularity":  media.Popularity,
		"mean_score":  media.MeanScore,
	}
	if media.IDMal != nil {
		m["mal_id"] = *media.IDMal
	}
	if media.Duration != nil {
		m["duration"] = *media.Duration
	}
	raw, _ := json.Marshal(m)
	return datatypes.JSON(raw)
}

func buildTrailerURL(trailer *struct {
	ID        *int   `json:"id"`
	Site      string `json:"site"`
	Thumbnail string `json:"thumbnail"`
}) string {
	if trailer == nil || trailer.ID == nil {
		return ""
	}
	switch strings.ToLower(trailer.Site) {
	case "youtube":
		return fmt.Sprintf("https://www.youtube.com/watch?v=%d", *trailer.ID)
	case "dailymotion":
		return fmt.Sprintf("https://www.dailymotion.com/video/%d", *trailer.ID)
	}
	return ""
}

func mapAnilistStatus(status string) string {
	switch strings.ToUpper(status) {
	case "FINISHED":
		return "completed"
	case "RELEASING":
		return "airing"
	case "NOT_YET_RELEASED":
		return "upcoming"
	case "CANCELLED":
		return "cancelled"
	case "HIATUS":
		return "hiatus"
	default:
		return "upcoming"
	}
}

func cleanDescription(desc string) string {
	desc = strings.ReplaceAll(desc, "<br>", "\n")
	desc = strings.ReplaceAll(desc, "<br/>", "\n")
	desc = strings.ReplaceAll(desc, "<br />", "\n")
	for {
		start := strings.Index(desc, "<")
		if start == -1 {
			break
		}
		end := strings.Index(desc[start:], ">")
		if end == -1 {
			break
		}
		desc = desc[:start] + desc[start+end+1:]
	}
	return strings.TrimSpace(desc)
}

func derefInt(p *int) int {
	if p == nil {
		return 0
	}
	return *p
}

func coalesce(values ...string) string {
	for _, v := range values {
		if v != "" {
			return v
		}
	}
	return ""
}
