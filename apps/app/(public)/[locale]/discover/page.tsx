'use client'

import * as React from 'react'
import { use } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { Check, ChevronLeft, ChevronRight, Play, Plus, Star, ThumbsDown, ThumbsUp } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { HeroBanner } from '@/components/kami/hero-banner'
import {
  getAllAnime,
  getContentPath,
  getEditorialPicks,
} from '@/lib/mock-data'
import {
  discoverApi,
  type ApiWatchProgress,
  type DiscoverCatalogResponse,
} from '@/lib/api/discover'
import { mapApiItemToAnime } from '@/lib/api/discover-adapter'
import { DISCOVER_SECTION_DEFS, fillSectionItems } from '@/lib/discover-sections'
import { getDomainUrl } from '@/lib/domains'
import { useAuth } from '@/context/AuthContext'
import { SERIES_MOCK } from '@/lib/series-catalog-data'
import { MOVIES_MOCK } from '@/lib/movies-catalog-data'
import type { Anime, ContentType, ContinueWatchingItem, Genre } from '@/types/anime'

interface DiscoverSectionConfig {
  id: string
  title: string
  href: string
  subtitle?: string
  ctaLabel?: string
  animes: Anime[]
  isResume?: boolean
}

/** A content section BEFORE it is filled: holds its raw thematic selection
 *  (`animes`) plus an optional compatibility predicate used for the top-up,
 *  so the page can interleave the sources and then fill every rail
 *  sequentially with a shared `usedIds` set (variety between rails). */
interface DiscoverSectionSeed {
  id: string
  title: string
  href: string
  subtitle?: string
  ctaLabel?: string
  animes: Anime[]
  compatible?: (anime: Anime) => boolean
}

/** Server genre rails (`genre-*`) whose theme is recognized: the top-up keeps
 *  only titles carrying that genre id so the rail never drifts off-theme. */
const KNOWN_GENRE_IDS = [
  'fantasy',
  'action',
  'adventure',
  'slice-of-life',
  'sci-fi',
  'supernatural',
  'sports',
  'romance',
  'drama',
  'mystery',
]

interface DiscoverRailProps {
  title: string
  href: string
  subtitle?: string
  ctaLabel?: string
  children: React.ReactNode
}

