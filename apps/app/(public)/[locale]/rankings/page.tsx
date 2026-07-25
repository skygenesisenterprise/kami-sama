'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Minus, Trophy } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { getAllAnime, getContentPath } from '@/lib/mock-data'
import type { Anime } from '@/types/anime'
import { RatingBadge } from '@/components/kami/rating-badge'

type Tab = 'all' | 'series' | 'movies'

export default function RankingsPage() {
  const t = useTranslations('Public.rankings')
  const [tab, setTab] = useState<Tab>('all')

  const ranked = useMemo(() => {
    const all = getAllAnime()
    const filtered =
      tab === 'series'
        ? all.filter((a) => a.type === 'series')
        : tab === 'movies'
          ? all.filter((a) => a.type === 'movies')
          : all
    return [...filtered].sort((a, b) => b.rating - a.rating).slice(0, 10)
  }, [tab])

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: t('tabAll') },
    { id: 'series', label: t('tabSeries') },
    { id: 'movies', label: t('tabMovies') },
  ]

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-5xl px-4 pt-10 pb-16 md:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="size-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {t('title')}
            </h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 rounded-lg bg-secondary/60 p-1">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                  tab === item.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rankings list */}
        <div className="mt-8 flex flex-col gap-3">
          {ranked.map((anime, index) => (
            <RankingRow key={anime.id} anime={anime} rank={index + 1} />
          ))}
        </div>
      </div>
    </div>
  )
}

function RankingRow({ anime, rank }: { anime: Anime; rank: number }) {
  const trend = rank <= 3 ? rank - 1 : Math.floor(Math.random() * 5) - 2

  return (
    <Link
      href={`${getContentPath(anime)}/${anime.slug}`}
      className="group flex items-center gap-4 rounded-xl border border-border/50 bg-card p-3 transition-colors hover:border-border hover:bg-card/80 md:p-4"
    >
      {/* Rank number */}
      <div
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-lg text-lg font-bold md:size-12',
          rank === 1 && 'bg-amber-500/15 text-amber-400',
          rank === 2 && 'bg-gray-400/15 text-gray-300',
          rank === 3 && 'bg-orange-500/15 text-orange-400',
          rank > 3 && 'bg-muted text-muted-foreground',
        )}
      >
        {rank}
      </div>

      {/* Cover */}
      <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg">
        <img
          src={anime.cover}
          alt={anime.title}
          className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold md:text-base">
          {anime.title}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
          {anime.genres
            .slice(0, 3)
            .map((g) => g.name)
            .join(' · ')}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {anime.studio.name} · {anime.year}
        </p>
      </div>

      {/* Rating + trend */}
      <div className="flex shrink-0 flex-col items-end gap-1">
        <RatingBadge rating={anime.rating} size="default" />
        <div className="flex items-center gap-1 text-xs">
          {trend > 0 ? (
            <TrendingUp className="size-3 text-emerald-400" />
          ) : trend < 0 ? (
            <TrendingDown className="size-3 text-red-400" />
          ) : (
            <Minus className="size-3 text-muted-foreground" />
          )}
          <span
            className={cn(
              'font-medium',
              trend > 0 && 'text-emerald-400',
              trend < 0 && 'text-red-400',
              trend === 0 && 'text-muted-foreground',
            )}
          >
            {trend > 0 ? `+${trend}` : trend}
          </span>
        </div>
      </div>
    </Link>
  )
}
