'use client'

import * as React from 'react'
import { use, useMemo, useCallback, useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCatalogItems, CATALOG_TYPES, CATALOG_GENRES, CATALOG_STATUS_MAP, CATALOG_YEARS, CATALOG_STUDIOS } from '@/lib/mock-catalog'
import { CatalogCard } from '@/components/catalog/catalog-card'
import type { CatalogFilter, CatalogSort as SortType, CatalogType, CatalogGenre, CatalogStatus } from '@/types/catalog'

interface CatalogPageProps {
  params: Promise<{ locale: string }>
}

export default function CatalogPage({ params }: CatalogPageProps) {
  const { locale } = use(params)
  const t = useTranslations('Catalog')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const initialFilter: CatalogFilter = useMemo(() => ({
    type: (searchParams.get('type') as CatalogFilter['type']) || undefined,
    genre: (searchParams.get('genre') as CatalogFilter['genre']) || undefined,
    status: (searchParams.get('status') as CatalogFilter['status']) || undefined,
    year: searchParams.get('year') ? Number(searchParams.get('year')) : undefined,
    studio: searchParams.get('studio') || undefined,
    sort: (searchParams.get('sort') as SortType) || 'popular',
    search: searchParams.get('search') || undefined,
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
  }), [searchParams])

  const [filter, setFilter] = useState<CatalogFilter>(initialFilter)
  const [searchInput, setSearchInput] = useState(filter.search || '')
  const [isLoading, setIsLoading] = useState(false)

  const updateURL = useCallback((newFilter: CatalogFilter) => {
    const params = new URLSearchParams()
    if (newFilter.type) params.set('type', newFilter.type)
    if (newFilter.genre) params.set('genre', newFilter.genre)
    if (newFilter.status) params.set('status', newFilter.status)
    if (newFilter.year) params.set('year', String(newFilter.year))
    if (newFilter.studio) params.set('studio', newFilter.studio)
    if (newFilter.sort && newFilter.sort !== 'popular') params.set('sort', newFilter.sort)
    if (newFilter.search) params.set('search', newFilter.search)
    if (newFilter.page && newFilter.page > 1) params.set('page', String(newFilter.page))
    const qs = params.toString()
    router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }, [router, pathname])

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(timer)
  }, [filter])

  const result = useMemo(() => getCatalogItems(filter), [filter])

  const handleFilterChange = useCallback((patch: Partial<CatalogFilter>) => {
    const next = { ...filter, ...patch, page: patch.page ?? 1 }
    setFilter(next)
    updateURL(next)
  }, [filter, updateURL])

  const handleSearch = useCallback(() => {
    handleFilterChange({ search: searchInput || undefined })
  }, [searchInput, handleFilterChange])

  const handlePageChange = useCallback((page: number) => {
    handleFilterChange({ page })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [handleFilterChange])

  const clearAll = useCallback(() => {
    const next: CatalogFilter = { sort: 'popular', page: 1 }
    setFilter(next)
    setSearchInput('')
    updateURL(next)
  }, [updateURL])

  const hasFilters = filter.type || filter.genre || filter.status || filter.year || filter.studio || filter.search

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-7xl">
        {/* ── Title ──────────────────────────────────────────────────── */}
        <h1 className="mb-2 text-center font-display text-3xl font-black text-foreground md:text-4xl">
          {t('heroTitle')}
        </h1>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          {t('heroSubtitle')}
        </p>

        {/* ── Search bar ─────────────────────────────────────────────── */}
        <div className="mx-auto mb-6 flex max-w-xl items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t('searchPlaceholder')}
              className="h-10 w-full rounded-lg bg-white/5 pl-10 pr-9 text-sm text-foreground placeholder:text-muted-foreground ring-1 ring-white/10 focus:bg-white/10 focus:ring-white/20 focus:outline-none"
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(''); handleFilterChange({ search: undefined }) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="h-10 shrink-0 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t('searchPlaceholder')}
          </button>
        </div>

        {/* ── Filters row ────────────────────────────────────────────── */}
        <div className="mb-6 rounded-lg bg-white/5 p-4 ring-1 ring-white/5">
          <div className="flex flex-wrap gap-3">
            {/* Type */}
            <select
              value={filter.type || ''}
              onChange={(e) => handleFilterChange({ type: (e.target.value || undefined) as CatalogType })}
              className="h-9 rounded-lg bg-white/5 px-3 text-sm text-foreground ring-1 ring-white/10 focus:outline-none focus:ring-white/20"
            >
              <option value="">{t('filterType')}</option>
              {CATALOG_TYPES.filter((ct) => ct.count > 0).map((ct) => (
                <option key={ct.id} value={ct.id}>{ct.label} ({ct.count})</option>
              ))}
            </select>

            {/* Genre */}
            <select
              value={filter.genre || ''}
              onChange={(e) => handleFilterChange({ genre: (e.target.value || undefined) as CatalogGenre })}
              className="h-9 rounded-lg bg-white/5 px-3 text-sm text-foreground ring-1 ring-white/10 focus:outline-none focus:ring-white/20"
            >
              <option value="">{t('filterGenre')}</option>
              {CATALOG_GENRES.filter((g) => g.count > 0).map((g) => (
                <option key={g.id} value={g.id}>{g.label} ({g.count})</option>
              ))}
            </select>

            {/* Status */}
            <select
              value={filter.status || ''}
              onChange={(e) => handleFilterChange({ status: (e.target.value || undefined) as CatalogStatus })}
              className="h-9 rounded-lg bg-white/5 px-3 text-sm text-foreground ring-1 ring-white/10 focus:outline-none focus:ring-white/20"
            >
              <option value="">{t('filterStatus')}</option>
              {(Object.entries(CATALOG_STATUS_MAP) as [CatalogStatus, { label: string; color: string }][]).map(([key, info]) => (
                <option key={key} value={key}>{info.label}</option>
              ))}
            </select>

            {/* Year */}
            <select
              value={filter.year || ''}
              onChange={(e) => handleFilterChange({ year: e.target.value ? Number(e.target.value) : undefined })}
              className="h-9 rounded-lg bg-white/5 px-3 text-sm text-foreground ring-1 ring-white/10 focus:outline-none focus:ring-white/20"
            >
              <option value="">{t('filterYear')}</option>
              {CATALOG_YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            {/* Studio */}
            <select
              value={filter.studio || ''}
              onChange={(e) => handleFilterChange({ studio: e.target.value || undefined })}
              className="h-9 rounded-lg bg-white/5 px-3 text-sm text-foreground ring-1 ring-white/10 focus:outline-none focus:ring-white/20"
            >
              <option value="">{t('filterStudio')}</option>
              {CATALOG_STUDIOS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={filter.sort || 'popular'}
              onChange={(e) => handleFilterChange({ sort: e.target.value as SortType })}
              className="h-9 rounded-lg bg-white/5 px-3 text-sm text-foreground ring-1 ring-white/10 focus:outline-none focus:ring-white/20"
            >
              <option value="popular">{t('sortPopular')}</option>
              <option value="rating">{t('sortRating')}</option>
              <option value="favorites">{t('sortFavorites')}</option>
              <option value="newest">{t('sortNewest')}</option>
              <option value="release">{t('sortRelease')}</option>
              <option value="alpha">{t('sortAlpha')}</option>
            </select>
          </div>

          {/* Active filters */}
          {hasFilters && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{t('resultsCount', { total: result.total })}</span>
              <button
                onClick={clearAll}
                className="text-xs font-medium text-primary hover:underline"
              >
                {t('filterReset')}
              </button>
            </div>
          )}
        </div>

        {/* ── Results grid ───────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-2/3 w-full animate-pulse rounded-lg bg-white/5" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-white/5" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-white/5" />
              </div>
            ))}
          </div>
        ) : result.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-bold text-foreground">{t('noResults')}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t('noResultsHint')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {result.items.map((item) => (
              <CatalogCard key={item.id} item={item} view="grid" locale={locale} />
            ))}
          </div>
        )}

        {/* ── Pagination ─────────────────────────────────────────────── */}
        {result.totalPages > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-1">
            <button
              onClick={() => handlePageChange(result.page - 1)}
              disabled={result.page <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-sm text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {(() => {
              const pages: (number | '...')[] = []
              if (result.totalPages <= 7) {
                for (let i = 1; i <= result.totalPages; i++) pages.push(i)
              } else {
                pages.push(1)
                if (result.page > 3) pages.push('...')
                for (let i = Math.max(2, result.page - 1); i <= Math.min(result.totalPages - 1, result.page + 1); i++) {
                  pages.push(i)
                }
                if (result.page < result.totalPages - 2) pages.push('...')
                pages.push(result.totalPages)
              }
              return pages.map((p, i) =>
                p === '...' ? (
                  <span key={`d-${i}`} className="px-1 text-sm text-muted-foreground">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors',
                      p === result.page
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-white/10 hover:text-foreground',
                    )}
                  >
                    {p}
                  </button>
                ),
              )
            })()}
            <button
              onClick={() => handlePageChange(result.page + 1)}
              disabled={result.page >= result.totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-sm text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        )}
      </div>
    </main>
  )
}
