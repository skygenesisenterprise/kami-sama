'use client'

import { use, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  List,
  Maximize,
  Pause,
  Play,
  Share2,
  SkipForward,
  Volume2,
  VolumeX,
  Settings,
  Subtitles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { GenreTag } from '@/components/kami/genre-tag'
import { RatingBadge } from '@/components/kami/rating-badge'
import { cn } from '@/lib/utils'
import {
  getAnime,
  getEpisode,
  getEpisodes,
  getReviews,
  formatDuration,
} from '@/lib/mock-data'

export default function WatchPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const searchParams = useSearchParams()
  const epId = searchParams.get('ep')

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress] = useState(35)

  const anime = getAnime(slug)
  const allEpisodes = useMemo(() => (anime ? getEpisodes(anime.id) : []), [anime])

  const currentEpisode = useMemo(() => {
    if (!anime) return null
    if (epId) return getEpisode(anime.id, epId) ?? allEpisodes[0]
    return allEpisodes[0]
  }, [anime, epId, allEpisodes])

  const currentIndex = currentEpisode
    ? allEpisodes.findIndex((e) => e.id === currentEpisode.id)
    : -1
  const prevEpisode = currentIndex > 0 ? allEpisodes[currentIndex - 1] : null
  const nextEpisode =
    currentIndex < allEpisodes.length - 1 ? allEpisodes[currentIndex + 1] : null

  const reviews = useMemo(
    () => (anime ? getReviews(anime.id) : []),
    [anime],
  )

  const seasons = useMemo(() => {
    if (!anime) return []
    const map = new Map<number, typeof allEpisodes>()
    for (const ep of allEpisodes) {
      const list = map.get(ep.season) ?? []
      list.push(ep)
      map.set(ep.season, list)
    }
    return Array.from(map.entries()).map(([season, eps]) => ({
      season,
      title: anime.seasons.find((s) => s.number === season)?.title ?? `Season ${season}`,
      episodes: eps,
    }))
  }, [anime, allEpisodes])

  if (!anime || !currentEpisode) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold">Episode not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The episode you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button asChild variant="secondary" className="mt-4">
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* ── Video Player ──────────────────────────────────────────── */}
        <div className="relative w-full bg-black">
          <div className="relative mx-auto aspect-video max-h-[80vh] overflow-hidden">
            {/* Poster */}
            <img
              src={anime.banner || '/placeholder.svg'}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />

            {/* Center Play Button (when paused) */}
            {!isPlaying && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/30">
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  className="flex size-20 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/40 backdrop-blur-sm transition-all hover:scale-110 hover:bg-primary"
                >
                  <Play className="ml-1 size-9 fill-current" />
                </button>
                <p className="mt-4 text-sm font-medium text-white/80">
                  {formatDuration(currentEpisode.duration)}
                </p>
              </div>
            )}

            {/* Controls Overlay */}
            <div
              className={cn(
                'absolute inset-0 z-20 flex flex-col justify-end transition-opacity duration-300',
                isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100',
              )}
            >
              {/* Gradient fade */}
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />

              <div className="relative px-4 pb-4 pt-16 md:px-6">
                {/* Progress bar */}
                <div className="group/progress mx-auto max-w-6xl">
                  <div className="relative h-1.5 cursor-pointer rounded-full bg-white/20 transition-all group-hover/progress:h-2.5">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all group-hover/progress:shadow-[0_0_8px_rgba(244,117,33,0.5)]"
                      style={{ width: `${progress}%` }}
                    />
                    <div
                      className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary opacity-0 shadow-lg transition-opacity group-hover/progress:opacity-100"
                      style={{ left: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Controls row */}
                <div className="mx-auto mt-3 flex max-w-6xl items-center justify-between">
                  {/* Left controls */}
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-10 text-white hover:text-white hover:bg-white/10"
                          onClick={() => setIsPlaying(!isPlaying)}
                        >
                          {isPlaying ? (
                            <Pause className="size-5 fill-current" />
                          ) : (
                            <Play className="ml-0.5 size-5 fill-current" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{isPlaying ? 'Pause' : 'Play'}</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-10 text-white hover:text-white hover:bg-white/10"
                        >
                          <SkipForward className="size-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Skip Intro</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-10 text-white hover:text-white hover:bg-white/10"
                          onClick={() => setIsMuted(!isMuted)}
                        >
                          {isMuted ? (
                            <VolumeX className="size-5" />
                          ) : (
                            <Volume2 className="size-5" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{isMuted ? 'Unmute' : 'Mute'}</TooltipContent>
                    </Tooltip>

                    <span className="ml-2 text-sm tabular-nums text-white/70">
                      8:24 / {formatDuration(currentEpisode.duration)}
                    </span>
                  </div>

                  {/* Center: Episode info */}
                  <div className="hidden items-center gap-2 md:flex">
                    <span className="text-sm font-medium text-white/90">
                      EP {currentEpisode.number} — {currentEpisode.title}
                    </span>
                  </div>

                  {/* Right controls */}
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-10 text-white hover:text-white hover:bg-white/10"
                        >
                          <Subtitles className="size-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Subtitles</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-10 text-white hover:text-white hover:bg-white/10"
                        >
                          <Settings className="size-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Settings</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-10 text-white hover:text-white hover:bg-white/10"
                        >
                          <Maximize className="size-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Fullscreen</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>

            {/* Prev / Next episode overlays */}
            {prevEpisode && (
              <Link
                href={`/watch/${slug}?ep=${prevEpisode.id}`}
                className="absolute left-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur-sm transition-all hover:bg-black/70 hover:scale-110"
                aria-label={`Previous: ${prevEpisode.title}`}
              >
                <ChevronLeft className="size-6" />
              </Link>
            )}
            {nextEpisode && (
              <Link
                href={`/watch/${slug}?ep=${nextEpisode.id}`}
                className="absolute right-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur-sm transition-all hover:bg-black/70 hover:scale-110"
                aria-label={`Next: ${nextEpisode.title}`}
              >
                <ChevronRight className="size-6" />
              </Link>
            )}
          </div>
        </div>

        {/* ── Content Below Player ──────────────────────────────────── */}
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            {/* Main Column */}
            <div className="min-w-0">
              {/* Episode Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <Link
                      href={`/anime/${slug}`}
                      className="font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      {anime.title}
                    </Link>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">
                      Season {currentEpisode.season}
                    </span>
                  </div>
                  <h1 className="mt-2 font-display text-xl font-bold md:text-2xl">
                    Episode {currentEpisode.number}: {currentEpisode.title}
                  </h1>
                </div>

                <div className="flex shrink-0 gap-2">
                  {prevEpisode && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/watch/${slug}?ep=${prevEpisode.id}`}>
                        <ChevronLeft className="mr-1 size-4" />
                        Prev
                      </Link>
                    </Button>
                  )}
                  {nextEpisode && (
                    <Button size="sm" asChild>
                      <Link href={`/watch/${slug}?ep=${nextEpisode.id}`}>
                        Next
                        <ChevronRight className="ml-1 size-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>

              {/* Meta Row */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <RatingBadge rating={anime.rating} />
                <Badge variant="secondary" className="text-xs">
                  {anime.ageRating}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {formatDuration(currentEpisode.duration)}
                </Badge>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3.5" />
                  {currentEpisode.releaseDate}
                </span>
                <div className="ml-auto flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="size-9">
                    <Share2 className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-9">
                    <List className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Description */}
              {currentEpisode.description && (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {currentEpisode.description}
                </p>
              )}

              <Separator className="my-6" />

              {/* Episode Tabs */}
              <Tabs defaultValue="episodes" className="w-full">
                <TabsList className="w-full justify-start gap-1 bg-transparent p-0">
                  <TabsTrigger
                    value="episodes"
                    className="rounded-md px-4 py-2 text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    Episodes
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="rounded-md px-4 py-2 text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    Reviews ({reviews.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="episodes" className="mt-4">
                  <div className="space-y-6">
                    {seasons.map((season) => (
                      <section key={season.season}>
                        <div className="mb-3 flex items-center justify-between">
                          <div>
                            <h3 className="font-display text-sm font-semibold">
                              {season.title}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {season.episodes.length} episodes
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {season.episodes.map((ep) => {
                            const isActive = ep.id === currentEpisode.id
                            return (
                              <Link
                                key={ep.id}
                                href={`/watch/${slug}?ep=${ep.id}`}
                                className={cn(
                                  'group flex items-center gap-3 rounded-lg p-2 transition-all',
                                  isActive
                                    ? 'bg-primary/10 ring-1 ring-primary/20'
                                    : 'hover:bg-accent/50',
                                )}
                              >
                                <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-md bg-secondary">
                                  <img
                                    src={ep.thumbnail || anime.cover || '/placeholder.svg'}
                                    alt={ep.title}
                                    className="size-full object-cover"
                                  />
                                  {isActive && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-primary/40">
                                      <Play className="size-5 fill-white text-white" />
                                    </div>
                                  )}
                                  <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[10px] font-medium text-white">
                                    {formatDuration(ep.duration)}
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span
                                    className={cn(
                                      'text-xs font-medium',
                                      isActive ? 'text-primary' : 'text-primary/60',
                                    )}
                                  >
                                    Ep {ep.number}
                                    {isActive && (
                                      <span className="ml-1 text-foreground/60">
                                        — Now Playing
                                      </span>
                                    )}
                                  </span>
                                  <h4 className="truncate text-sm font-medium text-foreground/90">
                                    {ep.title}
                                  </h4>
                                </div>
                              </Link>
                            )
                          })}
                        </div>
                      </section>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="mt-4">
                  <div className="space-y-4">
                    {reviews.map((r) => (
                      <div
                        key={r.id}
                        className="rounded-lg border border-border/40 bg-card/50 p-4"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {r.user.displayName[0]}
                          </div>
                          <div>
                            <span className="text-sm font-medium">
                              {r.user.displayName}
                            </span>
                            <p className="text-xs text-muted-foreground">{r.createdAt}</p>
                          </div>
                          <Badge
                            variant="secondary"
                            className="ml-auto text-xs text-gold"
                          >
                            ★ {r.rating}
                          </Badge>
                        </div>
                        <h5 className="mt-2 text-sm font-medium">{r.title}</h5>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {r.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* ── Sidebar ─────────────────────────────────────────────── */}
            <aside className="hidden lg:block">
              <div className="sticky top-20 space-y-4">
                {/* Up Next Card */}
                {nextEpisode && (
                  <div className="rounded-xl border border-border/40 bg-card p-4">
                    <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Up Next
                    </h4>
                    <Link
                      href={`/watch/${slug}?ep=${nextEpisode.id}`}
                      className="group flex gap-3"
                    >
                      <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-secondary">
                        <img
                          src={nextEpisode.thumbnail || anime.cover || '/placeholder.svg'}
                          alt={nextEpisode.title}
                          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                          <Play className="size-6 fill-white text-white" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-primary">
                          EP {nextEpisode.number}
                        </p>
                        <h5 className="mt-0.5 line-clamp-2 text-sm font-medium">
                          {nextEpisode.title}
                        </h5>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDuration(nextEpisode.duration)}
                        </p>
                      </div>
                    </Link>
                  </div>
                )}

                {/* Anime Info Card */}
                <Link
                  href={`/anime/${slug}`}
                  className="group block overflow-hidden rounded-xl border border-border/40 bg-card"
                >
                  <div className="relative aspect-2/3 overflow-hidden">
                    <Image
                      src={anime.cover || '/placeholder.svg'}
                      alt={anime.title}
                      fill
                      sizes="360px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <h3 className="font-display text-base font-bold">
                        {anime.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {anime.japaneseTitle}
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Stats Card */}
                <div className="rounded-xl border border-border/40 bg-card p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground">Rating</span>
                      <p className="mt-0.5 font-semibold text-gold">
                        ★ {anime.rating}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Year</span>
                      <p className="mt-0.5 font-semibold">{anime.year}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Status</span>
                      <p className="mt-0.5 font-semibold capitalize">{anime.status}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Episodes</span>
                      <p className="mt-0.5 font-semibold">{anime.totalEpisodes}</p>
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex flex-wrap gap-1.5">
                    {anime.genres.map((genre) => (
                      <GenreTag key={genre.id} genre={genre} asLink={false} />
                    ))}
                  </div>
                </div>

                {/* Quick Reviews */}
                {reviews.length > 0 && (
                  <div className="rounded-xl border border-border/40 bg-card p-4">
                    <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Recent Reviews
                    </h4>
                    <div className="space-y-3">
                      {reviews.slice(0, 2).map((r) => (
                        <div key={r.id}>
                          <div className="flex items-center gap-2">
                            <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                              {r.user.displayName[0]}
                            </div>
                            <span className="text-xs font-medium">
                              {r.user.displayName}
                            </span>
                            <Badge
                              variant="secondary"
                              className="ml-auto text-[10px] text-gold"
                            >
                              ★ {r.rating}
                            </Badge>
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {r.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
