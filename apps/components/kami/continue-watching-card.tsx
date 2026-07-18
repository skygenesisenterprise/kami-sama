import Link from 'next/link'
import { Play } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import type { ContinueWatchingItem } from '@/types/anime'

export function ContinueWatchingCard({ item }: { item: ContinueWatchingItem }) {
  const { anime, episode, progressPercent, remainingLabel } = item
  return (
    <Link
      href={`/watch/${anime.slug}?ep=${episode.id}`}
      className="group block w-64 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-card outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={anime.cover || '/placeholder.svg'}
          alt={anime.title}
          className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <span className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
            <Play className="size-5 fill-current" />
          </span>
        </div>
        <span className="absolute right-2 top-2 rounded bg-background/80 px-1.5 py-0.5 text-xs backdrop-blur">
          {remainingLabel}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-3">
          <h3 className="line-clamp-1 text-sm font-semibold">{anime.title}</h3>
          <p className="text-xs text-muted-foreground">
            S{episode.season} · Episode {episode.number}
          </p>
        </div>
      </div>
      <Progress value={progressPercent} className="h-1 rounded-none bg-secondary" />
    </Link>
  )
}