function DiscoverRail({ title, href, subtitle, ctaLabel, children }: DiscoverRailProps) {
  const t = useTranslations('Public.discover')
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [canScrollRight, setCanScrollRight] = React.useState(false)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const railHref = getDomainUrl('main', href)

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const check = () => {
      setCanScrollLeft(el.scrollLeft > 1)
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    }
    check()

    el.addEventListener('scroll', check, { passive: true })
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', check)
      ro.disconnect()
    }
  }, [])

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' })
  }

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' })
  }

  return (
    <section className="relative py-3 md:py-5">
      <div className="mb-3 flex items-center justify-between gap-4 px-4 md:px-8 xl:px-20">
        <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">{title}</h2>
        {ctaLabel && (
          <a
            href={railHref}
            className="group inline-flex shrink-0 items-center gap-1 text-xs font-semibold uppercase tracking-wide text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {ctaLabel}
            <ChevronRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
          </a>
        )}
      </div>
      <div className="relative group/rail">
        {canScrollLeft && (
          <button
            type="button"
            onClick={scrollLeft}
            className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-linear-to-r from-[#141414] to-transparent flex items-center justify-center opacity-0 group-hover/rail:opacity-100 transition-opacity"
            aria-label={t('railScrollBack')}
          >
            <ChevronLeft className="size-10 text-white" strokeWidth={2} />
          </button>
        )}
        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-4 scroll-pl-4 md:px-8 md:scroll-pl-8 xl:px-20 xl:scroll-pl-20 scrollbar-hide"
        >
          {children}
        </div>
        {canScrollRight && (
          <button
            type="button"
            onClick={scrollRight}
            className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-linear-to-l from-[#141414] to-transparent flex items-center justify-center opacity-0 group-hover/rail:opacity-100 transition-opacity"
            aria-label={t('railScrollMore')}
          >
            <ChevronRight className="size-10 text-white" strokeWidth={2} />
          </button>
        )}
      </div>
    </section>
  )
}

interface DiscoverAnimeTileProps {
  anime: Anime
  currentLocale: string
  badge?: string
  progressPercent?: number
  remainingLabel?: string
  episodeNumber?: number
  episodeTitle?: string
  currentTime?: number
  totalTime?: number
}

function DiscoverAnimeTile({ anime, currentLocale, badge, progressPercent, remainingLabel, episodeNumber, episodeTitle, currentTime, totalTime }: DiscoverAnimeTileProps) {
  const t = useTranslations('Public.discover')
  const isContinueWatching = progressPercent !== undefined
  const tileRef = React.useRef<HTMLDivElement>(null)
  const cardRef = React.useRef<HTMLDivElement>(null)
  // Natural (untransformed) size of the hover card, measured once it is
  // mounted. The card is `w-72` (288px) wide; its height varies with content
  // (title, synopsis…). Used by updateCardPosition to keep the SCALED card
  // inside the viewport without re-measuring the animated DOM.
  const cardSizeRef = React.useRef<{ w: number; h: number }>({ w: 288, h: 400 })
  const [isHovered, setIsHovered] = React.useState(false)
  const [isVisible, setIsVisible] = React.useState(false)
  const [cardPosition, setCardPosition] = React.useState<{ top: number; left: number } | null>(null)
  const hoverTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const animationFrameRef = React.useRef<number>(0)

  // Active states for action buttons
  const [isAddedToList, setIsAddedToList] = React.useState(false)
  const [isDisliked, setIsDisliked] = React.useState(false)
  const [isLiked, setIsLiked] = React.useState(false)

  // Positions the card on the tile and clamps its ANCHOR so the fully
  // rendered card (translateX(-50%) translateY(-8px) scale(1.15), origin
  // "center bottom") stays inside the viewport. The rendered box relative to
  // the anchor (top, left) is:
  //   left' = left - 0.575w · top' = top - 0.15h - 8 · size = 1.15w × 1.15h
  // so clamping the anchor once is enough — no feedback loop. (The old
  // measure-the-rendered-rect approach compared the rendered edge — already
  // shifted by translateX(-50%) — against the anchor value and never
  // converged on edge tiles, re-rendering forever and freezing the card on
  // the first item of a rail.)
  const updateCardPosition = React.useCallback(() => {
    const tile = tileRef.current
    if (!tile) return
    const rect = tile.getBoundingClientRect()
    const { w, h } = cardSizeRef.current
    const margin = 16
    const vw = window.innerWidth
    const vh = window.innerHeight
    const minLeft = margin + 0.575 * w
    const maxLeft = vw - margin - 0.575 * w
    const minTop = margin + 0.15 * h + 8
    const maxTop = vh - margin - h + 8
    setCardPosition({
      top: Math.min(Math.max(rect.top, minTop), maxTop),
      left: Math.min(Math.max(rect.left + rect.width / 2, minLeft), maxLeft),
    })
  }, [])

  // Measure the card's natural size once it is mounted and re-clamp with the
  // real height. offsetWidth/offsetHeight ignore transforms, so the values
  // stay stable while the scale entrance animation runs.
  React.useLayoutEffect(() => {
    if (!isHovered) return
    const el = cardRef.current
    if (!el) return
    const next = { w: el.offsetWidth, h: el.offsetHeight }
    if (next.w !== cardSizeRef.current.w || next.h !== cardSizeRef.current.h) {
      cardSizeRef.current = next
      updateCardPosition()
    }
  }, [isHovered, updateCardPosition])

  const handleMouseEnter = React.useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      updateCardPosition()
      setIsHovered(true)
      // Small delay to ensure DOM is ready, then trigger animation
      animationFrameRef.current = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true)
        })
      })
    }, 400)
  }, [updateCardPosition])

  const handleMouseLeave = React.useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    setIsVisible(false)
    // Delay hiding the card to allow exit animation
    setTimeout(() => {
      setIsHovered(false)
    }, 200)
  }, [])

  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  React.useEffect(() => {
    if (isHovered) {
      const handleScroll = () => updateCardPosition()
      window.addEventListener('scroll', handleScroll, { passive: true })
      window.addEventListener('resize', handleScroll)
      return () => {
        window.removeEventListener('scroll', handleScroll)
        window.removeEventListener('resize', handleScroll)
      }
    }
  }, [isHovered, updateCardPosition])

  return (
    <div
      ref={tileRef}
      className="group relative w-40 shrink-0 snap-start outline-none sm:w-50 lg:w-60 xl:w-70 focus-visible:ring-2 focus-visible:ring-white"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Resume tiles go straight to the watch page (which auto-seeks to the
          saved position); everything else opens the detail page. */}
      <a
        href={
          isContinueWatching
            ? getDomainUrl('main', `/${currentLocale}/watch/${anime.slug}`)
            : getDomainUrl('main', `/${currentLocale}${getContentPath(anime)}/${anime.slug}`)
        }
        className="block overflow-hidden rounded-md"
      >
        <div className="relative aspect-video overflow-hidden bg-[#1a1a1a]">
          <img
            src={anime.banner || anime.cover || '/placeholder.jpg'}
            alt={anime.title}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
          />
          {/* Permanent bottom gradient so the resting title stays readable. */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
          {badge && (
            <span className="absolute bottom-2 left-2 rounded bg-[#e50914] px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
              {badge}
            </span>
          )}
          {/* Title always visible at the bottom-left of the frame (at rest). */}
          <div className="absolute inset-x-0 bottom-0 p-3 text-left">
            <h3 className="line-clamp-2 text-sm font-bold leading-tight text-white drop-shadow-md">
              {anime.title}
            </h3>
          </div>
        </div>
      </a>

      {/* Progress bar below thumbnail for Continue Watching items - 80% centered */}
      {isContinueWatching && progressPercent !== undefined && (
        <div className="mt-1.5 px-[10%]">
          <div className="h-0.75 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-[#e50914] transition-[width] duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Netflix-style hover card - rendered via Portal, overlays the item */}
      {isHovered && cardPosition && typeof window !== 'undefined' && createPortal(
        <div
          ref={cardRef}
          className="fixed z-9999 pointer-events-auto"
          style={{
            top: `${cardPosition.top}px`,
            left: `${cardPosition.left}px`,
            transform: isVisible
              ? 'translateX(-50%) translateY(-8px) scale(1.15)'
              : 'translateX(-50%) translateY(0px) scale(1)',
            transformOrigin: 'center bottom',
            opacity: isVisible ? 1 : 0,
            transition: 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease-out',
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="w-72 rounded-lg bg-[#181818] shadow-[0_8px_40px_rgba(0,0,0,0.9)] overflow-hidden border border-white/8">
            {/* Banner image area */}
            <div className="relative aspect-video bg-void">
              <img
                src={anime.banner || anime.cover || '/placeholder.jpg'}
                alt={anime.title}
                className="size-full object-cover"
              />
              {/* Gradient overlay at bottom for smooth transition */}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-[#181818] to-transparent" />
            </div>

            {/* Content area - separated from image */}
            <div className="px-4 pb-3 pt-2">
              {/* Title block — the resting tile shows the title at the
                  bottom, the hover card carries it too so the user always
                  knows what they are looking at. */}
              <h3 className="mb-1 line-clamp-2 text-base font-bold leading-tight text-white">
                {anime.title}
              </h3>
              {anime.japaneseTitle && anime.japaneseTitle !== anime.title && (
                <p className="mb-2 truncate text-[10px] text-white/40">{anime.japaneseTitle}</p>
              )}

              {/* Play button + Action buttons row */}
              <div className="flex items-center gap-2 mb-2.5">
                {/* Play button */}
                <a
                  href={getDomainUrl('main', `/${currentLocale}/watch/${anime.slug}`)}
                  className="flex size-8 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-110 shadow-md"
                >
                  <Play className="size-3.5 fill-current ml-0.5" />
                </a>

                {/* Action buttons */}
                <button
                  type="button"
                  onClick={() => setIsAddedToList(!isAddedToList)}
                  className={`flex size-7 items-center justify-center rounded-full border-[1.5px] transition-all hover:scale-110 ${
                    isAddedToList
                      ? 'border-white bg-white text-black'
                      : 'border-white/40 text-white/70 hover:border-white hover:text-white'
                  }`}
                  aria-label={isAddedToList ? t('removeFromList', { title: anime.title }) : t('addToList', { title: anime.title })}
                >
                  {isAddedToList ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsDisliked(!isDisliked); if (isLiked) setIsLiked(false) }}
                  className={`flex size-7 items-center justify-center rounded-full border-[1.5px] transition-all hover:scale-110 ${
                    isDisliked
                      ? 'border-white bg-white text-black'
                      : 'border-white/40 text-white/70 hover:border-white hover:text-white'
                  }`}
                  aria-label={isDisliked ? t('removeDislike') : t('notInterested')}
                >
                  <ThumbsDown className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => { setIsLiked(!isLiked); if (isDisliked) setIsDisliked(false) }}
                  className={`flex size-7 items-center justify-center rounded-full border-[1.5px] transition-all hover:scale-110 ${
                    isLiked
                      ? 'border-white bg-white text-black'
                      : 'border-white/40 text-white/70 hover:border-white hover:text-white'
                  }`}
                  aria-label={isLiked ? t('removeLike') : t('like')}
                >
                  <ThumbsUp className="size-3.5" />
                </button>
                <a
                  href={getDomainUrl('main', `/${currentLocale}${getContentPath(anime)}/${anime.slug}`)}
                  className="ml-auto flex size-7 items-center justify-center rounded-full border-[1.5px] border-white/40 text-white/70 transition-all hover:border-white hover:text-white hover:scale-110"
                  aria-label={t('episodesAndInfo')}
                >
                  <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </a>
              </div>

              {/* Metadata line - rating, year, age, season info, episodes */}
              <div className="flex items-center gap-1.5 mb-1.5">
                {anime.rating > 0 && (
                  <span className="flex items-center gap-0.5 text-[10px] font-semibold text-white/90">
                    <Star className="size-3 fill-[#e50914] text-[#e50914]" aria-hidden="true" />
                    {t('ratingValue', { value: anime.rating.toFixed(1) })}
                  </span>
                )}
                {anime.year > 0 && (
                  <span className="text-[10px] text-white/60">{anime.year}</span>
                )}
                {anime.ageRating && (
                  <span className="rounded border border-white/40 px-1 py-px text-[9px] font-bold text-white/80 leading-none">
                    {anime.ageRating}
                  </span>
                )}
                {isContinueWatching && episodeNumber && (
                  <span className="text-[10px] text-white/60">
                    {t('seasonOne')}
                  </span>
                )}
                {!isContinueWatching && anime.seasons && anime.seasons.length > 0 && (
                  <span className="text-[10px] text-white/60">
                    {anime.seasons.length === 1 ? t('seasonCount', { count: anime.seasons.length }) : t('seasonCountPlural', { count: anime.seasons.length })}
                  </span>
                )}
                {anime.totalEpisodes > 0 && (
                  <span className="text-[10px] text-white/60">
                    {t('episodeCount', { count: anime.totalEpisodes })}
                  </span>
                )}
              </div>

              {/* Studio */}
              {anime.studio && anime.studio.name && (
                <p className="mb-1.5 truncate text-[10px] text-white/50">
                  <span className="text-white/40">{t('studioLabel')} :</span>{' '}
                  <span className="text-white/70">{anime.studio.name}</span>
                </p>
              )}

              {/* Synopsis - clamp to 3 lines so the card stays compact */}
              {anime.synopsis && (
                <p className="mb-1.5 line-clamp-3 text-[10px] leading-relaxed text-white/50">
                  {anime.synopsis}
                </p>
              )}

              {/* Genre tags */}
              {anime.genres && anime.genres.length > 0 && (
                <p className="text-[10px] text-white/50 mb-1.5 truncate">
                  {anime.genres.map(g => g.name).join(' • ')}
                </p>
              )}

              {/* Progress bar - only for Continue Watching */}
              {isContinueWatching && progressPercent !== undefined && (
                <div className="relative h-0.75 w-full overflow-hidden rounded-full bg-white/20 mb-1.5">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-[#e50914]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}

              {/* Time info - only for Continue Watching */}
              {isContinueWatching && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/50">{remainingLabel}</span>
                  {currentTime && totalTime && (
                    <span className="text-[10px] text-white/50">{t('timeSur', { current: currentTime, total: totalTime })}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

/** Known local content — mock catalog + admin catalogs (series & movies) —
 *  used to fill metadata (genres, age rating, year, images) that the public
 *  discover endpoint may not have populated for a given item. */
interface KnownContent {
  slug: string
  title: string
  type: ContentType
  genres: Genre[]
  ageRating: string
  year: number
  cover: string
  banner: string
}

function toGenre(name: string): Genre {
  return { id: name.toLowerCase().replace(/\s+/g, '-'), name }
}

const KNOWN_CATALOG: KnownContent[] = (() => {
  const out: KnownContent[] = []
  const seen = new Set<string>()
  const push = (entry: KnownContent) => {
    if (seen.has(entry.slug)) return
    seen.add(entry.slug)
    out.push(entry)
  }
  for (const a of getAllAnime()) {
    push({
      slug: a.slug,
      title: a.title,
      type: a.type,
      genres: a.genres,
      ageRating: a.ageRating,
      year: a.year,
      cover: a.cover,
      banner: a.banner,
    })
  }
  for (const s of SERIES_MOCK) {
    push({
      slug: s.slug,
      title: s.title,
      type: 'series',
      genres: s.genres.map(toGenre),
      ageRating: s.ageRating,
      year: s.year,
      cover: s.assets.poster,
      banner: s.assets.banner,
    })
  }
  for (const m of MOVIES_MOCK) {
    push({
      slug: m.slug,
      title: m.title,
      type: 'movies',
      genres: m.genres.map(toGenre),
      ageRating: m.ageRating,
      year: m.year,
      cover: m.assets.poster,
      banner: m.assets.banner,
    })
  }
  return out
})()

/**
 * Fills missing metadata (genres, age rating, year, banner) on API items from
 * the known local catalog, matched by slug or title. The discover endpoint can
 * return items without genres/age populated (e.g. AniList imports), which
 * would leave the hero metadata showing only type and year.
 */
function enrichMissingMetadata(item: Anime): Anime {
  const normalize = (s: string) => s.toLowerCase().trim()
  const known = KNOWN_CATALOG.find(
    (k) => k.slug === item.slug || normalize(k.title) === normalize(item.title),
  )
  if (!known) return item
  return {
    ...item,
    genres: item.genres.length > 0 ? item.genres : known.genres,
    ageRating: item.ageRating || known.ageRating,
    year: item.year || known.year,
    banner: item.banner || known.banner,
    cover: item.cover || known.cover,
  }
}

/**
 * Reads the user's bookmarked anime ids from localStorage (same key as the
 * /watchlist page) so the discover watchlist rail reflects real bookmarks.
 */
function useWatchlistBookmarks() {
  const [bookmarkedIds, setBookmarkedIds] = React.useState<Set<string>>(new Set())

  React.useEffect(() => {
    const read = () => {
      try {
        const stored = localStorage.getItem('kami-watchlist')
        setBookmarkedIds(new Set(stored ? (JSON.parse(stored) as string[]) : []))
      } catch {
        setBookmarkedIds(new Set())
      }
    }
    read()
    window.addEventListener('storage', read)
    return () => window.removeEventListener('storage', read)
  }, [])

  return { bookmarkedIds }
}

/**
 * Maps a real watch-progress record to the frontend ContinueWatchingItem,
 * resolving the anime against the catalog pool. Returns null when the anime
 * is unknown (item is skipped rather than shown with placeholder data).
 */
function mapWatchProgressToContinueWatching(
  progress: ApiWatchProgress,
  pool: Anime[],
): ContinueWatchingItem | null {
  const anime = pool.find((a) => a.id === progress.animeId)
  if (!anime || progress.percentage <= 0) return null
  const remaining = Math.round(
    (progress.duration * (100 - progress.percentage)) / 100 / 60,
  )
  return {
    anime,
    // The watch endpoint does not return season/episode numbers, so the
    // episode is built from the progress record for display purposes only.
    episode: {
      id: progress.episodeId,
      animeId: progress.animeId,
      season: 1,
      number: 1,
      title: `Épisode ${progress.episodeId.slice(-2)}`,
      thumbnail: anime.cover,
      cover: anime.banner,
      videoUrl: '',
      tracks: [],
      duration: progress.duration,
      releaseDate: progress.lastWatched,
      progress: progress.progress,
    },
    progressPercent: Math.round(progress.percentage),
    remainingLabel: `${remaining}m restantes`,
  }
}

/**
 * Interleaves the auto rails from the discover algorithm with the curated
 * collections (alternating sources) so BOTH stay visible on the page, capped
 * at `max`. When one source runs out, the remaining slots go to the other.
 * Returns RAW seeds (unfilled) so the caller can then fill every rail
 * sequentially with a shared used-ids set — see fillSectionItems.
 */
function interleaveSections(
  apiSections: DiscoverSectionSeed[],
  manualSections: DiscoverSectionSeed[],
  max: number,
): DiscoverSectionSeed[] {
  const out: DiscoverSectionSeed[] = []
  const takeApi = apiSections.length > 0
  const takeManual = manualSections.length > 0
  let i = 0
  let j = 0
  // Round-robin: API first, then manual, alternating until one source is
  // exhausted; the winner then fills the remaining slots. Stops at `max`.
  while (out.length < max && (i < apiSections.length || j < manualSections.length)) {
    if (takeApi && i < apiSections.length) {
      out.push(apiSections[i++])
    }
    if (out.length >= max) break
    if (takeManual && j < manualSections.length) {
      out.push(manualSections[j++])
    }
  }
  return out
}

export default function DiscoverPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = use(params)
  const pathname = usePathname()
  const currentLocale = locale || pathname?.split('/')[1] || 'fr'
  const { isAuthenticated, user } = useAuth()
  const t = useTranslations('Public.discover')
  const username = user?.displayName || ''

  /* ── Real data : hero + auto rails from the discover algorithm, when
     available; manual fallbacks otherwise. The page never blocks on the
     network and never renders an empty state. */
  const [catalogData, setCatalogData] = React.useState<DiscoverCatalogResponse | null>(null)
  const [apiHero, setApiHero] = React.useState<Anime[]>([])
  React.useEffect(() => {
    let cancelled = false
    discoverApi
      .catalog()
      .then((catalog) => {
        if (cancelled) return
        setCatalogData(catalog)
        setApiHero(catalog.hero.map(mapApiItemToAnime).map(enrichMissingMetadata))
      })
      .catch(() => {
        // API unavailable — manual hero + collections are used instead.
      })
    return () => {
      cancelled = true
    }
  }, [])

  const heroItems = apiHero.length > 0 ? apiHero.slice(0, 5) : getEditorialPicks().slice(0, 5)

  /* ── Real auto-rails from the discover algorithm (published catalog):
     RAW seeds (unfilled), carrying the API's thematic selection + a derived
     genre predicate so the top-up keeps each rail's theme. The page fills
     them sequentially later with a shared used-ids set (variety). */
  const realSeeds: DiscoverSectionSeed[] = React.useMemo(() => {
    return (catalogData?.sections ?? [])
      .map((section) => {
        const genreId = section.id.replace(/^genre-/, '').toLowerCase().replace(/\s+/g, '-')
        const compatible =
          section.id.startsWith('genre-') && KNOWN_GENRE_IDS.includes(genreId)
            ? (a: Anime) => a.genres.some((g) => g.id === genreId)
            : undefined
        return {
          id: section.id,
          title: section.title,
          href: section.ctaHref || '/catalog',
          subtitle: section.subtitle,
          ctaLabel: section.ctaLabel,
          animes: section.items.map(mapApiItemToAnime).map(enrichMissingMetadata),
          compatible,
        }
      })
      .filter((section) => section.animes.length > 0)
  }, [catalogData])

  /* ── Real catalog pool : every item served by the public discover API
     (hero + all auto rails), deduplicated. All manual section logic selects
     from this pool so every rail shows real artwork; mock data is used only
     as a fallback when the API is unavailable. */
  const catalogPool: Anime[] = React.useMemo(() => {
    const seen = new Map<string, Anime>()
    for (const anime of [...apiHero, ...realSeeds.flatMap((s) => s.animes)]) {
      if (!seen.has(anime.id)) seen.set(anime.id, anime)
    }
    const pool = [...seen.values()]
    return pool.length > 0 ? pool : getAllAnime()
  }, [apiHero, realSeeds])

  /** Whether real catalog data is available (API responded). Personal rails
   *  (continue watching / revoir / watchlist) only render with real data. */
  const hasRealCatalog = apiHero.length > 0 || realSeeds.length > 0

  /* ── Continue watching : real watch progress from the authenticated
     /watch/continue endpoint. No mock fallback — the rail stays hidden
     when the user has no in-progress titles. ─────────────────────── */
  const [continueWatching, setContinueWatching] = React.useState<ContinueWatchingItem[]>([])
  React.useEffect(() => {
    if (!isAuthenticated || !hasRealCatalog) {
      setContinueWatching([])
      return
    }
    let cancelled = false
    discoverApi
      .continueWatching(5)
      .then((res) => {
        if (cancelled) return
        setContinueWatching(
          res.items
            .map((p) => mapWatchProgressToContinueWatching(p, catalogPool))
            .filter((x): x is ContinueWatchingItem => x !== null)
            .slice(0, 5),
        )
      })
      .catch(() => {
        if (!cancelled) setContinueWatching([])
      })
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, hasRealCatalog, catalogPool])

  /* ── Revoir : best rated titles worth revisiting, from the real catalog
     pool only. No mock library fallback — the rail stays hidden when the
     API has not delivered data. Kept as a RAW seed: it joins the sequential
     fill so it avoids titles the content rails already show. ──────── */
  const rewatchSeed: DiscoverSectionSeed | null = React.useMemo(() => {
    if (!hasRealCatalog) return null
    return {
      id: 'rewatch',
      title: t('sectionRewatch'),
      href: '/library',
      subtitle: t('sectionRewatchSub'),
      ctaLabel: t('ctaViewAll'),
      animes: catalogPool
        .filter((a) => a.rating >= 8.5)
        .sort((a, b) => b.rating - a.rating),
    }
  }, [hasRealCatalog, catalogPool, t])

  /* ── Watchlist : real bookmarks from the pool only. No fallback to
     upcoming/mock titles — the rail stays hidden when the user has not
     bookmarked anything (or the API has not delivered data). ─────── */
  const { bookmarkedIds } = useWatchlistBookmarks()
  const watchlistAnimes = React.useMemo(() => {
    if (!hasRealCatalog) return []
    return [...bookmarkedIds]
      .map((id) => catalogPool.find((a) => a.id === id))
      .filter((a): a is Anime => Boolean(a))
  }, [hasRealCatalog, bookmarkedIds, catalogPool])

  /* ── Manual curated collections : every discover section from the
     translation keys gets its own data-driven logic (see discover-sections),
     selecting from the real catalog pool. RAW seeds (unfilled) — they join
     the sequential fill below. */
  const manualSeeds: DiscoverSectionSeed[] = React.useMemo(() => {
    return DISCOVER_SECTION_DEFS.map((def) => ({
      id: def.id,
      title: def.titleParams ? t(def.titleKey, def.titleParams) : t(def.titleKey),
      subtitle: def.subtitleKey ? t(def.subtitleKey) : undefined,
      href: def.href || '/catalog',
      ctaLabel: t('ctaViewAll'),
      animes: def.select(catalogPool),
      compatible: def.compatible,
    })).filter((section) => section.animes.length > 0)
  }, [t, catalogPool])

  /* ── Layout + variety : the page is limited to 12 content sections. The
     auto rails and the curated collections are INTERLEAVED (first API, then
     manual, then API…) so both sources always get airtime. The interleaved
     seeds are then filled SEQUENTIALLY with a shared used-ids set: each rail
     prefers titles no other rail shows yet, so the same top-rated titles are
     not repeated in every section (see fillSectionItems). The "revoir" rail
     joins the same pass in its display position. Personal rails (continue
     watching / watchlist) are inserted after, untouched. Grouped
     2 / 3 / 2 / rest, with the personal rails interleaved. */
  const builtSections: {
    groupA: DiscoverSectionConfig[]
    groupB: DiscoverSectionConfig[]
    groupC: DiscoverSectionConfig[]
    rewatch: DiscoverSectionConfig | null
    rest: DiscoverSectionConfig[]
  } = React.useMemo(() => {
    const orderedSeeds = interleaveSections(realSeeds, manualSeeds, 12)
    const usedIds = new Set<string>()
    // Fills one seed and records every retained id so the next rails avoid
    // repeating the same titles. A seed is dropped when the pool cannot
    // satisfy it (should not happen with real data — the filler always
    // reaches MIN_SECTION_ITEMS when enough compatible titles exist).
    const fill = (seed: DiscoverSectionSeed): DiscoverSectionConfig | null => {
      const animes = fillSectionItems(
        catalogPool,
        seed.animes,
        seed.id,
        undefined,
        seed.compatible,
        undefined,
        usedIds,
      )
      for (const a of animes) usedIds.add(a.id)
      if (animes.length === 0) return null
      return {
        id: seed.id,
        title: seed.title,
        href: seed.href,
        subtitle: seed.subtitle,
        ctaLabel: seed.ctaLabel,
        animes,
      }
    }

    const groupA = orderedSeeds.slice(0, 2).map(fill).filter((s): s is DiscoverSectionConfig => s !== null)
    const groupB = orderedSeeds.slice(2, 5).map(fill).filter((s): s is DiscoverSectionConfig => s !== null)
    const groupC = orderedSeeds.slice(5, 7).map(fill).filter((s): s is DiscoverSectionConfig => s !== null)
    const rest = orderedSeeds.slice(7).map(fill).filter((s): s is DiscoverSectionConfig => s !== null)
    const rewatch = rewatchSeed ? fill(rewatchSeed) : null
    return { groupA, groupB, groupC, rewatch, rest }
  }, [realSeeds, manualSeeds, rewatchSeed, catalogPool])

  const sections: DiscoverSectionConfig[] = [
    ...builtSections.groupA,
    ...(isAuthenticated && username && continueWatching.length > 0
      ? [{
          id: 'continue-watching',
          title: t('sectionResumeUsername', { username }),
          href: '/library',
          subtitle: t('sectionResumeSub'),
          animes: continueWatching.map((item) => item.anime),
          isResume: true,
        }]
      : []),
    ...builtSections.groupB,
    ...builtSections.groupC,
    ...(isAuthenticated && builtSections.rewatch
      ? [builtSections.rewatch]
      : []),
    ...(isAuthenticated && watchlistAnimes.length > 0
      ? [{
          id: 'watchlist',
          title: t('sectionWatchlist'),
          href: '/library',
          subtitle: t('sectionWatchlistSub'),
          ctaLabel: t('sectionWatchlistCta'),
          animes: watchlistAnimes,
        }]
      : []),
    ...builtSections.rest,
  ]

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#141414] pb-16 text-white select-none">
      <HeroBanner items={heroItems} />

      <main id="main-content" className="relative z-10 pb-12">
        {sections.map((section) =>
          section.isResume ? (
            <DiscoverRail key={section.id} title={section.title} href={section.href} subtitle={section.subtitle}>
              {continueWatching.map((item) => (
                <DiscoverAnimeTile
                  key={`reprendre-${item.anime.id}`}
                  anime={item.anime}
                  currentLocale={currentLocale}
                  progressPercent={item.progressPercent}
                  remainingLabel={item.remainingLabel}
                  episodeNumber={item.episode.number}
                  episodeTitle={item.episode.title}
                  currentTime={item.episode.progress ? Math.round(item.episode.progress / 60) : undefined}
                  totalTime={item.episode.duration ? Math.round(item.episode.duration / 60) : undefined}
                />
              ))}
            </DiscoverRail>
          ) : (
            <DiscoverRail
              key={section.id}
              title={section.title}
              href={section.href}
              subtitle={section.subtitle}
              ctaLabel={section.ctaLabel}
            >
              {section.animes.map((anime) => (
                <DiscoverAnimeTile key={`${section.id}-${anime.id}`} anime={anime} currentLocale={currentLocale} />
              ))}
            </DiscoverRail>
          ),
        )}
      </main>

      <section className="flex flex-col items-center gap-5 px-4 py-16 text-center md:px-8">
        <p className="max-w-md font-display text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl">
          {t('ctaLooking')}<br />
          {t('ctaDiscover')}
        </p>
        <Button
          asChild
          className="h-10 rounded-sm bg-white px-5 text-xs font-semibold uppercase text-black transition-colors duration-200 hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414]"
        >
          <a href={getDomainUrl('main', '/catalog')}>{t('ctaViewAll')}</a>
        </Button>
      </section>
    </div>
  )
}
