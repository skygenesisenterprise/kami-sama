'use client'

import { useMemo, useState } from 'react'
import { Grid3X3, LayoutList, Search, SlidersHorizontal, X } from 'lucide-react'
import { AnimeCard } from '@/components/kami/anime-card'
import { GenreTag } from '@/components/kami/genre-tag'
import { SearchBar } from '@/components/kami/search-bar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { ANIME, GENRES, searchAnime } from '@/lib/mock-data'
import type { Anime, AnimeStatus } from '@/types/anime'

const STATUS_OPTIONS: { value: AnimeStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'airing', label: 'Airing' },
  { value: 'completed', label: 'Completed' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'hiatus', label: 'Hiatus' },
]

const SORT_OPTIONS = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'title', label: 'A — Z' },
  { value: 'episodes', label: 'Most Episodes' },
]

type ViewMode = 'grid' | 'list'

export default function CatalogPage() {
  const [query, setQuery] = useState('')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [status, setStatus] = useState<AnimeStatus | 'all'>('all')
  const [sort, setSort] = useState('rating')
  const [view, setView] = useState<ViewMode>('grid')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    let results = query ? searchAnime(query) : [...ANIME]

    if (selectedGenres.length > 0) {
      results = results.filter((a) =>
        a.genres.some((g) => selectedGenres.includes(g.id)),
      )
    }

    if (status !== 'all') {
      results = results.filter((a) => a.status === status)
    }

    switch (sort) {
      case 'rating':
        results.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        results.sort((a, b) => b.year - a.year)
        break
      case 'title':
        results.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'episodes':
        results.sort((a, b) => b.totalEpisodes - a.totalEpisodes)
        break
    }

    return results
  }, [query, selectedGenres, status, sort])

  function toggleGenre(genreId: string) {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId],
    )
  }

  function clearFilters() {
    setQuery('')
    setSelectedGenres([])
    setStatus('all')
    setSort('rating')
  }

  const hasActiveFilters =
    query || selectedGenres.length > 0 || status !== 'all'

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                Browse Anime
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Explore the full collection — {ANIME.length} titles available
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden w-64 md:block">
                <SearchBar
                  placeholder="Search anime…"
                  onValueChange={setQuery}
                />
              </div>
              <Button
                variant={showFilters ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <SlidersHorizontal className="size-4" />
                Filters
                {hasActiveFilters && (
                  <Badge
                    variant="destructive"
                    className="ml-1 size-5 rounded-full p-0 text-[10px]"
                  >
                    {(selectedGenres.length > 0 ? 1 : 0) +
                      (status !== 'all' ? 1 : 0)}
                  </Badge>
                )}
              </Button>
              <div className="hidden items-center border-l border-border/60 pl-2 md:flex">
                <Button
                  variant={view === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="size-8"
                  onClick={() => setView('grid')}
                >
                  <Grid3X3 className="size-4" />
                </Button>
                <Button
                  variant={view === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="size-8"
                  onClick={() => setView('list')}
                >
                  <LayoutList className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile search */}
          <div className="mt-4 md:hidden">
            <SearchBar
              placeholder="Search anime…"
              onValueChange={setQuery}
            />
          </div>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="border-b border-border/60 bg-card/50 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-5 md:px-8">
            <div className="flex flex-col gap-5">
              {/* Genres */}
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Genres
                </h3>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((genre) => (
                    <button
                      key={genre.id}
                      type="button"
                      onClick={() => toggleGenre(genre.id)}
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                        selectedGenres.includes(genre.id)
                          ? 'border-primary bg-primary/15 text-primary'
                          : 'border-border/60 bg-secondary/50 text-muted-foreground hover:border-primary/40 hover:text-foreground',
                      )}
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {/* Status */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </span>
                  <Select
                    value={status}
                    onValueChange={(v) => setStatus(v as AnimeStatus | 'all')}
                  >
                    <SelectTrigger className="h-8 w-36 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Sort
                  </span>
                  <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className="h-8 w-36 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="ml-auto gap-1 text-xs text-muted-foreground"
                  >
                    <X className="size-3" />
                    Clear all
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        {/* Active genre tags */}
        {selectedGenres.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Filtering:</span>
            {selectedGenres.map((genreId) => {
              const genre = GENRES.find((g) => g.id === genreId)
              if (!genre) return null
              return (
                <Badge
                  key={genreId}
                  variant="secondary"
                  className="gap-1 pr-1"
                >
                  {genre.name}
                  <button
                    type="button"
                    onClick={() => toggleGenre(genreId)}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )
            })}
          </div>
        )}

        <p className="mb-4 text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? 'title' : 'titles'} found
        </p>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="mb-4 size-12 text-muted-foreground/40" />
            <h3 className="font-display text-lg font-semibold">
              No anime found
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your filters or search query
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={clearFilters}
              className="mt-4"
            >
              Clear filters
            </Button>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filtered.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} showMeta />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((anime) => (
              <ListAnimeRow key={anime.id} anime={anime} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ListAnimeRow({ anime }: { anime: Anime }) {
  return (
    <a
      href={`/anime/${anime.slug}`}
      className="group flex gap-4 rounded-xl border border-border/60 bg-card p-3 transition-colors hover:bg-accent"
    >
      <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-lg">
        <img
          src={anime.cover || '/placeholder.svg'}
          alt={anime.title}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-display text-base font-semibold leading-tight">
              {anime.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {anime.japaneseTitle}
            </p>
          </div>
          <Badge
            variant="secondary"
            className={cn(
              'shrink-0 text-xs',
              anime.status === 'airing' &&
                'border-primary/30 bg-primary/10 text-primary',
              anime.status === 'completed' &&
                'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
              anime.status === 'upcoming' &&
                'border-amber-500/30 bg-amber-500/10 text-amber-400',
            )}
          >
            {anime.status}
          </Badge>
        </div>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
          {anime.synopsis}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-gold">
            ★ {anime.rating}
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{anime.year}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">
            {anime.totalEpisodes} ep
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          {anime.genres.slice(0, 3).map((g) => (
            <Badge key={g.id} variant="outline" className="text-[10px]">
              {g.name}
            </Badge>
          ))}
        </div>
      </div>
    </a>
  )
}
