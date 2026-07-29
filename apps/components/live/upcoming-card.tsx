'use client'

import * as React from 'react'
import { Calendar, Clock, Bell, Users } from 'lucide-react'
import Link from 'next/link'
import type { LiveEvent } from '@/types/live'
import { formatScheduledShort } from '@/lib/mock-live'

interface UpcomingCardProps {
  event: LiveEvent
}

export function UpcomingCard({ event }: UpcomingCardProps) {
  const scheduled = React.useMemo(() => formatScheduledShort(event.scheduledAt), [event.scheduledAt])

  const timeUntil = React.useMemo(() => {
    const diff = new Date(event.scheduledAt).getTime() - Date.now()
    const days = Math.floor(diff / 86400000)
    const hours = Math.floor((diff % 86400000) / 3600000)
    if (days > 0) return `Dans ${days}j ${hours}h`
    if (hours > 0) return `Dans ${hours}h`
    return 'Bientôt'
  }, [event.scheduledAt])

  return (
    <Link href={`/en/live/events/${event.slug}`} className="group block">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden rounded-lg bg-white/5">
        <img
          src={event.thumbnailUrl}
          alt={event.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {/* Upcoming badge */}
        <div className="absolute left-2 top-2">
          <span className="flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-bold uppercase text-white">
            <Calendar className="h-3 w-3" />
            Prochain direct
          </span>
        </div>
        {/* Time until */}
        <div className="absolute right-2 bottom-2 rounded bg-black/70 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
          {timeUntil}
        </div>
      </div>

      {/* Info */}
      <div className="mt-2">
        {/* Scheduled time — prominent */}
        <div className="flex items-center gap-1.5 text-sm font-bold text-blue-400">
          <Clock className="h-3.5 w-3.5" />
          {scheduled}
        </div>

        {/* Channel */}
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-white/10">
            <img
              src={event.channel.avatarUrl}
              alt={event.channel.name}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-xs font-medium text-foreground/80">
            {event.channel.name}
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-foreground">
          {event.title}
        </h3>

        {/* Reminder + count */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Bell className="h-3 w-3" />
            {event.reminderCount.toLocaleString('fr-FR')} rappels
          </div>
          <button className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-medium text-foreground ring-1 ring-white/10 transition hover:bg-white/10">
            + Rappel
          </button>
        </div>
      </div>
    </Link>
  )
}
