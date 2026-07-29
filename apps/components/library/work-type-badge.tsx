'use client'

import { cn } from '@/lib/utils'
import type { WorkType } from '@/types/library'

const TYPE_STYLES: Record<WorkType, string> = {
  manga: 'bg-red-500/20 text-red-300 border-red-500/30',
  manhwa: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  manhua: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  webtoon: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'light-novel': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  novel: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  comics: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'bande-dessinee': 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  artbook: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  databook: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  'one-shot': 'bg-violet-500/20 text-violet-300 border-violet-500/30',
}

const TYPE_LABELS: Record<WorkType, string> = {
  manga: 'Manga',
  manhwa: 'Manhwa',
  manhua: 'Manhua',
  webtoon: 'Webtoon',
  'light-novel': 'Light Novel',
  novel: 'Novel',
  comics: 'Comics',
  'bande-dessinee': 'BD',
  artbook: 'Artbook',
  databook: 'Databook',
  'one-shot': 'One-Shot',
}

interface WorkTypeBadgeProps {
  type: WorkType
  className?: string
}

export function WorkTypeBadge({ type, className }: WorkTypeBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        TYPE_STYLES[type],
        className,
      )}
    >
      {TYPE_LABELS[type]}
    </span>
  )
}
