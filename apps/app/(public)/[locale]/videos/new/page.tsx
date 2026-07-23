'use client'

import * as React from 'react'
import { use } from 'react'
import Link from 'next/link'
import {
  Bookmark,
  ChevronDown,
  Clock,
  SlidersHorizontal,
  SortAsc,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getRecentlyAdded } from '@/lib/mock-data'
import type { RecentlyAddedItem } from '@/types/anime'

/* -------------------------------------------------------------------------- *
 * Helpers
 * -------------------------------------------------------------------------- */

function useTimeAgo() {
  const t = useTranslations('Public.newVideos')

  return React.useCallback(
    (dateStr: string): string => {
      const now = new Date()
      const date = new Date(dateStr)
      const diffMs = now.getTime() - date.getTime()
      const diffMin = Math.floor(diffMs / 60_000)
      const diffH = Math.floor(diffMin / 60)
      const diffD = Math.floor(diffH / 24)

      if (diffD > 0) {
        return diffD === 1 ? t('timeDays', { count: diffD }) : t('timeDaysPlural', { count: diffD })
      }
      if (diffH > 0) {
        return diffH === 1 ? t('timeHours', { count: diffH }) : t('timeHoursPlural', { count: diffH })
      }
      if (diffMin > 0) {
        return diffMin === 1 ? t('timeMinutes', { count: diffMin }) : t('timeMinutesPlural', { count: diffMin })
      }
      return t('timeJustNow')
    },
    [t],
  )
}

type SortKey = 'recent' | 'title' | 'rating'

/* -------------------------------------------------------------------------- *
 * Card Component
 * -------------------------------------------------------------------------- */

interface NewAnimeCardProps {
  item: RecentlyAddedItem
  bookmarked: boolean
  onToggleBookmark: (animeId: string) => void
}

function NewAnimeCard({ item, bookmarked, onToggleBookmark }: NewAnimeCardProps) {
  const t = useTranslations('Public.newVideos')
  const timeAgo = useTimeAgo()
  const { anime, episode } = item
  const releaseTime = timeAgo(episode.releaseDate)
  const hasSubtitles = episode.tracks && episode.tracks.length > 0

  return (
    <Link
      href={`/anime/${anime.slug}`}
      className="group relative block overflow-hidden rounded-xl border border-border/40 bg-card outline-none transition-all duration-300 hover:-translate-y-1 hover:border-border/80 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Cover Image */}
      <div className="relative aspect-2/3 overflow-hidden">
        <img
          src={anime.cover || '/placeholder.svg'}
          alt={anime.title}
          className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Bookmark button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onToggleBookmark(anime.id)
          }}
          className={cn(
            'absolute right-2 top-2 z-10 flex size-8 items-center justify-center rounded-lg transition-all duration-200',
            bookmarked
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-background/60 text-foreground backdrop-blur-sm opacity-0 group-hover:opacity-100',
          )}
          aria-label={bookmarked ? t('bookmarkRemove') : t('bookmarkAdd')}
        >
          <Bookmark
            className="size-4"
            fill={bookmarked ? 'currentColor' : 'none'}
          />
        </button>

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-300 group-hover:scale-110">
            <svg
              className="size-5 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">
          {anime.title}
        </h3>
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3 shrink-0" aria-hidden="true" />
          <span>{releaseTime}</span>
        </div>
        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground/70">
          {hasSubtitles ? t('subtitled') : t('subtitling')}
        </p>
      </div>
    </Link>
  )
}

/* -------------------------------------------------------------------------- *
 * Filter Dropdown
 * -------------------------------------------------------------------------- */

interface FilterDropdownProps {
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
  onClear: () => void
}

