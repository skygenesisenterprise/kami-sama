package routes

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/skygenesisenterprise/kami-sama/server/src/models"
	"github.com/skygenesisenterprise/kami-sama/server/src/services"
	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
)

// ──────────────────────────────────────────────────────────────
// API response types – mirrors apps/types/api/discover.ts
// ──────────────────────────────────────────────────────────────

type ApiImage struct {
	URL    string `json:"url"`
	Width  *int   `json:"width,omitempty"`
	Height *int   `json:"height,omitempty"`
}

type ApiImages struct {
	Poster   ApiImage  `json:"poster"`
	Backdrop ApiImage  `json:"backdrop"`
	Logo     *ApiImage `json:"logo,omitempty"`
}

type ApiContentMetadata struct {
	Genres        []string `json:"genres"`
	Studio        string   `json:"studio"`
	Rating        float64  `json:"rating"`
	RatingCount   *int     `json:"ratingCount,omitempty"`
	AgeRating     string   `json:"ageRating,omitempty"`
	Year          int      `json:"year"`
	JapaneseTitle string   `json:"japaneseTitle,omitempty"`
	Synopsis      string   `json:"synopsis,omitempty"`
}

type ApiContentAvailability struct {
	Watchable bool `json:"watchable"`
	Episodes  int  `json:"episodes"`
	Seasons   *int `json:"seasons,omitempty"`
}

type ApiContentItem struct {
	ID           string                 `json:"id"`
	Slug         string                 `json:"slug"`
	Title        string                 `json:"title"`
	Type         string                 `json:"type"`
	Format       string                 `json:"format"`
	Status       string                 `json:"status"`
	Year         int                    `json:"year"`
	Images       ApiImages              `json:"images"`
	Metadata     ApiContentMetadata     `json:"metadata"`
	Availability ApiContentAvailability `json:"availability"`
}

type ApiSection struct {
	ID       string           `json:"id"`
	Title    string           `json:"title"`
	Type     string           `json:"type"`
	Subtitle string           `json:"subtitle,omitempty"`
	CtaLabel string           `json:"ctaLabel,omitempty"`
	CtaHref  string           `json:"ctaHref,omitempty"`
	Items    []ApiContentItem `json:"items"`
}

type DiscoverPageResponse struct {
	Page      string       `json:"page"`
	UpdatedAt string       `json:"updatedAt"`
	Sections  []ApiSection `json:"sections"`
}

type ContinueWatchingItem struct {
	Content         ApiContentItem `json:"content"`
	EpisodeNumber   int            `json:"episodeNumber"`
	SeasonNumber    int            `json:"seasonNumber"`
	ProgressPercent int            `json:"progressPercent"`
	Duration        int            `json:"duration"`
	CurrentTime     int            `json:"currentTime"`
	WatchedAt       string         `json:"watchedAt"`
}

// ──────────────────────────────────────────────────────────────
// Handler
// ──────────────────────────────────────────────────────────────

type DiscoverHandler struct {
	deps Dependencies
}

func NewDiscoverHandler(deps Dependencies) *DiscoverHandler {
	return &DiscoverHandler{deps: deps}
}

