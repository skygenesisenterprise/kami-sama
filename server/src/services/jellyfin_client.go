package services

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

// JellyfinClient is the STREAMING-only client for the media-server container.
// It never imports content: the catalog is fed by the content providers
// (Plex and the other dashboard sources) through the database. Its only job
// is to resolve and serve HLS playback for the public /watch page — see the
// stream resolver and same-origin proxy in routes/discover.go.
type JellyfinClient struct {
	baseURL         string
	apiKey          string
	userID          string
	strmDir         string
	strmLibraryName string
	strmLibraryPath string
	httpClient      *http.Client
}

type JellyfinConfig struct {
	URL    string
	APIKey string
	UserID string
	// StrmDir is the writable directory (shared with the media-server
	// container) where the worker drops .strm files so Jellyfin's library
	// scanner turns a Plex URL into a transcodeable item.
	StrmDir string
	// StrmLibraryName / StrmLibraryPath describe the Jellyfin virtual folder
	// that backs .strm bridging (auto-created if missing).
	StrmLibraryName string
	StrmLibraryPath string
}

func NewJellyfinClient(cfg JellyfinConfig) *JellyfinClient {
	return &JellyfinClient{
		baseURL:         strings.TrimRight(cfg.URL, "/"),
		apiKey:          cfg.APIKey,
		userID:          cfg.UserID,
		strmDir:         cfg.StrmDir,
		strmLibraryName: cfg.StrmLibraryName,
		strmLibraryPath: cfg.StrmLibraryPath,
		httpClient: &http.Client{
			Timeout: 120 * time.Second,
		},
	}
}

// Enabled reports whether the client is fully wired (URL + API key + user).
func (c *JellyfinClient) Enabled() bool {
	return c != nil && c.baseURL != "" && c.apiKey != "" && c.userID != ""
}

// APIKey exposes the configured API key so proxy handlers can attach it to
// upstream segment requests without leaking it into browser URLs.
func (c *JellyfinClient) APIKey() string { return c.apiKey }

// hlsCodecParams force a browser-decodable transcode on the Jellyfin master
// request. Without them Jellyfin stream-copies (remuxes) the source — for
// bridged Plex items that is HEVC/eac3, which no Chromium-based MSE can
// decode, so the player dies with bufferAppendingError. Requesting h264+aac
// makes Jellyfin transcode HEVC sources on the fly while still stream-copying
// sources that already match — the segment output is h264 High + aac LC.
func hlsCodecParams(q url.Values) {
	q.Set("VideoCodec", "h264")
	q.Set("AudioCodec", "aac")
	q.Set("TranscodingMaxAudioChannels", "2")
}

// HLSManifestURL builds the HLS master playlist URL for an item. Jellyfin
// transcodes on the fly when needed and returns a .m3u8 the same-origin
// proxy can re-write — mirroring how the Plex universal transcode endpoint
// is consumed by the watch page. A stable DeviceId lets Jellyfin bind the
// transcode session to our backend across manifest/segment requests. The
// codec params (h264/aac) guarantee the output plays in a browser.
func (c *JellyfinClient) HLSManifestURL(itemID string) string {
	q := url.Values{}
	q.Set("api_key", c.apiKey)
	q.Set("DeviceId", "kamisama-server")
	hlsCodecParams(q)
	return c.baseURL + "/Videos/" + url.PathEscape(itemID) + "/master.m3u8?" + q.Encode()
}

// HLSManifestURLWithSource is like HLSManifestURL but pins playback to a
// specific MediaSourceId — used when the item carries multiple sources
// (e.g. a remote Plex URL bridged via BridgeRemoteMedia).
func (c *JellyfinClient) HLSManifestURLWithSource(itemID, mediaSourceID string) string {
	q := url.Values{}
	q.Set("api_key", c.apiKey)
	q.Set("DeviceId", "kamisama-server")
	q.Set("MediaSourceId", mediaSourceID)
	hlsCodecParams(q)
	return c.baseURL + "/Videos/" + url.PathEscape(itemID) + "/master.m3u8?" + q.Encode()
}

