package routes

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/skygenesisenterprise/kami-sama/server/src/interfaces"
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

// GetPublishedCatalog is the discover algorithm: it builds the public page
// automatically from whatever is published in the admin catalog (status =
// 'published'), so no manual collection curation is required.
//
// It returns:
//   - hero:    up to 5 slides selected automatically (rating + featured +
//     having a backdrop, most recent as tie-breaker)
//   - sections: auto-generated rails — À la une (featured), popular, latest,
//     genre rails — all excluding the hero titles to avoid redundancy.
func (h *DiscoverHandler) GetPublishedCatalog(c *gin.Context) {
	ctx := c.Request.Context()

	// Raw material: the whole published catalog (top-rated pool) + latest.
	pool, _, err := h.deps.AnimeService.List(ctx, interfaces.ListAnimeOpts{Page: 1, Limit: 100, Status: "published", Sort: "rating"})
	if err != nil {
		h.deps.Logger.Error("failed to load published catalog (pool)", "error", err)
		utils.Error(c, err)
		return
	}
	latest, _, err := h.deps.AnimeService.List(ctx, interfaces.ListAnimeOpts{Page: 1, Limit: 20, Status: "published", Sort: "created_at"})
	if err != nil {
		h.deps.Logger.Error("failed to load published catalog (latest)", "error", err)
		utils.Error(c, err)
		return
	}
	featuredFlag := true
	featured, _, _ := h.deps.AnimeService.List(ctx, interfaces.ListAnimeOpts{Page: 1, Limit: 20, Status: "published", Featured: &featuredFlag})

	// Hero: up to 5 automatically selected slides, no manual curation.
	hero := selectHeroItems(pool, 5)
	exclude := make(map[string]bool, len(hero))
	for _, item := range hero {
		exclude[item.ID] = true
	}

	sections := make([]ApiSection, 0, 8)

	if featItems := contentItemsExcluding(featured, exclude); len(featItems) > 0 {
		sections = append(sections, ApiSection{
			ID:       "catalog-featured",
			Title:    "À la une",
			Type:     "carousel",
			Subtitle: "Les incontournables de la plateforme",
			CtaLabel: "Voir tout",
			CtaHref:  "/catalog?sort=featured",
			Items:    featItems,
		})
	}

	topItems := contentItemsExcluding(pool, exclude)
	if len(topItems) > 24 {
		topItems = topItems[:24]
	}
	sections = append(sections, ApiSection{
		ID:       "catalog-top",
		Title:    "Les plus populaires",
		Type:     "carousel",
		Subtitle: "Les titres les mieux notés de la plateforme",
		CtaLabel: "Voir tout",
		CtaHref:  "/catalog?sort=popular",
		Items:    topItems,
	})

	latestItems := contentItemsExcluding(latest, exclude)
	if len(latestItems) > 24 {
		latestItems = latestItems[:24]
	}
	sections = append(sections, ApiSection{
		ID:       "catalog-latest",
		Title:    "Nouveautés du catalogue",
		Type:     "carousel",
		Subtitle: "Les dernières sorties publiées sur la plateforme",
		CtaLabel: "Voir tout",
		CtaHref:  "/catalog?sort=latest",
		Items:    latestItems,
	})

	sections = append(sections, buildAnimeGenreSections(pool, exclude)...)

	utils.Success(c, http.StatusOK, gin.H{"hero": hero, "sections": sections})
}

// Search returns published catalog items matching the query, shaped as the
// same ApiContentItem used by the rest of the public discover API so public
// pages (e.g. /search) can render results directly with the existing adapters.
func (h *DiscoverHandler) Search(c *gin.Context) {
	q := strings.TrimSpace(c.Query("q"))
	if q == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "24"))
	if limit < 1 || limit > 50 {
		limit = 24
	}

	items, total, err := h.deps.AnimeService.List(c.Request.Context(), interfaces.ListAnimeOpts{
		Page:   page,
		Limit:  limit,
		Query:  q,
		Status: "published",
		Sort:   "rating",
	})
	if err != nil {
		h.deps.Logger.Error("failed to search published catalog", "query", q, "error", err)
		utils.Error(c, err)
		return
	}

	content := make([]ApiContentItem, 0, len(items))
	for i := range items {
		content = append(content, animeModelToContentItem(&items[i]))
	}
	utils.Success(c, http.StatusOK, gin.H{"items": content, "total": total})
}

