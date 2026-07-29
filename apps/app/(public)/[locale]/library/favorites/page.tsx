'use client'

import { use } from 'react'
import { useTranslations } from 'next-intl'
import { Heart } from 'lucide-react'
import { WorkCard } from '@/components/library/work-card'
import { getFavorites } from '@/lib/mock-library'

export default function LibraryFavoritesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = use(params)
  const t = useTranslations('Library')
  const favorites = getFavorites()

  return (
    <div className="min-h-screen bg-[#141414] pb-16 text-white">
      <div className="mx-auto max-w-screen-7xl px-4 pt-8 md:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">{t('navFavorites')}</h1>
        <p className="mt-1 text-sm text-white/50">
          {favorites.length > 0
            ? `${favorites.length} favori(s)`
            : t('favoritesEmpty')}
        </p>

        <div className="mt-8">
          {favorites.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {favorites.map((entry) => (
                <WorkCard
                  key={entry.work.id}
                  work={entry.work}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Heart className="mb-4 size-12 text-white/20" />
              <p className="text-lg font-semibold text-white">{t('favoritesEmpty')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
