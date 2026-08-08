package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"strconv"
	"time"
)

const anilistGraphQLURL = "https://graphql.anilist.co"

// FlexString unmarshals both string and numeric JSON values. AniList returns
// some identifiers as strings (e.g. trailer.id is a YouTube video id), so the
// field type must accept both.
type FlexString string

func (f *FlexString) UnmarshalJSON(data []byte) error {
	var s string
	if err := json.Unmarshal(data, &s); err == nil {
		*f = FlexString(s)
		return nil
	}
	var n int
	if err := json.Unmarshal(data, &n); err == nil {
		*f = FlexString(strconv.Itoa(n))
		return nil
	}
	return nil
}

type AnilistClient struct {
	httpClient *http.Client
	logger     *slog.Logger
}

func NewAnilistClient(logger *slog.Logger) *AnilistClient {
	return &AnilistClient{
		httpClient: &http.Client{Timeout: 15 * time.Second},
		logger:     logger,
	}
}

type graphqlRequest struct {
	Query     string         `json:"query"`
	Variables map[string]any `json:"variables,omitempty"`
}

type graphqlResponse struct {
	Data   json.RawMessage `json:"data"`
	Errors []graphqlError  `json:"errors,omitempty"`
}

type graphqlError struct {
	Message    string `json:"message"`
	Status     int    `json:"status"`
	Locations  any    `json:"locations,omitempty"`
	Path       any    `json:"path,omitempty"`
	Extensions any    `json:"extensions,omitempty"`
}

func (e *graphqlError) Error() string {
	return fmt.Sprintf("anilist: %s (status %d)", e.Message, e.Status)
}

