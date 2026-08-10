package routes

import (
	"context"
	"errors"
	"net"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/skygenesisenterprise/kami-sama/server/src/config"
	"github.com/skygenesisenterprise/kami-sama/server/src/interfaces"
	"gorm.io/gorm"
)

type databaseStub struct{}

func (databaseStub) Gorm() *gorm.DB                                             { return nil }
func (databaseStub) Ping(context.Context) error                                 { return nil }
func (databaseStub) Close() error                                               { return nil }
func (databaseStub) Transaction(context.Context, func(tx *gorm.DB) error) error { return nil }

type eventBusStub struct{}

func (eventBusStub) Publish(context.Context, interfaces.Event) error { return nil }
func (eventBusStub) Subscribe(context.Context, string, interfaces.EventHandler) error {
	return nil
}
func (eventBusStub) Close() error                  { return nil }
func (eventBusStub) Healthy(context.Context) error { return nil }

type identityProviderStub struct{}

func (identityProviderStub) Authenticate(context.Context, string) (*interfaces.Principal, error) {
	return &interfaces.Principal{UserID: "user-1"}, nil
}
func (identityProviderStub) IssueToken(context.Context, interfaces.Principal) (string, error) {
	return "", nil
}

func TestHealthRoutes(t *testing.T) {
	t.Parallel()

	gin.SetMode(gin.TestMode)
	router := gin.New()
	SetupRoutes(router, Dependencies{
		Config: config.Config{
			App: config.AppConfig{Version: "test"},
		},
		Database:    databaseStub{},
		EventBus:    eventBusStub{},
		RuntimeRole: "api",
	})

	for _, target := range []string{"/health/live", "/health/ready", "/api/v1/health", "/api/v1/ready"} {
		req := httptest.NewRequest(http.MethodGet, target, nil)
		rec := httptest.NewRecorder()

		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("%s returned %d", target, rec.Code)
		}
	}
}

// TestBuildPlexSegmentURL locks the Plex fallback proxy behaviour: the
// segment/variant origins Plex emits in its playlists carry the transcode
// session (and often X-Plex-Token) as a query string. That query must be
// rebuilt as real query params — never baked into the URL path — otherwise
// the upstream Plex receives a mangled URL (%3F in the path) and answers
// 500 on the very first variant, which the player surfaces as a
// levelLoadError after the master parsed fine.
func TestBuildPlexSegmentURL(t *testing.T) {
	manifestURL := "http://plex:32400/video/:/transcode/universal/start?path=%2Flibrary%2Fparts%2F1%2F2%2Ffile.mkv&mediaIndex=0&partIndex=0&protocol=hls&directPlay=0&session=kamisama-abc&X-Plex-Token=secret"

	cases := []struct {
		name            string
		origin          string
		wantPath        string
		wantSession     string
		wantPlatform    string // "" = must be absent, otherwise must equal this value
	}{
		{
			// Ref session deliberately differs from the manifest's so a
			// regression to manifest-query-inheritance fails the assertion.
			name:         "absolute path with query keeps ref session",
			origin:       "/video/:/transcode/universal/0.m3u8?session=ref-session&X-Plex-Platform=Chrome&X-Plex-Token=secret",
			wantPath:     "/video/:/transcode/universal/0.m3u8",
			wantSession:  "ref-session",
			wantPlatform: "Chrome",
		},
		{
			name:         "absolute segment path with token only",
			origin:       "/video/:/transcode/universal/1.ts?session=ref-session&X-Plex-Token=secret",
			wantPath:     "/video/:/transcode/universal/1.ts",
			wantSession:  "ref-session",
			wantPlatform: "",
		},
		{
			name:        "bare filename inherits manifest query",
			origin:      "0.m3u8",
			wantPath:    "/video/:/transcode/universal/0.m3u8",
			wantSession: "kamisama-abc",
		},
		{
			// Exercises strings.Cut on the concatenated base + origin.
			name:         "bare filename with query keeps ref session",
			origin:       "0.m3u8?session=ref-session&X-Plex-Token=secret",
			wantPath:     "/video/:/transcode/universal/0.m3u8",
			wantSession:  "ref-session",
			wantPlatform: "",
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got, err := buildPlexSegmentURL(manifestURL, tc.origin)
			if err != nil {
				t.Fatalf("buildPlexSegmentURL: %v", err)
			}
			u, err := url.Parse(got)
			if err != nil {
				t.Fatalf("parsing produced URL: %v", err)
			}
			if u.Path != tc.wantPath {
				t.Fatalf("expected path %q, got %q (full URL: %s)", tc.wantPath, u.Path, got)
			}
			if strings.Contains(u.Path, "?") || strings.Contains(u.Path, "%3F") {
				t.Fatalf("query string leaked into path: %q", u.Path)
			}
			q := u.Query()
			if q.Get("session") != tc.wantSession {
				t.Fatalf("expected session=%q, got %q", tc.wantSession, q.Get("session"))
			}
			if tc.wantPlatform != "" && q.Get("X-Plex-Platform") != tc.wantPlatform {
				t.Fatalf("expected X-Plex-Platform=%q, got %q", tc.wantPlatform, q.Get("X-Plex-Platform"))
			}
			if q.Get("X-Plex-Token") != "" {
				t.Fatalf("X-Plex-Token must never be forwarded to the browser-facing URL, got %q", q.Get("X-Plex-Token"))
			}
		})
	}
}