// TranscodeMasterURL negotiates the HLS transcode through the PlaybackInfo
// API and returns the master playlist URL Jellyfin built for a browser-
// decodable h264/aac session.
//
// Hand-building the master (HLSManifestURLWithSource) asks for the same
// codecs, but for bridged remote (.strm) items whose scan-time probe failed
// Jellyfin launches ffmpeg with DEFAULT encoders (no -map/-c arguments): the
// output AAC then carries no timestamps or channel configuration and
// Chromium's MSE rejects every append (bufferAppendingError). PlaybackInfo
// forces a live probe of the source and a proper ffmpeg command — verified
// against a real bridged Plex HEVC/E-AC-3 item: clean h264 High + aac LC 2ch.
//
// Subtitles are stripped from the returned URL: the watch page handles them
// itself and libass burning slows the cold transcode start.
//
// Returns "" when negotiation fails so callers can fall back to the
// hand-built master (identical behaviour to before the fix).
func (c *JellyfinClient) TranscodeMasterURL(ctx context.Context, itemID, mediaSourceID string) string {
	if !c.Enabled() {
		return ""
	}
	payload := map[string]interface{}{
		"ItemId":             itemID,
		"StartTimeTicks":     0,
		"AutoOpenLiveStream": true,
		"DeviceProfile": map[string]interface{}{
			"MaxStreamingBitrate": 20000000,
			"TranscodingProfiles": []map[string]interface{}{
				{
					"Container":        "hls",
					"Type":             "video",
					"VideoCodec":       "h264",
					"AudioCodec":       "aac",
					"Protocol":         "hls",
					"MaxAudioChannels": "2",
				},
			},
			"DirectPlayProfiles":   []map[string]interface{}{},
			"DirectStreamProfiles": []map[string]interface{}{},
			"CodecProfiles":        []map[string]interface{}{},
		},
	}
	if mediaSourceID != "" {
		payload["MediaSourceId"] = mediaSourceID
	}
	reqBody, err := json.Marshal(payload)
	if err != nil {
		return ""
	}
	u := c.baseURL + "/Items/" + url.PathEscape(itemID) + "/PlaybackInfo?userId=" + url.QueryEscape(c.userID)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, u, strings.NewReader(string(reqBody)))
	if err != nil {
		return ""
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := c.doWithAuth(req)
	if err != nil {
		return ""
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		_, _ = io.Copy(io.Discard, io.LimitReader(resp.Body, 4<<10))
		return ""
	}
	raw, err := io.ReadAll(io.LimitReader(resp.Body, 2<<20))
	if err != nil {
		return ""
	}
	var parsed struct {
		MediaSources []struct {
			TranscodingUrl string `json:"TranscodingUrl"`
		} `json:"MediaSources"`
	}
	if err := json.Unmarshal(raw, &parsed); err != nil {
		return ""
	}
	if len(parsed.MediaSources) == 0 || parsed.MediaSources[0].TranscodingUrl == "" {
		return ""
	}
	tu := parsed.MediaSources[0].TranscodingUrl
	// Never burn subtitles into the transcode — the watch page handles them
	// separately, and libass encoding slows the cold start significantly.
	if uu, perr := url.Parse(tu); perr == nil {
		q := uu.Query()
		q.Del("SubtitleStreamIndex")
		q.Del("SubtitleMethod")
		uu.RawQuery = q.Encode()
		tu = uu.String()
	}
	if strings.HasPrefix(tu, "/") {
		tu = strings.TrimRight(c.baseURL, "/") + tu
	}
	return tu
}

