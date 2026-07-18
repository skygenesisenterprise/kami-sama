import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { RatingBadge } from './rating-badge'
import type { Recommendation } from '@/types/anime'

export function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <Link
      href={`/anime/${rec.anime.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-card outline-none transition-transform hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={rec.anime.banner || '/placeholder.svg'}
          alt={rec.anime.title}
          className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
        <div className="absolute right-2 top-2">
          <RatingBadge rating={rec.anime.rating} size="sm" />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
          <Sparkles className="size-3.5" />
          {rec.reason}
        </span>
        <h3 className="mt-1.5 font-display text-base font-semibold leading-tight">
          {rec.anime.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{rec.detail}</p>
      </div>
    </Link>
  )
}
