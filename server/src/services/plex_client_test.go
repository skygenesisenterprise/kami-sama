package services

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
)

func plexTestServer(t *testing.T, handler http.HandlerFunc) (*httptest.Server, *PlexClient) {
	t.Helper()
	srv := httptest.NewServer(handler)
	t.Cleanup(srv.Close)
	client := NewPlexClient(PlexConfig{
		URL:              srv.URL,
		Token:            "fake-token",
		ClientIdentifier: "test-client",
		Timeout:          5 * time.Second,
	})
	return srv, client
}

func TestPlexClient_DoRequest_MediaContainer(t *testing.T) {
	_, client := plexTestServer(t, func(w http.ResponseWriter, r *http.Request) {
		if got := r.Header.Get("X-Plex-Token"); got != "fake-token" {
			t.Fatalf("expected X-Plex-Token=fake-token, got %q", got)
		}
		if got := r.Header.Get("Accept"); got != "application/json" {
			t.Fatalf("expected Accept=application/json, got %q", got)
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"MediaContainer": map[string]any{
				"size":        2,
				"totalSize":   2,
				"Directory":   []map[string]any{{"key": "1", "title": "Anime", "type": "show"}},
				"Metadata":    []map[string]any{{"ratingKey": "100", "title": "Cowboy Bebop"}},
			},
		})
	})

	mc, err := client.doRequest(context.Background(), http.MethodGet, "/library/sections", nil)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if mc.Size != 2 || mc.TotalSize != 2 {
		t.Fatalf("unexpected size/totalSize: %d/%d", mc.Size, mc.TotalSize)
	}
	if len(mc.Directory) != 1 || mc.Directory[0]["title"] != "Anime" {
		t.Fatalf("Directory unexpectedly empty: %+v", mc.Directory)
	}
	if len(mc.Metadata) != 1 || mc.Metadata[0]["title"] != "Cowboy Bebop" {
		t.Fatalf("Metadata unexpectedly empty: %+v", mc.Metadata)
	}
}

func TestPlexClient_DoRequest_401MapsToInvalidToken(t *testing.T) {
	_, client := plexTestServer(t, func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusUnauthorized)
	})
	_, err := client.doRequest(context.Background(), http.MethodGet, "/", nil)
	if err == nil {
		t.Fatal("expected error on 401")
	}
	appErr, ok := err.(*utils.AppError)
	if !ok {
		t.Fatalf("expected *utils.AppError, got %T (%v)", err, err)
	}
	if appErr.Code != "PLEX_INVALID_TOKEN" {
		t.Fatalf("expected PLEX_INVALID_TOKEN code, got %q", appErr.Code)
	}
	if appErr.Status != http.StatusUnauthorized {
		t.Fatalf("expected status 401, got %d", appErr.Status)
	}
}

func TestPlexClient_DoRequest_404MapsToNotFound(t *testing.T) {
	_, client := plexTestServer(t, func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotFound)
	})
	_, err := client.doRequest(context.Background(), http.MethodGet, "/library/metadata/missing", nil)
	if err == nil {
		t.Fatal("expected error on 404")
	}
	appErr, ok := err.(*utils.AppError)
	if !ok {
		t.Fatalf("expected *utils.AppError, got %T (%v)", err, err)
	}
	if appErr.Code != "PLEX_NOT_FOUND" {
		t.Fatalf("expected PLEX_NOT_FOUND code, got %q", appErr.Code)
	}
}

func TestStreamKindMatches_NumericAndString(t *testing.T) {
	if !streamKindMatches(map[string]any{"streamType": float64(1)}, "video") {
		t.Fatal("expected numeric 1 to match video")
	}
	if !streamKindMatches(map[string]any{"streamType": float64(2)}, "audio") {
		t.Fatal("expected numeric 2 to match audio")
	}
	if !streamKindMatches(map[string]any{"streamType": "Video"}, "video") {
		t.Fatal("expected string Video to match video")
	}
	if !streamKindMatches(map[string]any{"streamType": "subtitle"}, "subtitle") {
		t.Fatal("expected lower subtitle string to match")
	}
	if streamKindMatches(map[string]any{"streamType": float64(1)}, "audio") {
		t.Fatal("expected numeric 1 to NOT match audio")
	}
}

func TestPlexClient_Disabled(t *testing.T) {
	client := NewPlexClient(PlexConfig{URL: "", Token: ""})
	if client.Enabled() {
		t.Fatal("expected disabled client")
	}
	if _, err := client.doRequest(context.Background(), http.MethodGet, "/", nil); err == nil {
		t.Fatal("expected error when disabled")
	}
}

func TestMapPlexItem_Comprehensive(t *testing.T) {
	item := map[string]any{
		"ratingKey":         123.0,
		"key":               "/library/metadata/123",
		"parentRatingKey":   12.0,
		"grandparentRatingKey": 1.0,
		"title":             "Cowboy Bebop",
		"originalTitle":     "カウボーイビバップ",
		"type":              "show",
		"year":              1998.0,
		"rating":            8.7,
		"summary":           "Bounty hunters in space",
		"duration":          65000.0,
		"Genre": []any{
			map[string]any{"tag": "Action"},
			map[string]any{"tag": "Sci-Fi"},
		},
		"thumb": "/library/metadata/123/thumb",
		"art":   "/library/metadata/123/art",
		"Media": []any{
			map[string]any{
				"container": "mkv",
				"bitrate":   5000.0,
				"Part": []any{
					map[string]any{"key": "/library/parts/1"},
				},
				"MediaStreams": []any{
					map[string]any{"streamType": "Video", "codec": "h264", "width": 1920.0, "height": 1080.0},
					map[string]any{"streamType": "Audio", "codec": "ac3"},
					map[string]any{"streamType": "Subtitle", "codec": "srt", "language": "fr"},
				},
			},
		},
	}
	mapped := mapPlexItem(item)
	if mapped["id"] != "123" {
		t.Fatalf("expected id=123 got %v", mapped["id"])
	}
	if mapped["type"] != "Series" {
		t.Fatalf("expected type=Series got %v", mapped["type"])
	}
	if mapped["container"] != "mkv" {
		t.Fatalf("expected container=mkv got %v", mapped["container"])
	}
	if mapped["videoCodec"] != "h264" {
		t.Fatalf("expected videoCodec=h264 got %v", mapped["videoCodec"])
	}
	if mapped["audioCodec"] != "ac3" {
		t.Fatalf("expected audioCodec=ac3 got %v", mapped["audioCodec"])
	}
	if mapped["duration"] != 65.0 {
		t.Fatalf("expected duration=65 got %v", mapped["duration"])
	}
	genres, ok := mapped["genres"].([]string)
	if !ok || len(genres) != 2 {
		t.Fatalf("expected 2 genres, got %v", mapped["genres"])
	}
}


