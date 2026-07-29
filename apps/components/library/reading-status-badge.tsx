'use client'

import { cn } from '@/lib/utils'
import type { ReadingStatus } from '@/types/library'

const STATUS_STYLES: Record<ReadingStatus, string> = {
  reading: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'plan-to-read': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  completed: 'bg-green-500/20 text-green-300 border-green-500/30',
  'on-hold': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  dropped: 'bg-red-500/20 text-red-300 border-red-500/30',
}

const STATUS_LABELS: Record<ReadingStatus, string> = {
  reading: 'En cours',
  'plan-to-read': 'À lire',
  completed: 'Terminé',
  'on-hold': 'En pause',
  dropped: 'Abandonné',
}

interface ReadingStatusBadgeProps {
  status: ReadingStatus
  className?: string
}

export function ReadingStatusBadge({ status, className }: ReadingStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        STATUS_STYLES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
