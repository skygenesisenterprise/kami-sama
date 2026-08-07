package services

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/skygenesisenterprise/kami-sama/server/src/models"
	"github.com/skygenesisenterprise/kami-sama/server/src/utils"
)

const defaultMalBaseURL = "https://api.myanimelist.net/v2"

// MalClient implements a low-level HTTP client for the MyAnimeList v2 REST
// API. Public endpoints are authorized with a client ID sent through the
// X-MAL-CLIENT-ID header (the "API key" configured in the dashboard).
type MalClient struct {
	baseURL    string
	clientID   string
	httpClient *http.Client
	logger     *slog.Logger
}

// MalConfig is the wiring struct for MalClient. It keeps this package
// independent from config.MyAnimeListConfig.
type MalConfig struct {
	ClientID string
	BaseURL  string
	Timeout  time.Duration
}

func NewMalClient(cfg MalConfig, logger *slog.Logger) *MalClient {
	base := strings.TrimRight(cfg.BaseURL, "/")
	if base == "" {
		base = defaultMalBaseURL
	}
	timeout := cfg.Timeout
	if timeout <= 0 {
		timeout = 15 * time.Second
	}
	return &MalClient{
		baseURL:    base,
		clientID:   strings.TrimSpace(cfg.ClientID),
		httpClient: &http.Client{Timeout: timeout},
		logger:     logger,
	}
}

// malClientFromSourceConfig is the JSON shape stored on a source_configs row
// for the myanimelist source type.
type malClientFromSourceConfig struct {
	APIKey  string  `json:"apiKey"`
	ApiURL  string  `json:"apiUrl"`
	Timeout float64 `json:"timeout"`
}

// MalClientFromSourceConfig builds a MalClient from a persisted
// source_configs row so the integration can be (re)configured through the UI
// without a server restart. Returns an error when no API key is present.
func MalClientFromSourceConfig(cfg *models.SourceConfig) (*MalClient, error) {
	if cfg == nil {
		return nil, fmt.Errorf("myanimelist config is nil")
	}
	var raw malClientFromSourceConfig
	if err := json.Unmarshal(cfg.Config, &raw); err != nil {
		return nil, fmt.Errorf("invalid myanimelist config: %w", err)
	}
	if strings.TrimSpace(raw.APIKey) == "" {
		return nil, fmt.Errorf("myanimelist config missing api key")
	}
	return NewMalClient(MalConfig{
		ClientID: raw.APIKey,
		BaseURL:  raw.ApiURL,
		Timeout:  time.Duration(raw.Timeout) * time.Second,
	}, nil), nil
}

// Enabled reports whether the client is wired with an API key.
func (c *MalClient) Enabled() bool {
	return c != nil && c.clientID != ""
}

// Name returns the provider identifier used across the API surface.
func (c *MalClient) Name() string { return "myanimelist" }

// ClientID returns the configured API key.
func (c *MalClient) ClientID() string { return c.clientID }

// BaseURL returns the configured API base URL.
func (c *MalClient) BaseURL() string { return c.baseURL }

func malDisabledError() error {
	return utils.NewError(http.StatusServiceUnavailable, "MYANIMELIST_DISABLED", "MyAnimeList integration is not enabled or not configured.", nil)
}

// malNode mirrors the "node" object of a MyAnimeList v2 list item.
type malNode struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	MainPicture *struct {
		Medium string `json:"medium"`
		Large  string `json:"large"`
	} `json:"main_picture"`
	AlternativeTitles *struct {
		En string `json:"en"`
		Ja string `json:"ja"`
	} `json:"alternative_titles"`
	StartDate    string   `json:"start_date"`
	EndDate      string   `json:"end_date"`
	Synopsis     string   `json:"synopsis"`
	Mean         *float64 `json:"mean"`
	Rank         *int     `json:"rank"`
	Popularity   *int     `json:"popularity"`
	MediaType    string   `json:"media_type"`
	Status       string   `json:"status"`
	NumEpisodes  int      `json:"num_episodes"`
	NumChapters  int      `json:"num_chapters"`
	NumVolumes   int      `json:"num_volumes"`
	StartSeason  *struct {
		Year   int    `json:"year"`
		Season string `json:"season"`
	} `json:"start_season"`
	Genres []struct {
		ID   int    `json:"id"`
		Name string `json:"name"`
	} `json:"genres"`
	Source string `json:"source"`
	Rating string `json:"rating"`
	Studios []struct {
		ID   int    `json:"id"`
		Name string `json:"name"`
	} `json:"studios"`
	Pictures []struct {
		Medium string `json:"medium"`
		Large  string `json:"large"`
	} `json:"pictures"`
}

type malListItem struct {
	Node malNode `json:"node"`
}

