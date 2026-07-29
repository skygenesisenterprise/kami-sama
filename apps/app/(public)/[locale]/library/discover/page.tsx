'use client'

import * as React from 'react'
import { use } from 'react'
import { useTranslations } from 'next-intl'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { WorkCard } from '@/components/library/work-card'
import {
  LIBRARY_WORKS,
  getAllWorkTypes,
  getAllGenres,
  getAllLanguages,
  searchLibrary,
} from '@/lib/mock-library'
import type { WorkType, WorkStatus, SortOption } from '@/types/library'

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'recently-read', label: 'Récemment lu' },
  { id: 'title-asc', label: 'Titre A — Z' },
  { id: 'title-desc', label: 'Titre Z — A' },
  { id: 'rating-desc', label: 'Meilleure note' },
  { id: 'date-desc', label: 'Plus récent' },
]

const STATUS_OPTIONS: { id: WorkStatus; label: string }[] = [
  { id: 'ongoing', label: 'En cours' },
  { id: 'completed', label: 'Terminé' },
  { id: 'hiatus', label: 'En pause' },
  { id: 'cancelled', label: 'Annulé' },
]

export default function LibraryDiscoverPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = use(params)
  const t = useTranslations('Library')
  const [query, setQuery] = React.useState('')
  const [selectedTypes, setSelectedTypes] = React.useState<WorkType[]>([])
  const [selectedGenres, setSelectedGenres] = React.useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = React.useState<WorkStatus[]>([])
  const [selectedLanguages, setSelectedLanguages] = React.useState<string[]>([])
  const [sortBy, setSortBy] = React.useState<SortOption>('rating-desc')
  const [showFilters, setShowFilters] = React.useState(false)

  const workTypes = React.useMemo(() => getAllWorkTypes(), [])
  const genres = React.useMemo(() => getAllGenres(), [])
  const languages = React.useMemo(() => getAllLanguages(), [])

  const filteredWorks = React.useMemo(() => {
    let works = query ? searchLibrary(query) : [...LIBRARY_WORKS]

    if (selectedTypes.length > 0) {
      works = works.filter((w) => selectedTypes.includes(w.type))
    }
    if (selectedGenres.length > 0) {
      works = works.filter((w) => w.genres.some((g) => selectedGenres.includes(g.id)))
    }
    if (selectedStatus.length > 0) {
      works = works.filter((w) => selectedStatus.includes(w.status))
    }
    if (selectedLanguages.length > 0) {
      works = works.filter((w) => w.languages.some((l) => selectedLanguages.includes(l)))
    }

    switch (sortBy) {
      case 'title-asc':
        works.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'title-desc':
        works.sort((a, b) => b.title.localeCompare(a.title))
        break
      case 'rating-desc':
        works.sort((a, b) => b.rating - a.rating)
        break
      case 'date-desc':
        works.sort((a, b) => b.year - a.year)
        break
      case 'recently-read':
      default:
        break
    }

    return works
  }, [query, selectedTypes, selectedGenres, selectedStatus, selectedLanguages, sortBy])

  const toggleFilter = <T extends string>(arr: T[], val: T, set: React.Dispatch<React.SetStateAction<T[]>>) => {
    set(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val])
  }

  const activeFilterCount = selectedTypes.length + selectedGenres.length + selectedStatus.length + selectedLanguages.length

  const clearAll = () => {
    setQuery('')
    setSelectedTypes([])
    setSelectedGenres([])
    setSelectedStatus([])
    setSelectedLanguages([])
    setSortBy('rating-desc')
  }

  return (
    <div className="min-h-screen bg-[#141414] pb-16 text-white">
      <div className="mx-auto max-w-screen-7xl px-4 pt-8 md:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">{t('navDiscover')}</h1>
            <p className="mt-1 text-sm text-white/50">{t('resultsCount', { count: filteredWorks.length })}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm text-white transition-colors hover:bg-white/20"
          >
            <SlidersHorizontal className="size-4" />
            {t('filterType')}
            {activeFilterCount > 0 && (
              <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-[#e50914] text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="relative mt-6">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full rounded-lg bg-white/10 py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-white/40 border border-white/10 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">{t('filterType')}</h3>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs text-[#e50914] hover:text-[#ff3d47]"
                >
                  {t('clearFilters')}
                </button>
              )}
            </div>

            {/* Type Filter */}
            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-white/60">{t('filterType')}</p>
              <div className="flex flex-wrap gap-2">
                {workTypes.map((wt) => (
                  <button
                    key={wt.id}
                    type="button"
                    onClick={() => toggleFilter(selectedTypes, wt.id, setSelectedTypes)}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      selectedTypes.includes(wt.id)
                        ? 'border-[#e50914] bg-[#e50914] text-white'
                        : 'border-white/20 text-white/60 hover:border-white/40 hover:text-white'
                    }`}
                  >
                    {wt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Genre Filter */}
            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-white/60">{t('filterGenre')}</p>
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggleFilter(selectedGenres, g.id, setSelectedGenres)}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      selectedGenres.includes(g.id)
                        ? 'border-[#e50914] bg-[#e50914] text-white'
                        : 'border-white/20 text-white/60 hover:border-white/40 hover:text-white'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-white/60">{t('filterStatus')}</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleFilter(selectedStatus, s.id, setSelectedStatus)}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      selectedStatus.includes(s.id)
                        ? 'border-[#e50914] bg-[#e50914] text-white'
                        : 'border-white/20 text-white/60 hover:border-white/40 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Filter */}
            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-white/60">{t('filterLanguage')}</p>
              <div className="flex flex-wrap gap-2">
                {languages.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => toggleFilter(selectedLanguages, l.id, setSelectedLanguages)}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      selectedLanguages.includes(l.id)
                        ? 'border-[#e50914] bg-[#e50914] text-white'
                        : 'border-white/20 text-white/60 hover:border-white/40 hover:text-white'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <p className="mb-2 text-xs font-medium text-white/60">{t('filterSort')}</p>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSortBy(s.id)}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      sortBy === s.id
                        ? 'border-[#e50914] bg-[#e50914] text-white'
                        : 'border-white/20 text-white/60 hover:border-white/40 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results Grid */}
        <div className="mt-8">
          {filteredWorks.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filteredWorks.map((work) => (
                <WorkCard
                  key={work.id}
                  work={work}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-lg font-semibold text-white">{t('noWorks')}</p>
              <p className="mt-1 text-sm text-white/50">{t('noWorksHint')}</p>
              <button
                type="button"
                onClick={clearAll}
                className="mt-4 text-sm text-[#e50914] hover:text-[#ff3d47]"
              >
                {t('clearFilters')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
