'use client'

import * as React from 'react'
import { use } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bookmark,
  Check,
  Clock,
  Heart,
  Play,
  Plus,
  SlidersHorizontal,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getLibrarySection } from '@/lib/mock-data'
import { useAuth } from '@/context/AuthContext'
import type { Anime } from '@/types/anime'
import { cn } from '@/lib/utils'

/* -------------------------------------------------------------------------- *
 * Types
 * -------------------------------------------------------------------------- */

type WatchlistTab = 'watching' | 'completed' | 'watchlater' | 'favorites'

interface TabConfig {
  id: WatchlistTab
  label: string
  icon: React.ReactNode
}

/* -------------------------------------------------------------------------- *
 * Custom hook for managing watchlist state
 * -------------------------------------------------------------------------- */

function useWatchlistState() {
  const [activeTab, setActiveTab] = React.useState<WatchlistTab>('watching')
  const [bookmarks, setBookmarks] = React.useState<Set<string>>(new Set())
  const [removing, setRemoving] = React.useState<string | null>(null)

  // Initialize bookmarks from localStorage
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('kami-watchlist')
      if (stored) {
        setBookmarks(new Set(JSON.parse(stored)))
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  // Save bookmarks to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('kami-watchlist', JSON.stringify([...bookmarks]))
    } catch {
      // Ignore localStorage errors
    }
  }, [bookmarks])

  const toggleBookmark = React.useCallback((animeId: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev)
      if (next.has(animeId)) {
        next.delete(animeId)
      } else {
        next.add(animeId)
      }
      return next
    })
  }, [])

  const removeFromList = React.useCallback((animeId: string) => {
    setRemoving(animeId)
    // Simulate API call
    setTimeout(() => {
      setBookmarks((prev) => {
        const next = new Set(prev)
        next.delete(animeId)
        return next
      })
      setRemoving(null)
    }, 500)
  }, [])

  return {
    activeTab,
    setActiveTab,
    bookmarks,
    toggleBookmark,
    removeFromList,
    removing,
  }
}

/* -------------------------------------------------------------------------- *
 * Anime Grid Item with actions
 * -------------------------------------------------------------------------- */

interface WatchlistAnimeCardProps {
  anime: Anime
  isBookmarked: boolean
  onToggleBookmark: (animeId: string) => void
  onRemove: (animeId: string) => void
  isRemoving: boolean
  locale: string
}

function WatchlistAnimeCard({
  anime,
  isBookmarked,
  onToggleBookmark,
  onRemove,
  isRemoving,
  locale,
}: WatchlistAnimeCardProps) {
  const t = useTranslations('Public.watchlist')
  const [showActions, setShowActions] = React.useState(false)

  return (
    <div
      className="group relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Link
        href={`/${locale}/anime/${anime.slug}`}
        className="block overflow-hidden rounded-xl border border-border/40 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-border/80 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-ring"
      >
        {/* Cover Image */}
        <div className="relative aspect-2/3 overflow-hidden">
          <img
            src={anime.cover || '/placeholder.svg'}
            alt={anime.title}
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-300 group-hover:scale-110">
              <Play className="size-5 fill-current" />
            </span>
          </div>

          {/* Rating badge */}
          <div className="absolute right-2 top-2 z-10">
            <span className="flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 text-xs font-bold backdrop-blur-sm">
              <Sparkles className="size-3 text-yellow-500" />
              {anime.rating}
            </span>
          </div>

          {/* Status badge */}
          <div className="absolute left-2 top-2 z-10">
            <Badge
              variant={anime.status === 'airing' ? 'default' : 'secondary'}
              className="text-[10px] font-bold"
            >
              {anime.status === 'airing'
                ? t('statusAiring')
                : anime.status === 'completed'
                  ? t('statusCompleted')
                  : anime.status === 'upcoming'
                    ? t('statusUpcoming')
                    : t('statusHiatus')}
            </Badge>
          </div>
        </div>

        {/* Card Info */}
        <div className="p-3">
          <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">
            {anime.title}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
            {anime.genres
              .slice(0, 2)
              .map((g) => g.name)
              .join(' · ')}
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{anime.year}</span>
            <span>•</span>
            <span>{anime.totalEpisodes} {t('episodes')}</span>
          </div>
        </div>
      </Link>

      {/* Action buttons */}
      {showActions && (
        <div className="absolute right-2 top-2 z-20 flex flex-col gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleBookmark(anime.id)
            }}
            className={cn(
              'flex size-8 items-center justify-center rounded-lg transition-all duration-200',
              isBookmarked
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-background/60 text-foreground backdrop-blur-sm opacity-0 group-hover:opacity-100',
            )}
            aria-label={isBookmarked ? t('removeFromWatchlist') : t('addToWatchlist')}
          >
            {isBookmarked ? (
              <Bookmark className="size-4" fill="currentColor" />
            ) : (
              <Bookmark className="size-4" />
            )}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onRemove(anime.id)
            }}
            className="flex size-8 items-center justify-center rounded-lg bg-background/60 text-foreground backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground"
            aria-label={t('removeFromList')}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Trash2 className="size-4" />
            )}
          </button>
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- *
 * Empty State
 * -------------------------------------------------------------------------- */

