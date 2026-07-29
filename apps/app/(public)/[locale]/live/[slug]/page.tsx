'use client'

import { use } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Eye, Share2, Bell, Clock } from 'lucide-react'
import { LiveBadge } from '@/components/live/live-badge'
import { getLiveBySlug, formatViewerCount } from '@/lib/mock-live'

export default function LiveStreamPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}) {
  const { slug, locale } = use(params)
  const t = useTranslations('Live')
  const stream = getLiveBySlug(slug)

  if (!stream) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#141414]">
        <p className="text-white/60">Live introuvable</p>
      </div>
    )
  }

  const isLive = stream.status === 'live'

  return (
    <div className="min-h-screen bg-[#141414] pb-16 text-white select-none">
      {/* Hero Banner */}
      <div className="relative h-[50vh] min-h-80 w-full overflow-hidden">
        <img
          src={stream.bannerUrl || stream.thumbnailUrl}
          alt={stream.title}
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#141414] via-[#141414]/60 to-transparent" />

        {/* Back button */}
        <a
          href={`/${locale}/live`}
          className="absolute top-4 left-4 flex size-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
        >
          <ArrowLeft className="size-5" />
        </a>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-16">
          <div className="max-w-3xl">
            <div className="mb-3 flex items-center gap-3">
              <LiveBadge status={stream.status} />
              {isLive && (
                <span className="flex items-center gap-1 text-sm text-white/70">
                  <Eye className="size-4" />
                  {formatViewerCount(stream.viewerCount)} {t('viewers')}
                </span>
              )}
              {stream.duration && (
                <span className="flex items-center gap-1 text-sm text-white/50">
                  <Clock className="size-4" />
                  {stream.duration}
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
              {stream.title}
            </h1>

            <p className="mt-3 text-sm text-white/60">{stream.description}</p>

            {/* Channel info */}
            <div className="mt-4 flex items-center gap-3">
              <div className="size-10 overflow-hidden rounded-full bg-white/10">
                <img
                  src={stream.channel.avatarUrl}
                  alt={stream.channel.name}
                  className="size-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{stream.channel.name}</p>
                <p className="text-xs text-white/50">
                  {stream.channel.followerCount.toLocaleString('fr-FR')} {t('followers')}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center gap-3">
              {isLive ? (
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg bg-[#e50914] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#ff3d47]"
                >
                  <Eye className="size-5" />
                  {t('heroWatchNow')}
                </button>
              ) : stream.status === 'upcoming' ? (
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-white/90"
                >
                  <Bell className="size-5" />
                  {t('notifyMe')}
                </button>
              ) : (
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-white/90"
                >
                  {t('watchReplay')}
                </button>
              )}
              <button
                type="button"
                className="flex size-10 items-center justify-center rounded-full border border-white/30 text-white/60 transition-colors hover:border-white hover:text-white"
              >
                <Share2 className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stream Info */}
      <div className="mx-auto max-w-screen-7xl px-4 pt-8 md:px-8 lg:px-16">
        <div className="flex gap-8">
          <div className="flex-1 max-w-3xl">
            {/* Tags */}
            {stream.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {stream.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg bg-[#1a1a1a] p-4">
                <p className="text-xs text-white/40">{t('viewers')}</p>
                <p className="mt-1 text-lg font-bold text-white">
                  {stream.viewerCount.toLocaleString('fr-FR')}
                </p>
              </div>
              <div className="rounded-lg bg-[#1a1a1a] p-4">
                <p className="text-xs text-white/40">{t('peakViewers', { count: '' }).replace(':', '').trim()}</p>
                <p className="mt-1 text-lg font-bold text-white">
                  {stream.peakViewerCount.toLocaleString('fr-FR')}
                </p>
              </div>
              <div className="rounded-lg bg-[#1a1a1a] p-4">
                <p className="text-xs text-white/40">Catégorie</p>
                <p className="mt-1 text-lg font-bold text-white capitalize">{stream.category}</p>
              </div>
              <div className="rounded-lg bg-[#1a1a1a] p-4">
                <p className="text-xs text-white/40">Chaîne</p>
                <p className="mt-1 text-lg font-bold text-white">{stream.channel.name}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mt-8">
              <h2 className="mb-3 text-lg font-bold text-white">Description</h2>
              <p className="text-sm leading-relaxed text-white/70">{stream.description}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-4">
              <h3 className="text-sm font-bold text-white">{t('sectionChannels')}</h3>
              <a
                href={`/${locale}/live/channels/${stream.channel.slug}`}
                className="flex items-center gap-3 rounded-lg bg-[#1a1a1a] p-3 transition-colors hover:bg-[#222]"
              >
                <div className="size-10 overflow-hidden rounded-full bg-white/10">
                  <img
                    src={stream.channel.avatarUrl}
                    alt={stream.channel.name}
                    className="size-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{stream.channel.name}</p>
                  <p className="text-xs text-white/50">{stream.channel.followerCount.toLocaleString('fr-FR')} abonnés</p>
                </div>
              </a>
              <p className="text-xs text-white/50">{stream.channel.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
