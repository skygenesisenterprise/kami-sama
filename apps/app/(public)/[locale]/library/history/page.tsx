'use client'

import { use } from 'react'
import { useTranslations } from 'next-intl'
import { Clock, BookOpen } from 'lucide-react'
import { WorkTypeBadge } from '@/components/library/work-type-badge'
import { READING_HISTORY } from '@/lib/mock-library'

function timeAgo(dateStr: string): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `il y a ${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  return `il y a ${days}j`
}

export default function LibraryHistoryPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = use(params)
  const t = useTranslations('Library')

  return (
    <div className="min-h-screen bg-[#141414] pb-16 text-white">
      <div className="mx-auto max-w-screen-7xl px-4 pt-8 md:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">{t('navHistory')}</h1>
        <p className="mt-1 text-sm text-white/50">{t('recentlyRead')}</p>

        <div className="mt-8">
          {READING_HISTORY.length > 0 ? (
            <div className="space-y-3">
              {READING_HISTORY.map((item) => (
                <a
                  key={`${item.work.id}-${item.readAt}`}
                  href={`/${locale}/library/${item.work.slug}`}
                  className="flex items-center gap-4 rounded-lg bg-[#1a1a1a] p-4 transition-colors hover:bg-[#222] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded bg-[#222]">
                    <img
                      src={item.work.coverUrl}
                      alt={item.work.title}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <WorkTypeBadge type={item.work.type} />
                      <h3 className="truncate text-sm font-semibold text-white">
                        {item.work.title}
                      </h3>
                    </div>
                    <p className="mt-1 text-xs text-white/50">
                      Chapitre {item.lastChapterRead} · {item.progressPercent}% lu
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-white/40">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {timeAgo(item.readAt)}
                      </span>
                      {item.duration && (
                        <span className="flex items-center gap-1">
                          <BookOpen className="size-3" />
                          {item.duration}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-full rounded-full bg-[#e50914]"
                        style={{ width: `${item.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Clock className="mb-4 size-12 text-white/20" />
              <p className="text-lg font-semibold text-white">{t('historyEmpty')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
