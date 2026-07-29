'use client'

import { use } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowLeft, BadgeCheck, Users } from 'lucide-react'
import { LiveCard } from '@/components/live/live-card'
import { getChannelBySlug, getStreamsByChannel, formatFollowerCount } from '@/lib/mock-live'

export default function ChannelDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}) {
  const { slug, locale } = use(params)
  const t = useTranslations('Live')
  const channel = getChannelBySlug(slug)
  const streams = getStreamsByChannel(slug)

  if (!channel) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#141414]">
        <p className="text-white/60">Chaîne introuvable</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#141414] pb-16 text-white select-none">
      {/* Banner */}
      <div className="relative h-48 overflow-hidden md:h-64">
        <img
          src={channel.bannerUrl || channel.avatarUrl}
          alt={channel.name}
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#141414] to-transparent" />
        <a
          href={`/${locale}/live`}
          className="absolute top-4 left-4 flex size-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
        >
          <ArrowLeft className="size-5" />
        </a>
      </div>

      {/* Channel Info */}
      <div className="mx-auto max-w-screen-7xl px-4 md:px-8">
        <div className="relative -mt-12 flex items-end gap-4">
          <div className="relative size-24 shrink-0 overflow-hidden rounded-full border-4 border-[#141414] bg-white/10 md:size-32">
            <img
              src={channel.avatarUrl}
              alt={channel.name}
              className="size-full object-cover"
            />
          </div>
          <div className="min-w-0 pb-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white md:text-3xl">{channel.name}</h1>
              {channel.isVerified && (
                <BadgeCheck className="size-5 text-blue-500" />
              )}
            </div>
            <div className="mt-1 flex items-center gap-4 text-sm text-white/50">
              <span className="flex items-center gap-1">
                <Users className="size-4" />
                {formatFollowerCount(channel.followerCount)} abonnés
              </span>
              <span className="capitalize">{channel.category}</span>
            </div>
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-sm text-white/60">{channel.description}</p>

        {/* Streams */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-white">Lives</h2>
          {streams.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {streams.map((stream) => (
                <LiveCard key={stream.id} stream={stream} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/40">Aucun live actif pour cette chaîne.</p>
          )}
        </div>
      </div>
    </div>
  )
}