// BridgeRemoteMedia is the Plex→Jellyfin streaming bridge. Jellyfin has no
// API to attach an arbitrary HTTP URL to an existing item (the
// /Items/{id}/MediaSources endpoint does not exist on the stock server), so
// the bridge works through the library: it writes a .strm file containing the
// Plex URL into the shared strm directory, makes sure the "Remote" library
// (a movies collection) exists on Jellyfin and points at that directory, then
// triggers a scan and waits for the resulting item.
//
// Returns the Jellyfin item ID to pass to HLSManifestURLWithSource (for a
// .strm item the MediaSourceId equals the item ID). The operation is
// idempotent — re-registering the same URL reuses the existing .strm file.
//
// The returned ID is only handed out once Jellyfin has actually resolved the
// .strm URL into a remote HTTP media source — a library scan can otherwise
// create the item before the shortcut is read, leaving it stuck at
// Protocol=File where every transcode fails (see ensureStrmItemRemote).
func (c *JellyfinClient) BridgeRemoteMedia(ctx context.Context, name, remoteURL string) (string, error) {
	if !c.Enabled() {
		return "", fmt.Errorf("jellyfin: client not configured")
	}
	if c.strmDir == "" || c.strmLibraryName == "" || c.strmLibraryPath == "" {
		return "", fmt.Errorf("jellyfin: strm bridge not configured (MEDIA_SOURCE_JELLYFIN_STRM_*)")
	}
	if remoteURL == "" {
		return "", fmt.Errorf("jellyfin: remote URL required")
	}
	itemID, err := c.ensureStrmLibrary(ctx)
	if err != nil {
		return "", fmt.Errorf("jellyfin: could not prepare remote library: %w", err)
	}
	strmName := c.strmFileName(name, remoteURL)
	if err := os.MkdirAll(c.strmDir, 0o755); err != nil {
		return "", fmt.Errorf("jellyfin: could not create strm dir %q: %w", c.strmDir, err)
	}
	if err := os.WriteFile(filepath.Join(c.strmDir, strmName), []byte(remoteURL), 0o644); err != nil {
		return "", fmt.Errorf("jellyfin: could not write strm file: %w", err)
	}
	if err := c.refreshStrmLibrary(ctx, itemID); err != nil {
		return "", fmt.Errorf("jellyfin: could not refresh remote library: %w", err)
	}
	stem := strings.TrimSuffix(strmName, ".strm")
	item, err := c.waitForStrmItem(ctx, stem)
	if err != nil {
		return "", err
	}
	// Verify the scan resolved the .strm URL into a remote HTTP source. When
	// the item was created before the shortcut was read it stays
	// Protocol=File and every transcode fails — ensureStrmItemRemote forces a
	// clean re-scan so Jellyfin re-reads the URL (see the function for why).
	resolvedID, err := c.ensureStrmItemRemote(ctx, item.ID, strmName, remoteURL, stem)
	if err != nil {
		return "", err
	}
	return resolvedID, nil
}

// strmFileName builds a filesystem-safe, deterministic .strm file name for a
// remote URL. The stem is the sanitized display name (so the Jellyfin item is
// searchable by that name) plus a short hash of the URL so distinct sources
// never collide even when their display names match.
func (c *JellyfinClient) strmFileName(name, remoteURL string) string {
	stem := sanitizeStrmName(name)
	hash := fmt.Sprintf("%x", fnv32(remoteURL))
	if len(stem) > 48 {
		stem = stem[:48]
	}
	return stem + "-" + hash + ".strm"
}

// ensureStrmLibrary makes sure a movies library named StrmLibraryName exists
// on Jellyfin and points at StrmLibraryPath. It returns the library's item ID
// (used to trigger a scan via /Items/{id}/Refresh). Idempotent: an existing
// folder is reused and its path list is reconciled so StrmLibraryPath is
// always scanned (Jellyfin merges PathInfos, so we re-send the full list).
func (c *JellyfinClient) ensureStrmLibrary(ctx context.Context) (string, error) {
	body, err := c.do(ctx, http.MethodGet, "/Library/VirtualFolders", nil)
	if err != nil {
		return "", err
	}
	var folders []struct {
		Name      string   `json:"Name"`
		Locations []string `json:"Locations"`
		ItemId    string   `json:"ItemId"`
	}
	if err := json.Unmarshal(body, &folders); err != nil {
		return "", fmt.Errorf("could not parse virtual folders: %w", err)
	}
	for _, f := range folders {
		if strings.EqualFold(f.Name, c.strmLibraryName) {
			if !containsPath(f.Locations, c.strmLibraryPath) {
				if err := c.addStrmLibraryPath(ctx, f.ItemId, f.Locations, c.strmLibraryPath); err != nil {
					return "", err
				}
			}
			return f.ItemId, nil
		}
	}
	payload := map[string]interface{}{
		"LibraryOptions": map[string]interface{}{
			"PathInfos": []map[string]string{{"Path": c.strmLibraryPath}},
		},
	}
	reqBody, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}
	params := url.Values{}
	params.Set("name", c.strmLibraryName)
	params.Set("collectionType", "movies")
	params.Set("refreshLibrary", "true")
	u := c.baseURL + "/Library/VirtualFolders?" + params.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, u, strings.NewReader(string(reqBody)))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := c.doWithAuth(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		respBody, _ := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
		return "", fmt.Errorf("POST /Library/VirtualFolders: %d: %s", resp.StatusCode, string(respBody))
	}
	// The create call doesn't echo the folder, so re-list to resolve its item ID.
	body, err = c.do(ctx, http.MethodGet, "/Library/VirtualFolders", nil)
	if err != nil {
		return "", err
	}
	if err := json.Unmarshal(body, &folders); err != nil {
		return "", fmt.Errorf("could not parse virtual folders: %w", err)
	}
	for _, f := range folders {
		if strings.EqualFold(f.Name, c.strmLibraryName) {
			return f.ItemId, nil
		}
	}
	return "", fmt.Errorf("library %q was created but not found", c.strmLibraryName)
}

