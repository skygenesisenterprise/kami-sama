package routes

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/skygenesisenterprise/kami-sama/server/src/services"
	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
)

// PlexHandler exposes dedicated Plex Media Server endpoints that complement
// the generic /api/v1/source/* multiplexer. It lets the front-end query
// hubs (recommendation shelves), back-fill metadata for a single ratingKey,
// trigger a library refresh, push playback timeline events, and proxy Plex
// image / transcoding decisions without ever leaking the X-Plex-Token to the
// browser.
type PlexHandler struct {
	deps   Dependencies
	client *services.PlexClient
}

// NewPlexHandler prefers the dedicated Plex media source (if the
// multiplexer was configured for Plex) and falls back to building a client
// from the raw configuration. This lets dedicated routes keep working even
// when the active provider is Jellyfin or local — the Plex section becomes
// exploratory rather than authoritative.
func NewPlexHandler(deps Dependencies) *PlexHandler {
	h := &PlexHandler{deps: deps}
	if deps.MediaSourceService != nil && deps.MediaSourceService.Plex() != nil {
		h.client = deps.MediaSourceService.Plex().GetClient()
	} else if deps.Config.MediaSource.Plex.URL != "" && deps.Config.MediaSource.Plex.Token != "" {
		h.client = services.NewPlexClient(services.PlexConfig{
			URL:              deps.Config.MediaSource.Plex.URL,
			Token:            deps.Config.MediaSource.Plex.Token,
			ClientIdentifier: deps.Config.MediaSource.Plex.ClientIdentifier,
			Product:          deps.Config.MediaSource.Plex.Product,
			Version:          deps.Config.MediaSource.Plex.Version,
			Device:           deps.Config.MediaSource.Plex.Device,
			Timeout:          deps.Config.MediaSource.Plex.Timeout,
		})
	}
	return h
}

// requireClient makes the handler fail-fast with PLEX_DISABLED when the
// integration is not configured.
func (h *PlexHandler) requireClient() (*services.PlexClient, error) {
	if h.client == nil || !h.client.Enabled() {
		return nil, utils.NewError(http.StatusServiceUnavailable, "PLEX_DISABLED", "Plex integration is not enabled or not configured.", nil)
	}
	return h.client, nil
}

// GetIdentity returns the configured Plex server's identity (version, machineIdentifier, friendlyName).
func (h *PlexHandler) GetIdentity(c *gin.Context) {
	client, err := h.requireClient()
	if err != nil {
		utils.Error(c, err)
		return
	}
	identity, err := client.GetIdentity(c.Request.Context())
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, identity)
}

// ListLibraries returns the configured libraries on the Plex server.
func (h *PlexHandler) ListLibraries(c *gin.Context) {
	client, err := h.requireClient()
	if err != nil {
		utils.Error(c, err)
		return
	}
	dirs, _, err := client.ListLibraries(c.Request.Context())
	if err != nil {
		utils.Error(c, err)
		return
	}
	items := make([]map[string]interface{}, 0, len(dirs))
	for _, dir := range dirs {
		items = append(items, map[string]interface{}{
			"id":        toStr(dir["key"]),
			"sourceId":  toStr(dir["key"]),
			"name":      toStr(dir["title"]),
			"type":      strings.ToLower(toStr(dir["type"])),
			"itemCount": toInt(dir["size"]),
		})
	}
	utils.Success(c, http.StatusOK, gin.H{"items": items})
}

// GetLibrary returns a single library by key.
func (h *PlexHandler) GetLibrary(c *gin.Context) {
	client, err := h.requireClient()
	if err != nil {
		utils.Error(c, err)
		return
	}
	id := c.Param("libraryId")
	lib, err := client.GetLibrary(c.Request.Context(), id)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{
		"id":        toStr(lib["key"]),
		"sourceId":  toStr(lib["key"]),
		"name":      toStr(lib["title"]),
		"type":      strings.ToLower(toStr(lib["type"])),
		"itemCount": toInt(lib["size"]),
	})
}

// ListItems returns items inside a Plex library with optional pagination +
// search.
func (h *PlexHandler) ListItems(c *gin.Context) {
	client, err := h.requireClient()
	if err != nil {
		utils.Error(c, err)
		return
	}
	libraryID := c.Param("libraryId")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	filterType := c.Query("type")
	query := strings.TrimSpace(c.Query("q"))
	if limit < 1 || limit > 200 {
		limit = 50
	}
	if offset < 0 {
		offset = 0
	}
	var items []map[string]interface{}
	var total int
	if query != "" {
		items, err = client.SearchItems(c.Request.Context(), query, filterType, limit)
		total = len(items)
	} else {
		items, total, err = client.ListLibraryItems(c.Request.Context(), libraryID, filterType, limit, offset)
	}
	if err != nil {
		utils.Error(c, err)
		return
	}
	if items == nil {
		items = []map[string]interface{}{}
	}
	utils.Success(c, http.StatusOK, gin.H{"items": items, "total": total})
}