// TestIsTransientBridgeError locks the bridge cache-poisoning decision: only
// definitive failures (a stuck .strm item, a Jellyfin API error) may poison
// the stream-key cache, while client cancellations and transport errors (a
// DNS hiccup on *.plex.direct, a connect timeout — anything wrapped in a
// *net.OpError) must NOT, so the idempotent bridge is retried on the next
// request instead of forcing every play down the legacy (400-answering) Plex
// HLS path for the whole TTL.
func TestIsTransientBridgeError(t *testing.T) {
	observedDNSErr := &url.Error{
		Op:  "Get",
		URL: "https://91-179-133-60.9a1b1e23acdd42c8a1af6ef28eb69b44.plex.direct:32400/library/metadata/1085",
		Err: &net.OpError{
			Op:  "dial",
			Err: &net.DNSError{Err: "server misbehaving", Name: "91-179-133-60.9a1b1e23acdd42c8a1af6ef28eb69b44.plex.direct", Server: "127.0.0.11:53"},
		},
	}

	cases := []struct {
		name string
		err  error
		want bool
	}{
		{"nil", nil, false},
		{"canceled request", context.Canceled, true},
		{"deadline exceeded", context.DeadlineExceeded, true},
		{"raw DNS error", &net.DNSError{Err: "server misbehaving", Name: "plex.direct"}, true},
		{"observed docker resolver failure (url.Error wrapping OpError wrapping DNSError)", observedDNSErr, true},
		{"connection refused op error", &net.OpError{Op: "dial", Err: errors.New("connection refused")}, true},
		{"definitive: item never resolved after recovery scan", errors.New("jellyfin: .strm item \"x\" could not be resolved to a remote media source after recovery scan"), false},
		{"definitive: jellyfin api 4xx", errors.New("jellyfin GET /Users/u1/Items: 400: bad"), false},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := isTransientBridgeError(tc.err); got != tc.want {
				t.Fatalf("isTransientBridgeError(%v) = %v, want %v", tc.err, got, tc.want)
			}
		})
	}
}

func TestProtectedRoutesRequireAuthentication(t *testing.T) {
	t.Parallel()

	gin.SetMode(gin.TestMode)
	router := gin.New()
	SetupRoutes(router, Dependencies{
		Config: config.Config{
			App: config.AppConfig{Version: "test"},
		},
		Database:    databaseStub{},
		EventBus:    eventBusStub{},
		RuntimeRole: "api",
	})

	protected := []string{
		"/api/v1/platform/home",
		"/api/v1/platform/wallet",
		"/api/v1/platform/user-info",
		"/api/v1/platform/security",
		"/api/v1/platform/applications",
		"/api/v1/platform/data-privacy",
		"/api/v1/platform/contacts",
		"/api/v1/platform/family",
		"/api/v1/platform/storage",
		"/api/v1/platform/settings",
		"/api/v1/workspaces",
	}

	for _, target := range protected {
		req := httptest.NewRequest(http.MethodGet, target, nil)
		rec := httptest.NewRecorder()

		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusUnauthorized {
			t.Fatalf("%s expected 401, got %d", target, rec.Code)
		}
	}
}