// addStrmLibraryPath appends a path to an existing Jellyfin library. Jellyfin
// merges PathInfos on this endpoint, so we send the current locations plus the
// new one to keep the folder pointing at everything it already covers.
func (c *JellyfinClient) addStrmLibraryPath(ctx context.Context, itemID string, existing []string, newPath string) error {
	pathInfos := make([]map[string]string, 0, len(existing)+1)
	seen := make(map[string]bool, len(existing)+1)
	for _, p := range existing {
		if p == "" || seen[p] {
			continue
		}
		seen[p] = true
		pathInfos = append(pathInfos, map[string]string{"Path": p})
	}
	if !seen[newPath] {
		pathInfos = append(pathInfos, map[string]string{"Path": newPath})
	}
	payload := map[string]interface{}{
		"Id": itemID,
		"LibraryOptions": map[string]interface{}{
			"PathInfos": pathInfos,
		},
	}
	reqBody, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+"/Library/VirtualFolders/LibraryOptions", strings.NewReader(string(reqBody)))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := c.doWithAuth(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		respBody, _ := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
		return fmt.Errorf("POST /Library/VirtualFolders/LibraryOptions: %d: %s", resp.StatusCode, string(respBody))
	}
	return nil
}

// containsPath reports whether a list of library locations includes the given
// normalized path.
func containsPath(paths []string, target string) bool {
	for _, p := range paths {
		if p == target {
			return true
		}
	}
	return false
}

// refreshStrmLibrary triggers a scan of the remote library so newly written
// .strm files are picked up and turned into items. Jellyfin has no
// "refresh by library name" endpoint in this API version — the per-library
// scan is POST /Items/{itemId}/Refresh (the folder's ItemId).
func (c *JellyfinClient) refreshStrmLibrary(ctx context.Context, itemID string) error {
	u := c.baseURL + "/Items/" + url.PathEscape(itemID) + "/Refresh"
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, u, nil)
	if err != nil {
		return err
	}
	resp, err := c.doWithAuth(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		respBody, _ := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
		return fmt.Errorf("POST /Items/%s/Refresh: %d: %s", itemID, resp.StatusCode, string(respBody))
	}
	return nil
}

// findStrmItem performs a single library search for the item whose Name
// matches the .strm stem (or contains it). Returns found=false when the item
// does not exist (yet).
func (c *JellyfinClient) findStrmItem(ctx context.Context, stem string) (jfItem, bool, error) {
	params := url.Values{}
	params.Set("SearchTerm", stem)
	params.Set("Limit", "20")
	params.Set("Recursive", "true")
	params.Set("IncludeItemTypes", "Movie,Series,Episode")
	body, err := c.do(ctx, http.MethodGet, fmt.Sprintf("/Users/%s/Items", c.userID), params)
	if err != nil {
		return jfItem{}, false, err
	}
	var resp jfItemsResponse
	if err := json.Unmarshal(body, &resp); err != nil {
		return jfItem{}, false, err
	}
	stemLower := strings.ToLower(stem)
	for _, it := range resp.Items {
		if strings.EqualFold(it.Name, stem) || strings.Contains(strings.ToLower(it.Name), stemLower) {
			return it, true, nil
		}
	}
	return jfItem{}, false, nil
}

// waitForStrmItem polls the library until the item whose Name matches the
// .strm stem (or contains it) shows up, then returns it.
func (c *JellyfinClient) waitForStrmItem(ctx context.Context, stem string) (jfItem, error) {
	deadline := time.Now().Add(45 * time.Second)
	var lastErr error
	for time.Now().Before(deadline) {
		select {
		case <-ctx.Done():
			return jfItem{}, ctx.Err()
		case <-time.After(1 * time.Second):
		}
		item, found, err := c.findStrmItem(ctx, stem)
		if err != nil {
			lastErr = err
			continue
		}
		if found {
			return item, nil
		}
	}
	if lastErr != nil {
		return jfItem{}, fmt.Errorf("could not find item %q after scan: %w", stem, lastErr)
	}
	return jfItem{}, fmt.Errorf("item %q not found after library scan", stem)
}

