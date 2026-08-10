package services

import (
	"context"
	"encoding/json"
	"fmt"
	"net/url"
	"strconv"
	"strings"
	"time"

	"gorm.io/datatypes"
	"gorm.io/gorm"

	"github.com/skygenesisenterprise/kami-sama/server/src/models"
)

// PlexMediaSource is a thin provider wrapper that adapts PlexMediaServer
// responses to the canonical MediaSourceItem shape consumed by the routes
// multiplexer. It also owns the SyncLibrary strategy that writes Plex rows
// into the local anime index so the front-end can serve them without round
// trips back to Plex on every request.
type PlexMediaSource struct {
	client *PlexClient
	db     *gorm.DB
}

// NewPlexMediaSource instantiates a provider backed by the given client.
func NewPlexMediaSource(client *PlexClient, db *gorm.DB) *PlexMediaSource {
	return &PlexMediaSource{client: client, db: db}
}

// Name identifies the provider.
func (s *PlexMediaSource) Name() string { return "plex" }

// GetClient returns the underlying PlexClient (used by dedicated Plex routes
// that bypass the multiplexer — e.g. /api/v1/integrations/plex/identity).
func (s *PlexMediaSource) GetClient() *PlexClient { return s.client }

// enabled fails fast when the client is missing or not configured.
func (s *PlexMediaSource) enabled() error {
	if s.client == nil || !s.client.Enabled() {
		return plexDisabledError()
	}
	return nil
}

// ---- Library / items ----------------------------------------------------

func (s *PlexMediaSource) ListLibraries(ctx context.Context) ([]map[string]interface{}, error) {
	if err := s.enabled(); err != nil {
		return nil, err
	}
	dirs, _, err := s.client.ListLibraries(ctx)
	if err != nil {
		return nil, err
	}
	out := make([]map[string]interface{}, 0, len(dirs))
	for _, dir := range dirs {
		out = append(out, mapPlexLibrary(dir))
	}
	return out, nil
}

func (s *PlexMediaSource) GetLibrary(ctx context.Context, id string) (map[string]interface{}, error) {
	if err := s.enabled(); err != nil {
		return nil, err
	}
	lib, err := s.client.GetLibrary(ctx, id)
	if err != nil {
		return nil, err
	}
	return mapPlexLibrary(lib), nil
}

func (s *PlexMediaSource) ListItems(ctx context.Context, libraryID string, limit, offset int, sortBy, query string) ([]map[string]interface{}, int, error) {
	if err := s.enabled(); err != nil {
		return nil, 0, err
	}
	if limit <= 0 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}
	// Plex pagination is encoded into X-Plex-Container-Size /
	// X-Plex-Container-Start and is opaque; if a sort/query came from the
	// client we still pass them but Plex may honour only a subset.
	if query != "" {
		items, err := s.client.SearchItems(ctx, query, "", limit)
		if err == nil {
			return convertPlexItems(items), len(items), nil
		}
		// Fall through to library listing if search fails for some reason.
	}
	items, total, err := s.client.ListLibraryItems(ctx, libraryID, "", limit, offset)
	if err != nil {
		return nil, 0, err
	}
	return convertPlexItems(items), total, nil
}

func (s *PlexMediaSource) GetItem(ctx context.Context, id string) (map[string]interface{}, error) {
	if err := s.enabled(); err != nil {
		return nil, err
	}
	item, err := s.client.GetItemMetadata(ctx, id)
	if err != nil {
		return nil, err
	}
	return mapPlexItem(item), nil
}

func (s *PlexMediaSource) SearchItems(ctx context.Context, query string, limit int) ([]map[string]interface{}, error) {
	if err := s.enabled(); err != nil {
		return nil, err
	}
	if limit <= 0 {
		limit = 20
	}
	items, err := s.client.SearchItems(ctx, query, "", limit)
	if err != nil {
		return nil, err
	}
	return convertPlexItems(items), nil
}

// ---- Playback -----------------------------------------------------------