function EmptyState({
  tab,
  locale,
}: {
  tab: WatchlistTab
  locale: string
}) {
  const t = useTranslations('Public.watchlist')

  const emptyConfig = {
    watching: {
      icon: <Play className="size-12" />,
      title: t('emptyWatchingTitle'),
      description: t('emptyWatchingDescription'),
      cta: t('emptyWatchingCta'),
      href: `/${locale}/discover`,
    },
    completed: {
      icon: <Check className="size-12" />,
      title: t('emptyCompletedTitle'),
      description: t('emptyCompletedDescription'),
      cta: t('emptyCompletedCta'),
      href: `/${locale}/discover`,
    },
    watchlater: {
      icon: <Clock className="size-12" />,
      title: t('emptyWatchLaterTitle'),
      description: t('emptyWatchLaterDescription'),
      cta: t('emptyWatchLaterCta'),
      href: `/${locale}/discover`,
    },
    favorites: {
      icon: <Heart className="size-12" />,
      title: t('emptyFavoritesTitle'),
      description: t('emptyFavoritesDescription'),
      cta: t('emptyFavoritesCta'),
      href: `/${locale}/discover`,
    },
  }

  const config = emptyConfig[tab]

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {config.icon}
      </div>
      <h3 className="text-xl font-bold tracking-tight text-foreground">
        {config.title}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {config.description}
      </p>
      <Button asChild className="mt-6 gap-2">
        <Link href={config.href}>
          <Plus className="size-4" />
          {config.cta}
        </Link>
      </Button>
    </div>
  )
}

/* -------------------------------------------------------------------------- *
 * Page Component
 * -------------------------------------------------------------------------- */

export default function WatchlistPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = use(params)
  const pathname = usePathname()
  const currentLocale = locale || pathname?.split('/')[1] || 'fr'
  const { isAuthenticated } = useAuth()
  const t = useTranslations('Public.watchlist')

  const {
    activeTab,
    setActiveTab,
    bookmarks,
    toggleBookmark,
    removeFromList,
    removing,
  } = useWatchlistState()

  // Get anime data for each tab
  const watchingAnime = React.useMemo(() => getLibrarySection('watching'), [])
  const completedAnime = React.useMemo(() => getLibrarySection('completed'), [])
  const watchLaterAnime = React.useMemo(() => getLibrarySection('watchlater'), [])
  const favoritesAnime = React.useMemo(() => getLibrarySection('favorites'), [])

  // Tab configuration
  const tabs: TabConfig[] = React.useMemo(
    () => [
      {
        id: 'watching',
        label: t('tabWatching'),
        icon: <Play className="size-4" />,
      },
      {
        id: 'completed',
        label: t('tabCompleted'),
        icon: <Check className="size-4" />,
      },
      {
        id: 'watchlater',
        label: t('tabWatchLater'),
        icon: <Clock className="size-4" />,
      },
      {
        id: 'favorites',
        label: t('tabFavorites'),
        icon: <Heart className="size-4" />,
      },
    ],
    [t],
  )

  // Get current tab data
  const currentAnime = React.useMemo(() => {
    switch (activeTab) {
      case 'watching':
        return watchingAnime
      case 'completed':
        return completedAnime
      case 'watchlater':
        return watchLaterAnime
      case 'favorites':
        return favoritesAnime
      default:
        return []
    }
  }, [activeTab, watchingAnime, completedAnime, watchLaterAnime, favoritesAnime])

  // Filter by bookmarks if needed
  const displayAnime = React.useMemo(() => {
    // For demo, show all anime in the section
    // In production, this would filter by user's actual watchlist
    return currentAnime
  }, [currentAnime])

  // Count items in each tab
  const tabCounts = React.useMemo(
    () => ({
      watching: watchingAnime.length,
      completed: completedAnime.length,
      watchlater: watchLaterAnime.length,
      favorites: favoritesAnime.length,
    }),
    [watchingAnime, completedAnime, watchLaterAnime, favoritesAnime],
  )

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      // Allow viewing but show limited content
    }
  }, [isAuthenticated])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 pt-8 md:px-8">
        <div className="flex flex-col gap-6">
          {/* Title Row */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {t('title')}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('subtitle', { count: displayAnime.length })}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <SlidersHorizontal className="size-4" />
                {t('filter')}
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {tab.icon}
                {tab.label}
                <Badge
                  variant={activeTab === tab.id ? 'secondary' : 'outline'}
                  className="ml-1 size-5 rounded-full p-0 text-[10px]"
                >
                  {tabCounts[tab.id]}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-6 md:px-8">
        {displayAnime.length === 0 ? (
          <EmptyState tab={activeTab} locale={currentLocale} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {displayAnime.map((anime) => (
              <WatchlistAnimeCard
                key={anime.id}
                anime={anime}
                isBookmarked={bookmarks.has(anime.id)}
                onToggleBookmark={toggleBookmark}
                onRemove={removeFromList}
                isRemoving={removing === anime.id}
                locale={currentLocale}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Add Section */}
      <div className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
        <div className="rounded-2xl border border-border/40 bg-card/50 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-bold tracking-tight text-foreground">
                {t('quickAddTitle')}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('quickAddDescription')}
              </p>
            </div>
            <Button asChild variant="outline" className="gap-2">
              <Link href={`/${currentLocale}/discover`}>
                <Sparkles className="size-4" />
                {t('discoverMore')}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
