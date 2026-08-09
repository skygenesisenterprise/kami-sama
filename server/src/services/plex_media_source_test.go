package services

import (
	"context"
	"net/http"
	"net/url"
	"testing"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// TestPlexMediaSource_DisabledWhenConfigEmpty ensures the provider returns a
// well-formed error when the underlying client isn't configured.
func TestPlexMediaSource_DisabledWhenConfigEmpty(t *testing.T) {
	client := NewPlexClient(PlexConfig{})
	src := NewPlexMediaSource(client, nil)
	_, err := src.ListLibraries(context.Background())
	if err == nil {
		t.Fatal("expected error from unconfigured client")
	}
	// Sanity check: error surface matches app error contract.
	if !contains(err.Error(), "Plex") && !contains(err.Error(), "PLEX") {
		t.Fatalf("expected error message to mention Plex, got %v", err)
	}
}

// TestPlexMediaSource_EnabledMirrorsClientEnabled ensures Enabled() reflects
// the underlying client's wiring rather than returning a confused state.
func TestPlexMediaSource_EnabledMirrorsClientEnabled(t *testing.T) {
	off := NewPlexClient(PlexConfig{})
	if off.Enabled() {
		t.Fatal("expected client to be disabled when URL+token empty")
	}
	on := NewPlexClient(PlexConfig{
		URL:   "http://plex.local:32400",
		Token: "abc",
	})
	if !on.Enabled() {
		t.Fatal("expected client to be enabled when URL+token populated")
	}
	if on.Token() != "abc" {
		t.Fatalf("expected token to be reported, got %q", on.Token())
	}

	// Header check via a tiny in-process HTTP server.
	srv, client := plexTestServer(t, func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("X-Plex-Token") == "" || r.Header.Get("X-Plex-Client-Identifier") == "" {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"MediaContainer":{"size":0}}`))
	})
	_ = srv
	mc, err := client.doRequest(context.Background(), http.MethodGet, "/", nil)
	if err != nil {
		t.Fatalf("expected OK, got %v", err)
	}
	if mc == nil {
		t.Fatal("expected non-nil MediaContainer")
	}
	if _, ok := mc.Raw["size"]; !ok {
		t.Fatal("expected size key in raw MediaContainer envelope")
	}
}

// TestPlexMediaSource_SyncExtractsError ensures the Sync method surfaces
// upstream failures rather than swallowing them. The client isn't connected
// to a real Plex server, so we expect plexDisabledError.
//
// This catches regressions where a nil client crashes unexpectedly during
// the sync codepath.
func TestPlexMediaSource_SyncExtractsError(t *testing.T) {
	client := NewPlexClient(PlexConfig{})
	source := NewPlexMediaSource(client, newPlexTestDB(t))
	if _, err := source.SyncLibrary(context.Background(), "1"); err == nil {
		t.Fatal("expected error from unconfigured sync")
	}
}

// TestPlexMediaSource_LibraryWiring checks that enabled() guards every
// accessor path. Each method must fail gracefully without a configured
// client.
func TestPlexMediaSource_LibraryWiring(t *testing.T) {
	client := NewPlexClient(PlexConfig{})
	source := NewPlexMediaSource(client, nil)

	cases := []struct {
		name string
		fn   func() (any, error)
	}{
		{"ListLibraries", func() (any, error) { return source.ListLibraries(context.Background()) }},
		{"GetLibrary", func() (any, error) { return source.GetLibrary(context.Background(), "1") }},
		{"ListItems", func() (any, error) { _, _, err := source.ListItems(context.Background(), "1", 10, 0, "", ""); return nil, err }},
		{"GetItem", func() (any, error) { return source.GetItem(context.Background(), "1") }},
		{"SearchItems", func() (any, error) { return source.SearchItems(context.Background(), "query", 10) }},
		{"GetStreamURL", func() (any, error) { return source.GetStreamURL(context.Background(), "1", "native") }},
		{"GetPlaybackInfo", func() (any, error) { return source.GetPlaybackInfo(context.Background(), "1") }},
		{"SyncLibrary", func() (any, error) { return source.SyncLibrary(context.Background(), "1") }},
		{"GetSyncStatus", func() (any, error) { return source.GetSyncStatus(context.Background(), "1") }},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if _, err := tc.fn(); err == nil {
				t.Fatalf("expected error for %s", tc.name)
			}
		})
	}
}

// newPlexTestDB returns an in-memory SQLite gorm.DB. The schema is left
// empty on purpose: the only call sites hit the Sync path with an
// unconfigured client, which short-circuits before any migration happens.
// We deliberately skip AutoMigrate here because AutoMigrate with an empty
// struct is a SQLite syntax error.
func newPlexTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite: %v", err)
	}
	return db
}

// TestBuildPlexStreamURL_ProducesUniversalStartURL locks the shape of the
// stream URL handed to the browser: it must target the universal transcode
// endpoint (not the server root, which serves the Plex web app HTML), carry
// the media part path, and embed the token so the <video> element can fetch
// the stream directly.
func TestBuildPlexStreamURL_ProducesUniversalStartURL(t *testing.T) {
	_, client := plexTestServer(t, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"MediaContainer":{"Metadata":[{"ratingKey":"1","Media":[{"Part":[{"key":"/library/parts/100/file.mkv"}]}]}]}}`))
	})

	got, err := BuildPlexStreamURL(context.Background(), client, "1", "native")
	if err != nil {
		t.Fatalf("BuildPlexStreamURL: %v", err)
	}

	u, err := url.Parse(got)
	if err != nil {
		t.Fatalf("parsing produced URL: %v", err)
	}
	if u.Path != "/video/:/transcode/universal/start" {
		t.Fatalf("expected universal start path, got %q (full URL: %s)", u.Path, got)
	}
	q := u.Query()
	if q.Get("path") != "/library/parts/100/file.mkv" {
		t.Fatalf("expected part path query, got %q", q.Get("path"))
	}
	if q.Get("X-Plex-Token") != "fake-token" {
		t.Fatalf("expected token to be embedded, got %q", q.Get("X-Plex-Token"))
	}
	if q.Get("protocol") != "http" {
		t.Fatalf("expected http protocol for a plain http server, got %q", q.Get("protocol"))
	}
}

