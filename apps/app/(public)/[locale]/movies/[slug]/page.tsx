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
  const { slug } = use(params)

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

  return <DetailHero anime={mapApiItemToAnime(detail.item)} playLabel="LECTURE" />
}