// malListResponse is the shared envelope for ranked / seasonal / search
// endpoints (anime and manga).
type malListResponse struct {
	Data   []malListItem `json:"data"`
	Paging struct {
		Next string `json:"next"`
	} `json:"paging"`
}

// do performs a GET against the MAL API and decodes a malListResponse.
func (c *MalClient) do(ctx context.Context, path string, query url.Values) (*malListResponse, error) {
	if !c.Enabled() {
		return nil, malDisabledError()
	}
	u := c.baseURL + path
	if len(query) > 0 {
		u += "?" + query.Encode()
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
	if err != nil {
		return nil, utils.NewError(http.StatusInternalServerError, "MYANIMELIST_REQUEST_FAILED", "Failed to build MyAnimeList request: "+err.Error(), nil)
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("X-MAL-CLIENT-ID", c.clientID)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, utils.NewError(http.StatusBadGateway, "MYANIMELIST_REQUEST_FAILED", "Failed to reach MyAnimeList API: "+err.Error(), nil)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(io.LimitReader(resp.Body, 10<<20))
	if err != nil {
		return nil, utils.NewError(http.StatusBadGateway, "MYANIMELIST_READ_FAILED", "Failed to read MyAnimeList response: "+err.Error(), nil)
	}

	if resp.StatusCode == http.StatusUnauthorized || resp.StatusCode == http.StatusForbidden {
		return nil, utils.NewError(http.StatusUnauthorized, "MYANIMELIST_INVALID_KEY", "MyAnimeList rejected the provided API key.", map[string]any{
			"status":   resp.StatusCode,
			"endpoint": path,
		})
	}
	if resp.StatusCode == http.StatusTooManyRequests {
		retryAfter := resp.Header.Get("Retry-After")
		return nil, utils.NewError(http.StatusTooManyRequests, "MYANIMELIST_RATE_LIMITED", "MyAnimeList rate limit reached.", map[string]any{
			"retryAfter": retryAfter,
			"body":       truncateForError(string(body), 512),
		})
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, utils.NewError(resp.StatusCode, "MYANIMELIST_API_ERROR", fmt.Sprintf("MyAnimeList returned an unexpected status (%d) on %s", resp.StatusCode, path), map[string]any{
			"body": truncateForError(string(body), 512),
		})
	}

	var list malListResponse
	if err := json.Unmarshal(body, &list); err != nil {
		return nil, utils.NewError(http.StatusInternalServerError, "MYANIMELIST_DECODE_FAILED", "Failed to decode MyAnimeList response: "+err.Error(), map[string]any{
			"snippet": truncateForError(string(body), 512),
		})
	}
	return &list, nil
}

// Validate probes the API key with the smallest possible request.
func (c *MalClient) Validate(ctx context.Context) error {
	_, err := c.do(ctx, "/anime/ranking", url.Values{
		"ranking_type": {"all"},
		"limit":        {"1"},
	})
	return err
}

// GetSeasonalAnime returns the seasonal anime lineup.
func (c *MalClient) GetSeasonalAnime(ctx context.Context, year, season string) (*malListResponse, error) {
	return c.do(ctx, "/anime/season/"+year+"/"+strings.ToLower(season), url.Values{
		"limit":  {"100"},
		"fields": {malFields},
	})
}

// GetAnimeRanking returns the anime ranking for the given ranking_type.
func (c *MalClient) GetAnimeRanking(ctx context.Context, rankingType string, limit int) (*malListResponse, error) {
	if limit < 1 || limit > 100 {
		limit = 100
	}
	return c.do(ctx, "/anime/ranking", url.Values{
		"ranking_type": {rankingType},
		"limit":        {strconv.Itoa(limit)},
		"fields":       {malFields},
	})
}

// GetMangaRanking returns the manga ranking for the given ranking_type.
func (c *MalClient) GetMangaRanking(ctx context.Context, rankingType string, limit int) (*malListResponse, error) {
	if limit < 1 || limit > 100 {
		limit = 100
	}
	return c.do(ctx, "/manga/ranking", url.Values{
		"ranking_type": {rankingType},
		"limit":        {strconv.Itoa(limit)},
		"fields":       {malFields},
	})
}

// Search searches anime or manga by title.
func (c *MalClient) Search(ctx context.Context, query, mediaType string, limit int) (*malListResponse, error) {
	if limit < 1 || limit > 100 {
		limit = 20
	}
	values := url.Values{
		"q":      {query},
		"limit":  {strconv.Itoa(limit)},
		"fields": {malFields},
	}
	path := "/anime"
	if strings.EqualFold(mediaType, "manga") {
		path = "/manga"
	}
	return c.do(ctx, path, values)
}

const malFields = "id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,media_type,status,genres,num_episodes,num_chapters,num_volumes,start_season,source,rating,studios,pictures"
