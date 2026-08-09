package services

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
)

// PlexClientIdentifier is the stable X-Plex-Client-Identifier used for the
// plex.tv OAuth (PIN) flow and resource discovery. It must be identical
// between pin creation, polling, and the authorization URL so plex.tv can
// correlate the whole flow.
const PlexClientIdentifier = "kamisama-web"

// The following metadata is sent on every plex.tv request AND echoed into the
// authorization URL. plex.tv correlates an auth code against the product it
// was registered with, so a mismatch here is a common cause of Plex rejecting
// the request ("Impossible de répondre à la demande").
const (
	plexProduct  = "Kami-Sama"
	plexVersion  = "1.0.0"
	plexPlatform = "Web"
	plexDevice   = "Server"
)

// plexAuthTTL bounds how long an unfinished sign-in is kept in memory.
const plexAuthTTL = 15 * time.Minute

// plexPinEnvelope is the subset of plex.tv/api/v2/pins we need to drive the
// sign-in flow. authToken is empty until the user authorizes the code. plex.tv
// emits the pin id as a number, so it is decoded as json.Number.
type plexPinEnvelope struct {
	ID        json.Number `json:"id"`
	Code      string      `json:"code"`
	AuthToken string      `json:"authToken"`
	ExpiresAt string      `json:"expiresAt"`
}

// PlexAuthSession tracks an in-progress sign-in on the server so the account
// token never has to round-trip through the browser.
type PlexAuthSession struct {
	PinID     string
	AuthToken string
	CreatedAt time.Time
}

var (
	plexAuthMu    sync.Mutex
	plexAuthStore = map[string]*PlexAuthSession{}
)

func getPlexAuthSession(pinID string) *PlexAuthSession {
	plexAuthMu.Lock()
	defer plexAuthMu.Unlock()
	s := plexAuthStore[pinID]
	if s == nil {
		return nil
	}
	if time.Since(s.CreatedAt) > plexAuthTTL {
		delete(plexAuthStore, pinID)
		return nil
	}
	return s
}

func claimPlexAuthSession(pinID string) *PlexAuthSession {
	plexAuthMu.Lock()
	defer plexAuthMu.Unlock()
	s := plexAuthStore[pinID]
	if s == nil {
		return nil
	}
	delete(plexAuthStore, pinID)
	return s
}

// PlexAuthPin is the sign-in response handed to the UI: the code the user must
// authorize and the URL to open in their browser.
type PlexAuthPin struct {
	PinID     string `json:"pinId"`
	Code      string `json:"code"`
	AuthURL   string `json:"authUrl"`
	ExpiresAt string `json:"expiresAt"`
}

// CreatePlexAuthPin starts the plex.tv OAuth flow. It returns a PIN code and
// the authorization URL the user must open while signed in to their Plex
// account. The flow is finalized by polling GetPlexAuthStatus, which stores
// the resulting account token server-side.
func CreatePlexAuthPin(ctx context.Context) (*PlexAuthPin, error) {
	body, err := plexAuthRequest(ctx, http.MethodPost, "https://plex.tv/api/v2/pins?strong=true", nil)
	if err != nil {
		return nil, err
	}
	var pin plexPinEnvelope
	if err := json.Unmarshal(body, &pin); err != nil {
		return nil, utils.NewError(http.StatusInternalServerError, "PLEX_DECODE_FAILED", "Failed to decode plex.tv pin response: "+err.Error(), nil)
	}
	if pin.ID.String() == "" || pin.Code == "" {
		return nil, utils.NewError(http.StatusInternalServerError, "PLEX_INVALID_PAYLOAD", "plex.tv pin response was missing the pin id or code.", nil)
	}
	plexAuthMu.Lock()
	plexAuthStore[pin.ID.String()] = &PlexAuthSession{PinID: pin.ID.String(), CreatedAt: time.Now()}
	plexAuthMu.Unlock()
	return &PlexAuthPin{
		PinID:     pin.ID.String(),
		Code:      pin.Code,
		AuthURL:   buildPlexAuthURL(pin.Code),
		ExpiresAt: pin.ExpiresAt,
	}, nil
}

// buildPlexAuthURL builds the app.plex.tv authorization URL. The product,
// version and platform must match what was sent in the pin request headers.
func buildPlexAuthURL(code string) string {
	params := url.Values{}
	params.Set("clientID", PlexClientIdentifier)
	params.Set("code", code)
	params.Set("context[device][product]", plexProduct)
	params.Set("context[device][version]", plexVersion)
	params.Set("context[device][platform]", plexPlatform)
	return "https://app.plex.tv/auth#?" + params.Encode()
}

