'use client'

import * as React from 'react'
import Link from 'next/link'
import { Bookmark, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { HeroBanner } from '@/components/kami/hero-banner'
import {
  getAnime,
  getContinueWatching,
  getEditorialPicks,
  getLatestAdditions,
  getRecentlyAdded,
  getSeasonalPicks,
  getTrending,
} from '@/lib/mock-data'
import { useAuth } from '@/context/AuthContext'
import type { Anime, ContinueWatchingItem } from '@/types/anime'

interface DiscoverRailProps {
  title: string
  href: string
  subtitle?: string
  ctaLabel?: string
  children: React.ReactNode
}

function DiscoverRail({ title, href, subtitle, ctaLabel, children }: DiscoverRailProps) {
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
    scrollRef.current?.scrollBy({ left: -320, behavior: 'smooth' })
  }

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 320, behavior: 'smooth' })
  }

  return (
    <section className="relative py-7 md:py-10">
      <div className="mb-5 flex items-end justify-between gap-4 px-4 md:px-8 xl:px-20">
        <div>
          <h2 className="font-body text-2xl font-bold tracking-tight text-ink md:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-base text-ink-soft">{subtitle}</p>}
        </div>
        {ctaLabel && (
          <Link
            href={href}
            className="group inline-flex shrink-0 items-center gap-1 text-xs font-bold uppercase tracking-wide text-ink-soft transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {ctaLabel}
            <ChevronRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        )}
      </div>
      <div className="relative">
        {canScrollLeft && (
          <button
            type="button"
            onClick={scrollLeft}
            className="absolute left-1 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-ink/80 text-paper shadow-lg backdrop-blur-sm transition-colors hover:bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:left-2"
            aria-label="Reculer"
          >
            <ChevronLeft className="size-5" strokeWidth={2.5} />
          </button>
        )}
        <div
          ref={scrollRef}
          className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scroll-pl-4 md:gap-6 md:px-8 md:scroll-pl-8 xl:px-20 xl:scroll-pl-20"
        >
          {children}
        </div>
        {canScrollRight && (
          <button
            type="button"
            onClick={scrollRight}
            className="absolute right-1 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-ink/80 text-paper shadow-lg backdrop-blur-sm transition-colors hover:bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:right-2"
            aria-label="Voir plus"
          >
            <ChevronRight className="size-5" strokeWidth={2.5} />
          </button>
        )}
      </div>
    </section>
  )
}

interface DiscoverAnimeTileProps {
  anime: Anime
  availability?: string
}

function DiscoverAnimeTile({ anime, availability = 'Sous-titrage | Doublage' }: DiscoverAnimeTileProps) {
  const { isAuthenticated } = useAuth()
  return (
    <Link
      href={`/anime/${anime.slug}`}
      className="group w-36 shrink-0 snap-start outline-none sm:w-48 lg:w-60 xl:w-67 focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="relative aspect-2/3 overflow-hidden bg-paper-raised">
        <img
          src={anime.cover || '/placeholder.jpg'}
          alt={anime.title}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
        />
        {isAuthenticated && (
          <span className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/50 text-white/80 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100">
            <Bookmark className="size-3.5" aria-hidden="true" />
          </span>
        )}
      </div>
      <h3 className="mt-3 line-clamp-2 text-sm font-bold leading-5 text-ink transition-colors group-hover:text-primary">
        {anime.title}
      </h3>
      <p className="mt-1 line-clamp-1 text-sm text-ink-soft">{availability}</p>
    </Link>
  )
}

