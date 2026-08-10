'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Bookmark, Play, Plus, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Anime } from '@/types/anime'
import { cn } from '@/lib/utils'

interface DetailHeroProps {
  anime: Anime
  /** Label of the primary play action, e.g. "LECTURE" or "LECTURE E1". */
  playLabel?: string
  /**
   * Where the primary play action navigates (e.g. `/watch/<slug>` or
   * `/watch/<slug>?ep=<firstEpisodeId>`). When omitted the button stays
   * inert — keep it optional so callers that don't want the action don't
   * get one forced on them.
   */
  playHref?: string
}

/**
 * Shared header for the public detail pages (series & movies): the backdrop
 * hero with title / meta / rating / actions, followed by the synopsis and the
 * collapsible "VOIR PLUS" technical details. Both detail pages render the same
 * block so it lives here instead of being duplicated.
 */
export function DetailHero({ anime, playLabel = 'LECTURE', playHref }: DetailHeroProps) {
  const [showAllInfo, setShowAllInfo] = useState(false)

  return (
    <>
      {/* Hero Banner */}
      <div className="relative h-[70vh] min-h-125 w-full overflow-hidden">
        <Image
          src={anime.banner || anime.cover}
          alt={anime.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-background/80 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-16">
          <div className="max-w-3xl">
            {/* Title */}
            <h1 className="font-display text-5xl font-bold uppercase tracking-tight text-white md:text-7xl">
              {anime.title}
            </h1>

            {/* Meta info */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-white/80">
              {anime.ageRating && (
                <>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {anime.ageRating}
                  </Badge>
                  <span>•</span>
                </>
              )}
              <span>Sous-titrage | Doublage</span>
              <span>•</span>
              {anime.genres.map((genre, i) => (
                <span key={genre.id}>
                  <Link
                    href={`/catalog?genre=${genre.id}`}
                    className="hover:text-primary transition-colors"
                  >
                    {genre.name}
                  </Link>
                  {i < anime.genres.length - 1 && ', '}
                </span>
              ))}
            </div>

            {/* Rating */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={cn(
                      'size-5',
                      star <= Math.round(anime.rating / 2)
                        ? 'fill-yellow-500 text-yellow-500'
                        : 'fill-white/20 text-white/20'
                    )}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-white/80">
                Note Moyenne: {anime.rating.toFixed(1)} ({anime.ratingCount > 0 ? (anime.ratingCount / 1000).toFixed(1) : '0.0'}K)
              </span>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex items-center gap-3">
              {playHref ? (
                <Link href={playHref}>
                  <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                    <Play className="size-5 fill-current" />
                    {playLabel}
                  </Button>
                </Link>
              ) : (
                <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Play className="size-5 fill-current" />
                  {playLabel}
                </Button>
              )}
              <Button variant="outline" size="icon" className="size-10 border-white/30 text-white hover:bg-white/10">
                <Bookmark className="size-5" />
              </Button>
              <Button variant="outline" size="icon" className="size-10 border-white/30 text-white hover:bg-white/10">
                <Plus className="size-5" />
              </Button>
              <Button variant="outline" size="icon" className="size-10 border-white/30 text-white hover:bg-white/10">
                <Share2 className="size-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Synopsis + Details */}
      <div className="px-6 md:px-10 lg:px-16">
        <div className="max-w-3xl">
          {/* Synopsis */}
          {anime.synopsis && (
            <p className="mt-6 text-sm leading-relaxed text-white/70">
              {anime.synopsis}
            </p>
          )}

          {/* Toggle VOIR PLUS / VOIR MOINS + Collapsible info section */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowAllInfo((prev) => !prev)}
              className="text-sm font-semibold text-[#e50914] transition-colors hover:text-[#ff3d47]"
            >
              {showAllInfo ? 'VOIR MOINS' : 'VOIR PLUS'}
            </button>

            <div
              className={`grid transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                showAllInfo ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden">
                {/* Divider */}
                <div className="mt-6 border-t border-white/10" />

                {/* Audio */}
                <div className="flex items-baseline justify-between py-4">
                  <span className="text-sm font-bold text-white">Audio</span>
                  <span className="text-sm text-white/60">
                    Japanese, Français, English, Deutsch, Español (América Latina), Español (España), Italiano, Polski, Português (Brasil)
                  </span>
                </div>

                {/* Divider */}
                <div className="border-t border-white/10" />

                {/* Sous-titres */}
                <div className="flex items-baseline justify-between py-4">
                  <span className="text-sm font-bold text-white">Sous-titres</span>
                  <span className="max-w-[60%] text-right text-sm text-white/60">
                    Français, English, Bahasa Indonesia, Bahasa Melayu, Deutsch, Español (América Latina), Español (España), Italiano, Polski, Português (Brasil), Tiếng Việt, Русский, العربية, 中文（简体）, 中文（繁體）
                  </span>
                </div>

                {/* Divider */}
                <div className="border-t border-white/10" />

                {/* Avertissement lié au contenu */}
                <div className="flex items-baseline justify-between py-4">
                  <span className="text-sm font-bold text-white">Avertissement lié au contenu</span>
                  <span className="max-w-[60%] text-right text-sm text-white/60">
                    {anime.ageRating && (
                      <span className="mr-2 inline-block rounded bg-white/10 px-1.5 py-0.5 text-[11px] font-bold text-white">
                        {anime.ageRating}
                      </span>
                    )}
                    {anime.genres.map((g) => g.name).join(', ')}
                  </span>
                </div>

                {/* Divider */}
                <div className="border-t border-white/10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
