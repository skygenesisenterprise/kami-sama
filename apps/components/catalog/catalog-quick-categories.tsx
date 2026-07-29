'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import type { CatalogType } from '@/types/catalog'

interface CatalogQuickCategoriesProps {
  activeType?: CatalogType
  onTypeChange: (type: CatalogType | undefined) => void
}

const QUICK_TYPES: { id: CatalogType | undefined; labelKey: string }[] = [
  { id: undefined, labelKey: 'quickAll' },
  { id: 'anime', labelKey: 'quickAnime' },
  { id: 'manga', labelKey: 'quickManga' },
  { id: 'light-novel', labelKey: 'quickLightNovel' },
  { id: 'webtoon', labelKey: 'quickWebtoon' },
  { id: 'manhwa', labelKey: 'quickManhwa' },
  { id: 'manhua', labelKey: 'quickManhua' },
  { id: 'film', labelKey: 'quickFilms' },
  { id: 'jeu', labelKey: 'quickJeux' },
]

export function CatalogQuickCategories({ activeType, onTypeChange }: CatalogQuickCategoriesProps) {
  const t = useTranslations('Catalog')

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {QUICK_TYPES.map((qt) => (
        <button
          key={qt.id ?? 'all'}
          onClick={() => onTypeChange(qt.id)}
          className={cn(
            'flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
            activeType === qt.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-white/5 text-muted-foreground hover:bg-white/10',
          )}
        >
          {t(qt.labelKey)}
        </button>
      ))}
    </div>
  )
}
