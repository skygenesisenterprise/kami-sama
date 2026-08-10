package routes

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/skygenesisenterprise/kami-sama/server/src/services"
)

// TestGinSegmentParamExtraction documents what the ProxyStream handler
// actually receives on its /segment/*subpath route for the two request
// shapes a browser-level proxy can produce:
//
//   - Shape A (nginx / direct): the manifest rewriter's encoded origin rides
//     intact in the path
//     (`…/segment/Videos%2Fitem-123%2Fmaster.m3u8%3FDeviceId%3Ddev-1`), so the
//     query lives INSIDE the subpath and the request query is empty.
//   - Shape B (Next.js dev rewrites): an intermediate proxy decodes the path
//     before forwarding, which splits the origin's query out of the path and
//     into the request's real query string
//     (`…/segment/Videos/item-123/master.m3u8?DeviceId=dev-1`).
//
// Shape B is exactly what the watch page hits under `pnpm dev`: Next.js
// rewrites `/api/:path*` to the Go worker and decodes the path on the way.
// Without the mergeSegmentQuery re-attachment the transcode session + codec
// params (DeviceId, MediaSourceId, VideoCodec) are dropped and Jellyfin
// starts a fresh session with default codecs — the hls.js levelLoadTimeOut +
// bufferAppendingError reported on the watch page.
func TestGinSegmentParamExtraction(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.GET("/api/v1/discover/item/:slug/stream/proxy/segment/*subpath", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"slug":     c.Param("slug"),
			"subpath":  c.Param("subpath"),
			"rawQuery": c.Request.URL.RawQuery,
		})
	})

	cases := []struct {
		name        string
		target      string
		wantSubpath string
		wantQuery   string
	}{
		{
			// Shape A: encoding intact — nginx ($request_uri) or a direct
			// browser request. The query is inside the subpath; net/http has
			// already decoded the percent-escapes, so the handler must NOT
			// unescape again (a second unescape would corrupt `%XX` origins).
			name:        "shape A: encoded path keeps query inside subpath",
			target:      "http://localhost/api/v1/discover/item/csman/stream/proxy/segment/Videos%2Fitem-123%2Fmaster.m3u8%3FDeviceId%3Ddev-1%26MediaSourceId%3Dms-9%26VideoCodec%3Dh264",
			wantSubpath: "/Videos/item-123/master.m3u8?DeviceId=dev-1&MediaSourceId=ms-9&VideoCodec=h264",
			wantQuery:   "",
		},
		{
			// Shape B: a proxy decoded the path and split the query out.
			// The handler re-attaches it via mergeSegmentQuery.
			name:        "shape B: decoded path pushes query into rawQuery",
			target:      "http://localhost/api/v1/discover/item/csman/stream/proxy/segment/Videos/item-123/master.m3u8?DeviceId=dev-1&MediaSourceId=ms-9&VideoCodec=h264",
			wantSubpath: "/Videos/item-123/master.m3u8",
			wantQuery:   "DeviceId=dev-1&MediaSourceId=ms-9&VideoCodec=h264",
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, tc.target, nil)
			rec := httptest.NewRecorder()
			r.ServeHTTP(rec, req)

			var got struct {
				Slug     string `json:"slug"`
				Subpath  string `json:"subpath"`
				RawQuery string `json:"rawQuery"`
			}
			if err := json.NewDecoder(rec.Body).Decode(&got); err != nil {
				t.Fatalf("decoding response: %v", err)
			}
			if got.Slug != "csman" {
				t.Fatalf("expected slug csman, got %q", got.Slug)
			}
			if got.Subpath != tc.wantSubpath {
				t.Fatalf("subpath mismatch:\n  got:  %q\n  want: %q", got.Subpath, tc.wantSubpath)
			}
			if got.RawQuery != tc.wantQuery {
				t.Fatalf("rawQuery mismatch:\n  got:  %q\n  want: %q", got.RawQuery, tc.wantQuery)
			}
		})
	}
}

