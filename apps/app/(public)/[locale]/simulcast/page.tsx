'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { getAllAnime } from '@/lib/mock-data'
import type { Anime } from '@/types/anime'

interface SimulcastAnime {
  anime: Anime
  status: 'subtitled' | 'subtitling' | 'coming'
}

function getSimulcastData(): SimulcastAnime[] {
  const allAnime = getAllAnime()

  const statuses: Array<'subtitled' | 'subtitling' | 'coming'> = [
    'subtitled',
    'subtitling',
    'coming',
  ]

  return allAnime.map((anime, i) => ({
    anime,
    status: statuses[i % statuses.length],
  }))
}

export default function SimulcastPage() {
  const t = useTranslations('Public.simulcast')
  const [selectedSeason, setSelectedSeason] = useState('ete-2026')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const simulcasts = useMemo(() => getSimulcastData(), [])

  const seasons = [
    { id: 'ete-2026', label: t('seasonSummer2026') },
    { id: 'printemps-2026', label: t('seasonSpring2026') },
    { id: 'hiver-2026', label: t('seasonWinter2026') },
    { id: 'automne-2025', label: t('seasonFall2025') },
  ]

  const currentSeason = seasons.find((s) => s.id === selectedSeason)

  const statusLabelMap: Record<string, string> = {
    subtitled: t('statusSubtitled'),
    subtitling: t('statusSubtitling'),
    coming: t('statusComing'),
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-6 md:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {t('title')}
          </h1>

          {/* Season Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 rounded-md border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-line-strong"
            >
              {currentSeason?.label}
              <ChevronDown
                className={cn(
                  'size-4 text-ink-soft transition-transform',
                  isDropdownOpen && 'rotate-180'
                )}
              />
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-md border border-line bg-paper-raised py-1 shadow-paper">
                  {seasons.map((season) => (
                    <button
                      key={season.id}
                      onClick={() => {
                        setSelectedSeason(season.id)
                        setIsDropdownOpen(false)
                      }}
                      className={cn(
                        'w-full px-4 py-2 text-left text-sm transition-colors hover:bg-line',
                        selectedSeason === season.id
                          ? 'font-semibold text-stamp'
                          : 'text-ink-soft'
                      )}
                    >
                      {season.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Anime Grid */}
      <div className="mx-auto max-w-6xl px-4 pb-12 md:px-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {simulcasts.map((item) => (
            <Link
              key={item.anime.id}
              href={`/watch/${item.anime.slug}`}
              className="group"
            >
              <div className="relative aspect-3/4 overflow-hidden rounded-md bg-paper-dim">
                <Image
                  src={item.anime.cover}
                  alt={item.anime.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <h3 className="mt-2 text-sm font-semibold text-ink line-clamp-2 leading-tight">
                {item.anime.title}
              </h3>
              <p className="mt-1 text-xs text-ink-faint">
                {statusLabelMap[item.status]}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
