package services

import (
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	gormdatatypes "gorm.io/datatypes"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"github.com/skygenesisenterprise/kami-sama/server/src/models"
)

// newMirrorTestDB returns an in-memory SQLite DB migrated for the models the
// mirror walks (anime rows + their season/episode grids + sync logs).
func newMirrorTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite: %v", err)
	}
	if err := db.AutoMigrate(&models.Anime{}, &models.AnimeSeason{}, &models.Episode{}, &models.SourceSyncLog{}); err != nil {
		t.Fatalf("migrate: %v", err)
	}
	return db
}

// jellyfinMirrorTestServer simulates the media-server side of the mirror: the
// "Remote" library already exists (ItemId lib-1), every library refresh
// succeeds, every .strm search resolves to an item named after the stem, and
// every item reports a resolved remote HTTP media source. It counts how many
// times BridgeRemoteMedia's item search ran so tests can assert idempotency.
func jellyfinMirrorTestServer(t *testing.T, strmDir string) *httptest.Server {
	t.Helper()
	searchHits := 0
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case strings.Contains(r.URL.Path, "/Library/VirtualFolders"):
			_, _ = w.Write([]byte(`[{"Name":"Remote","Locations":["/remote-media"],"ItemId":"lib-1"}]`))
		case strings.HasSuffix(r.URL.Path, "/Refresh"):
			w.WriteHeader(http.StatusNoContent)
		case strings.Contains(r.URL.Path, "/Users/u1/Items") && r.URL.Query().Get("SearchTerm") != "":
			searchHits++
			stem := r.URL.Query().Get("SearchTerm")
			_ = json.NewEncoder(w).Encode(map[string]any{
				"Items": []map[string]any{
					{"Id": "jf-" + stem, "Name": stem, "Type": "Movie"},
				},
			})
		case strings.Contains(r.URL.Path, "/Users/u1/Items"):
			_ = json.NewEncoder(w).Encode(map[string]any{
				"MediaSources": []map[string]any{
					{"Id": "ms-1", "Protocol": "Http", "IsRemote": true},
				},
			})
		default:
			w.WriteHeader(http.StatusNotFound)
			_, _ = w.Write([]byte(`{}`))
		}
	}))
	t.Cleanup(srv.Close)
	t.Cleanup(func() { _ = searchHits }) // keep the counter alive for reads in the test body
	return srv
}

// plexMirrorTestServer simulates the content provider: every /library/metadata
// request returns a playable media part whose key embeds the ratingKey.
func plexMirrorTestServer(t *testing.T) *httptest.Server {
	t.Helper()
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasPrefix(r.URL.Path, "/library/metadata/") {
			w.WriteHeader(http.StatusNotFound)
			return
		}
		key := strings.TrimPrefix(r.URL.Path, "/library/metadata/")
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"MediaContainer": map[string]any{
				"Metadata": []map[string]any{
					{
						"ratingKey": key,
						"title":     "Mirror " + key,
						"Media": []map[string]any{
							{"Part": []map[string]any{{"key": "/library/parts/" + key + "/file.mkv"}}},
						},
					},
				},
			},
		})
	}))
	t.Cleanup(srv.Close)
	return srv
}

