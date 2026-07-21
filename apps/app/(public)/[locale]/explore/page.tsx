'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  Compass,
  Filter,
  Search,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AnimeCard } from '@/components/kami/anime-card'
import {
  ANIME,
  GENRES,
  getCommunityPicks,
  searchAnime,
} from '@/lib/mock-data'
import type { Anime, AnimeStatus, Studio } from '@/types/anime'
import { cn } from '@/lib/utils'

/* -------------------------------------------------------------------------- *
 * Derived module-scope constants — computed once on first import.
 * -------------------------------------------------------------------------- */
const STUDIOS: Studio[] = Array.from(
  new Map(ANIME.map((a) => [a.studio.id, a.studio])).values(),
)
const YEARS: number[] = Array.from(new Set(ANIME.map((a) => a.year))).sort(
  (a, b) => b - a,
)
const STATUS_VALUES: AnimeStatus[] = [
  'airing',
  'completed',
  'upcoming',
  'hiatus',
]

const SUGGESTIONS = getCommunityPicks().slice(0, 4)
const CURATED = [...ANIME]
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 12)

type TrendingPreset =
  | { kind: 'query'; label: string; value: string }
  | { kind: 'genre'; label: string; id: string }
  | { kind: 'studio'; label: string; id: string }
  | { kind: 'year'; label: string; value: number }

const TRENDING_PRESETS: TrendingPreset[] = [
  { kind: 'genre', label: 'Action', id: 'action' },
  { kind: 'genre', label: 'Romance', id: 'romance' },
  { kind: 'studio', label: 'Studio Aurora', id: 'aurora' },
  { kind: 'year', label: '2024', value: 2024 },
  { kind: 'query', label: 'Isekai', value: 'Isekai' },
  { kind: 'query', label: 'Cyberpunk', value: 'Cyberpunk' },
]

/* Explicit AnimeStatus → translation-key map (avoids fragile template keys). */
const STATUS_LABEL_KEY: Record<AnimeStatus, string> = {
  airing: 'statusAiring',
  completed: 'statusCompleted',
  upcoming: 'statusUpcoming',
  hiatus: 'statusHiatus',
}

/* -------------------------------------------------------------------------- *
 * Page — Suspense boundary for useSearchParams (Next.js 14 client component).
 * -------------------------------------------------------------------------- */
export default function ExplorerPage() {
  return (
    <React.Suspense fallback={<ExplorerSkeleton />}>
      <ExplorerView />
    </React.Suspense>
  )
}

function ExplorerSkeleton() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-3xl px-4 pb-12 pt-20 md:px-8">
        <div className="mx-auto h-8 w-32 animate-pulse rounded-full bg-paper-raised" />
        <div className="mx-auto mt-6 h-10 w-2/3 animate-pulse rounded-md bg-paper-raised" />
        <div className="mt-8 h-14 w-full animate-pulse rounded-full bg-paper-raised" />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- *
 * Client view — search engine UI
 * -------------------------------------------------------------------------- */
