'use client'

import { BookOpen } from 'lucide-react'
import type { Collection } from '@/types/library'

interface CollectionCardProps {
  collection: Collection
  locale: string
}

const TYPE_LABELS: Record<Collection['type'], string> = {
  universe: 'Univers',
  saga: 'Saga',
  franchise: 'Franchise',
  official: 'Officiel',
  deluxe: 'Deluxe',
  collector: 'Collector',
}

export function CollectionCard({ collection, locale }: CollectionCardProps) {
  return (
    <a
      href={`/${locale}/library/collections#${collection.slug}`}
      className="group block w-64 shrink-0 snap-start overflow-hidden rounded-lg bg-[#1a1a1a] transition-colors hover:bg-[#222] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={collection.coverUrl}
          alt={collection.name}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-2 left-2 right-2">
          <span className="inline-flex items-center rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white/80 backdrop-blur-sm">
            {TYPE_LABELS[collection.type]}
          </span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="line-clamp-1 text-sm font-semibold text-white">
          {collection.name}
        </h3>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-white/50">
          <BookOpen className="size-3" />
          <span>{collection.workCount} œuvre(s)</span>
        </div>
      </div>
    </a>
  )
}