// seedMirrorCatalog writes one movie row and one series row (with a season of
// two numeric-ratingKey episodes plus one placeholder id) so the mirror
// exercises both the movie path and the series episode expansion.
func seedMirrorCatalog(t *testing.T, db *gorm.DB) {
	t.Helper()
	now := time.Now().UTC()
	rows := []models.Anime{
		{
			Common:  models.Common{ID: "anime-movie", CreatedAt: now, UpdatedAt: now},
			Slug:    "mirror-movie",
			Title:   "Mirror Movie",
			Source:  "plex",
			Status:  "published",
			Metadata: datatypesJSON(t, `{"sourceId":"1001","type":"Movie"}`),
		},
		{
			Common:  models.Common{ID: "anime-series", CreatedAt: now, UpdatedAt: now},
			Slug:    "mirror-series",
			Title:   "Mirror Series",
			Source:  "plex",
			Status:  "published",
			Metadata: datatypesJSON(t, `{"sourceId":"2000","type":"Series"}`),
		},
	}
	if err := db.Create(&rows).Error; err != nil {
		t.Fatalf("seed anime: %v", err)
	}
	season := models.AnimeSeason{
		Common:  models.Common{ID: "season-1", CreatedAt: now, UpdatedAt: now},
		AnimeID: "anime-series",
		Number:  1,
	}
	if err := db.Create(&season).Error; err != nil {
		t.Fatalf("seed season: %v", err)
	}
	episodes := []models.Episode{
		{Common: models.Common{ID: "2001", CreatedAt: now, UpdatedAt: now}, AnimeID: "anime-series", SeasonID: &season.ID, Number: 1, Title: "Ep 1"},
		{Common: models.Common{ID: "2002", CreatedAt: now, UpdatedAt: now}, AnimeID: "anime-series", SeasonID: &season.ID, Number: 2, Title: "Ep 2"},
		// Placeholder id (non-numeric): no Plex media behind it, must be skipped.
		{Common: models.Common{ID: "placeholder-1", CreatedAt: now, UpdatedAt: now}, AnimeID: "anime-series", SeasonID: &season.ID, Number: 3, Title: "Ep 3"},
	}
	if err := db.Create(&episodes).Error; err != nil {
		t.Fatalf("seed episodes: %v", err)
	}
}

// TestJellyfinMirrorSync_RunBridgesCatalogAndEpisodes is the core mirror test:
// a movie row is bridged once and a series row is expanded episode by episode
// (numeric Plex keys only), with the run landing in source_sync_logs.
func TestJellyfinMirrorSync_RunBridgesCatalogAndEpisodes(t *testing.T) {
	db := newMirrorTestDB(t)
	seedMirrorCatalog(t, db)

	plexSrv := plexMirrorTestServer(t)
	plex := NewPlexClient(PlexConfig{URL: plexSrv.URL, Token: "fake-token", Timeout: 5 * time.Second})

	strmDir := t.TempDir()
	jfSrv := jellyfinMirrorTestServer(t, strmDir)
	jf := NewJellyfinClient(JellyfinConfig{
		URL:             jfSrv.URL,
		APIKey:          "k",
		UserID:          "u1",
		StrmDir:         strmDir,
		StrmLibraryName: "Remote",
		StrmLibraryPath: "/remote-media",
	})

	mirror := NewJellyfinMirrorSync(db, testLogger(t))
	stats := mirror.Run(context.Background(), plex, jf)

	if stats.Status != "completed" {
		t.Fatalf("expected completed status, got %q (%s)", stats.Status, stats.ErrorMessage)
	}
	if stats.ItemsCreated != 1 {
		t.Fatalf("expected 1 movie created, got %d", stats.ItemsCreated)
	}
	if stats.EpisodesScanned != 2 {
		t.Fatalf("expected 2 numeric episodes scanned (placeholder skipped), got %d", stats.EpisodesScanned)
	}
	if stats.EpisodesCreated != 2 {
		t.Fatalf("expected 2 episodes created, got %d", stats.EpisodesCreated)
	}
	if stats.ItemsFailed != 0 || stats.EpisodesFailed != 0 {
		t.Fatalf("expected zero failures, got items=%d episodes=%d", stats.ItemsFailed, stats.EpisodesFailed)
	}

	// Every bridged unit must exist as a .strm file in the shared directory:
	// the movie + the two episodes.
	for _, title := range []string{"Mirror Movie", "Mirror Series"} {
		found := false
		entries, _ := readDirNames(strmDir)
		for _, name := range entries {
			if strings.HasPrefix(name, "Mirror-") && strings.HasSuffix(name, ".strm") {
				found = true
			}
		}
		if !found {
			t.Fatalf("expected a .strm file for %q in %s", title, strmDir)
		}
	}
	// The movie bridges once, the series contributes its 2 episodes → 3 .strm
	// files total.
	entries, _ := readDirNames(strmDir)
	count := 0
	for _, name := range entries {
		if strings.HasSuffix(name, ".strm") {
			count++
		}
	}
	if count != 3 {
		t.Fatalf("expected 3 .strm files, got %d", count)
	}

	// The run must be recorded like any provider sync.
	var log models.SourceSyncLog
	if err := db.Where("source_type = ?", "jellyfin").Order("created_at DESC").First(&log).Error; err != nil {
		t.Fatalf("expected a jellyfin sync log, got %v", err)
	}
	if log.Status != "completed" || log.ItemsCreated != 3 {
		t.Fatalf("unexpected sync log: status=%q created=%d", log.Status, log.ItemsCreated)
	}

	// A second run must be idempotent: same .strm files, items counted as
	// updated instead of created.
	stats2 := mirror.Run(context.Background(), plex, jf)
	if stats2.ItemsCreated != 0 || stats2.ItemsUpdated != 1 {
		t.Fatalf("expected second run to update the movie, got created=%d updated=%d", stats2.ItemsCreated, stats2.ItemsUpdated)
	}
	if stats2.EpisodesCreated != 0 || stats2.EpisodesUpdated != 2 {
		t.Fatalf("expected second run to update episodes, got created=%d updated=%d", stats2.EpisodesCreated, stats2.EpisodesUpdated)
	}
}

