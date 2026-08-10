'use client'

import { use, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { DetailHero } from '@/components/kami/detail-hero'
import { discoverApi } from '@/lib/api/discover'
import { setPendingEpisode } from '@/lib/watch-session'
import { mapApiItemToAnime } from '@/lib/api/discover-adapter'
import { formatDuration } from '@/lib/mock-data'
import { getUserFacingError } from '@/lib/api/errors'
import type { ApiContentDetailResponse } from '@/types/api/discover'

interface SeriesDetailPageProps {
  params: Promise<{ slug: string; locale: string }>
}

export default function SeriesDetailPage({ params }: SeriesDetailPageProps) {
  const { slug, locale } = use(params)

  const [detail, setDetail] = useState<ApiContentDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSeason, setSelectedSeason] = useState(1)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setDetail(null)
    setSelectedSeason(1)

    discoverApi
      .itemBySlug(slug)
      .then((data) => {
        if (cancelled) return
        setDetail(data)
      })
      .catch((err) => {
        if (cancelled) return
        setError(getUserFacingError(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  // Pre-warm the default (first) episode's stream while the user browses.
  // The first play of an episode pays a one-time Plex→Jellyfin bridge (up
  // to 30-90s on a cold cache); warming it here in the background means
  // /watch starts in ~2s instead of showing a long "Chargement du flux"
  // spinner. Other episodes still bridge on demand if clicked directly.
  useEffect(() => {
    if (!detail || detail.item.type === 'movie' || detail.item.format === 'movie') return
    const firstEpisode = detail.seasons.find((s) => s.episodes.length > 0)?.episodes[0]
    if (!firstEpisode) return
    const controller = new AbortController()
    discoverApi
      .streamUrl(detail.item.slug, {
        episodeId: firstEpisode.id,
        signal: controller.signal,
        timeoutMs: 90_000,
      })
      .catch(() => {
        /* Background warm-up only — /watch re-resolves on failure. */
      })
    return () => controller.abort()
  }, [detail])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-8 text-muted-foreground" />
      </div>
    )
  }

  // Unknown / unpublished slug → the API answered 404.
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  // Guard: the /series/ path must only ever show actual series — a movie
  // published in the catalog must stay on its /movies/ page.
  if (!detail || detail.item.type === 'movie' || detail.item.format === 'movie') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Série introuvable</p>
      </div>
    )
  }

  const anime = mapApiItemToAnime(detail.item)
  const seasons = detail.seasons
  // Fall back to the first season when the requested number isn't present
  // (e.g. seasons starting at 0 or non-contiguous numbering).
  const currentSeason = seasons.find((s) => s.number === selectedSeason) ?? seasons[0]
  const seasonEpisodes = currentSeason?.episodes ?? []
  const firstEpisode = seasons.find((s) => s.episodes.length > 0)?.episodes[0]
  const playLabel = firstEpisode ? `LECTURE E${firstEpisode.number}` : 'LECTURE'
  // Clean URL: the watch page auto-selects the first episode (or resumes from
  // saved progress) — no `?ep=` in the address bar.
  const playHref = firstEpisode
    ? `/${locale}/watch/${anime.slug}`
    : undefined

  return (
    <div className="min-h-screen bg-background">
      <DetailHero anime={anime} playLabel={playLabel} playHref={playHref} />

      {/* Episodes Section */}
      {seasons.length > 0 && (
        <div className="px-6 py-8 md:px-10 lg:px-16">
          {/* Season Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Saison {currentSeason?.number ?? 1}</h2>
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
                  key={season.id}
                  variant={currentSeason?.id === season.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSeason(season.number)}
                >
                  Saison {season.number}
                </Button>
              ))}
            </div>
          )}

          {/* Episodes Grid */}
          {seasonEpisodes.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {seasonEpisodes.map((episode) => (
                <Link
                  key={episode.id}
                  href={`/${locale}/watch/${anime.slug}`}
                  onClick={() => setPendingEpisode(episode.id)}
                  className="group block"
                >
                  <div className="relative aspect-video overflow-hidden rounded-lg">
                    {episode.thumbnailUrl ? (
                      <Image
                        src={episode.thumbnailUrl}
                        alt={episode.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <span className="text-4xl font-bold text-muted-foreground/40">
                          {episode.number}
                        </span>
                      </div>
                    )}
                    {episode.duration > 0 && (
                      <span className="absolute bottom-2 right-2 rounded bg-background/80 px-1.5 py-0.5 text-xs backdrop-blur">
                        {formatDuration(episode.duration)}
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <span className="text-xs font-medium text-muted-foreground">{anime.title}</span>
                    <h3 className="mt-0.5 text-sm font-semibold">
                      E{episode.number} – {episode.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {episode.isDubbed ? 'Doublage' : ''}
                      {episode.isDubbed && episode.isSubbed ? ' | ' : ''}
                      {episode.isSubbed ? 'Sous-titrage' : ''}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              Aucun épisode disponible pour cette saison.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
