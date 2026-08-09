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

// ToAnilistSearchItems flattens raw AniList media results into the shared
// search-item shape consumed by the catalog source pickers.
func ToAnilistSearchItems(media []AnilistMedia) []AnilistSearchItem {
	items := make([]AnilistSearchItem, 0, len(media))
	for _, m := range media {
		title := m.Title.Romaji
		if m.Title.English != "" {
			title = m.Title.English
		}
		cover := m.CoverImage.Large
		if cover == "" {
			cover = m.CoverImage.Medium
		}
		items = append(items, AnilistSearchItem{
			AnilistID:     m.ID,
			Title:         title,
			JapaneseTitle: m.Title.Native,
			Format:        m.Format,
			Status:        m.Status,
			CoverImage:    cover,
			BannerImage:   m.BannerImage,
			Episodes:      m.Episodes,
			AverageScore:  m.AverageScore,
			Genres:        m.Genres,
			SiteURL:       m.SiteURL,
		})
	}
	return items
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

func (s *AnilistService) GetTrending(ctx context.Context, mediaType string, page, perPage int) (*AnilistSearchResult, error) {
	if !s.cfg.Enabled {
		return nil, utils.NewError(http.StatusServiceUnavailable, "ANILIST_DISABLED", "Anilist integration is not enabled.", nil)
	}
	return s.client.GetTrendingMedia(ctx, mediaType, page, perPage)
}

func (s *AnilistService) GetPopular(ctx context.Context, mediaType string, page, perPage int) (*AnilistSearchResult, error) {
	if !s.cfg.Enabled {
		return nil, utils.NewError(http.StatusServiceUnavailable, "ANILIST_DISABLED", "Anilist integration is not enabled.", nil)
	}
	return s.client.GetPopularMedia(ctx, mediaType, page, perPage)
}

func (s *AnilistService) GetSeasonal(ctx context.Context, season string, seasonYear int, page, perPage int) (*AnilistSearchResult, error) {
	if !s.cfg.Enabled {
		return nil, utils.NewError(http.StatusServiceUnavailable, "ANILIST_DISABLED", "Anilist integration is not enabled.", nil)
	}
	return s.client.GetSeasonalMedia(ctx, season, seasonYear, page, perPage)
}

func (s *AnilistService) GetAiringSchedule(ctx context.Context, page, perPage int, notYetAired bool) ([]AnilistAiringSchedule, *AnilistPageInfo, error) {
	if !s.cfg.Enabled {
		return nil, nil, utils.NewError(http.StatusServiceUnavailable, "ANILIST_DISABLED", "Anilist integration is not enabled.", nil)
	}
	return s.client.GetAiringSchedule(ctx, page, perPage, notYetAired)
}

func (s *AnilistService) GetCharacterDetail(ctx context.Context, characterID int) (*AnilistCharacter, error) {
	if !s.cfg.Enabled {
		return nil, utils.NewError(http.StatusServiceUnavailable, "ANILIST_DISABLED", "Anilist integration is not enabled.", nil)
	}
	return s.client.GetCharacterByID(ctx, characterID)
}

func (s *AnilistService) GetStaffDetail(ctx context.Context, staffID int) (*AnilistStaff, error) {
	if !s.cfg.Enabled {
		return nil, utils.NewError(http.StatusServiceUnavailable, "ANILIST_DISABLED", "Anilist integration is not enabled.", nil)
	}
	return s.client.GetStaffByID(ctx, staffID)
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
		result, err := s.updateFromAnilist(ctx, existing, media)
		if err != nil {
			return nil, err
		}
		s.importRelatedMedia(ctx, media.Relations, result.ID, userID)
		return result, nil
	}

	parentID := s.findParentAnimeFromRelations(ctx, media.Relations)
	result, err := s.createAnimeFromAnilist(ctx, media, userID, parentID)
	if err != nil {
		return nil, err
	}
	s.importRelatedMedia(ctx, media.Relations, result.ID, userID)
	return result, nil
}