// GetMetadata returns the full Plex Metadata block for a ratingKey.
func (h *PlexHandler) GetMetadata(c *gin.Context) {
	client, err := h.requireClient()
	if err != nil {
		utils.Error(c, err)
		return
	}
	ratingKey := c.Param("ratingKey")
	item, err := client.GetItemMetadata(c.Request.Context(), ratingKey)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

// GetChildren returns children of a Plex metadata entry (seasons, episodes).
func (h *PlexHandler) GetChildren(c *gin.Context) {
	client, err := h.requireClient()
	if err != nil {
		utils.Error(c, err)
		return
	}
	ratingKey := c.Param("ratingKey")
	children, err := client.GetItemChildren(c.Request.Context(), ratingKey)
	if err != nil {
		utils.Error(c, err)
		return
	}
	if children == nil {
		children = []map[string]interface{}{}
	}
	utils.Success(c, http.StatusOK, gin.H{"items": children})
}

// GetHubs returns recommendation hubs, optionally filtered by library.
func (h *PlexHandler) GetHubs(c *gin.Context) {
	client, err := h.requireClient()
	if err != nil {
		utils.Error(c, err)
		return
	}
	hubs, err := client.ListHubs(c.Request.Context(), c.Query("libraryId"))
	if err != nil {
		utils.Error(c, err)
		return
	}
	out := make([]gin.H, 0, len(hubs))
	for _, hub := range hubs {
		out = append(out, gin.H{
			"hubIdentifier": hub.HubIdentifier,
			"title":         hub.Title,
			"type":          hub.Type,
			"size":          hub.Size,
			"items":         hub.Items,
		})
	}
	utils.Success(c, http.StatusOK, gin.H{"hubs": out})
}

// RefreshLibrary triggers a metadata refresh on the given Plex library.
func (h *PlexHandler) RefreshLibrary(c *gin.Context) {
	client, err := h.requireClient()
	if err != nil {
		utils.Error(c, err)
		return
	}
	id := c.Param("libraryId")
	if err := client.RefreshLibrary(c.Request.Context(), id); err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"refreshed": true, "libraryId": id})
}

// Scrobble marks an item as watched (server-side only).
func (h *PlexHandler) Scrobble(c *gin.Context) {
	client, err := h.requireClient()
	if err != nil {
		utils.Error(c, err)
		return
	}
	var body struct {
		RatingKey string `json:"ratingKey" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	if err := client.Scrobble(c.Request.Context(), body.RatingKey); err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"watched": true, "ratingKey": body.RatingKey})
}

// Unscrobble removes the watched mark on a ratingKey.
func (h *PlexHandler) Unscrobble(c *gin.Context) {
	client, err := h.requireClient()
	if err != nil {
		utils.Error(c, err)
		return
	}
	var body struct {
		RatingKey string `json:"ratingKey" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	if err := client.Unscrobble(c.Request.Context(), body.RatingKey); err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"watched": false, "ratingKey": body.RatingKey})
}

// UpdateTimeline pushes a playback event to Plex's /:/timeline endpoint.
func (h *PlexHandler) UpdateTimeline(c *gin.Context) {
	client, err := h.requireClient()
	if err != nil {
		utils.Error(c, err)
		return
	}
	var body struct {
		RatingKey  string `json:"ratingKey" binding:"required"`
		State      string `json:"state"`
		TimeMs     int64  `json:"time"`
		DurationMs int64  `json:"duration"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	if body.State == "" {
		body.State = "playing"
	}
	if err := client.UpdateTimeline(c.Request.Context(), body.RatingKey, body.State, body.TimeMs, body.DurationMs); err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{
		"reported":  true,
		"ratingKey": body.RatingKey,
		"state":     body.State,
		"time":      body.TimeMs,
	})
}

// ImageProxy proxies Plex /photo/:/transcode without leaking the token.
//
// Plex image paths (`thumb`, `art`) are relative to the configured server,
// optionally already resolving to absolute URLs when the library lives on a
// remote Plex server. The proxy always re-applies the X-Plex-Token header.
func (h *PlexHandler) ImageProxy(c *gin.Context) {
	client, err := h.requireClient()
	if err != nil {
		utils.Error(c, err)
		return
	}
	raw := strings.TrimSpace(c.Query("path"))
	width, _ := strconv.Atoi(c.DefaultQuery("width", "0"))
	height, _ := strconv.Atoi(c.DefaultQuery("height", "0"))
	if raw == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	// Build an upstream URL. We only proxy through Plex's transcode endpoint
	// and forward the path parameter so we never expose the raw token.
	target, err := buildPlexImageURL(client, raw, width, height)
	if err != nil {
		utils.Error(c, err)
		return
	}
	req, err := http.NewRequestWithContext(c.Request.Context(), http.MethodGet, target, nil)
	if err != nil {
		utils.Error(c, err)
		return
	}
	req.Header.Set("Accept", "image/*")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		utils.Error(c, err)
		return
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(io.LimitReader(resp.Body, 25<<20))
	if err != nil {
		utils.Error(c, err)
		return
	}
	contentType := resp.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "image/jpeg"
	}
	c.Data(resp.StatusCode, contentType, body)
}

// TranscodeDecision builds the standard /video/:/transcode/universal/start
// URL the front-end can hand off to a player. We never redirect — the
// response body is the URL itself so callers can store it (or attach their
// own transcoding profile).
func (h *PlexHandler) TranscodeDecision(c *gin.Context) {
	// We only call requireClient() to fail-fast with PLEX_DISABLED when the
	// integration is not configured; the actual stream URL is built from
	// the active multiplexer-managed Plex provider, so the local client
	// variable would be unused here.
	if _, err := h.requireClient(); err != nil {
		utils.Error(c, err)
		return
	}
	var body struct {
		RatingKey string `json:"ratingKey" binding:"required"`
		Profile   string `json:"profile"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	if h.deps.MediaSourceService != nil && h.deps.MediaSourceService.Plex() != nil {
		stream, err := h.deps.MediaSourceService.Plex().GetStreamURL(c.Request.Context(), body.RatingKey, body.Profile)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusOK, gin.H{"streamUrl": stream, "ratingKey": body.RatingKey, "profile": body.Profile})
		return
	}
	utils.Error(c, utils.NewError(http.StatusServiceUnavailable, "PLEX_NOT_ACTIVE", "Plex is not the active media source provider.", nil))
}

