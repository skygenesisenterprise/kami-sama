package services

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
)

// TestJellyfinClient_EnabledReflectsWiring ensures Enabled() tracks the three
// required pieces (URL, API key, user ID) rather than reporting a partial
// configuration as ready.
func TestJellyfinClient_EnabledReflectsWiring(t *testing.T) {
	if NewJellyfinClient(JellyfinConfig{}).Enabled() {
		t.Fatal("expected empty config to be disabled")
	}
	if NewJellyfinClient(JellyfinConfig{URL: "http://jf:8096", APIKey: "k"}).Enabled() {
		t.Fatal("expected config without user ID to be disabled")
	}
	on := NewJellyfinClient(JellyfinConfig{URL: "http://jf:8096/", APIKey: "k", UserID: "u1"})
	if !on.Enabled() {
		t.Fatal("expected full config to be enabled")
	}
	if on.APIKey() != "k" {
		t.Fatalf("expected APIKey to be reported, got %q", on.APIKey())
	}
}

// TestJellyfinClient_HLSManifestURLShape locks the manifest URL shape handed
// to the same-origin proxy: /Videos/{id}/master.m3u8 with the API key, a
// stable DeviceId so Jellyfin binds the transcode session to the backend, and
// the forced h264/aac codec params so bridged HEVC sources are transcoded
// into something every browser MSE can decode.
func TestJellyfinClient_HLSManifestURLShape(t *testing.T) {
	c := NewJellyfinClient(JellyfinConfig{URL: "http://media-server:8096", APIKey: "secret", UserID: "u1"})
	got := c.HLSManifestURL("item-123")
	u, err := url.Parse(got)
	if err != nil {
		t.Fatalf("parsing produced URL: %v", err)
	}
	if u.Path != "/Videos/item-123/master.m3u8" {
		t.Fatalf("expected /Videos/{id}/master.m3u8 path, got %q (full URL: %s)", u.Path, got)
	}
	q := u.Query()
	if q.Get("api_key") != "secret" || q.Get("DeviceId") != "kamisama-server" {
		t.Fatalf("expected api_key + DeviceId query params, got %q", u.RawQuery)
	}
	if q.Get("VideoCodec") != "h264" || q.Get("AudioCodec") != "aac" || q.Get("TranscodingMaxAudioChannels") != "2" {
		t.Fatalf("expected forced h264/aac codec params, got %q", u.RawQuery)
	}
}

// TestJellyfinClient_HLSManifestURLWithSourceCarriesCodecParams locks the
// source-pinned variant too: the MediaSourceId must be present alongside the
// same forced codec params so bridged items never fall back to a HEVC remux.
func TestJellyfinClient_HLSManifestURLWithSourceCarriesCodecParams(t *testing.T) {
	c := NewJellyfinClient(JellyfinConfig{URL: "http://media-server:8096", APIKey: "secret", UserID: "u1"})
	got := c.HLSManifestURLWithSource("item-123", "src-9")
	u, err := url.Parse(got)
	if err != nil {
		t.Fatalf("parsing produced URL: %v", err)
	}
	q := u.Query()
	if q.Get("MediaSourceId") != "src-9" {
		t.Fatalf("expected MediaSourceId=src-9, got %q", q.Get("MediaSourceId"))
	}
	if q.Get("VideoCodec") != "h264" || q.Get("AudioCodec") != "aac" {
		t.Fatalf("expected forced codec params on source-pinned manifest, got %q", u.RawQuery)
	}
}

