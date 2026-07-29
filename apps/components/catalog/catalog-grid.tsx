'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Skeleton } from '@/components/ui/skeleton'
import { CatalogCard } from '@/components/catalog/catalog-card'
import type { CatalogItem, CatalogView } from '@/types/catalog'
import { SearchX, AlertCircle } from 'lucide-react'

interface CatalogGridProps {
  items: CatalogItem[]
  view: CatalogView
  locale: string
  isLoading?: boolean
  isEmpty?: boolean
  isError?: boolean
  onRetry?: () => void
}

export function CatalogGrid({ items, view, locale, isLoading, isEmpty, isError, onRetry }: CatalogGridProps) {
  const t = useTranslations('Catalog')

  // Loading state
  if (isLoading) {
    return (
      <div
        className={
          view === 'grid'
            ? 'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
            : 'space-y-3'
        }
      >
        {Array.from({ length: 10 }).map((_, i) => (
          view === 'grid' ? (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[2/3] w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ) : (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          )
        ))}
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-red-400" />
        <h3 className="text-lg font-bold text-foreground">{t('error')}</h3>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 text-sm font-medium text-primary hover:underline"
          >
            {t('errorRetry')}
          </button>
        )}
      </div>
    )
  }

  // Empty state
  if (isEmpty || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <SearchX className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-bold text-foreground">{t('noResults')}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{t('noResultsHint')}</p>
      </div>
    )
  }

  // Results
  return (
    <div
      className={
        view === 'grid'
          ? 'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
          : 'space-y-3'
      }
    >
      {items.map((item) => (
        <CatalogCard key={item.id} item={item} view={view} locale={locale} />
      ))}
    </div>
  )
}
