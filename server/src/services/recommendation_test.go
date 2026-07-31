package services

import (
	"math"
	"testing"
	"time"

	"github.com/skygenesisenterprise/kami-sama/server/src/models"
)

func TestRecencyDecay(t *testing.T) {
	now := time.Date(2026, 7, 31, 12, 0, 0, 0, time.UTC)

	tests := []struct {
		name string
		ago  time.Duration
		want float64
	}{
		{name: "just watched", ago: 0, want: 1.0},
		{name: "one half-life", ago: recencyHalfLifeDays * 24 * time.Hour, want: math.Exp(-1)},
		{name: "two half-lives", ago: 2 * recencyHalfLifeDays * 24 * time.Hour, want: math.Exp(-2)},
		{name: "future watch clamps to zero", ago: -24 * time.Hour, want: 1.0},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			got := recencyDecay(now.Add(-tc.ago), now)
			if math.Abs(got-tc.want) > 1e-6 {
				t.Fatalf("expected %v, got %v", tc.want, got)
			}
		})
	}
}

func TestCompletionFactor(t *testing.T) {
	tests := []struct {
		name       string
		completed  bool
		percentage float64
		want       float64
	}{
		{name: "completed", completed: true, percentage: 50, want: 1.2},
		{name: "fully watched", completed: false, percentage: 100, want: 1.0},
		{name: "half watched", completed: false, percentage: 50, want: 0.8},
		{name: "barely started", completed: false, percentage: 0, want: 0.6},
		{name: "over 100 clamps", completed: false, percentage: 150, want: 1.0},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			got := completionFactor(tc.completed, tc.percentage)
			if math.Abs(got-tc.want) > 1e-6 {
				t.Fatalf("expected %v, got %v", tc.want, got)
			}
		})
	}
}

func TestBuildProfileNormalizesAndProjects(t *testing.T) {
	weights := map[string]float64{
		"anime-1": 4.0,
		"anime-2": 1.0,
	}
	watched := []models.Anime{
		{
			Common: models.Common{ID: "anime-1"},
			Genres: []models.Genre{{Common: models.Common{ID: "g1"}, Name: "Action"}, {Common: models.Common{ID: "g2"}, Name: "Drame"}},
			Studios: []models.Studio{{Common: models.Common{ID: "s1"}, Name: "Studio A"}},
		},
		{
			Common: models.Common{ID: "anime-2"},
			Genres: []models.Genre{{Common: models.Common{ID: "g1"}, Name: "Action"}},
			Studios: []models.Studio{{Common: models.Common{ID: "s1"}, Name: "Studio A"}},
		},
	}

	genres, studios := buildProfile(weights, watched)

	// "Action" receives 4.0 + 1.0 = 5.0 → normalized to 1.0 (the max).
	if got := genres["Action"]; math.Abs(got-1.0) > 1e-6 {
		t.Fatalf("expected Action weight 1.0, got %v", got)
	}
	// "Drame" receives 4.0 → 0.8 after normalization.
	if got := genres["Drame"]; math.Abs(got-0.8) > 1e-6 {
		t.Fatalf("expected Drame weight 0.8, got %v", got)
	}
	// Studio A receives (4.0 + 1.0) * 0.5 = 2.5 → 1.0 (the max).
	if got := studios["Studio A"]; math.Abs(got-1.0) > 1e-6 {
		t.Fatalf("expected Studio A weight 1.0, got %v", got)
	}
}

func TestScoreAnime(t *testing.T) {
	now := time.Date(2026, 7, 31, 12, 0, 0, 0, time.UTC)
	genreWeights := map[string]float64{"Action": 1.0, "Romance": 0.5}
	studioWeights := map[string]float64{"Studio A": 1.0}

	t.Run("matching genres score above zero with reasons", func(t *testing.T) {
		candidate := models.Anime{
			Common:      models.Common{ID: "c1"},
			Title:       "Candidate",
			Rating:      8.0,
			ReleaseYear: 2025,
			Genres:      []models.Genre{{Name: "Action"}, {Name: "Romance"}},
		}
		score, reasons := scoreAnime(&candidate, genreWeights, studioWeights, now)
		if score <= 0 {
			t.Fatalf("expected a positive score, got %v", score)
		}
		if len(reasons) != 2 {
			t.Fatalf("expected 2 reasons, got %v", reasons)
		}
	})

	t.Run("no overlap is rejected", func(t *testing.T) {
		candidate := models.Anime{
			Common:      models.Common{ID: "c2"},
			Title:       "Unrelated",
			Rating:      9.0,
			ReleaseYear: 2020,
			Genres:      []models.Genre{{Name: "Horreur"}},
			Studios:     []models.Studio{{Name: "Studio Z"}},
		}
		score, reasons := scoreAnime(&candidate, genreWeights, studioWeights, now)
		if score != 0 {
			t.Fatalf("expected score 0, got %v", score)
		}
		if len(reasons) != 0 {
			t.Fatalf("expected no reasons, got %v", reasons)
		}
	})

	t.Run("higher rating and freshness boost score", func(t *testing.T) {
		older := models.Anime{
			Common:      models.Common{ID: "c3"},
			Rating:      5.0,
			ReleaseYear: 2010,
			Genres:      []models.Genre{{Name: "Action"}},
		}
		newer := models.Anime{
			Common:      models.Common{ID: "c4"},
			Rating:      9.0,
			ReleaseYear: 2026,
			Genres:      []models.Genre{{Name: "Action"}},
		}
		oldScore, _ := scoreAnime(&older, genreWeights, studioWeights, now)
		newScore, _ := scoreAnime(&newer, genreWeights, studioWeights, now)
		if newScore <= oldScore {
			t.Fatalf("expected newer/higher-rated to score more: old=%v new=%v", oldScore, newScore)
		}
	})
}

func TestRankCandidatesSortsAndLimits(t *testing.T) {
	now := time.Date(2026, 7, 31, 12, 0, 0, 0, time.UTC)
	genreWeights := map[string]float64{"Action": 1.0}
	studioWeights := map[string]float64{}

	candidates := []models.Anime{
		{Common: models.Common{ID: "a"}, Title: "A", Rating: 6, Genres: []models.Genre{{Name: "Action"}}},
		{Common: models.Common{ID: "b"}, Title: "B", Rating: 9, Genres: []models.Genre{{Name: "Action"}}},
		{Common: models.Common{ID: "c"}, Title: "C", Rating: 8, Genres: []models.Genre{{Name: "Comédie"}}},
	}

	ranked := rankCandidates(candidates, genreWeights, studioWeights, now, 2)
	if len(ranked) != 2 {
		t.Fatalf("expected 2 items, got %d", len(ranked))
	}
	if ranked[0].Anime.ID != "b" {
		t.Fatalf("expected highest rated Action title first, got %s", ranked[0].Anime.ID)
	}
	if ranked[1].Anime.ID != "a" {
		t.Fatalf("expected second Action title, got %s", ranked[1].Anime.ID)
	}
}