// ──────────────────────────────────────────────────────────────
// Detail — single published item by slug (public series/movie pages)
// ──────────────────────────────────────────────────────────────

type ApiEpisode struct {
	ID           string  `json:"id"`
	Number       int     `json:"number"`
	Title        string  `json:"title"`
	Synopsis     string  `json:"synopsis,omitempty"`
	ThumbnailUrl string  `json:"thumbnailUrl"`
	Duration     float64 `json:"duration"`
	IsSubbed     bool    `json:"isSubbed"`
	IsDubbed     bool    `json:"isDubbed"`
}

type ApiSeasonDetail struct {
	ID           string       `json:"id"`
	Number       int          `json:"number"`
	Title        string       `json:"title"`
	EpisodeCount int          `json:"episodeCount"`
	Episodes     []ApiEpisode `json:"episodes"`
}

type ApiContentDetailResponse struct {
	Item    ApiContentItem    `json:"item"`
	Seasons []ApiSeasonDetail `json:"seasons"`
}

// GetItemBySlug returns a single published catalog item — plus its seasons and
// episodes — by slug. It is the real data feed behind the public series/movie
// detail pages (previously served by mock data).
func (h *DiscoverHandler) GetItemBySlug(c *gin.Context) {
	slug := strings.TrimSpace(c.Param("slug"))
	if slug == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	item, err := h.publishedItemBySlug(c.Request.Context(), slug)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, animeModelToDetail(item))
}

// publishedItemBySlug resolves a published catalog item by its slug, falling
// back to the row ID for legacy URLs that carried the provider source id
// (e.g. /movies/848238) before slugs became human-readable.
func (h *DiscoverHandler) publishedItemBySlug(ctx context.Context, slug string) (*models.Anime, error) {
	item, err := h.deps.AnimeService.GetBySlug(ctx, slug)
	if appErr := utils.AsAppError(err); appErr.Status == http.StatusNotFound {
		if legacy, legacyErr := h.deps.AnimeService.GetByID(ctx, slug); legacyErr == nil {
			item = legacy
			err = nil
		}
	}
	if err != nil {
		return nil, err
	}
	// Public safety: only published content is exposed through the public API.
	if item.Status != "published" {
		return nil, utils.NewError(http.StatusNotFound, "ANIME_NOT_FOUND", "The requested anime was not found.", nil)
	}
	return item, nil
}

// plexClient resolves the configured Plex client, mirroring the admin
// integration's resolution order: persisted source config, active media
// source, then environment config.
func (h *DiscoverHandler) plexClient(ctx context.Context) (*services.PlexClient, error) {
	if h.deps.LibraryService != nil {
		if cfg, err := h.deps.LibraryService.GetBySourceType(ctx, "plex"); err == nil && cfg != nil && cfg.Enabled {
			if client, cerr := services.PlexClientFromSourceConfig(cfg); cerr == nil && client.Enabled() {
				return client, nil
			}
		}
	}
	if h.deps.MediaSourceService != nil {
		if plex := h.deps.MediaSourceService.Plex(); plex != nil {
			if client := plex.GetClient(); client != nil && client.Enabled() {
				return client, nil
			}
		}
	}
	cfg := h.deps.Config.MediaSource.Plex
	if cfg.URL != "" && cfg.Token != "" {
		return services.NewPlexClient(services.PlexConfig{
			URL:              cfg.URL,
			Token:            cfg.Token,
			ClientIdentifier: cfg.ClientIdentifier,
			Product:          cfg.Product,
			Version:          cfg.Version,
			Device:           cfg.Device,
			Timeout:          cfg.Timeout,
		}), nil
	}
	return nil, utils.NewError(http.StatusServiceUnavailable, "PLEX_DISABLED", "Plex integration is not enabled or not configured.", nil)
}

