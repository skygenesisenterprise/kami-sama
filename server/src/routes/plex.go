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
	"github.com/skygenesisenterprise/kami-sama/server/src/middleware"
	"github.com/skygenesisenterprise/kami-sama/server/src/models"
	"github.com/skygenesisenterprise/kami-sama/server/src/services"
	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
	"gorm.io/datatypes"
)

// PlexHandler exposes dedicated Plex Media Server endpoints that complement
// the generic /api/v1/source/* multiplexer. It lets the front-end query
// hubs (recommendation shelves), back-fill metadata for a single ratingKey,
// trigger a library refresh, push playback timeline events, and proxy Plex
// image / transcoding decisions without ever leaking the X-Plex-Token to the
// browser.
type PlexHandler struct {
	deps     Dependencies
	resolver *plexClientResolver
}

// NewPlexHandler seeds the handler with the env-configured client (if any)
// so that requests still work when no persisted source_configs row exists.
// resolveClient is authoritative afterwards — it prefers a DB row so the UI
// can (re)configure the server without a restart.
func NewPlexHandler(deps Dependencies) *PlexHandler {
	return &PlexHandler{deps: deps, resolver: newPlexClientResolver(deps)}
}

// resolveClient returns the active Plex client, resolved through the shared
// plexClientResolver (persisted source_configs row → env provider → env raw
// config). It fails fast with PLEX_DISABLED when none is usable.
func (h *PlexHandler) resolveClient(ctx context.Context) (*services.PlexClient, error) {
	return h.resolver.resolve(ctx)
}

// plexClientResolver lazily resolves and caches the active Plex client. It is
// shared by the dedicated Plex handler and the AniList import flow, which
// routes AniList-discovered titles through Plex so the provider metadata is
// recovered.
type plexClientResolver struct {
	deps   Dependencies
	client *services.PlexClient
	dbKey  string
	dbNone bool
}

// newPlexClientResolver seeds the resolver with the env-configured client (if
// any) so that requests still work when no persisted source_configs row
// exists. resolve is authoritative afterwards — it prefers a DB row so the UI
// can (re)configure the server without a restart.
func newPlexClientResolver(deps Dependencies) *plexClientResolver {
	r := &plexClientResolver{deps: deps}
	if deps.MediaSourceService != nil && deps.MediaSourceService.Plex() != nil {
		r.client = deps.MediaSourceService.Plex().GetClient()
	} else if deps.Config.MediaSource.Plex.URL != "" && deps.Config.MediaSource.Plex.Token != "" {
		r.client = services.NewPlexClient(services.PlexConfig{
			URL:              deps.Config.MediaSource.Plex.URL,
			Token:            deps.Config.MediaSource.Plex.Token,
			ClientIdentifier: deps.Config.MediaSource.Plex.ClientIdentifier,
			Product:          deps.Config.MediaSource.Plex.Product,
			Version:          deps.Config.MediaSource.Plex.Version,
			Device:           deps.Config.MediaSource.Plex.Device,
			Timeout:          deps.Config.MediaSource.Plex.Timeout,
		})
	}
	return r
}

