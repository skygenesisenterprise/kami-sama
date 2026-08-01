'use client'

import { Check, Film, Loader2, Tv } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

/**
 * Normalized item shape used by source search pickers (Plex, AniList, ...).
 * Each integration maps its own response into this so the card stays generic.
 */
export interface SourceResultItem {
  id: string
  title: string
  subtitle?: string
  type?: string
  year?: number
  durationSeconds?: number
  rating?: number
  genres?: string[]
  overview?: string
  imageUrl?: string
  artUrl?: string
  extraMeta?: string[]
}

interface SourceResultCardProps {
  item: SourceResultItem
  icon?: 'series' | 'movie'
  actionLabel?: string
  actingLabel?: string
  doneLabel?: string
  isActing?: boolean
  done?: boolean
  onAction?: (item: SourceResultItem) => void
}

function formatDuration(seconds?: number): string | null {
  if (!seconds || seconds <= 0) return null
  const m = Math.round(seconds / 60)
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  const rem = m % 60
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`
}

function typeIcon(icon: 'series' | 'movie') {
  return icon === 'series' ? <Tv className="size-4" /> : <Film className="size-4" />
}

/**
 * Netflix/Plex-style result card: backdrop artwork with a poster thumbnail,
 * title, metadata and a short synopsis so the user can confirm the right item
 * lives in the source before adding it to the catalog.
 */
export function SourceResultCard({
  item,
  icon = 'series',
  actionLabel = 'Add',
  actingLabel = 'Adding…',
  doneLabel = 'Added',
  isActing,
  done,
  onAction,
}: SourceResultCardProps) {
  const rating =
    typeof item.rating === 'number' && item.rating > 0 ? item.rating.toFixed(1) : null
  const meta = [
    item.year ? String(item.year) : null,
    item.type,
    formatDuration(item.durationSeconds),
    rating ? `${rating} ★` : null,
    ...(item.extraMeta ?? []),
  ].filter(Boolean)
  const backdrop = item.artUrl ?? item.imageUrl

  return (
    <div className="overflow-hidden rounded-lg border bg-card transition-colors hover:border-ring/60">
      <div className="relative aspect-[16/7] w-full overflow-hidden">
        {backdrop ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={backdrop}
            alt=""
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-muted text-muted-foreground">
            {typeIcon(icon)}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt=""
            className="absolute -bottom-6 left-3 size-14 rounded-md border shadow-lg sm:size-16"
            loading="lazy"
          />
        ) : null}
        <div className="absolute right-3 bottom-2.5 left-20 flex items-center gap-2">
          <p className="truncate font-semibold text-white drop-shadow-md">{item.title}</p>
          {rating ? (
            <Badge
              variant="secondary"
              className="shrink-0 bg-black/50 text-[10px] text-white backdrop-blur"
            >
              ★ {rating}
            </Badge>
          ) : null}
        </div>
      </div>

      <div className={item.imageUrl ? 'flex flex-col gap-2 p-3 pt-8' : 'flex flex-col gap-2 p-3'}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {item.subtitle ? (
              <p className="truncate font-mono text-xs text-muted-foreground">{item.subtitle}</p>
            ) : null}
            {meta.length > 0 ? (
              <p className="text-xs text-muted-foreground">{meta.join(' · ')}</p>
            ) : null}
          </div>
          {onAction ? (
            <Button
              size="sm"
              variant={done ? 'outline' : 'default'}
              onClick={() => onAction(item)}
              disabled={done || isActing}
              className="shrink-0"
            >
              {isActing ? (
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              ) : done ? (
                <Check className="mr-1.5 size-3.5" />
              ) : null}
              {isActing ? actingLabel : done ? doneLabel : actionLabel}
            </Button>
          ) : null}
        </div>

        {item.genres && item.genres.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {item.genres.slice(0, 4).map((g) => (
              <Badge key={g} variant="secondary" className="text-[10px]">
                {g}
              </Badge>
            ))}
          </div>
        ) : null}

        {item.overview ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {item.overview}
          </p>
        ) : null}
      </div>
    </div>
  )
}