// RefreshFromAnilist re-fetches the freshest metadata from AniList for an anime
// that already carries an anilist_id and applies it in place (rating, sources,
// genres, …). It also ensures the parent's first season exists and imports any
// sequel relations as additional seasons so the series is not limited to a
// single season. It is a no-op when AniList is disabled or no anilist_id exists.
func (s *AnilistService) RefreshFromAnilist(ctx context.Context, anime *models.Anime, userID string) error {
	if !s.cfg.Enabled || anime.Metadata == nil {
		return nil
	}
	var meta map[string]any
	if err := json.Unmarshal(anime.Metadata, &meta); err != nil {
		return nil
	}
	idVal, _ := meta["anilist_id"].(float64)
	if idVal <= 0 {
		return nil
	}
	media, err := s.client.GetMediaByID(ctx, int(idVal))
	if err != nil {
		return err
	}
	if _, err := s.updateFromAnilist(ctx, anime, media); err != nil {
		return err
	}
	// Create the parent's own first season before attaching sequels, otherwise a
	// sequel could claim season 1 for itself.
	s.EnsureSeasonsAndEpisodes(ctx, anime, nil)
	s.importRelatedMedia(ctx, media.Relations, anime.ID, userID)
	return nil
}

// importRelatedMedia imports all related entries (sequels, spin-offs) from
// AniList relations. Sequels are attached as additional seasons under
// parentAnimeID so a multi-cour series is not limited to a single season. The
// import recurses through the related entries so long chains (S1 → S2 → S3)
// are fully materialized under the same parent.
func (s *AnilistService) importRelatedMedia(ctx context.Context, relations struct {
	Edges []struct {
		RelationType string `json:"relationType"`
		Node         struct {
			ID    int    `json:"id"`
			Title struct {
				Romaji string `json:"romaji"`
			} `json:"title"`
			Type string `json:"type"`
		} `json:"node"`
	} `json:"edges"`
}, parentAnimeID, userID string) {
	for _, edge := range relations.Edges {
		// Import sequels, side stories, and spin-offs as children/seasons
		if edge.RelationType != "SEQUEL" && edge.RelationType != "SIDE_STORY" && edge.RelationType != "SPIN_OFF" {
			continue
		}
		existing, existingErr := s.findByAnilistID(ctx, edge.Node.ID)
		if existingErr == nil {
			// Already imported. If it is a sequel that is not yet attached to the
			// current series, re-parent it so it becomes an additional season.
			if edge.RelationType == "SEQUEL" && parentAnimeID != "" {
				s.attachAsSeason(ctx, existing, parentAnimeID)
			}
			// Recurse into the existing entry so deeper sequels (S1 → S2 → S3)
			// are still discovered and attached to the same parent.
			relatedMedia, err := s.client.GetMediaByID(ctx, edge.Node.ID)
			if err == nil {
				s.importRelatedMedia(ctx, relatedMedia.Relations, parentAnimeID, userID)
			}
			continue
		}
		// Fetch and import the related entry
		relatedMedia, err := s.client.GetMediaByID(ctx, edge.Node.ID)
		if err != nil {
			s.logger.Warn("failed to fetch related media from anilist", "id", edge.Node.ID, "error", err)
			continue
		}
		// Sequels belong under the entry being imported/synced. Side stories and
		// spin-offs attach to their own main entry when it exists locally.
		var parentID *string
		if edge.RelationType == "SEQUEL" && parentAnimeID != "" {
			parentID = &parentAnimeID
		} else {
			parentID = s.findParentAnimeFromRelations(ctx, relatedMedia.Relations)
		}
		created, err := s.createAnimeFromAnilist(ctx, relatedMedia, userID, parentID)
		if err != nil {
			s.logger.Warn("failed to import related media from anilist", "id", edge.Node.ID, "error", err)
			continue
		}
		// Recurse so the sequels of the related entry also land on the same parent.
		if created != nil {
			s.importRelatedMedia(ctx, relatedMedia.Relations, parentAnimeID, userID)
		}
	}
}

