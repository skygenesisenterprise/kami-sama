'use client'

import * as React from 'react'
import { use } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  Clock,
  History,
  Play,
  ChevronRight,
  Trash2,
  Filter,
  Calendar,
  Film,
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { getWatchHistory, type WatchHistoryItem } from '@/lib/mock-history'
import { cn } from '@/lib/utils'

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return "à l'instant"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `il y a ${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'hier'
  if (days < 7) return `il y a ${days}j`
  const weeks = Math.floor(days / 7)
  return `il y a ${weeks}sem`
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}min ${s.toString().padStart(2, '0')}s`
}

function formatDateShort(dateStr: string, locale: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    day: 'numeric',
    month: 'short',
  })
}

/** Group watch history items by time period. */
function groupByTimePeriod(items: WatchHistoryItem[]): {
  label: string
  items: WatchHistoryItem[]
}[] {
  const now = Date.now()
  const day = 86_400_000

  const groups: Record<string, WatchHistoryItem[]> = {
    today: [],
    yesterday: [],
    thisWeek: [],
    earlier: [],
  }

  for (const item of items) {
    const diff = now - new Date(item.watchedAt).getTime()
    if (diff < day) {
      groups.today.push(item)
    } else if (diff < 2 * day) {
      groups.yesterday.push(item)
    } else if (diff < 7 * day) {
      groups.thisWeek.push(item)
    } else {
      groups.earlier.push(item)
    }
  }

  return [
    { label: "Aujourd'hui", items: groups.today },
    { label: 'Hier', items: groups.yesterday },
    { label: 'Cette semaine', items: groups.thisWeek },
    { label: 'Plus tôt', items: groups.earlier },
  ].filter((g) => g.items.length > 0)
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                             */
/* -------------------------------------------------------------------------- */

/** Single watch history card — horizontal layout like Netflix's continue watching. */
function HistoryCard({
  item,
  locale,
  index,
}: {
  item: WatchHistoryItem
  locale: string
  index: number
}) {
  const { anime, episode, progressPercent, watchedAt, watchDuration } = item
  const remainingSec = Math.round(watchDuration * (1 - progressPercent / 100))
  const isCompleted = progressPercent >= 95

  return (
    <Link
      href={`/watch/${anime.slug}?ep=${episode.id}`}
      className="group relative flex gap-4 rounded-xl border border-white/5 bg-white/3 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.07] focus-visible:ring-2 focus-visible:ring-white/30"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Thumbnail */}
      <div className="relative h-28 w-44 shrink-0 overflow-hidden rounded-lg bg-white/5 sm:h-32 sm:w-52">
        <img
          src={episode.thumbnail || anime.cover || '/placeholder.svg'}
          alt={`${anime.title} – E${episode.number}`}
          className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex size-11 items-center justify-center rounded-full bg-red-600 shadow-lg shadow-red-600/40 transition-transform duration-300 group-hover:scale-110">
            <Play className="size-5 fill-current text-white" />
          </span>
        </div>

        {/* Duration badge */}
        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
          {Math.round(watchDuration / 60)}min
        </span>

        {/* Completed badge */}
        {isCompleted && (
          <span className="absolute top-1.5 left-1.5 rounded bg-emerald-500/90 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
            ✓ Terminé
          </span>
        )}

        {/* Progress bar at bottom */}
        <div className="absolute inset-x-0 bottom-0">
          <Progress
            value={progressPercent}
            className="h-1 rounded-none bg-white/20 [&>div]:bg-red-500"
          />
        </div>
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div className="min-w-0">
          {/* Anime title */}
          <p className="truncate text-sm font-bold text-white">{anime.title}</p>

          {/* Episode info */}
          <p className="mt-0.5 text-xs text-white/50">
            S{episode.season} · Épisode {episode.number} – {episode.title}
          </p>

          {/* Genres */}
          <p className="mt-1 line-clamp-1 text-[11px] text-white/30">
            {anime.genres
              .slice(0, 3)
              .map((g) => g.name)
              .join(' · ')}
          </p>
        </div>

        {/* Bottom row: progress + time */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-white/40">
            {timeAgo(watchedAt)}
          </span>
          {!isCompleted && (
            <span className="text-[11px] text-red-400/80">
              {remainingSec > 0
                ? `${Math.ceil(remainingSec / 60)}min restant${Math.ceil(remainingSec / 60) > 1 ? 's' : ''}`
                : 'Terminé'}
            </span>
          )}
          <span className="ml-auto text-[11px] text-white/30">
            {progressPercent}% vu
          </span>
        </div>
      </div>

      {/* Quick action: remove from history */}
      <button
        type="button"
        className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-lg bg-black/50 text-white/40 opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-red-500/80 hover:text-white"
        aria-label="Retirer de l'historique"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <Trash2 className="size-3.5" />
      </button>
    </Link>
  )
}

/** Time period group section. */
function TimeGroup({
  label,
  items,
  locale,
}: {
  label: string
  items: WatchHistoryItem[]
  locale: string
}) {
  return (
    <div className="space-y-3">
      {/* Group header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-white/40" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white/60">
            {label}
          </h2>
        </div>
        <div className="h-px flex-1 bg-white/5" />
        <span className="text-xs text-white/25">{items.length} épisode{items.length > 1 ? 's' : ''}</span>
      </div>

      {/* Cards grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item, i) => (
          <HistoryCard key={item.id} item={item} locale={locale} index={i} />
        ))}
      </div>
    </div>
  )
}

/** Quick stats row. */
function StatsRow({ items }: { items: WatchHistoryItem[] }) {
  const totalTime = items.reduce((sum, i) => sum + i.watchDuration, 0)
  const completed = items.filter((i) => i.progressPercent >= 95).length
  const inProgress = items.filter(
    (i) => i.progressPercent > 0 && i.progressPercent < 95,
  ).length
  const uniqueAnime = new Set(items.filter((i) => i.anime).map((i) => i.anime.id)).size

  const stats = [
    {
      icon: <Film className="size-4" />,
      label: 'Anime',
      value: uniqueAnime,
    },
    {
      icon: <Play className="size-4" />,
      label: 'Épisodes',
      value: items.length,
    },
    {
      icon: <Clock className="size-4" />,
      label: 'Temps total',
      value: `${Math.round(totalTime / 60)}min`,
    },
    {
      icon: <History className="size-4" />,
      label: 'Terminés',
      value: completed,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/3 px-4 py-3"
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-white/5 text-white/50">
            {stat.icon}
          </div>
          <div>
            <p className="text-lg font-bold text-white">{stat.value}</p>
            <p className="text-[11px] text-white/40">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function HistoryPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = use(params)
  const t = useTranslations('Public.history')

  const [items] = React.useState(() =>
    getWatchHistory().filter((i) => i.anime && i.episode),
  )
  const [filter, setFilter] = React.useState<'all' | 'completed' | 'in-progress'>('all')

  React.useEffect(() => {
    document.title = 'Kami-Sama: Historique'
  }, [])

  const filteredItems = React.useMemo(() => {
    switch (filter) {
      case 'completed':
        return items.filter((i) => i.progressPercent >= 95)
      case 'in-progress':
        return items.filter((i) => i.progressPercent < 95)
      default:
        return items
    }
  }, [items, filter])

  const groups = React.useMemo(() => groupByTimePeriod(filteredItems), [filteredItems])

  return (
    <div className="min-h-screen bg-[#141414] text-white select-none">
      {/* ── Hero Section ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-red-600/15 via-[#141414] to-[#141414]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(229,9,20,0.12),transparent_50%)]" />

        <div className="relative mx-auto max-w-5xl px-4 pt-20 pb-8 md:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              {/* Badge */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white/60 backdrop-blur-sm">
                <History className="size-3.5" />
                {t('badge')}
              </div>

              {/* Title */}
              <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                {t('title')}
              </h1>
              <p className="mt-2 max-w-lg text-sm text-white/50 md:text-base">
                {t('subtitle')}
              </p>
            </div>

            {/* Quick stats */}
            <div className="shrink-0">
              <StatsRow items={items} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="sticky top-14 z-40 border-b border-white/5 bg-[#141414]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 md:px-8">
          <Filter className="size-4 text-white/40" />
          <div className="flex gap-2">
            {[
              { key: 'all' as const, label: t('filterAll') },
              { key: 'in-progress' as const, label: t('filterInProgress') },
              { key: 'completed' as const, label: t('filterCompleted') },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-xs font-medium transition-all',
                  filter === f.key
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span className="ml-auto text-xs text-white/25">
            {filteredItems.length} épisode{filteredItems.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-8 md:px-8">
        {filteredItems.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-white/5">
              <History className="size-10 text-white/20" />
            </div>
            <h2 className="text-xl font-bold text-white/80">{t('emptyTitle')}</h2>
            <p className="mt-2 max-w-sm text-sm text-white/40">
              {t('emptyDescription')}
            </p>
            <Link
              href={`/${locale}/discover`}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-500 hover:shadow-red-500/30"
            >
              {t('emptyCta')}
              <ChevronRight className="size-4" />
            </Link>
          </div>
        ) : (
          /* Grouped timeline */
          <div className="space-y-10">
            {groups.map((group) => (
              <TimeGroup
                key={group.label}
                label={group.label}
                items={group.items}
                locale={locale}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