// TestMergeSegmentQuery locks the query re-attachment used by ProxyStream for
// the Shape B transport: the proxy's own episodeId param is never merged into
// the origin, and a reference that already carries its query wins.
func TestMergeSegmentQuery(t *testing.T) {
	cases := []struct {
		name      string
		ref       string
		rawQuery  string
		want      string
	}{
		{"no query on request", "Videos/1/master.m3u8", "", "Videos/1/master.m3u8"},
		{"only the proxy's own episodeId", "Videos/1/master.m3u8", "episodeId=ep-77", "Videos/1/master.m3u8"},
		{"split-out origin query re-attached", "Videos/1/master.m3u8", "DeviceId=dev-1&MediaSourceId=ms-9&api_key=secret", "Videos/1/master.m3u8?DeviceId=dev-1&MediaSourceId=ms-9&api_key=secret"},
		{"episodeId excluded from the merge", "Videos/1/master.m3u8", "episodeId=ep-77&DeviceId=dev-1", "Videos/1/master.m3u8?DeviceId=dev-1"},
		{"ref already carrying query wins", "Videos/1/master.m3u8?DeviceId=dev-1", "DeviceId=other", "Videos/1/master.m3u8?DeviceId=dev-1"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := mergeSegmentQuery(tc.ref, tc.rawQuery); got != tc.want {
				t.Fatalf("mergeSegmentQuery(%q, %q) = %q, want %q", tc.ref, tc.rawQuery, got, tc.want)
			}
		})
	}
}

