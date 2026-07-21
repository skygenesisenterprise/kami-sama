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
  TrendingUp,
  Star,
  Film,
  Tv,
  AlertCircle,
  CheckCircle,
  Filter,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RatingBadge } from '@/components/kami/rating-badge'
import { GenreTag } from '@/components/kami/genre-tag'
import { cn } from '@/lib/utils'
import { getSimulcasts, getEpisodes, getAllAnime } from '@/lib/mock-data'
import type { Anime, Episode, SimulcastItem, AnimeStatus } from '@/types/anime'

// Mock Grid3x3 icon
const Grid3x3 = () => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
)

// Mock Sparkles icon
const Sparkles = () => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/>
    <path d="M19 17v4"/>
    <path d="M3 5h4"/>
    <path d="M17 19h4"/>
  </svg>
)

// Days of the week
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_ABBR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

// Anime types for filtering
const ANIME_TYPES = [
  { id: 'all', label: 'All Types', icon: Grid3x3 },
  { id: 'anime', label: 'Anime', icon: Tv },
  { id: 'movie', label: 'Movies', icon: Film },
  { id: 'ova', label: 'OVA', icon: Star },
  { id: 'special', label: 'Specials', icon: Sparkles },
]

// Status filters
const STATUS_FILTERS = [
  { id: 'all', label: 'All Status' },
  { id: 'airing', label: 'Currently Airing' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
]

// Sort options
const SORT_OPTIONS = [
  { id: 'time', label: 'By Time' },
  { id: 'popularity', label: 'By Popularity' },
  { id: 'rating', label: 'By Rating' },
  { id: 'title', label: 'A-Z' },
]

interface DaySchedule {
  day: string
  abbr: string
  date: Date
  anime: (SimulcastItem & { nextEp: Episode; animeData: Anime; airTime: string })[]
  isToday: boolean
  isEmpty: boolean
}

interface CalendarEvent {
  id: string
  title: string
  slug: string
  cover: string
  episodeNumber: number
  episodeTitle: string
  airTime: string
  airDate: Date
  type: 'tv' | 'movie' | 'ova' | 'special'
  status: AnimeStatus
  rating: number
  genres: string[]
  studio: string
  duration: number
  isNew: boolean
  isFinale: boolean
  isPremiere: boolean
}

function getCurrentWeekDates(): Date[] {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    return date
  })
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  })
}

function formatDate(date: Date): string {
  return `${DAY_ABBR[date.getDay()]}, ${MONTHS[date.getMonth()].slice(0, 3)} ${date.getDate()}`
}

function buildSchedule(): DaySchedule[] {
  const simulcasts = getSimulcasts()
  const animeList = getAllAnime()
  const weekDates = getCurrentWeekDates()
  
  const dayMap = new Map<string, SimulcastItem[]>()
  for (const item of simulcasts) {
    const list = dayMap.get(item.airDay) ?? []
    list.push(item)
    dayMap.set(item.airDay, list)
  }

  const today = new Date()
  const todayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1

  return DAYS.map((day, i) => {
    const items = dayMap.get(day) ?? []
    const date = weekDates[i]
    
    return {
      day,
      abbr: DAY_ABBR[i],
      date,
      isToday: i === todayIndex,
      isEmpty: items.length === 0,
      anime: items
        .map((item) => {
          const eps = getEpisodes(item.anime.id)
          const nextEp = item.nextEpisode ?? eps[eps.length - 1]
          const animeData = animeList.find(a => a.id === item.anime.id) ?? item.anime
          // Add airTime based on nextAirDate time
          const airTime = nextEp.releaseDate ? nextEp.releaseDate.split('T')[1]?.split(':').slice(0, 2).join(':') || '12:00' : '12:00'
          return { ...item, nextEp, animeData, airTime }
        })
        .filter(Boolean) as (SimulcastItem & { nextEp: Episode; animeData: Anime; airTime: string })[],
    }
  })
}