// plexSourceIDFromMetadata reads the Plex rating key persisted on a catalog
// row (metadata.sourceId), which is the show key for series and the item key
// for movies.
func plexSourceIDFromMetadata(a *models.Anime) string {
	if len(a.Metadata) == 0 {
		return ""
	}
	var meta map[string]any
	if err := json.Unmarshal(a.Metadata, &meta); err != nil {
		return ""
	}
	if id, ok := meta["sourceId"].(string); ok {
		return id
	}
	return ""
}

// GetStreamURL returns a playable stream URL for a published item — a movie
// streams directly from the item's provider key, a series resolves the
// requested episode against the provider. Titles without a provider source
// (e.g. AniList-only catalog entries) get a STREAM_UNAVAILABLE error so the
// player can show a friendly state.
func (h *DiscoverHandler) GetStreamURL(c *gin.Context) {
	ctx := c.Request.Context()
	slug := strings.TrimSpace(c.Param("slug"))
	episodeID := strings.TrimSpace(c.Query("episodeId"))
	if slug == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	item, err := h.publishedItemBySlug(ctx, slug)
	if err != nil {
		utils.Error(c, err)
		return
	}
	if item.Source != "plex" {
		utils.Error(c, utils.NewError(http.StatusNotFound, "STREAM_UNAVAILABLE", "This title has no streamable source yet.", nil))
		return
	}
	client, err := h.plexClient(ctx)
	if err != nil {
		utils.Error(c, err)
		return
	}

	ratingKey := ""
	isMovie := false
	if episodeID == "" {
		// Movie (or standalone item): the catalog row itself carries the key.
		isMovie = true
		ratingKey = plexSourceIDFromMetadata(item)
		if ratingKey == "" {
			utils.Error(c, utils.NewError(http.StatusNotFound, "STREAM_UNAVAILABLE", "This title has no streamable source yet.", nil))
			return
		}
	} else {
		// Series: locate the episode row (with its season number) and resolve
		// the matching provider key on demand.
		var episode *models.Episode
		seasonNumber := 0
		for i := range item.Seasons {
			season := &item.Seasons[i]
			for j := range season.Episodes {
				if season.Episodes[j].ID == episodeID {
					episode = &season.Episodes[j]
					seasonNumber = season.Number
					break
				}
			}
			if episode != nil {
				break
			}
		}
		if episode == nil {
			utils.Error(c, utils.ErrEpisodeNotFound)
			return
		}
		showKey := plexSourceIDFromMetadata(item)
		if showKey == "" {
			utils.Error(c, utils.NewError(http.StatusNotFound, "STREAM_UNAVAILABLE", "This title has no streamable source yet.", nil))
			return
		}
		ratingKey, err = services.ResolvePlexEpisodeKey(ctx, client, showKey, seasonNumber, episode.Number)
		if err != nil {
			utils.Error(c, err)
			return
		}
	}

	streamURL, err := services.BuildPlexStreamURL(ctx, client, ratingKey, "native")
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{
		"streamUrl": streamURL,
		"title":     item.Title,
		"isMovie":   isMovie,
	})
}