function FilterDropdown({ options, selected, onToggle, onClear }: FilterDropdownProps) {
  const t = useTranslations('Public.newVideos')
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className={cn(
          'gap-1.5 border-border/60 bg-background/50 text-xs font-medium text-muted-foreground hover:bg-background hover:text-foreground',
          selected.length > 0 && 'border-primary/50 text-primary',
        )}
      >
        {t('filterLabel')}
        {selected.length > 0 && (
          <Badge variant="secondary" className="ml-1 size-5 rounded-full p-0 text-[10px]">
            {selected.length}
          </Badge>
        )}
        <ChevronDown className={cn('size-3 transition-transform', open && 'rotate-180')} />
      </Button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-48 overflow-hidden rounded-xl border border-border/60 bg-card shadow-xl">
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => {
                onClear()
                setOpen(false)
              }}
              className="w-full border-b border-border/40 px-3 py-2 text-left text-xs font-medium text-primary hover:bg-muted"
            >
              {t('filterClearAll')}
            </button>
          )}
          <div className="max-h-60 overflow-y-auto p-1">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onToggle(opt)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-muted',
                  selected.includes(opt) && 'text-primary',
                )}
              >
                <span
                  className={cn(
                    'flex size-4 shrink-0 items-center justify-center rounded border transition-colors',
                    selected.includes(opt)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border',
                  )}
                >
                  {selected.includes(opt) && (
                    <svg className="size-3" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2.5 6L5 8.5L9.5 3.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- *
 * Sort Button
 * -------------------------------------------------------------------------- */

interface SortButtonProps {
  current: SortKey
  onChange: (key: SortKey) => void
}

const SORT_KEYS: SortKey[] = ['recent', 'title', 'rating']

function SortButton({ current, onChange }: SortButtonProps) {
  const t = useTranslations('Public.newVideos')
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const sortLabelMap: Record<SortKey, string> = {
    recent: t('sortRecent'),
    title: t('sortTitle'),
    rating: t('sortRating'),
  }

  return (
    <div ref={ref} className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className="gap-1.5 border-border/60 bg-background/50 text-xs font-medium text-muted-foreground hover:bg-background hover:text-foreground"
      >
        <SortAsc className="size-3.5" aria-hidden="true" />
        {sortLabelMap[current]}
        <ChevronDown className={cn('size-3 transition-transform', open && 'rotate-180')} />
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-40 overflow-hidden rounded-xl border border-border/60 bg-card shadow-xl">
          <div className="p-1">
            {SORT_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onChange(key)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted',
                  current === key && 'font-medium text-primary',
                )}
              >
                {sortLabelMap[key]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- *
 * Time Period Tabs
 * -------------------------------------------------------------------------- */

type TimePeriod = '24h' | '7d' | '30d' | 'all'

const TIME_PERIODS: TimePeriod[] = ['24h', '7d', '30d', 'all']

/* -------------------------------------------------------------------------- *
 * Page
 * -------------------------------------------------------------------------- */

export default function NewVideosPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = use(params)
  const t = useTranslations('Public.newVideos')
  const allItems = React.useMemo(() => getRecentlyAdded(), [])

  const [sort, setSort] = React.useState<SortKey>('recent')
  const [timePeriod, setTimePeriod] = React.useState<TimePeriod>('24h')
  const [bookmarks, setBookmarks] = React.useState<Set<string>>(new Set())
  const [genreFilter, setGenreFilter] = React.useState<string[]>([])

  const toggleBookmark = React.useCallback((id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const allGenres = React.useMemo(() => {
    const genreSet = new Set<string>()
    allItems.forEach((item) => {
      item.anime.genres.forEach((g) => genreSet.add(g.name))
    })
    return Array.from(genreSet).sort()
  }, [allItems])

  const filteredItems = React.useMemo(() => {
    let items = [...allItems]

    const now = new Date()
    if (timePeriod !== 'all') {
      const cutoff = new Date(now)
      switch (timePeriod) {
        case '24h':
          cutoff.setHours(cutoff.getHours() - 24)
          break
        case '7d':
          cutoff.setDate(cutoff.getDate() - 7)
          break
        case '30d':
          cutoff.setDate(cutoff.getDate() - 30)
          break
      }
      items = items.filter((item) => new Date(item.episode.releaseDate) >= cutoff)
    }

    if (genreFilter.length > 0) {
      items = items.filter((item) =>
        item.anime.genres.some((g) => genreFilter.includes(g.name)),
      )
    }

    switch (sort) {
      case 'recent':
        items.sort(
          (a, b) =>
            new Date(b.episode.releaseDate).getTime() -
            new Date(a.episode.releaseDate).getTime(),
        )
        break
      case 'title':
        items.sort((a, b) => a.anime.title.localeCompare(b.anime.title))
        break
      case 'rating':
        items.sort((a, b) => b.anime.rating - a.anime.rating)
        break
    }

    return items
  }, [allItems, timePeriod, genreFilter, sort])

  const periodLabelMap: Record<TimePeriod, string> = {
    '24h': t('period24h'),
    '7d': t('period7d'),
    '30d': t('period30d'),
    all: t('periodAll'),
  }

  const resultsCount =
    filteredItems.length === 1
      ? t('resultsCount', { count: filteredItems.length })
      : t('resultsCountPlural', { count: filteredItems.length })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 pt-8 md:px-8">
        <div className="flex flex-col gap-6">
          {/* Title Row */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {t('title')}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {resultsCount}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <SortButton current={sort} onChange={setSort} />
              <FilterDropdown
                options={allGenres}
                selected={genreFilter}
                onToggle={(g) =>
                  setGenreFilter((prev) =>
                    prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g],
                  )
                }
                onClear={() => setGenreFilter([])}
              />
            </div>
          </div>

          {/* Time Period Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {TIME_PERIODS.map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setTimePeriod(period)}
                className={cn(
                  'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  timePeriod === period
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                )}
              >
                {periodLabelMap[period]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <SlidersHorizontal className="size-7 text-muted-foreground" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">
              {t('emptyTitle')}
            </h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {t('emptyDescription')}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setGenreFilter([])
                setTimePeriod('24h')
              }}
            >
              {t('emptyReset')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredItems.map((item) => (
              <NewAnimeCard
                key={item.anime.id}
                item={item}
                bookmarked={bookmarks.has(item.anime.id)}
                onToggleBookmark={toggleBookmark}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
