'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Anime } from '@/types/anime'

interface HeroBannerProps {
  items: Anime[]
}

const SLIDE_DURATION = 8000

export function HeroBanner({ items }: HeroBannerProps) {
  const pathname = usePathname()
  const currentLocale = pathname?.split('/')[1] || 'fr'
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
  const genres = anime.genres.slice(0, 2).map((genre) => genre.name).join(', ')

  return (
    <section
      className="relative isolate mx-1 mt-2 h-[82.5vh] min-h-110 max-h-[88vh] overflow-hidden rounded-xl bg-[#1a1a1a] md:mx-2 md:mt-3 lg:mx-4 xl:mx-8"
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
            className="object-cover object-center"
          />
        </div>
      ))}

      <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-black/80 via-black/40 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-[#141414] via-[#141414]/60 to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-end px-4 pb-16 pt-20 sm:px-8 lg:px-12 xl:px-16">
        <div key={anime.id} className="max-w-3xl animate-[hero-copy-in_450ms_ease-out] motion-reduce:animate-none">
          <h1 className="font-display text-5xl font-black leading-[0.9] tracking-[-0.03em] text-white sm:text-6xl md:text-7xl lg:text-8xl xl:text-[7.5rem]">
            {anime.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-2 text-sm font-medium text-white/90">
            <span>{anime.totalEpisodes > 1 ? 'Série' : 'Film'}</span>
            {genres && (
              <>
                <span aria-hidden="true">•</span>
                <span>{genres}</span>
              </>
            )}
            <span aria-hidden="true">•</span>
            <span>{anime.year}</span>
            <span aria-hidden="true">•</span>
            <span className="flex items-center gap-1.5">
              <span className="flex size-6 items-center justify-center rounded border border-white/60 text-xs font-bold text-white">
                {anime.ageRating}
              </span>
            </span>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button
              asChild
              className="h-11 rounded-sm bg-white px-7 text-sm font-semibold text-black transition-colors duration-200 hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white"
            >
              <Link href={`/${currentLocale}/watch/${anime.slug}`}>
                <Play className="size-5 fill-current" aria-hidden="true" />
                Lecture
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-sm border-white/40 bg-white/10 px-7 text-sm font-semibold text-white backdrop-blur-sm transition-colors duration-200 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white"
            >
              <Link href={`/${currentLocale}/anime/${anime.slug}`}>
                Plus d&apos;infos
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes hero-copy-in {
          from { opacity: 0; transform: translateY(1rem); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  )
}
