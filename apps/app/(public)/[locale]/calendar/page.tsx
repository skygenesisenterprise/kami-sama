'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RatingBadge } from '@/components/kami/rating-badge'
import { cn } from '@/lib/utils'
import { getSimulcasts, getEpisodes } from '@/lib/mock-data'
import type { Anime, Episode, SimulcastItem } from '@/types/anime'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_ABBR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface DaySchedule {
  day: string
  abbr: string
  anime: (SimulcastItem & { nextEp: Episode })[]
  isToday: boolean
}

function buildSchedule(): DaySchedule[] {
  const simulcasts = getSimulcasts()
  const dayMap = new Map<string, SimulcastItem[]>()
  for (const item of simulcasts) {
    const list = dayMap.get(item.airDay) ?? []
    list.push(item)
    dayMap.set(item.airDay, list)
  }

  const today = new Date().getDay()
  const todayIndex = today === 0 ? 6 : today - 1

  return DAYS.map((day, i) => {
    const items = dayMap.get(day) ?? []
    return {
      day,
      abbr: DAY_ABBR[i],
      isToday: i === todayIndex,
      anime: items
        .map((item) => {
          const eps = getEpisodes(item.anime.id)
          const nextEp = item.nextEpisode ?? eps[eps.length - 1]
          return { ...item, nextEp }
        })
        .filter(Boolean) as (SimulcastItem & { nextEp: Episode })[],
    }
  })
}

export default function CalendarPage() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const schedule = useMemo(() => buildSchedule(), [])

  const todayIndex = schedule.findIndex((d) => d.isToday)
  const activeDay = selectedDay ?? todayIndex

  const displayedSchedule =
    selectedDay !== null ? [schedule[selectedDay]] : schedule

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15">
              <CalendarDays className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                Release Calendar
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Never miss an episode — see what&apos;s airing this week
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Day selector tabs */}
      <div className="border-b border-border/60 bg-card/30 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="scrollbar-hide flex gap-1 overflow-x-auto py-3">
            <button
              type="button"
              onClick={() => setSelectedDay(null)}
              className={cn(
                'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                selectedDay === null
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              Full Week
            </button>
            {schedule.map((d, i) => (
              <button
                key={d.day}
                type="button"
                onClick={() => setSelectedDay(i)}
                className={cn(
                  'relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  selectedDay === i
                    ? 'bg-primary text-primary-foreground'
                    : d.anime.length === 0
                      ? 'text-muted-foreground/50'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
              >
                <span className="hidden sm:inline">{d.day}</span>
                <span className="sm:hidden">{d.abbr}</span>
                {d.isToday && (
                  <span className="absolute -right-1 -top-1 size-2 rounded-full bg-primary" />
                )}
                {d.anime.length > 0 && (
                  <span
                    className={cn(
                      'ml-1.5 inline-flex size-4 items-center justify-center rounded-full text-[10px]',
                      selectedDay === i
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-secondary text-muted-foreground',
                    )}
                  >
                    {d.anime.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule content */}
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        {displayedSchedule.every((d) => d.anime.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Clock className="mb-4 size-12 text-muted-foreground/40" />
            <h3 className="font-display text-lg font-semibold">
              No releases scheduled
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedDay !== null
                ? `Nothing airing on ${schedule[selectedDay].day}`
                : 'Check back later for this week\'s schedule'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {displayedSchedule.map((daySchedule) => (
              <section key={daySchedule.day}>
                <div className="mb-4 flex items-center gap-3">
                  <h2
                    className={cn(
                      'font-display text-lg font-semibold tracking-tight',
                      daySchedule.isToday && 'text-primary',
                    )}
                  >
                    {daySchedule.day}
                  </h2>
                  {daySchedule.isToday && (
                    <Badge className="bg-primary text-primary-foreground text-xs">
                      Today
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {daySchedule.anime.length}{' '}
                    {daySchedule.anime.length === 1 ? 'show' : 'shows'}
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {daySchedule.anime.map((item) => (
                    <CalendarCard
                      key={item.anime.id}
                      item={item}
                      episode={item.nextEp}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Upcoming highlights */}
        <div className="mt-12 border-t border-border/60 pt-8">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Coming Soon
          </h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">
            Upcoming premieres and finales
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Hollow Kingdom', label: 'Premiere', date: 'Jul 25' },
              { title: 'Eternal Frost', label: 'Season 2 Finale', date: 'Aug 2' },
              { title: 'Neon Orbit', label: 'Mid-season', date: 'Jul 30' },
              { title: 'Last Serve', label: 'Finals arc', date: 'Aug 5' },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <CalendarDays className="size-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-semibold">
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {item.label} — {item.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function CalendarCard({
  item,
  episode,
}: {
  item: SimulcastItem
  episode: Episode
}) {
  return (
    <Link
      href={`/watch/${item.anime.slug}?ep=${episode.id}`}
      className="group flex gap-4 overflow-hidden rounded-xl border border-border/60 bg-card p-3 transition-colors hover:bg-accent"
    >
      <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-lg">
        <Image
          src={item.anime.cover || '/placeholder.svg'}
          alt={item.anime.title}
          fill
          sizes="80px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 transition-opacity group-hover:opacity-100">
          <Play className="size-6 fill-primary-foreground text-primary-foreground" />
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <h3 className="truncate text-sm font-semibold">{item.anime.title}</h3>
        <p className="mt-0.5 text-xs text-primary">
          Episode {episode.number}
        </p>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {episode.title}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <RatingBadge rating={item.anime.rating} size="sm" />
          <span className="text-xs text-muted-foreground">
            {item.anime.year}
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">
            {item.anime.ageRating}
          </span>
        </div>
      </div>
    </Link>
  )
}