// resolve returns the active Plex client, resolving it in priority order:
//
//  1. A persisted source_configs row for the "plex" source type (enabled). The
//     client is cached and rebuilt whenever the row's updatedAt changes, so
//     saving the connection from the UI takes effect immediately.
//  2. The env-configured active provider (MediaSourceService).
//  3. The raw env Plex configuration.
//
// It fails fast with PLEX_DISABLED when none of these is usable.
func (r *plexClientResolver) resolve(ctx context.Context) (*services.PlexClient, error) {
	if r.deps.LibraryService != nil {
		cfg, err := r.deps.LibraryService.GetBySourceType(ctx, "plex")
		if err == nil && cfg != nil && cfg.Enabled {
			key := cfg.UpdatedAt.String()
			if r.client == nil || r.dbKey != key {
				client, cerr := services.PlexClientFromSourceConfig(cfg)
				if cerr == nil && client.Enabled() {
					r.client = client
					r.dbKey = key
					r.dbNone = false
				} else {
					// Present but unusable — drop any cached client so we never
					// serve stale credentials from a previous configuration.
					r.client = nil
					r.dbKey = ""
				}
			}
			if r.client != nil && !r.dbNone {
				return r.client, nil
			}
		} else if r.dbNone && r.client != nil {
			return r.client, nil
		}
	}

	if r.deps.MediaSourceService != nil && r.deps.MediaSourceService.Plex() != nil {
		r.client = r.deps.MediaSourceService.Plex().GetClient()
		r.dbKey = ""
		r.dbNone = true
		return r.client, nil
	}

	if r.deps.Config.MediaSource.Plex.URL != "" && r.deps.Config.MediaSource.Plex.Token != "" {
		r.client = services.NewPlexClient(services.PlexConfig{
			URL:              r.deps.Config.MediaSource.Plex.URL,
			Token:            r.deps.Config.MediaSource.Plex.Token,
			ClientIdentifier: r.deps.Config.MediaSource.Plex.ClientIdentifier,
			Product:          r.deps.Config.MediaSource.Plex.Product,
			Version:          r.deps.Config.MediaSource.Plex.Version,
			Device:           r.deps.Config.MediaSource.Plex.Device,
			Timeout:          r.deps.Config.MediaSource.Plex.Timeout,
		})
		r.dbKey = ""
		r.dbNone = true
		return r.client, nil
	}

	return nil, utils.NewError(http.StatusServiceUnavailable, "PLEX_DISABLED", "Plex integration is not enabled or not configured.", nil)
}

// GetIdentity returns the configured Plex server's identity (version, machineIdentifier, friendlyName).
func (h *PlexHandler) GetIdentity(c *gin.Context) {
	client, err := h.resolveClient(c.Request.Context())
	if err != nil {
		utils.Error(c, err)
		return
	}
	identity, err := client.GetIdentity(c.Request.Context())
	if err != nil {
		utils.Error(c, err)
		return
	}
	// Persist the server's machineIdentifier so requests to app.plex.tv can
	// resolve the server's connection URLs (see RemoteConnections).
	if machineID, _ := identity["machineIdentifier"].(string); machineID != "" {
		h.persistMachineIdentifier(c, machineID)
	}
	utils.Success(c, http.StatusOK, identity)
}

// RemoteConnections resolves the configured server's connection URLs through
// app.plex.tv/api/resources using the stored machineIdentifier. The access
// token is never returned to the client.
func (h *PlexHandler) RemoteConnections(c *gin.Context) {
	client, err := h.resolveClient(c.Request.Context())
	if err != nil {
		utils.Error(c, err)
		return
	}
	resource, err := client.ServerConnections(c.Request.Context())
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, resource)
}

// AuthStart begins the plex.tv OAuth (PIN) flow. The response carries the
// code the user must authorize and the app.plex.tv URL to open in their
// browser. The UI then polls AuthStatus.
func (h *PlexHandler) AuthStart(c *gin.Context) {
	pin, err := services.CreatePlexAuthPin(c.Request.Context())
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, pin)
}

// AuthStatus polls an in-progress sign-in. Once the user authorizes the code,
// it lists the account's Plex Media Servers so the UI can pick which one to
// configure. The account token never leaves the server — it stays on the
// server-side session and is consumed by AuthConnect.
func (h *PlexHandler) AuthStatus(c *gin.Context) {
	pinID := strings.TrimSpace(c.Query("pinId"))
	status, err := services.GetPlexAuthStatus(c.Request.Context(), pinID)
	if err != nil {
		utils.Error(c, err)
		return
	}
	if !status.Authenticated {
		utils.Success(c, http.StatusOK, gin.H{"authenticated": false, "expiresAt": status.ExpiresAt})
		return
	}
	sess, err := services.GetPlexAuthSession(pinID)
	if err != nil {
		utils.Error(c, err)
		return
	}
	servers, err := services.DiscoverServers(c.Request.Context(), sess.AuthToken)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{
		"authenticated": true,
		"expiresAt":     status.ExpiresAt,
		"servers":       servers,
	})
}