func (s *PlexMediaSource) GetStreamURL(ctx context.Context, itemID string, profile string) (string, error) {
	if err := s.enabled(); err != nil {
		return "", err
	}
	return BuildPlexStreamURL(ctx, s.client, itemID, profile)
}

// GetStreamURLForItem is a thin alias exposed for symmetry with the legacy
// `static bool` API of the Jellyfin/Legacy providers; the platform uses a
// string codec profile and we forward the call through GetStreamURL so
// downstream integration stays one-line of code.
func (s *PlexMediaSource) GetStreamURLForItem(ctx context.Context, itemID string) (string, error) {
	return s.GetStreamURL(ctx, itemID, "native")
}

func (s *PlexMediaSource) GetPlaybackInfo(ctx context.Context, itemID string) (map[string]interface{}, error) {
	if err := s.enabled(); err != nil {
		return nil, err
	}
	item, err := s.client.GetItemMetadata(ctx, itemID)
	if err != nil {
		return nil, err
	}
	info := mapPlexItem(item)
	if streamURL, err := s.GetStreamURL(ctx, itemID, "native"); err == nil {
		info["streamUrl"] = streamURL
	}
	return info, nil
}

func (s *PlexMediaSource) ReportPlaybackProgress(ctx context.Context, itemID string, positionTicks int64, stopped bool) error {
	if err := s.enabled(); err != nil {
		return err
	}
	state := "playing"
	if stopped {
		state = "stopped"
	}
	// Plex accepts milliseconds; positionTicks is the canonical platform tick
	// (1 tick = 100 ns), so convert accordingly.
	timeMs := positionTicks / int64(time.Millisecond)
	item, err := s.client.GetItemMetadata(ctx, itemID)
	durationMs := int64(0)
	if err == nil {
		if d, ok := item["duration"].(float64); ok {
			durationMs = int64(d)
		}
	}
	return s.client.UpdateTimeline(ctx, itemID, state, timeMs, durationMs)
}

// ---- Maintenance --------------------------------------------------------

func (s *PlexMediaSource) SyncLibrary(ctx context.Context, libraryID string) (map[string]interface{}, error) {
	if err := s.enabled(); err != nil {
		return nil, err
	}
	if s.db == nil {
		return nil, fmt.Errorf("database unavailable")
	}
	now := time.Now().UTC()
	log := models.SourceSyncLog{
		Common:     models.Common{ID: now.Format("20060102150405") + "-" + libraryID, CreatedAt: now, UpdatedAt: now},
		LibraryID:  libraryID,
		SourceType: "plex",
		Status:     "running",
		StartedAt:  now,
	}
	if err := s.db.Create(&log).Error; err != nil {
		return nil, err
	}

	pageSize := 100
	created, updated := 0, 0
	offset := 0
	for {
		items, total, err := s.client.ListLibraryItems(ctx, libraryID, "", pageSize, offset)
		if err != nil {
			completedAt := time.Now().UTC()
			errMsg := err.Error()
			log.Status = "failed"
			log.ErrorMessage = &errMsg
			log.CompletedAt = &completedAt
			s.db.Save(&log)
			return nil, err
		}
		for _, it := range items {
			mapped := mapPlexItem(it)
			sourceID := getStringFromMap(mapped, "sourceId")
			if sourceID == "" {
				sourceID = toString(it["ratingKey"])
			}
			if sourceID == "" {
				continue
			}
			rawMeta, _ := json.Marshal(mapped)
			existing := models.Anime{}
			tx := s.db.Where("source = ? AND metadata->>'sourceId' = ?", "plex", sourceID).First(&existing)
			if tx.Error == gorm.ErrRecordNotFound {
				row := models.Anime{
				Common:        models.Common{ID: sourceID, CreatedAt: time.Now().UTC(), UpdatedAt: time.Now().UTC()},
				Slug:          uniqueSlug(ctx, s.db, generateSlug(getStringFromMap(mapped, "name"))),
				Title:         getStringFromMap(mapped, "name"),
					JapaneseTitle: getStringFromMap(mapped, "originalTitle"),
					Synopsis:      getStringFromMap(mapped, "overview"),
					Status:        "released",
					Rating:        getFloat64FromMap(mapped, "rating"),
					ReleaseYear:   getIntFromMap(mapped, "year"),
					Source:        "plex",
					Metadata:      datatypes.JSON(rawMeta),
				}
				if err := s.db.Create(&row).Error; err == nil {
					created++
				}
			} else if tx.Error == nil {
				existing.Title = getStringFromMap(mapped, "name")
				existing.UpdatedAt = time.Now().UTC()
				existing.Metadata = datatypes.JSON(rawMeta)
				if err := s.db.Save(&existing).Error; err == nil {
					updated++
				}
			}
		}
		offset += pageSize
		if total > 0 && offset >= total {
			break
		}
		if len(items) < pageSize {
			break
		}
	}

	completedAt := time.Now().UTC()
	log.ItemsCreated = created
	log.ItemsUpdated = updated
	log.CompletedAt = &completedAt
	log.Status = "completed"
	s.db.Save(&log)

	// Best-effort refresh trigger so Plex re-scans the library after we read
	// it (helps catch metadata updates without polling).
	_ = s.client.RefreshLibrary(ctx, libraryID)

	return map[string]interface{}{
		"libraryId":    libraryID,
		"source":       "plex",
		"itemsCreated": created,
		"itemsUpdated": updated,
		"itemsRemoved": 0,
		"startedAt":    now,
		"completedAt":  completedAt,
	}, nil
}

