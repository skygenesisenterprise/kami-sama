import Image from 'next/image'
import Link from 'next/link'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Anime } from '@/types/anime'
import { RatingBadge } from './rating-badge'

interface AnimeCardProps {
  anime: Anime
  /** Optional overlay badge, e.g. a rank number or "NEW". */
  badge?: React.ReactNode
  className?: string
  showMeta?: boolean
}

export function AnimeCard({ anime, badge, className, showMeta = true }: AnimeCardProps) {
  return (
    <Link
      href={`/anime/${anime.slug}`}
      className={cn(
        'group relative block overflow-hidden rounded-xl border border-border/60 bg-card outline-none transition-transform duration-300 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <Image
          src={anime.cover || '/placeholder.svg'}
          alt={anime.title}
          fill
          sizes="(max-width: 768px) 40vw, 200px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent opacity-90" />

        {badge && <div className="absolute left-2 top-2 z-10">{badge}</div>}

        <div className="absolute right-2 top-2 z-10">
          <RatingBadge rating={anime.rating} size="sm" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
            <Play className="size-5 fill-current" />
          </span>
        </div>

        {showMeta && (
          <div className="absolute inset-x-0 bottom-0 z-10 p-3">
            <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-balance">
              {anime.title}
            </h3>
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
              {anime.genres
                .slice(0, 2)
                .map((genreItem) => genreItem.name)
                .join(' · ')}
            </p>
          </div>
        )}
      </div>
    </Link>
  )
}
