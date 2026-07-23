'use client'

import * as React from 'react'
import { use } from 'react'
import Link from 'next/link'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { Bookmark, ChevronLeft, ChevronRight, Play, Plus, ThumbsDown, ThumbsUp, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { HeroBanner } from '@/components/kami/hero-banner'
import {
  getAnime,
  getAllAnime,
  getContinueWatching,
} from '@/lib/mock-data'
import { useAuth } from '@/context/AuthContext'
import type { Anime } from '@/types/anime'

interface DiscoverRailProps {
  title: string
  href: string
  subtitle?: string
  ctaLabel?: string
  children: React.ReactNode
}

function DiscoverRail({ title, href, subtitle, ctaLabel, children }: DiscoverRailProps) {
  const t = useTranslations('Public.discover')
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [canScrollRight, setCanScrollRight] = React.useState(false)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const check = () => {
      setCanScrollLeft(el.scrollLeft > 1)
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    }
    check()

    el.addEventListener('scroll', check, { passive: true })
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', check)
      ro.disconnect()
    }
  }, [])

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' })
  }

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' })
  }

  return (
    <section className="relative py-3 md:py-5">
      <div className="mb-3 flex items-center justify-between gap-4 px-4 md:px-8 xl:px-20">
        <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">{title}</h2>
        {ctaLabel && (
          <Link
            href={href}
            className="group inline-flex shrink-0 items-center gap-1 text-xs font-semibold uppercase tracking-wide text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {ctaLabel}
            <ChevronRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        )}
      </div>
      <div className="relative group/rail">
        {canScrollLeft && (
          <button
            type="button"
            onClick={scrollLeft}
            className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-linear-to-r from-[#141414] to-transparent flex items-center justify-center opacity-0 group-hover/rail:opacity-100 transition-opacity"
            aria-label={t('railScrollBack')}
          >
            <ChevronLeft className="size-10 text-white" strokeWidth={2} />
          </button>
        )}
        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-4 scroll-pl-4 md:px-8 md:scroll-pl-8 xl:px-20 xl:scroll-pl-20 scrollbar-hide"
        >
          {children}
        </div>
        {canScrollRight && (
          <button
            type="button"
            onClick={scrollRight}
            className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-linear-to-l from-[#141414] to-transparent flex items-center justify-center opacity-0 group-hover/rail:opacity-100 transition-opacity"
            aria-label={t('railScrollMore')}
          >
            <ChevronRight className="size-10 text-white" strokeWidth={2} />
          </button>
        )}
      </div>
    </section>
  )
}

interface DiscoverAnimeTileProps {
  anime: Anime
  currentLocale: string
  badge?: string
  progressPercent?: number
  remainingLabel?: string
  episodeNumber?: number
  episodeTitle?: string
  currentTime?: number
  totalTime?: number
}

function DiscoverAnimeTile({ anime, currentLocale, badge, progressPercent, remainingLabel, episodeNumber, episodeTitle, currentTime, totalTime }: DiscoverAnimeTileProps) {
  const t = useTranslations('Public.discover')
  const { isAuthenticated } = useAuth()
  const isContinueWatching = progressPercent !== undefined
  const tileRef = React.useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = React.useState(false)
  const [isVisible, setIsVisible] = React.useState(false)
  const [cardPosition, setCardPosition] = React.useState<{ top: number; left: number } | null>(null)
  const hoverTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const animationFrameRef = React.useRef<number>(0)

  // Active states for action buttons
  const [isAddedToList, setIsAddedToList] = React.useState(false)
  const [isDisliked, setIsDisliked] = React.useState(false)
  const [isLiked, setIsLiked] = React.useState(false)

  const updateCardPosition = React.useCallback(() => {
    if (tileRef.current) {
      const rect = tileRef.current.getBoundingClientRect()
      setCardPosition({
        top: rect.top,
        left: rect.left + rect.width / 2,
      })
    }
  }, [])

  const handleMouseEnter = React.useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      updateCardPosition()
      setIsHovered(true)
      // Small delay to ensure DOM is ready, then trigger animation
      animationFrameRef.current = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true)
        })
      })
    }, 400)
  }, [updateCardPosition])

  const handleMouseLeave = React.useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    setIsVisible(false)
    // Delay hiding the card to allow exit animation
    setTimeout(() => {
      setIsHovered(false)
    }, 200)
  }, [])

  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  React.useEffect(() => {
    if (isHovered) {
      const handleScroll = () => updateCardPosition()
      window.addEventListener('scroll', handleScroll, { passive: true })
      window.addEventListener('resize', handleScroll)
      return () => {
        window.removeEventListener('scroll', handleScroll)
        window.removeEventListener('resize', handleScroll)
      }
    }
  }, [isHovered, updateCardPosition])

  return (
    <div
      ref={tileRef}
      className="group relative w-40 shrink-0 snap-start outline-none sm:w-50 lg:w-60 xl:w-70 focus-visible:ring-2 focus-visible:ring-white"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={`/${currentLocale}/anime/${anime.slug}`}
        className="block overflow-hidden rounded-md"
      >
        <div className="relative aspect-video overflow-hidden bg-[#1a1a1a]">
          <img
            src={anime.banner || anime.cover || '/placeholder.jpg'}
            alt={anime.title}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          {badge && (
            <span className="absolute bottom-2 left-2 rounded bg-[#e50914] px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
              {badge}
            </span>
          )}
          {isAuthenticated && !isContinueWatching && (
            <button
              type="button"
              className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:bg-black/80"
              aria-label={t('addToWatchlist', { title: anime.title })}
            >
              <Bookmark className="size-4" aria-hidden="true" />
            </button>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <h3 className="line-clamp-2 text-sm font-bold leading-tight text-white drop-shadow-md">
              {anime.title}
            </h3>
          </div>
        </div>
      </Link>

      {/* Progress bar below thumbnail for Continue Watching items - 80% centered */}
      {isContinueWatching && progressPercent !== undefined && (
        <div className="mt-1.5 px-[10%]">
          <div className="h-0.75 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-[#e50914] transition-[width] duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Netflix-style hover card - rendered via Portal, overlays the item */}
      {isHovered && cardPosition && typeof window !== 'undefined' && createPortal(
        <div
          className="fixed z-9999 pointer-events-auto"
          style={{
            top: `${cardPosition.top}px`,
            left: `${cardPosition.left}px`,
            transform: isVisible
              ? 'translateX(-50%) translateY(-8px) scale(1.15)'
              : 'translateX(-50%) translateY(0px) scale(1)',
            transformOrigin: 'center bottom',
            opacity: isVisible ? 1 : 0,
            transition: 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease-out',
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="w-72 rounded-lg bg-[#181818] shadow-[0_8px_40px_rgba(0,0,0,0.9)] overflow-hidden border border-white/8">
            {/* Banner image area */}
            <div className="relative aspect-video bg-void">
              <img
                src={anime.banner || anime.cover || '/placeholder.jpg'}
                alt={anime.title}
                className="size-full object-cover"
              />
              {/* Gradient overlay at bottom for smooth transition */}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-[#181818] to-transparent" />
            </div>

            {/* Content area - separated from image */}
            <div className="px-4 pb-3 pt-2">
              {/* Play button + Action buttons row */}
              <div className="flex items-center gap-2 mb-2.5">
                {/* Play button */}
                <Link
                  href={`/${currentLocale}/watch/${anime.slug}`}
                  className="flex size-8 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-110 shadow-md"
                >
                  <Play className="size-3.5 fill-current ml-0.5" />
                </Link>

                {/* Action buttons */}
                <button
                  type="button"
                  onClick={() => setIsAddedToList(!isAddedToList)}
                  className={`flex size-7 items-center justify-center rounded-full border-[1.5px] transition-all hover:scale-110 ${
                    isAddedToList
                      ? 'border-white bg-white text-black'
                      : 'border-white/40 text-white/70 hover:border-white hover:text-white'
                  }`}
                  aria-label={isAddedToList ? t('removeFromList', { title: anime.title }) : t('addToList', { title: anime.title })}
                >
                  {isAddedToList ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsDisliked(!isDisliked); if (isLiked) setIsLiked(false) }}
                  className={`flex size-7 items-center justify-center rounded-full border-[1.5px] transition-all hover:scale-110 ${
                    isDisliked
                      ? 'border-white bg-white text-black'
                      : 'border-white/40 text-white/70 hover:border-white hover:text-white'
                  }`}
                  aria-label={isDisliked ? t('removeDislike') : t('notInterested')}
                >
                  <ThumbsDown className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => { setIsLiked(!isLiked); if (isDisliked) setIsDisliked(false) }}
                  className={`flex size-7 items-center justify-center rounded-full border-[1.5px] transition-all hover:scale-110 ${
                    isLiked
                      ? 'border-white bg-white text-black'
                      : 'border-white/40 text-white/70 hover:border-white hover:text-white'
                  }`}
                  aria-label={isLiked ? t('removeLike') : t('like')}
                >
                  <ThumbsUp className="size-3.5" />
                </button>
                <Link
                  href={`/${currentLocale}/anime/${anime.slug}`}
                  className="ml-auto flex size-7 items-center justify-center rounded-full border-[1.5px] border-white/40 text-white/70 transition-all hover:border-white hover:text-white hover:scale-110"
                  aria-label={t('episodesAndInfo')}
                >
                  <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </Link>
              </div>

              {/* Metadata line - age, season info, episodes */}
              <div className="flex items-center gap-1.5 mb-1.5">
                {anime.ageRating && (
                  <span className="rounded border border-white/40 px-1 py-px text-[9px] font-bold text-white/80 leading-none">
                    {anime.ageRating}
                  </span>
                )}
                {isContinueWatching && episodeNumber && (
                  <span className="text-[10px] text-white/60">
                    {t('seasonOne')}
                  </span>
                )}
                {!isContinueWatching && anime.seasons && anime.seasons.length > 0 && (
                  <span className="text-[10px] text-white/60">
                    {anime.seasons.length === 1 ? t('seasonCount', { count: anime.seasons.length }) : t('seasonCountPlural', { count: anime.seasons.length })}
                  </span>
                )}
                {anime.totalEpisodes > 0 && (
                  <span className="text-[10px] text-white/60">
                    {t('episodeCount', { count: anime.totalEpisodes })}
                  </span>
                )}
              </div>

              {/* Genre tags */}
              {anime.genres && anime.genres.length > 0 && (
                <p className="text-[10px] text-white/50 mb-1.5 truncate">
                  {anime.genres.slice(0, 3).map(g => g.name).join(' • ')}
                </p>
              )}

              {/* Progress bar - only for Continue Watching */}
              {isContinueWatching && progressPercent !== undefined && (
                <div className="relative h-0.75 w-full overflow-hidden rounded-full bg-white/20 mb-1.5">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-[#e50914]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}

              {/* Time info - only for Continue Watching */}
              {isContinueWatching && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/50">{remainingLabel}</span>
                  {currentTime && totalTime && (
                    <span className="text-[10px] text-white/50">{t('timeSur', { current: currentTime, total: totalTime })}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default function DiscoverPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = use(params)
  const pathname = usePathname()
  const currentLocale = locale || pathname?.split('/')[1] || 'fr'
  const { isAuthenticated, user } = useAuth()
  const t = useTranslations('Public.discover')
  const featured = ['neon-samurai', 'crimson-vow', 'moonlit-path', 'ember-crown', 'starfall-academy', 'spirit-veil'].map((id) => getAnime(id)!)
  const continueWatching = getContinueWatching().slice(0, 5)
  const continueWatchingAnimes = continueWatching.map((item) => item.anime)
  const username = user?.displayName || ''
  const allAnime = getAllAnime()
  const sections: Array<{
    title: string
    href: string
    animes: Anime[]
    subtitle?: string
    ctaLabel?: string
  }> = [
    { title: t('sectionExclusive'), href: '/catalog?sort=exclusive', animes: allAnime.slice(0, 8), subtitle: t('sectionExclusiveSub') },
    ...(isAuthenticated && username ? [{ title: t('sectionResumeUsername', { username }), href: '/library', animes: [] as Anime[], subtitle: t('sectionResumeSub') }] : []),
    { title: t('sectionThrillers'), href: '/catalog?genre=thriller', animes: allAnime.slice(2, 10), subtitle: t('sectionThrillersSub') },
    ...(isAuthenticated ? [{
      title: t('sectionWatchlist'),
      href: '/library',
      ctaLabel: t('sectionWatchlistCta'),
      animes: continueWatchingAnimes,
      subtitle: t('sectionWatchlistSub'),
    }] : []),
    { title: t('sectionDailyPick'), href: '/catalog?sort=daily', animes: allAnime.slice(4, 12), subtitle: t('sectionDailyPickSub') },
    { title: t('sectionRewatch'), href: '/catalog?sort=rewatch', animes: allAnime.slice(1, 7), subtitle: t('sectionRewatchSub') },
    { title: t('sectionFilms'), href: '/catalog?type=movie', animes: allAnime.slice(6, 14), subtitle: t('sectionFilmsSub') },
    { title: t('sectionTimeTravel'), href: '/catalog?genre=scifi', animes: allAnime.slice(3, 11), subtitle: t('sectionTimeTravelSub') },
    { title: t('sectionNewWeek'), href: '/catalog?sort=new', animes: allAnime.slice(8, 16), subtitle: t('sectionNewWeekSub') },
    { title: t('sectionActionAdventure'), href: '/catalog?genre=action', animes: allAnime.slice(5, 13), subtitle: t('sectionActionAdventureSub') },
    { title: t('sectionBlockbusters'), href: '/catalog?genre=revenge', animes: allAnime.slice(0, 6), subtitle: t('sectionBlockbustersSub') },
    { title: t('sectionMultiverse'), href: '/catalog?genre=multiverse', animes: allAnime.slice(7, 15), subtitle: t('sectionMultiverseSub') },
    { title: t('sectionEspionage'), href: '/catalog?genre=espionage', animes: allAnime.slice(2, 8), subtitle: t('sectionEspionageSub') },
    { title: t('sectionSpaceOpera'), href: '/catalog?genre=space', animes: allAnime.slice(4, 12), subtitle: t('sectionSpaceOperaSub') },
    { title: t('sectionTop10', { country: 'France' }), href: '/catalog?sort=top10', animes: allAnime.slice(0, 10), subtitle: t('sectionTop10Sub') },
    { title: t('sectionWarPolitics'), href: '/catalog?genre=war', animes: allAnime.slice(6, 14), subtitle: t('sectionWarPoliticsSub') },
  ]

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#141414] pb-16 text-white select-none">
      <HeroBanner items={featured} />

      <main id="main-content" className="relative z-10 pb-12">
        {sections.map((section) =>
          (section.title === t('sectionResumeUsername', { username }) || section.title === t('sectionResume')) ? (
            <DiscoverRail key={section.title} title={section.title} href={section.href} subtitle={section.subtitle}>
              {continueWatching.map((item) => (
                <DiscoverAnimeTile
                  key={`reprendre-${item.anime.id}`}
                  anime={item.anime}
                  currentLocale={currentLocale}
                  progressPercent={item.progressPercent}
                  remainingLabel={item.remainingLabel}
                  episodeNumber={item.episode.number}
                  episodeTitle={item.episode.title}
                  currentTime={item.episode.progress ? Math.round(item.episode.progress / 60) : undefined}
                  totalTime={item.episode.duration ? Math.round(item.episode.duration / 60) : undefined}
                />
              ))}
            </DiscoverRail>
          ) : (
            <DiscoverRail
              key={section.title}
              title={section.title}
              href={section.href}
              subtitle={section.subtitle}
              ctaLabel={section.ctaLabel}
            >
              {section.animes.map((anime) => (
                <DiscoverAnimeTile key={`${section.title}-${anime.id}`} anime={anime} currentLocale={currentLocale} />
              ))}
            </DiscoverRail>
          ),
        )}
      </main>

      <section className="flex flex-col items-center gap-5 px-4 py-16 text-center md:px-8">
        <p className="max-w-md font-display text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl">
          {t('ctaLooking')}<br />
          {t('ctaDiscover')}
        </p>
        <Button
          asChild
          className="h-10 rounded-sm bg-white px-5 text-xs font-semibold uppercase text-black transition-colors duration-200 hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414]"
        >
          <Link href="/catalog">{t('ctaViewAll')}</Link>
        </Button>
      </section>
    </div>
  )
}
