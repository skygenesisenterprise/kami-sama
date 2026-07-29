'use client'

import * as React from 'react'
import { Eye, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import type { LiveStream } from '@/types/live'
import { formatViewerCount } from '@/lib/mock-live'
import { LiveBadge } from '@/components/live/live-badge'

interface LiveCardProps {
  stream: LiveStream
  compact?: boolean
}

export function LiveCard({ stream, compact = false }: LiveCardProps) {
  const timeRemaining = React.useMemo(() => {
    if (!stream.startedAt) return null
    const start = new Date(stream.startedAt).getTime()
    const elapsed = Date.now() - start
    const hours = Math.floor(elapsed / 3600000)
    const mins = Math.floor((elapsed % 3600000) / 60000)
    if (hours > 0) return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`
    return `${mins}min`
  }, [stream.startedAt])

  return (
    <Link href={`/en/live/${stream.slug}`} className="group block">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden rounded-lg bg-white/5">
        <img
          src={stream.thumbnailUrl}
          alt={stream.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {/* Live badge */}
        <div className="absolute left-2 top-2">
          <LiveBadge status="live" />
        </div>
        {/* Time remaining */}
        {timeRemaining && (
          <div className="absolute right-2 bottom-2 flex items-center gap-1 rounded bg-black/70 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
            <Clock className="h-3 w-3" />
            {timeRemaining}
          </div>
        )}
        {/* Viewers */}
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded bg-black/70 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
          <Eye className="h-3 w-3" />
          {formatViewerCount(stream.viewerCount)}
        </div>
      </div>

      {/* Info */}
      <div className="mt-2">
        {/* Channel name — prominent */}
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-white/10">
            <img
              src={stream.channel.avatarUrl}
              alt={stream.channel.name}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-xs font-semibold text-foreground/80">
            {stream.channel.name}
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-foreground">
          {stream.title}
        </h3>

        {!compact && (
          <>
            {/* Episode info */}
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
              {stream.description}
            </p>
            {/* Tags */}
            <div className="mt-2 flex flex-wrap gap-1">
              {stream.tags?.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-muted-foreground ring-1 ring-white/5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </Link>
  )
}