function getUpcomingHighlights(schedule: DaySchedule[]): CalendarEvent[] {
  const highlights: CalendarEvent[] = []
  
  // Get today's items
  const todaySchedule = schedule.find(d => d.isToday)
  if (todaySchedule) {
    todaySchedule.anime.forEach(item => {
      highlights.push({
        id: item.anime.id,
        title: item.anime.title,
        slug: item.anime.slug,
        cover: item.anime.cover || '/placeholder.svg',
        episodeNumber: item.nextEp.number,
        episodeTitle: item.nextEp.title,
        airTime: item.airTime,
        airDate: todaySchedule.date,
        type: 'tv',
        status: item.anime.status,
        rating: item.anime.rating,
        genres: item.anime.genres.map(g => g.name),
        studio: item.anime.studio.name,
        duration: 24, // Default duration
        isNew: item.nextEp.number === 1,
        isFinale: false,
        isPremiere: false,
      })
    })
  }

  // Add some mock upcoming highlights
  const mockHighlights: CalendarEvent[] = [
    {
      id: 'hollow-kingdom-1',
      title: 'Hollow Kingdom',
      slug: 'hollow-kingdom',
      cover: '/covers/hollow-kingdom.png',
      episodeNumber: 1,
      episodeTitle: 'The Awakening',
      airTime: '12:00',
      airDate: new Date(new Date().setDate(new Date().getDate() + 3)),
      type: 'tv',
      status: 'upcoming',
      rating: 8.5,
      genres: ['Action', 'Fantasy'],
      studio: 'Studio Bones',
      duration: 24,
      isNew: true,
      isFinale: false,
      isPremiere: true,
    },
    {
      id: 'eternal-frost-12',
      title: 'Eternal Frost',
      slug: 'eternal-frost',
      cover: '/covers/eternal-frost.png',
      episodeNumber: 12,
      episodeTitle: 'Final Confrontation',
      airTime: '14:30',
      airDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      type: 'tv',
      status: 'upcoming',
      rating: 9.2,
      genres: ['Drama', 'Supernatural'],
      studio: 'Ufotable',
      duration: 24,
      isNew: false,
      isFinale: true,
      isPremiere: false,
    },
  ]

  return [...highlights, ...mockHighlights]
    .sort((a, b) => a.airDate.getTime() - b.airDate.getTime())
    .slice(0, 6)
}

function getTodaySummary(schedule: DaySchedule[]): { count: number; newEpisodes: number; finales: number } {
  const todaySchedule = schedule.find(d => d.isToday)
  
  if (!todaySchedule) {
    return { count: 0, newEpisodes: 0, finales: 0 }
  }

  let newEpisodes = 0
  let finales = 0

  todaySchedule.anime.forEach(item => {
    if (item.nextEp.number === 1) newEpisodes++
    // Mock finale detection - in real app, this would come from data
    if (item.nextEp.number >= 12) finales++
  })

  return {
    count: todaySchedule.anime.length,
    newEpisodes,
    finales,
  }
}