// TestJellyfinClient_BuildSegmentURLHandlesQueries locks the critical proxy
// behaviour: an origin that carries a query string (Jellyfin appends
// api_key/DeviceId/MediaSourceId to segment lines) must be rebuilt as a real
// query string — never baked into the path — and any upstream api_key must be
// replaced by our own.
func TestJellyfinClient_BuildSegmentURLHandlesQueries(t *testing.T) {
	c := NewJellyfinClient(JellyfinConfig{URL: "http://media-server:8096", APIKey: "ours", UserID: "u1"})

	cases := []struct {
		name     string
		origin   string
		wantPath string
		wantKey  string
	}{
		{
			name:     "bare filename",
			origin:   "0.ts",
			wantPath: "/Videos/item-123/0.ts",
			wantKey:  "ours",
		},
		{
			name:     "relative with query",
			origin:   "../Videos/item-123/0000000.ts?api_key=theirs&DeviceId=dev-1",
			wantPath: "/Videos/item-123/0000000.ts",
			wantKey:  "ours",
		},
		{
			name:     "absolute path with query",
			origin:   "Videos/item-123/0000001.ts?api_key=theirs&MediaSourceId=ms-9",
			wantPath: "/Videos/item-123/0000001.ts",
			wantKey:  "ours",
		},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got, err := c.BuildSegmentURL("item-123", tc.origin)
			if err != nil {
				t.Fatalf("BuildSegmentURL: %v", err)
			}
			u, err := url.Parse(got)
			if err != nil {
				t.Fatalf("parsing produced URL: %v", err)
			}
			if u.Path != tc.wantPath {
				t.Fatalf("expected path %q, got %q (full URL: %s)", tc.wantPath, u.Path, got)
			}
			q := u.Query()
			if q.Get("api_key") != tc.wantKey {
				t.Fatalf("expected api_key=%q, got %q", tc.wantKey, q.Get("api_key"))
			}
			if strings.Contains(u.Path, "?") || strings.Contains(u.Path, "api_key") {
				t.Fatalf("query string leaked into path: %q", u.Path)
			}
		})
	}
}

// TestJellyfinClient_ResolveMediaSourceID locks the real media-source
// resolution used by the Plex→Jellyfin bridge: the returned Id must be the
// item's actual MediaSourceInfo.Id (a distinct value, NOT the item id). The
// old assumption that a .strm item's MediaSourceId equals its item id makes
// the HLS master request answer HTTP 400 "The specified media source could
// not be found" on Jellyfin 10.11+.
func TestJellyfinClient_ResolveMediaSourceID(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Query().Get("Fields") != "MediaSources" {
			t.Errorf("expected Fields=MediaSources, got %q", r.URL.Query())
		}
		if !strings.Contains(r.Header.Get("X-Emby-Authorization"), "Token=\"k\"") {
			t.Errorf("expected token in X-Emby-Authorization")
		}
		switch {
		case strings.HasSuffix(r.URL.Path, "/item-remote"):
			_, _ = w.Write([]byte(`{"MediaSources":[{"Id":"src-remote-1","Protocol":"Http","IsRemote":true}]}`))
		case strings.HasSuffix(r.URL.Path, "/item-multi"):
			_, _ = w.Write([]byte(`{"MediaSources":[{"Id":"src-a","Protocol":"File"},{"Id":"src-b","Protocol":"Http","IsRemote":true}]}`))
		case strings.HasSuffix(r.URL.Path, "/item-file"):
			_, _ = w.Write([]byte(`{"MediaSources":[{"Id":"src-file","Protocol":"File","IsRemote":false}]}`))
		default:
			_, _ = w.Write([]byte(`{"MediaSources":[]}`))
		}
	}))
	defer srv.Close()

	c := NewJellyfinClient(JellyfinConfig{URL: srv.URL, APIKey: "k", UserID: "u1"})

	cases := []struct {
		name    string
		itemID  string
		want    string
		wantErr bool
	}{
		{"remote source preferred", "item-remote", "src-remote-1", false},
		{"remote source picked over file", "item-multi", "src-b", false},
		{"file source used as fallback", "item-file", "src-file", false},
		{"no sources errors", "item-empty", "", true},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got, err := c.ResolveMediaSourceID(context.Background(), tc.itemID)
			if tc.wantErr {
				if err == nil {
					t.Fatal("expected error, got nil")
				}
				return
			}
			if err != nil {
				t.Fatalf("ResolveMediaSourceID: %v", err)
			}
			if got != tc.want {
				t.Fatalf("expected %q, got %q", tc.want, got)
			}
		})
	}
}

