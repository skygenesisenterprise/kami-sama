package services

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
)

// PlexClient implements a low-level HTTP client for the Plex Media Server
// (a.k.a. "Plex API v2") using JSON responses.
//
// Plex returns XML by default. We negotiate JSON via the "Accept: application/json"
// header which Plex respects on most endpoints. The MediaContainer wrapper is the
// standard envelope around all responses.
type PlexClient struct {
	baseURL           string
	token             string
	clientIdentifier string
	product           string
	version           string
	device            string
	httpClient        *http.Client
	timeout           time.Duration
}

// PlexConfig is the wiring struct for PlexClient. It mirrors config.PlexConfig
// to keep this package independent.
type PlexConfig struct {
	URL              string
	Token            string
	ClientIdentifier string
	Product          string
	Version          string
	Device           string
	Timeout          time.Duration
}

// NewPlexClient creates a PlexClient with validated headers.
func NewPlexClient(cfg PlexConfig) *PlexClient {
	timeout := cfg.Timeout
	if timeout <= 0 {
		timeout = 30 * time.Second
	}
	product := cfg.Product
	if product == "" {
		product = "KamiSama"
	}
	version := cfg.Version
	if version == "" {
		version = "1.0.0"
	}
	device := cfg.Device
	if device == "" {
		device = "Server"
	}
	clientID := cfg.ClientIdentifier
	if clientID == "" {
		clientID = "kamisama-server"
	}
	return &PlexClient{
		baseURL:           strings.TrimRight(cfg.URL, "/"),
		token:             cfg.Token,
		clientIdentifier: clientID,
		product:           product,
		version:           version,
		device:            device,
		httpClient:        &http.Client{Timeout: timeout},
		timeout:           timeout,
	}
}

// Enabled reports whether the client is fully wired (URL + token).
func (c *PlexClient) Enabled() bool {
	return c != nil && c.baseURL != "" && c.token != ""
}

// Name returns the provider identifier used by the multiplexer.
func (c *PlexClient) Name() string { return "plex" }

// BaseURL returns the configured base URL (for absolute path building).
func (c *PlexClient) BaseURL() string { return c.baseURL }

// Token returns the configured X-Plex-Token.
func (c *PlexClient) Token() string { return c.token }

// plexResponse mirrors Plex's standard JSON envelope.
type plexResponse struct {
	MediaContainer *plexMediaContainer `json:"MediaContainer"`
}

// plexMediaContainer loosely models Plex's MediaContainer object. Plex emits
// many duplicated fields as arrays (e.g. Genre) and unknown shapes, so we
// keep Metadata/Directory/Hub as flexible slices of maps. The full body is
// also preserved as a raw map for callers that need access to extension
// fields.
type plexMediaContainer struct {
	Size         int                      `json:"size"`
	TotalSize    int                      `json:"totalSize"`
	Offset       int                      `json:"offset"`
	Art          string                   `json:"art"`
	Thumb        string                   `json:"thumb"`
	Title1       string                   `json:"title1"`
	Title2       string                   `json:"title2"`
	Directory    []map[string]interface{} `json:"Directory"`
	Metadata     []map[string]interface{} `json:"Metadata"`
	Hub          []map[string]interface{} `json:"Hub"`
	Meta         []map[string]interface{} `json:"Meta"`
	Raw          map[string]interface{}
}

// plexDisabledError returns the canonical "not configured" sentinel matching
// the AniList pattern so route handlers can surface it via utils.Error.
func plexDisabledError() error {
	return utils.NewError(http.StatusServiceUnavailable, "PLEX_DISABLED", "Plex integration is not enabled or not configured.", nil)
}

