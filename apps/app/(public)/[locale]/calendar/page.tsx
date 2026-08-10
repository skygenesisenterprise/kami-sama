'use client'

import { use, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Filter, Info } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { getSimulcasts, getEpisodes, getAllAnime } from '@/lib/mock-data'
import { setPendingEpisode } from '@/lib/watch-session'
import type { Anime, Episode, SimulcastItem } from '@/types/anime'

function getCurrentWeekDates(): Date[] {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    return date
  })
}

function formatDateShort(date: Date): string {
  const d = date.getDate().toString().padStart(2, '0')
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  return `${d}/${m}`
}

function formatTime(nextAirDate: string): string {
  const time = nextAirDate.split('T')[1]
  if (!time) return '--:--'
  const [h, m] = time.split(':')
  return `${h}h${m}`
}

interface DaySchedule {
  day: string
  date: Date
  dayLabel: string
  dateLabel: string
  anime: (SimulcastItem & { nextEp: Episode; animeData: Anime })[]
  isToday: boolean
}

function buildSchedule(): DaySchedule[] {
  const simulcasts = getSimulcasts()
  const animeList = getAllAnime()
  const weekDates = getCurrentWeekDates()
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const dayLabels = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

  const dayMap = new Map<string, SimulcastItem[]>()
  for (const item of simulcasts) {
    const list = dayMap.get(item.airDay) ?? []
    list.push(item)
    dayMap.set(item.airDay, list)
  }

  const today = new Date()
  const todayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1

  return weekDates.map((date, i) => {
    const items = dayMap.get(dayNames[i]) ?? []
    return {
      day: dayNames[i],
      date,
      dayLabel: dayLabels[i],
      dateLabel: formatDateShort(date),
      isToday: i === todayIndex,
      anime: items
        .map((item) => {
          const eps = getEpisodes(item.anime.id)
          const nextEp = item.nextEpisode ?? eps[eps.length - 1]
          const animeData = animeList.find(a => a.id === item.anime.id) ?? item.anime
          return { ...item, nextEp, animeData }
        })
        .filter(Boolean) as (SimulcastItem & { nextEp: Episode; animeData: Anime })[],
    }
  })
}

function JapaneseFlag() {
  return (
    <svg className="h-4 w-4 rounded-full md:h-6 md:w-6" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="18" fill="#F0F0F0" />
      <circle cx="18" cy="18" r="7.5" fill="#D80027" />
    </svg>
  )
}

export default function CalendarPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = use(params)
  const t = useTranslations('Public.calendar')
  const schedule = useMemo(() => buildSchedule(), [])

  return (
    <div className="min-h-screen bg-background">
      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-3 pt-8 pb-6">
        <h1 className="text-center font-display text-2xl font-semibold text-foreground sm:text-3xl">
          CALENDRIER
        </h1>
        <button
          aria-label="Afficher la légende du calendrier"
          className="flex size-6 items-center justify-center rounded-full bg-red-600 text-white transition-colors hover:bg-red-500"
        >
          <Info className="h-4 w-4" />
        </button>
        <button
          aria-label="Afficher les filtres du calendrier"
          className="flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-gray-200 transition-all hover:border-zinc-600 hover:bg-zinc-800"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filtres</span>
        </button>
      </div>

      {/* ── Calendar container ────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-row flex-nowrap gap-4">
          {schedule.map((day, i) => (
            <div
              key={i}
              className="flex min-w-0 flex-1 flex-col"
            >
                  {/* Day header */}
                  <h2
                    className={cn(
                      'mb-2 rounded-md pb-2 pt-2 text-center text-lg font-bold',
                      day.isToday
                        ? 'bg-red-700/80 text-white'
                        : 'text-white',
                    )}
                  >
                    {day.dayLabel.toUpperCase()}
                    <br />
                    <span className="text-base font-medium">{day.dateLabel}</span>
                  </h2>

                  {/* Anime cards */}
                  {day.anime.map((item) => (
                    <Link
                      key={item.anime.id}
                      href={`/${locale}/watch/${item.anime.slug}`}
                      onClick={() => setPendingEpisode(item.nextEp.id)}
                      className="mb-4 block w-full"
                    >
                      <div className="calendrier-card relative flex h-48 w-full flex-col flex-nowrap items-center justify-between overflow-hidden rounded-lg bg-gray-800 md:h-75">
                        {/* Poster image (fills entire card) */}
                        <div className="relative h-full min-h-0 w-full overflow-hidden">
                          <Image
                            src={item.anime.cover || '/placeholder.svg'}
                            alt={item.anime.title}
                            fill
                            sizes="(min-width: 768px) 176px, 112px"
                            className="object-cover object-center md:object-top"
                          />

                          {/* Episode badge (top-left) */}
                          <div className="absolute left-1 top-1 z-20 flex items-center gap-1 text-sm md:left-2 md:top-2 md:text-base">
                            <span className="font-bold text-white drop-shadow-md">
                              E{item.nextEp.number}
                            </span>
                            <span className="size-2 rounded-full bg-red-500" />
                          </div>

                          {/* Language flag (top-right) */}
                          <div className="absolute right-1 top-1 z-20 md:right-2 md:top-2">
                            <JapaneseFlag />
                          </div>

                          {/* Time overlay (centered on poster) */}
                          <div className="absolute inset-0 bg-gray-800/30">
                            <div className="flex h-full flex-col items-center justify-center">
                              <span className="select-text rounded-md bg-black/20 px-1 text-center text-xl md:text-3xl">
                                {formatTime(item.nextAirDate)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Title bar (bottom) */}
                        <div className="absolute bottom-0 z-10 flex h-6 w-full items-center justify-center bg-gray-800/90 px-1 md:static md:h-6 md:bg-gray-800 md:px-1">
                          <h3 className="w-full min-w-0 select-text truncate text-center text-xs md:text-sm">
                            {item.anime.title}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  ))}

                  {day.anime.length === 0 && (
                    <p className="py-8 text-center text-xs text-gray-500">
                      {t('emptyDay')}
                    </p>
                  )}
                </div>
              ))}
            </div>
      </div>
    </div>
  )
}
