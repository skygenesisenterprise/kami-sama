import * as React from 'react'
import Link from 'next/link'
import { Bookmark, ChevronRight } from 'lucide-react'
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
import type { Anime } from '@/types/anime'

interface DiscoverRailProps {
  title: string
  href: string
  subtitle?: string
  ctaLabel?: string
  children: React.ReactNode
}

function DiscoverRail({ title, href, subtitle, ctaLabel, children }: DiscoverRailProps) {
  return (
    <section className="py-7 md:py-10">
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
      <div className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scroll-pl-4 md:gap-6 md:px-8 md:scroll-pl-8 xl:px-20 xl:scroll-pl-20">
        {children}
      </div>
    </section>
  )
}

interface DiscoverAnimeTileProps {
  anime: Anime
  availability?: string
}

function DiscoverAnimeTile({ anime, availability = 'Sous-titrage | Doublage' }: DiscoverAnimeTileProps) {
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
        <Bookmark className="absolute right-1 top-1 size-4 fill-primary text-primary drop-shadow-sm" aria-hidden="true" />
      </div>
      <h3 className="mt-3 line-clamp-2 text-sm font-bold leading-5 text-ink transition-colors group-hover:text-primary">
        {anime.title}
      </h3>
      <p className="mt-1 line-clamp-1 text-sm text-ink-soft">{availability}</p>
    </Link>
  )
}

export default function DiscoverPage() {
  const featured = ['neon-samurai', 'crimson-vow', 'moonlit-path'].map((id) => getAnime(id)!)
  const continueWatching = getContinueWatching().map((item) => item.anime)
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
    { title: 'Tendance en France', href: '/browse?sort=trending', animes: trending },
    { title: 'VF disponibles sur Kami-Sama', href: '/browse?language=dubbed', animes: latestAdditions },
    { title: 'Notre sélection pour vous', href: '/browse?sort=recommended', animes: recommendations },
    { title: 'Reprendre', href: '/library', animes: continueWatching },
    { title: 'En quête d’anime familial ?', href: '/browse?genre=family', animes: seasonalPicks },
    { title: 'Quand la science rencontre la fiction', href: '/browse?genre=sci-fi', animes: latestAdditions },
    { title: 'Nouveaux épisodes de la saison actuelle', href: '/browse?sort=new', animes: recentlyAdded },
    { title: 'Inspirés par vous', href: '/browse?sort=recommended', animes: recommendations },
    { title: 'Des oreilles… particulières', href: '/browse?collection=animal-companions', animes: seasonalPicks },
    {
      title: 'En voyage',
      href: '/browse?genre=adventure',
      subtitle: 'Faites vos baluchons, on part à l’aventure !',
      animes: recentlyAdded,
    },
    {
      title: 'Votre Watchlist',
      href: '/library',
      ctaLabel: 'Voir la Watchlist',
      animes: continueWatching,
    },
    { title: 'Légendes du foot', href: '/browse?genre=sports', animes: trending },
    { title: 'La folie des Mecha', href: '/browse?genre=mecha', animes: latestAdditions },
  ]

  return (
    <div className="min-h-screen overflow-x-hidden bg-paper pb-16 text-ink">
      <HeroBanner items={featured} />

      <main id="main-content" className="relative z-10 -mt-32 pb-12">
        {sections.map((section) => (
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
        ))}
      </main>
    </div>
  )
}
