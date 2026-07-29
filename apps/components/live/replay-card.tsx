'use client'

import { Eye, Clock, Play } from 'lucide-react'
import type { LiveStream } from '@/types/live'

interface ReplayCardProps {
  stream: LiveStream
  locale: string
}

export function ReplayCard({ stream, locale }: ReplayCardProps) {
  return (
    <div className="group w-72 shrink-0 snap-start">
      <a
        href={`/${locale}/live/${stream.slug}`}
        className="block overflow-hidden rounded-lg"
      >
        <div className="relative aspect-video overflow-hidden bg-[#1a1a1a]">
          <img
            src={stream.thumbnailUrl}
            alt={stream.title}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex size-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Play className="size-5 fill-white text-white ml-0.5" />
            </div>
          </div>

          {/* Duration */}
          {stream.duration && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white backdrop-blur-sm">
              <Clock className="size-3" />
              {stream.duration}
            </div>
          )}

          {/* Ended badge */}
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/70 backdrop-blur-sm">
              Replay
            </span>
          </div>

          {/* Title overlay */}
          <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <h3 className="line-clamp-2 text-sm font-bold leading-tight text-white drop-shadow-md">
              {stream.title}
            </h3>
          </div>
        </div>
      </a>

      <div className="mt-2 px-1">
        <h3 className="line-clamp-1 text-sm font-semibold text-white">
          {stream.title}
        </h3>
        <div className="mt-1 flex items-center gap-2">
          <div className="size-5 overflow-hidden rounded-full bg-white/10">
            <img
              src={stream.channel.avatarUrl}
              alt={stream.channel.name}
              className="size-full object-cover"
            />
          </div>
          <span className="text-[11px] text-white/50">{stream.channel.name}</span>
        </div>
        {stream.endedAt && (
          <p className="mt-0.5 text-[11px] text-white/40">
            {new Date(stream.endedAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        )}
        {stream.peakViewerCount > 0 && (
          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-white/40">
            <Eye className="size-3" />
            Pic : {stream.peakViewerCount.toLocaleString('fr-FR')} spectateurs
          </div>
        )}
      </div>
    </div>
  )
}
