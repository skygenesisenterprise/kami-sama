import Link from 'next/link'
import { Play, Sparkles } from 'lucide-react'
import { RatingBadge } from './rating-badge'
import { cn } from '@/lib/utils'
import type { SeasonalPick } from '@/types/anime'

export function SeasonalPickCard({
  pick,
  className,
}: {
  pick: SeasonalPick
  className?: string
}) {
  const { anime, label } = pick

  return (
    <Link
      href={`/anime/${anime.slug}`}
      className={cn(
        'group relative block w-37.5 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-card outline-none transition-transform duration-300 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-ring sm:w-42.5 lg:w-46.25',
        className,
      )}
    >
      <div className="relative aspect-2/3 overflow-hidden">
        <img
          src={anime.cover || '/placeholder.svg'}
          alt={anime.title}
          className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent" />

        {/* Label badge */}
        <div className="absolute left-2 top-2 z-10">
          <span className="inline-flex items-center gap-1 rounded-md bg-gold/20 border border-gold/30 px-2 py-0.5 text-xs font-medium text-gold backdrop-blur-sm">
            <Sparkles className="size-3" />
            {label}
          </span>
        </div>

        <div className="absolute right-2 top-2 z-10">
          <RatingBadge rating={anime.rating} size="sm" />
        </div>

        {/* Play button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
            <Play className="size-5 fill-current" />
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 p-3">
          <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-balance">
            {anime.title}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
            {anime.genres
              .slice(0, 2)
              .map((g) => g.name)
              .join(' · ')}
          </p>
        </div>
      </div>
    </Link>
  )
}