// ItemResolvesRemote reports whether Jellyfin resolved the media source
// backing itemID to a remote HTTP source (Protocol=Http / IsRemote=true).
//
// A .strm item that missed shortcut resolution stays a plain local file
// (Protocol=File, Path=<…>.strm); feeding that to ffmpeg makes it exit with
// code 183 and the master playlist's variant request answers HTTP 500. Since
// the 10.11.x .strm hardening the URL is only read at library-scan time — a
// bare /Items/{id}/Refresh never re-resolves it — so callers must detect this
// state and force a full re-scan (see ensureStrmItemRemote).
func (c *JellyfinClient) ItemResolvesRemote(ctx context.Context, itemID string) (bool, error) {
	body, err := c.do(ctx, http.MethodGet, "/Users/"+url.PathEscape(c.userID)+"/Items/"+url.PathEscape(itemID), nil)
	if err != nil {
		return false, err
	}
	var resp struct {
		MediaSources []struct {
			Protocol string `json:"Protocol"`
			IsRemote bool   `json:"IsRemote"`
		} `json:"MediaSources"`
	}
	if err := json.Unmarshal(body, &resp); err != nil {
		return false, err
	}
	for _, ms := range resp.MediaSources {
		if ms.IsRemote || strings.EqualFold(ms.Protocol, "http") || strings.EqualFold(ms.Protocol, "https") {
			return true, nil
		}
	}
	return false, nil
}

// ResolveMediaSourceID returns the Id of a playable media source backing
// itemID, preferring remote/HTTP sources (.strm bridged items). The HLS
// master request must pin a REAL source id: Jellyfin gives every item —
// .strm entries included — a distinct MediaSourceInfo.Id that is NOT the
// item Id (a path-derived value for stream files), so assuming equality
// makes /Videos/{id}/master.m3u8?MediaSourceId=<itemId> answer HTTP 400
// "The specified media source could not be found". When the item exposes no
// source id the error lets the caller fall back to an unpinned master (a
// single-source item plays without MediaSourceId).
func (c *JellyfinClient) ResolveMediaSourceID(ctx context.Context, itemID string) (string, error) {
	params := url.Values{}
	params.Set("Fields", "MediaSources")
	body, err := c.do(ctx, http.MethodGet, "/Users/"+url.PathEscape(c.userID)+"/Items/"+url.PathEscape(itemID), params)
	if err != nil {
		return "", err
	}
	var resp struct {
		MediaSources []struct {
			Id       string `json:"Id"`
			Protocol string `json:"Protocol"`
			IsRemote bool   `json:"IsRemote"`
		} `json:"MediaSources"`
	}
	if err := json.Unmarshal(body, &resp); err != nil {
		return "", fmt.Errorf("could not parse media sources: %w", err)
	}
	var fallback string
	for _, ms := range resp.MediaSources {
		if ms.Id == "" {
			continue
		}
		if ms.IsRemote || strings.EqualFold(ms.Protocol, "http") || strings.EqualFold(ms.Protocol, "https") {
			return ms.Id, nil
		}
		if fallback == "" {
			fallback = ms.Id
		}
	}
	if fallback != "" {
		return fallback, nil
	}
	return "", fmt.Errorf("jellyfin: item %q exposes no media source id", itemID)
}

// fullLibraryRefresh triggers a rescan of every library. Writing a .strm file
// and refreshing only the bridged library can create the item before the URL
// inside it is read; a FULL scan is what makes Jellyfin (re)resolve the
// shortcut — proven to fix items stuck at Protocol=File.
func (c *JellyfinClient) fullLibraryRefresh(ctx context.Context) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+"/Library/Refresh", nil)
	if err != nil {
		return err
	}
	resp, err := c.doWithAuth(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		respBody, _ := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
		return fmt.Errorf("POST /Library/Refresh: %d: %s", resp.StatusCode, string(respBody))
	}
	return nil
}

