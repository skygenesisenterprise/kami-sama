package services

import (
	"context"
	"math"
	"sort"
	"time"

	"github.com/skygenesisenterprise/kami-sama/server/src/models"
	"gorm.io/gorm"
)

// ──────────────────────────────────────────────────────────────
// Recommendation engine
//
// Content-based recommendations driven by what the user actually
// watched on the platform (watch_progress + watch_history).
//
// 1. Each watch produces a weighted signal that fades over time
//    (exponential recency decay) and scales with how much of the
//    content was consumed (completion factor).
// 2. Signals are aggregated per anime, then projected onto the
//    anime's genres and studios to build a taste profile.
// 3. Every unwatched anime is scored against that profile
//    (genre + studio dot product), boosted by popularity
//    (rating / trending) and content freshness.
// ──────────────────────────────────────────────────────────────

// RecommendationItem is a single ranked recommendation returned to the client.
type RecommendationItem struct {
	Anime   models.Anime `json:"anime"`
	Score   float64      `json:"score"`
	Reasons []string     `json:"reasons"`
}

// RecommendationService computes personalized recommendations from
// the user's viewing history.
type RecommendationService struct {
	db *gorm.DB
}

func NewRecommendationService(db *gorm.DB) *RecommendationService {
	return &RecommendationService{db: db}
}

// tuning parameters of the scoring model
const (
	// recencyHalfLifeDays controls how fast a watch loses influence (exponential decay).
	recencyHalfLifeDays = 60.0
	// historyEventWeight is the relative weight of a single history entry
	// compared to an upserted progress record.
	historyEventWeight = 0.35
	// studioAffinityFactor weights studios relative to genres in the profile.
	studioAffinityFactor = 0.5
	// studioScoreFactor weights the studio signal relative to genres when scoring.
	studioScoreFactor = 0.6
	// ratingBoostFactor scales the popularity/quality boost.
	ratingBoostFactor = 0.15
	// trendingBoost scales the boost given to trending content.
	trendingBoost = 0.10
	// freshnessBoost scales the boost given to recent releases.
	freshnessBoost = 0.08
	// freshnessYears is the window (in years) during which a release counts as fresh.
	freshnessYears = 5.0
	// maxSignalPerAnime caps how much a single binge can dominate the profile.
	maxSignalPerAnime = 5.0
)

// Recommend returns the top `limit` unwatched anime ranked by fit with the
// user's watching history. If the user has no history, a popularity fallback
// (top rated) is returned.
func (s *RecommendationService) Recommend(ctx context.Context, userID string, limit int) ([]RecommendationItem, error) {
	now := time.Now().UTC()

	watchedIDs, weights, err := s.loadWatchSignals(ctx, userID, now)
	if err != nil {
		return nil, err
	}
	if len(watchedIDs) == 0 {
		return s.popularFallback(ctx, limit), nil
	}

	watchedAnime, err := s.loadAnime(ctx, watchedIDs)
	if err != nil {
		return nil, err
	}

	genreWeights, studioWeights := buildProfile(weights, watchedAnime)

	candidates, err := s.loadCandidates(ctx, watchedIDs)
	if err != nil {
		return nil, err
	}

	return rankCandidates(candidates, genreWeights, studioWeights, now, limit), nil
}

// loadWatchSignals aggregates watch_progress and watch_history into a
// per-anime weight. It returns the ordered set of watched anime ids.
func (s *RecommendationService) loadWatchSignals(ctx context.Context, userID string, now time.Time) (map[string]struct{}, map[string]float64, error) {
	var progress []models.WatchProgress
	if err := s.db.WithContext(ctx).Where("user_id = ?", userID).Find(&progress).Error; err != nil {
		return nil, nil, err
	}

	var history []models.WatchHistory
	if err := s.db.WithContext(ctx).Where("user_id = ?", userID).Find(&history).Error; err != nil {
		return nil, nil, err
	}

	weights := make(map[string]float64)
	for i := range progress {
		w := recencyDecay(progress[i].LastWatched, now) *
			completionFactor(progress[i].Completed, progress[i].Percentage)
		weights[progress[i].AnimeID] += w
	}
	for i := range history {
		w := recencyDecay(history[i].WatchedAt, now) * historyEventWeight
		weights[history[i].AnimeID] += w
	}

	watched := make(map[string]struct{}, len(weights))
	for id, w := range weights {
		if w > maxSignalPerAnime {
			weights[id] = maxSignalPerAnime
		}
		watched[id] = struct{}{}
	}
	return watched, weights, nil
}

// loadAnime fetches watched anime with their genres and studios.
func (s *RecommendationService) loadAnime(ctx context.Context, watchedIDs map[string]struct{}) ([]models.Anime, error) {
	ids := make([]string, 0, len(watchedIDs))
	for id := range watchedIDs {
		ids = append(ids, id)
	}
	var anime []models.Anime
	err := s.db.WithContext(ctx).
		Preload("Genres").
		Preload("Studios").
		Where("id IN ?", ids).
		Find(&anime).Error
	return anime, err
}

// loadCandidates fetches every non-deleted anime the user has not watched.
func (s *RecommendationService) loadCandidates(ctx context.Context, watchedIDs map[string]struct{}) ([]models.Anime, error) {
	ids := make([]string, 0, len(watchedIDs))
	for id := range watchedIDs {
		ids = append(ids, id)
	}
	var candidates []models.Anime
	query := s.db.WithContext(ctx).
		Preload("Genres").
		Preload("Studios").
		Where("deleted_at IS NULL")
	if len(ids) > 0 {
		query = query.Where("id NOT IN ?", ids)
	}
	err := query.Find(&candidates).Error
	return candidates, err
}

