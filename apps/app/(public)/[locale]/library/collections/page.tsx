'use client'

import { use } from 'react'
import { useTranslations } from 'next-intl'
import { BookOpen, Plus } from 'lucide-react'
import { CollectionCard } from '@/components/library/collection-card'
import { LIBRARY_COLLECTIONS } from '@/lib/mock-library'

export default function LibraryCollectionsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = use(params)
  const t = useTranslations('Library')

  return (
    <div className="min-h-screen bg-[#141414] pb-16 text-white">
      <div className="mx-auto max-w-screen-7xl px-4 pt-8 md:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">{t('navCollections')}</h1>
            <p className="mt-1 text-sm text-white/50">{t('myCollectionsSub')}</p>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-[#e50914] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#ff3d47]"
          >
            <Plus className="size-4" />
            {t('collectionCreate')}
          </button>
        </div>

        <div className="mt-8">
          {LIBRARY_COLLECTIONS.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {LIBRARY_COLLECTIONS.map((col) => (
                <CollectionCard
                  key={col.id}
                  collection={col}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <BookOpen className="mb-4 size-12 text-white/20" />
              <p className="text-lg font-semibold text-white">{t('collectionsEmpty')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
