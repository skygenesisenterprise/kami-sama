'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CatalogPaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function CatalogPagination({ page, totalPages, onPageChange }: CatalogPaginationProps) {
  const t = useTranslations('Catalog')

  if (totalPages <= 1) return null

  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i)
    }
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-sm text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
        aria-label={t('paginationPrev')}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-1 text-sm text-muted-foreground">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors',
              p === page
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-white/10 hover:text-foreground',
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-sm text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
        aria-label={t('paginationNext')}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}
