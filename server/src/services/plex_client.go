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

	"github.com/skygenesisenterprise/kami-sama/server/src/models"
	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
	"gorm.io/datatypes"
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
	accountToken      string
	clientIdentifier  string
	machineIdentifier string
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
	// AccountToken is the plex.tv account token from the sign-in flow. It is
	// distinct from Token (the server-scoped access token): Plex Media Servers
	// reject account tokens on authenticated endpoints, while plex.tv rejects
	// server tokens. Keeping both lets the client talk to both APIs.
	AccountToken string
	// ClientIdentifier is the X-Plex-Client-Identifier sent on server calls.
	ClientIdentifier string
	// MachineIdentifier is the Plex Media Server's machineIdentifier (e.g.
	// "8r_yEEMP5TZznXFjRuXS"). It identifies the server on app.plex.tv so the
	// integration can resolve the server's local/remote/relay connection URLs.
	MachineIdentifier string
	Product           string
	Version           string
	Device            string
	Timeout           time.Duration
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
		accountToken:      cfg.AccountToken,
		clientIdentifier:  clientID,
		machineIdentifier: cfg.MachineIdentifier,
		product:           product,
		version:           version,
		device:            device,
		httpClient:        &http.Client{Timeout: timeout},
		timeout:           timeout,
	}
}

// plexConfigFromSourceConfig is the JSON shape stored on a source_configs
// row for the plex source type.
type plexConfigFromSourceConfig struct {
	URL               string  `json:"url"`
	Token             string  `json:"token"`
	AccountToken      string  `json:"accountToken"`
	ClientIdentifier  string  `json:"clientIdentifier"`
	MachineIdentifier string  `json:"machineIdentifier"`
	Product           string  `json:"product"`
	Version           string  `json:"version"`
	Device            string  `json:"device"`
	TimeoutSeconds    float64 `json:"timeoutSeconds"`
}

// PlexClientFromSourceConfig builds a PlexClient from a persisted
// source_configs row so the Plex integration can be (re)configured through
// the UI without a server restart. Returns an error when the row is missing
// a url/token pair.
func PlexClientFromSourceConfig(cfg *models.SourceConfig) (*PlexClient, error) {
	if cfg == nil {
		return nil, fmt.Errorf("plex config is nil")
	}
	var raw plexConfigFromSourceConfig
	if err := json.Unmarshal(cfg.Config, &raw); err != nil {
		return nil, fmt.Errorf("invalid plex config: %w", err)
	}
	if raw.URL == "" || raw.Token == "" {
		return nil, fmt.Errorf("plex config missing url or token")
	}
	return NewPlexClient(PlexConfig{
		URL:               raw.URL,
		Token:             raw.Token,
		AccountToken:      raw.AccountToken,
		ClientIdentifier:  raw.ClientIdentifier,
		MachineIdentifier: raw.MachineIdentifier,
		Product:           raw.Product,
		Version:           raw.Version,
		Device:            raw.Device,
		Timeout:           time.Duration(raw.TimeoutSeconds) * time.Second,
	}), nil
}

