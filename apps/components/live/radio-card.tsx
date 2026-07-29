'use client'

import * as React from 'react'
import { Radio } from 'lucide-react'
import type { LiveRadioChannel } from '@/types/live'

interface RadioCardProps {
  radio: LiveRadioChannel
}

export function RadioCard({ radio }: RadioCardProps) {
  return (
    <div className="group relative w-45 shrink-0 cursor-pointer">
      {/* Channel logo + live indicator */}
      <div className="relative mb-3 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-4 ring-1 ring-white/5 transition group-hover:ring-purple-500/30">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white/10">
          <img
            src={radio.logoUrl}
            alt={radio.name}
            className="h-full w-full object-cover"
          />
        </div>
        {radio.isLive && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            <Radio className="h-2.5 w-2.5" />
            Live
          </span>
        )}
      </div>

      {/* Channel name */}
      <h3 className="truncate text-sm font-semibold text-foreground">
        {radio.name}
      </h3>

      {/* Current show */}
      <p className="mt-0.5 truncate text-xs text-muted-foreground">
        {radio.currentShow}
      </p>

      {/* Category badge */}
      <span className="mt-2 inline-block rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-muted-foreground ring-1 ring-white/5">
        {radio.category}
      </span>
    </div>
  )
}