// AuthConnect finalizes the sign-in flow once the user picks a server. The
// server-side session is consumed, the account token is persisted onto the
// plex source_configs row, and a sanitized configuration is returned — the
// token is never serialized back to the browser.
func (h *PlexHandler) AuthConnect(c *gin.Context) {
	principal, ok := middleware.GetPrincipal(c)
	if !ok {
		utils.Error(c, utils.ErrUnauthorized)
		return
	}
	var body struct {
		PinID                  string `json:"pinId" binding:"required"`
		ServerClientIdentifier string `json:"serverClientIdentifier" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	sess, err := services.ClaimPlexAuthSession(strings.TrimSpace(body.PinID))
	if err != nil {
		utils.Error(c, err)
		return
	}
	// The raw plex.tv resource carries the server-scoped access token. Plex
	// Media Servers reject the account token on authenticated endpoints (401),
	// so this token is what gets persisted for direct server calls; the account
	// token stays for plex.tv resolution (RemoteConnections).
	device, err := services.ResolvePlexServerDevice(c.Request.Context(), sess.AuthToken, strings.TrimSpace(body.ServerClientIdentifier))
	if err != nil {
		utils.Error(c, err)
		return
	}
	// Probe each plex.direct connection and persist the first one the backend
	// can actually reach. The backend usually runs in a container that cannot
	// route to the server's LAN addresses, so public/plex.direct URLs are tried
	// before local ones.
	probeServer := &services.PlexServerResource{ClientIdentifier: device.ClientIdentifier, Connections: device.Connections}
	baseURL := services.ReachablePlexConnectionURL(c.Request.Context(), probeServer, device.AccessToken)
	if baseURL == "" {
		utils.Error(c, utils.NewError(http.StatusBadRequest, "PLEX_NO_CONNECTION", "The selected Plex server has no resolvable connection.", nil))
		return
	}
	serverToken := device.AccessToken
	if serverToken == "" {
		serverToken = sess.AuthToken
	}
	config, err := json.Marshal(map[string]interface{}{
		"url":               baseURL,
		"token":             serverToken,
		"accountToken":      sess.AuthToken,
		"machineIdentifier": device.ClientIdentifier,
		"product":           device.Product,
		"version":           device.Version,
		"timeoutSeconds":    30,
	})
	if err != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	cfg := datatypes.JSON(config)

	var saved *models.SourceConfig
	existing, err := h.deps.LibraryService.GetBySourceType(c.Request.Context(), "plex")
	if err == nil && existing != nil {
		enabled := true
		ur := struct {
			SourceType *string        `json:"sourceType"`
			Enabled    *bool          `json:"enabled"`
			Config     datatypes.JSON `json:"config"`
		}{Enabled: &enabled, Config: cfg}
		saved, err = h.deps.LibraryService.Update(c.Request.Context(), principal.UserID, existing.ID, ur)
	} else {
		saved, err = h.deps.LibraryService.Create(c.Request.Context(), principal.UserID, "plex", true, cfg)
	}
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{
		"connected":  true,
		"serverName": device.Name,
		"url":        baseURL,
		"config":     sanitizeSourceConfigForBrowser(saved),
	})
}

// persistMachineIdentifier stores the Plex server's machineIdentifier on the
// persisted plex source_configs row. It is a no-op when no plex row exists
// (env-only configuration) or the identifier didn't change.
func (h *PlexHandler) persistMachineIdentifier(c *gin.Context, machineID string) {
	if machineID == "" || h.deps.LibraryService == nil {
		return
	}
	cfg, err := h.deps.LibraryService.GetBySourceType(c.Request.Context(), "plex")
	if err != nil || cfg == nil {
		return
	}
	merged := services.MergePlexMachineIdentifier(cfg.Config, machineID)
	if string(merged) == string(cfg.Config) {
		return
	}
	principal, _ := middleware.GetPrincipal(c)
	ur := struct {
		SourceType *string        `json:"sourceType"`
		Enabled    *bool          `json:"enabled"`
		Config     datatypes.JSON `json:"config"`
	}{Config: merged}
	_, _ = h.deps.LibraryService.Update(c.Request.Context(), principal.UserID, cfg.ID, ur)
}

// ListLibraries returns the configured libraries on the Plex server.
func (h *PlexHandler) ListLibraries(c *gin.Context) {
	client, err := h.resolveClient(c.Request.Context())
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
	client, err := h.resolveClient(c.Request.Context())
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
	client, err := h.resolveClient(c.Request.Context())
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
	client, err := h.resolveClient(c.Request.Context())
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
	client, err := h.resolveClient(c.Request.Context())
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
	client, err := h.resolveClient(c.Request.Context())
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
	client, err := h.resolveClient(c.Request.Context())
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
	client, err := h.resolveClient(c.Request.Context())
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
	client, err := h.resolveClient(c.Request.Context())
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
	client, err := h.resolveClient(c.Request.Context())
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

// isSafePlexImagePath restricts the public image proxy to paths owned by the
// configured Plex server. Relative paths (the common case for `thumb`/`art`)
// are always allowed; absolute URLs are only proxied when they point back at
// the configured server, so the endpoint cannot be abused as an open proxy.
func isSafePlexImagePath(client *services.PlexClient, raw string) bool {
	// Block protocol-relative URLs (//host/path): url.ResolveReference would
	// resolve them against the attacker-controlled host (SSRF).
	if strings.HasPrefix(raw, "//") {
		return false
	}
	if strings.HasPrefix(raw, "/") {
		return true
	}
	if !strings.HasPrefix(raw, "http://") && !strings.HasPrefix(raw, "https://") {
		return false
	}
	u, err := url.Parse(raw)
	if err != nil {
		return false
	}
	base, err := url.Parse(client.BaseURL())
	if err != nil {
		return false
	}
	return strings.EqualFold(u.Host, base.Host)
}

// ImageProxy proxies Plex /photo/:/transcode without leaking the token.
//
// Plex image paths (`thumb`, `art`) are relative to the configured server,
// optionally already resolving to absolute URLs when the library lives on a
// remote Plex server. The proxy always re-applies the X-Plex-Token header.
// The route is public (browser <img> tags cannot send the Bearer token), so
// the path is validated against the configured server before being proxied.
func (h *PlexHandler) ImageProxy(c *gin.Context) {
	client, err := h.resolveClient(c.Request.Context())
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
	if !isSafePlexImagePath(client, raw) {
		utils.Error(c, utils.NewError(http.StatusForbidden, "PLEX_IMAGE_FORBIDDEN", "Refusing to proxy a non-Plex image path.", nil))
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
	client, err := h.resolveClient(c.Request.Context())
	if err != nil {
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
	stream, err := services.BuildPlexStreamURL(c.Request.Context(), client, body.RatingKey, body.Profile)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"streamUrl": stream, "ratingKey": body.RatingKey, "profile": body.Profile})
}

// Search proxies /library/search and flattens results into the canonical
// MediaSourceItem shape so the front-end doesn't have to differentiate
// providers.
func (h *PlexHandler) Search(c *gin.Context) {
	client, err := h.resolveClient(c.Request.Context())
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
	mapped := services.MapPlexItems(results)
	if mapped == nil {
		mapped = []map[string]interface{}{}
	}
	utils.Success(c, http.StatusOK, gin.H{"items": mapped, "total": len(mapped), "query": q})
}

// ImportItem upserts a single Plex item (by ratingKey) into the local anime
// index. It returns the canonical item plus created/updated flags so the
// catalog UI can reflect the result immediately.
func (h *PlexHandler) ImportItem(c *gin.Context) {
	client, err := h.resolveClient(c.Request.Context())
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
	if h.deps.Database == nil {
		utils.Error(c, utils.NewError(http.StatusInternalServerError, "PLEX_IMPORT_FAILED", "Database unavailable.", nil))
		return
	}
	result, err := services.ImportPlexItem(c.Request.Context(), h.deps.Database.Gorm(), client, body.RatingKey)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusCreated, result)
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
	client, err := h.resolveClient(c.Request.Context())
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
