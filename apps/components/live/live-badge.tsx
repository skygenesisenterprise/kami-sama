'use client'

import { cn } from '@/lib/utils'
import type { LiveStatus } from '@/types/live'

interface LiveBadgeProps {
  status: LiveStatus
  className?: string
}

export function LiveBadge({ status, className }: LiveBadgeProps) {
  if (status === 'ended') {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/70',
          className,
        )}
      >
        Terminé
      </span>
    )
  }

  if (status === 'upcoming') {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full bg-yellow-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-yellow-300',
          className,
        )}
      >
        À venir
      </span>
    )
  }

  return (
    <span
      className={cn(
        'live-pulse inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white',
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-white animate-pulse" />
      Live
    </span>
  )
}
