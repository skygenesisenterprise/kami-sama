'use client'

import * as React from 'react'
import { use } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Search, X } from 'lucide-react'
import { WorkCard } from '@/components/library/work-card'
import { searchLibrary } from '@/lib/mock-library'

export default function LibrarySearchPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = use(params)
  const t = useTranslations('Library')
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = React.useState(initialQuery)

  const results = React.useMemo(() => {
    return query.trim() ? searchLibrary(query.trim()) : []
  }, [query])

  return (
    <div className="min-h-screen bg-[#141414] pb-16 text-white">
      <div className="mx-auto max-w-screen-7xl px-4 pt-8 md:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">{t('navSearch')}</h1>

        {/* Search Input */}
        <div className="relative mt-6">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            autoFocus
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

        {/* Results */}
        <div className="mt-8">
          {query.trim() ? (
            results.length > 0 ? (
              <>
                <p className="mb-4 text-sm text-white/50">
                  {results.length} résultat(s) pour « {query} »
                </p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {results.map((work) => (
                    <WorkCard
                      key={work.id}
                      work={work}
                      locale={locale}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-lg font-semibold text-white">{t('noWorks')}</p>
                <p className="mt-1 text-sm text-white/50">{t('noWorksHint')}</p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="mb-4 size-12 text-white/20" />
              <p className="text-lg font-semibold text-white">{t('searchPlaceholder')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
