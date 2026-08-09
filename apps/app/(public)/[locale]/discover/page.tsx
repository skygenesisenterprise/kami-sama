'use client'

import * as React from 'react'
import { use } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { Bookmark, Check, ChevronLeft, ChevronRight, Play, Plus, ThumbsDown, ThumbsUp } from 'lucide-react'
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
  const { isAuthenticated } = useAuth()
  const isContinueWatching = progressPercent !== undefined
  const tileRef = React.useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = React.useState(false)
  const [isVisible, setIsVisible] = React.useState(false)
  const [cardPosition, setCardPosition] = React.useState<{ top: number; left: number } | null>(null)
  const hoverTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const animationFrameRef = React.useRef<number>(0)

  // Active states for action buttons
  const [isAddedToList, setIsAddedToList] = React.useState(false)
  const [isDisliked, setIsDisliked] = React.useState(false)
  const [isLiked, setIsLiked] = React.useState(false)

  const updateCardPosition = React.useCallback(() => {
    if (tileRef.current) {
      const rect = tileRef.current.getBoundingClientRect()
      setCardPosition({
        top: rect.top,
        left: rect.left + rect.width / 2,
      })
    }
  }, [])

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
      <a
        href={getDomainUrl('main', `/${currentLocale}${getContentPath(anime)}/${anime.slug}`)}
        className="block overflow-hidden rounded-md"
      >
        <div className="relative aspect-video overflow-hidden bg-[#1a1a1a]">
          <img
            src={anime.banner || anime.cover || '/placeholder.jpg'}
            alt={anime.title}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          {badge && (
            <span className="absolute bottom-2 left-2 rounded bg-[#e50914] px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
              {badge}
            </span>
          )}
          {isAuthenticated && !isContinueWatching && (
            <button
              type="button"
              className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:bg-black/80"
              aria-label={t('addToWatchlist', { title: anime.title })}
            >
              <Bookmark className="size-4" aria-hidden="true" />
            </button>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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

              {/* Metadata line - age, season info, episodes */}
              <div className="flex items-center gap-1.5 mb-1.5">
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

              {/* Genre tags */}
              {anime.genres && anime.genres.length > 0 && (
                <p className="text-[10px] text-white/50 mb-1.5 truncate">
                  {anime.genres.slice(0, 3).map(g => g.name).join(' • ')}
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

  /* ── Real auto-rails from the discover algorithm (published catalog). */
  const realSections: DiscoverSectionConfig[] = React.useMemo(() => {
    return (catalogData?.sections ?? [])
      .map((section) => ({
        id: section.id,
        title: section.title,
        href: section.ctaHref || '/catalog',
        subtitle: section.subtitle,
        ctaLabel: section.ctaLabel,
        animes: section.items.map(mapApiItemToAnime).map(enrichMissingMetadata),
      }))
      .filter((section) => section.animes.length > 0)
  }, [catalogData])

  /* ── Real catalog pool : every item served by the public discover API
     (hero + all auto rails), deduplicated. All manual section logic selects
     from this pool so every rail shows real artwork; mock data is used only
     as a fallback when the API is unavailable. */
  const catalogPool: Anime[] = React.useMemo(() => {
    const seen = new Map<string, Anime>()
    for (const anime of [...apiHero, ...realSections.flatMap((s) => s.animes)]) {
      if (!seen.has(anime.id)) seen.set(anime.id, anime)
    }
    const pool = [...seen.values()]
    return pool.length > 0 ? pool : getAllAnime()
  }, [apiHero, realSections])

  /** Whether real catalog data is available (API responded). Personal rails
   *  (continue watching / revoir / watchlist) only render with real data. */
  const hasRealCatalog = apiHero.length > 0 || realSections.length > 0

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
     API has not delivered data. Filled to the 10-item minimum. ─────── */
  const rewatchAnimes = React.useMemo(() => {
    if (!hasRealCatalog) return []
    return fillSectionItems(
      catalogPool,
      catalogPool
        .filter((a) => a.rating >= 8.5)
        .sort((a, b) => b.rating - a.rating),
      'rewatch',
    )
  }, [hasRealCatalog, catalogPool])

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

  /* ── Every content rail is filled to at least MIN_SECTION_ITEMS distinct
     items (thematic selection first, then topped up with the best remaining
     compatible pool titles, rotated per section for variety). Server genre
     rails (`genre-*`) keep their theme via a derived predicate. ────────── */
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
  const filledRealSections: DiscoverSectionConfig[] = React.useMemo(() => {
    return realSections.map((section) => {
      const genreId = section.id.replace(/^genre-/, '').toLowerCase().replace(/\s+/g, '-')
      const compatible =
        section.id.startsWith('genre-') && KNOWN_GENRE_IDS.includes(genreId)
          ? (a: Anime) => a.genres.some((g) => g.id === genreId)
          : undefined
      return {
        ...section,
        animes: fillSectionItems(
          catalogPool,
          section.animes,
          section.id,
          undefined,
          compatible,
        ),
      }
    })
  }, [realSections, catalogPool])

  /* ── Manual curated collections : every discover section from the
     translation keys gets its own data-driven logic (see discover-sections),
     selecting from the real catalog pool, filled to a minimum of 10 items
     (the filler keeps each rail's theme via `def.compatible`). */
  const manualCollections: DiscoverSectionConfig[] = React.useMemo(() => {
    return DISCOVER_SECTION_DEFS.map((def) => ({
      id: def.id,
      title: def.titleParams ? t(def.titleKey, def.titleParams) : t(def.titleKey),
      subtitle: def.subtitleKey ? t(def.subtitleKey) : undefined,
      href: def.href || '/catalog',
      ctaLabel: t('ctaViewAll'),
      animes: fillSectionItems(
        catalogPool,
        def.select(catalogPool),
        def.id,
        undefined,
        def.compatible,
      ),
    })).filter((section) => section.animes.length > 0)
  }, [t, catalogPool])

  /* ── Layout : the page is limited to 10 content sections (real API data
     first, then curated collections), grouped 2 / 3 / 2 / rest, with the
     three default personal rails interleaved. */
  const mappedSections = [...filledRealSections, ...manualCollections].slice(0, 10)
  const groupA = mappedSections.slice(0, 2)
  const groupB = mappedSections.slice(2, 5)
  const groupC = mappedSections.slice(5, 7)
  const rest = mappedSections.slice(7)

  const sections: DiscoverSectionConfig[] = [
    ...groupA,
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
    ...groupB,
    ...groupC,
    ...(isAuthenticated && rewatchAnimes.length > 0
      ? [{
          id: 'rewatch',
          title: t('sectionRewatch'),
          href: '/library',
          subtitle: t('sectionRewatchSub'),
          ctaLabel: t('ctaViewAll'),
          animes: rewatchAnimes,
        }]
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
    ...rest,
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
