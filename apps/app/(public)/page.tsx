import { Play } from 'lucide-react'
import Link from 'next/link'
import { HeroBanner } from '@/components/kami/hero-banner'
import { AnimeCard } from '@/components/kami/anime-card'
import { ContinueWatchingCard } from '@/components/kami/continue-watching-card'
import { CarouselSection } from '@/components/kami/carousel-section'
import {
  GENRES,
  getAnime,
  getContinueWatching,
  getEditorialPicks,
  getLatestAdditions,
  getRecentlyAdded,
  getSeasonalPicks,
  getTrending,
} from '@/lib/mock-data'

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function HomePage() {
  const featured = ['neon-samurai', 'crimson-vow', 'moonlit-path'].map((id) => getAnime(id)!)
  const continueWatching = getContinueWatching()
  const trending = getTrending()
  const seasonalPicks = getSeasonalPicks().map((p) => p.anime)
  const recentlyAdded = getRecentlyAdded()
  const latestAdditions = getLatestAdditions()
  const recommendations = getEditorialPicks()

  return (
    <div className="min-h-screen pb-16">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <HeroBanner items={featured} />

      {/* ── Content Sections ──────────────────────────────────────────── */}
      <div className="relative z-10 -mt-4 space-y-2">
        {/* ── Continue Watching ─────────────────────────────────────────── */}
        <CarouselSection
          title="Continue Watching"
          subtitle="Pick up where you left off"
          href="/library"
          itemClassName="w-64"
        >
          {continueWatching.map((item, i) => (
            <div key={item.anime.id} className="group relative block">
              <div className="pointer-events-none select-none font-display text-[4rem] font-black leading-none text-foreground/5 md:text-[5rem]">
                {i + 1}
              </div>
              <div className="relative -mt-6 md:-mt-8">
                <ContinueWatchingCard item={item} />
              </div>
            </div>
          ))}
        </CarouselSection>

        {/* ── Trending Now ──────────────────────────────────────────────── */}
        <CarouselSection
          title="Trending Now"
          subtitle="Most popular this week"
          href="/browse?sort=trending"
          itemClassName="w-30 sm:w-35 md:w-40"
        >
          {trending.map((item, i) => (
            <Link
              key={item.anime.id}
              href={`/anime/${item.anime.slug}`}
              className="group relative block"
            >
              <div className="pointer-events-none select-none font-display text-[5rem] font-black leading-none text-foreground/5 md:text-[7rem]">
                {i + 1}
              </div>
              <div className="relative -mt-8 aspect-2/3 overflow-hidden rounded-xl border border-border/40 bg-card md:-mt-12">
                <img
                  src={item.anime.cover || '/placeholder.svg'}
                  alt={item.anime.title}
                  className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent" />
                <div className="absolute right-1.5 top-1.5 z-10">
                  <span className="flex size-6 items-center justify-center rounded bg-primary text-[10px] font-bold text-primary-foreground shadow">
                    {item.rank}
                  </span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                    <Play className="size-4 fill-current" />
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 z-10 p-2">
                  <h3 className="line-clamp-2 text-xs font-semibold leading-tight text-balance">
                    {item.anime.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </CarouselSection>

        {/* ── Popular This Season ────────────────────────────────────────── */}
        <CarouselSection
          title="Popular This Season"
          subtitle="Summer 2025 highlights"
          href="/browse?filter=seasonal"
          itemClassName="w-37.5 sm:w-42.5 lg:w-46.25"
        >
          {seasonalPicks.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </CarouselSection>

        {/* ── Recently Added ────────────────────────────────────────────── */}
        <CarouselSection
          title="Recently Added"
          subtitle="Fresh anime on the platform"
          href="/browse?sort=recent"
          itemClassName="w-37.5 sm:w-42.5 lg:w-46.25"
        >
          {recentlyAdded.map((item) => (
            <AnimeCard
              key={item.anime.id}
              anime={item.anime}
              badge={
                <span className="flex items-center gap-1 rounded-md bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground shadow">
                  EP {item.episode.number}
                </span>
              }
            />
          ))}
        </CarouselSection>

        {/* ── New Episodes ──────────────────────────────────────────────── */}
        <CarouselSection
          title="New Episodes"
          subtitle="Latest episode releases"
          href="/browse?sort=new"
          itemClassName="w-37.5 sm:w-42.5 lg:w-46.25"
        >
          {latestAdditions.map((anime) => (
            <AnimeCard
              key={anime.id}
              anime={anime}
              badge={
                <span className="flex items-center gap-1 rounded-md bg-green-500/90 px-2 py-0.5 text-xs font-bold text-white shadow">
                  NEW
                </span>
              }
            />
          ))}
        </CarouselSection>

        {/* ── Recommended For You ───────────────────────────────────────── */}
        <CarouselSection
          title="Recommended For You"
          subtitle="Based on your watch history"
          href="/browse?sort=recommended"
          itemClassName="w-37.5 sm:w-42.5 lg:w-46.25"
        >
          {recommendations.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </CarouselSection>

        {/* ── Browse by Genre ───────────────────────────────────────────── */}
        <section className="pt-6 pb-4">
          <div className="mb-5 px-4 md:px-8">
            <h2 className="font-display text-lg font-semibold tracking-tight md:text-xl">
              Browse by Genre
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Explore anime by category
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 px-4 sm:grid-cols-3 md:grid-cols-4 md:px-8 lg:grid-cols-5">
            {GENRES.map((genre) => (
              <Link
                key={genre.id}
                href={`/browse?genre=${genre.id}`}
                className="group flex items-center gap-3 rounded-lg border border-border/40 bg-card/50 px-4 py-3 transition-all duration-200 hover:border-primary/40 hover:bg-primary/5 hover:shadow-md hover:shadow-primary/5"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary transition-colors group-hover:bg-primary/20">
                  {genre.name.charAt(0)}
                </span>
                <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                  {genre.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