// ensureStrmItemRemote verifies the bridged item resolves to a remote HTTP
// source and, when it does not, forces a clean re-scan so Jellyfin re-reads
// the URL inside the .strm file.
//
// Jellyfin 10.10+/10.11+ can create the .strm item before the shortcut is
// read: the row then stays Protocol=File forever (no refresh re-resolves it)
// and every transcode fails — ffmpeg receives the .strm text file and exits
// with code 183, which the same-origin proxy surfaces as an HTTP 500 on the
// master playlist's variant request. Deleting the file, rewriting it and
// triggering a FULL library scan makes Jellyfin resolve the URL. Returns the
// resolved item ID. When resolution never succeeds, the error lets the caller
// fall back to the Plex HLS proxy instead of serving a broken Jellyfin stream.
func (c *JellyfinClient) ensureStrmItemRemote(ctx context.Context, itemID, strmName, remoteURL, stem string) (string, error) {
	if ok, err := c.ItemResolvesRemote(ctx, itemID); err == nil && ok {
		return itemID, nil
	}
	strmPath := filepath.Join(c.strmDir, strmName)
	if err := os.Remove(strmPath); err != nil && !os.IsNotExist(err) {
		return "", fmt.Errorf("jellyfin: could not remove unresolved strm: %w", err)
	}
	// Rewrite the file so the rescan detects a change and re-reads the URL.
	// A delete alone (or a metadata refresh alone) leaves the stale row
	// untouched — the combination with the full scan is what resolves it.
	if err := os.WriteFile(strmPath, []byte(remoteURL), 0o644); err != nil {
		return "", fmt.Errorf("jellyfin: could not rewrite strm: %w", err)
	}
	if err := c.fullLibraryRefresh(ctx); err != nil {
		return "", fmt.Errorf("jellyfin: could not trigger recovery rescan: %w", err)
	}
	// Keep the whole bridge comfortably inside the caller's request budget
	// (the watch page allows 90s for the /stream metadata call; the initial
	// waitForStrmItem above already returns fast when the item exists, which
	// is the only case this recovery runs in). Jellyfin reuses the same row
	// on rescan, so the name-matched item below is the one being resolved.
	deadline := time.Now().Add(45 * time.Second)
	errorStreak := 0
	for time.Now().Before(deadline) {
		select {
		case <-ctx.Done():
			return "", ctx.Err()
		case <-time.After(2 * time.Second):
		}
		item, found, err := c.findStrmItem(ctx, stem)
		if err != nil {
			// Don't burn the whole window on a dead media server.
			errorStreak++
			if errorStreak >= 5 {
				return "", fmt.Errorf("jellyfin: media server unreachable while waiting for strm resolution: %w", err)
			}
			continue
		}
		errorStreak = 0
		if !found {
			continue
		}
		if ok, verr := c.ItemResolvesRemote(ctx, item.ID); verr == nil && ok {
			return item.ID, nil
		}
	}
	return "", fmt.Errorf("jellyfin: .strm item %q could not be resolved to a remote media source after recovery scan", stem)
}

// PreWarmTranscode starts the media-server's transcode session for an item
// without waiting for the browser: the master playlist is served instantly
// (static), but the VARIANT request is what actually launches ffmpeg — and a
// cold transcode has to probe the remote source first, which can add several
// seconds of asset-only time to the first play. Pulling the master, resolving
// its first variant URL and requesting it here hides that cold-start latency
// from the player. Fire-and-forget: callers must never depend on its result.
func (c *JellyfinClient) PreWarmTranscode(ctx context.Context, masterURL string) {
	if masterURL == "" {
		return
	}
	resp, err := c.DoWithAuth(ctx, masterURL)
	if err != nil {
		return
	}
	body, _ := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	resp.Body.Close()
	for _, line := range strings.Split(string(body), "\n") {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" || strings.HasPrefix(trimmed, "#") || !strings.Contains(trimmed, ".m3u8") {
			continue
		}
		base, berr := url.Parse(masterURL)
		if berr != nil {
			return
		}
		ref, rerr := url.Parse(trimmed)
		if rerr != nil {
			return
		}
		vresp, verr := c.DoWithAuth(ctx, base.ResolveReference(ref).String())
		if verr != nil {
			return
		}
		_, _ = io.Copy(io.Discard, io.LimitReader(vresp.Body, 256<<10))
		vresp.Body.Close()
		return
	}
}

// BuildSegmentURL reconstructs the upstream URL of a manifest sub-resource
// (variant playlist or .ts/.m4s segment) referenced by a Jellyfin HLS
// playlist. It accepts:
//   - absolute paths (`/Videos/...`)
//   - relative references Jellyfin emits in playlists (`../Videos/...`,
//     bare filenames like `0.ts`)
//
// Anything under `Videos/` is applied on the Jellyfin host; bare filenames
// are served under /Videos/{itemID}/ like Jellyfin does. Query strings that
// ride inside the origin (Jellyfin appends api_key/DeviceId/MediaSourceId
// to segment lines) are preserved as real query params — never baked into
// the path — and any upstream api_key is replaced by our own.
func (c *JellyfinClient) BuildSegmentURL(itemID, origin string) (string, error) {
	base, err := url.Parse(c.baseURL)
	if err != nil {
		return "", err
	}
	// Split a trailing query off the reference so it becomes real query
	// params instead of literal path characters (e.g. `0.ts?api_key=x`).
	pathPart, rawQuery, _ := strings.Cut(origin, "?")
	pathPart = strings.TrimLeft(pathPart, "/")
	if i := strings.Index(pathPart, "Videos/"); i >= 0 {
		base.Path = "/" + pathPart[i:]
	} else {
		base.Path = "/Videos/" + url.PathEscape(itemID) + "/" + pathPart
	}
	q := url.Values{}
	if parsed, perr := url.ParseQuery(rawQuery); perr == nil {
		q = parsed
	}
	// The token/key always travels in our header (DoWithAuth) — drop any
	// upstream key so it never leaks into browser-facing segment URLs, then
	// re-add our own for the header-less Jellyfin acceptance path.
	q.Del("api_key")
	q.Set("api_key", c.apiKey)
	base.RawQuery = q.Encode()
	return base.String(), nil
}