// PlexAuthStatus is the polled state of a sign-in attempt. Authenticated is
// true once the user authorized the code. The account token is intentionally
// not part of this struct so it can never be serialized back to the browser.
type PlexAuthStatus struct {
	Authenticated bool   `json:"authenticated"`
	ExpiresAt     string `json:"expiresAt,omitempty"`
}

// GetPlexAuthStatus polls a previously created PIN. Once the user authorizes
// the code on app.plex.tv, the account token is stored on the server-side
// session and the returned status flips to authenticated.
func GetPlexAuthStatus(ctx context.Context, pinID string) (*PlexAuthStatus, error) {
	if strings.TrimSpace(pinID) == "" {
		return nil, utils.NewError(http.StatusBadRequest, "PLEX_AUTH_FAILED", "Missing pin id.", nil)
	}
	if getPlexAuthSession(pinID) == nil {
		return nil, utils.NewError(http.StatusNotFound, "PLEX_AUTH_NOT_FOUND", "No active Plex sign-in for this pin. Start a new sign-in.", nil)
	}
	body, err := plexAuthRequest(ctx, http.MethodGet, "https://plex.tv/api/v2/pins/"+pinID, nil)
	if err != nil {
		return nil, err
	}
	var pin plexPinEnvelope
	if err := json.Unmarshal(body, &pin); err != nil {
		return nil, utils.NewError(http.StatusInternalServerError, "PLEX_DECODE_FAILED", "Failed to decode plex.tv pin status: "+err.Error(), nil)
	}
	status := &PlexAuthStatus{ExpiresAt: pin.ExpiresAt}
	if pin.AuthToken != "" {
		plexAuthMu.Lock()
		if s := plexAuthStore[pinID]; s != nil {
			s.AuthToken = pin.AuthToken
		}
		plexAuthMu.Unlock()
		status.Authenticated = true
	}
	return status, nil
}

// GetPlexAuthSession returns the server-side sign-in session without consuming
// it, so AuthStatus can read the account token to list servers while the flow
// stays open for the subsequent connect step.
func GetPlexAuthSession(pinID string) (*PlexAuthSession, error) {
	s := getPlexAuthSession(pinID)
	if s == nil {
		return nil, utils.NewError(http.StatusNotFound, "PLEX_AUTH_NOT_FOUND", "No active Plex sign-in for this pin. Start a new sign-in.", nil)
	}
	return s, nil
}

// ClaimPlexAuthSession returns and consumes the sign-in session. It is called
// exactly once, by AuthConnect, after the user picks a server.
func ClaimPlexAuthSession(pinID string) (*PlexAuthSession, error) {
	s := claimPlexAuthSession(pinID)
	if s == nil {
		return nil, utils.NewError(http.StatusNotFound, "PLEX_AUTH_NOT_FOUND", "No active Plex sign-in for this pin. Start a new sign-in.", nil)
	}
	if s.AuthToken == "" {
		return nil, utils.NewError(http.StatusBadRequest, "PLEX_AUTH_PENDING", "Plex sign-in is not complete yet.", nil)
	}
	return s, nil
}

// ResolvePlexServer picks the server resource matching clientIdentifier, or
// the sole server resource when no identifier is provided.
func ResolvePlexServer(servers []PlexServerResource, clientIdentifier string) (*PlexServerResource, error) {
	if clientIdentifier != "" {
		for i := range servers {
			if servers[i].ClientIdentifier == clientIdentifier {
				return &servers[i], nil
			}
		}
	}
	if len(servers) == 1 {
		return &servers[0], nil
	}
	return nil, utils.NewError(http.StatusNotFound, "PLEX_SERVER_NOT_FOUND", "No Plex Media Server matched the selected identifier.", map[string]any{
		"clientIdentifier": clientIdentifier,
	})
}

// connectionURL normalizes a single connection entry into an absolute base
// URL. The plex.direct URI reported by plex.tv is used verbatim so requests
// keep the official Plex certificate; otherwise the address/port/protocol are
// combined into an http(s) base URL.
func connectionURL(conn PlexConnection) string {
	if conn.URI != "" {
		return strings.TrimRight(conn.URI, "/")
	}
	proto := conn.Protocol
	if proto == "" {
		proto = "http"
	}
	if conn.Port > 0 && conn.Port != 443 {
		return fmt.Sprintf("%s://%s:%d", proto, conn.Address, conn.Port)
	}
	return fmt.Sprintf("%s://%s", proto, conn.Address)
}