// GetDiscover returns the full discover page with all sections.
func (h *DiscoverHandler) GetDiscover(c *gin.Context) {
	ctx := c.Request.Context()
	now := time.Now().UTC()

	// Determine which season we are in
	season := currentSeason(now)
	year := now.Year()

	// Fetch trending (popular now)
	trending, err := h.deps.AnilistService.GetTrending(ctx, "ANIME", 1, 20)
	if err != nil {
		h.deps.Logger.Error("failed to fetch trending from anilist", "error", err)
		utils.Error(c, err)
		return
	}

	// Fetch popular of all time
	popular, err := h.deps.AnilistService.GetPopular(ctx, "ANIME", 1, 20)
	if err != nil {
		h.deps.Logger.Error("failed to fetch popular from anilist", "error", err)
		utils.Error(c, err)
		return
	}

	// Fetch current season
	seasonal, err := h.deps.AnilistService.GetSeasonal(ctx, season, year, 1, 20)
	if err != nil {
		h.deps.Logger.Warn("failed to fetch seasonal from anilist", "error", err)
	}

	// Build sections
	sections := []ApiSection{
		{
			ID:       "trending",
			Title:    "Tendances actuelles",
			Type:     "carousel",
			Subtitle: "Les anime les plus populaires du moment",
			CtaLabel: "Voir tout",
			CtaHref:  "/catalog?sort=trending",
			Items:    mapAnilistMediaToContentItems(trending.Media),
		},
		{
			ID:       "popular",
			Title:    "Les plus populaires",
			Type:     "carousel",
			Subtitle: "Les anime les mieux notés de tous les temps",
			CtaLabel: "Voir tout",
			CtaHref:  "/catalog?sort=popular",
			Items:    mapAnilistMediaToContentItems(popular.Media),
		},
	}

	// Add seasonal section if we have data
	if seasonal != nil && len(seasonal.Media) > 0 {
		seasonLabel := seasonDisplayName(season)
		sections = append(sections, ApiSection{
			ID:       "seasonal",
			Title:    fmt.Sprintf("%s %d - Nouveautés", seasonLabel, year),
			Type:     "carousel",
			Subtitle: "Les anime de cette saison",
			CtaLabel: "Voir tout",
			CtaHref:  fmt.Sprintf("/catalog?season=%s&year=%d", strings.ToLower(season), year),
			Items:    mapAnilistMediaToContentItems(seasonal.Media),
		})
	}

	// Add genre-based sections (top items from trending grouped by genre)
	genreSections := buildGenreSections(trending.Media, popular.Media)
	sections = append(sections, genreSections...)

	resp := DiscoverPageResponse{
		Page:      "discover",
		UpdatedAt: now.Format(time.RFC3339),
		Sections:  sections,
	}

	utils.Success(c, http.StatusOK, resp)
}

// GetDiscoverSections returns the discover sections built from published collections
// that have the discover flag enabled, ordered by discover_order.
func (h *DiscoverHandler) GetDiscoverSections(c *gin.Context) {
	collections, err := h.deps.CollectionService.ListDiscover(c.Request.Context())
	if err != nil {
		utils.Error(c, err)
		return
	}
	sections := make([]ApiSection, 0, len(collections))
	for i := range collections {
		col := &collections[i]
		title := coalesceStr(col.DiscoverTitle, col.Title)
		subtitle := coalesceStr(col.DiscoverSubtitle, col.Description)
		ctaHref := coalesceStr(col.DiscoverHref, "/catalog")
		items := make([]ApiContentItem, 0, len(col.Entries))
		for j := range col.Entries {
			items = append(items, animeModelToContentItem(&col.Entries[j].Anime))
		}
		sections = append(sections, ApiSection{
			ID:       col.ID,
			Title:    title,
			Type:     "carousel",
			Subtitle: subtitle,
			CtaLabel: col.DiscoverCta,
			CtaHref:  ctaHref,
			Items:    items,
		})
	}
	utils.Success(c, http.StatusOK, gin.H{"sections": sections})
}

// GetDiscoverContinueWatching returns continue-watching items for the authenticated user.
func (h *DiscoverHandler) GetDiscoverContinueWatching(c *gin.Context) {
	// This requires a logged-in user. The watch progress is stored in the DB.
	// For now, return empty list — the watch service already has /watch/continue.
	utils.Success(c, http.StatusOK, gin.H{
		"items": []ContinueWatchingItem{},
	})
}

// GetContentDetail returns a single content item by AniList ID.
func (h *DiscoverHandler) GetContentDetail(c *gin.Context) {
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

	item := anilistMediaToContentItem(media)
	utils.Success(c, http.StatusOK, item)
}

// ──────────────────────────────────────────────────────────────
// Mappers
// ──────────────────────────────────────────────────────────────