// MergePlexMachineIdentifier returns the plex source config JSON with the
// server's machineIdentifier set. Unknown keys are preserved, and the input is
// returned unchanged when the identifier already matches or cannot be decoded.
func MergePlexMachineIdentifier(config datatypes.JSON, machineID string) datatypes.JSON {
	if machineID == "" {
		return config
	}
	var meta map[string]interface{}
	if err := json.Unmarshal(config, &meta); err != nil {
		return config
	}
	if meta["machineIdentifier"] == machineID {
		return config
	}
	meta["machineIdentifier"] = machineID
	merged, err := json.Marshal(meta)
	if err != nil {
		return config
	}
	return datatypes.JSON(merged)
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
	Size      int                      `json:"size"`
	TotalSize int                      `json:"totalSize"`
	Offset    int                      `json:"offset"`
	Art       string                   `json:"art"`
	Thumb     string                   `json:"thumb"`
	Title1    string                   `json:"title1"`
	Title2    string                   `json:"title2"`
	Directory    []map[string]interface{} `json:"Directory"`
	Metadata     []map[string]interface{} `json:"Metadata"`
	SearchResult []map[string]interface{} `json:"SearchResult"`
	Hub          []map[string]interface{} `json:"Hub"`
	Meta         []map[string]interface{} `json:"Meta"`
	Raw       map[string]interface{}
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

	contentType := resp.Header.Get("Content-Type")
	if strings.HasPrefix(strings.TrimSpace(string(body)), "<") && !strings.HasPrefix(contentType, "application/json") {
		return nil, utils.NewError(http.StatusBadGateway, "PLEX_HTML_RESPONSE", "Plex returned an HTML/XML response instead of JSON. Check that the server URL points to a Plex Media Server (e.g. http://192.168.1.50:32400) and that the token is valid.", map[string]any{
			"endpoint":    path,
			"contentType": contentType,
			"snippet":     truncateForError(strings.TrimSpace(string(body)), 256),
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
	// Preserve the MediaContainer's own attributes so callers (e.g. identity)
	// can access fields we don't model. Plex wraps everything in a
	// MediaContainer envelope, so we strip that level and keep the inner
	// object — Raw["size"], Raw["machineIdentifier"], etc. are then top-level.
	var rawEnvelope struct {
		MediaContainer map[string]interface{} `json:"MediaContainer"`
	}
	_ = json.Unmarshal(body, &rawEnvelope)
	pr.MediaContainer.Raw = rawEnvelope.MediaContainer
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

// GetIdentity returns the server's identity from GET /identity.
//
// The root path ("/") serves the Plex web app as HTML, so we hit the
// dedicated identity endpoint which honors the JSON Accept header.
func (c *PlexClient) GetIdentity(ctx context.Context) (map[string]interface{}, error) {
	mc, err := c.doRequest(ctx, http.MethodGet, "/identity", nil)
	if err != nil {
		return nil, err
	}
	return mc.Raw, nil
}

// PlexConnection models one connection entry of a Plex server resource as
// returned by app.plex.tv/api/resources.
type PlexConnection struct {
	Protocol string `json:"protocol"`
	Address  string `json:"address"`
	Port     int    `json:"port"`
	URI      string `json:"uri"`
	Local    bool   `json:"local"`
	Relay    bool   `json:"relay"`
}

// PlexServerResource models a Plex Media Server entry in the app.plex.tv
// account resource list. The access token is intentionally not modeled so it
// can never be serialized back to the front-end.
type PlexServerResource struct {
	Name             string           `json:"name"`
	Product          string           `json:"product"`
	Version          string           `json:"version"`
	ClientIdentifier string           `json:"clientIdentifier"`
	Host             string           `json:"host"`
	Port             int              `json:"port"`
	Local            bool             `json:"local"`
	Connections      []PlexConnection `json:"connections"`
}

// ServerConnections resolves the configured server's connection URLs through
// the Plex cloud API (app.plex.tv/api/resources). The stored machineIdentifier
// identifies the server inside the account resource list and is also sent as
// the X-Plex-Client-Identifier, which plex.tv uses to correlate the account
// with the server. The plex.tv request uses the account token (the stored
// token is the server-scoped one, which plex.tv rejects). Returns the matching
// resource, or the sole server resource when no identifier match is possible.
func (c *PlexClient) ServerConnections(ctx context.Context) (*PlexServerResource, error) {
	if !c.Enabled() {
		return nil, plexDisabledError()
	}
	clientID := c.machineIdentifier
	if clientID == "" {
		clientID = c.clientIdentifier
	}
	cloudToken := c.accountToken
	if cloudToken == "" {
		cloudToken = c.token
	}
	servers, err := fetchPlexResources(ctx, cloudToken, clientID, c.timeout)
	if err != nil {
		return nil, err
	}
	for _, server := range servers {
		if server.ClientIdentifier == c.machineIdentifier {
			return &server, nil
		}
	}
	if len(servers) == 1 {
		return &servers[0], nil
	}
	return nil, utils.NewError(http.StatusNotFound, "PLEX_SERVER_NOT_FOUND", "No Plex server resource matched the stored machine identifier.", map[string]any{
		"machineIdentifier": c.machineIdentifier,
	})
}

// DiscoverServers lists every Plex Media Server registered to the account
// behind the given plex.tv token. It lets the UI bootstrap a connection
// without knowing a server URL by exposing each server's connections so the
// front-end can auto-fill the base URL. The token is never returned.
//
// The resources request must use the same client identifier the pin flow was
// registered under — plex.tv binds tokens to a client identifier and rejects
// mismatches with a 401.
func DiscoverServers(ctx context.Context, token string) ([]PlexServerResource, error) {
	servers, err := fetchPlexResources(ctx, strings.TrimSpace(token), PlexClientIdentifier, 30*time.Second)
	if err != nil {
		return nil, err
	}
	if servers == nil {
		servers = []PlexServerResource{}
	}
	return servers, nil
}

// plexDeviceResource is the JSON shape of one device in the
// plex.tv/api/v2/resources payload. Unlike the v1 endpoint, v2 always answers
// with JSON, so the token mismatch and throttling cases stay machine-readable.
type plexDeviceResource struct {
	Name             string `json:"name"`
	Product          string `json:"product"`
	ProductVersion   string `json:"productVersion"`
	Platform         string `json:"platform"`
	Device           string `json:"device"`
	ClientIdentifier string `json:"clientIdentifier"`
	Provides         string `json:"provides"`
	Host             string `json:"host"`
	Port             int    `json:"port"`
	Local            bool   `json:"local"`
	AccessToken      string `json:"accessToken"`
	Connections      []struct {
		Protocol string `json:"protocol"`
		Address  string `json:"address"`
		Port     int    `json:"port"`
		URI      string `json:"uri"`
		Local    bool   `json:"local"`
		Relay    bool   `json:"relay"`
	} `json:"connections"`
}

// PlexServerDevice is a Plex Media Server entry from the raw plex.tv resources
// payload. Unlike PlexServerResource it also carries the server-scoped access
// token required by authenticated server endpoints. The token is tagged
// json:"-" so it can never be accidentally serialized to the front-end.
type PlexServerDevice struct {
	Name             string           `json:"name"`
	Product          string           `json:"product"`
	Version          string           `json:"version"`
	ClientIdentifier string           `json:"clientIdentifier"`
	Host             string           `json:"host"`
	Port             int              `json:"port"`
	Local            bool             `json:"local"`
	Connections      []PlexConnection `json:"connections"`
	AccessToken      string           `json:"-"`
}

// ResolvePlexServerDevice resolves the account's server matching
// clientIdentifier from the raw plex.tv resources (which carry the server
// access token), falling back to the sole server when no identifier matches.
// The returned token is intended to be persisted on the source config so
// authenticated server calls stop being rejected with a 401.
func ResolvePlexServerDevice(ctx context.Context, token, clientIdentifier string) (*PlexServerDevice, error) {
	devices, err := fetchRawPlexResources(ctx, strings.TrimSpace(token), PlexClientIdentifier, 30*time.Second)
	if err != nil {
		return nil, err
	}
	if clientIdentifier != "" {
		for i := range devices {
			if devices[i].ClientIdentifier == clientIdentifier {
				return plexDeviceResourceToServer(devices[i]), nil
			}
		}
	}
	if len(devices) == 1 {
		return plexDeviceResourceToServer(devices[0]), nil
	}
	return nil, utils.NewError(http.StatusNotFound, "PLEX_SERVER_NOT_FOUND", "No Plex Media Server matched the selected identifier.", map[string]any{
		"clientIdentifier": clientIdentifier,
	})
}

// plexDeviceResourceToServer converts a raw plex.tv resource into a
// PlexServerDevice, keeping the server-scoped access token.
func plexDeviceResourceToServer(d plexDeviceResource) *PlexServerDevice {
	server := &PlexServerDevice{
		Name:             d.Name,
		Product:          d.Product,
		Version:          d.ProductVersion,
		ClientIdentifier: d.ClientIdentifier,
		Host:             d.Host,
		Port:             d.Port,
		Local:            d.Local,
		AccessToken:      d.AccessToken,
	}
	for _, c := range d.Connections {
		server.Connections = append(server.Connections, PlexConnection{
			Protocol: c.Protocol,
			Address:  c.Address,
			Port:     c.Port,
			URI:      c.URI,
			Local:    c.Local,
			Relay:    c.Relay,
		})
	}
	return server
}

// mapPlexDevices converts plex.tv resources into the server list exposed to
// the front-end, keeping only Plex Media Server entries and never carrying the
// access token over.
func mapPlexDevices(devices []plexDeviceResource) []PlexServerResource {
	out := make([]PlexServerResource, 0, len(devices))
	for _, d := range devices {
		if !strings.Contains(d.Provides, "server") {
			continue
		}
		server := PlexServerResource{
			Name:             d.Name,
			Product:          d.Product,
			Version:          d.ProductVersion,
			ClientIdentifier: d.ClientIdentifier,
			Host:             d.Host,
			Port:             d.Port,
			Local:            d.Local,
		}
		for _, c := range d.Connections {
			server.Connections = append(server.Connections, PlexConnection{
				Protocol: c.Protocol,
				Address:  c.Address,
				Port:     c.Port,
				URI:      c.URI,
				Local:    c.Local,
				Relay:    c.Relay,
			})
		}
		out = append(out, server)
	}
	return out
}

// fetchRawPlexResources lists the account's raw devices from
// plex.tv/api/v2/resources, including each server's access token. The v2
// endpoint always answers JSON — the v1 endpoint answers XML (even for
// rejected tokens), which is why the discovery flow kept tripping the
// HTML/XML guard. The token is only used for the upstream request and never
// leaks into the returned payload. The client identifier, product, version
// and platform must match the metadata used to obtain the token.
func fetchRawPlexResources(ctx context.Context, token, clientID string, timeout time.Duration) ([]plexDeviceResource, error) {
	if token == "" {
		return nil, utils.NewError(http.StatusUnauthorized, "PLEX_INVALID_TOKEN", "Missing Plex token.", nil)
	}
	if timeout <= 0 {
		timeout = 30 * time.Second
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, "https://plex.tv/api/v2/resources?includeHttps=1&includeRelay=1", nil)
	if err != nil {
		return nil, utils.NewError(http.StatusInternalServerError, "PLEX_REQUEST_FAILED", "Failed to build plex.tv request: "+err.Error(), nil)
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("X-Plex-Token", token)
	req.Header.Set("X-Plex-Client-Identifier", clientID)
	req.Header.Set("X-Plex-Product", plexProduct)
	req.Header.Set("X-Plex-Version", plexVersion)
	req.Header.Set("X-Plex-Device", plexDevice)
	req.Header.Set("X-Plex-Platform", plexPlatform)

	client := &http.Client{Timeout: timeout}
	resp, err := client.Do(req)
	if err != nil {
		return nil, utils.NewError(http.StatusBadGateway, "PLEX_REQUEST_FAILED", "Failed to reach plex.tv: "+err.Error(), nil)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(io.LimitReader(resp.Body, 10<<20))
	if err != nil {
		return nil, utils.NewError(http.StatusBadGateway, "PLEX_READ_FAILED", "Failed to read plex.tv response: "+err.Error(), nil)
	}
	if resp.StatusCode == http.StatusUnauthorized || resp.StatusCode == http.StatusForbidden {
		return nil, utils.NewError(http.StatusUnauthorized, "PLEX_INVALID_TOKEN", "plex.tv rejected the provided token.", map[string]any{
			"status":   resp.StatusCode,
			"endpoint": "plex.tv/api/v2/resources",
		})
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, utils.NewError(resp.StatusCode, "PLEX_API_ERROR", fmt.Sprintf("plex.tv returned an unexpected status (%d)", resp.StatusCode), map[string]any{
			"body": truncateForError(string(body), 512),
		})
	}

	trimmed := strings.TrimSpace(string(body))
	meta := map[string]any{
		"contentType": resp.Header.Get("Content-Type"),
	}
	if strings.HasPrefix(trimmed, "<") {
		// plex.tv should never answer HTML/XML here (the v2 API is JSON-only),
		// but when it does the token may be invalid or the request throttled.
		meta["snippet"] = truncateForError(trimmed, 512)
		return nil, utils.NewError(http.StatusBadGateway, "PLEX_HTML_RESPONSE",
			"plex.tv returned an HTML/XML page instead of JSON. This usually means the token is invalid (start a new sign-in), or plex.tv is throttling requests.", meta)
	}

	// The v2 endpoint answers with a JSON array of devices. The v1 endpoint
	// wrapped them in a MediaContainer, so both shapes are tolerated here.
	var devices []plexDeviceResource
	if json.Unmarshal(body, &devices) == nil && devices != nil {
		return devices, nil
	}
	var legacy struct {
		MediaContainer struct {
			Server []plexDeviceResource `json:"Server"`
		} `json:"MediaContainer"`
	}
	if json.Unmarshal(body, &legacy) == nil && legacy.MediaContainer.Server != nil {
		return legacy.MediaContainer.Server, nil
	}
	return nil, utils.NewError(http.StatusInternalServerError, "PLEX_DECODE_FAILED", "Failed to decode plex.tv resources response.", meta)
}

// fetchPlexResources lists the account's Plex servers from plex.tv, stripping
// each server's access token from the result. Used by the discovery and
// remote-connection flows where only the sanitized resource is needed.
func fetchPlexResources(ctx context.Context, token, clientID string, timeout time.Duration) ([]PlexServerResource, error) {
	devices, err := fetchRawPlexResources(ctx, token, clientID, timeout)
	if err != nil {
		return nil, err
	}
	return mapPlexDevices(devices), nil
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
	// Plex nests every /library/search hit under "SearchResult": each entry
	// holds the media item inside "Metadata" (a single object rather than the
	// top-level Metadata array, which stays empty for search requests).
	seen := make(map[string]struct{}, len(out))
	addUnique := func(item map[string]interface{}) {
		rk, _ := item["ratingKey"].(string)
		if rk == "" {
			out = append(out, item)
			return
		}
		if _, ok := seen[rk]; ok {
			return
		}
		seen[rk] = struct{}{}
		out = append(out, item)
	}
	for _, r := range mc.SearchResult {
		m, ok := r["Metadata"]
		if !ok {
			continue
		}
		switch v := m.(type) {
		case map[string]interface{}:
			addUnique(v)
		case []interface{}:
			for _, e := range v {
				if em, ok := e.(map[string]interface{}); ok {
					addUnique(em)
				}
			}
		}
	}
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
