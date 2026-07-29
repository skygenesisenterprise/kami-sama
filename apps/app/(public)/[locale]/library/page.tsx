'use client'

import * as React from 'react'
import { use } from 'react'
import { useTranslations } from 'next-intl'
import { Search, Library as LibraryIcon, BookOpen, Clock, Heart, Download, Compass, TrendingUp, Sparkles, BarChart3 } from 'lucide-react'
import { LibraryRail } from '@/components/library/library-rail'
import { WorkCard } from '@/components/library/work-card'
import { ReadingProgressCard } from '@/components/library/reading-progress-card'
import { CollectionCard } from '@/components/library/collection-card'
import {
  MY_LIBRARY,
  LIBRARY_COLLECTIONS,
  getContinueReading,
  getTrendingWorks,
  getNewWorks,
  getPopularWorks,
} from '@/lib/mock-library'

const NAV_ITEMS = [
  { key: 'navDiscover', href: '/library/discover', icon: Compass },
  { key: 'navTrending', href: '/library/trending', icon: TrendingUp },
  { key: 'navNew', href: '/library/new', icon: Sparkles },
  { key: 'navPopular', href: '/library/popular', icon: BarChart3 },
  { key: 'navCollections', href: '/library/collections', icon: LibraryIcon },
  { key: 'navHistory', href: '/library/history', icon: Clock },
  { key: 'navFavorites', href: '/library/favorites', icon: Heart },
  { key: 'navDownloads', href: '/library/downloads', icon: Download },
] as const

export default function LibraryPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = use(params)
  const t = useTranslations('Library')
  const [searchQuery, setSearchQuery] = React.useState('')

  const continueReading = getContinueReading()
  const trendingWorks = getTrendingWorks()
  const newWorks = getNewWorks()
  const popularWorks = getPopularWorks()

  const totalWorks = MY_LIBRARY.length
  const readingCount = MY_LIBRARY.filter((e) => e.readingStatus === 'reading').length
  const completedCount = MY_LIBRARY.filter((e) => e.readingStatus === 'completed').length

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/${locale}/library/search?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#141414] pb-16 text-white select-none">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-linear-to-b from-[#1a1a2e] via-[#141414] to-[#141414] px-4 pt-12 pb-8 md:px-8 xl:px-20">
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/70 backdrop-blur-sm">
            <LibraryIcon className="size-4" />
            {t('heroSubtitle')}
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white md:text-6xl">
            {t('heroTitle')}
          </h1>
          <p className="mt-3 text-sm text-white/50">
            {t('heroStats', { total: totalWorks, reading: readingCount, completed: completedCount })}
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-6 mx-auto max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full rounded-lg bg-white/10 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/40 backdrop-blur-sm border border-white/10 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 transition-colors"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-20 border-b border-white/10 bg-[#141414]/90 backdrop-blur-md">
        <div className="mx-auto max-w-screen-7xl overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1 px-4 py-2 md:px-8">
            {NAV_ITEMS.map(({ key, href, icon: Icon }) => (
              <a
                key={key}
                href={`/${locale}${href}`}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Icon className="size-3.5" />
                {t(key)}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Content Sections */}
      <main className="mx-auto max-w-screen-7xl">
        {/* Continue Reading */}
        {continueReading.length > 0 && (
          <LibraryRail
            title={t('continueReading')}
            subtitle={t('continueReadingSub')}
          >
            {continueReading.map((entry) => (
              <ReadingProgressCard
                key={entry.work.id}
                entry={entry}
                locale={locale}
              />
            ))}
          </LibraryRail>
        )}

        {/* My Collections */}
        {LIBRARY_COLLECTIONS.length > 0 && (
          <LibraryRail
            title={t('myCollections')}
            subtitle={t('myCollectionsSub')}
            ctaLabel="Voir tout"
            ctaHref={`/${locale}/library/collections`}
          >
            {LIBRARY_COLLECTIONS.map((col) => (
              <CollectionCard
                key={col.id}
                collection={col}
                locale={locale}
              />
            ))}
          </LibraryRail>
        )}

        {/* Trending Now */}
        <LibraryRail
          title={t('trendingNow')}
          subtitle={t('trendingNowSub')}
          ctaLabel="Voir tout"
          ctaHref={`/${locale}/library/trending`}
        >
          {trendingWorks.map((work) => (
            <WorkCard
              key={work.id}
              work={work}
              locale={locale}
            />
          ))}
        </LibraryRail>

        {/* New Arrivals */}
        <LibraryRail
          title={t('newArrivals')}
          subtitle={t('newArrivalsSub')}
          ctaLabel="Voir tout"
          ctaHref={`/${locale}/library/new`}
        >
          {newWorks.map((work) => (
            <WorkCard
              key={work.id}
              work={work}
              locale={locale}
            />
          ))}
        </LibraryRail>

        {/* Popular Works */}
        <LibraryRail
          title={t('popularWorks')}
          subtitle={t('popularWorksSub')}
          ctaLabel="Voir tout"
          ctaHref={`/${locale}/library/popular`}
        >
          {popularWorks.map((work) => (
            <WorkCard
              key={work.id}
              work={work}
              locale={locale}
            />
          ))}
        </LibraryRail>
      </main>
    </div>
  )
}