func anilistMediaToContentItem(media *services.AnilistMedia) ApiContentItem {
	title := media.Title.English
	if title == "" {
		title = media.Title.Romaji
	}

	slug := strings.ToLower(title)
	slug = strings.ReplaceAll(slug, " ", "-")
	slug = strings.ReplaceAll(slug, "--", "-")

	// Map status
	status := "upcoming"
	switch strings.ToUpper(media.Status) {
	case "FINISHED":
		status = "finished"
	case "RELEASING":
		status = "airing"
	case "NOT_YET_RELEASED":
		status = "upcoming"
	case "CANCELLED":
		status = "cancelled"
	case "HIATUS":
		status = "hiatus"
	}

	contentType := "anime"
	if media.Format == "MOVIE" {
		contentType = "movie"
	}

	// Studio name
	studioName := ""
	for _, edge := range media.Studios.Edges {
		if edge.IsMain {
			studioName = edge.Node.Name
			break
		}
	}
	if studioName == "" && len(media.Studios.Edges) > 0 {
		studioName = media.Studios.Edges[0].Node.Name
	}

	episodes := 0
	if media.Episodes != nil {
		episodes = *media.Episodes
	}

	var rating float64
	if media.AverageScore != nil {
		rating = float64(*media.AverageScore) / 10.0
	}

	var ratingCount *int
	if media.Popularity != nil {
		ratingCount = media.Popularity
	}

	ageRating := ""
	year := 0
	if media.SeasonYear != nil {
		year = *media.SeasonYear
	}

	seasons := 1
	// For simplicity, estimate seasons from episode count
	if episodes > 12 {
		seasons = (episodes + 11) / 12
	}

	return ApiContentItem{
		ID:     fmt.Sprintf("anilist-%d", media.ID),
		Slug:   slug,
		Title:  title,
		Type:   contentType,
		Format: strings.ToLower(string(media.Format)),
		Status: status,
		Year:   year,
		Images: ApiImages{
			Poster: ApiImage{
				URL: media.CoverImage.Large,
			},
			Backdrop: ApiImage{
				URL: coalesceStr(media.BannerImage, media.CoverImage.Large),
			},
		},
		Metadata: ApiContentMetadata{
			Genres:        media.Genres,
			Studio:        studioName,
			Rating:        rating,
			RatingCount:   ratingCount,
			AgeRating:     ageRating,
			Year:          year,
			JapaneseTitle: media.Title.Native,
			Synopsis:      cleanDesc(media.Description),
		},
		Availability: ApiContentAvailability{
			Watchable: false,
			Episodes:  episodes,
			Seasons:   &seasons,
		},
	}
}

func mapAnilistMediaToContentItems(media []services.AnilistMedia) []ApiContentItem {
	items := make([]ApiContentItem, 0, len(media))
	for i := range media {
		items = append(items, anilistMediaToContentItem(&media[i]))
	}
	return items
}

