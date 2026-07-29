'use client'

import { use } from 'react'
import { useTranslations } from 'next-intl'
import { Download, Trash2, Check, Loader2, AlertCircle } from 'lucide-react'
import { WorkTypeBadge } from '@/components/library/work-type-badge'
import { getDownloads } from '@/lib/mock-library'
import type { DownloadStatus } from '@/types/library'

const STATUS_CONFIG: Record<DownloadStatus, { icon: typeof Check; label: string; color: string }> = {
  downloaded: { icon: Check, label: 'Téléchargé', color: 'text-green-400' },
  downloading: { icon: Loader2, label: 'En cours', color: 'text-blue-400' },
  pending: { icon: Download, label: 'En attente', color: 'text-yellow-400' },
  error: { icon: AlertCircle, label: 'Erreur', color: 'text-red-400' },
}

export default function LibraryDownloadsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = use(params)
  const t = useTranslations('Library')
  const downloads = getDownloads()

  return (
    <div className="min-h-screen bg-[#141414] pb-16 text-white">
      <div className="mx-auto max-w-screen-7xl px-4 pt-8 md:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">{t('navDownloads')}</h1>
        <p className="mt-1 text-sm text-white/50">
          {downloads.length > 0
            ? `${downloads.length} téléchargement(s)`
            : t('downloadsEmpty')}
        </p>

        <div className="mt-8">
          {downloads.length > 0 ? (
            <div className="space-y-3">
              {downloads.map((dl) => {
                const cfg = STATUS_CONFIG[dl.status]
                const StatusIcon = cfg.icon
                return (
                  <div
                    key={dl.work.id}
                    className="flex items-center gap-4 rounded-lg bg-[#1a1a1a] p-4 transition-colors hover:bg-[#222]"
                  >
                    <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded bg-[#222]">
                      <img
                        src={dl.work.coverUrl}
                        alt={dl.work.title}
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <WorkTypeBadge type={dl.work.type} />
                        <h3 className="truncate text-sm font-semibold text-white">
                          {dl.work.title}
                        </h3>
                      </div>
                      <p className="mt-1 text-xs text-white/50">
                        {dl.chapters.length} chapitre(s) · {dl.fileSize}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        {dl.status === 'downloading' && (
                          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-white/20">
                            <div
                              className="h-full rounded-full bg-blue-500 transition-[width]"
                              style={{ width: `${dl.progress}%` }}
                            />
                          </div>
                        )}
                        <span className={`flex items-center gap-1 text-[11px] ${cfg.color}`}>
                          <StatusIcon className={`size-3 ${dl.status === 'downloading' ? 'animate-spin' : ''}`} />
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="flex size-8 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-red-400"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Download className="mb-4 size-12 text-white/20" />
              <p className="text-lg font-semibold text-white">{t('downloadsEmpty')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