function ExplorerView() {
  const t = useTranslations('Public.explorer')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Defaults avoid SSR/CSR mismatch and useSearchParams() returning null on
  // the server. We hydrate from the URL in a one-shot effect after mount.
  const [query, setQuery] = React.useState('')
  const [genres, setGenres] = React.useState<string[]>([])
  const [studios, setStudios] = React.useState<string[]>([])
  const [years, setYears] = React.useState<number[]>([])
  const [status, setStatus] = React.useState<AnimeStatus | 'all'>('all')
  const [sort, setSort] = React.useState<'rating' | 'newest' | 'title'>(
    'rating',
  )
  const [showFilters, setShowFilters] = React.useState(false)
  const hydratedRef = React.useRef(false)

  // One-shot URL → state hydration (deep-links honored, no state→URL echo).
  React.useEffect(() => {
    if (hydratedRef.current || !searchParams) return
    hydratedRef.current = true
    setQuery(searchParams.get('q') ?? '')
    setGenres(searchParams.getAll('genre'))
    setStudios(searchParams.getAll('studio'))
    setYears(
      searchParams
        .getAll('year')
        .map(Number)
        .filter((n) => Number.isFinite(n)),
    )
    const sParam = searchParams.get('status') as AnimeStatus | null
    setStatus(sParam && STATUS_VALUES.includes(sParam) ? sParam : 'all')
  }, [searchParams])

  // Debounced state → URL sync (state is source of truth after hydration).
  React.useEffect(() => {
    if (!hydratedRef.current) return
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    genres.forEach((g) => params.append('genre', g))
    studios.forEach((s) => params.append('studio', s))
    years.forEach((y) => params.append('year', String(y)))
    if (status !== 'all') params.set('status', status)
    const qs = params.toString()
    const url = qs ? `${pathname}?${qs}` : pathname
    const handle = window.setTimeout(() => {
      router.replace(url, { scroll: false })
    }, 400)
    return () => window.clearTimeout(handle)
  }, [query, genres, studios, years, status, pathname, router])

  // Filter + sort pipeline.
  const filtered = React.useMemo(() => {
    let results = query.trim() ? searchAnime(query) : [...ANIME]
    if (genres.length > 0) {
      results = results.filter((a) =>
        a.genres.some((g) => genres.includes(g.id)),
      )
    }
    if (studios.length > 0) {
      results = results.filter((a) => studios.includes(a.studio.id))
    }
    if (years.length > 0) {
      results = results.filter((a) => years.includes(a.year))
    }
    if (status !== 'all') {
      results = results.filter((a) => a.status === status)
    }
    const sorted = [...results]
    switch (sort) {
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        sorted.sort((a, b) => b.year - a.year || b.rating - a.rating)
        break
      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title))
        break
    }
    return sorted
  }, [query, genres, studios, years, status, sort])

  const toggleIn = React.useCallback(
    <T,>(arr: T[], value: T): T[] =>
      arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value],
    [],
  )

  const clearAll = React.useCallback(() => {
    setQuery('')
    setGenres([])
    setStudios([])
    setYears([])
    setStatus('all')
  }, [])

  const applyPreset = React.useCallback((p: TrendingPreset) => {
    setQuery('')
    setGenres([])
    setStudios([])
    setYears([])
    setStatus('all')
    switch (p.kind) {
      case 'query':
        setQuery(p.value)
        break
      case 'genre':
        setGenres([p.id])
        break
      case 'studio':
        setStudios([p.id])
        break
      case 'year':
        setYears([p.value])
        break
    }
  }, [])

  const activeFilterCount =
    genres.length +
    studios.length +
    years.length +
    (status !== 'all' ? 1 : 0)
  const hasFilters = activeFilterCount > 0
  const hasQuery = query.trim().length > 0
  const isSearching = hasQuery || hasFilters

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* HERO — centered, dark gradient, big search input */}
      <section className="relative overflow-hidden border-b border-border/40 pb-12 pt-14 md:pt-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,123,84,0.18),transparent_55%)]"
        />
        <div className="relative mx-auto max-w-3xl px-4 md:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            <Compass className="size-3.5" strokeWidth={2.5} />
            Explore
          </div>
          <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
            {t('heroTitle')}
          </h1>
          <p className="mt-3 text-base text-ink-soft md:text-lg">
            {t('searchHint')}
          </p>

          {/* Big search input — autoFocus only on first mount to avoid hijacking. */}
          <div className="mt-7 relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-ink-soft"
            />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="h-14 rounded-full border-2 border-border bg-paper-raised pl-14 pr-12 text-base shadow-xl shadow-black/20 focus-visible:ring-primary"
              aria-label={t('searchPlaceholder')}
            />
            {hasQuery && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-ink-soft transition-colors hover:bg-ink/10 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label={t('clearSearch')}
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Trending presets — each maps to a real filter or free-text query. */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-ink-soft">
              <TrendingUp className="size-3" />
              {t('trendingTitle')}
            </span>
            {TRENDING_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                className="rounded-full border border-border/60 bg-paper-raised px-3 py-1 text-xs font-medium text-ink-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* STICKY FILTER BAR — toggle expanded panel + quick-pill row */}
      <section className="sticky top-14 z-40 border-b border-border/40 bg-paper/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto px-4 py-3 md:px-8">
          <Button
            variant={showFilters ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setShowFilters((v) => !v)}
            className="shrink-0 gap-2"
            aria-expanded={showFilters}
          >
            <Filter className="size-4" />
            {t('filtersLabel')}
            {hasFilters && (
              <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-ink/30 text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>

          <div className="flex flex-1 items-center gap-1.5 overflow-x-auto">
            {GENRES.slice(0, 8).map((g) => (
              <FilterPill
                key={g.id}
                active={genres.includes(g.id)}
                onClick={() => setGenres((prev) => toggleIn(prev, g.id))}
              >
                {g.name}
              </FilterPill>
            ))}
          </div>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="shrink-0 gap-1 text-xs text-ink-soft"
            >
              <X className="size-3" />
              {t('clearFilters')}
            </Button>
          )}
        </div>
      </section>

      {/* EXPANDED FILTER PANEL — multi-select chips grouped by category */}
      {showFilters && (
        <section className="border-b border-border/40 bg-card/50 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
            <FilterGroup title={t('genresLabel')}>
              {GENRES.map((g) => (
                <FilterPill
                  key={g.id}
                  active={genres.includes(g.id)}
                  onClick={() => setGenres((prev) => toggleIn(prev, g.id))}
                >
                  {g.name}
                </FilterPill>
              ))}
            </FilterGroup>
            <FilterGroup title={t('studiosLabel')}>
              {STUDIOS.map((s) => (
                <FilterPill
                  key={s.id}
                  active={studios.includes(s.id)}
                  onClick={() => setStudios((prev) => toggleIn(prev, s.id))}
                >
                  {s.name}
                </FilterPill>
              ))}
            </FilterGroup>
            <FilterGroup title={t('yearsLabel')}>
              {YEARS.map((y) => (
                <FilterPill
                  key={y}
                  active={years.includes(y)}
                  onClick={() => setYears((prev) => toggleIn(prev, y))}
                >
                  {y}
                </FilterPill>
              ))}
            </FilterGroup>
            <FilterGroup title={t('statusLabel')}>
              <FilterPill
                active={status === 'all'}
                onClick={() => setStatus('all')}
              >
                {t('statusAll')}
              </FilterPill>
              {STATUS_VALUES.map((s) => (
                <FilterPill
                  key={s}
                  active={status === s}
                  onClick={() => setStatus(s)}
                >
                  {t(STATUS_LABEL_KEY[s])}
                </FilterPill>
              ))}
            </FilterGroup>
          </div>
        </section>
      )}

      {/* ACTIVE FILTERS — removable pills */}
      {hasFilters && (
        <section className="mx-auto max-w-7xl px-4 pt-4 md:px-8">
          <div className="flex flex-wrap items-center gap-2">
            {genres.map((id) => {
              const g = GENRES.find((x) => x.id === id)
              if (!g) return null
              return (
                <ActivePill
                  key={`g-${id}`}
                  onRemove={() =>
                    setGenres((prev) => prev.filter((x) => x !== id))
                  }
                >
                  {g.name}
                </ActivePill>
              )
            })}
            {studios.map((id) => {
              const s = STUDIOS.find((x) => x.id === id)
              if (!s) return null
              return (
                <ActivePill
                  key={`s-${id}`}
                  onRemove={() =>
                    setStudios((prev) => prev.filter((x) => x !== id))
                  }
                >
                  {s.name}
                </ActivePill>
              )
            })}
            {years.map((y) => (
              <ActivePill
                key={`y-${y}`}
                onRemove={() => setYears((prev) => prev.filter((x) => x !== y))}
              >
                {y}
              </ActivePill>
            ))}
            {status !== 'all' && (
              <ActivePill onRemove={() => setStatus('all')}>
                {t(STATUS_LABEL_KEY[status as AnimeStatus])}
              </ActivePill>
            )}
          </div>
        </section>
      )}

      {/* RESULTS */}
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-6 md:px-8">
        {!isSearching ? (
          <ExplorerDefault t={t} />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-ink-soft">
                {t('resultsCount', { count: filtered.length })}
              </p>
              <SortControl t={t} sort={sort} onSortChange={setSort} />
            </div>
            {filtered.length === 0 ? (
              <ExplorerEmpty
                t={t}
                onClear={clearAll}
                hasQuery={hasQuery}
              />
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {filtered.map((a) => (
                  <AnimeCard key={a.id} anime={a} showMeta />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}

/* -------------------------------------------------------------------------- *
 * Sub-components
 * -------------------------------------------------------------------------- */
function FilterGroup({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-5 last:mb-0">
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-ink-soft">
        {title}
      </h3>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
        active
          ? 'border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/30'
          : 'border-border bg-paper-raised text-ink-soft hover:-translate-y-0.5 hover:border-primary/40 hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}

function ActivePill({
  onRemove,
  children,
}: {
  onRemove: () => void
  children: React.ReactNode
}) {
  return (
    <Badge
      variant="secondary"
      className="gap-1 pr-1 text-xs font-semibold ring-1 ring-primary/30"
    >
      {children}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove filter"
        className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <X className="size-3" />
      </button>
    </Badge>
  )
}

function SortControl({
  t,
  sort,
  onSortChange,
}: {
  t: ReturnType<typeof useTranslations<'Public.explorer'>>
  sort: 'rating' | 'newest' | 'title'
  onSortChange: (v: 'rating' | 'newest' | 'title') => void
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="font-bold uppercase tracking-wider text-ink-soft">
        {t('sortLabel')}
      </span>
      <div className="flex items-center gap-1 rounded-full border border-border bg-paper-raised p-1">
        {(
          [
            ['rating', t('sortRating')],
            ['newest', t('sortNewest')],
            ['title', t('sortTitle')],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => onSortChange(key)}
            aria-pressed={sort === key}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-bold transition-colors',
              sort === key
                ? 'bg-primary text-primary-foreground'
                : 'text-ink-soft hover:text-ink',
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

function ExplorerEmpty({
  t,
  onClear,
  hasQuery,
}: {
  t: ReturnType<typeof useTranslations<'Public.explorer'>>
  onClear: () => void
  hasQuery: boolean
}) {
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <Search className="size-12 text-ink-soft/40" />
        <h2 className="font-display text-2xl font-bold tracking-tight">
          {t('emptyTitle')}
        </h2>
        <p className="text-sm text-ink-soft">
          {hasQuery ? t('emptyHintQuery') : t('emptyHintFilters')}
        </p>
        <Button onClick={onClear} className="mt-3 gap-2">
          <X className="size-4" />
          {t('emptyClearCta')}
        </Button>
      </div>
      <div>
        <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold tracking-tight">
          <Sparkles className="size-4 text-primary" />
          {t('suggestRailTitle')}
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {SUGGESTIONS.map(({ anime }) => (
            <AnimeCard key={anime.id} anime={anime} showMeta />
          ))}
        </div>
      </div>
    </div>
  )
}

function ExplorerDefault({
  t,
}: {
  t: ReturnType<typeof useTranslations<'Public.explorer'>>
}) {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h2 className="mb-1 font-display text-2xl font-bold tracking-tight md:text-3xl">
          {t('defaultHeading')}
        </h2>
        <p className="text-sm text-ink-soft">{t('defaultSub')}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {CURATED.map((a) => (
          <AnimeCard key={a.id} anime={a} showMeta />
        ))}
      </div>
      <div className="flex flex-col items-center gap-2 text-center text-sm text-ink-soft">
        <p>{t('defaultCtaHint')}</p>
        <Link
          href="/catalog"
          className="font-bold uppercase tracking-wider text-primary transition-opacity hover:opacity-80"
        >
          {t('defaultCta')} →
        </Link>
      </div>
    </div>
  )
}
