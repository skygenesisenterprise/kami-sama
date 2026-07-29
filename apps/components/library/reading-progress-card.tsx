'use client'

import { Clock, BookOpen } from 'lucide-react'
import type { LibraryEntry } from '@/types/library'

interface ReadingProgressCardProps {
  entry: LibraryEntry
  locale: string
}

export function ReadingProgressCard({ entry, locale }: ReadingProgressCardProps) {
  const { work, progress } = entry
  const hasProgress = progress.percentComplete > 0

  return (
    <div className="group relative w-72 shrink-0 snap-start">
      <a
        href={`/${locale}/library/${work.slug}`}
        className="flex gap-3 rounded-lg bg-[#1a1a1a] p-3 transition-colors hover:bg-[#222] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded bg-[#222]">
          <img
            src={work.coverUrl}
            alt={work.title}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
          <div>
            <h3 className="line-clamp-2 text-sm font-semibold text-white leading-tight">
              {work.title}
            </h3>
            <p className="mt-1 text-[11px] text-white/50">
              Chapitre {progress.currentChapter} / {work.totalChapters}
            </p>
          </div>
          <div>
            {hasProgress && (
              <div className="h-1 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-[#e50914] transition-[width] duration-300"
                  style={{ width: `${progress.percentComplete}%` }}
                />
              </div>
            )}
            <div className="mt-1 flex items-center gap-3">
              {hasProgress && (
                <span className="text-[10px] text-white/40">{progress.percentComplete}%</span>
              )}
              {progress.estimatedTimeLeft && (
                <span className="flex items-center gap-0.5 text-[10px] text-white/40">
                  <Clock className="size-2.5" />
                  {progress.estimatedTimeLeft}
                </span>
              )}
            </div>
          </div>
        </div>
      </a>
    </div>
  )
}
