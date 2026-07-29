'use client'

import * as React from 'react'
import { use } from 'react'
import { useTranslations } from 'next-intl'
import {
  ArrowLeft,
  Download,
  Heart,
  Play,
  Share2,
  Star,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { WorkTypeBadge } from '@/components/library/work-type-badge'
import { ReadingStatusBadge } from '@/components/library/reading-status-badge'
import { getLibraryWork, getLibraryEntry } from '@/lib/mock-library'
import type { ReadingStatus } from '@/types/library'

const WORK_STATUS_LABELS: Record<string, string> = {
  ongoing: 'En cours',
  completed: 'Terminé',
  hiatus: 'En pause',
  cancelled: 'Annulé',
}

export default function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}) {
  const { slug, locale } = use(params)
  const t = useTranslations('Library')
  const [showFullSynopsis, setShowFullSynopsis] = React.useState(false)
  const [showChapterList, setShowChapterList] = React.useState(false)

  const work = getLibraryWork(slug)
  const entry = getLibraryEntry(slug)

  if (!work) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#141414]">
        <p className="text-white/60">Œuvre introuvable</p>
      </div>
    )
  }

  const displayChapters = showChapterList ? work.chapters : work.chapters.slice(0, 12)

  return (
    <div className="min-h-screen bg-[#141414] pb-16 text-white select-none">
      {/* Hero Banner */}
      <div className="relative h-[50vh] min-h-80 w-full overflow-hidden">
        <img
          src={work.bannerUrl || work.coverUrl}
          alt={work.title}
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#141414] via-[#141414]/60 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-[#141414]/80 to-transparent" />

        {/* Back button */}
        <a
          href={`/${locale}/library`}
          className="absolute top-4 left-4 flex size-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
        >
          <ArrowLeft className="size-5" />
        </a>

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-16">
          <div className="flex gap-6">
            {/* Cover */}
            <div className="hidden sm:block shrink-0">
              <div className="relative h-60 w-40 overflow-hidden rounded-lg shadow-2xl">
                <img
                  src={work.coverUrl}
                  alt={work.title}
                  className="size-full object-cover"
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <WorkTypeBadge type={work.type} />
                <span className="text-xs text-white/40">·</span>
                <span className="text-xs text-white/40">{work.year}</span>
              </div>

              <h1 className="font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
                {work.title}
              </h1>

              {work.alternativeTitles.length > 0 && (
                <p className="mt-1 text-sm text-white/40">
                  {work.alternativeTitles.join(' · ')}
                </p>
              )}

              {/* Rating */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`size-4 ${
                        star <= Math.round(work.rating / 2)
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'fill-white/20 text-white/20'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-white/70">
                  {work.rating.toFixed(1)} ({(work.ratingCount / 1000).toFixed(1)}K)
                </span>
              </div>

              {/* Genres */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {work.genres.map((g) => (
                  <span
                    key={g.id}
                    className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] text-white/70"
                  >
                    {g.name}
                  </span>
                ))}
              </div>

              {/* Action buttons */}
              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-white/90"
                >
                  <Play className="size-4 fill-current" />
                  {entry ? t('continueReadingCta') : t('readNow')}
                </button>
                <button
                  type="button"
                  className={`flex size-10 items-center justify-center rounded-full border-[1.5px] transition-all hover:scale-110 ${
                    entry?.isFavorite
                      ? 'border-[#e50914] bg-[#e50914] text-white'
                      : 'border-white/30 text-white/60 hover:border-white hover:text-white'
                  }`}
                  aria-label={t('addToFavorites')}
                >
                  <Heart className={`size-4 ${entry?.isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button
                  type="button"
                  className="flex size-10 items-center justify-center rounded-full border-[1.5px] border-white/30 text-white/60 transition-all hover:border-white hover:text-white hover:scale-110"
                  aria-label={t('download')}
                >
                  <Download className="size-4" />
                </button>
                <button
                  type="button"
                  className="flex size-10 items-center justify-center rounded-full border-[1.5px] border-white/30 text-white/60 transition-all hover:border-white hover:text-white hover:scale-110"
                  aria-label={t('share')}
                >
                  <Share2 className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-screen-7xl px-4 md:px-8 lg:px-16">
        <div className="flex gap-8">
          {/* Left Column */}
          <div className="flex-1 max-w-3xl">
            {/* Synopsis */}
            <section className="mt-8">
              <h2 className="mb-3 text-lg font-bold text-white">{t('synopsis')}</h2>
              <div className="relative">
                <p className={`text-sm leading-relaxed text-white/70 ${!showFullSynopsis ? 'line-clamp-4' : ''}`}>
                  {work.synopsis}
                </p>
                <button
                  type="button"
                  onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                  className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#e50914] hover:text-[#ff3d47]"
                >
                  {showFullSynopsis ? (
                    <>VOIR MOINS <ChevronUp className="size-3" /></>
                  ) : (
                    <>VOIR PLUS <ChevronDown className="size-3" /></>
                  )}
                </button>
              </div>
            </section>

            {/* Reading Progress */}
            {entry && (
              <section className="mt-8">
                <h2 className="mb-3 text-lg font-bold text-white">{t('progress')}</h2>
                <div className="rounded-lg bg-[#1a1a1a] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <ReadingStatusBadge status={entry.readingStatus as ReadingStatus} />
                    <span className="text-sm text-white/60">
                      {entry.progress.percentComplete}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-[#e50914] transition-[width]"
                      style={{ width: `${entry.progress.percentComplete}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-white/50">
                    <span>
                      {t('chapterOf', {
                        current: entry.progress.currentChapter,
                        total: work.totalChapters,
                      })}
                    </span>
                    {entry.progress.estimatedTimeLeft && (
                      <span>{t('estimatedTimeLeft')}: {entry.progress.estimatedTimeLeft}</span>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Chapters */}
            <section className="mt-8">
              <h2 className="mb-3 text-lg font-bold text-white">
                {t('chapters')} ({work.chapters.length})
              </h2>
              <div className="rounded-lg border border-white/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-white/50">#</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-white/50">Titre</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-white/50 hidden sm:table-cell">Pages</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-white/50 hidden md:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayChapters.map((ch) => (
                      <tr
                        key={ch.id}
                        className="border-b border-white/5 transition-colors hover:bg-white/5 cursor-pointer"
                      >
                        <td className="px-4 py-2.5 text-white/60">{ch.number}</td>
                        <td className="px-4 py-2.5 text-white">
                          {ch.title || `Chapitre ${ch.number}`}
                        </td>
                        <td className="px-4 py-2.5 text-white/50 hidden sm:table-cell">{ch.pageCount}p</td>
                        <td className="px-4 py-2.5 text-white/50 hidden md:table-cell">
                          {new Date(ch.releaseDate).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'short',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {work.chapters.length > 12 && (
                <button
                  type="button"
                  onClick={() => setShowChapterList(!showChapterList)}
                  className="mt-3 w-full text-center text-sm font-semibold text-[#e50914] hover:text-[#ff3d47]"
                >
                  {showChapterList ? 'Voir moins' : `Voir les ${work.chapters.length} chapitres`}
                </button>
              )}
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Details */}
              <div className="rounded-lg bg-[#1a1a1a] p-4">
                <h3 className="mb-3 text-sm font-bold text-white">{t('details')}</h3>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-white/40">{t('status')}</dt>
                    <dd className="mt-0.5 text-white">{WORK_STATUS_LABELS[work.status] || work.status}</dd>
                  </div>
                  <div>
                    <dt className="text-white/40">{t('year')}</dt>
                    <dd className="mt-0.5 text-white">{work.year}</dd>
                  </div>
                  <div>
                    <dt className="text-white/40">{t('authors')}</dt>
                    <dd className="mt-0.5 text-white">
                      {work.authors.map((a) => a.name).join(', ')}
                    </dd>
                  </div>
                  {work.illustrators && work.illustrators.length > 0 && (
                    <div>
                      <dt className="text-white/40">{t('illustrators')}</dt>
                      <dd className="mt-0.5 text-white">
                        {work.illustrators.map((i) => i.name).join(', ')}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-white/40">{t('publishers')}</dt>
                    <dd className="mt-0.5 text-white">
                      {work.publishers.map((p) => p.name).join(', ')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-white/40">{t('volumes')}</dt>
                    <dd className="mt-0.5 text-white">{work.volumes.length}</dd>
                  </div>
                  <div>
                    <dt className="text-white/40">{t('formats')}</dt>
                    <dd className="mt-0.5 text-white capitalize">
                      {work.formats.join(', ')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-white/40">Langues</dt>
                    <dd className="mt-0.5 text-white uppercase">
                      {work.languages.join(', ')}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Tags */}
              {work.tags.length > 0 && (
                <div className="rounded-lg bg-[#1a1a1a] p-4">
                  <h3 className="mb-2 text-sm font-bold text-white">Tags</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {work.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