// TestJellyfinMirrorSync_StartDetachesCanceledContext is the regression test
// for the "aucune écriture dans la médiathèque Remote" bug: the /sync handler
// answers 202 before the mirror goroutine does any work, so gin has already
// canceled the request context by the time Run() queries the catalog. Start
// must detach that context (context.WithoutCancel) — otherwise the first DB
// query fails with context.Canceled and no .strm file is ever written.
func TestJellyfinMirrorSync_StartDetachesCanceledContext(t *testing.T) {
	db := newMirrorTestDB(t)
	seedMirrorCatalog(t, db)

	plexSrv := plexMirrorTestServer(t)
	plex := NewPlexClient(PlexConfig{URL: plexSrv.URL, Token: "fake-token", Timeout: 5 * time.Second})

	strmDir := t.TempDir()
	jfSrv := jellyfinMirrorTestServer(t, strmDir)
	jf := NewJellyfinClient(JellyfinConfig{
		URL:             jfSrv.URL,
		APIKey:          "k",
		UserID:          "u1",
		StrmDir:         strmDir,
		StrmLibraryName: "Remote",
		StrmLibraryPath: "/remote-media",
	})

	mirror := NewJellyfinMirrorSync(db, testLogger(t))

	// Simulate the request lifecycle: the context is already canceled when
	// Start is called (the 202 response was sent).
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	mirror.Start(ctx, plex, jf)

	// Poll until the background run finishes (or a hard deadline is hit).
	deadline := time.Now().Add(15 * time.Second)
	for time.Now().Before(deadline) {
		stats := mirror.Status()
		if stats.Status != "running" {
			if stats.Status != "completed" {
				t.Fatalf("expected completed run despite canceled context, got %q (%s)", stats.Status, stats.ErrorMessage)
			}
			if stats.ItemsCreated != 1 || stats.EpisodesCreated != 2 {
				t.Fatalf("expected movie + 2 episodes mirrored, got created=%d episodes=%d", stats.ItemsCreated, stats.EpisodesCreated)
			}
			return
		}
		time.Sleep(100 * time.Millisecond)
	}
	t.Fatal("mirror run did not finish within the deadline")
}