func animeModelToContentItem(a *models.Anime) ApiContentItem {
	genres := make([]string, 0, len(a.Genres))
	for _, genre := range a.Genres {
		genres = append(genres, genre.Name)
	}
	studioName := ""
	if len(a.Studios) > 0 {
		studioName = a.Studios[0].Name
	}
	status := a.Status
	if status == "" {
		status = "upcoming"
	}
	episodes := a.TotalEpisodes
	seasons := 1
	if episodes > 12 {
		seasons = (episodes + 11) / 12
	}
	return ApiContentItem{
		ID:     a.ID,
		Slug:   a.Slug,
		Title:  a.Title,
		Type:   "anime",
		Format: "TV",
		Status: status,
		Year:   a.ReleaseYear,
		Images: ApiImages{
			Poster: ApiImage{
				URL: a.CoverImageUrl,
			},
			Backdrop: ApiImage{
				URL: coalesceStr(a.BannerImageUrl, a.CoverImageUrl),
			},
		},
		Metadata: ApiContentMetadata{
			Genres:        genres,
			Studio:        studioName,
			Rating:        a.Rating,
			AgeRating:     a.AgeRating,
			Year:          a.ReleaseYear,
			JapaneseTitle: a.JapaneseTitle,
			Synopsis:      a.Synopsis,
		},
		Availability: ApiContentAvailability{
			Watchable: false,
			Episodes:  episodes,
			Seasons:   &seasons,
		},
	}
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

func currentSeason(now time.Time) string {
	m := now.Month()
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

func seasonDisplayName(season string) string {
	switch strings.ToUpper(season) {
	case "WINTER":
		return "Hiver"
	case "SPRING":
		return "Printemps"
	case "SUMMER":
		return "Été"
	case "FALL":
		return "Automne"
	default:
		return season
	}
}

func buildGenreSections(trending, popular []services.AnilistMedia) []ApiSection {
	// Deduplicate and collect genres from the first N items
	genreMap := make(map[string][]ApiContentItem)

	allMedia := append(trending, popular...)
	added := make(map[int]bool)
	for i := range allMedia {
		if added[allMedia[i].ID] {
			continue
		}
		added[allMedia[i].ID] = true

		item := anilistMediaToContentItem(&allMedia[i])
		for _, genre := range allMedia[i].Genres {
			genreMap[genre] = append(genreMap[genre], item)
		}
	}

	// Take the top genres with at least 4 items
	type genreEntry struct {
		name  string
		items []ApiContentItem
	}
	var entries []genreEntry
	for name, items := range genreMap {
		if len(items) >= 4 {
			entries = append(entries, genreEntry{name: name, items: items})
		}
	}

	// Limit to 5 genre sections max
	if len(entries) > 5 {
		entries = entries[:5]
	}

	sections := make([]ApiSection, 0, len(entries))
	genreLabels := map[string]string{
		"Action":        "Action & Aventure",
		"Adventure":     "Aventure",
		"Comedy":        "Comédie",
		"Drama":         "Drames poignants",
		"Fantasy":       "Fantastique",
		"Horror":        "Horreur & Suspense",
		"Romance":       "Romance",
		"Sci-Fi":        "Science-Fiction",
		"Slice of Life": "Tranche de vie",
		"Suspense":      "Suspense",
		"Thriller":      "Thrillers",
		"Supernatural":  "Surnaturel",
		"Mystery":       "Mystère",
		"Sports":        "Sports",
		"Music":         "Musique",
		"Mecha":         "Mecha",
		"Seinen":        "Seinen",
		"Shounen":       "Shounen",
		"Shoujo":        "Shoujo",
		"Josei":         "Josei",
		"Kids":          "Enfants",
		"Ecchi":         "Ecchi",
		"Hentai":        "Hentai",
		"Yuri":          "Yuri",
		"Yaoi":          "Yaoi",
		"Isekai":        "Isekai",
	}
	genreQuery := map[string]string{
		"Action":       "action",
		"Fantasy":      "fantasy",
		"Romance":      "romance",
		"Sci-Fi":       "scifi",
		"Supernatural": "supernatural",
		"Mystery":      "mystery",
		"Thriller":     "thriller",
		"Sports":       "sports",
	}

	for _, entry := range entries {
		label, ok := genreLabels[entry.name]
		if !ok {
			label = entry.name
		}
		query, _ := genreQuery[entry.name]
		ctaHref := "/catalog"
		if query != "" {
			ctaHref = fmt.Sprintf("/catalog?genre=%s", query)
		}

		sections = append(sections, ApiSection{
			ID:       fmt.Sprintf("genre-%s", strings.ToLower(entry.name)),
			Title:    label,
			Type:     "carousel",
			Subtitle: fmt.Sprintf("Les meilleurs %s", strings.ToLower(label)),
			CtaLabel: "Voir tout",
			CtaHref:  ctaHref,
			Items:    entry.items,
		})
	}

	return sections
}

func coalesceStr(values ...string) string {
	for _, v := range values {
		if v != "" {
			return v
		}
	}
	return ""
}

func cleanDesc(desc string) string {
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