// realisticJellyfinMaster mirrors the master playlist Jellyfin serves for a
// transcode session: an audio-group URI + a single video variant, both
// carrying the transcode session / codec params as a query string. These
// params MUST survive the rewrite → proxy → BuildSegmentURL trip or the
// browser ends up with a fresh default-codec session.
const realisticJellyfinMaster = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-INDEPENDENT-SEGMENTS
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",NAME="Français",DEFAULT=YES,AUTOSELECT=YES,LANGUAGE="fra",URI="/Videos/1a2b3c/master.m3u8?DeviceId=kamisama-server&MediaSourceId=ms-9&AudioCodec=aac&AudioStreamIndex=1&api_key=secret"
#EXT-X-STREAM-INF:BANDWIDTH=3000000,AVERAGE-BANDWIDTH=2800000,CODECS="avc1.4d401f,mp4a.40.2",RESOLUTION=1920x1080,FRAME-RATE=23.976,AUDIO="audio"
/Videos/1a2b3c/master.m3u8?DeviceId=kamisama-server&MediaSourceId=ms-9&VideoCodec=h264&AudioCodec=aac&AudioStreamIndex=1&api_key=secret
`

const expectedVariantUpstream = "http://media-server:8096/Videos/1a2b3c/master.m3u8?" +
	"AudioCodec=aac&AudioStreamIndex=1&DeviceId=kamisama-server&MediaSourceId=ms-9&VideoCodec=h264&api_key=ours"

// extractVariantLine pulls the first plain (non-#) URL line out of a
// rewritten manifest — that is the level hls.js requests after parsing.
func extractVariantLine(t *testing.T, manifest string) string {
	t.Helper()
	for _, line := range strings.Split(manifest, "\n") {
		trimmed := strings.TrimSpace(line)
		if trimmed != "" && !strings.HasPrefix(trimmed, "#") {
			return trimmed
		}
	}
	t.Fatal("no variant URL line found in rewritten manifest")
	return ""
}

// TestMergeSessionParams locks the session-pinning behaviour: the master's
// query params (DeviceId / MediaSourceId / forced codecs) are injected into
// variant/segment references that omitted them, while params the reference
// already carries win and api_key is never injected (BuildSegmentURL adds
// ours).
func TestMergeSessionParams(t *testing.T) {
	session := url.Values{
		"DeviceId":                    {"kamisama-server"},
		"MediaSourceId":               {"ms-9"},
		"VideoCodec":                  {"h264"},
		"AudioCodec":                  {"aac"},
		"TranscodingMaxAudioChannels": {"2"},
		"api_key":                     {"secret"},
	}
	cases := []struct {
		name    string
		ref     string
		session url.Values
		want    string
	}{
		{
			name:    "bare segment gets the full session",
			ref:     "../Videos/item-123/0000000.ts",
			session: session,
			want:    "../Videos/item-123/0000000.ts?AudioCodec=aac&DeviceId=kamisama-server&MediaSourceId=ms-9&TranscodingMaxAudioChannels=2&VideoCodec=h264",
		},
		{
			name:    "reference params win, api_key not injected",
			ref:     "../Videos/item-123/0000001.ts?DeviceId=dev-1&api_key=theirs",
			session: session,
			want:    "../Videos/item-123/0000001.ts?AudioCodec=aac&DeviceId=dev-1&MediaSourceId=ms-9&TranscodingMaxAudioChannels=2&VideoCodec=h264&api_key=theirs",
		},
		{
			name:    "empty session is a no-op",
			ref:     "../Videos/item-123/0000002.ts?DeviceId=dev-1",
			session: url.Values{},
			want:    "../Videos/item-123/0000002.ts?DeviceId=dev-1",
		},
		{
			name:    "no query on the reference gets a full session",
			ref:     "Videos/item-123/master.m3u8",
			session: session,
			want:    "Videos/item-123/master.m3u8?AudioCodec=aac&DeviceId=kamisama-server&MediaSourceId=ms-9&TranscodingMaxAudioChannels=2&VideoCodec=h264",
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := mergeSessionParams(tc.ref, tc.session); got != tc.want {
				t.Fatalf("mergeSessionParams(%q) = %q, want %q", tc.ref, got, tc.want)
			}
		})
	}
}

// TestEscapeOriginSegment locks the origin encoding used in rewritten URLs:
// everything outside the RFC 3986 unreserved set must be percent-escaped —
// sub-delims (`&`, `=`, `+`, `:`) included, unlike url.PathEscape — and a
// single path decode must restore the origin exactly.
func TestEscapeOriginSegment(t *testing.T) {
	cases := []struct {
		in   string
		want string
	}{
		{"simple.ts", "simple.ts"},
		{"live.m3u8?AudioCodec=aac&DeviceId=kamisama-server", "live.m3u8%3FAudioCodec%3Daac%26DeviceId%3Dkamisama-server"},
		{"hls/af901ec37d726d3e99e3e7bc29b45578/af901ec37d726d3e99e3e7bc29b455780.ts", "hls%2Faf901ec37d726d3e99e3e7bc29b45578%2Faf901ec37d726d3e99e3e7bc29b455780.ts"},
		{"a+b c%d", "a%2Bb%20c%25d"},
	}
	for _, tc := range cases {
		if got := escapeOriginSegment(tc.in); got != tc.want {
			t.Fatalf("escapeOriginSegment(%q) = %q, want %q", tc.in, got, tc.want)
		}
		// A single path-unescape must restore the origin byte-for-byte.
		if decoded, err := url.PathUnescape(tc.want); err != nil || decoded != tc.in {
			t.Fatalf("round trip of %q failed: %q (err=%v)", tc.in, decoded, err)
		}
	}
}

// TestRewriteMediaPlaylist locks the VARIANT / media playlist rewriting: the
// segment URL lines (#EXT-X-MAP init + .ts/.m4s refs) must also become
// same-origin proxy URLs. Leaving a media playlist untouched makes hls.js
// resolve its segments against the proxy URL — 404, CORS failure or
// non-segment data, which the player sees as bufferAppendingError.
func TestRewriteMediaPlaylist(t *testing.T) {
	media := `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:6
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:VOD
#EXT-X-MAP:URI="/Videos/item-123/init.mp4?DeviceId=kamisama-server&api_key=secret"
#EXTINF:6.006,
../Videos/item-123/0000000.ts?DeviceId=kamisama-server&api_key=secret
#EXTINF:6.006,
../Videos/item-123/0000001.ts?DeviceId=kamisama-server&api_key=secret
#EXT-X-ENDLIST
`
	rewritten := rewriteStreamManifest(media, "http://localhost", "csman", "ep-77", true)

	if strings.Contains(rewritten, "http://media-server") || strings.Contains(rewritten, "/Videos/") {
		t.Fatalf("media playlist still contains upstream references:\n%s", rewritten)
	}
	if strings.Count(rewritten, "/api/v1/discover/item/csman/stream/proxy/segment/") != 3 {
		t.Fatalf("expected 3 rewritten proxy URLs (init + 2 segments), got:\n%s", rewritten)
	}
	if !strings.Contains(rewritten, "?episodeId=ep-77") {
		t.Fatalf("episodeId missing from rewritten media playlist:\n%s", rewritten)
	}
}

// TestIsPlaylistContentType locks which upstream Content-Types trigger
// playlist rewriting (master + media playlists) vs plain streaming (segments).
func TestIsPlaylistContentType(t *testing.T) {
	cases := map[string]bool{
		"application/vnd.apple.mpegurl":            true,
		"application/x-mpegURL":                    true,
		"application/vnd.apple.mpegurl; charset=utf-8": true,
		"video/mp2t":                               false,
		"video/mp4":                                false,
		"application/octet-stream":                 false,
		"text/plain":                               false,
	}
	for ct, want := range cases {
		if got := isPlaylistContentType(ct); got != want {
			t.Fatalf("isPlaylistContentType(%q) = %v, want %v", ct, got, want)
		}
	}
}

// TestStreamKeyCacheSetSessionQuery ensures the cache round-trips the master
// session query so segment requests can pin themselves to the same transcode
// session.
func TestStreamKeyCacheSetSessionQuery(t *testing.T) {
	sc := newStreamKeyCache(5 * time.Minute)
	key := "slug\x00ep-1"
	sc.set(key, "item-123", "jellyfin", true, nil)

	sc.setSessionQuery(key, url.Values{"VideoCodec": {"h264"}, "api_key": {"secret"}})
	ent, ok := sc.get(key)
	if !ok {
		t.Fatal("expected cache entry")
	}
	if got := ent.sessionQuery.Get("VideoCodec"); got != "h264" {
		t.Fatalf("expected VideoCodec=h264 in session query, got %q", got)
	}

	// Unknown key must not panic and must not create an entry.
	sc.setSessionQuery("nope\x00", url.Values{"VideoCodec": {"h264"}})
	if _, ok := sc.get("nope\x00"); ok {
		t.Fatal("setSessionQuery must not create entries")
	}
}

// TestRewriteStreamManifestRoundTrip drives the full chain hls.js experiences:
// rewriteStreamManifest produces the browser-facing segment URL, gin extracts
// the subpath (both transport shapes), the handler decodes it, and
// BuildSegmentURL reconstructs the upstream Jellyfin URL. The session + codec
// params must survive byte-for-byte, and the proxy's own api_key must replace
// the upstream one.
func TestRewriteStreamManifestRoundTrip(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.GET("/api/v1/discover/item/:slug/stream/proxy/segment/*subpath", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"subpath":  c.Param("subpath"),
			"rawQuery": c.Request.URL.RawQuery,
		})
	})

	jf := services.NewJellyfinClient(services.JellyfinConfig{
		URL:    "http://media-server:8096",
		APIKey: "ours",
		UserID: "u1",
	})

	// Rewrite the master exactly as the proxy does for the /watch page.
	rewritten := rewriteStreamManifest(realisticJellyfinMaster, "http://localhost", "csman", "", true)
	variantURL := extractVariantLine(t, rewritten)

	// Sanity: the rewritten URL is same-origin and carries the encoded origin.
	u, err := url.Parse(variantURL)
	if err != nil {
		t.Fatalf("parsing rewritten variant URL %q: %v", variantURL, err)
	}
	if !strings.Contains(u.Path, "/api/v1/discover/item/csman/stream/proxy/segment/") {
		t.Fatalf("expected same-origin proxy segment URL, got %q", variantURL)
	}

	// Both transport shapes must reconstruct the SAME upstream URL.
	shapes := []struct {
		name   string
		target string
	}{
		{
			// Shape A: the browser sends the encoded path verbatim.
			name:   "shape A: encoded path (nginx / direct)",
			target: variantURL,
		},
		{
			// Shape B: an intermediate proxy (Next.js dev rewrites) decoded
			// the path and split the origin's query into the real query.
			name: "shape B: decoded path + split query",
			target: "http://localhost/api/v1/discover/item/csman/stream/proxy/segment/Videos/1a2b3c/master.m3u8?" +
				"DeviceId=kamisama-server&MediaSourceId=ms-9&VideoCodec=h264&AudioCodec=aac&AudioStreamIndex=1&api_key=secret",
		},
	}

	for _, shape := range shapes {
		t.Run(shape.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, shape.target, nil)
			rec := httptest.NewRecorder()
			r.ServeHTTP(rec, req)

			var got struct {
				Subpath  string `json:"subpath"`
				RawQuery string `json:"rawQuery"`
			}
			if err := json.NewDecoder(rec.Body).Decode(&got); err != nil {
				t.Fatalf("decoding response: %v", err)
			}
			// Exercise the REAL handler decode path (decodeSegmentRef), not a
			// re-implementation — so a regression that stops ProxyStream from
			// calling mergeSegmentQuery would fail this test.
			ref := decodeSegmentRef(got.Subpath, got.RawQuery)
			upstream, err := jf.BuildSegmentURL("1a2b3c", ref)
			if err != nil {
				t.Fatalf("BuildSegmentURL(%q): %v", ref, err)
			}
			if upstream != expectedVariantUpstream {
				t.Fatalf("upstream URL mismatch:\n  got:  %s\n  want: %s\n  ref:  %q", upstream, expectedVariantUpstream, ref)
			}
		})
	}
}

// TestRewriteStreamManifestCarriesEpisodeID ensures the proxy's own episodeId
// rides as a real query param on rewritten URLs (so series segment requests
// re-resolve the same stream key as the manifest), never inside the encoded
// origin where it would corrupt the upstream reference.
func TestRewriteStreamManifestCarriesEpisodeID(t *testing.T) {
	rewritten := rewriteStreamManifest(realisticJellyfinMaster, "http://localhost", "csman", "ep-77", true)
	variantURL := extractVariantLine(t, rewritten)

	u, err := url.Parse(variantURL)
	if err != nil {
		t.Fatalf("parsing rewritten variant URL %q: %v", variantURL, err)
	}
	if u.Query().Get("episodeId") != "ep-77" {
		t.Fatalf("expected episodeId=ep-77 query on rewritten URL, got %q", u.RawQuery)
	}
	// The decoded origin must NOT contain an episodeId parameter.
	raw := strings.TrimPrefix(u.Path, "/api/v1/discover/item/csman/stream/proxy/segment/")
	decoded, derr := url.PathUnescape(raw)
	if derr != nil {
		t.Fatalf("decoding origin %q: %v", raw, derr)
	}
	if strings.Contains(decoded, "episodeId") {
		t.Fatalf("episodeId leaked into the encoded origin: %q", decoded)
	}
}

// TestInjectStreamCodecs locks the CODECS declaration the proxy adds to
// #EXT-X-STREAM-INF lines that omit it. Jellyfin never emits CODECS in its
// master playlists; without it hls.js guesses the SourceBuffer codec (H.264
// Baseline avc1.42E01E) while the transcode actually emits High profile, and
// Chromium's MSE rejects every append (bufferAppendingError). The proxy
// forces VideoCodec=h264&AudioCodec=aac upstream, so declaring High up to
// level 5.1 + AAC-LC matches the real output (declared level >= stream level
// is always valid for MSE).
func TestInjectStreamCodecs(t *testing.T) {
	cases := []struct {
		name string
		in   string
		want string
	}{
		{
			name: "no CODECS gets injected",
			in:   "#EXT-X-STREAM-INF:BANDWIDTH=0,AVERAGE-BANDWIDTH=0",
			want: `#EXT-X-STREAM-INF:BANDWIDTH=0,AVERAGE-BANDWIDTH=0,CODECS="avc1.640033,mp4a.40.2"`,
		},
		{
			name: "existing CODECS untouched",
			in:   `#EXT-X-STREAM-INF:BANDWIDTH=3000000,CODECS="avc1.4d401f,mp4a.40.2",RESOLUTION=1920x1080`,
			want: `#EXT-X-STREAM-INF:BANDWIDTH=3000000,CODECS="avc1.4d401f,mp4a.40.2",RESOLUTION=1920x1080`,
		},
		{
			name: "CRLF line ending preserved",
			in:   "#EXT-X-STREAM-INF:BANDWIDTH=0\r",
			want: `#EXT-X-STREAM-INF:BANDWIDTH=0,CODECS="avc1.640033,mp4a.40.2"` + "\r",
		},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := injectStreamCodecs(tc.in); got != tc.want {
				t.Fatalf("injectStreamCodecs(%q) = %q, want %q", tc.in, got, tc.want)
			}
		})
	}
}