// TestJellyfinMirrorSync_RunFailsFastWithoutClients ensures the mirror reports
// a clean failed state (and a sync log) when the media-server or the content
// provider is unavailable, instead of panicking.
func TestJellyfinMirrorSync_RunFailsFastWithoutClients(t *testing.T) {
	db := newMirrorTestDB(t)
	seedMirrorCatalog(t, db)

	mirror := NewJellyfinMirrorSync(db, testLogger(t))

	stats := mirror.Run(context.Background(), nil, nil)
	if stats.Status != "failed" {
		t.Fatalf("expected failed status, got %q", stats.Status)
	}

	var log models.SourceSyncLog
	if err := db.Where("source_type = ?", "jellyfin").First(&log).Error; err != nil {
		t.Fatalf("expected a jellyfin sync log even on failure, got %v", err)
	}
}

// TestJellyfinClient_StrmFileExists ensures the mirror can distinguish a
// freshly bridged item from an already-bridged one by checking the shared
// directory for the deterministic .strm file.
func TestJellyfinClient_StrmFileExists(t *testing.T) {
	strmDir := t.TempDir()
	c := NewJellyfinClient(JellyfinConfig{
		URL:             "http://media-server:8096",
		APIKey:          "k",
		UserID:          "u1",
		StrmDir:         strmDir,
		StrmLibraryName: "Remote",
		StrmLibraryPath: "/remote-media",
	})
	if c.StrmFileExists("Breaking Bad", "http://plex/file.mkv") {
		t.Fatal("expected missing .strm file to report false")
	}
	name := c.strmFileName("Breaking Bad", "http://plex/file.mkv")
	if err := writeFileToDir(strmDir, name, "http://plex/file.mkv"); err != nil {
		t.Fatalf("write strm: %v", err)
	}
	if !c.StrmFileExists("Breaking Bad", "http://plex/file.mkv") {
		t.Fatal("expected existing .strm file to report true")
	}
	// A different URL (different hash) must still be missing.
	if c.StrmFileExists("Breaking Bad", "http://plex/other.mkv") {
		t.Fatal("expected a different URL to report false")
	}
}

// ---- test helpers ---------------------------------------------------------

// datatypesJSON parses a JSON literal into a datatypes.JSON column value.
func datatypesJSON(t *testing.T, raw string) gormdatatypes.JSON {
	t.Helper()
	return gormdatatypes.JSON([]byte(raw))
}

// testLogger returns a discard logger so mirror runs don't spam test output.
func testLogger(t *testing.T) *slog.Logger {
	t.Helper()
	return slog.New(slog.NewTextHandler(io.Discard, nil))
}

// readDirNames returns the file names of a directory.
func readDirNames(dir string) ([]string, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	names := make([]string, 0, len(entries))
	for _, e := range entries {
		names = append(names, e.Name())
	}
	return names, nil
}

// writeFileToDir writes a file into a directory.
func writeFileToDir(dir, name, content string) error {
	return os.WriteFile(filepath.Join(dir, name), []byte(content), 0o644)
}

// TestJellyfinClient_HealthProbesSystemInfo ensures the health endpoint
// reaches the media-server and reports latency + reachability.
func TestJellyfinClient_HealthProbesSystemInfo(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/System/Info/Public" {
			t.Errorf("expected /System/Info/Public, got %s", r.URL.Path)
		}
		_, _ = w.Write([]byte(`{"ServerName":"KamiTest","Version":"10.11.0"}`))
	}))
	defer srv.Close()

	c := NewJellyfinClient(JellyfinConfig{URL: srv.URL, APIKey: "k", UserID: "u1"})
	info, err := c.Health(context.Background())
	if err != nil {
		t.Fatalf("Health: %v", err)
	}
	if info["ServerName"] != "KamiTest" {
		t.Fatalf("expected ServerName=KamiTest, got %v", info["ServerName"])
	}
	if info["reachable"] != true {
		t.Fatalf("expected reachable=true, got %v", info["reachable"])
	}
}
