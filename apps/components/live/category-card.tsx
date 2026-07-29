'use client'

import {
  Clapperboard,
  Building2,
  Music,
  Gamepad2,
  Sparkles,
  Mic,
  Trophy,
  Newspaper,
  Palette,
  type LucideIcon,
} from 'lucide-react'
import type { LiveCategoryInfo } from '@/types/live'

const ICON_MAP: Record<string, LucideIcon> = {
  Clapperboard,
  Building2,
  Music,
  Gamepad2,
  Sparkles,
  Mic,
  Trophy,
  Newspaper,
  Palette,
}

interface CategoryCardProps {
  category: LiveCategoryInfo
  locale: string
}

export function CategoryCard({ category, locale }: CategoryCardProps) {
  const Icon = ICON_MAP[category.icon] || Sparkles

  return (
    <a
      href={`/${locale}/live?category=${category.id}`}
      className="group flex items-center gap-3 rounded-lg bg-white/5 px-4 py-3 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      <Icon className="h-5 w-5 text-white/70" />
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-white">{category.label}</span>
        <span className="text-[11px] text-white/50">{category.streamCount} live(s)</span>
      </div>
    </a>
  )
}
