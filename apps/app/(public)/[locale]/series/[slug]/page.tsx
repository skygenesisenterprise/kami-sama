'use client'

import { use, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  Bookmark,
  MoreVertical,
  Play,
  Plus,
  Share2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getAnime, getEpisodes, formatDuration } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

interface SeriesDetailPageProps {
  params: Promise<{ slug: string; locale: string }>
}

export default function SeriesDetailPage({ params }: SeriesDetailPageProps) {
  const { slug } = use(params)
  const t = useTranslations('Public.series')
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [showAllInfo, setShowAllInfo] = useState(false)

  const anime = getAnime(slug)
  if (!anime) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Série introuvable</p>
      </div>
    )
  }

  const episodes = getEpisodes(anime.id)
  const seasonEpisodes = episodes.filter((ep) => ep.season === selectedSeason)
  const seasons = anime.seasons

  return (
    <div className="min-h-screen bg-background">
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
              <Badge variant="secondary" className="bg-white/20 text-white">
                {anime.ageRating}
              </Badge>
              <span>•</span>
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
                Note Moyenne: {anime.rating.toFixed(1)} ({(anime.ratingCount / 1000).toFixed(1)}K)
              </span>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex items-center gap-3">
              <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Play className="size-5 fill-current" />
                LECTURE E1
              </Button>
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
          <p className="mt-6 text-sm leading-relaxed text-white/70">
            {anime.synopsis}
          </p>

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
                    <span className="mr-2 inline-block rounded bg-white/10 px-1.5 py-0.5 text-[11px] font-bold text-white">
                      {anime.ageRating}
                    </span>
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

      {/* Episodes Section */}
      <div className="px-6 py-8 md:px-10 lg:px-16">
        {/* Season Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Saison {selectedSeason}</h2>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="gap-2 text-sm text-muted-foreground">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
              LES + ANCIENS
            </Button>
            <Button variant="ghost" className="gap-2 text-sm text-muted-foreground">
              <MoreVertical className="size-4" />
              OPTIONS
            </Button>
          </div>
        </div>

        {/* Season Selector */}
        {seasons.length > 1 && (
          <div className="mt-4 flex gap-2">
            {seasons.map((season) => (
              <Button
                key={season.number}
                variant={selectedSeason === season.number ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSeason(season.number)}
              >
                Saison {season.number}
              </Button>
            ))}
          </div>
        )}

        {/* Episodes Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {seasonEpisodes.map((episode) => (
            <Link
              key={episode.id}
              href={`/watch/${anime.slug}?ep=${episode.id}`}
              className="group block"
            >
              <div className="relative aspect-video overflow-hidden rounded-lg">
                <Image
                  src={episode.thumbnail}
                  alt={episode.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute bottom-2 right-2 rounded bg-background/80 px-1.5 py-0.5 text-xs backdrop-blur">
                  {formatDuration(episode.duration)}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-xs font-medium text-muted-foreground">{anime.title}</span>
                <h3 className="mt-0.5 text-sm font-semibold">
                  E{episode.number} – {episode.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Doublage | Sous-titrage
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