func (s *PlexMediaSource) GetSyncStatus(ctx context.Context, libraryID string) (map[string]interface{}, error) {
	if err := s.enabled(); err != nil {
		return nil, err
	}
	if s.db == nil {
		return nil, fmt.Errorf("database unavailable")
	}
	var log models.SourceSyncLog
	s.db.Where("source_type = ? AND library_id = ?", "plex", libraryID).Order("created_at DESC").First(&log)
	status := "idle"
	if log.Status != "" {
		status = log.Status
	}
	var lastSync *time.Time = log.CompletedAt
	var errMsg string
	if log.ErrorMessage != nil {
		errMsg = *log.ErrorMessage
	}
	return map[string]interface{}{
		"libraryId":    libraryID,
		"source":       "plex",
		"lastSyncAt":   lastSync,
		"status":       status,
		"itemCount":    log.ItemsCreated + log.ItemsUpdated,
		"errorMessage": errMsg,
	}, nil
}

// BuildPlexStreamURL produces the standard /video/:/transcode/universal/start
// URL for a ratingKey using any resolved PlexClient (env-configured or loaded
// from a persisted source_configs row).
//
// The returned URL points straight at the Plex Media Server and is handed to
// the browser's <video> element; the token travels as a query parameter
// because the media stream is fetched by the browser, not by the API server.
//
// profile is reserved for future transcoding profiles (e.g. forcing a codec).
// When empty or "native", no codec params are sent and Plex picks the most
// compatible stream for the player (direct play when possible, transcode
// otherwise) — which is the safe default for browser playback.
func BuildPlexStreamURL(ctx context.Context, client *PlexClient, ratingKey string, profile string) (string, error) {
	if client == nil || !client.Enabled() {
		return "", plexDisabledError()
	}
	if ratingKey == "" {
		return "", fmt.Errorf("itemID required")
	}
	item, err := client.GetItemMetadata(ctx, ratingKey)
	if err != nil {
		return "", err
	}
	media := firstMedia(item)
	if media == nil {
		return "", fmt.Errorf("no media part available for %s", ratingKey)
	}
	part := firstPart(media)
	if part == nil {
		return "", fmt.Errorf("no part available for %s", ratingKey)
	}
	path := toString(part["key"])
	if path == "" {
		return "", fmt.Errorf("part has no key")
	}
	return buildPlexUniversalStreamURL(client.BaseURL(), path, client.Token(), profile)
}