export default function CalendarPage() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState('week')
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['all'])
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('time')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  const schedule = useMemo(() => buildSchedule(), [])
  const upcomingHighlights = useMemo(() => getUpcomingHighlights(schedule), [schedule])
  const todaySummary = useMemo(() => getTodaySummary(schedule), [schedule])

  const todayIndex = schedule.findIndex((d) => d.isToday)
  const activeDay = selectedDay ?? todayIndex

  const displayedSchedule =
    selectedDay !== null ? [schedule[selectedDay]] : schedule

  // Filter and sort schedule
  const filteredSchedule = useMemo(() => {
    let result = displayedSchedule
    
    // Apply type filter
    if (!selectedTypes.includes('all') && selectedTypes.length > 0) {
      result = result.map(day => ({
        ...day,
        anime: day.anime.filter(item => 
          selectedTypes.includes('tv') || // Always include tv for now
          (item.animeData.status === 'upcoming' && selectedTypes.includes('movie')) ||
          (item.animeData.status === 'upcoming' && selectedTypes.includes('ova'))
        )
      }))
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      result = result.map(day => ({
        ...day,
        anime: day.anime.filter(item => {
          if (selectedStatus === 'airing') return item.animeData.status === 'airing'
          if (selectedStatus === 'upcoming') return item.animeData.status === 'upcoming'
          if (selectedStatus === 'completed') return item.animeData.status === 'completed'
          return false
        })
      }))
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.map(day => ({
        ...day,
        anime: day.anime.filter(item => 
          item.animeData.title.toLowerCase().includes(query) ||
          item.animeData.genres.some(g => g.name.toLowerCase().includes(query)) ||
          item.nextEp.title.toLowerCase().includes(query)
        )
      }))
    }

    // Sort within each day
    result = result.map(day => {
      const sortedAnime = [...day.anime]
      
      if (sortBy === 'popularity') {
        sortedAnime.sort((a, b) => b.animeData.ratingCount - a.animeData.ratingCount)
      } else if (sortBy === 'rating') {
        sortedAnime.sort((a, b) => b.animeData.rating - a.animeData.rating)
      } else if (sortBy === 'title') {
        sortedAnime.sort((a, b) => a.animeData.title.localeCompare(b.animeData.title))
      } else {
        // By time - sort by airTime
        sortedAnime.sort((a, b) => {
          const timeA = a.airTime.split(':').map(Number)
          const timeB = b.airTime.split(':').map(Number)
          return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1])
        })
      }
      
      return { ...day, anime: sortedAnime }
    })

    return result
  }, [displayedSchedule, selectedTypes, selectedStatus, searchQuery, sortBy])

  const handleDayNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedDay(prev => {
        if (prev === null) return 6 // Go to Sunday
        return prev === 0 ? 6 : prev - 1
      })
    } else {
      setSelectedDay(prev => {
        if (prev === null) return 0 // Go to Monday
        return prev === 6 ? 0 : prev + 1
      })
    }
  }

  const resetFilters = () => {
    setSelectedTypes(['all'])
    setSelectedStatus('all')
    setSortBy('time')
    setSearchQuery('')
  }

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (!selectedTypes.includes('all') || selectedTypes.length > 1) count++
    if (selectedStatus !== 'all') count++
    if (sortBy !== 'time') count++
    if (searchQuery) count++
    return count
  }, [selectedTypes, selectedStatus, sortBy, searchQuery])

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-background/80">
      {/* Header Section */}
      <div className="border-b border-border/60 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary/60">
              <CalendarDays className="size-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                Release Calendar
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Track all upcoming anime releases and never miss an episode
              </p>
            </div>
          </div>
          
          {/* Today's Summary */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 rounded-xl bg-card/50 border border-border/60 px-4 py-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15">
                <TrendingUp className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Today's Releases</p>
                <p className="font-semibold text-primary">{todaySummary.count}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 rounded-xl bg-card/50 border border-border/60 px-4 py-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-success/15">
                <CheckCircle className="size-4 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">New Episodes</p>
                <p className="font-semibold text-success">{todaySummary.newEpisodes}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 rounded-xl bg-card/50 border border-border/60 px-4 py-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-destructive/15">
                <AlertCircle className="size-4 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Finales</p>
                <p className="font-semibold text-destructive">{todaySummary.finales}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="border-b border-border/60 bg-card/30 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 lg:grid-cols-5 w-full h-12 bg-transparent border-none">
              <TabsTrigger 
                value="week" 
                className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                This Week
              </TabsTrigger>
              <TabsTrigger 
                value="today" 
                className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Today
              </TabsTrigger>
              <TabsTrigger 
                value="upcoming" 
                className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Upcoming
              </TabsTrigger>
              <TabsTrigger 
                value="premieres" 
                className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Premieres
              </TabsTrigger>
              <TabsTrigger 
                value="finales" 
                className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Finales
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="border-b border-border/60 bg-card/30 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search anime, genres, or episodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-card/50 pl-10 pr-10 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-2 border-border/60"
                >
                  <Filter className="size-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-4">
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm">Filters</h4>
                  
                  {/* Type Filter */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Type</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {ANIME_TYPES.map((type) => (
                        <Label 
                          key={type.id}
                          className="flex items-center gap-2 cursor-pointer rounded-lg p-2 hover:bg-accent/50 transition-colors"
                        >
                          <Checkbox
                            checked={selectedTypes.includes(type.id)}
                            onCheckedChange={(checked) => {
                              if (type.id === 'all') {
                                setSelectedTypes(checked ? ['all'] : [])
                              } else {
                                const newTypes = selectedTypes.filter(t => t !== 'all')
                                if (checked) {
                                  setSelectedTypes([...newTypes, type.id])
                                } else {
                                  setSelectedTypes(newTypes.filter(t => t !== type.id))
                                }
                              }
                            }}
                          />
                          <span className="text-sm">{type.label}</span>
                        </Label>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Status</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {STATUS_FILTERS.map((status) => (
                        <Label 
                          key={status.id}
                          className="flex items-center gap-2 cursor-pointer rounded-lg p-2 hover:bg-accent/50 transition-colors"
                        >
                          <Checkbox
                            checked={selectedStatus === status.id}
                            onCheckedChange={(checked) => {
                              if (checked) setSelectedStatus(status.id)
                            }}
                          />
                          <span className="text-sm">{status.label}</span>
                        </Label>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Sort Options */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Sort By</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {SORT_OPTIONS.map((option) => (
                        <Label 
                          key={option.id}
                          className="flex items-center gap-2 cursor-pointer rounded-lg p-2 hover:bg-accent/50 transition-colors"
                        >
                          <Checkbox
                            checked={sortBy === option.id}
                            onCheckedChange={(checked) => {
                              if (checked) setSortBy(option.id)
                            }}
                          />
                          <span className="text-sm">{option.label}</span>
                        </Label>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={resetFilters} className="flex-1">
                      Reset
                    </Button>
                    <Button size="sm" onClick={() => setShowFilters(false)} className="flex-1">
                      Apply
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Day Navigation */}
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDayNavigation('prev')}
                className="size-9"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDayNavigation('next')}
                className="size-9"
              >
                <ChevronRight className="size-4" />
              </Button>
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

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        {activeTab === 'upcoming' ? (
          /* Upcoming View */
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold tracking-tight">Upcoming Releases</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingHighlights.map((event) => (
                <UpcomingCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        ) : activeTab === 'premieres' ? (
          /* Premieres View */
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold tracking-tight">New Premieres</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingHighlights
                .filter(e => e.isPremiere)
                .map((event) => (
                  <UpcomingCard key={event.id} event={event} isPremiere />
                ))}
            </div>
          </div>
        ) : activeTab === 'finales' ? (
          /* Finales View */
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold tracking-tight">Season Finales</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingHighlights
                .filter(e => e.isFinale)
                .map((event) => (
                  <UpcomingCard key={event.id} event={event} isFinale />
                ))}
            </div>
          </div>
        ) : (
          /* Week/Today View */
          <>
            {filteredSchedule.every((d) => d.anime.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Clock className="mb-4 size-12 text-muted-foreground/40" />
                <h3 className="font-display text-lg font-semibold">
                  No releases match your filters
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedDay !== null
                    ? `Nothing airing on ${schedule[selectedDay].day} with current filters`
                    : 'No releases this week match your criteria'}
                </p>
                <Button variant="outline" onClick={resetFilters} className="mt-4">
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {filteredSchedule.map((daySchedule) => (
                  <section key={daySchedule.day}>
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                      <h2
                        className={cn(
                          'font-display text-xl font-semibold tracking-tight',
                          daySchedule.isToday && 'text-primary',
                        )}
                      >
                        {daySchedule.day}
                      </h2>
                      {daySchedule.isToday && (
                        <Badge className="bg-primary text-primary-foreground text-xs">
                          <Clock className="size-3 mr-1" />
                          Today
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {daySchedule.anime.length} {daySchedule.anime.length === 1 ? 'release' : 'releases'}
                      </span>
                      <span className="text-muted-foreground/50">
                        {formatDate(daySchedule.date)}
                      </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {daySchedule.anime.map((item) => (
                        <CalendarCard
                          key={item.anime.id}
                          item={item}
                          episode={item.nextEp}
                          animeData={item.animeData}
                          airTime={item.airTime}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}

            {/* Upcoming Highlights Section */}
            <div className="mt-12 border-t border-border/60 pt-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl font-bold tracking-tight">
                    Coming Soon
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Upcoming premieres, finales, and special events
                  </p>
                </div>
                <Link href="#" className="text-sm text-primary hover:underline">
                  View All →
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingHighlights.slice(0, 6).map((event) => (
                  <UpcomingCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function CalendarCard({
  item,
  episode,
  animeData,
  airTime,
}: {
  item: SimulcastItem
  episode: Episode
  animeData: Anime
  airTime: string
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link
      href={`/watch/${item.anime.slug}?ep=${episode.id}`}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/50 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={animeData.cover || '/placeholder.svg'}
          alt={animeData.title}
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/40 to-transparent" />
        
        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/20 backdrop-blur-sm transition-all group-hover:size-20 group-hover:bg-primary/30">
            <Play className="size-8 fill-primary-foreground text-primary-foreground transition-transform group-hover:scale-110" />
          </div>
        </div>

        {/* Top left info */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          <Badge variant="secondary" className="text-xs">
            TV
          </Badge>
          {episode.number === 1 && (
            <Badge variant="default" className="bg-success/10 text-success text-xs">
              <Star className="size-3 mr-1" />
              Premiere
            </Badge>
          )}
          {episode.number >= 12 && (
            <Badge variant="default" className="bg-destructive/10 text-destructive text-xs">
              <AlertCircle className="size-3 mr-1" />
              Finale
            </Badge>
          )}
        </div>

        {/* Top right info */}
        <div className="absolute right-3 top-3">
          <RatingBadge rating={animeData.rating} size="sm" />
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {animeData.title}
          </h3>
          <p className="mt-0.5 text-xs text-primary">
            Episode {episode.number}: {episode.title}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {animeData.genres.slice(0, 2).map((genre) => (
              <GenreTag key={genre.id} genre={genre} />
            ))}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>{airTime}</span>
            <span>{animeData.studio.name}</span>
          </div>
        </div>
      </div>

      {/* Hover card expansion */}
      {isHovered && (
        <Card className="absolute -bottom-4 left-4 right-4 z-10 border-border/60 bg-card shadow-xl">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground line-clamp-2">
              {animeData.synopsis || 'No synopsis available'}
            </p>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span>{animeData.year}</span>
              <span>{Math.round(episode.duration / 60)} min</span>
              <span>{animeData.ageRating}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </Link>
  )
}

function UpcomingCard({ event, isPremiere = false, isFinale = false }: { event: CalendarEvent; isPremiere?: boolean; isFinale?: boolean }) {
  return (
    <Link
      href={`/watch/${event.slug}`}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/50 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={event.cover}
          alt={event.title}
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/40 to-transparent" />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {isPremiere && (
            <Badge variant="default" className="bg-success/10 text-success text-xs">
              <Star className="size-3 mr-1" />
              Premiere
            </Badge>
          )}
          {isFinale && (
            <Badge variant="default" className="bg-destructive/10 text-destructive text-xs">
              <AlertCircle className="size-3 mr-1" />
              Finale
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs">
            {event.type}
          </Badge>
        </div>

        {/* Rating */}
        <div className="absolute right-3 top-3">
          <RatingBadge rating={event.rating} size="sm" />
        </div>

        {/* Date/Time */}
        <div className="absolute right-3 bottom-3 text-right">
          <p className="text-xs text-muted-foreground">{formatDate(event.airDate)}</p>
          <p className="text-sm font-medium">{event.airTime}</p>
        </div>

        {/* Title */}
        <div className="absolute bottom-3 left-3 right-12">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {event.title}
          </h3>
          <p className="mt-0.5 text-xs text-primary">
            Episode {event.episodeNumber}: {event.episodeTitle}
          </p>
        </div>
      </div>
    </Link>
  )
}