// ProxyStream serves the playable HLS manifest (and every segment / variant
// it references) as a *same-origin* asset. Plex's universal transcode
// endpoint only sends CORS headers inconsistently, so handing its URL
// directly to hls.js yields NETWORK_ERROR on every browser except the user's
// Plex host. This proxy resolves the slug + optional episodeId server-side,
// fetches the upstream URL with the X-Plex-Token attached as a HEADER
// (Plex accepts both header and query token auth), and writes the response
// back to the browser untouched.
//
// Two routes feed into this handler:
//
//   - GET /api/v1/discover/item/:slug/stream/proxy/manifest
//                                       -> master playlist (rewritten)
//   - GET /api/v1/discover/item/:slug/stream/proxy/segment/*origin
//                                       -> segment / variant proxied from Plex
//
// We don't rely on relative URL resolution against the manifest URL because
// Plex's variants carry ABSOLUTE URLs (browser would CORS-fail) and segments
// resolve to a directory we don't control. Instead the manifest rewriter
// turns every URL line in the playlist into an absolute URL pointing at our
// own `/segment/<origin>` endpoint with the upstream path URL-encoded in
// the trailing segment. hls.js then issues fully-absolute same-origin
// requests that always land back in this same handler.
func (h *DiscoverHandler) ProxyStream(c *gin.Context) {
	ctx := c.Request.Context()
	slug := strings.TrimSpace(c.Param("slug"))
	episodeID := strings.TrimSpace(c.Query("episodeId"))
	// gin returns the wildcard without a leading slash for paths like
	// /proxy/segment/foo.ts and as "/" for the bare /proxy route. Normalise.
	subpath := strings.TrimLeft(strings.TrimPrefix(c.Param("subpath"), "/"), "/")

	if slug == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}

	item, err := h.publishedItemBySlug(ctx, slug)
	if err != nil {
		utils.Error(c, err)
		return
	}
	if item.Source != "plex" {
		utils.Error(c, utils.NewError(http.StatusNotFound, "STREAM_UNAVAILABLE", "This title has no streamable source yet.", nil))
		return
	}

	client, err := h.plexClient(ctx)
	if err != nil {
		utils.Error(c, err)
		return
	}

	ratingKey := ""
	if episodeID == "" {
		// Movie (or standalone item): the catalog row itself carries the key.
		ratingKey = plexSourceIDFromMetadata(item)
		if ratingKey == "" {
			utils.Error(c, utils.NewError(http.StatusNotFound, "STREAM_UNAVAILABLE", "This title has no streamable source yet.", nil))
			return
		}
	} else {
		// Series: locate the episode row (with its season number) and resolve
		// the matching provider key on demand.
		var episode *models.Episode
		seasonNumber := 0
	findEpisode:
		for i := range item.Seasons {
			season := &item.Seasons[i]
			for j := range season.Episodes {
				if season.Episodes[j].ID == episodeID {
					episode = &season.Episodes[j]
					seasonNumber = season.Number
					break findEpisode
				}
			}
		}
		if episode == nil {
			utils.Error(c, utils.ErrEpisodeNotFound)
			return
		}
		showKey := plexSourceIDFromMetadata(item)
		if showKey == "" {
			utils.Error(c, utils.NewError(http.StatusNotFound, "STREAM_UNAVAILABLE", "This title has no streamable source yet.", nil))
			return
		}
		ratingKey, err = services.ResolvePlexEpisodeKey(ctx, client, showKey, seasonNumber, episode.Number)
		if err != nil {
			utils.Error(c, err)
			return
		}
	}

	manifestURL, err := services.BuildPlexStreamURL(ctx, client, ratingKey, "native")
	if err != nil {
		utils.Error(c, err)
		return
	}

	// `subpath` is either:
	//   - ""          -> root /stream/proxy route, serve the master playlist
	//   - "manifest"  -> explicit /stream/proxy/manifest route, ditto
	//   - "segment/<origin>" -> /stream/proxy/segment/* route: serve that sub-resource
	//
	// Anything else ("manifest/<something>", no prefix, etc.) we treat as a
	// malformed request and 404.
	serveManifest := subpath == "" || subpath == "manifest"
	var segmentRelativeRef string
	if !serveManifest {
		if !strings.HasPrefix(subpath, "segment/") {
			utils.Error(c, utils.NewError(http.StatusNotFound, "STREAM_PROXY_PATH", "Unknown proxy subpath: "+subpath, nil))
			return
		}
		// Strip the wildcard path so we hold only the URL-encoded upstream
		// reference (e.g. `%2Fvideo%2F%3A%2F%3A%2Ftranscode%2Funiversal%2F0.ts`).
		raw := strings.TrimPrefix(subpath, "segment/")
		// Decode percent-escapes — the manifest rewriter encodes everything
		// (slashes, colons, query params) so the path can ride inside our
		// proxy URL without breaking gin routing. Without this we'd ask Plex
		// for `/start%2Fvideo%2F...` which never resolves.
		if decoded, derr := url.PathUnescape(raw); derr == nil {
			segmentRelativeRef = decoded
		} else {
			segmentRelativeRef = raw
		}
	}

	scheme := "http"
	if c.Request.TLS != nil || strings.EqualFold(c.GetHeader("X-Forwarded-Proto"), "https") {
		scheme = "https"
	}
	proxyBaseURL := scheme + "://" + c.Request.Host

	var targetURL string
	if serveManifest {
		targetURL = manifestURL
	} else {
		targetURL, err = buildPlexSegmentURL(manifestURL, segmentRelativeRef)
		if err != nil {
			utils.Error(c, utils.NewError(http.StatusBadGateway, "STREAM_PROXY_FAILED", "Could not build segment URL: "+err.Error(), nil))
			return
		}
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, targetURL, nil)
	if err != nil {
		utils.Error(c, utils.NewError(http.StatusBadGateway, "STREAM_PROXY_FAILED", "Could not build upstream request: "+err.Error(), nil))
		return
	}
	req.Header.Set("Accept", "*/*")
	// Send the Plex token via header (not query) so it never leaves the
	// backend's request boundary. The identity headers (Client-Identifier,
	// Product, Version, Device) are mandatory for the universal transcode
	// endpoint — Plex refuses with HTTP 400 when they're missing.
	req.Header.Set("X-Plex-Token", client.Token())
	for k, v := range client.PlexIdentity() {
		if v != "" {
			req.Header.Set(k, v)
		}
	}
	req.Header.Set("X-Plex-Platform", "Go")

	httpClient := &http.Client{Timeout: 90 * time.Second}
	resp, err := httpClient.Do(req)
	if err != nil {
		utils.Error(c, utils.NewError(http.StatusBadGateway, "STREAM_UNAVAILABLE", "Could not reach Plex stream endpoint: "+err.Error(), nil))
		return
	}
	defer resp.Body.Close()

	// Forward the cacheability / content headers as Plex sent them.
	for _, k := range []string{"Content-Type", "Content-Length", "Cache-Control", "Last-Modified", "ETag"} {
		if v := resp.Header.Get(k); v != "" {
			c.Header(k, v)
		}
	}

	// Write the upstream status BEFORE piping the body. Letting Gin default
	// to 200 then asking it to override after `io.CopyN` (which flushes the
	// response) emits the famous GIN warning "Headers were already written.
	// Wanted to override status code 200 with N" and leaves the wire status
	// mismatched from the body — the browser then treats a 400-upstream page
	// like a successful HLS manifest.
	c.Writer.WriteHeader(resp.StatusCode)

	// Always log Plex upstream's status, even on 2xx. Catches conflict cases
	// where Plex transit / relay servers (e.g. `*.plex.direct`) reject media
	// endpoints with 400/500 while metadata/library stay reachable — without
	// this trace, the operator can't tell "code bug" from "Plex unreachable".
	h.deps.Logger.Info(
		"plex stream proxy upstream response",
		"slug", slug,
		"serve_manifest", serveManifest,
		"upstream_status", resp.StatusCode,
		"upstream_content_type", resp.Header.Get("Content-Type"),
	)

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		// Surface Plex's error verbatim so the user understands it's a source
		// issue (server unreachable, relay blocked, transcode refused) and not
		// something the proxy introduced. Logged above so the operator can
		// correlate with the request ID from the http_request middleware.
		body, _ := io.ReadAll(io.LimitReader(resp.Body, 8<<10))
		h.deps.Logger.Warn(
			"plex stream proxy upstream non-2xx",
			"slug", slug,
			"status", resp.StatusCode,
			"body", strings.TrimSpace(string(body)),
		)
		_, _ = c.Writer.Write(body)
		return
	}

	if serveManifest && resp.StatusCode >= 200 && resp.StatusCode < 300 {
		// Read & rewrite the manifest so every URL line points at our proxy's
		// segment endpoint instead of Plex's CORS-blocked URL.
		body, err := io.ReadAll(io.LimitReader(resp.Body, 2<<20))
		if err == nil {
			rewritten := rewriteStreamManifest(string(body), proxyBaseURL, slug)
			c.Header("Content-Type", "application/vnd.apple.mpegurl")
			_, _ = c.Writer.WriteString(rewritten)
			return
		}
		// Fall through to streaming if buffer fails. Status is already
		// written above.
	}

	_, _ = io.Copy(c.Writer, resp.Body)
}

