/**
 * Discover section logic — every `section*` key from the discover messages
 * gets a real, data-driven selection. All selectors operate on a catalog
 * pool (the real items served by the public /discover/catalog endpoint when
 * available, mock data otherwise) so every rail shows real artwork.
 *
 * Each definition maps a translation key to a `select(pool)` function that
 * returns the anime shown in that rail. Empty results are dropped by the page.
 */

import type { Anime } from '@/types/anime'

export interface DiscoverSectionDef {
  /** Stable rail id (also used as React key). */
  id: string
  /** Translation key under `Public.discover` for the rail title. */
  titleKey: string
  /** Translation key under `Public.discover` for the rail subtitle. */
  subtitleKey?: string
  /** Optional i18n params passed to the title (e.g. `{ country }`). */
  titleParams?: Record<string, string | number>
  /** CTA href (defaults to `/catalog`). */
  href?: string
  /** Selection logic: given the full catalog pool, return this rail's anime. */
  select: (pool: Anime[]) => Anime[]
  /** Optional filter applied to top-up candidates so the filler keeps the
   *  rail's theme (e.g. only movies for a "Films" rail). */
  compatible?: (anime: Anime) => boolean
}

/* ── Shared selection helpers ──────────────────────────────────────────── */

const byGenre = (pool: Anime[], genreIds: string[]) =>
  pool.filter((a) => a.genres.some((g) => genreIds.includes(g.id)))

const byStatus = (pool: Anime[], status: Anime['status']) =>
  pool.filter((a) => a.status === status)

const byStudio = (pool: Anime[], studioName: string) =>
  pool.filter((a) =>
    a.studio.name.toLowerCase().includes(studioName.toLowerCase()),
  )

const byAgeRating = (pool: Anime[], ageRating: string) =>
  pool.filter((a) => a.ageRating === ageRating)

const topRated = (pool: Anime[], count: number) =>
  [...pool].sort((a, b) => b.rating - a.rating).slice(0, count)

const newest = (pool: Anime[], count: number) =>
  [...pool].sort((a, b) => b.year - a.year).slice(0, count)

const shortest = (pool: Anime[], count: number) =>
  [...pool].sort((a, b) => a.totalEpisodes - b.totalEpisodes).slice(0, count)

const dedupe = (pool: Anime[]): Anime[] => {
  const seen = new Set<string>()
  return pool.filter((a) => (seen.has(a.id) ? false : (seen.add(a.id), true)))
}

/** Minimum number of distinct items every content rail should display. */
export const MIN_SECTION_ITEMS = 10

/** Rotates an array by `offset` so per-section fillers differ between rails. */
function rotate<T>(arr: T[], offset: number): T[] {
  if (arr.length === 0) return arr
  const o = ((offset % arr.length) + arr.length) % arr.length
  return [...arr.slice(o), ...arr.slice(0, o)]
}