// TestJellyfinClient_ItemResolvesRemote locks the .strm shortcut-resolution
// check: an item whose MediaSource is a plain file (Protocol=File, the
// library scan raced past the fresh .strm) must report false so the bridge
// forces the recovery re-scan, while Protocol=Http / IsRemote=true items are
// recognised as playable.
func TestJellyfinClient_ItemResolvesRemote(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Same auth contract as every other Jellyfin API call.
		if !strings.Contains(r.Header.Get("X-Emby-Authorization"), "Token=\"k\"") || r.URL.Query().Get("api_key") != "k" {
			t.Errorf("expected authenticated item request, got headers=%q query=%q", r.Header.Get("X-Emby-Authorization"), r.URL.RawQuery)
		}
		switch {
		case strings.HasSuffix(r.URL.Path, "/item-remote"):
			_, _ = w.Write([]byte(`{"MediaSources":[{"Protocol":"Http","IsRemote":true}]}`))
		case strings.HasSuffix(r.URL.Path, "/item-remote-file"):
			_, _ = w.Write([]byte(`{"MediaSources":[{"Protocol":"File","IsRemote":true}]}`))
		default:
			_, _ = w.Write([]byte(`{"MediaSources":[{"Protocol":"File","IsRemote":false}]}`))
		}
	}))
	defer srv.Close()

	c := NewJellyfinClient(JellyfinConfig{URL: srv.URL, APIKey: "k", UserID: "u1"})

	for _, tc := range []struct {
		name   string
		itemID string
		want   bool
	}{
		{"plain file (unresolved strm)", "item-file", false},
		{"resolved remote http", "item-remote", true},
		{"remote via IsRemote flag", "item-remote-file", true},
	} {
		t.Run(tc.name, func(t *testing.T) {
			got, err := c.ItemResolvesRemote(context.Background(), tc.itemID)
			if err != nil {
				t.Fatalf("ItemResolvesRemote: %v", err)
			}
			if got != tc.want {
				t.Fatalf("expected %v, got %v", tc.want, got)
			}
		})
	}
}

// TestJellyfinClient_ResolveEpisodeKeyPicksMatchingEpisode ensures the
// (season, episode) pair is matched against the media server's episodes and
// that a missing pair yields a clean error.
func TestJellyfinClient_ResolveEpisodeKeyPicksMatchingEpisode(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// c.do() authenticates via X-Emby-Authorization + api_key query param.
		if !strings.Contains(r.Header.Get("X-Emby-Authorization"), "Token=\"k\"") {
			t.Errorf("expected token in X-Emby-Authorization on episode resolution")
		}
		if r.URL.Query().Get("api_key") != "k" {
			t.Errorf("expected api_key query param, got %q", r.URL.Query().Get("api_key"))
		}
		if !strings.Contains(r.URL.Path, "/Users/u1/Items") {
			t.Errorf("expected /Users/u1/Items, got %s", r.URL.Path)
		}
		if r.URL.Query().Get("ParentId") != "series-1" {
			t.Errorf("expected ParentId=series-1, got %q", r.URL.Query().Get("ParentId"))
		}
		items := map[string]any{
			"Items": []map[string]any{
				{"Id": "ep-1", "Name": "Ep 1", "ParentIndexNumber": 1, "IndexNumber": 1},
				{"Id": "ep-2", "Name": "Ep 2", "ParentIndexNumber": 1, "IndexNumber": 2},
				{"Id": "sp-1", "Name": "Special", "ParentIndexNumber": nil, "IndexNumber": nil},
			},
			"TotalRecordCount": 3,
		}
		_ = json.NewEncoder(w).Encode(items)
	}))
	defer srv.Close()

	c := NewJellyfinClient(JellyfinConfig{URL: srv.URL, APIKey: "k", UserID: "u1"})
	got, err := c.ResolveEpisodeKey(context.Background(), "series-1", 1, 2)
	if err != nil {
		t.Fatalf("ResolveEpisodeKey: %v", err)
	}
	if got != "ep-2" {
		t.Fatalf("expected ep-2, got %q", got)
	}

	if _, err := c.ResolveEpisodeKey(context.Background(), "series-1", 3, 9); err == nil {
		t.Fatal("expected error for missing episode")
	}
	if _, err := c.ResolveEpisodeKey(context.Background(), "", 1, 1); err == nil {
		t.Fatal("expected error for empty series ID")
	}
}

