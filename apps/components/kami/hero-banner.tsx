'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Info, Play, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GenreTag } from './genre-tag'
import { RatingBadge } from './rating-badge'
import { cn } from '@/lib/utils'
import type { Anime } from '@/types/anime'

export function HeroBanner({ items }: { items: Anime[] }) {
  const [active, setActive] = useState(0)

  const next = useCallback(() => {
    setActive((i) => (i + 1) % items.length)
  }, [items.length])

  useEffect(() => {
    const t = setInterval(next, 8000)
    return () => clearInterval(t)
  }, [next])

  const anime = items[active]

  return (
    <section className="relative h-[72vh] min-h-[520px] w-full overflow-hidden">
      {items.map((item, i) => (
        <div
          key={item.id}
          className={cn(
            'absolute inset-0 transition-opacity duration-1000',
            i === active ? 'opacity-100' : 'opacity-0',
          )}
          aria-hidden={i !== active}
        >
          <Image
            src={item.banner || '/placeholder.svg'}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ))}

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

      <div className="relative z-10 flex h-full items-end pb-14 md:items-center md:pb-0">
        <div className="w-full max-w-2xl px-4 md:px-8 lg:px-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/50 px-3 py-1 text-xs font-medium backdrop-blur">
            <span className="size-1.5 rounded-full bg-primary" />
            Featured on Kami-Sama
          </span>

          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance md:text-6xl">
            {anime.title}
          </h1>
          <p className="mt-1 text-base text-muted-foreground md:text-lg">
            {anime.japaneseTitle}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <RatingBadge rating={anime.rating} />
            <span className="text-sm text-muted-foreground">{anime.year}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">{anime.ageRating}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-sm capitalize text-muted-foreground">{anime.status}</span>
          </div>

          <p className="mt-4 line-clamp-3 max-w-xl text-sm leading-relaxed text-foreground/80 md:text-base">
            {anime.synopsis}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {anime.genres.map((genre) => (
              <GenreTag key={genre.id} genre={genre} />
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-11 gap-2 px-5 text-sm font-semibold">
              <Link href={`/watch/${anime.slug}`}>
                <Play className="size-4 fill-current" data-icon="inline-start" />
                Watch Now
              </Link>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="h-11 gap-2 px-5 text-sm font-semibold"
            >
              <Plus className="size-4" data-icon="inline-start" />
              Add to Library
            </Button>
            <Button asChild size="lg" variant="ghost" className="h-11 gap-2 px-4 text-sm font-semibold">
              <Link href={`/anime/${anime.slug}`}>
                <Info className="size-4" data-icon="inline-start" />
                More Details
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-6 left-4 z-10 flex gap-2 md:left-8 lg:left-12">
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show ${item.title}`}
            className={cn(
              'h-1 rounded-full transition-all',
              i === active ? 'w-8 bg-primary' : 'w-4 bg-foreground/30 hover:bg-foreground/50',
            )}
          />
        ))}
      </div>
    </section>
  )
}