// buildPlexSegmentURL pivots the upstream master playlist URL into the URL
// of a specific sub-resource (variant playlist or .ts segment). The master
// playlist address Plex returns for a transcode session is:
//
//	{base}/video/:/transcode/universal/start?path=…&X-Plex-Token=…
//
// The relative references inside that playlist resolve to files served
// next to `start`, e.g. `{base}/video/:/transcode/universal/0.m3u8` or
// `{base}/video/:/transcode/universal/segment-0.ts`. Absolute references
// in the master are usually the full upstream URL with the `start` segment
// replaced by the variant filename. Both shapes are accepted via the
// `origin` parameter: an absolute path (`/video/…`) is appended after the
// upstream host, a relative name (`0.m3u8`) is appended under the transcode
// prefix (replacing `/start`).
func buildPlexSegmentURL(manifestURL, origin string) (string, error) {
	u, err := url.Parse(manifestURL)
	if err != nil {
		return "", err
	}
	if strings.HasPrefix(origin, "/") {
		// Origin is already an absolute path on the Plex host.
		u.Path = origin
	} else {
		// Bare filename — append under the transcode universal prefix,
		// replacing the `start` leaf that kick-started the session.
		base := strings.TrimSuffix(u.Path, "/start")
		u.Path = base + "/" + origin
	}
	// The token travels in the header, not the URL — strip any query
	// string from the manifest URL when forwarding as a segment URL.
	q := u.Query()
	q.Del("X-Plex-Token")
	u.RawQuery = q.Encode()
	return u.String(), nil
}

