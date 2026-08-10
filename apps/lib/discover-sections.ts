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

const topRated = (pool: Anime[], count?: number) =>
  [...pool].sort((a, b) => b.rating - a.rating).slice(0, count ?? pool.length)

const newest = (pool: Anime[], count?: number) =>
  [...pool].sort((a, b) => b.year - a.year).slice(0, count ?? pool.length)

const shortest = (pool: Anime[], count?: number) =>
  [...pool].sort((a, b) => a.totalEpisodes - b.totalEpisodes).slice(0, count ?? pool.length)

const dedupe = (pool: Anime[]): Anime[] => {
  const seen = new Set<string>()
  return pool.filter((a) => (seen.has(a.id) ? false : (seen.add(a.id), true)))
}

/** Minimum number of distinct items every content rail should display. */
export const MIN_SECTION_ITEMS = 20

/** Maximum number of items a single rail displays. Capping each rail leaves
 *  room for the OTHER rails to draw from the pool: without a cap, the first
 *  generic rail (e.g. "Les plus populaires") would swallow the whole pool and
 *  every following rail would be forced to repeat the same titles. */
export const MAX_SECTION_ITEMS = 40

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
 * Builds a single rail's item list, guaranteeing `min` distinct items and
 * never exceeding `max`. `usedIds` carries the titles already shown by other
 * rails on the page so this rail prefers titles nobody else is showing yet
 * (variety between sections):
 *
 *   1. Thematic selection — unused titles first, then already-used ones so a
 *      rich theme never empties out.
 *   2. Top-up to the minimum with the best compatible titles not used yet.
 *   3. Last resort — top-up with titles already used elsewhere (pool
 *      exhausted) so the rail still reaches its minimum.
 *
 * The rail never shrinks below `min` when the pool allows, and never grows
 * past `max`, which is what lets the NEXT rails stay distinct too.
 */
export function fillSectionItems(
  pool: Anime[],
  selected: Anime[],
  sectionId: string,
  min = MIN_SECTION_ITEMS,
  compatible?: (anime: Anime) => boolean,
  max = MAX_SECTION_ITEMS,
  usedIds?: ReadonlySet<string>,
): Anime[] {
  const out: Anime[] = []
  const seen = new Set<string>()
  const push = (a: Anime) => {
    if (seen.has(a.id) || out.length >= max) return
    seen.add(a.id)
    out.push(a)
  }

  // 1) Thematic selection: unused titles first (they are not shown by any
  //    other rail yet), then already-used ones so a rich theme survives.
  const thematic = dedupe(selected)
  for (const a of thematic) {
    if (out.length >= max) break
    if (!usedIds?.has(a.id)) push(a)
  }
  for (const a of thematic) {
    if (out.length >= max) break
    push(a)
  }

  // 2) Top-up to the minimum with the best compatible titles no other rail
  //    shows yet (variety between sections).
  if (out.length < min) {
    const ranked = [...pool]
      .filter((a) => !seen.has(a.id) && (!compatible || compatible(a)))
      .sort((a, b) => b.rating - a.rating)
    const fresh = usedIds ? ranked.filter((a) => !usedIds.has(a.id)) : ranked
    for (const a of rotate(fresh, hashSeed(sectionId))) {
      if (out.length >= min) break
      push(a)
    }
  }

  // 3) Last resort: top-up with titles already used elsewhere (the pool is
  //    exhausted) so the rail still reaches its minimum.
  if (out.length < min) {
    const ranked = [...pool]
      .filter((a) => !seen.has(a.id) && (!compatible || compatible(a)))
      .sort((a, b) => b.rating - a.rating)
    for (const a of rotate(ranked, hashSeed(sectionId))) {
      if (out.length >= min) break
      push(a)
    }
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
    select: (pool) => topRated(pool),
  },
  {
    id: 'trending',
    titleKey: 'sectionTrending',
    subtitleKey: 'sectionTrendingSub',
    select: (pool) => topRated(pool),
  },
  {
    id: 'recently-added',
    titleKey: 'sectionRecentlyAdded',
    subtitleKey: 'sectionRecentlyAddedSub',
    select: (pool) => newest(pool),
  },
  {
    id: 'must-watch',
    titleKey: 'sectionMustWatch',
    subtitleKey: 'sectionMustWatchSub',
    select: (pool) => pool.filter((a) => a.rating >= 8.5).sort((a, b) => b.rating - a.rating),
  },
  {
    id: 'recommended',
    titleKey: 'sectionRecommended',
    subtitleKey: 'sectionRecommendedSub',
    select: (pool) => pool.filter((a) => a.rating >= 8 && a.rating < 9).sort((a, b) => b.rating - a.rating),
  },
  {
    id: 'films',
    titleKey: 'sectionFilms',
    subtitleKey: 'sectionFilmsSub',
    compatible: ofType('movies'),
    select: (pool) => pool.filter((a) => a.type === 'movies'),
  },
  {
    id: 'simulcast',
    titleKey: 'sectionSimulcast',
    subtitleKey: 'sectionSimulcastSub',
    select: (pool) => newest(pool),
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
    select: (pool) => pool.filter((a) => a.rating >= 8.8).sort((a, b) => b.rating - a.rating),
  },
  {
    id: 'editorial',
    titleKey: 'sectionEditorial',
    subtitleKey: 'sectionEditorialSub',
    select: (pool) => topRated(pool),
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
    select: (pool) => topRated(byGenre(pool, ['action', 'drama'])),
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
    select: (pool) => topRated(byGenre(pool, ['sci-fi'])),
  },
  {
    id: 'top10',
    titleKey: 'sectionTop10',
    subtitleKey: 'sectionTop10Sub',
    titleParams: { country: 'France' },
    select: (pool) => topRated(pool),
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
    select: (pool) => newest(pool),
  },
  {
    id: 'new-eps',
    titleKey: 'sectionNewEps',
    subtitleKey: 'sectionNewEpsSub',
    select: (pool) => newest(pool),
  },
  {
    id: 'inspired',
    titleKey: 'sectionInspired',
    subtitleKey: 'sectionInspiredSub',
    compatible: inGenres('slice-of-life', 'drama', 'romance'),
    select: (pool) => topRated(byGenre(pool, ['slice-of-life', 'drama', 'romance'])),
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
        .sort((a, b) => b.rating - a.rating),
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
    select: (pool) => shortest(pool),
  },
  {
    id: 'short',
    titleKey: 'sectionShort',
    subtitleKey: 'sectionShortSub',
    select: (pool) => shortest(pool),
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
    select: (pool) => byGenre(pool, ['mystery']),
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
    select: (pool) => topRated(pool),
  },
  {
    id: 'card-game',
    titleKey: 'sectionCardGame',
    subtitleKey: 'sectionCardGameSub',
    select: (pool) => dedupe([...byGenre(pool, ['sports']), ...byGenre(pool, ['action'])]),
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
    select: (pool) => topRated(byGenre(pool, ['romance', 'drama'])),
  },
  {
    id: 'vf',
    titleKey: 'sectionVF',
    subtitleKey: 'sectionVFSub',
    select: (pool) => topRated(pool),
  },
  {
    id: 'picks',
    titleKey: 'sectionPicks',
    subtitleKey: 'sectionPicksSub',
    select: (pool) => topRated(pool),
  },
  {
    id: 'latest',
    titleKey: 'sectionLatest',
    subtitleKey: 'sectionLatestSub',
    select: (pool) => newest(pool),
  },
]