func (c *AnilistClient) do(ctx context.Context, query string, variables map[string]any) (json.RawMessage, error) {
	body, err := json.Marshal(graphqlRequest{Query: query, Variables: variables})
	if err != nil {
		return nil, fmt.Errorf("anilist: marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, anilistGraphQLURL, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("anilist: create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("anilist: execute request: %w", err)
	}
	defer resp.Body.Close()

	if remaining := resp.Header.Get("X-RateLimit-Remaining"); remaining != "" {
		if v, err := strconv.Atoi(remaining); err == nil && v < 10 {
			c.logger.Warn("anilist rate limit running low", "remaining", v)
		}
	}

	respBody, err := io.ReadAll(io.LimitReader(resp.Body, 5<<20))
	if err != nil {
		return nil, fmt.Errorf("anilist: read response: %w", err)
	}

	if resp.StatusCode == http.StatusTooManyRequests {
		retryAfter := resp.Header.Get("Retry-After")
		return nil, fmt.Errorf("anilist: rate limited, retry after %s", retryAfter)
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("anilist: unexpected status %d: %s", resp.StatusCode, string(respBody))
	}

	var gqlResp graphqlResponse
	if err := json.Unmarshal(respBody, &gqlResp); err != nil {
		return nil, fmt.Errorf("anilist: unmarshal response: %w", err)
	}
	if len(gqlResp.Errors) > 0 {
		return nil, &gqlResp.Errors[0]
	}
	return gqlResp.Data, nil
}

type AnilistMedia struct {
	ID          int    `json:"id"`
	IDMal       *int   `json:"idMal"`
	Title       struct {
		Romaji  string `json:"romaji"`
		English string `json:"english"`
		Native  string `json:"native"`
	} `json:"title"`
	Type        string `json:"type"`
	Format      string `json:"format"`
	Status      string `json:"status"`
	Source      string `json:"source"`
	Season      string `json:"season"`
	SeasonYear  *int   `json:"seasonYear"`
	Episodes    *int   `json:"episodes"`
	Duration    *int   `json:"duration"`
	Description string `json:"description"`
	StartDate   struct {
		Year  *int `json:"year"`
		Month *int `json:"month"`
		Day   *int `json:"day"`
	} `json:"startDate"`
	EndDate struct {
		Year  *int `json:"year"`
		Month *int `json:"month"`
		Day   *int `json:"day"`
	} `json:"endDate"`
	CoverImage struct {
		Large  string `json:"large"`
		Medium string `json:"medium"`
	} `json:"coverImage"`
	BannerImage  string   `json:"bannerImage"`
	Genres       []string `json:"genres"`
	AverageScore *int     `json:"averageScore"`
	MeanScore    *int     `json:"meanScore"`
	Popularity   *int     `json:"popularity"`
	Trailer      *struct {
		ID        *FlexString `json:"id"`
		Site      string      `json:"site"`
		Thumbnail string      `json:"thumbnail"`
	} `json:"trailer"`
	Studios struct {
		Edges []struct {
			IsMain bool `json:"isMain"`
			Node   struct {
				ID   int    `json:"id"`
				Name string `json:"name"`
			} `json:"node"`
		} `json:"edges"`
	} `json:"studios"`
	Characters struct {
		Edges []struct {
			Role string `json:"role"`
			Node struct {
				ID     int    `json:"id"`
				Name   struct {
					Full string `json:"full"`
				} `json:"name"`
				Image  struct {
					Medium string `json:"medium"`
				} `json:"image"`
				Gender *string `json:"gender"`
			} `json:"node"`
		} `json:"edges"`
	} `json:"characters"`
	Relations struct {
		Edges []struct {
			RelationType string `json:"relationType"`
			Node         struct {
				ID    int    `json:"id"`
				Title struct {
					Romaji string `json:"romaji"`
				} `json:"title"`
				Type string `json:"type"`
			} `json:"node"`
		} `json:"edges"`
	} `json:"relations"`
	SiteURL string `json:"siteUrl"`
}

type AnilistPageInfo struct {
	Total       int  `json:"total"`
	PerPage     int  `json:"perPage"`
	CurrentPage int  `json:"currentPage"`
	LastPage    int  `json:"lastPage"`
	HasNextPage bool `json:"hasNextPage"`
}

type AnilistSearchResult struct {
	PageInfo AnilistPageInfo `json:"pageInfo"`
	Media    []AnilistMedia  `json:"media"`
}

type AnilistAiringSchedule struct {
	ID          int           `json:"id"`
	AiringAt    int64         `json:"airingAt"`
	TimeUntilAiring int       `json:"timeUntilAiring"`
	Episode     int           `json:"episode"`
	MediaID     int           `json:"mediaId"`
	Media       *AnilistMedia `json:"media,omitempty"`
}

type AnilistCharacter struct {
	ID         int    `json:"id"`
	Name       struct {
		Full  string `json:"full"`
		Native string `json:"native"`
	} `json:"name"`
	Image struct {
		Large  string `json:"large"`
		Medium string `json:"medium"`
	} `json:"image"`
	Description string `json:"description"`
	Gender      string `json:"gender"`
	DateOfBirth struct {
		Month *int `json:"month"`
		Day   *int `json:"day"`
	} `json:"dateOfBirth"`
	Age       *string `json:"age"`
	BloodType *string `json:"bloodType"`
	SiteURL   string  `json:"siteUrl"`
	Media     struct {
		Edges []struct {
			ID      int    `json:"id"`
			Role    string `json:"characterRole"`
			Node    struct {
				ID    int    `json:"id"`
				Title struct {
					Romaji  string `json:"romaji"`
					English string `json:"english"`
				} `json:"title"`
				Type   string `json:"type"`
				Format string `json:"format"`
				Status string `json:"status"`
			} `json:"node"`
		} `json:"edges"`
	} `json:"media"`
}

type AnilistStaff struct {
	ID          int    `json:"id"`
	Name        struct {
		Full  string `json:"full"`
		Native string `json:"native"`
	} `json:"name"`
	Language    string `json:"language"`
	Image       struct {
		Large  string `json:"large"`
		Medium string `json:"medium"`
	} `json:"image"`
	Description string `json:"description"`
	PrimaryOccupations []string `json:"primaryOccupations"`
	YearsActive []string `json:"yearsActive"`
	DateOfBirth struct {
		Month *int `json:"month"`
		Day   *int `json:"day"`
	} `json:"dateOfBirth"`
	DateOfDeath struct {
		Month *int `json:"month"`
		Day   *int `json:"day"`
	} `json:"dateOfDeath"`
	HomeTown  *string `json:"homeTown"`
	SiteURL   string  `json:"siteUrl"`
}

const searchMediaIDQuery = `
query ($search: String) {
  Media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
    id
  }
}
`

const searchMediaQuery = `
query ($search: String, $type: MediaType, $page: Int, $perPage: Int) {  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      perPage
      currentPage
      lastPage
      hasNextPage
    }
    media(search: $search, type: $type, sort: SEARCH_MATCH) {
      id
      title { romaji english native }
      type
      format
      status
      season
      seasonYear
      episodes
      duration
      description(asHtml: false)
      coverImage { large medium }
      bannerImage
      genres
      averageScore
      meanScore
      popularity
      source
      trailer { id site thumbnail }
      studios(isMain: true) { edges { node { id name } } }
      siteUrl
    }
  }
}
`

// SearchMediaID returns the AniList ID of the best matching anime for a title.
// Returns 0 if nothing is found or the request fails.
func (c *AnilistClient) SearchMediaID(ctx context.Context, query string) int {
	data, err := c.do(ctx, searchMediaIDQuery, map[string]any{"search": query})
	if err != nil {
		return 0
	}
	var raw struct {
		Media struct {
			ID int `json:"id"`
		} `json:"Media"`
	}
	if err := json.Unmarshal(data, &raw); err != nil {
		return 0
	}
	return raw.Media.ID
}

func (c *AnilistClient) SearchMedia(ctx context.Context, query string, mediaType string, page, perPage int) (*AnilistSearchResult, error) {
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 50 {
		perPage = 10
	}
	vars := map[string]any{
		"search":  query,
		"page":    page,
		"perPage": perPage,
	}
	if mediaType != "" {
		vars["type"] = mediaType
	}

	data, err := c.do(ctx, searchMediaQuery, vars)
	if err != nil {
		return nil, err
	}

	var raw struct {
		Page AnilistSearchResult `json:"Page"`
	}
	if err := json.Unmarshal(data, &raw); err != nil {
		return nil, fmt.Errorf("anilist: unmarshal search result: %w", err)
	}
	return &raw.Page, nil
}

const getMediaByIDQuery = `
query ($id: Int!) {
  Media(id: $id) {
    id
    idMal
    title { romaji english native }
    type
    format
    status
    source
    season
    seasonYear
    episodes
    duration
    description(asHtml: false)
    startDate { year month day }
    endDate { year month day }
    coverImage { large medium }
    bannerImage
    genres
    averageScore
    meanScore
    popularity
    trailer { id site thumbnail }
    studios(isMain: true) { edges { isMain node { id name } } }
    characters(sort: ROLE, perPage: 25) {
      edges {
        role
        node { id name { full } image { medium } gender }
      }
    }
    relations {
      edges {
        relationType
        node { id title { romaji } type }
      }
    }
    siteUrl
  }
}
`

func (c *AnilistClient) GetMediaByID(ctx context.Context, id int) (*AnilistMedia, error) {
	data, err := c.do(ctx, getMediaByIDQuery, map[string]any{"id": id})
	if err != nil {
		return nil, err
	}

	var raw struct {
		Media AnilistMedia `json:"Media"`
	}
	if err := json.Unmarshal(data, &raw); err != nil {
		return nil, fmt.Errorf("anilist: unmarshal media: %w", err)
	}
	if raw.Media.ID == 0 {
		return nil, fmt.Errorf("anilist: media %d not found", id)
	}
	return &raw.Media, nil
}

// ──────────────────────────────────────────────────────────────
// Trending & Popular
// ──────────────────────────────────────────────────────────────

const trendingMediaQuery = `
query ($page: Int, $perPage: Int, $type: MediaType) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      perPage
      currentPage
      lastPage
      hasNextPage
    }
    media(sort: TRENDING_DESC, type: $type) {
      id
      title { romaji english native }
      type
      format
      status
      season
      seasonYear
      episodes
      duration
      description(asHtml: false)
      coverImage { large medium }
      bannerImage
      genres
      averageScore
      meanScore
      popularity
      source
      trailer { id site thumbnail }
      studios(isMain: true) { edges { node { id name } } }
      siteUrl
    }
  }
}
`

func (c *AnilistClient) GetTrendingMedia(ctx context.Context, mediaType string, page, perPage int) (*AnilistSearchResult, error) {
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 50 {
		perPage = 20
	}
	vars := map[string]any{
		"page":    page,
		"perPage": perPage,
		"type":    mediaType,
	}
	data, err := c.do(ctx, trendingMediaQuery, vars)
	if err != nil {
		return nil, err
	}

	var raw struct {
		Page AnilistSearchResult `json:"Page"`
	}
	if err := json.Unmarshal(data, &raw); err != nil {
		return nil, fmt.Errorf("anilist: unmarshal trending result: %w", err)
	}
	return &raw.Page, nil
}

const popularMediaQuery = `
query ($page: Int, $perPage: Int, $type: MediaType) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      perPage
      currentPage
      lastPage
      hasNextPage
    }
    media(sort: POPULARITY_DESC, type: $type) {
      id
      title { romaji english native }
      type
      format
      status
      season
      seasonYear
      episodes
      duration
      description(asHtml: false)
      coverImage { large medium }
      bannerImage
      genres
      averageScore
      meanScore
      popularity
      source
      trailer { id site thumbnail }
      studios(isMain: true) { edges { node { id name } } }
      siteUrl
    }
  }
}
`

func (c *AnilistClient) GetPopularMedia(ctx context.Context, mediaType string, page, perPage int) (*AnilistSearchResult, error) {
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 50 {
		perPage = 20
	}
	vars := map[string]any{
		"page":    page,
		"perPage": perPage,
		"type":    mediaType,
	}
	data, err := c.do(ctx, popularMediaQuery, vars)
	if err != nil {
		return nil, err
	}

	var raw struct {
		Page AnilistSearchResult `json:"Page"`
	}
	if err := json.Unmarshal(data, &raw); err != nil {
		return nil, fmt.Errorf("anilist: unmarshal popular result: %w", err)
	}
	return &raw.Page, nil
}

// ──────────────────────────────────────────────────────────────
// Seasonal
// ──────────────────────────────────────────────────────────────

const seasonalMediaQuery = `
query ($season: MediaSeason, $seasonYear: Int, $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      perPage
      currentPage
      lastPage
      hasNextPage
    }
    media(season: $season, seasonYear: $seasonYear, type: ANIME, sort: POPULARITY_DESC) {
      id
      title { romaji english native }
      type
      format
      status
      season
      seasonYear
      episodes
      duration
      description(asHtml: false)
      coverImage { large medium }
      bannerImage
      genres
      averageScore
      meanScore
      popularity
      source
      trailer { id site thumbnail }
      studios(isMain: true) { edges { node { id name } } }
      siteUrl
    }
  }
}
`

func (c *AnilistClient) GetSeasonalMedia(ctx context.Context, season string, seasonYear int, page, perPage int) (*AnilistSearchResult, error) {
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 50 {
		perPage = 20
	}
	vars := map[string]any{
		"season":     season,
		"seasonYear": seasonYear,
		"page":       page,
		"perPage":    perPage,
	}
	data, err := c.do(ctx, seasonalMediaQuery, vars)
	if err != nil {
		return nil, err
	}

	var raw struct {
		Page AnilistSearchResult `json:"Page"`
	}
	if err := json.Unmarshal(data, &raw); err != nil {
		return nil, fmt.Errorf("anilist: unmarshal seasonal result: %w", err)
	}
	return &raw.Page, nil
}

// ──────────────────────────────────────────────────────────────
// Airing Schedule
// ──────────────────────────────────────────────────────────────

const airingScheduleQuery = `
query ($page: Int, $perPage: Int, $notYetAired: Boolean) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      perPage
      currentPage
      lastPage
      hasNextPage
    }
    airingSchedules(notYetAired: $notYetAired, sort: TIME) {
      id
      airingAt
      timeUntilAiring
      episode
      mediaId
      media {
        id
        title { romaji english native }
        type
        format
        status
        season
        seasonYear
        episodes
        coverImage { large medium }
        bannerImage
        genres
        averageScore
        meanScore
        popularity
        studios(isMain: true) { edges { node { id name } } }
        siteUrl
      }
    }
  }
}
`

func (c *AnilistClient) GetAiringSchedule(ctx context.Context, page, perPage int, notYetAired bool) ([]AnilistAiringSchedule, *AnilistPageInfo, error) {
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 50 {
		perPage = 20
	}
	vars := map[string]any{
		"page":        page,
		"perPage":     perPage,
		"notYetAired": notYetAired,
	}
	data, err := c.do(ctx, airingScheduleQuery, vars)
	if err != nil {
		return nil, nil, err
	}

	var raw struct {
		Page struct {
			PageInfo      AnilistPageInfo      `json:"pageInfo"`
			AiringSchedules []AnilistAiringSchedule `json:"airingSchedules"`
		} `json:"Page"`
	}
	if err := json.Unmarshal(data, &raw); err != nil {
		return nil, nil, fmt.Errorf("anilist: unmarshal airing schedule: %w", err)
	}
	return raw.Page.AiringSchedules, &raw.Page.PageInfo, nil
}

// ──────────────────────────────────────────────────────────────
// Character Detail
// ──────────────────────────────────────────────────────────────

const characterDetailQuery = `
query ($id: Int!) {
  Character(id: $id) {
    id
    name { full native }
    image { large medium }
    description(asHtml: false)
    gender
    dateOfBirth { month day }
    age
    bloodType
    siteUrl
    media(page: 1, perPage: 10, sort: POPULARITY_DESC) {
      edges {
        id
        characterRole
        node {
          id
          title { romaji english }
          type
          format
          status
        }
      }
    }
  }
}
`

func (c *AnilistClient) GetCharacterByID(ctx context.Context, id int) (*AnilistCharacter, error) {
	data, err := c.do(ctx, characterDetailQuery, map[string]any{"id": id})
	if err != nil {
		return nil, err
	}

	var raw struct {
		Character AnilistCharacter `json:"Character"`
	}
	if err := json.Unmarshal(data, &raw); err != nil {
		return nil, fmt.Errorf("anilist: unmarshal character: %w", err)
	}
	if raw.Character.ID == 0 {
		return nil, fmt.Errorf("anilist: character %d not found", id)
	}
	return &raw.Character, nil
}

// ──────────────────────────────────────────────────────────────
// Staff Detail
// ──────────────────────────────────────────────────────────────

const staffDetailQuery = `
query ($id: Int!) {
  Staff(id: $id) {
    id
    name { full native }
    language
    image { large medium }
    description(asHtml: false)
    primaryOccupations
    yearsActive
    dateOfBirth { month day }
    dateOfDeath { month day }
    homeTown
    siteUrl
  }
}
`

func (c *AnilistClient) GetStaffByID(ctx context.Context, id int) (*AnilistStaff, error) {
	data, err := c.do(ctx, staffDetailQuery, map[string]any{"id": id})
	if err != nil {
		return nil, err
	}

	var raw struct {
		Staff AnilistStaff `json:"Staff"`
	}
	if err := json.Unmarshal(data, &raw); err != nil {
		return nil, fmt.Errorf("anilist: unmarshal staff: %w", err)
	}
	if raw.Staff.ID == 0 {
		return nil, fmt.Errorf("anilist: staff %d not found", id)
	}
	return &raw.Staff, nil
}