/** Stable per-section rotation seed derived from the rail id. */
function hashSeed(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/**
 * Guarantees a rail always shows at least `min` distinct items: the
 * thematic selection first, then topped up with the best remaining pool
 * titles (rotated per section so adjacent rails don't repeat the same
 * filler). Returns at most `min` items.
 */
export function fillSectionItems(
  pool: Anime[],
  selected: Anime[],
  sectionId: string,
  min = MIN_SECTION_ITEMS,
  compatible?: (anime: Anime) => boolean,
): Anime[] {
  const out = dedupe(selected)
  // Already at/above the minimum — keep the full selection for variety
  // ("au minimum", not "exactement"): never shrink a rich rail.
  if (out.length >= min) return out
  const seen = new Set(out.map((a) => a.id))
  const candidates = rotate(
    [...pool]
      .filter((a) => !seen.has(a.id) && (!compatible || compatible(a)))
      .sort((a, b) => b.rating - a.rating),
    hashSeed(sectionId),
  )
  for (const a of candidates) {
    if (out.length >= min) break
    out.push(a)
  }
  return out
}

/** Predicate factory: keeps only titles matching at least one genre id. */
export const inGenres =
  (...genreIds: string[]) =>
  (anime: Anime) =>
    anime.genres.some((g) => genreIds.includes(g.id))

/** Predicate factory: keeps only titles of the given content type. */
export const ofType =
  (type: 'series' | 'movies') =>
  (anime: Anime) =>
    anime.type === type

/* ── Daily pick: deterministic rotation through the pool ───────────────── */

export function selectDailyPick(pool: Anime[], now: Date = new Date()): Anime[] {
  const startOfYear = new Date(now.getFullYear(), 0, 0).getTime()
  const day = Math.floor((now.getTime() - startOfYear) / 86_400_000)
  const base = topRated(pool, pool.length)
  if (base.length === 0) return []
  const offset = day % base.length
  return dedupe([...base.slice(offset), ...base.slice(0, offset)]).slice(0, 6)
}

/* ── The full section table (one entry per discover translation key) ───── */

export const DISCOVER_SECTION_DEFS: DiscoverSectionDef[] = [
  {
    id: 'kami-pick',
    titleKey: 'sectionKamiPick',
    subtitleKey: 'sectionKamiPickSub',
    select: (pool) => topRated(pool, 8),
  },
  {
    id: 'trending',
    titleKey: 'sectionTrending',
    subtitleKey: 'sectionTrendingSub',
    select: (pool) => topRated(pool, 10),
  },
  {
    id: 'recently-added',
    titleKey: 'sectionRecentlyAdded',
    subtitleKey: 'sectionRecentlyAddedSub',
    select: (pool) => newest(pool, 8),
  },
  {
    id: 'must-watch',
    titleKey: 'sectionMustWatch',
    subtitleKey: 'sectionMustWatchSub',
    select: (pool) => pool.filter((a) => a.rating >= 8.5).sort((a, b) => b.rating - a.rating).slice(0, 8),
  },
  {
    id: 'recommended',
    titleKey: 'sectionRecommended',
    subtitleKey: 'sectionRecommendedSub',
    select: (pool) => pool.filter((a) => a.rating >= 8 && a.rating < 9).sort((a, b) => b.rating - a.rating).slice(0, 8),
  },
  {
    id: 'films',
    titleKey: 'sectionFilms',
    subtitleKey: 'sectionFilmsSub',
    compatible: ofType('movies'),
    select: (pool) => pool.filter((a) => a.type === 'movies').slice(0, 8),
  },
  {
    id: 'simulcast',
    titleKey: 'sectionSimulcast',
    subtitleKey: 'sectionSimulcastSub',
    select: (pool) => newest(pool, 8),
  },
  {
    id: 'sci-fi',
    titleKey: 'sectionSciFi',
    subtitleKey: 'sectionSciFiSub',
    compatible: inGenres('sci-fi'),
    select: (pool) => byGenre(pool, ['sci-fi']),
  },
  {
    id: 'action-adventure',
    titleKey: 'sectionActionAdventure',
    subtitleKey: 'sectionActionAdventureSub',
    compatible: inGenres('action', 'adventure'),
    select: (pool) => byGenre(pool, ['action', 'adventure']),
  },
  {
    id: 'exclusive',
    titleKey: 'sectionExclusive',
    subtitleKey: 'sectionExclusiveSub',
    select: (pool) => pool.filter((a) => a.rating >= 8.8).sort((a, b) => b.rating - a.rating).slice(0, 6),
  },
  {
    id: 'editorial',
    titleKey: 'sectionEditorial',
    subtitleKey: 'sectionEditorialSub',
    select: (pool) => topRated(pool, 6),
  },
  {
    id: 'explore',
    titleKey: 'sectionExplore',
    subtitleKey: 'sectionExploreSub',
    compatible: inGenres('fantasy', 'adventure'),
    select: (pool) => byGenre(pool, ['fantasy', 'adventure']),
  },
  {
    id: 'thrillers',
    titleKey: 'sectionThrillers',
    subtitleKey: 'sectionThrillersSub',
    compatible: inGenres('mystery', 'drama'),
    select: (pool) => byGenre(pool, ['mystery', 'drama']),
  },
  {
    id: 'time-travel',
    titleKey: 'sectionTimeTravel',
    subtitleKey: 'sectionTimeTravelSub',
    compatible: inGenres('sci-fi'),
    select: (pool) => byGenre(pool, ['sci-fi']),
  },
  {
    id: 'blockbusters',
    titleKey: 'sectionBlockbusters',
    subtitleKey: 'sectionBlockbustersSub',
    select: (pool) => topRated(byGenre(pool, ['action', 'drama']), 6),
  },
  {
    id: 'multiverse',
    titleKey: 'sectionMultiverse',
    subtitleKey: 'sectionMultiverseSub',
    compatible: inGenres('sci-fi', 'fantasy'),
    select: (pool) => byGenre(pool, ['sci-fi', 'fantasy']),
  },
  {
    id: 'espionage',
    titleKey: 'sectionEspionage',
    subtitleKey: 'sectionEspionageSub',
    compatible: inGenres('mystery', 'action'),
    select: (pool) => byGenre(pool, ['mystery', 'action']),
  },
  {
    id: 'space-opera',
    titleKey: 'sectionSpaceOpera',
    subtitleKey: 'sectionSpaceOperaSub',
    compatible: inGenres('sci-fi'),
    select: (pool) => topRated(byGenre(pool, ['sci-fi']), 6),
  },
  {
    id: 'top10',
    titleKey: 'sectionTop10',
    subtitleKey: 'sectionTop10Sub',
    titleParams: { country: 'France' },
    select: (pool) => topRated(pool, 10),
  },
  {
    id: 'war-politics',
    titleKey: 'sectionWarPolitics',
    subtitleKey: 'sectionWarPoliticsSub',
    select: (pool) => byStudio(pool, 'kaze'),
  },
  {
    id: 'new-week',
    titleKey: 'sectionNewWeek',
    subtitleKey: 'sectionNewWeekSub',
    select: (pool) => newest(pool, 6),
  },
  {
    id: 'new-eps',
    titleKey: 'sectionNewEps',
    subtitleKey: 'sectionNewEpsSub',
    select: (pool) => newest(pool, 6),
  },
  {
    id: 'inspired',
    titleKey: 'sectionInspired',
    subtitleKey: 'sectionInspiredSub',
    compatible: inGenres('slice-of-life', 'drama', 'romance'),
    select: (pool) => topRated(byGenre(pool, ['slice-of-life', 'drama', 'romance']), 6),
  },
  {
    id: 'daily-pick',
    titleKey: 'sectionDailyPick',
    subtitleKey: 'sectionDailyPickSub',
    select: (pool) => selectDailyPick(pool),
  },
  {
    id: 'classics',
    titleKey: 'sectionClassics',
    subtitleKey: 'sectionClassicsSub',
    select: (pool) =>
      pool
        .filter((a) => a.year <= 2023)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 8),
  },
  {
    id: 'family',
    titleKey: 'sectionFamily',
    subtitleKey: 'sectionFamilySub',
    compatible: (a) => a.ageRating === 'PG',
    select: (pool) => byAgeRating(pool, 'PG'),
  },
  {
    id: 'foot',
    titleKey: 'sectionFoot',
    subtitleKey: 'sectionFootSub',
    compatible: inGenres('sports'),
    select: (pool) => byGenre(pool, ['sports']),
  },
  {
    id: 'mecha',
    titleKey: 'sectionMecha',
    subtitleKey: 'sectionMechaSub',
    compatible: inGenres('sci-fi', 'action'),
    select: (pool) => byGenre(pool, ['sci-fi']).filter((a) => a.genres.some((g) => g.id === 'action')),
  },
  {
    id: 'finish-line',
    titleKey: 'sectionFinishLine',
    subtitleKey: 'sectionFinishLineSub',
    select: (pool) => shortest(pool, 6),
  },
  {
    id: 'short',
    titleKey: 'sectionShort',
    subtitleKey: 'sectionShortSub',
    select: (pool) => shortest(pool, 6),
  },
  {
    id: 'fanfiction',
    titleKey: 'sectionFanfiction',
    subtitleKey: 'sectionFanfictionSub',
    compatible: inGenres('fantasy', 'supernatural'),
    select: (pool) => byGenre(pool, ['fantasy', 'supernatural']),
  },
  {
    id: 'strategy',
    titleKey: 'sectionStrategy',
    subtitleKey: 'sectionStrategySub',
    compatible: inGenres('mystery'),
    select: (pool) => byGenre(pool, ['mystery']).slice(0, 6),
  },
  {
    id: 'comedy',
    titleKey: 'sectionComedy',
    subtitleKey: 'sectionComedySub',
    compatible: inGenres('slice-of-life'),
    select: (pool) => byGenre(pool, ['slice-of-life']),
  },
  {
    id: 'popular-fr',
    titleKey: 'sectionPopularFR',
    subtitleKey: 'sectionPopularFRSub',
    select: (pool) => topRated(pool, 8),
  },
  {
    id: 'card-game',
    titleKey: 'sectionCardGame',
    subtitleKey: 'sectionCardGameSub',
    select: (pool) => dedupe([...byGenre(pool, ['sports']), ...byGenre(pool, ['action'])]).slice(0, 6),
  },
  {
    id: 'vampire',
    titleKey: 'sectionVampire',
    subtitleKey: 'sectionVampireSub',
    compatible: inGenres('supernatural', 'romance'),
    select: (pool) => byGenre(pool, ['supernatural', 'romance']),
  },
  {
    id: 'globe',
    titleKey: 'sectionGlobe',
    subtitleKey: 'sectionGlobeSub',
    compatible: inGenres('adventure'),
    select: (pool) => byGenre(pool, ['adventure']),
  },
  {
    id: 'female-leads',
    titleKey: 'sectionFemaleLeads',
    subtitleKey: 'sectionFemaleLeadsSub',
    compatible: inGenres('romance', 'drama'),
    select: (pool) => topRated(byGenre(pool, ['romance', 'drama']), 6),
  },
  {
    id: 'vf',
    titleKey: 'sectionVF',
    subtitleKey: 'sectionVFSub',
    select: (pool) => topRated(pool, 8),
  },
  {
    id: 'picks',
    titleKey: 'sectionPicks',
    subtitleKey: 'sectionPicksSub',
    select: (pool) => topRated(pool, 6),
  },
  {
    id: 'latest',
    titleKey: 'sectionLatest',
    subtitleKey: 'sectionLatestSub',
    select: (pool) => newest(pool, 6),
  },
]