// buildProfile projects per-anime watch weights onto genres and studios,
// then normalizes both maps so the strongest taste has weight 1.0.
func buildProfile(weights map[string]float64, watchedAnime []models.Anime) (map[string]float64, map[string]float64) {
	genreWeights := make(map[string]float64)
	studioWeights := make(map[string]float64)

	for i := range watchedAnime {
		anime := &watchedAnime[i]
		w, ok := weights[anime.ID]
		if !ok {
			continue
		}
		for _, g := range anime.Genres {
			genreWeights[g.Name] += w
		}
		for _, st := range anime.Studios {
			studioWeights[st.Name] += w * studioAffinityFactor
		}
	}

	normalize := func(m map[string]float64) map[string]float64 {
		max := 0.0
		for _, v := range m {
			if v > max {
				max = v
			}
		}
		if max <= 0 {
			return m
		}
		for k, v := range m {
			m[k] = v / max
		}
		return m
	}

	return normalize(genreWeights), normalize(studioWeights)
}

// rankCandidates scores every candidate and returns the top `limit`,
// ordered by descending score.
func rankCandidates(candidates []models.Anime, genreWeights, studioWeights map[string]float64, now time.Time, limit int) []RecommendationItem {
	ranked := make([]RecommendationItem, 0, len(candidates))
	for i := range candidates {
		score, reasons := scoreAnime(&candidates[i], genreWeights, studioWeights, now)
		if score <= 0 {
			continue
		}
		ranked = append(ranked, RecommendationItem{
			Anime:   candidates[i],
			Score:   score,
			Reasons: reasons,
		})
	}

	sort.SliceStable(ranked, func(i, j int) bool {
		if ranked[i].Score != ranked[j].Score {
			return ranked[i].Score > ranked[j].Score
		}
		return ranked[i].Anime.Rating > ranked[j].Anime.Rating
	})

	if limit <= 0 || limit > len(ranked) {
		limit = len(ranked)
	}
	return ranked[:limit]
}

// scoreAnime computes the fit between a candidate and the user's taste
// profile and returns the score plus the genres that drove it.
func scoreAnime(candidate *models.Anime, genreWeights, studioWeights map[string]float64, now time.Time) (float64, []string) {
	genreScore := 0.0
	var reasons []string
	for _, g := range candidate.Genres {
		w := genreWeights[g.Name]
		if w > 0 {
			genreScore += w
			reasons = append(reasons, g.Name)
		}
	}

	studioScore := 0.0
	for _, st := range candidate.Studios {
		if w := studioWeights[st.Name]; w > 0 {
			studioScore += w
		}
	}

	base := genreScore + studioScore*studioScoreFactor
	if base <= 0 {
		return 0, nil
	}

	score := base
	score *= 1 + ratingBoostFactor*(clamp(candidate.Rating, 0, 10)/10.0)
	if candidate.IsTrending {
		score *= 1 + trendingBoost
	}
	score *= 1 + freshnessBoost*releaseFreshness(candidate.ReleaseYear, now)

	if len(reasons) > 3 {
		reasons = reasons[:3]
	}
	return score, reasons
}

// popularFallback returns the highest rated anime when there is no watch
// history to build a profile from.
func (s *RecommendationService) popularFallback(ctx context.Context, limit int) []RecommendationItem {
	var candidates []models.Anime
	err := s.db.WithContext(ctx).
		Preload("Genres").
		Preload("Studios").
		Where("deleted_at IS NULL AND rating > 0").
		Order("rating DESC, rating_count DESC").
		Limit(limit).
		Find(&candidates).Error
	if err != nil {
		return nil
	}
	items := make([]RecommendationItem, 0, len(candidates))
	for i := range candidates {
		items = append(items, RecommendationItem{
			Anime:   candidates[i],
			Score:   candidates[i].Rating,
			Reasons: []string{"Populaire"},
		})
	}
	return items
}

// recencyDecay returns an exponential decay in [0, 1]: 1 when the watch
// happened "now", ~0.5 after one half-life.
func recencyDecay(lastWatched, now time.Time) float64 {
	days := now.Sub(lastWatched).Hours() / 24.0
	if days < 0 {
		days = 0
	}
	return math.Exp(-days / recencyHalfLifeDays)
}

// completionFactor weights how much of the content was consumed: completed
// shows count fully, partial shows scale from 0.6 to 1.0 with percentage.
func completionFactor(completed bool, percentage float64) float64 {
	if completed {
		return 1.2
	}
	p := clamp(percentage, 0, 100)
	return 0.6 + 0.4*(p/100.0)
}

// releaseFreshness returns 1.0 for releases within freshnessYears, fading to 0.
func releaseFreshness(releaseYear int, now time.Time) float64 {
	if releaseYear <= 0 {
		return 0
	}
	ageYears := now.Year() - releaseYear
	if ageYears < 0 {
		return 1.0
	}
	if ageYears >= int(freshnessYears) {
		return 0
	}
	return 1.0 - float64(ageYears)/freshnessYears
}

func clamp(v, min, max float64) float64 {
	if v < min {
		return min
	}
	if v > max {
		return max
	}
	return v
}
