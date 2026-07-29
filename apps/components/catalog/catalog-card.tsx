'use client'

import * as React from 'react'
import Link from 'next/link'
import { Star, Heart, Play, Info, Clock, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CatalogItem, CatalogView } from '@/types/catalog'
import { CATALOG_STATUS_MAP } from '@/lib/mock-catalog'

interface CatalogCardProps {
  item: CatalogItem
  view: CatalogView
  locale: string
}

export function CatalogCard({ item, view, locale }: CatalogCardProps) {
  const statusInfo = CATALOG_STATUS_MAP[item.status]

  if (view === 'list') {
    return (
      <Link
        href={`/${locale}/watch/${item.slug}`}
        className="group flex gap-4 rounded-lg bg-white/5 p-3 transition-colors hover:bg-white/10"
      >
        {/* Cover */}
        <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-md bg-white/5">
          <img
            src={item.coverUrl}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute left-1 top-1 flex items-center gap-0.5 rounded bg-black/70 px-1 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">
            <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
            {item.score}
          </div>
        </div>

        {/* Info */}
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <h3 className="truncate text-sm font-bold text-foreground">{item.title}</h3>
          {item.japaneseTitle && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.japaneseTitle}</p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-white/80">
              {item.type}
            </span>
            <span className={cn('text-[10px] font-medium', statusInfo.color)}>
              {statusInfo.label}
            </span>
            <span className="text-[10px] text-muted-foreground">{item.year}</span>
          </div>
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
            {item.genres.join(' • ')}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end justify-between">
          <Heart className="h-4 w-4 text-muted-foreground transition-colors hover:text-red-400" />
          <span className="text-[10px] text-muted-foreground">
            {item.favorites.toLocaleString('fr-FR')}
          </span>
        </div>
      </Link>
    )
  }

  // Grid view
  return (
    <Link
      href={`/${locale}/watch/${item.slug}`}
      className="group relative flex flex-col"
    >
      {/* Cover */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-white/5">
        <img
          src={item.coverUrl}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Score */}
        <div className="absolute left-2 top-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          {item.score}
        </div>

        {/* Type badge */}
        <div className="absolute right-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white backdrop-blur-sm">
          {item.type}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-110">
            <Play className="h-4 w-4 fill-current" />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-transform hover:scale-110">
            <Info className="h-4 w-4" />
          </button>
        </div>

        {/* Status */}
        <div className="absolute bottom-2 left-2">
          <span className={cn(
            'rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm',
            statusInfo.color,
          )}>
            {statusInfo.label}
          </span>
        </div>

        {/* Episodes/Chapters info */}
        {(item.episodes || item.chapters) && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white backdrop-blur-sm">
            {item.episodes ? (
              <>
                <Clock className="h-2.5 w-2.5" />
                {item.episodes} ep
              </>
            ) : (
              <>
                <BookOpen className="h-2.5 w-2.5" />
                {item.chapters} ch
              </>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-2">
        <h3 className="line-clamp-1 text-sm font-bold text-foreground group-hover:text-primary">
          {item.title}
        </h3>
        {item.japaneseTitle && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {item.japaneseTitle}
          </p>
        )}
        <div className="mt-1 flex flex-wrap gap-1">
          {item.genres.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-muted-foreground ring-1 ring-white/5"
            >
              {genre}
            </span>
          ))}
        </div>
        <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>{item.year}</span>
          {item.studio && (
            <>
              <span>•</span>
              <span>{item.studio}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}
