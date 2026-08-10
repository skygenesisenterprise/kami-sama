'use client'

import { use, useEffect, useState } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { DetailHero } from '@/components/kami/detail-hero'
import { discoverApi } from '@/lib/api/discover'
import { mapApiItemToAnime } from '@/lib/api/discover-adapter'
import { ApiError, getUserFacingError } from '@/lib/api/errors'
import type { ApiContentDetailResponse } from '@/types/api/discover'

interface MovieDetailPageProps {
  params: Promise<{ slug: string; locale: string }>
}

export default function MovieDetailPage({ params }: MovieDetailPageProps) {
  const { slug, locale } = use(params)

  const [detail, setDetail] = useState<ApiContentDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setDetail(null)

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

  // Pre-warm the stream while the user browses the detail page. The first
  // play of a title pays a one-time Plex→Jellyfin bridge (writes a .strm,
  // waits for the Jellyfin scan — up to 30-90s on a cold cache). Warming it
  // here in the background means /watch starts in ~2s instead of making the
  // user stare at the "Chargement du flux" spinner.
  useEffect(() => {
    if (!detail || (detail.item.type !== 'movie' && detail.item.format !== 'movie')) return
    const controller = new AbortController()
    discoverApi
      .streamUrl(detail.item.slug, {
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

  // Guard: the /movies/ path must only ever show actual movies — a series
  // published in the catalog must stay on its /series/ page.
  if (!detail || (detail.item.type !== 'movie' && detail.item.format !== 'movie')) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Film introuvable</p>
      </div>
    )
  }

  return (
    <DetailHero
      anime={mapApiItemToAnime(detail.item)}
      playLabel="LECTURE"
      playHref={`/${locale}/watch/${detail.item.slug}`}
    />
  )
}