// DoWithAuth issues an authenticated GET against an absolute URL (used by
// the same-origin stream proxy). Auth travels in the X-Emby-Token header and
// an api_key query param — matching what the Jellyfin server accepts — so
// the key never lands in browser-facing URLs.
func (c *JellyfinClient) DoWithAuth(ctx context.Context, urlStr string) (*http.Response, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, urlStr, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("X-Emby-Token", c.apiKey)
	req.Header.Set("X-Emby-Authorization", fmt.Sprintf(`MediaBrowser Client="KamiSama", Device="Server", DeviceId="kamisama-server", Version="1.0.0", Token="%s"`, c.apiKey))
	return c.httpClient.Do(req)
}

// ResolveEpisodeKey maps a catalog (season, episode) pair to the Jellyfin
// item ID of the matching episode under a series. Catalog rows only store
// the series key (metadata.sourceId when the item was imported from a
// content provider that carried the Jellyfin ID, or a title-based search
// otherwise), so episode IDs are resolved on demand against the media
// server — purely for playback, never for import.
func (c *JellyfinClient) ResolveEpisodeKey(ctx context.Context, seriesID string, seasonNumber, episodeNumber int) (string, error) {
	if !c.Enabled() {
		return "", fmt.Errorf("jellyfin: client not configured")
	}
	if seriesID == "" {
		return "", fmt.Errorf("jellyfin: series ID required")
	}
	// Page through the series' episodes (Jellyfin caps per-request results)
	// until the requested (season, episode) pair is found or the list ends.
	const pageSize = 500
	for start := 0; ; start += pageSize {
		params := url.Values{}
		params.Set("ParentId", seriesID)
		params.Set("Limit", strconv.Itoa(pageSize))
		params.Set("StartIndex", strconv.Itoa(start))
		params.Set("Recursive", "true")
		params.Set("IncludeItemTypes", "Episode")
		params.Set("Fields", "Genres")
		body, err := c.do(ctx, http.MethodGet, fmt.Sprintf("/Users/%s/Items", c.userID), params)
		if err != nil {
			return "", err
		}
		var resp jfItemsResponse
		if err := json.Unmarshal(body, &resp); err != nil {
			return "", err
		}
		for _, ep := range resp.Items {
			season := 0
			if ep.ParentIndexNumber != nil {
				season = *ep.ParentIndexNumber
			}
			episode := 0
			if ep.IndexNumber != nil {
				episode = *ep.IndexNumber
			}
			if season == seasonNumber && episode == episodeNumber {
				return ep.ID, nil
			}
		}
		if len(resp.Items) < pageSize {
			break
		}
	}
	return "", fmt.Errorf("jellyfin: episode %d of season %d not found on media server", episodeNumber, seasonNumber)
}

