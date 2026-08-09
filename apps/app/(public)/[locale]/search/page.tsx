'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2, Search, X } from 'lucide-react'
import { AnimeCard } from '@/components/kami/anime-card'
import { discoverApi } from '@/lib/api/discover'
import { mapApiItemToAnime } from '@/lib/api/discover-adapter'
import type { Anime } from '@/types/anime'

const STORAGE_KEY = 'kami-sama-recent-searches'
const MAX_RECENT = 8
const SEARCH_DEBOUNCE_MS = 350

function loadRecentSearches(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveRecentSearches(searches: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(searches))
}

export default function SearchPage() {
  const t = useTranslations('Public.search')
  const [query, setQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const [results, setResults] = useState<Anime[]>([])
  const [total, setTotal] = useState(0)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  // Term of the last request actually sent, so an explicit submit isn't
  // re-triggered by the pending debounce timer for the same query.
  const lastRunRef = useRef('')

  useEffect(() => {
    setRecentSearches(loadRecentSearches())
  }, [])

  // Abort any in-flight search when the page unmounts.
  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  const runSearch = useCallback(async (value: string) => {
    const term = value.trim()
    lastRunRef.current = term
    abortRef.current?.abort()
    if (!term) {
      setResults([])
      setTotal(0)
      setError(null)
      setSearching(false)
      return
    }
    const controller = new AbortController()
    abortRef.current = controller
    setSearching(true)
    setError(null)
    try {
      const res = await discoverApi.search(term, {
        limit: 24,
        signal: controller.signal,
      })
      if (controller.signal.aborted) return
      setResults(res.items.map(mapApiItemToAnime))
      setTotal(res.total)
    } catch (err) {
      if (controller.signal.aborted) return
      setError(err instanceof Error ? err.message : 'Unknown error')
      setResults([])
      setTotal(0)
    } finally {
      if (!controller.signal.aborted) setSearching(false)
    }
  }, [])

  // Live search with a short debounce; clearing the query resets immediately.
  useEffect(() => {
    if (!query.trim()) {
      abortRef.current?.abort()
      lastRunRef.current = ''
      setResults([])
      setTotal(0)
      setError(null)
      setSearching(false)
      return
    }
    const timer = setTimeout(() => {
      // The term was already sent via an explicit submit — skip the duplicate.
      if (query.trim() === lastRunRef.current) return
      void runSearch(query)
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query, runSearch])

  const addRecent = useCallback((term: string) => {
    const trimmed = term.trim()
    if (!trimmed) return
    setRecentSearches((prev) => {
      const next = [trimmed, ...prev.filter((s) => s !== trimmed)].slice(0, MAX_RECENT)
      saveRecentSearches(next)
      return next
    })
  }, [])

  const removeRecent = useCallback((term: string) => {
    setRecentSearches((prev) => {
      const next = prev.filter((s) => s !== term)
      saveRecentSearches(next)
      return next
    })
  }, [])

  const clearRecent = useCallback(() => {
    saveRecentSearches([])
    setRecentSearches([])
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const term = query.trim()
      if (!term) return
      addRecent(term)
      void runSearch(term)
    },
    [query, addRecent, runSearch],
  )

  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Search Input */}
      <div className="mx-auto max-w-3xl px-4 pt-12 pb-8 md:px-8">
        <form onSubmit={handleSubmit} className="relative">
          <Search className="pointer-events-none absolute left-0 top-1/2 size-6 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('placeholder')}
            autoFocus
            className="w-full border-0 border-b-2 border-white/20 bg-transparent pb-4 pl-10 pr-10 text-3xl font-light tracking-wide text-white outline-none placeholder:text-white/30 focus:border-primary/60 md:text-4xl"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white/70"
            >
              <X className="size-5" />
            </button>
          )}
        </form>
      </div>

      <div className="mx-auto max-w-5xl px-4 md:px-8">
        {/* Results when searching */}
        {query.trim() ? (
          searching ? (
            <div className="flex items-center justify-center gap-2 py-20 text-white/40">
              <Loader2 className="size-5 animate-spin" />
              <span className="text-sm">{t('searching')}</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="mb-4 size-12 text-white/20" />
              <p className="text-lg text-white/50">{t('errorTitle')}</p>
              <p className="mt-1 max-w-md text-sm text-white/30">{error}</p>
              <button
                type="button"
                onClick={() => void runSearch(query)}
                className="mt-4 rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/20"
              >
                {t('retry')}
              </button>
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-white/40">
                {t('resultsCount', { count: total })}
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {results.map((anime) => (
                  <AnimeCard key={anime.id} anime={anime} />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="mb-4 size-12 text-white/20" />
              <p className="text-lg text-white/50">{t('noResults')}</p>
              <p className="mt-1 text-sm text-white/30">{t('noResultsHint')}</p>
            </div>
          )
        ) : recentSearches.length > 0 ? (
          /* Recent searches */
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-wide text-white">
                {t('recentTitle')}
              </h2>
              <button
                type="button"
                onClick={clearRecent}
                className="text-xs font-semibold uppercase tracking-wider text-white/40 transition-colors hover:text-white/70"
              >
                {t('clearRecent')}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {recentSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQuery(term)}
                  className="group flex items-center gap-2 rounded-md bg-[#1a2e35] px-3.5 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-[#1f3840]"
                >
                  <span className="max-w-52 truncate">{term}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation()
                      removeRecent(term)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation()
                        removeRecent(term)
                      }
                    }}
                    className="ml-0.5 text-white/30 transition-colors hover:text-white/70"
                  >
                    <X className="size-3.5" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Search className="mb-6 size-16 text-white/10" />
            <h2 className="text-xl font-semibold text-white/60">
              {t('emptyTitle')}
            </h2>
            <p className="mt-2 max-w-md text-sm text-white/30">
              {t('emptyDescription')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
