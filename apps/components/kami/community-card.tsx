import Image from 'next/image'
import Link from 'next/link'
import { ChevronUp, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CommunityPick } from '@/types/anime'

export function CommunityCard({
  pick,
  rank,
  className,
}: {
  pick: CommunityPick
  rank?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        'group relative flex gap-3 overflow-hidden rounded-xl border border-border/60 bg-card p-3 transition-colors hover:bg-accent',
        className,
      )}
    >
      <Link
        href={`/anime/${pick.anime.slug}`}
        className="relative aspect-[2/3] w-20 shrink-0 overflow-hidden rounded-lg"
      >
        <Image
          src={pick.anime.cover || '/placeholder.svg'}
          alt={pick.anime.title}
          fill
          sizes="80px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div>
          {typeof rank === 'number' && (
            <span className="text-xs font-medium text-muted-foreground">#{rank} Most Requested</span>
          )}
          <Link href={`/anime/${pick.anime.slug}`}>
            <h3 className="line-clamp-1 font-semibold leading-tight hover:text-primary">
              {pick.anime.title}
            </h3>
          </Link>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {pick.anime.genres.map((genreItem) => genreItem.name).join(' · ')}
          </p>
        </div>

        <div className="mt-2 flex items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 font-medium text-primary">
            <ChevronUp className="size-3.5" />
            {pick.votes.toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-1 text-gold">
            <Star className="size-3.5 fill-gold" />
            {pick.communityRating.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  )
}