// rewriteStreamManifest converts every URL line in an HLS manifest (whether
// absolute, like `http://plex/...`, or relative, like `0.ts`) into an
// absolute URL pointing at our same-origin proxy. This sidesteps three
// issues with raw Plex URLs in the browser:
//
//  1. Plex rarely sends `Access-Control-Allow-Origin` headers.
//  2. Variant playlists in master playlists are typically absolute, so
//     relative URL resolution against the manifest URL doesn't reach them
//     (hls.js would otherwise fetch them directly from Plex => CORS fail).
//  3. The transcode session ID is opaque: the only safe way to traverse
//     it is to proxy every related fetch and let the backend's same
//     request reach Plex.
//
// Lines starting with `#` (HLS tags) are left untouched.
func rewriteStreamManifest(manifest, proxyBaseURL, slug string) string {
	var out strings.Builder
	lines := strings.Split(manifest, "\n")
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" || strings.HasPrefix(trimmed, "#") {
			out.WriteString(line)
			out.WriteString("\n")
			continue
		}
		if !looksLikeStreamURL(trimmed) {
			out.WriteString(line)
			out.WriteString("\n")
			continue
		}
		origin := trimmed
		if u, err := url.Parse(trimmed); err == nil && u.Scheme != "" && u.Host != "" {
			origin = strings.TrimPrefix(u.Path, "/")
		}
		// Encode the upstream path so every troublesome character (slashes,
		// colons, dots) rides inside one URL segment. url.PathEscape leaves
		// slashes unescaped which would break gin's catch-all routing — use
		// url.QueryEscape instead, which escapes the full RFC 3986 reserved
		// set, then have the proxy decode it before forwarding to Plex.
		rewritten := fmt.Sprintf(
			"%s%s/api/v1/discover/item/%s/stream/proxy/segment/%s",
			proxyBaseURL, basePathFromRequest(proxyBaseURL), slug, url.QueryEscape(origin),
		)
		out.WriteString(rewritten)
		out.WriteString("\n")
	}
	return out.String()
}

