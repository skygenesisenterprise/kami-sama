'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Grid3X3, List, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CatalogSort as SortType, CatalogView } from '@/types/catalog'

interface CatalogSortProps {
  sort: SortType
  view: CatalogView
  onSortChange: (sort: SortType) => void
  onViewChange: (view: CatalogView) => void
}

const SORT_OPTIONS: { value: SortType; labelKey: string }[] = [
  { value: 'popular', labelKey: 'sortPopular' },
  { value: 'rating', labelKey: 'sortRating' },
  { value: 'favorites', labelKey: 'sortFavorites' },
  { value: 'newest', labelKey: 'sortNewest' },
  { value: 'release', labelKey: 'sortRelease' },
  { value: 'alpha', labelKey: 'sortAlpha' },
]

export function CatalogSort({ sort, view, onSortChange, onViewChange }: CatalogSortProps) {
  const t = useTranslations('Catalog')

  return (
    <div className="flex items-center gap-3">
      {/* Sort dropdown */}
      <div className="relative">
        <ArrowUpDown className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortType)}
          className="h-9 appearance-none rounded-lg bg-white/5 pl-8 pr-8 text-sm text-foreground ring-1 ring-white/10 focus:outline-none focus:ring-white/20"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {t(opt.labelKey)}
            </option>
          ))}
        </select>
      </div>

      {/* View toggle */}
      <div className="flex rounded-lg bg-white/5 p-0.5 ring-1 ring-white/10">
        <button
          onClick={() => onViewChange('grid')}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
            view === 'grid' ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
          aria-label={t('viewGrid')}
        >
          <Grid3X3 className="h-4 w-4" />
        </button>
        <button
          onClick={() => onViewChange('list')}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
            view === 'list' ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
          aria-label={t('viewList')}
        >
          <List className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