func (c *JellyfinClient) do(ctx context.Context, method, path string, params url.Values) ([]byte, error) {
	u := c.baseURL + path
	if params != nil {
		u += "?" + params.Encode()
	}
	req, err := http.NewRequestWithContext(ctx, method, u, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("X-Emby-Authorization", fmt.Sprintf(`MediaBrowser Client="KamiSama", Device="Server", DeviceId="kamisama-server", Version="1.0.0", Token="%s"`, c.apiKey))
	if c.apiKey != "" {
		q := req.URL.Query()
		q.Set("api_key", c.apiKey)
		req.URL.RawQuery = q.Encode()
	}
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(io.LimitReader(resp.Body, 10<<20))
	if err != nil {
		return nil, err
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("jellyfin %s %s: %d: %s", method, path, resp.StatusCode, string(body))
	}
	return body, nil
}

// doWithAuth issues an authenticated request (reusing the do() auth headers)
// and returns the raw response so callers can inspect status codes of APIs
// that don't fit the byte-returning do() shape.
func (c *JellyfinClient) doWithAuth(req *http.Request) (*http.Response, error) {
	req.Header.Set("X-Emby-Authorization", fmt.Sprintf(`MediaBrowser Client="KamiSama", Device="Server", DeviceId="kamisama-server", Version="1.0.0", Token="%s"`, c.apiKey))
	req.Header.Set("X-Emby-Token", c.apiKey)
	if c.apiKey != "" {
		q := req.URL.Query()
		q.Set("api_key", c.apiKey)
		req.URL.RawQuery = q.Encode()
	}
	return c.httpClient.Do(req)
}

// sanitizeStrmName turns an arbitrary display name into a safe, stable
// filename stem (no path separators, no control characters).
func sanitizeStrmName(name string) string {
	if name == "" {
		name = "Remote Media"
	}
	var b strings.Builder
	for _, r := range name {
		switch {
		case r >= 'a' && r <= 'z', r >= 'A' && r <= 'Z', r >= '0' && r <= '9', r == '-', r == '_', r == ' ', r == '.':
			b.WriteRune(r)
		default:
			b.WriteRune('-')
		}
	}
	stem := strings.TrimSpace(strings.ReplaceAll(b.String(), " ", "-"))
	stem = strings.Trim(stem, "-.")
	return stem
}

// fnv32 hashes a string into a short stable identifier (FNV-1a 32-bit).
func fnv32(s string) uint32 {
	const (
		offset = 2166136261
		prime  = 16777619
	)
	h := uint32(offset)
	for i := 0; i < len(s); i++ {
		h ^= uint32(s[i])
		h *= prime
	}
	return h
}

type jfItemsResponse struct {
	Items            []jfItem `json:"Items"`
	TotalRecordCount int      `json:"TotalRecordCount"`
}

type jfItem struct {
	ID                string   `json:"Id"`
	Name              string   `json:"Name"`
	OriginalTitle     string   `json:"OriginalTitle"`
	Type              string   `json:"Type"`
	Year              int      `json:"ProductionYear"`
	Overview          string   `json:"Overview"`
	CommunityRating   float64  `json:"CommunityRating"`
	SeriesName        string   `json:"SeriesName"`
	ParentIndexNumber *int     `json:"ParentIndexNumber"`
	IndexNumber       *int     `json:"IndexNumber"`
	Genres            []string `json:"Genres"`
}

// mapJFItemToStreamCandidate shapes a Jellyfin item the way the stream
// resolver (routes/discover.go) consumes it: id/sourceId/name/type/year/
// rating/… . SearchItems is only used to LOCATE the media-server item
// backing a catalog row (title + year matching) — it never imports content.
func mapJFItemToStreamCandidate(item jfItem) map[string]interface{} {
	result := map[string]interface{}{
		"id":       item.ID,
		"sourceId": item.ID,
		"name":     item.Name,
		"type":     item.Type,
		"year":     item.Year,
		"rating":   item.CommunityRating,
		"overview": item.Overview,
	}
	if item.SeriesName != "" {
		result["name"] = item.SeriesName
		result["originalTitle"] = item.OriginalTitle
	}
	if item.ParentIndexNumber != nil {
		result["seasonNumber"] = *item.ParentIndexNumber
	}
	if item.IndexNumber != nil {
		result["episodeNumber"] = *item.IndexNumber
	}
	if len(item.Genres) > 0 {
		result["genres"] = item.Genres
	}
	return result
}

// SearchItems locates items on the media server by title — used by the
// stream resolver to find the Jellyfin counterpart of a catalog row so the
// /watch page can play it. Purely a streaming-side lookup.
func (c *JellyfinClient) SearchItems(ctx context.Context, query string, limit int) ([]map[string]interface{}, error) {
	params := url.Values{}
	params.Set("SearchTerm", query)
	params.Set("Limit", strconv.Itoa(limit))
	params.Set("Recursive", "true")
	params.Set("IncludeItemTypes", "Series,Episode,Movie")
	params.Set("Fields", "Genres")
	body, err := c.do(ctx, http.MethodGet, fmt.Sprintf("/Users/%s/Items", c.userID), params)
	if err != nil {
		return nil, err
	}
	var resp jfItemsResponse
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, err
	}
	items := make([]map[string]interface{}, 0, len(resp.Items))
	for _, item := range resp.Items {
		items = append(items, mapJFItemToStreamCandidate(item))
	}
	return items, nil
}
