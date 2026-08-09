package services

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func identityHandler(status int) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/identity" {
			w.WriteHeader(http.StatusNotFound)
			return
		}
		if got := r.Header.Get("X-Plex-Token"); got != "fake-token" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		if status != http.StatusOK {
			w.WriteHeader(status)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"MediaContainer": map[string]any{
				"machineIdentifier": "server-1",
				"version":           "1.43.3",
			},
		})
	}
}

func TestReachablePlexConnectionURL_PrefersPublicReachable(t *testing.T) {
	// The public (non-local) connection answers; the local one is dead
	// (HTTP 500). The backend must pick the reachable public URL.
	public := httptest.NewServer(identityHandler(http.StatusOK))
	defer public.Close()
	dead := httptest.NewServer(identityHandler(http.StatusInternalServerError))
	defer dead.Close()

	server := &PlexServerResource{
		ClientIdentifier: "server-1",
		Connections: []PlexConnection{
			{URI: dead.URL, Protocol: "https", Local: true, Relay: false},
			{URI: public.URL, Protocol: "https", Local: false, Relay: false},
		},
	}
	got := ReachablePlexConnectionURL(context.Background(), server, "fake-token")
	if got != public.URL {
		t.Fatalf("expected reachable public URL %q, got %q", public.URL, got)
	}
}

func TestReachablePlexConnectionURL_FallsBackWhenNoneReachable(t *testing.T) {
	// Both connections are dead: the probe should fall back to the local
	// best-effort URL (BestConnectionURL behavior).
	dead := httptest.NewServer(identityHandler(http.StatusServiceUnavailable))
	defer dead.Close()

	server := &PlexServerResource{
		Connections: []PlexConnection{
			{URI: dead.URL, Protocol: "https", Local: true, Relay: false},
			{URI: dead.URL, Protocol: "https", Local: false, Relay: false},
		},
	}
	got := ReachablePlexConnectionURL(context.Background(), server, "fake-token")
	// BestConnectionURL prefers local: the first local connection wins.
	if got != dead.URL {
		t.Fatalf("expected fallback URL %q, got %q", dead.URL, got)
	}
}

func TestReachablePlexConnectionURL_NilServer(t *testing.T) {
	if got := ReachablePlexConnectionURL(context.Background(), nil, "fake-token"); got != "" {
		t.Fatalf("expected empty URL for nil server, got %q", got)
	}
}

func TestConnectionPriority(t *testing.T) {
	priority := func(local, relay bool) int {
		return connectionPriority(PlexConnection{Local: local, Relay: relay})
	}
	if priority(false, false) != 0 {
		t.Fatal("expected public non-relay to be first priority")
	}
	if priority(true, false) != 1 {
		t.Fatal("expected local non-relay to be second priority")
	}
	if priority(false, true) != 2 {
		t.Fatal("expected relay to be third priority")
	}
	if priority(true, true) != 2 {
		t.Fatal("expected local relay to be third priority like any relay")
	}
}
