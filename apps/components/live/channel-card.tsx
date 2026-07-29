'use client'

import { BadgeCheck, Users } from 'lucide-react'
import { formatFollowerCount } from '@/lib/mock-live'
import type { LiveChannel } from '@/types/live'

interface ChannelCardProps {
  channel: LiveChannel
  locale: string
}

export function ChannelCard({ channel, locale }: ChannelCardProps) {
  return (
    <a
      href={`/${locale}/live/channels/${channel.slug}`}
      className="group flex items-center gap-3 rounded-lg bg-[#1a1a1a] p-3 transition-colors hover:bg-[#222] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white w-64 shrink-0 snap-start"
    >
      <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-white/10">
        <img
          src={channel.avatarUrl}
          alt={channel.name}
          className="size-full object-cover"
        />
        {channel.isVerified && (
          <BadgeCheck className="absolute -right-0.5 -bottom-0.5 size-4 text-blue-500 fill-blue-500/20" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-white">
          {channel.name}
        </h3>
        <div className="flex items-center gap-1.5 text-[11px] text-white/50">
          <Users className="size-3" />
          <span>{formatFollowerCount(channel.followerCount)}</span>
        </div>
      </div>
    </a>
  )
}