// buildPlexUniversalStreamURL assembles the /video/:/transcode/universal/start
// URL for a media part path. The universal transcode endpoint is the only one
// that honors the path/mediaIndex/partIndex/protocol query parameters — hitting
// the server root with these params returns the Plex web app HTML instead of a
// stream. protocol is pinned to "hls" so Plex emits an HLS master playlist that
// the same-origin proxy can re-write for the browser.
func buildPlexUniversalStreamURL(baseURL, partPath, token, profile string) (string, error) {
	u, err := url.Parse(baseURL)
	if err != nil {
		return "", err
	}
	u.Path = strings.TrimRight(u.Path, "/") + "/video/:/transcode/universal/start"
	q := u.Query()
	q.Set("path", partPath)
	q.Set("mediaIndex", "0")
	q.Set("partIndex", "0")
	// protocol must be one of hls/dash/http — Plex returns HTTP 400 for any
	// other value. "hls" is what the player needs; it is NOT derived from the
	// URL scheme (http/https), that was the bug that 400'd every request.
	q.Set("protocol", "hls")
	// Force remux/transcode into browser-compatible MPEG-TS segments —
	// browsers cannot direct-play MKV containers.
	q.Set("directPlay", "0")
	if profile == "" {
		profile = "native"
	}
	q.Set("session", "kamisama-"+fmt.Sprintf("%x", len(partPath)))
	q.Set("X-Plex-Token", token)
	u.RawQuery = q.Encode()
	return u.String(), nil
}

// ResolvePlexEpisodeKey maps a catalog (season, episode) pair to the Plex
// ratingKey of the matching episode under the show, by listing the show's
// leaves and matching parentIndex/index. Catalog rows only store the show
// key (metadata.sourceId), so episode keys are resolved on demand.
func ResolvePlexEpisodeKey(ctx context.Context, client *PlexClient, showKey string, seasonNumber, episodeNumber int) (string, error) {
	if client == nil || !client.Enabled() {
		return "", plexDisabledError()
	}
	if showKey == "" {
		return "", fmt.Errorf("show key required")
	}
	episodes, err := client.GetShowEpisodes(ctx, showKey)
	if err != nil {
		return "", err
	}
	for _, ep := range episodes {
		if toInt(ep["parentIndex"]) == seasonNumber && toInt(ep["index"]) == episodeNumber {
			if key := toString(ep["ratingKey"]); key != "" {
				return key, nil
			}
		}
	}
	return "", fmt.Errorf("episode %d of season %d not found on provider", episodeNumber, seasonNumber)
}