// doRequest performs a request against Plex and returns the parsed
// MediaContainer. Errors are normalized into app errors with proper status codes.
func (c *PlexClient) doRequest(ctx context.Context, method, path string, query url.Values) (*plexMediaContainer, error) {
	if !c.Enabled() {
		return nil, plexDisabledError()
	}
	u := c.baseURL + path
	if len(query) > 0 {
		u += "?" + query.Encode()
	}
	req, err := http.NewRequestWithContext(ctx, method, u, nil)
	if err != nil {
		return nil, utils.NewError(http.StatusInternalServerError, "PLEX_REQUEST_FAILED", "Failed to build Plex request: "+err.Error(), nil)
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("X-Plex-Token", c.token)
	req.Header.Set("X-Plex-Client-Identifier", c.clientIdentifier)
	req.Header.Set("X-Plex-Product", c.product)
	req.Header.Set("X-Plex-Version", c.version)
	req.Header.Set("X-Plex-Device", c.device)
	req.Header.Set("X-Plex-Platform", "Go")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, utils.NewError(http.StatusBadGateway, "PLEX_REQUEST_FAILED", "Failed to reach Plex server: "+err.Error(), nil)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(io.LimitReader(resp.Body, 10<<20))
	if err != nil {
		return nil, utils.NewError(http.StatusBadGateway, "PLEX_READ_FAILED", "Failed to read Plex response: "+err.Error(), nil)
	}
	if resp.StatusCode == http.StatusUnauthorized || resp.StatusCode == http.StatusForbidden {
		return nil, utils.NewError(http.StatusUnauthorized, "PLEX_INVALID_TOKEN", "Plex rejected the provided X-Plex-Token.", map[string]any{
			"status":   resp.StatusCode,
			"endpoint": path,
		})
	}
	if resp.StatusCode == http.StatusNotFound {
		return nil, utils.NewError(http.StatusNotFound, "PLEX_NOT_FOUND", "Plex resource not found: "+path, nil)
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, utils.NewError(resp.StatusCode, "PLEX_API_ERROR", fmt.Sprintf("Plex returned an unexpected status (%d) on %s %s", resp.StatusCode, method, path), map[string]any{
			"body": string(body),
		})
	}

	var pr plexResponse
	if err := json.Unmarshal(body, &pr); err != nil {
		return nil, utils.NewError(http.StatusInternalServerError, "PLEX_DECODE_FAILED", "Failed to decode Plex response: "+err.Error(), map[string]any{
			"snippet": truncateForError(string(body), 512),
		})
	}
	if pr.MediaContainer == nil {
		return nil, utils.NewError(http.StatusInternalServerError, "PLEX_INVALID_PAYLOAD", "Plex response was missing the MediaContainer envelope.", nil)
	}
	// Preserve full raw envelope so callers can access fields we don't model.
	_ = json.Unmarshal(body, &pr.MediaContainer.Raw)
	return pr.MediaContainer, nil
}

func truncateForError(s string, max int) string {
	if len(s) <= max {
		return s
	}
	return s[:max] + "..."
}

// ---- Library endpoints ------------------------------------------------------

// ListLibraries returns the configured libraries (sections) on the server.
func (c *PlexClient) ListLibraries(ctx context.Context) ([]map[string]interface{}, []string, error) {
	mc, err := c.doRequest(ctx, http.MethodGet, "/library/sections", nil)
	if err != nil {
		return nil, nil, err
	}
	keys := make([]string, 0, len(mc.Directory))
	for _, dir := range mc.Directory {
		keys = append(keys, toString(dir["key"]))
	}
	return mc.Directory, keys, nil
}

// GetLibrary returns a single library by its Plex key.
func (c *PlexClient) GetLibrary(ctx context.Context, libraryID string) (map[string]interface{}, error) {
	libs, _, err := c.ListLibraries(ctx)
	if err != nil {
		return nil, err
	}
	for _, lib := range libs {
		if toString(lib["key"]) == libraryID || toString(lib["uuid"]) == libraryID {
			return lib, nil
		}
	}
	return nil, utils.NewError(http.StatusNotFound, "PLEX_LIBRARY_NOT_FOUND", "Plex library not found: "+libraryID, nil)
}

// ListLibraryItems returns items in a library, optionally filtered by type
// (Plex type: "1"=movie, "2"=show, "3"=season, "4"=episode).
func (c *PlexClient) ListLibraryItems(ctx context.Context, libraryID, filterType string, limit, offset int) ([]map[string]interface{}, int, error) {
	q := url.Values{}
	if filterType != "" {
		q.Set("type", filterType)
	}
	if limit > 0 {
		q.Set("X-Plex-Container-Size", strconv.Itoa(limit))
		q.Set("X-Plex-Container-Start", strconv.Itoa(offset))
	}
	mc, err := c.doRequest(ctx, http.MethodGet, "/library/sections/"+libraryID+"/all", q)
	if err != nil {
		return nil, 0, err
	}
	total := mc.TotalSize
	if total == 0 {
		total = mc.Size
	}
	return mc.Metadata, total, nil
}

// GetItemMetadata returns full metadata for a single ratingKey.
func (c *PlexClient) GetItemMetadata(ctx context.Context, ratingKey string) (map[string]interface{}, error) {
	mc, err := c.doRequest(ctx, http.MethodGet, "/library/metadata/"+ratingKey, nil)
	if err != nil {
		return nil, err
	}
	if len(mc.Metadata) == 0 {
		return nil, utils.NewError(http.StatusNotFound, "PLEX_ITEM_NOT_FOUND", "Plex item not found: "+ratingKey, nil)
	}
	return mc.Metadata[0], nil
}

// GetItemChildren returns the children of a ratingKey (e.g. seasons under a show, episodes under a season).
func (c *PlexClient) GetItemChildren(ctx context.Context, ratingKey string) ([]map[string]interface{}, error) {
	mc, err := c.doRequest(ctx, http.MethodGet, "/library/metadata/"+ratingKey+"/children", nil)
	if err != nil {
		return nil, err
	}
	return mc.Metadata, nil
}

// SearchItems returns hits from /library/search. Optional type filter narrows results.
func (c *PlexClient) SearchItems(ctx context.Context, query, filterType string, limit int) ([]map[string]interface{}, error) {
	q := url.Values{}
	q.Set("query", query)
	if filterType != "" {
		q.Set("type", filterType)
	}
	if limit > 0 {
		q.Set("X-Plex-Container-Size", strconv.Itoa(limit))
	}
	mc, err := c.doRequest(ctx, http.MethodGet, "/library/search", q)
	if err != nil {
		return nil, err
	}
	return combineSearchResults(mc), nil
}

// Hub represents a single recommendation hub (a themed shelf).
type PlexHub struct {
	HubIdentifier string
	Title         string
	Type          string
	Size          int
	Items         []map[string]interface{}
}

// ListHubs returns recommendation hubs. When libraryID is empty, the global hubs endpoint is used.
func (c *PlexClient) ListHubs(ctx context.Context, libraryID string) ([]PlexHub, error) {
	var path string
	if libraryID == "" {
		path = "/hubs"
	} else {
		path = "/hubs/sections/" + libraryID
	}
	mc, err := c.doRequest(ctx, http.MethodGet, path, nil)
	if err != nil {
		return nil, err
	}
	hubs := make([]PlexHub, 0, len(mc.Hub))
	for _, h := range mc.Hub {
		hub := PlexHub{
			HubIdentifier: toString(h["hubIdentifier"]),
			Title:         toString(h["title"]),
			Type:          toString(h["type"]),
			Size:          toInt(h["size"]),
		}
		if items, ok := h["Metadata"].([]interface{}); ok {
			for _, raw := range items {
				if m, ok := raw.(map[string]interface{}); ok {
					hub.Items = append(hub.Items, m)
				}
			}
		}
		hubs = append(hubs, hub)
	}
	return hubs, nil
}

// GetIdentity returns the server's identity from GET /.
func (c *PlexClient) GetIdentity(ctx context.Context) (map[string]interface{}, error) {
	mc, err := c.doRequest(ctx, http.MethodGet, "/", nil)
	if err != nil {
		return nil, err
	}
	return mc.Raw, nil
}

// RefreshLibrary triggers a metadata refresh for the given library.
func (c *PlexClient) RefreshLibrary(ctx context.Context, libraryID string) error {
	_, err := c.doRequest(ctx, http.MethodGet, "/library/sections/"+libraryID+"/refresh", nil)
	return err
}

// Scrobble marks a ratingKey as watched.
func (c *PlexClient) Scrobble(ctx context.Context, ratingKey string) error {
	q := url.Values{}
	q.Set("key", ratingKey)
	q.Set("identifier", "com.plexapp.plugins.library")
	_, err := c.doRequest(ctx, http.MethodGet, "/:/scrobble", q)
	return err
}

// Unscrobble removes a watched mark.
func (c *PlexClient) Unscrobble(ctx context.Context, ratingKey string) error {
	q := url.Values{}
	q.Set("key", ratingKey)
	q.Set("identifier", "com.plexapp.plugins.library")
	_, err := c.doRequest(ctx, http.MethodGet, "/:/unscrobble", q)
	return err
}

// UpdateTimeline pushes a playback timeline event to Plex.
func (c *PlexClient) UpdateTimeline(ctx context.Context, ratingKey, state string, timeMs int64, durationMs int64) error {
	q := url.Values{}
	q.Set("ratingKey", ratingKey)
	q.Set("key", ratingKey)
	q.Set("state", state)
	q.Set("time", strconv.FormatInt(timeMs, 10))
	q.Set("duration", strconv.FormatInt(durationMs, 10))
	_, err := c.doRequest(ctx, http.MethodGet, "/:/timeline", q)
	return err
}

// combineSearchResults flattens metadata-like fields returned by /library/search.
//
// Plex may return results under "Metadata", "Meta", or "Directory" inside the
// container; we aggregate everything that looks like a content entry so
// callers get a single, consistent list.
func combineSearchResults(mc *plexMediaContainer) []map[string]interface{} {
	out := mc.Metadata
	out = append(out, mc.Meta...)
	out = append(out, mc.Directory...)
	return out
}

// ---- Safe field helpers ----------------------------------------------------

func toString(v interface{}) string {
	switch val := v.(type) {
	case nil:
		return ""
	case string:
		return val
	case float64:
		return strconv.FormatFloat(val, 'f', -1, 64)
	case int:
		return strconv.Itoa(val)
	case int64:
		return strconv.FormatInt(val, 10)
	case bool:
		return strconv.FormatBool(val)
	default:
		return fmt.Sprintf("%v", val)
	}
}

func toFloat(v interface{}) float64 {
	switch val := v.(type) {
	case nil:
		return 0
	case float64:
		return val
	case float32:
		return float64(val)
	case int:
		return float64(val)
	case int64:
		return float64(val)
	case string:
		f, _ := strconv.ParseFloat(val, 64)
		return f
	default:
		return 0
	}
}

func toInt(v interface{}) int {
	switch val := v.(type) {
	case nil:
		return 0
	case int:
		return val
	case int64:
		return int(val)
	case float64:
		return int(val)
	case string:
		i, _ := strconv.Atoi(val)
		return i
	default:
		return 0
	}
}