// BestConnectionURL picks the most usable connection for a server resource:
// a local, non-relay connection first, then any non-relay connection, then the
// first available one.
func BestConnectionURL(server *PlexServerResource) string {
	if server == nil {
		return ""
	}
	var pick *PlexConnection
	for i := range server.Connections {
		if server.Connections[i].Local && !server.Connections[i].Relay {
			pick = &server.Connections[i]
			break
		}
	}
	if pick == nil {
		for i := range server.Connections {
			if !server.Connections[i].Relay {
				pick = &server.Connections[i]
				break
			}
		}
	}
	if pick == nil && len(server.Connections) > 0 {
		pick = &server.Connections[0]
	}
	if pick == nil {
		return ""
	}
	return connectionURL(*pick)
}

// probePlexConnection checks whether the backend can reach a connection by
// requesting /identity with a short timeout. It accepts any 2xx JSON
// MediaContainer response so the stored URL is guaranteed to work for the
// data calls that follow the connect flow.
func probePlexConnection(ctx context.Context, conn PlexConnection, token string) bool {
	base := connectionURL(conn)
	if base == "" {
		return false
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, base+"/identity", nil)
	if err != nil {
		return false
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("X-Plex-Token", token)
	client := &http.Client{Timeout: 4 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return false
	}
	body, err := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if err != nil {
		return false
	}
	var pr struct {
		MediaContainer json.RawMessage `json:"MediaContainer"`
	}
	if json.Unmarshal(body, &pr) != nil || len(pr.MediaContainer) == 0 {
		return false
	}
	return true
}

// connectionPriority orders connections for the backend: public (non-local)
// connections first — the backend usually runs in a container that cannot
// route to the server's LAN addresses — then local non-relay, then relay.
func connectionPriority(c PlexConnection) int {
	switch {
	case !c.Local && !c.Relay:
		return 0
	case c.Local && !c.Relay:
		return 1
	case c.Relay:
		return 2
	default:
		return 3
	}
}

// ReachablePlexConnectionURL returns the first server connection the backend
// can actually reach. It probes every candidate via /identity, trying public
// (plex.direct) connections first because the backend usually runs in a
// container that cannot route to the server's LAN addresses. When nothing
// responds it falls back to BestConnectionURL so the flow can still persist a
// best-effort configuration.
func ReachablePlexConnectionURL(ctx context.Context, server *PlexServerResource, token string) string {
	if server == nil {
		return ""
	}
	conns := append([]PlexConnection(nil), server.Connections...)
	sort.SliceStable(conns, func(i, j int) bool {
		return connectionPriority(conns[i]) < connectionPriority(conns[j])
	})
	for _, conn := range conns {
		if probePlexConnection(ctx, conn, token) {
			return connectionURL(conn)
		}
	}
	return BestConnectionURL(server)
}

// plexAuthRequest issues a request against the plex.tv account API and reads
// the JSON body, normalizing errors into app errors.
func plexAuthRequest(ctx context.Context, method, rawURL string, headers map[string]string) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, method, rawURL, nil)
	if err != nil {
		return nil, utils.NewError(http.StatusInternalServerError, "PLEX_REQUEST_FAILED", "Failed to build plex.tv request: "+err.Error(), nil)
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("X-Plex-Client-Identifier", PlexClientIdentifier)
	req.Header.Set("X-Plex-Product", plexProduct)
	req.Header.Set("X-Plex-Version", plexVersion)
	req.Header.Set("X-Plex-Device", plexDevice)
	req.Header.Set("X-Plex-Platform", plexPlatform)
	for k, v := range headers {
		req.Header.Set(k, v)
	}

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, utils.NewError(http.StatusBadGateway, "PLEX_REQUEST_FAILED", "Failed to reach plex.tv: "+err.Error(), nil)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(io.LimitReader(resp.Body, 10<<20))
	if err != nil {
		return nil, utils.NewError(http.StatusBadGateway, "PLEX_READ_FAILED", "Failed to read plex.tv response: "+err.Error(), nil)
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, utils.NewError(resp.StatusCode, "PLEX_API_ERROR", fmt.Sprintf("plex.tv returned an unexpected status (%d)", resp.StatusCode), map[string]any{
			"endpoint": rawURL,
			"body":     truncateForError(string(body), 512),
		})
	}
	return body, nil
}