// TestRewriteStreamManifestInjectsCodecs ensures the master rewrite adds the
// CODECS declaration to a bare Jellyfin master (the exact shape served on the
// watch page) so hls.js sizes the SourceBuffer to the real h264 High output —
// and that the legacy Plex fallback path (declareCodecs=false) is left
// untouched because its output profile is not under our control.
func TestRewriteStreamManifestInjectsCodecs(t *testing.T) {
	master := "#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=0,AVERAGE-BANDWIDTH=0\n" +
		"/Videos/1a2b3c/master.m3u8?DeviceId=kamisama-server&MediaSourceId=ms-9&VideoCodec=h264&AudioCodec=aac&api_key=secret\n"

	rewritten := rewriteStreamManifest(master, "http://localhost", "csman", "", true)
	if !strings.Contains(rewritten, `CODECS="avc1.640033,mp4a.40.2"`) {
		t.Fatalf("CODECS not injected into Jellyfin master:\n%s", rewritten)
	}

	rewrittenPlex := rewriteStreamManifest(master, "http://localhost", "csman", "", false)
	if strings.Contains(rewrittenPlex, "CODECS=") {
		t.Fatalf("CODECS must NOT be injected on the Plex fallback path:\n%s", rewrittenPlex)
	}
}
// TestRewriteFmp4SegmentReference locks .hls (fMP4) segment rewriting — the
// segment shape of Jellyfin's SegmentContainer=hls transcode that the
// PlaybackInfo negotiation produces. Variant playlists carry
// `hls1/main/NNNN.hls?<session>` lines that MUST become same-origin proxy
// URLs exactly like any .ts segment, otherwise hls.js resolves them against
// the proxy URL and playback dies with bufferAppendingError.
func TestRewriteFmp4SegmentReference(t *testing.T) {
	media := `#EXTM3U
#EXT-X-TARGETDURATION:3
#EXT-X-MEDIA-SEQUENCE:0
#EXTINF:3.003,
hls1/main/0.hls?DeviceId=kamisama-server&MediaSourceId=ms-9&api_key=secret
#EXTINF:3.003,
hls1/main/1.hls?DeviceId=kamisama-server&MediaSourceId=ms-9&api_key=secret
#EXT-X-ENDLIST
`
	rewritten := rewriteStreamManifest(media, "http://localhost", "csman", "ep-77", true)
	if strings.Contains(rewritten, "hls1/main/0.hls") {
		t.Fatalf("fMP4 segment not rewritten:\n%s", rewritten)
	}
	if strings.Count(rewritten, "/api/v1/discover/item/csman/stream/proxy/segment/") != 2 {
		t.Fatalf("expected 2 rewritten fMP4 segment URLs, got:\n%s", rewritten)
	}
	if !strings.Contains(rewritten, "episodeId=ep-77") {
		t.Fatalf("episodeId missing from rewritten media playlist:\n%s", rewritten)
	}
}
