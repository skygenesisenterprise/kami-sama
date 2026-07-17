import Image from 'next/image'
import Link from 'next/link'
import { Play } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { formatDuration } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import type { Episode } from '@/types/anime'

interface EpisodeCardProps {
  episode: Episode
  animeSlug: string
  layout?: 'grid' | 'row'
  progressPercent?: number
  className?: string
}

export function EpisodeCard({
  episode,
  animeSlug,
  layout = 'grid',
  progressPercent,
  className,
}: EpisodeCardProps) {
  const href = `/watch/${animeSlug}?ep=${episode.id}`

  if (layout === 'row') {
    return (
      <Link
        href={href}
        className={cn(
          'group flex gap-3 rounded-xl border border-border/60 bg-card p-2 outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring',
          className,
        )}
      >
        <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg sm:w-40">
          <Image
            src={episode.thumbnail || '/placeholder.svg'}
            alt={episode.title}
            fill
            sizes="160px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-background/30 opacity-0 transition-opacity group-hover:opacity-100">
            <Play className="size-6 fill-primary-foreground text-primary-foreground" />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center pr-2">
          <span className="text-xs font-medium text-primary">Episode {episode.number}</span>
          <h4 className="mt-0.5 line-clamp-1 text-sm font-semibold">{episode.title}</h4>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {episode.description}
          </p>
          <span className="mt-1 text-xs text-muted-foreground">
            {formatDuration(episode.duration)}
          </span>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className={cn(
        'group block overflow-hidden rounded-xl border border-border/60 bg-card outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={episode.thumbnail || '/placeholder.svg'}
          alt={episode.title}
          fill
          sizes="(max-width: 768px) 90vw, 320px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <span className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
            <Play className="size-5 fill-current" />
          </span>
        </div>
        <span className="absolute bottom-2 right-2 rounded bg-background/80 px-1.5 py-0.5 text-xs backdrop-blur">
          {formatDuration(episode.duration)}
        </span>
        {typeof progressPercent === 'number' && (
          <Progress
            value={progressPercent}
            className="absolute inset-x-0 bottom-0 h-1 rounded-none bg-secondary/50"
          />
        )}
      </div>
      <div className="p-3">
        <span className="text-xs font-medium text-primary">Episode {episode.number}</span>
        <h4 className="mt-0.5 line-clamp-1 text-sm font-semibold">{episode.title}</h4>
      </div>
    </Link>
  )
}
