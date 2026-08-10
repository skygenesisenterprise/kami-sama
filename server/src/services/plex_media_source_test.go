package services

import (
	"context"
	"net/http"
	"net/url"
	"testing"
	"time"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"github.com/skygenesisenterprise/kami-sama/server/src/models"
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

// TestImportPlexShowEpisodes_SeedsSeasonAndEpisodeGrid locks the fix that
// makes series imported from Plex playable: the library sync only writes the
// show row, so importPlexShowEpisodes must fetch the provider's season +
// episode grid (/allLeaves) and persist it under the anime row — otherwise
// the watch page shows "épisode introuvable" for every Plex series.
func TestImportPlexShowEpisodes_SeedsSeasonAndEpisodeGrid(t *testing.T) {
	_, client := plexTestServer(t, func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/library/metadata/844130/allLeaves" {
			t.Fatalf("unexpected path %q", r.URL.Path)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"MediaContainer":{"Metadata":[
			{"ratingKey":"9001","title":"Premier \u00e9pisode","parentIndex":1,"index":1,"duration":2940000,"summary":"Synopsis 1","thumb":"/library/metadata/9001/thumb/1"},
			{"ratingKey":"9002","title":"Deuxi\u00e8me \u00e9pisode","parentIndex":1,"index":2,"duration":2940000,"summary":"Synopsis 2","thumb":"/library/metadata/9002/thumb/1"},
			{"ratingKey":"9101","title":"Sp\u00e9cial","parentIndex":2,"index":1,"duration":1200000,"summary":"Synopsis 3","thumb":"/library/metadata/9101/thumb/1"}
		]}}`))
	})

	db := newPlexTestDB(t)
	if err := db.AutoMigrate(&models.Anime{}, &models.AnimeSeason{}, &models.Episode{}); err != nil {
		t.Fatalf("migrate: %v", err)
	}
	// The show row as SyncLibrary creates it (ID = Plex ratingKey).
	anime := models.Anime{
		Common: models.Common{ID: "844130", CreatedAt: time.Now(), UpdatedAt: time.Now()},
		Slug:   "dutton-ranch",
		Title:  "Dutton Ranch",
		Source: "plex",
	}
	if err := db.Create(&anime).Error; err != nil {
		t.Fatalf("create anime: %v", err)
	}

	n, err := importPlexShowEpisodes(context.Background(), db, client, "844130", "844130")
	if err != nil {
		t.Fatalf("importPlexShowEpisodes: %v", err)
	}
	if n != 3 {
		t.Fatalf("expected 3 episodes imported, got %d", n)
	}

	var seasons []models.AnimeSeason
	if err := db.Where("anime_id = ?", "844130").Order("number asc").Find(&seasons).Error; err != nil {
		t.Fatalf("load seasons: %v", err)
	}
	if len(seasons) != 2 {
		t.Fatalf("expected 2 seasons, got %d", len(seasons))
	}
	if seasons[0].EpisodeCount != 2 || seasons[1].EpisodeCount != 1 {
		t.Fatalf("unexpected episode counts: %d / %d", seasons[0].EpisodeCount, seasons[1].EpisodeCount)
	}

	var episodes []models.Episode
	// Order by SEASON NUMBER (not season_id — that is a random UUIDv4, so
	// ordering on it is arbitrary and makes this assertion flaky), then by
	// episode number inside each season.
	if err := db.Where("episodes.anime_id = ?", "844130").
		Joins("JOIN anime_seasons ON anime_seasons.id = episodes.season_id").
		Order("anime_seasons.number asc").
		Order("episodes.number asc").
		Find(&episodes).Error; err != nil {
		t.Fatalf("load episodes: %v", err)
	}
	if len(episodes) != 3 {
		t.Fatalf("expected 3 episodes, got %d", len(episodes))
	}
	if episodes[0].Title != "Premier épisode" || episodes[0].Number != 1 {
		t.Fatalf("unexpected first episode: %q #%d", episodes[0].Title, episodes[0].Number)
	}
	if episodes[2].Title != "Spécial" || episodes[2].Number != 1 {
		t.Fatalf("unexpected season-2 episode: %q #%d", episodes[2].Title, episodes[2].Number)
	}
	// Both episodes of season 1 must share the same season row.
	if episodes[0].SeasonID == nil || episodes[1].SeasonID == nil || *episodes[0].SeasonID != *episodes[1].SeasonID {
		t.Fatalf("season-1 episodes must share one season row")
	}
	if episodes[2].SeasonID == nil || *episodes[2].SeasonID == *episodes[0].SeasonID {
		t.Fatalf("season-2 episode must belong to a different season")
	}

	// total_episodes must reflect the imported grid (the watch page and the
	// discover rails read it from the API availability block).
	var updated models.Anime
	if err := db.First(&updated, "id = ?", "844130").Error; err != nil {
		t.Fatalf("reload anime: %v", err)
	}
	if updated.TotalEpisodes != 3 {
		t.Fatalf("expected total_episodes=3, got %d", updated.TotalEpisodes)
	}
}

// TestImportPlexShowEpisodes_Idempotent ensures a second run refreshes in
// place instead of duplicating rows — the sync re-runs periodically and must
// not grow the episode grid every hour.
func TestImportPlexShowEpisodes_Idempotent(t *testing.T) {
	_, client := plexTestServer(t, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"MediaContainer":{"Metadata":[
			{"ratingKey":"9001","title":"E1","parentIndex":1,"index":1,"duration":1000,"summary":"","thumb":"/library/metadata/9001/thumb/1"}
		]}}`))
	})

	db := newPlexTestDB(t)
	if err := db.AutoMigrate(&models.Anime{}, &models.AnimeSeason{}, &models.Episode{}); err != nil {
		t.Fatalf("migrate: %v", err)
	}
	anime := models.Anime{
		Common: models.Common{ID: "844130", CreatedAt: time.Now(), UpdatedAt: time.Now()},
		Slug:   "dutton-ranch",
		Title:  "Dutton Ranch",
		Source: "plex",
	}
	if err := db.Create(&anime).Error; err != nil {
		t.Fatalf("create anime: %v", err)
	}

	for i := 0; i < 2; i++ {
		if _, err := importPlexShowEpisodes(context.Background(), db, client, "844130", "844130"); err != nil {
			t.Fatalf("run %d: %v", i, err)
		}
	}

	var count int64
	if err := db.Model(&models.Episode{}).Where("anime_id = ?", "844130").Count(&count).Error; err != nil {
		t.Fatalf("count episodes: %v", err)
	}
	if count != 1 {
		t.Fatalf("expected exactly 1 episode after re-sync, got %d", count)
	}
	var seasons int64
	if err := db.Model(&models.AnimeSeason{}).Where("anime_id = ?", "844130").Count(&seasons).Error; err != nil {
		t.Fatalf("count seasons: %v", err)
	}
	if seasons != 1 {
		t.Fatalf("expected exactly 1 season after re-sync, got %d", seasons)
	}
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
	// protocol is pinned to hls (the only value the universal transcode
	// endpoint accepts that yields an HLS master playlist) — it is NOT
	// derived from the base URL scheme (that derivation was the bug that
	// 400'd every request on non-http servers).
	if q.Get("protocol") != "hls" {
		t.Fatalf("expected hls protocol, got %q", q.Get("protocol"))
	}
}

// TestBuildPlexUniversalStreamURL_PinsHlsProtocol locks the protocol query
// param to "hls" regardless of the base URL scheme. Plex's universal
// transcode endpoint accepts only hls/dash/http here and returns HTTP 400
// for anything else; deriving it from the URL scheme was the bug that 400'd
// every request on plex.direct (https) servers.
func TestBuildPlexUniversalStreamURL_PinsHlsProtocol(t *testing.T) {
	for _, baseURL := range []string{"http://192.168.1.50:32400", "https://abc-123.plex.direct:32400"} {
		got, err := buildPlexUniversalStreamURL(baseURL, "/library/parts/1/file.mkv", "tok", "")
		if err != nil {
			t.Fatalf("buildPlexUniversalStreamURL(%s): %v", baseURL, err)
		}
		u, err := url.Parse(got)
		if err != nil {
			t.Fatalf("parsing produced URL: %v", err)
		}
		if u.Path != "/video/:/transcode/universal/start" {
			t.Fatalf("expected universal start path, got %q", u.Path)
		}
		if q := u.Query(); q.Get("protocol") != "hls" {
			t.Fatalf("expected protocol=hls for %s, got %q", baseURL, q.Get("protocol"))
		}
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