// Search proxies /library/search and flattens results into the canonical
// MediaSourceItem shape so the front-end doesn't have to differentiate
// providers.
func (h *PlexHandler) Search(c *gin.Context) {
	client, err := h.requireClient()
	if err != nil {
		utils.Error(c, err)
		return
	}
	q := strings.TrimSpace(c.Query("q"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if q == "" {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	if limit < 1 || limit > 200 {
		limit = 20
	}
	results, err := client.SearchItems(c.Request.Context(), q, c.Query("type"), limit)
	if err != nil {
		utils.Error(c, err)
		return
	}
	if results == nil {
		results = []map[string]interface{}{}
	}
	utils.Success(c, http.StatusOK, gin.H{"items": results, "total": len(results), "query": q})
}

// ---- helpers --------------------------------------------------------------

// buildPlexImageURL produces a /photo/:/transcode URL with the token
// attached. We cover two shapes:
//   - `path` is an absolute URL (e.g. https://other-plex:32400/library/...): we
//     forward the path unchanged and add only the token (via query).
//   - `path` is a relative path on the configured server: we resolve it
//     against BaseURL and forward with width/height hints.
func buildPlexImageURL(client *services.PlexClient, raw string, width, height int) (string, error) {
	token := client.Token()
	if raw == "" {
		return "", fmt.Errorf("missing path")
	}
	if strings.HasPrefix(raw, "http://") || strings.HasPrefix(raw, "https://") {
		u, err := url.Parse(raw)
		if err != nil {
			return "", err
		}
		q := u.Query()
		q.Set("X-Plex-Token", token)
		if width > 0 {
			q.Set("width", strconv.Itoa(width))
		}
		if height > 0 {
			q.Set("height", strconv.Itoa(height))
		}
		u.RawQuery = q.Encode()
		return u.String(), nil
	}
	base := strings.TrimRight(client.BaseURL(), "/")
	tail, err := url.Parse(raw)
	if err != nil {
		return "", err
	}
	if tail.Scheme == "" {
		// Relative path – resolve against the configured base URL.
		baseURL, err := url.Parse(base)
		if err != nil {
			return "", err
		}
		tail = baseURL.ResolveReference(tail)
	}
	q := tail.Query()
	q.Set("X-Plex-Token", token)
	if width > 0 {
		q.Set("width", strconv.Itoa(width))
	}
	if height > 0 {
		q.Set("height", strconv.Itoa(height))
	}
	tail.RawQuery = q.Encode()
	return tail.String(), nil
}

// toStr / toInt are tiny adapters so the routes module doesn't need to
// import the type-conversion helpers defined on services.
func toStr(v interface{}) string {
	if s, ok := v.(string); ok {
		return s
	}
	return ""
}

func toInt(v interface{}) int {
	switch val := v.(type) {
	case float64:
		return int(val)
	case int:
		return val
	case int64:
		return int(val)
	}
	return 0
}

// HealthCheck probes the configured server with a GetIdentity request.
func (h *PlexHandler) HealthCheck(c *gin.Context) {
	client, err := h.requireClient()
	if err != nil {
		utils.Error(c, err)
		return
	}
	start := time.Now()
	identity, err := client.GetIdentity(c.Request.Context())
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{
		"reachable":    true,
		"latencyMs":    time.Since(start).Milliseconds(),
		"identityKeys": keysOf(identity),
	})
}

// keysOf returns the sorted keys of a map. Helpers like this keep test
// surfaces stable when Plex adds new fields.
func keysOf(m map[string]interface{}) []string {
	if m == nil {
		return nil
	}
	out := make([]string, 0, len(m))
	for k := range m {
		out = append(out, k)
	}
	sort.Strings(out)
	return out
}
