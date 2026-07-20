'use client'

import { use, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  CaretLeft,
  CaretRight,
  Clock,
  List,
  ArrowsOut,
  Pause,
  Play,
  SkipForward,
  SpeakerSimpleHigh,
  SpeakerSimpleX,
  Gear,
  ClosedCaptioning,
  Eye,
  Headphones,
  Warning,
} from 'phosphor-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ScrollReveal } from '@/components/kami/scroll-reveal'
import { cn } from '@/lib/utils'
import {
  getAnime,
  getEpisode,
  getEpisodes,
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
  const [progress, setProgress] = useState(35)

  const anime = getAnime(slug)
  const allEpisodes = useMemo(() => (anime ? getEpisodes(anime.id) : []), [anime])

  const currentEpisode = useMemo(() => {
    if (!anime) return null
    if (epId) return getEpisode(anime.id, epId) ?? allEpisodes[1] ?? allEpisodes[0]
    return allEpisodes[1] ?? allEpisodes[0]
  }, [anime, epId, allEpisodes])

  const currentIndex = currentEpisode
    ? allEpisodes.findIndex((e) => e.id === currentEpisode.id)
    : -1
  const prevEpisode = currentIndex > 0 ? allEpisodes[currentIndex - 1] : null
  const nextEpisode =
    currentIndex < allEpisodes.length - 1 ? allEpisodes[currentIndex + 1] : null

  if (!anime || !currentEpisode) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
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

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = Math.round((x / rect.width) * 100)
    setProgress(Math.min(100, Math.max(0, pct)))
  }

  return (
    <TooltipProvider>
      <div className="relative min-h-dvh bg-paper">
        <div className="mesh-gradient-bg" />

        {/* ── Video Player ── */}
        <div className="relative w-full bg-paper">
          <div className="relative mx-auto aspect-video max-h-[80vh] w-full overflow-hidden">
            <img
              src={anime.banner || '/placeholder.svg'}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />

            {!isPlaying && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40">
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  className="group flex size-20 items-center justify-center rounded-full bg-stamp/90 text-white shadow-2xl shadow-stamp/30 backdrop-blur-sm transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-110 hover:bg-stamp active:scale-[0.97]"
                >
                  <Play className="ml-1 size-9 fill-current" weight="fill" />
                </button>
                <p className="mt-4 text-sm font-medium text-white/60">
                  {formatDuration(currentEpisode.duration)}
                </p>
              </div>
            )}

            <div
              className={cn(
                'absolute inset-0 z-20 flex flex-col justify-end transition-opacity duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]',
                isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100',
              )}
            >
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />

              <div className="relative px-4 pb-4 pt-16 md:px-6">
                {/* Progress bar - full width */}
                <div
                  className="group/progress w-full"
                  onClick={handleProgressClick}
                >
                  <div className="relative h-1.5 cursor-pointer overflow-hidden rounded-full bg-white/15 transition-all duration-500 group-hover/progress:h-2.5">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-stamp transition-all duration-300 group-hover/progress:shadow-[0_0_12px_rgba(244,117,33,0.6)]"
                      style={{ width: `${progress}%` }}
                    />
                    <div
                      className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-stamp opacity-0 shadow-lg shadow-stamp/40 transition-all duration-300 group-hover/progress:opacity-100"
                      style={{ left: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Controls row - full width */}
                <div className="mt-3 flex w-full items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-10 text-white/80 hover:text-white hover:bg-white/10"
                          onClick={() => setIsPlaying(!isPlaying)}
                        >
                          {isPlaying ? (
                            <Pause className="size-5" weight="fill" />
                          ) : (
                            <Play className="ml-0.5 size-5" weight="fill" />
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
                          className="size-10 text-white/80 hover:text-white hover:bg-white/10"
                        >
                          <SkipForward className="size-5" weight="light" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Skip Intro</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-10 text-white/80 hover:text-white hover:bg-white/10"
                          onClick={() => setIsMuted(!isMuted)}
                        >
                          {isMuted ? (
                            <SpeakerSimpleX className="size-5" weight="light" />
                          ) : (
                            <SpeakerSimpleHigh className="size-5" weight="light" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{isMuted ? 'Unmute' : 'Mute'}</TooltipContent>
                    </Tooltip>

                    <span className="ml-2 text-sm tabular-nums text-white/50">
                      8:24 / {formatDuration(currentEpisode.duration)}
                    </span>
                  </div>

                  <div className="hidden items-center gap-2 md:flex">
                    <span className="text-sm font-medium text-white/80">
                      EP {currentEpisode.number} — {currentEpisode.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-10 text-white/80 hover:text-white hover:bg-white/10"
                        >
                          <ClosedCaptioning className="size-5" weight="light" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Subtitles</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-10 text-white/80 hover:text-white hover:bg-white/10"
                        >
                          <Gear className="size-5" weight="light" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Settings</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-10 text-white/80 hover:text-white hover:bg-white/10"
                        >
                          <ArrowsOut className="size-5" weight="light" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Fullscreen</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>

            {prevEpisode && (
              <Link
                href={`/watch/${slug}?ep=${prevEpisode.id}`}
                className="group absolute left-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white/80 backdrop-blur-sm transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-black/70 hover:text-white hover:scale-110 active:scale-[0.95]"
                aria-label={`Previous: ${prevEpisode.title}`}
              >
                <CaretLeft className="size-6" weight="light" />
              </Link>
            )}
            {nextEpisode && (
              <Link
                href={`/watch/${slug}?ep=${nextEpisode.id}`}
                className="group absolute right-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white/80 backdrop-blur-sm transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-black/70 hover:text-white hover:scale-110 active:scale-[0.95]"
                aria-label={`Next: ${nextEpisode.title}`}
              >
                <CaretRight className="size-6" weight="light" />
              </Link>
            )}
          </div>
        </div>

        {/* ── Content Below Player ── */}
        <div className="mx-auto max-w-350 px-4 pt-4 pb-20 md:px-8 md:pt-6 md:pb-28">
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_420px]">
            {/* ═══ Left Column: Episode Info ═══ */}
            <div className="min-w-0 space-y-10">
              <ScrollReveal>
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h1 className="font-display text-2xl font-bold leading-tight md:text-3xl">
                        {anime.title}
                      </h1>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <span className="text-sm font-semibold text-ink">
                          E{currentEpisode.number} — {currentEpisode.title}
                        </span>
                        <span className="text-ink-faint">·</span>
                        <span className="flex items-center gap-1.5 text-xs text-ink-faint">
                          <Clock className="size-3.5" weight="light" />
                          Disponible depuis le {currentEpisode.releaseDate}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="mt-5 flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-sm text-ink-soft">
                          <Eye className="size-4" weight="light" />
                          <span className="font-medium">65.4K</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-ink-soft">
                          <List className="size-4" weight="light" />
                          <span className="font-medium">1.5K</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2 pt-1">
                      {prevEpisode && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="group rounded-full border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold text-ink-soft transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-stamp/30 hover:bg-stamp-wash hover:text-stamp active:scale-[0.97]"
                        >
                          <Link href={`/watch/${slug}?ep=${prevEpisode.id}`}>
                            Prev
                            <span className="flex size-5 items-center justify-center rounded-full bg-black/5 transition-all duration-300 group-hover:bg-stamp/15 group-hover:-translate-x-0.5">
                              <CaretLeft className="size-3" weight="light" />
                            </span>
                          </Link>
                        </Button>
                      )}
                      {nextEpisode && (
                        <Button
                          size="sm"
                          asChild
                          className="group rounded-full bg-stamp/90 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-stamp/20 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-stamp active:scale-[0.97]"
                        >
                          <Link href={`/watch/${slug}?ep=${nextEpisode.id}`}>
                            Next
                            <span className="flex size-5 items-center justify-center rounded-full bg-white/15 transition-all duration-300 group-hover:bg-white/25 group-hover:translate-x-0.5">
                              <CaretRight className="size-3" weight="light" />
                            </span>
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>

                  {currentEpisode.description && (
                    <p className="mt-5 text-sm leading-relaxed text-ink-faint">
                      {currentEpisode.description}
                    </p>
                  )}

                  {/* Audio & Subtitles */}
                  <div className="mt-6 space-y-3">
                    <div className="flex items-start gap-3">
                      <Headphones className="mt-0.5 size-4 shrink-0 text-ink-faint" weight="light" />
                      <div>
                        <span className="text-xs font-semibold text-ink">Audio</span>
                        <p className="text-xs text-ink-faint">Japanese</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ClosedCaptioning className="mt-0.5 size-4 shrink-0 text-ink-faint" weight="light" />
                      <div>
                        <span className="text-xs font-semibold text-ink">Sous-titres</span>
                        <p className="text-xs text-ink-faint">
                          Français, English, Deutsch, Español (América Latina), Español (España), Italiano, Polski, Português (Brasil), Русский, العربية
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content Warning */}
                  <div className="mt-6 rounded-2xl bg-white/3 p-4 ring-1 ring-white/5">
                    <div className="flex items-center gap-2">
                      <Warning className="size-4 text-gold" weight="fill" />
                      <span className="text-xs font-semibold text-ink">Avertissement lié au contenu</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="rounded-full border-white/5 bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold text-ink"
                      >
                        {anime.ageRating}
                      </Badge>
                      <span className="text-xs text-ink-faint">
                        {anime.genres.map((g) => g.name).join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* ═══ Right Column: Episode List ═══ */}
            <aside className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Up Next */}
                {nextEpisode && (
                  <ScrollReveal delay={100}>
                    <div className="rounded-4xl bg-paper-dim/40 p-2 ring-1 ring-white/5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-rotate-[0.5deg] hover:scale-[1.01]">
                      <div className="rounded-[calc(2rem-0.375rem)] bg-paper-raised/80 p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
                        <span className="mb-3 block rounded-full bg-stamp/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-stamp">
                          Épisode suivant
                        </span>
                        <Link
                          href={`/watch/${slug}?ep=${nextEpisode.id}`}
                          className="group flex gap-3"
                        >
                          <div className="relative h-22 w-36 shrink-0 overflow-hidden rounded-xl bg-paper-dim">
                            <img
                              src={nextEpisode.thumbnail || anime.cover || '/placeholder.svg'}
                              alt={nextEpisode.title}
                              className="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-all duration-500 group-hover:opacity-100">
                              <Play className="size-7 fill-white text-white" weight="fill" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-stamp">
                              EP {nextEpisode.number}
                            </p>
                            <h5 className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-ink/80">
                              {nextEpisode.title}
                            </h5>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </ScrollReveal>
                )}

                {/* Previous Episode */}
                {prevEpisode && (
                  <ScrollReveal delay={150}>
                    <div className="rounded-4xl bg-paper-dim/40 p-2 ring-1 ring-white/5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:rotate-[0.5deg] hover:scale-[1.01]">
                      <div className="rounded-[calc(2rem-0.375rem)] bg-paper-raised/80 p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
                        <span className="mb-3 block rounded-full bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-faint">
                          Épisode précédent
                        </span>
                        <Link
                          href={`/watch/${slug}?ep=${prevEpisode.id}`}
                          className="group flex gap-3"
                        >
                          <div className="relative h-22 w-36 shrink-0 overflow-hidden rounded-xl bg-paper-dim">
                            <img
                              src={prevEpisode.thumbnail || anime.cover || '/placeholder.svg'}
                              alt={prevEpisode.title}
                              className="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-all duration-500 group-hover:opacity-100">
                              <Play className="size-7 fill-white text-white" weight="fill" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-ink-faint">
                              EP {prevEpisode.number}
                            </p>
                            <h5 className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-ink/80">
                              {prevEpisode.title}
                            </h5>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </ScrollReveal>
                )}

                {/* Voir plus d'épisodes */}
                <ScrollReveal delay={200}>
                  <div className="rounded-4xl bg-paper-dim/40 p-2 ring-1 ring-white/5">
                    <Link
                      href={`/anime/${slug}`}
                      className="group flex items-center justify-center gap-2 rounded-[calc(2rem-0.375rem)] bg-paper-raised/80 py-3 text-xs font-semibold text-ink-soft transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-stamp-wash hover:text-stamp"
                    >
                      Voir plus d&apos;épisodes
                      <CaretRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" weight="light" />
                    </Link>
                  </div>
                </ScrollReveal>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
