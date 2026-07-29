'use client'

import { use } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Bell } from 'lucide-react'
import { LiveBadge } from '@/components/live/live-badge'
import { getUpcomingEvents } from '@/lib/mock-live'
import type { LiveEvent } from '@/types/live'

function formatScheduled(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  if (diffDays === 0) return `Aujourd'hui à ${time}`
  if (diffDays === 1) return `Demain à ${time}`
  return `Le ${d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à ${time}`
}

export default function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = use(params)
  const t = useTranslations('Live')
  const events = getUpcomingEvents()

  return (
    <div className="min-h-screen bg-[#141414] pb-16 text-white select-none">
      <div className="mx-auto max-w-screen-7xl px-4 pt-8 md:px-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <a
            href={`/${locale}/live`}
            className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <ArrowLeft className="size-5" />
          </a>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">{t('sectionUpcoming')}</h1>
            <p className="mt-1 text-sm text-white/50">{t('sectionUpcomingSub')}</p>
          </div>
        </div>

        {/* Events List */}
        <div className="mt-8 space-y-4">
          {events.length > 0 ? (
            events.map((event) => (
              <EventRow key={event.id} event={event} locale={locale} t={t} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Bell className="mb-4 size-12 text-white/20" />
              <p className="text-lg font-semibold text-white">{t('noUpcoming')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function EventRow({
  event,
  locale,
  t,
}: {
  event: LiveEvent
  locale: string
  t: (key: string) => string
}) {
  return (
    <a
      href={`/${locale}/live/${event.slug}`}
      className="flex items-center gap-4 rounded-lg bg-[#1a1a1a] p-4 transition-colors hover:bg-[#222] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-lg bg-[#222]">
        <img
          src={event.thumbnailUrl}
          alt={event.title}
          className="size-full object-cover"
        />
        <div className="absolute top-1.5 left-1.5">
          <LiveBadge status="upcoming" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="truncate text-sm font-semibold text-white">{event.title}</h3>
        <p className="mt-0.5 line-clamp-1 text-xs text-white/50">{event.description}</p>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-xs font-medium text-[#e50914]">
            {formatScheduled(event.scheduledAt)}
          </span>
          <span className="text-[11px] text-white/40">
            {event.reminderCount.toLocaleString('fr-FR')} rappel(s)
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <div className="size-4 overflow-hidden rounded-full bg-white/10">
            <img
              src={event.channel.avatarUrl}
              alt={event.channel.name}
              className="size-full object-cover"
            />
          </div>
          <span className="text-[11px] text-white/50">{event.channel.name}</span>
        </div>
      </div>
      <button
        type="button"
        className="shrink-0 flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/60 transition-colors hover:border-[#e50914] hover:text-[#e50914]"
      >
        <Bell className="size-3" />
        Me notifier
      </button>
    </a>
  )
}
