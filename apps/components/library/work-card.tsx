'use client'

import * as React from 'react'
import { Bookmark, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WorkTypeBadge } from './work-type-badge'
import type { WorkSummary, Work } from '@/types/library'

interface WorkCardProps {
  work: WorkSummary | Work
  locale: string
  badge?: string
  progressPercent?: number
  showStatus?: boolean
  rank?: number
  className?: string
}

export function WorkCard({ work, locale, badge, progressPercent, showStatus, rank, className }: WorkCardProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <div
      className={cn(
        'group relative w-40 shrink-0 snap-start outline-none sm:w-50 lg:w-60 xl:w-70',
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a
        href={`/${locale}/library/${work.slug}`}
        className="block overflow-hidden rounded-md"
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-[#1a1a1a]">
          <img
            src={work.coverUrl}
            alt={work.title}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

          {badge && (
            <span className="absolute top-2 left-2 rounded bg-[#e50914] px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
              {badge}
            </span>
          )}

          {rank !== undefined && (
            <span className="absolute top-2 left-2 flex size-8 items-center justify-center rounded-full bg-black/70 text-sm font-bold text-white backdrop-blur-sm">
              {rank}
            </span>
          )}

          <button
            type="button"
            className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:bg-black/80"
            aria-label="Bookmark"
          >
            <Bookmark className="size-4" aria-hidden="true" />
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <h3 className="line-clamp-2 text-sm font-bold leading-tight text-white drop-shadow-md">
              {work.title}
            </h3>
          </div>
        </div>
      </a>

      <div className="mt-2 px-1">
        <div className="flex items-center gap-1.5">
          <WorkTypeBadge type={work.type} />
          <div className="flex items-center gap-0.5">
            <Star className="size-3 fill-yellow-500 text-yellow-500" />
            <span className="text-xs text-white/70">{work.rating.toFixed(1)}</span>
          </div>
        </div>
        <h3 className="mt-1 line-clamp-1 text-sm font-semibold text-white">
          {work.title}
        </h3>
        {work.genres.length > 0 && (
          <p className="mt-0.5 line-clamp-1 text-[11px] text-white/50">
            {work.genres.slice(0, 3).map((g) => g.name).join(' · ')}
          </p>
        )}
      </div>

      {progressPercent !== undefined && progressPercent > 0 && (
        <div className="mt-1.5 px-[10%]">
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-[#e50914] transition-[width] duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
