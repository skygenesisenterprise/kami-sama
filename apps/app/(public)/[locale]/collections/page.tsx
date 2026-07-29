'use client'

import * as React from 'react'
import { use } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { Bookmark, ChevronLeft, ChevronRight, Play, Plus, ThumbsDown, ThumbsUp, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { getAllAnime, getContentPath } from '@/lib/mock-data'
import { getDomainUrl } from '@/lib/domains'
import { useAuth } from '@/context/AuthContext'
import { HeroBanner } from '@/components/kami/hero-banner'
import type { Anime } from '@/types/anime'

interface Collection {
  id: string
  title: string
  description: string
  animeIds: string[]
}

function getCollections(): Collection[] {
  const allAnime = getAllAnime()
  const ids = allAnime.map((a) => a.id)

  return [
    {
      id: 'jurassic-park',
      title: 'Jurassic Park',
      description: 'Découvrez l\'univers complet de Jurassic Park à travers les adaptations animées.',
      animeIds: ids.slice(0, 5),
    },
    {
      id: 'mecha-legends',
      title: 'Mecha Legends',
      description: 'Les plus grands robots géants de l\'animation japonaise.',
      animeIds: ids.slice(2, 7),
    },
    {
      id: 'dark-fantasy',
      title: 'Dark Fantasy',
      description: 'Plongez dans les mondes sombres et mystérieux de la fantasy japonaise.',
      animeIds: ids.slice(1, 6),
    },
    {
      id: 'slice-of-life',
      title: 'Slice of Life',
      description: 'Les histoires quotidiennes les plus touchantes de l\'animation.',
      animeIds: ids.slice(4, 9),
    },
    {
      id: 'sci-fi-frontiers',
      title: 'Sci-Fi Frontiers',
      description: 'Explorez les frontières de la science-fiction japonaise.',
      animeIds: ids.slice(3, 8),
    },
    {
      id: 'combat-arts',
      title: 'Combat Arts',
      description: 'Arts martiaux, combats épiques et actions surhumaines.',
      animeIds: ids.slice(0, 4),
    },
  ]
}

/* ═══════════════════════════════════════════════════════════════════
 * CollectionRail – Netflix-style horizontal scrollable rail
 * ═══════════════════════════════════════════════════════════════════ */
function CollectionRail({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
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
    return () => { el.removeEventListener('scroll', check); ro.disconnect() }
  }, [])

  return (
    <section className="relative py-3 md:py-5">
      <div className="mb-3 px-4 md:px-8 xl:px-20">
        <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-white/50">{subtitle}</p>}
      </div>
      <div className="relative group/rail">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
            className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-linear-to-r from-[#141414] to-transparent flex items-center justify-center opacity-0 group-hover/rail:opacity-100 transition-opacity"
            aria-label="Précédent"
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
            onClick={() => scrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
            className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-linear-to-l from-[#141414] to-transparent flex items-center justify-center opacity-0 group-hover/rail:opacity-100 transition-opacity"
            aria-label="Suivant"
          >
            <ChevronRight className="size-10 text-white" strokeWidth={2} />
          </button>
        )}
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════
 * AnimeTile – Netflix-style hover card tile
 * ═══════════════════════════════════════════════════════════════════ */
function AnimeTile({ anime, currentLocale }: { anime: Anime; currentLocale: string }) {
  const t = useTranslations('Public.discover')
  const { isAuthenticated } = useAuth()
  const tileRef = React.useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = React.useState(false)
  const [isVisible, setIsVisible] = React.useState(false)
  const [cardPosition, setCardPosition] = React.useState<{ top: number; left: number } | null>(null)
  const hoverTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const animationFrameRef = React.useRef<number>(0)

  const [isAddedToList, setIsAddedToList] = React.useState(false)
  const [isDisliked, setIsDisliked] = React.useState(false)
  const [isLiked, setIsLiked] = React.useState(false)

  const updateCardPosition = React.useCallback(() => {
    if (tileRef.current) {
      const rect = tileRef.current.getBoundingClientRect()
      setCardPosition({ top: rect.top, left: rect.left + rect.width / 2 })
    }
  }, [])

  const handleMouseEnter = React.useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      updateCardPosition()
      setIsHovered(true)
      animationFrameRef.current = requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true))
      })
    }, 400)
  }, [updateCardPosition])

  const handleMouseLeave = React.useCallback(() => {
    if (hoverTimeoutRef.current) { clearTimeout(hoverTimeoutRef.current); hoverTimeoutRef.current = null }
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    setIsVisible(false)
    setTimeout(() => setIsHovered(false), 200)
  }, [])

  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  React.useEffect(() => {
    if (isHovered) {
      const handleScroll = () => updateCardPosition()
      window.addEventListener('scroll', handleScroll, { passive: true })
      window.addEventListener('resize', handleScroll)
      return () => { window.removeEventListener('scroll', handleScroll); window.removeEventListener('resize', handleScroll) }
    }
  }, [isHovered, updateCardPosition])

  return (
    <div
      ref={tileRef}
      className="group relative w-40 shrink-0 snap-start outline-none sm:w-50 lg:w-60 xl:w-70 focus-visible:ring-2 focus-visible:ring-white"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <a
        href={getDomainUrl('main', `/${currentLocale}${getContentPath(anime)}/${anime.slug}`)}
        className="block overflow-hidden rounded-md"
      >
        <div className="relative aspect-video overflow-hidden bg-[#1a1a1a]">
          <img
            src={anime.banner || anime.cover || '/placeholder.jpg'}
            alt={anime.title}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          {isAuthenticated && (
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
      </a>

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
            <div className="relative aspect-video bg-void">
              <img src={anime.banner || anime.cover || '/placeholder.jpg'} alt={anime.title} className="size-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-[#181818] to-transparent" />
            </div>
            <div className="px-4 pb-3 pt-2">
              <div className="flex items-center gap-2 mb-2.5">
                <a href={getDomainUrl('main', `/${currentLocale}/watch/${anime.slug}`)} className="flex size-8 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-110 shadow-md">
                  <Play className="size-3.5 fill-current ml-0.5" />
                </a>
                <button type="button" onClick={() => setIsAddedToList(!isAddedToList)} className={`flex size-7 items-center justify-center rounded-full border-[1.5px] transition-all hover:scale-110 ${isAddedToList ? 'border-white bg-white text-black' : 'border-white/40 text-white/70 hover:border-white hover:text-white'}`}>
                  {isAddedToList ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
                </button>
                <button type="button" onClick={() => { setIsDisliked(!isDisliked); if (isLiked) setIsLiked(false) }} className={`flex size-7 items-center justify-center rounded-full border-[1.5px] transition-all hover:scale-110 ${isDisliked ? 'border-white bg-white text-black' : 'border-white/40 text-white/70 hover:border-white hover:text-white'}`}>
                  <ThumbsDown className="size-3.5" />
                </button>
                <button type="button" onClick={() => { setIsLiked(!isLiked); if (isDisliked) setIsDisliked(false) }} className={`flex size-7 items-center justify-center rounded-full border-[1.5px] transition-all hover:scale-110 ${isLiked ? 'border-white bg-white text-black' : 'border-white/40 text-white/70 hover:border-white hover:text-white'}`}>
                  <ThumbsUp className="size-3.5" />
                </button>
                <a href={getDomainUrl('main', `/${currentLocale}${getContentPath(anime)}/${anime.slug}`)} className="ml-auto flex size-7 items-center justify-center rounded-full border-[1.5px] border-white/40 text-white/70 transition-all hover:border-white hover:text-white hover:scale-110">
                  <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                </a>
              </div>
              <div className="flex items-center gap-1.5 mb-1.5">
                {anime.ageRating && (
                  <span className="rounded border border-white/40 px-1 py-px text-[9px] font-bold text-white/80 leading-none">{anime.ageRating}</span>
                )}
                {anime.seasons && anime.seasons.length > 0 && (
                  <span className="text-[10px] text-white/60">
                    {anime.seasons.length === 1 ? `${anime.seasons.length} saison` : `${anime.seasons.length} saisons`}
                  </span>
                )}
                {anime.totalEpisodes > 0 && (
                  <span className="text-[10px] text-white/60">{anime.totalEpisodes} ép.</span>
                )}
              </div>
              {anime.genres && anime.genres.length > 0 && (
                <p className="text-[10px] text-white/50 mb-1.5 truncate">
                  {anime.genres.slice(0, 3).map(g => g.name).join(' • ')}
                </p>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
 * CollectionsPage
 * ═══════════════════════════════════════════════════════════════════ */
export default function CollectionsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = use(params)
  const pathname = usePathname()
  const currentLocale = locale || pathname?.split('/')[1] || 'fr'

  const collections = React.useMemo(() => {
    const allAnime = getAllAnime()
    return getCollections().map((col) => ({
      ...col,
      animes: col.animeIds.map((id) => allAnime.find((a) => a.id === id)).filter(Boolean) as Anime[],
    }))
  }, [])

  const featured = React.useMemo(() => {
    const allAnime = getAllAnime()
    return ['neon-samurai', 'crimson-vow', 'moonlit-path', 'ember-crown', 'starfall-academy', 'spirit-veil']
      .map((id) => allAnime.find((a) => a.id === id))
      .filter(Boolean) as Anime[]
  }, [])

  React.useEffect(() => {
    document.title = 'Kami-Sama: Collections'
  }, [])

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#141414] pb-16 text-white select-none">
      <HeroBanner items={featured} />

      {/* Collection Sections */}
      <main id="main-content" className="relative z-10">
        {collections.map((collection) => (
          <CollectionRail
            key={collection.id}
            title={collection.title}
            subtitle={collection.description}
          >
            {collection.animes.map((anime) => (
              <AnimeTile key={`${collection.id}-${anime.id}`} anime={anime} currentLocale={currentLocale} />
            ))}
          </CollectionRail>
        ))}
      </main>
    </div>
  )
}
