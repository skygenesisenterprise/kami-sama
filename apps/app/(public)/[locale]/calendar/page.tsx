'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Calendar, Grid } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { getSimulcasts, getEpisodes, getAllAnime } from '@/lib/mock-data'
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
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}/${day}`
}

interface DaySchedule {
  day: string
  date: Date
  anime: (SimulcastItem & { nextEp: Episode; animeData: Anime; airTime: string })[]
  isToday: boolean
}

function buildSchedule(): DaySchedule[] {
  const simulcasts = getSimulcasts()
  const animeList = getAllAnime()
  const weekDates = getCurrentWeekDates()
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

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
      isToday: i === todayIndex,
      anime: items
        .map((item) => {
          const eps = getEpisodes(item.anime.id)
          const nextEp = item.nextEpisode ?? eps[eps.length - 1]
          const animeData = animeList.find(a => a.id === item.anime.id) ?? item.anime
          const airTime = nextEp.releaseDate ? nextEp.releaseDate.split('T')[1]?.split(':').slice(0, 2).join(':') || '12:00' : '12:00'
          return { ...item, nextEp, animeData, airTime }
        })
        .filter(Boolean) as (SimulcastItem & { nextEp: Episode; animeData: Anime; airTime: string })[],
    }
  })
}

export default function CalendarPage() {
  const t = useTranslations('Public.calendar')
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'calendar' | 'program'>('calendar')
  const [episodeType, setEpisodeType] = useState<'premium' | 'free'>('free')

  const schedule = useMemo(() => buildSchedule(), [])

  const todayIndex = schedule.findIndex(d => d.isToday)
  const activeDayIndex = selectedDayIndex ?? todayIndex

  const handlePrev = () => {
    setSelectedDayIndex(prev => {
      if (prev === null) return todayIndex > 0 ? todayIndex - 1 : 6
      return prev === 0 ? 6 : prev - 1
    })
  }

  const handleNext = () => {
    setSelectedDayIndex(prev => {
      if (prev === null) return todayIndex < 6 ? todayIndex + 1 : 0
      return prev === 6 ? 0 : prev + 1
    })
  }

  const activeSchedule = schedule[activeDayIndex]

  const dayLabels = [
    t('dayMon'),
    t('dayTue'),
    t('dayWed'),
    t('dayThu'),
    t('dayFri'),
    t('daySat'),
    t('daySun'),
  ]

  return (
    <div className="relative min-h-screen bg-paper">
      {/* Top Tabs */}
      <div className="flex justify-center gap-4 pt-8 pb-6">
        <button
          onClick={() => setActiveTab('calendar')}
          className={cn(
            'flex items-center gap-2 rounded-md px-6 py-3 font-semibold text-sm transition-all',
            activeTab === 'calendar'
              ? 'btn-ink'
              : 'btn-outline'
          )}
        >
          <Calendar className="size-4" />
          {t('tabCalendar')}
        </button>
        <button
          onClick={() => setActiveTab('program')}
          className={cn(
            'flex items-center gap-2 rounded-md px-6 py-3 font-semibold text-sm transition-all',
            activeTab === 'program'
              ? 'btn-ink'
              : 'btn-outline'
          )}
        >
          <Grid className="size-4" />
          {t('tabProgram')}
        </button>
      </div>

      {/* Episode Type Radio Buttons */}
      <div className="flex justify-center gap-8 pb-6">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="radio"
            name="episodeType"
            checked={episodeType === 'premium'}
            onChange={() => setEpisodeType('premium')}
            className="size-4 accent-stamp"
          />
          <span className="text-sm text-ink-soft group-hover:text-ink transition-colors">
            {t('radioPremium')}
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="radio"
            name="episodeType"
            checked={episodeType === 'free'}
            onChange={() => setEpisodeType('free')}
            className="size-4 accent-stamp"
          />
          <span className="text-sm text-ink-soft group-hover:text-ink transition-colors">
            {t('radioFree')}
          </span>
        </label>
      </div>

      {/* Premium Banner */}
      <div className="mx-auto max-w-5xl px-4 pb-6">
        <div className="card-surface rounded-md px-6 py-3 text-center text-sm text-ink-soft">
          {t('premiumBanner')}{' '}
          <Link href="#" className="font-semibold text-stamp hover:text-stamp-dim transition-colors">
            {t('premiumLink')}
          </Link>{' '}
          {t('premiumDuration')}
        </div>
      </div>

      {/* Week Navigation */}
      <div className="mx-auto max-w-5xl px-4">
        <div className="relative flex items-center">
          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            className="absolute left-0 z-10 flex size-10 items-center justify-center rounded-full bg-paper-raised shadow-paper hover:bg-line-strong transition-colors"
          >
            <ChevronLeft className="size-5 text-stamp" />
          </button>

          {/* Days Grid */}
          <div className="grid w-full grid-cols-7 gap-2 px-14">
            {schedule.map((day, i) => {
              const isSelected = i === activeDayIndex
              const hasAnime = day.anime.length > 0

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDayIndex(i)}
                  className={cn(
                    'relative flex flex-col items-center rounded-lg py-4 px-2 transition-all',
                    isSelected
                      ? 'glass-card min-h-40'
                      : 'bg-transparent hover:bg-paper-raised/50',
                    day.isToday && !isSelected && 'font-bold'
                  )}
                >
                  <span className="text-xs text-ink-faint">
                    {formatDateShort(day.date)}
                  </span>
                  <span className={cn(
                    'text-sm font-bold mt-1',
                    isSelected ? 'text-ink' : 'text-ink-soft',
                    day.isToday && 'text-stamp'
                  )}>
                    {day.isToday ? t('today') : dayLabels[i]}
                  </span>

                  {/* Content area */}
                  {isSelected && (
                    <div className="mt-4 w-full space-y-2">
                      {hasAnime ? (
                        day.anime.map((item) => (
                          <Link
                            key={item.anime.id}
                            href={`/watch/${item.anime.slug}?ep=${item.nextEp.id}`}
                            className="block rounded-md bg-paper-dim p-2 hover:bg-line transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <div className="relative size-10 shrink-0 overflow-hidden rounded-sm">
                                <Image
                                  src={item.anime.cover || '/placeholder.svg'}
                                  alt={item.anime.title}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold text-ink">
                                  {item.anime.title}
                                </p>
                                <p className="text-[10px] text-ink-faint">
                                  {t('episodeShort')} {item.nextEp.number} • {item.airTime}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <p className="text-xs text-ink-faint text-center mt-4">
                          {t('emptyDay')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Non-selected empty state */}
                  {!isSelected && !hasAnime && (
                    <p className="text-[10px] text-ink-faint mt-2 text-center leading-tight">
                      {t('emptyDay')}
                    </p>
                  )}
                </button>
              )
            })}
          </div>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-0 z-10 flex size-10 items-center justify-center rounded-full bg-paper-raised shadow-paper hover:bg-line-strong transition-colors"
          >
            <ChevronRight className="size-5 text-stamp" />
          </button>
        </div>
      </div>

    </div>
  )
}
