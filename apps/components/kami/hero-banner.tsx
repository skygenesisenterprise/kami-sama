'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Bookmark, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import type { Anime } from '@/types/anime'

interface HeroBannerProps {
  items: Anime[]
}

const SLIDE_DURATION = 8000

export function HeroBanner({ items }: HeroBannerProps) {
  const { isAuthenticated } = useAuth()
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [isPaused, setIsPaused] = React.useState(false)

  React.useEffect(() => {
    if (activeIndex >= items.length) setActiveIndex(0)
  }, [activeIndex, items.length])

  const selectSlide = React.useCallback(
    (index: number) => {
      setActiveIndex((index + items.length) % items.length)
    },
    [items.length],
  )

  React.useEffect(() => {
    if (items.length < 2 || isPaused) return

    const timer = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % items.length)
    }, SLIDE_DURATION)

    return () => window.clearInterval(timer)
  }, [isPaused, items.length])

  if (items.length === 0) return null

  const anime = items[activeIndex]
  const genres = anime.genres.slice(0, 3).map((genre) => genre.name).join(', ')

  return (
    <section
      className="relative isolate min-h-[min(57rem,calc(100dvh-3rem))] overflow-hidden bg-paper text-ink"
      aria-roledescription="carousel"
      aria-label="Anime à la une"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          aria-hidden={index !== activeIndex}
          className={cn(
            'absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none',
            index === activeIndex ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
        >
          <Image
            src={item.banner || '/placeholder.jpg'}
            alt={item.title}
            fill
            priority={index === 0}
            loading={index === 0 ? 'eager' : undefined}
            sizes="100vw"
            className="object-cover object-[63%_center] md:object-center"
          />
        </div>
      ))}

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(13,13,13,0.98)_0%,rgba(13,13,13,0.9)_24%,rgba(13,13,13,0.58)_43%,rgba(13,13,13,0.12)_67%,rgba(13,13,13,0)_86%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] bg-linear-to-t from-paper via-paper/55 to-transparent" />

      <div className="relative z-10 flex min-h-[min(57rem,calc(100dvh-3rem))] items-center px-5 pb-15 pt-20 sm:px-8 lg:px-12 xl:px-20">
        <div key={anime.id} className="max-w-xl animate-[hero-copy-in_450ms_ease-out] motion-reduce:animate-none">
          <h1 className="font-display text-5xl font-extrabold leading-[0.9] tracking-[-0.045em] text-ink drop-shadow-[0_3px_18px_rgba(0,0,0,0.55)] sm:text-6xl lg:text-7xl">
            {anime.title}
          </h1>
          {anime.japaneseTitle && (
            <p className="mt-3 font-display text-lg font-semibold tracking-wide text-ink/90 sm:text-xl">
              {anime.japaneseTitle}
            </p>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-x-1.5 gap-y-2 text-sm text-ink-soft">
            <span className="bg-ink/20 px-1.5 py-0.5 text-xs font-bold text-ink">{anime.ageRating}</span>
            <span aria-hidden="true">•</span>
            <span>Sous-titrage | Doublage</span>
            {genres && (
              <>
                <span aria-hidden="true">•</span>
                <span>{genres}</span>
              </>
            )}
          </div>

          <p className="mt-2 line-clamp-3 max-w-lg text-sm leading-6 text-ink/90 sm:text-base sm:leading-6">
            {anime.synopsis}
          </p>

          <div className="mt-7 flex items-center gap-2">
            <Button
              asChild
              className="h-10 rounded-none bg-primary px-4 text-xs font-bold uppercase text-primary-foreground transition-colors duration-200 hover:bg-stamp-dim focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            >
              <Link href={`/watch/${anime.slug}`}>
                <Play className="size-4 fill-current" aria-hidden="true" />
                Lecture E1
              </Link>
            </Button>
            {isAuthenticated && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-10 rounded-none border-2 border-primary bg-transparent text-primary transition-colors duration-200 hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                aria-label={`Ajouter ${anime.title} à votre Watchlist`}
              >
                <Bookmark className="size-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => selectSlide(activeIndex - 1)}
            className="absolute left-2 top-[44%] z-20 hidden size-12 -translate-y-1/2 items-center justify-center text-ink transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink md:flex"
            aria-label="Anime précédent"
          >
            <ChevronLeft className="size-9" strokeWidth={2.5} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => selectSlide(activeIndex + 1)}
            className="absolute right-2 top-[44%] z-20 hidden size-12 -translate-y-1/2 items-center justify-center text-ink transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink md:flex"
            aria-label="Anime suivant"
          >
            <ChevronRight className="size-9" strokeWidth={2.5} aria-hidden="true" />
          </button>
        </>
      )}

      {items.length > 1 && (
        <div
          className="absolute bottom-52 left-5 z-20 flex items-center gap-2 sm:left-8 lg:left-12 xl:left-20"
          role="tablist"
          aria-label="Sélection d’anime à la une"
        >
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Afficher ${item.title}`}
              onClick={() => selectSlide(index)}
              className={cn(
                'h-2 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
                index === activeIndex ? 'w-6 bg-primary' : 'w-6 bg-ink/50 hover:bg-ink/80',
              )}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes hero-copy-in {
          from { opacity: 0; transform: translateY(0.75rem); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  )
}