// basePathFromRequest strips the scheme+host from a base URL so the rewritten
// segment URL can be rebuilt as `<host><basepath>/api/v1/...` regardless of
// whether the operator serves everything at `/` or under a sub-path.
func basePathFromRequest(baseURL string) string {
	if i := strings.Index(baseURL, "://"); i >= 0 {
		baseURL = baseURL[i+3:]
		if j := strings.Index(baseURL, "/"); j >= 0 {
			return baseURL[j:]
		}
	}
	return ""
}

func looksLikeStreamURL(s string) bool {
	// Some Plex manifests append a `?session=…` query to each URL line; strip
	// it before checking the suffix so we still recognise the file extension.
	check := s
	if i := strings.Index(check, "?"); i >= 0 {
		check = check[:i]
	}
	for _, suffix := range []string{".m3u8", ".ts", ".aac", ".mp4", ".webm", ".vtt", ".m4s", ".mpd"} {
		if strings.HasSuffix(check, suffix) {
			return true
		}
	}
	return false
}

// animeModelToDetail builds the public detail payload (item header + seasons
// with their episodes) from a catalog row, reusing animeModelToContentItem for
// the header so every public surface stays consistent.
func animeModelToDetail(a *models.Anime) ApiContentDetailResponse {
	seasons := make([]ApiSeasonDetail, 0, len(a.Seasons))
	for _, s := range a.Seasons {
		episodes := make([]ApiEpisode, 0, len(s.Episodes))
		for _, e := range s.Episodes {
			episodes = append(episodes, ApiEpisode{
				ID:           e.ID,
				Number:       e.Number,
				Title:        e.Title,
				Synopsis:     e.Synopsis,
				ThumbnailUrl: e.ThumbnailUrl,
				Duration:     e.Duration,
				IsSubbed:     e.IsSubbed,
				IsDubbed:     e.IsDubbed,
			})
		}
		seasons = append(seasons, ApiSeasonDetail{
			ID:           s.ID,
			Number:       s.Number,
			Title:        s.Title,
			EpisodeCount: s.EpisodeCount,
			Episodes:     episodes,
		})
	}
	return ApiContentDetailResponse{
		Item:    animeModelToContentItem(a),
		Seasons: seasons,
	}
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

// selectHeroItems scores published items (rating, featured flag, backdrop,
// recency as tie-breaker) and returns the top N as hero slides — so the hero
// is always populated automatically, no manual curation needed.
func selectHeroItems(items []models.Anime, max int) []ApiContentItem {
	type scored struct {
		item  ApiContentItem
		score float64
	}
	all := make([]scored, 0, len(items))
	for i := range items {
		a := &items[i]
		score := a.Rating
		if a.IsFeatured {
			score += 30
		}
		if a.BannerImageUrl != "" {
			score += 10
		}
		score += float64(a.ReleaseYear) / 1000.0
		all = append(all, scored{item: animeModelToContentItem(a), score: score})
	}
	sort.SliceStable(all, func(i, j int) bool { return all[i].score > all[j].score })
	out := make([]ApiContentItem, 0, max)
	for _, s := range all {
		if len(out) >= max {
			break
		}
		out = append(out, s.item)
	}
	return out
}

// contentItemsExcluding maps models to API items, skipping any id in exclude
// so rails don't repeat the hero titles.
func contentItemsExcluding(items []models.Anime, exclude map[string]bool) []ApiContentItem {
	out := make([]ApiContentItem, 0, len(items))
	for i := range items {
		if !exclude[items[i].ID] {
			out = append(out, animeModelToContentItem(&items[i]))
		}
	}
	return out
}

func mapAnilistMediaToContentItems(media []services.AnilistMedia) []ApiContentItem {
	items := make([]ApiContentItem, 0, len(media))
	for i := range media {
		items = append(items, anilistMediaToContentItem(&media[i]))
	}
	return items
}

// contentFormatFromMetadata resolves the public content type/format of a
// catalog row from its stored provider metadata. AniList imports record the
// media format (e.g. "MOVIE", "TV", "OVA") while Plex imports record the
// canonical library type ("Movie", "Series") — both are already persisted on
// the anime rows created from the admin catalog. Rows without any type hint
// default to a series so nothing is mislabelled.
func contentFormatFromMetadata(meta map[string]any) (contentType, format string) {
	contentType, format = "anime", "tv"
	if raw, ok := meta["format"].(string); ok {
		switch strings.ToLower(raw) {
		case "movie":
			return "movie", "movie"
		case "tv", "tv_short":
			return "anime", strings.ToLower(raw)
		case "ova", "ona", "special":
			return strings.ToLower(raw), strings.ToLower(raw)
		}
	}
	if raw, ok := meta["type"].(string); ok {
		switch strings.ToLower(raw) {
		case "movie":
			return "movie", "movie"
		case "series", "show":
			return "anime", "tv"
		}
	}
	return contentType, format
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

	// Preserve the real content type published from the admin catalog: a
	// movie must stay a movie (e.g. /movies/ route, “Film” label) instead of
	// being flattened into a series. Also surface the provider popularity as
	// the rating count shown on the public detail pages.
	var ratingCount *int
	contentType, format := "anime", "tv"
	if len(a.Metadata) > 0 {
		var meta map[string]any
		if err := json.Unmarshal(a.Metadata, &meta); err == nil {
			contentType, format = contentFormatFromMetadata(meta)
			if pop, ok := meta["popularity"].(float64); ok && pop > 0 {
				n := int(pop)
				ratingCount = &n
			}
		}
	}

	episodes := a.TotalEpisodes
	seasons := len(a.Seasons)
	if seasons == 0 {
		seasons = 1
		if episodes > 12 {
			seasons = (episodes + 11) / 12
		}
	}
	// Movies carry no seasons; omit the count so the frontend maps them to a
	// movie (no season rail, /movies/ path).
	var seasonCount *int
	if contentType != "movie" {
		seasonCount = &seasons
	}
	return ApiContentItem{
		ID:     a.ID,
		Slug:   a.Slug,
		Title:  a.Title,
		Type:   contentType,
		Format: format,
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
			RatingCount:   ratingCount,
			AgeRating:     a.AgeRating,
			Year:          a.ReleaseYear,
			JapaneseTitle: a.JapaneseTitle,
			Synopsis:      a.Synopsis,
		},
		Availability: ApiContentAvailability{
			Watchable: a.Status == "published",
			Episodes:  episodes,
			Seasons:   seasonCount,
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

// Shared genre display labels & catalog query slugs for the discover rails.
var discoverGenreLabels = map[string]string{
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

var discoverGenreQuery = map[string]string{
	"Action":       "action",
	"Fantasy":      "fantasy",
	"Romance":      "romance",
	"Sci-Fi":       "scifi",
	"Supernatural": "supernatural",
	"Mystery":      "mystery",
	"Thriller":     "thriller",
	"Sports":       "sports",
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

	for _, entry := range entries {
		label, ok := discoverGenreLabels[entry.name]
		if !ok {
			label = entry.name
		}
		query, _ := discoverGenreQuery[entry.name]
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

// buildAnimeGenreSections groups published catalog items by genre into a few
// rails (max 5, genres with at least 3 items), mirroring the AniList rails.
// Items whose id is in exclude (e.g. hero slides) are skipped.
func buildAnimeGenreSections(items []models.Anime, exclude map[string]bool) []ApiSection {
	genreMap := make(map[string][]ApiContentItem)
	seen := make(map[string]bool)
	for i := range items {
		if exclude[items[i].ID] || seen[items[i].ID] {
			continue
		}
		seen[items[i].ID] = true
		item := animeModelToContentItem(&items[i])
		for _, genre := range items[i].Genres {
			genreMap[genre.Name] = append(genreMap[genre.Name], item)
		}
	}

	type genreEntry struct {
		name  string
		items []ApiContentItem
	}
	var entries []genreEntry
	for name, items := range genreMap {
		if len(items) >= 3 {
			entries = append(entries, genreEntry{name: name, items: items})
		}
	}
	if len(entries) > 5 {
		entries = entries[:5]
	}

	sections := make([]ApiSection, 0, len(entries))
	for _, entry := range entries {
		label, ok := discoverGenreLabels[entry.name]
		if !ok {
			label = entry.name
		}
		query, _ := discoverGenreQuery[entry.name]
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