// ImportPlexItem fetches a single Plex item by ratingKey and upserts it into
// the local anime index (deduplicated by source + metadata->>'sourceId').
// It returns the canonical MediaSourceItem shape plus import metadata so the
// UI can reflect the result immediately.
func ImportPlexItem(ctx context.Context, db *gorm.DB, client *PlexClient, ratingKey string) (map[string]interface{}, error) {
	if client == nil || !client.Enabled() {
		return nil, plexDisabledError()
	}
	if db == nil {
		return nil, fmt.Errorf("database unavailable")
	}
	if ratingKey == "" {
		return nil, fmt.Errorf("ratingKey required")
	}
	raw, err := client.GetItemMetadata(ctx, ratingKey)
	if err != nil {
		return nil, err
	}
	mapped := mapPlexItem(raw)
	sourceID := getStringFromMap(mapped, "sourceId")
	if sourceID == "" {
		sourceID = ratingKey
	}
	rawMeta, _ := json.Marshal(mapped)
	now := time.Now().UTC()

	existing := models.Anime{}
	tx := db.Where("source = ? AND metadata->>'sourceId' = ?", "plex", sourceID).First(&existing)
	if tx.Error == gorm.ErrRecordNotFound {
		row := models.Anime{
			Common:         models.Common{ID: sourceID, CreatedAt: now, UpdatedAt: now},
			Slug:           uniqueSlug(ctx, db, generateSlug(getStringFromMap(mapped, "name"))),
			Title:          getStringFromMap(mapped, "name"),
			JapaneseTitle:  getStringFromMap(mapped, "originalTitle"),
			Synopsis:       getStringFromMap(mapped, "overview"),
			CoverImageUrl:  getStringFromMap(mapped, "imageUrl"),
			BannerImageUrl: getStringFromMap(mapped, "artUrl"),
			Status:         "added",
			Rating:         getFloat64FromMap(mapped, "rating"),
			ReleaseYear:    getIntFromMap(mapped, "year"),
			Source:         "plex",
			Metadata:       datatypes.JSON(rawMeta),
		}
		if err := db.Create(&row).Error; err != nil {
			return nil, err
		}
		return map[string]interface{}{
			"item":     mapped,
			"animeId":  row.ID,
			"created":  true,
			"updated":  false,
			"sourceId": sourceID,
			"title":    row.Title,
		}, nil
	}
	if tx.Error != nil {
		return nil, tx.Error
	}

	existing.Title = getStringFromMap(mapped, "name")
	existing.UpdatedAt = now
	existing.Metadata = datatypes.JSON(rawMeta)
	// Keep provider artwork in sync so the catalog rows carry the poster and
	// backdrop/banner even before a dedicated asset sync runs. Only overwrite
	// when the provider returns artwork, to avoid clobbering curated images.
	if img := getStringFromMap(mapped, "imageUrl"); img != "" {
		existing.CoverImageUrl = img
	}
	if art := getStringFromMap(mapped, "artUrl"); art != "" {
		existing.BannerImageUrl = art
	}
	if err := db.Save(&existing).Error; err != nil {
		return nil, err
	}
	return map[string]interface{}{
		"item":     mapped,
		"animeId":  existing.ID,
		"created":  false,
		"updated":  true,
		"sourceId": sourceID,
		"title":    existing.Title,
	}, nil
}

// ---- Helpers --------------------------------------------------------------

// mapPlexLibrary converts a Plex Directory into a MediaSourceLibrary map.
func mapPlexLibrary(dir map[string]interface{}) map[string]interface{} {
	out := map[string]interface{}{
		"id":        toString(dir["key"]),
		"sourceId":  toString(dir["key"]),
		"name":      toString(dir["title"]),
		"type":      strings.ToLower(toString(dir["type"])),
		"itemCount": toInt(dir["size"]),
	}
	rawCopy := jsonRawFromDir(dir)
	if rawCopy != nil {
		out["rawMetadata"] = rawCopy
	}
	return out
}

// mapPlexItem converts a Plex Metadata item into the canonical
// MediaSourceItem shape used by the routes.
func mapPlexItem(item map[string]interface{}) map[string]interface{} {
	id := toString(item["ratingKey"])
	if id == "" {
		id = toString(item["key"])
	}
	parent := toString(item["parentRatingKey"])
	grandparent := toString(item["grandparentRatingKey"])
	out := map[string]interface{}{
		"id":            id,
		"sourceId":      id,
		"parentId":      parent,
		"showId":        grandparent,
		"name":          toString(item["title"]),
		"originalTitle": toString(item["originalTitle"]),
		"type":          plexTypeToCanonical(toString(item["type"])),
		"year":          toInt(item["year"]),
		"rating":        toFloat(plexRating(item)),
		"overview":      toString(plexSummary(item)),
		"genres":        plexGenres(item),
		"container":     plexContainer(item),
		"videoCodec":    plexCodec(item, "Video"),
		"audioCodec":    plexCodec(item, "Audio"),
		"width":         plexResolution(item, "width"),
		"height":        plexResolution(item, "height"),
		"bitrate":       plexBitrate(item),
		"imageUrl":      plexImage(item, "thumb"),
		"artUrl":        plexImage(item, "art"),
		"duration":      plexDuration(item),
	}
	if !strings.HasPrefix(strings.ToLower(out["type"].(string)), "show") {
		if v, ok := item["parentIndex"]; ok {
			out["seasonNumber"] = toInt(v)
		}
		if v, ok := item["index"]; ok {
			out["episodeNumber"] = toInt(v)
		}
	}
	rawCopy := jsonRawFromItem(item)
	if rawCopy != nil {
		out["rawMetadata"] = rawCopy
	}
	return out
}

