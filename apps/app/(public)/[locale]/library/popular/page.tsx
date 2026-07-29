'use client'

import { use } from 'react'
import { useTranslations } from 'next-intl'
import { WorkCard } from '@/components/library/work-card'
import { getPopularWorks } from '@/lib/mock-library'

export default function LibraryPopularPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = use(params)
  const t = useTranslations('Library')
  const popular = getPopularWorks()

  return (
    <div className="min-h-screen bg-[#141414] pb-16 text-white">
      <div className="mx-auto max-w-screen-7xl px-4 pt-8 md:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">{t('navPopular')}</h1>
        <p className="mt-1 text-sm text-white/50">{t('popularWorksSub')}</p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {popular.map((work, idx) => (
            <WorkCard
              key={work.id}
              work={work}
              locale={locale}
              rank={idx + 1}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