// attachAsSeason links an already-imported sequel to its parent series and
// merges its episodes as an additional season under the parent. This heals rows
// that were previously created as standalone entries.
func (s *AnilistService) attachAsSeason(ctx context.Context, child *models.Anime, parentAnimeID string) {
	if child == nil || (child.ParentAnimeID != nil && *child.ParentAnimeID == parentAnimeID) {
		return
	}
	now := time.Now().UTC()
	var maxSeason int
	s.repos.db.WithContext(ctx).Model(&models.AnimeSeason{}).
		Where("anime_id = ?", parentAnimeID).
		Select("COALESCE(MAX(number), 0)").Scan(&maxSeason)
	var maxEpisode int
	s.repos.db.WithContext(ctx).Model(&models.Episode{}).
		Where("anime_id = ?", parentAnimeID).
		Select("COALESCE(MAX(number), 0)").Scan(&maxEpisode)

	seasonNumber := maxSeason + 1
	episodeOffset := maxEpisode

	if child.TotalEpisodes > 0 {
		season := &models.AnimeSeason{
			Common:       models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
			AnimeID:      parentAnimeID,
			Number:       seasonNumber,
			Title:        fmt.Sprintf("Season %d", seasonNumber),
			EpisodeCount: child.TotalEpisodes,
		}
		if err := s.repos.db.WithContext(ctx).Create(season).Error; err != nil {
			return
		}
		var episodes []models.Episode
		s.repos.db.WithContext(ctx).Where("anime_id = ?", child.ID).Order("number asc").Find(&episodes)
		if len(episodes) == 0 {
			for n := 1; n <= child.TotalEpisodes; n++ {
				episodes = append(episodes, models.Episode{
					Common:   models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
					AnimeID:  parentAnimeID,
					SeasonID: &season.ID,
					Number:   episodeOffset + n,
					Title:    fmt.Sprintf("Episode %d", episodeOffset+n),
					IsSubbed: true,
				})
			}
			if len(episodes) > 0 {
				s.repos.db.WithContext(ctx).CreateInBatches(episodes, 100)
			}
		} else {
			for i := range episodes {
				episodes[i].AnimeID = parentAnimeID
				episodes[i].SeasonID = &season.ID
				episodes[i].Number = episodeOffset + episodes[i].Number
			}
			s.repos.db.WithContext(ctx).Save(&episodes)
		}
		// Drop the child's now-orphaned season rows.
		s.repos.db.WithContext(ctx).Where("anime_id = ?", child.ID).Delete(&models.AnimeSeason{})
	}

	child.ParentAnimeID = &parentAnimeID
	s.repos.db.WithContext(ctx).Model(child).Updates(map[string]any{
		"parent_anime_id": parentAnimeID,
		"updated_at":      now,
	})
	s.logger.Warn("attached existing anime as season", "child", child.Title, "parent", parentAnimeID, "season", seasonNumber)
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

// findParentAnimeFromRelations inspects AniList relations to find a parent/prequel
// anime that already exists in the database. Returns the parent's ID if found, nil otherwise.
func (s *AnilistService) findParentAnimeFromRelations(ctx context.Context, relations struct {
	Edges []struct {
		RelationType string `json:"relationType"`
		Node         struct {
			ID    int    `json:"id"`
			Title struct {
				Romaji string `json:"romaji"`
			} `json:"title"`
			Type string `json:"type"`
		} `json:"node"`
	} `json:"edges"`
}) *string {
	for _, edge := range relations.Edges {
		if edge.RelationType == "PREQUEL" || edge.RelationType == "PARENT" {
			existing, err := s.findByAnilistID(ctx, edge.Node.ID)
			if err == nil && existing != nil {
				return &existing.ID
			}
		}
	}
	return nil
}

func (s *AnilistService) createAnimeFromAnilist(ctx context.Context, media *AnilistMedia, userID string, parentID *string) (*models.Anime, error) {
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
		Rating:         anilistRating(media),
		TotalEpisodes:  derefInt(media.Episodes),
		ReleaseYear:    derefInt(media.SeasonYear),
		Season:         strings.ToLower(media.Season),
		Source:         strings.ToLower(media.Source),
		ParentAnimeID:  parentID,
		Metadata:       anilistMetadata(nil, media),
	}

	if err := s.repos.Anime().Create(ctx, anime); err != nil {
		return nil, err
	}

	s.syncGenres(ctx, anime.ID, media.Genres)
	s.syncStudios(ctx, anime.ID, media.Studios.Edges)
	s.syncCharacters(ctx, anime.ID, media.Characters.Edges)
	s.EnsureSeasonsAndEpisodes(ctx, anime, parentID)

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
	anime.Rating = anilistRating(media)
	anime.TotalEpisodes = derefInt(media.Episodes)
	anime.ReleaseYear = derefInt(media.SeasonYear)
	anime.Season = strings.ToLower(media.Season)
	anime.Source = strings.ToLower(media.Source)
	anime.Metadata = anilistMetadata(anime.Metadata, media)
	anime.UpdatedAt = time.Now().UTC()

	if err := s.repos.Anime().Update(ctx, anime); err != nil {
		return nil, err
	}

	s.syncGenres(ctx, anime.ID, media.Genres)
	s.syncStudios(ctx, anime.ID, media.Studios.Edges)
	s.syncCharacters(ctx, anime.ID, media.Characters.Edges)
	s.EnsureSeasonsAndEpisodes(ctx, anime, nil)

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

// anilistRating converts an AniList score (0–100) to the catalog's 0–10 scale.
func anilistRating(media *AnilistMedia) float64 {
	if media.AverageScore != nil {
		return float64(*media.AverageScore) / 10
	}
	if media.MeanScore != nil {
		return float64(*media.MeanScore) / 10
	}
	return 0
}

// anilistMetadata builds the metadata JSONB for an AniList media item. It keeps
// any existing keys (e.g. a previously linked Plex source) and always records
// the AniList external ID plus a source link so the catalog can resolve the
// provider and rating.
func anilistMetadata(existing datatypes.JSON, media *AnilistMedia) datatypes.JSON {
	meta := map[string]any{}
	if len(existing) > 0 {
		_ = json.Unmarshal(existing, &meta)
	}
	meta["anilist_id"] = media.ID
	meta["site_url"] = media.SiteURL
	meta["format"] = media.Format
	meta["source"] = media.Source
	if media.Popularity != nil {
		meta["popularity"] = media.Popularity
	}
	if media.MeanScore != nil {
		meta["mean_score"] = media.MeanScore
	}
	if media.AverageScore != nil {
		meta["average_score"] = media.AverageScore
	}
	if media.IDMal != nil {
		meta["mal_id"] = *media.IDMal
	}
	if media.Duration != nil {
		meta["duration"] = *media.Duration
	}

	externalIDs := map[string]string{"anilist": strconv.Itoa(media.ID)}
	if media.IDMal != nil {
		externalIDs["mal"] = strconv.Itoa(*media.IDMal)
	}
	meta["external_ids"] = externalIDs

	sources, _ := meta["sources"].([]any)
	hasAnilist := false
	for _, s := range sources {
		if obj, ok := s.(map[string]any); ok && obj["provider"] == "AniList" {
			hasAnilist = true
			break
		}
	}
	if !hasAnilist {
		sources = append(sources, map[string]any{
			"provider":     "AniList",
			"externalId":   strconv.Itoa(media.ID),
			"status":       "active",
			"lastSyncedAt": time.Now().UTC().Format(time.RFC3339),
		})
		meta["sources"] = sources
	}

	raw, err := json.Marshal(meta)
	if err != nil {
		return existing
	}
	return datatypes.JSON(raw)
}

func buildTrailerURL(trailer *struct {
	ID        *FlexString `json:"id"`
	Site      string      `json:"site"`
	Thumbnail string      `json:"thumbnail"`
}) string {
	if trailer == nil || trailer.ID == nil {
		return ""
	}
	id := string(*trailer.ID)
	switch strings.ToLower(trailer.Site) {
	case "youtube":
		return fmt.Sprintf("https://www.youtube.com/watch?v=%s", id)
	case "dailymotion":
		return fmt.Sprintf("https://www.dailymotion.com/video/%s", id)
	}
	return ""
}

func mapAnilistStatus(status string) string {
	switch strings.ToUpper(status) {
	case "FINISHED":
		return "complete"
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

// ensureSeasonsAndEpisodes creates seasons and episodes for an anime.
// When parentID is nil, creates a standalone Season 1.
// When parentID is set, adds this anime as a new season to the parent.
func (s *AnilistService) EnsureSeasonsAndEpisodes(ctx context.Context, anime *models.Anime, parentID *string) {
	// If total episodes is 0, try to fetch from AniList
	if anime.TotalEpisodes <= 0 {
		anilistID := 0
		if anime.Metadata != nil {
			var metaMap map[string]any
			if err := json.Unmarshal(anime.Metadata, &metaMap); err == nil {
				if v, ok := metaMap["anilist_id"].(float64); ok {
					anilistID = int(v)
				}
			}
		}
		// If no anilist_id in metadata, search by title
		if anilistID == 0 {
			anilistID = s.fetchAnilistIdFromTitle(ctx, anime.Title)
			// Store anilist_id in metadata for future use
			if anilistID > 0 {
				var metaMap map[string]any
				if anime.Metadata != nil {
					_ = json.Unmarshal(anime.Metadata, &metaMap)
				}
				if metaMap == nil {
					metaMap = make(map[string]any)
				}
				metaMap["anilist_id"] = anilistID
				raw, _ := json.Marshal(metaMap)
				anime.Metadata = datatypes.JSON(raw)
				s.repos.db.WithContext(ctx).Model(anime).Update("metadata", anime.Metadata)
			}
		}
		if anilistID > 0 {
			media, err := s.client.GetMediaByID(ctx, anilistID)
			if err == nil && media != nil && media.Episodes != nil {
				anime.TotalEpisodes = *media.Episodes
				s.repos.db.WithContext(ctx).Model(anime).Update("total_episodes", anime.TotalEpisodes)
			}
		}
		if anime.TotalEpisodes <= 0 {
			return
		}
	}

	targetAnimeID := anime.ID
	var seasonNumber int
	var maxEpisodeNumber int

	if parentID != nil {
		// Child anime: add as a new season to the parent
		targetAnimeID = *parentID
		var maxSeason int
		s.repos.db.WithContext(ctx).
			Model(&models.AnimeSeason{}).
			Where("anime_id = ?", *parentID).
			Select("COALESCE(MAX(number), 0)").
			Scan(&maxSeason)
		seasonNumber = maxSeason + 1
		// Get max episode number across all existing seasons
		s.repos.db.WithContext(ctx).
			Model(&models.Episode{}).
			Where("anime_id = ?", *parentID).
			Select("COALESCE(MAX(number), 0)").
			Scan(&maxEpisodeNumber)
	} else {
		// Parent anime: create as Season 1 if no seasons exist
		var count int64
		s.repos.db.WithContext(ctx).Model(&models.AnimeSeason{}).Where("anime_id = ?", anime.ID).Count(&count)
		if count > 0 {
			return
		}
		seasonNumber = 1
		maxEpisodeNumber = 0
	}

	now := time.Now().UTC()
	season := &models.AnimeSeason{
		Common:       models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
		AnimeID:      targetAnimeID,
		Number:       seasonNumber,
		Title:        fmt.Sprintf("Season %d", seasonNumber),
		EpisodeCount: anime.TotalEpisodes,
	}
	if err := s.repos.db.WithContext(ctx).Create(season).Error; err != nil {
		return
	}
	for ep := 1; ep <= anime.TotalEpisodes; ep++ {
		episode := &models.Episode{
			Common:   models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
			AnimeID:  targetAnimeID,
			SeasonID: &season.ID,
			Number:   maxEpisodeNumber + ep,
			Title:    fmt.Sprintf("Episode %d", maxEpisodeNumber+ep),
			IsSubbed: true,
		}
		s.repos.db.WithContext(ctx).Create(episode)
	}
}

// fetchAnilistIdFromTitle searches AniList for an anime by title and returns the AniList ID.
// Returns 0 if not found.
func (s *AnilistService) fetchAnilistIdFromTitle(ctx context.Context, title string) int {
	return s.client.SearchMediaID(ctx, title)
}