// TestBuildPlexUniversalStreamURL_ProtocolDerivation locks the protocol query
// param to the base URL scheme, so https (plex.direct) servers don't get an
// http stream link.
func TestBuildPlexUniversalStreamURL_ProtocolDerivation(t *testing.T) {
	cases := []struct {
		name     string
		baseURL  string
		protocol string
	}{
		{"http", "http://192.168.1.50:32400", "http"},
		{"https", "https://abc-123.plex.direct:32400", "https"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got, err := buildPlexUniversalStreamURL(tc.baseURL, "/library/parts/1/file.mkv", "tok", "")
			if err != nil {
				t.Fatalf("buildPlexUniversalStreamURL: %v", err)
			}
			u, err := url.Parse(got)
			if err != nil {
				t.Fatalf("parsing produced URL: %v", err)
			}
			if u.Path != "/video/:/transcode/universal/start" {
				t.Fatalf("expected universal start path, got %q", u.Path)
			}
			if q := u.Query(); q.Get("protocol") != tc.protocol {
				t.Fatalf("expected protocol=%s, got %q", tc.protocol, q.Get("protocol"))
			}
		})
	}
}

// TestBuildPlexStreamURL_RequiresPartKey ensures the builder fails cleanly
// when the Plex metadata has no playable media part, instead of producing a
// malformed URL.
func TestBuildPlexStreamURL_RequiresPartKey(t *testing.T) {
	_, client := plexTestServer(t, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"MediaContainer":{"Metadata":[{"ratingKey":"1","Media":[]}]}}`))
	})

	if _, err := BuildPlexStreamURL(context.Background(), client, "1", "native"); err == nil {
		t.Fatal("expected error when the item has no media part")
	}
}

// TestPlexMediaSource_ListItemsReturnShape locks the return signature of
// ListItems so future refactors don't break the existing routes that
// destructure `(items, total, error)`.
func TestPlexMediaSource_ListItemsReturnShape(t *testing.T) {
	client := NewPlexClient(PlexConfig{})
	source := NewPlexMediaSource(client, nil)
	// We expect (slice, int, error). Validate by short-circuit when the
	// first non-nil error is returned.
	defer func() {
		if r := recover(); r != nil {
			t.Fatalf("ListItems panicked: %v", r)
		}
	}()
	_, _, err := source.ListItems(context.Background(), "1", 10, 0, "", "")
	if err == nil {
		t.Fatal("expected error when client unconfigured")
	}
}

func contains(s, sub string) bool {
	if len(sub) == 0 {
		return true
	}
	for i := 0; i+len(sub) <= len(s); i++ {
		if s[i:i+len(sub)] == sub {
			return true
		}
	}
	return false
}