// TestJellyfinClient_DoWithAuthAttachesKey ensures the proxy auth path sends
// the API key as a header, never in the browser-facing URL alone.
func TestJellyfinClient_DoWithAuthAttachesKey(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("X-Emby-Token") != "k" {
			t.Errorf("expected X-Emby-Token header, got %q", r.Header.Get("X-Emby-Token"))
		}
		if !strings.Contains(r.Header.Get("X-Emby-Authorization"), "Token=\"k\"") {
			t.Errorf("expected token in X-Emby-Authorization, got %q", r.Header.Get("X-Emby-Authorization"))
		}
		w.Header().Set("Content-Type", "application/vnd.apple.mpegurl")
		_, _ = w.Write([]byte("#EXTM3U\n"))
	}))
	defer srv.Close()

	c := NewJellyfinClient(JellyfinConfig{URL: srv.URL, APIKey: "k", UserID: "u1"})
	resp, err := c.DoWithAuth(context.Background(), srv.URL+"/Videos/x/master.m3u8?api_key=k")
	if err != nil {
		t.Fatalf("DoWithAuth: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
}
// TestJellyfinClient_TranscodeMasterURL locks the PlaybackInfo negotiation
// used for the watch-page master: the returned URL must be Jellyfin's own
// transcode URL (made absolute), with the subtitle params stripped so the
// transcode never burns ASS subtitles into the picture. A failed negotiation
// (non-2xx, missing media source) must return "" so callers fall back to the
// hand-built master (HLSManifestURL*), preserving the pre-fix behaviour.
func TestJellyfinClient_TranscodeMasterURL(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			t.Errorf("expected POST, got %s", r.Method)
		}
		if !strings.HasSuffix(r.URL.Path, "/PlaybackInfo") {
			t.Errorf("expected PlaybackInfo endpoint, got %s", r.URL.Path)
		}
		if r.URL.Query().Get("userId") != "u1" {
			t.Errorf("expected userId=u1, got %q", r.URL.Query().Get("userId"))
		}
		if !strings.Contains(r.Header.Get("X-Emby-Authorization"), "Token=\"k\"") {
			t.Errorf("expected token in X-Emby-Authorization")
		}
		switch {
		case strings.Contains(r.URL.Path, "case-error"):
			http.Error(w, "boom", http.StatusInternalServerError)
			return
		case strings.Contains(r.URL.Path, "case-empty"):
			_, _ = w.Write([]byte(`{"MediaSources":[]}`))
			return
		}
		_, _ = w.Write([]byte(`{"MediaSources":[{"TranscodingUrl":"/videos/item-123/master.m3u8?DeviceId=d1&AudioCodec=aac&SubtitleStreamIndex=3&SubtitleMethod=Encode&ApiKey=k"}]}`))
	}))
	defer srv.Close()

	c := NewJellyfinClient(JellyfinConfig{URL: srv.URL, APIKey: "k", UserID: "u1"})

	got := c.TranscodeMasterURL(context.Background(), "item-123", "ms-9")
	if !strings.HasPrefix(got, srv.URL+"/videos/item-123/master.m3u8?") {
		t.Fatalf("expected absolute PlaybackInfo master URL, got %q", got)
	}
	if strings.Contains(got, "SubtitleStreamIndex") || strings.Contains(got, "SubtitleMethod") {
		t.Fatalf("subtitle params must be stripped, got %q", got)
	}
	if !strings.Contains(got, "AudioCodec=aac") {
		t.Fatalf("expected negotiated codec params to survive, got %q", got)
	}

	if got := c.TranscodeMasterURL(context.Background(), "item-123-case-error", "ms-9"); got != "" {
		t.Fatalf("expected empty URL on upstream error, got %q", got)
	}
	if got := c.TranscodeMasterURL(context.Background(), "item-123-case-empty", "ms-9"); got != "" {
		t.Fatalf("expected empty URL when no media source is returned, got %q", got)
	}
}