func convertPlexItems(items []map[string]interface{}) []map[string]interface{} {
	out := make([]map[string]interface{}, 0, len(items))
	for _, item := range items {
		out = append(out, mapPlexItem(item))
	}
	return out
}

// MapPlexItems normalizes raw Plex metadata items into the canonical
// MediaSourceItem shape (id, name, imageUrl, artUrl, overview, genres, ...)
// so routes and the front-end never touch provider-specific field names.
func MapPlexItems(items []map[string]interface{}) []map[string]interface{} {
	return convertPlexItems(items)
}

func jsonRawFromItem(item map[string]interface{}) datatypes.JSON {
	raw, err := json.Marshal(item)
	if err != nil {
		return nil
	}
	return datatypes.JSON(raw)
}

func jsonRawFromDir(dir map[string]interface{}) datatypes.JSON {
	return jsonRawFromItem(dir)
}

func plexTypeToCanonical(t string) string {
	switch strings.ToLower(t) {
	case "movie":
		return "Movie"
	case "show":
		return "Series"
	case "season":
		return "Season"
	case "episode":
		return "Episode"
	case "artist":
		return "Artist"
	case "album":
		return "Album"
	case "track":
		return "Track"
	case "photo":
		return "Photo"
	default:
		return strings.Title(t)
	}
}

func plexGenres(item map[string]interface{}) []string {
	raw, ok := item["Genre"].([]interface{})
	if !ok {
		// Some Plex endpoints emit `Genre` as a single object with `tag`.
		if single, ok := item["Genre"].(map[string]interface{}); ok {
			if tag := toString(single["tag"]); tag != "" {
				return []string{tag}
			}
		}
		return nil
	}
	out := make([]string, 0, len(raw))
	for _, g := range raw {
		if m, ok := g.(map[string]interface{}); ok {
			if tag := toString(m["tag"]); tag != "" {
				out = append(out, tag)
			}
		}
	}
	return out
}

func plexRating(item map[string]interface{}) interface{} {
	if r, ok := item["rating"]; ok && r != nil {
		if f, ok := r.(float64); ok && f > 0 {
			return f
		}
	}
	if r, ok := item["audienceRating"]; ok && r != nil {
		if f, ok := r.(float64); ok && f > 0 {
			return f
		}
	}
	return nil
}

func plexSummary(item map[string]interface{}) interface{} {
	if s, ok := item["summary"]; ok && s != nil {
		if str := toString(s); str != "" {
			return str
		}
	}
	if s, ok := item["tagline"]; ok && s != nil {
		if str := toString(s); str != "" {
			return str
		}
	}
	return ""
}

func plexContainer(item map[string]interface{}) string {
	media := firstMedia(item)
	if media == nil {
		return ""
	}
	return toString(media["container"])
}

func plexCodec(item map[string]interface{}, kind string) string {
	media := firstMedia(item)
	if media == nil {
		return ""
	}
	for _, raw := range mediaStreams(media) {
		if streamKindMatches(raw, kind) {
			return toString(raw["codec"])
		}
	}
	return ""
}

func plexResolution(item map[string]interface{}, axis string) int {
	media := firstMedia(item)
	if media == nil {
		return 0
	}
	for _, raw := range mediaStreams(media) {
		if streamKindMatches(raw, "video") {
			return toInt(raw[axis])
		}
	}
	return 0
}

