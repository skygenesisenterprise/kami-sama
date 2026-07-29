'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CatalogFilter, CatalogType, CatalogGenre, CatalogStatus } from '@/types/catalog'
import {
  CATALOG_TYPES,
  CATALOG_GENRES,
  CATALOG_YEARS,
  CATALOG_STUDIOS,
  CATALOG_STATUS_MAP,
} from '@/lib/mock-catalog'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'

interface CatalogFiltersProps {
  filter: CatalogFilter
  onChange: (filter: CatalogFilter) => void
}

export function CatalogFilters({ filter, onChange }: CatalogFiltersProps) {
  const t = useTranslations('Catalog')
  const [open, setOpen] = React.useState(false)

  const updateFilter = (key: keyof CatalogFilter, value: string | number | undefined) => {
    onChange({ ...filter, [key]: value || undefined, page: 1 })
  }

  const activeCount = [
    filter.type,
    filter.genre,
    filter.status,
    filter.year,
    filter.studio,
  ].filter(Boolean).length

  const content = (
    <div className="space-y-6">
      {/* Type */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">{t('filterType')}</h3>
        <div className="flex flex-wrap gap-1.5">
          {CATALOG_TYPES.filter((ct) => ct.count > 0).map((ct) => (
            <button
              key={ct.id}
              onClick={() => updateFilter('type', filter.type === ct.id ? undefined : ct.id)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                filter.type === ct.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-white/5 text-muted-foreground hover:bg-white/10',
              )}
            >
              {ct.label} ({ct.count})
            </button>
          ))}
        </div>
      </div>

      {/* Genres */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">{t('filterGenre')}</h3>
        <div className="flex flex-wrap gap-1.5">
          {CATALOG_GENRES.filter((g) => g.count > 0).map((genre) => (
            <button
              key={genre.id}
              onClick={() => updateFilter('genre', filter.genre === genre.id ? undefined : genre.id)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                filter.genre === genre.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-white/5 text-muted-foreground hover:bg-white/10',
              )}
            >
              {genre.label} ({genre.count})
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">{t('filterStatus')}</h3>
        <div className="flex flex-wrap gap-1.5">
          {(Object.entries(CATALOG_STATUS_MAP) as [CatalogStatus, { label: string; color: string }][]).map(
            ([key, info]) => (
              <button
                key={key}
                onClick={() => updateFilter('status', filter.status === key ? undefined : key)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  filter.status === key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white/5 text-muted-foreground hover:bg-white/10',
                )}
              >
                {info.label}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Year */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">{t('filterYear')}</h3>
        <select
          value={filter.year || ''}
          onChange={(e) => updateFilter('year', e.target.value ? Number(e.target.value) : undefined)}
          className="h-9 w-full rounded-lg bg-white/5 px-3 text-sm text-foreground ring-1 ring-white/10 focus:outline-none focus:ring-white/20"
        >
          <option value="">Toutes les années</option>
          {CATALOG_YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Studio */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">{t('filterStudio')}</h3>
        <select
          value={filter.studio || ''}
          onChange={(e) => updateFilter('studio', e.target.value || undefined)}
          className="h-9 w-full rounded-lg bg-white/5 px-3 text-sm text-foreground ring-1 ring-white/10 focus:outline-none focus:ring-white/20"
        >
          <option value="">Tous les studios</option>
          {CATALOG_STUDIOS.map((studio) => (
            <option key={studio} value={studio}>
              {studio}
            </option>
          ))}
        </select>
      </div>

      {/* Reset */}
      {activeCount > 0 && (
        <button
          onClick={() =>
            onChange({ sort: filter.sort, view: filter.view, page: 1 })
          }
          className="text-sm font-medium text-primary hover:underline"
        >
          {t('filterReset')}
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile trigger */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="lg:hidden">
            <SlidersHorizontal className="mr-1.5 h-4 w-4" />
            {t('filterTitle')}
            {activeCount > 0 && (
              <span className="ml-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {activeCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 bg-background">
          <SheetTitle>{t('filterTitle')}</SheetTitle>
          <div className="mt-6 overflow-y-auto">{content}</div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-shrink-0 lg:block">
        <div className="sticky top-24">{content}</div>
      </aside>
    </>
  )
}