function ContinueWatchingTile({ item }: { item: ContinueWatchingItem }) {
  const { anime, episode, progressPercent, remainingLabel } = item
  return (
    <Link
      href={`/watch/${anime.slug}`}
      className="group flex w-72 shrink-0 snap-start flex-col overflow-hidden rounded-md bg-paper-raised shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:w-80"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={anime.banner || anime.cover || '/placeholder.jpg'}
          alt={anime.title}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 left-3 right-3">
          <span className="text-xs font-bold text-white/80">Ép. {episode.number}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-3 py-3">
        <h3 className="line-clamp-1 text-sm font-bold text-ink transition-colors group-hover:text-primary">
          {anime.title}
        </h3>
        <p className="line-clamp-1 text-xs text-ink-soft">{remainingLabel}</p>
        <div className="mt-auto">
          <div className="h-1 w-full overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function DiscoverPage() {
  const { isAuthenticated } = useAuth()
  const t = useTranslations('Public.discover')
  const featured = ['neon-samurai', 'crimson-vow', 'moonlit-path', 'ember-crown', 'starfall-academy', 'spirit-veil'].map((id) => getAnime(id)!)
  const continueWatching = getContinueWatching()
  const continueWatchingAnimes = continueWatching.map((item) => item.anime)
  const seasonalPicks = getSeasonalPicks().map((pick) => pick.anime)
  const recentlyAdded = getRecentlyAdded().map((item) => item.anime)
  const latestAdditions = getLatestAdditions()
  const recommendations = getEditorialPicks()
  const trending = getTrending().map((item) => item.anime)
  const sections: Array<{
    title: string
    href: string
    animes: Anime[]
    subtitle?: string
    ctaLabel?: string
  }> = [
    { title: t('sectionTrending'), href: '/catalog?sort=trending', animes: trending, subtitle: t('sectionTrendingSub') },
    { title: t('sectionVF'), href: '/catalog?language=dubbed', animes: latestAdditions, subtitle: t('sectionVFSub') },
    { title: t('sectionPicks'), href: '/catalog?sort=recommended', animes: recommendations, subtitle: t('sectionPicksSub') },
    ...(isAuthenticated ? [{ title: t('sectionResume'), href: '/library', animes: [] as Anime[], subtitle: t('sectionResumeSub') }] : []),
    { title: t('sectionFamily'), href: '/catalog?genre=family', animes: seasonalPicks, subtitle: t('sectionFamilySub') },
    { title: t('sectionSciFi'), href: '/catalog?genre=sci-fi', animes: latestAdditions, subtitle: t('sectionSciFiSub') },
    { title: t('sectionNewEps'), href: '/catalog?sort=new', animes: recentlyAdded, subtitle: t('sectionNewEpsSub') },
    { title: t('sectionInspired'), href: '/catalog?sort=recommended', animes: recommendations, subtitle: t('sectionInspiredSub') },
    { title: t('sectionEars'), href: '/catalog?collection=animal-companions', animes: seasonalPicks, subtitle: t('sectionEarsSub') },
    { title: t('sectionVoyage'), href: '/catalog?genre=adventure', animes: recentlyAdded, subtitle: t('sectionVoyageSub') },
    ...(isAuthenticated ? [{
      title: t('sectionWatchlist'),
      href: '/library',
      ctaLabel: t('sectionWatchlistCta'),
      animes: continueWatchingAnimes,
      subtitle: t('sectionWatchlistSub'),
    }] : []),
    { title: t('sectionFoot'), href: '/catalog?genre=sports', animes: trending, subtitle: t('sectionFootSub') },
    { title: t('sectionMecha'), href: '/catalog?genre=mecha', animes: latestAdditions, subtitle: t('sectionMechaSub') },
    { title: t('sectionFinishLine'), href: '/catalog?genre=sports', animes: trending, subtitle: t('sectionFinishLineSub') },
    { title: t('sectionShort'), href: '/catalog?format=short', animes: recentlyAdded, subtitle: t('sectionShortSub') },
    { title: t('sectionFanfiction'), href: '/catalog?collection=fanfiction', animes: recommendations, subtitle: t('sectionFanfictionSub') },
    { title: t('sectionStrategy'), href: '/catalog?genre=strategy', animes: seasonalPicks, subtitle: t('sectionStrategySub') },
    { title: t('sectionComedy'), href: '/catalog?genre=comedy', animes: latestAdditions, subtitle: t('sectionComedySub') },
    { title: t('sectionPopularFR'), href: '/catalog?country=france&sort=popular', animes: trending, subtitle: t('sectionPopularFRSub') },
    { title: t('sectionCardGame'), href: '/catalog?collection=card-game', animes: recentlyAdded, subtitle: t('sectionCardGameSub') },
    { title: t('sectionVampire'), href: '/catalog?genre=vampire', animes: getEditorialPicks().slice(0, 6), subtitle: t('sectionVampireSub') },
    { title: t('sectionGlobe'), href: '/catalog?genre=travel', animes: seasonalPicks, subtitle: t('sectionGlobeSub') },
    { title: t('sectionFemaleLeads'), href: '/catalog?collection=female-leads', animes: getSeasonalPicks().slice(0, 6).map((p) => p.anime), subtitle: t('sectionFemaleLeadsSub') },
  ]

  return (
    <div className="min-h-screen overflow-x-hidden bg-paper pb-16 text-ink">
      <HeroBanner items={featured} />

      <main id="main-content" className="relative z-10 -mt-32 pb-12">
        {sections.map((section) =>
          section.title === 'Reprendre' ? (
            <DiscoverRail key={section.title} title={section.title} href={section.href} subtitle={section.subtitle}>
              {continueWatching.map((item) => (
                <ContinueWatchingTile key={`reprendre-${item.anime.id}`} item={item} />
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
                <DiscoverAnimeTile key={`${section.title}-${anime.id}`} anime={anime} />
              ))}
            </DiscoverRail>
          ),
        )}
      </main>

      <section className="flex flex-col items-center gap-5 px-4 py-16 text-center md:px-8">
        <p className="max-w-md font-display text-xl font-bold leading-snug tracking-tight text-ink sm:text-2xl">
          Vous cherchez encore quelque chose à regarder ?<br />
          Découvrez notre bibliothèque complète
        </p>
        <Button
          asChild
          className="h-10 rounded-none bg-primary px-5 text-xs font-bold uppercase text-primary-foreground transition-colors duration-200 hover:bg-stamp-dim focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          <Link href="/catalog">Voir tout</Link>
        </Button>
      </section>
    </div>
  )
}