// mediaStreams returns the per-media audio/video/subtitle entries whether
// the upstream field is a single map, an array, or unspecified.
func mediaStreams(media map[string]interface{}) []map[string]interface{} {
	if media == nil {
		return nil
	}
	switch v := media["MediaStreams"].(type) {
	case []interface{}:
		out := make([]map[string]interface{}, 0, len(v))
		for _, raw := range v {
			if m, ok := raw.(map[string]interface{}); ok {
				out = append(out, m)
			}
		}
		return out
	case map[string]interface{}:
		return []map[string]interface{}{v}
	}
	return nil
}

// streamKindMatches accepts Plex's streamType which can be:
//   - numeric (1=video, 2=audio, 3=subtitle)
//   - string ("Video", "Audio", "Subtitle", "video", "audio", "subtitle")
//
// Other forms are returned as not matching so the caller can default to "".
func streamKindMatches(stream map[string]interface{}, want string) bool {
	if stream == nil {
		return false
	}
	wantLower := strings.ToLower(want)
	var wantInt int
	switch wantLower {
	case "video":
		wantInt = 1
	case "audio":
		wantInt = 2
	case "subtitle":
		wantInt = 3
	}
	switch v := stream["streamType"].(type) {
	case float64:
		return int(v) == wantInt
	case int:
		return v == wantInt
	case int64:
		return int(v) == wantInt
	case string:
		got := strings.ToLower(v)
		if got == wantLower {
			return true
		}
		// Plex occasionally returns singular / plural variations.
		switch wantLower {
		case "audio":
			return got == "music"
		case "subtitle":
			return got == "subtitles" || got == "caption" || got == "captions"
		}
	}
	return false
}

func plexBitrate(item map[string]interface{}) int64 {
	media := firstMedia(item)
	if media == nil {
		return 0
	}
	return toInt64(media["bitrate"])
}

func plexDuration(item map[string]interface{}) float64 {
	d := toFloat(item["duration"])
	if d <= 0 {
		return 0
	}
	return d / 1000.0
}

// plexImage extracts a Plex image URL and routes it through the local image
// proxy so the X-Plex-Token never needs to reach the browser. When the value
// is already absolute we still route it through the proxy to keep auth on
// the server side.
func plexImage(item map[string]interface{}, kind string) string {
	val, _ := item[kind].(string)
	if val == "" {
		return ""
	}
	return "/api/v1/integrations/plex/image?path=" + url.QueryEscape(val)
}

func firstMedia(item map[string]interface{}) map[string]interface{} {
	if media, ok := item["Media"].([]interface{}); ok && len(media) > 0 {
		if m, ok := media[0].(map[string]interface{}); ok {
			return m
		}
	}
	return nil
}

func firstPart(media map[string]interface{}) map[string]interface{} {
	if parts, ok := media["Part"].([]interface{}); ok && len(parts) > 0 {
		if p, ok := parts[0].(map[string]interface{}); ok {
			return p
		}
	}
	// Single Part instead of array.
	if single, ok := media["Part"].(map[string]interface{}); ok {
		return single
	}
	return nil
}

func toInt64(v interface{}) int64 {
	switch val := v.(type) {
	case nil:
		return 0
	case int:
		return int64(val)
	case int64:
		return val
	case float64:
		return int64(val)
	case string:
		i, _ := strconv.ParseInt(val, 10, 64)
		return i
	default:
		return 0
	}
}

func getStringFromMap(m map[string]interface{}, key string) string {
	if v, ok := m[key].(string); ok {
		return v
	}
	return ""
}

func getIntFromMap(m map[string]interface{}, key string) int {
	if v, ok := m[key].(int); ok {
		return v
	}
	if v, ok := m[key].(float64); ok {
		return int(v)
	}
	return 0
}

func getFloat64FromMap(m map[string]interface{}, key string) float64 {
	if v, ok := m[key].(float64); ok {
		return v
	}
	if v, ok := m[key].(int); ok {
		return float64(v)
	}
	if v, ok := m[key].(string); ok {
		f, _ := strconv.ParseFloat(v, 64)
		return f
	}
	return 0
}
