import type { LucideIcon } from 'lucide-react'
import {
  Calendar,
  Flame,
  Heart,
  Play,
  Plus,
  Search,
  Sparkles,
  Star,
  Sun,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import { HeroBanner } from '@/components/kami/hero-banner'
import { AnimeCard } from '@/components/kami/anime-card'
import { ContinueWatchingCard } from '@/components/kami/continue-watching-card'
import { SimulcastCard } from '@/components/kami/simulcast-card'
import { SeasonalPickCard } from '@/components/kami/seasonal-pick-card'
import { RecommendationCard } from '@/components/kami/recommendation-card'
import { SearchBar } from '@/components/kami/search-bar'
import { Button } from '@/components/ui/button'
import {
  GENRES,
  getAllAnime,
  getAnime,
  getContinueWatching,
  getEditorialPicks,
  getLatestAdditions,
  getRecommendations,
  getRecentlyAdded,
  getSeasonalPicks,
  getSimulcasts,
  getTrending,
} from '@/lib/mock-data'

/* ── Section metadata ─────────────────────────────────────────────────── */

interface SectionMeta {
  id: string
  title: string
  subtitle: string
  icon: LucideIcon
  iconClass?: string
}

const SECTIONS: SectionMeta[] = [
  {
    id: 'derniers-episodes',
    title: 'Derniers épisodes',
    subtitle: 'Les épisodes les plus récemment ajoutés',
    icon: Flame,
  },
  {
    id: 'reprendre',
    title: 'Reprendre',
    subtitle: 'Reprenez là où vous vous êtes arrêtés',
    icon: Play,
    iconClass: 'fill-current',
  },
  {
    id: 'aujourd-hui',
    title: 'Aujourd\'hui',
    subtitle: 'Ce qui diffuse aujourd\'hui',
    icon: Calendar,
  },
  {
    id: 'top-semaine',
    title: 'Top de la semaine',
    subtitle: 'Les plus populaires cette semaine',
    icon: TrendingUp,
  },
  {
    id: 'plus-aimes',
    title: 'Les plus aimés',
    subtitle: 'Les mieux notés par la communauté',
    icon: Heart,
    iconClass: 'fill-current',
  },
  {
    id: 'derniers-ajouts',
    title: 'Derniers ajouts',
    subtitle: 'Nouvelles séries récentes sur la plateforme',
    icon: Plus,
  },
  {
    id: 'selection-moment',
    title: 'Sélection du moment',
    subtitle: 'Choix éditoriaux de l\'équipe Kami-Sama',
    icon: Star,
  },
  {
    id: 'pour-vous',
    title: 'Pour vous',
    subtitle: 'Recommandations personnalisées',
    icon: Sparkles,
  },
  {
    id: 'cette-saison',
    title: 'Cette saison',
    subtitle: 'Les sorties de l\'été 2025',
    icon: Sun,
  },
  {
    id: 'recherche-rapide',
    title: 'Recherche rapide',
    subtitle: 'Trouvez votre prochain anime',
    icon: Search,
  },
]

/* ── Shared UI primitives ─────────────────────────────────────────────── */

function SectionHeader({
  icon: Icon,
  iconClass,
  title,
  subtitle,
  action,
}: {
  icon: LucideIcon
  iconClass?: string
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-4 px-4 lg:px-16">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-primary">
              <Icon className={`h-6 w-6 ${iconClass ?? ''}`} />
            </span>
            <h2 className="font-display text-lg font-semibold text-foreground md:text-xl">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="mt-0.5 pl-8 text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
      <div className="mt-2 h-1 w-24 rounded-full bg-primary/30" />
    </div>
  )
}

function HorizontalRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="scrollbar-hide flex gap-3 overflow-x-auto px-4 pb-2 md:gap-4 md:px-8 lg:px-17.5">
      {children}
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function HomePage() {
  const featured = ['neon-samurai', 'crimson-vow', 'moonlit-path'].map((id) => getAnime(id)!)
  const recentlyAdded = getRecentlyAdded()
  const continueWatching = getContinueWatching()
  const simulcasts = getSimulcasts()
  const trending = getTrending()
  const mostLiked = getAllAnime()
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10)
  const latestAdditions = getLatestAdditions()
  const editorialPicks = getEditorialPicks()
  const recommendations = getRecommendations()
  const seasonalPicks = getSeasonalPicks()

  const s = (id: string) => SECTIONS.find((sec) => sec.id === id)!

  return (
    <div className="pb-12">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <HeroBanner items={featured} />

      {/* ── Derniers épisodes ────────────────────────────────────────── */}
      <section id={s('derniers-episodes').id} className="py-6">
        <SectionHeader
          icon={s('derniers-episodes').icon}
          title={s('derniers-episodes').title}
          subtitle={s('derniers-episodes').subtitle}
        />
        <HorizontalRow>
          {recentlyAdded.map((item) => (
            <AnimeCard
              key={item.anime.id}
              anime={item.anime}
              badge={
                <span className="flex items-center gap-1 rounded-md bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground shadow">
                  EP {item.episode.number}
                </span>
              }
              className="w-37.5 shrink-0 sm:w-42.5 lg:w-46.25"
            />
          ))}
        </HorizontalRow>
      </section>

      {/* ── Reprendre ─────────────────────────────────────────────────── */}
      <section id={s('reprendre').id} className="py-6">
        <SectionHeader
          icon={s('reprendre').icon}
          iconClass={s('reprendre').iconClass}
          title={s('reprendre').title}
          subtitle={s('reprendre').subtitle}
        />
        <HorizontalRow>
          {continueWatching.map((item) => (
            <ContinueWatchingCard key={item.anime.id} item={item} />
          ))}
        </HorizontalRow>
      </section>

      {/* ── Aujourd'hui ──────────────────────────────────────────────── */}
      <section id={s('aujourd-hui').id} className="py-6">
        <SectionHeader
          icon={s('aujourd-hui').icon}
          title={s('aujourd-hui').title}
          subtitle={s('aujourd-hui').subtitle}
        />
        <HorizontalRow>
          {simulcasts.map((item) => (
            <SimulcastCard key={item.anime.id} item={item} />
          ))}
        </HorizontalRow>
      </section>

      {/* ── Top de la semaine ─────────────────────────────────────────── */}
      <section id={s('top-semaine').id} className="py-6">
        <SectionHeader
          icon={s('top-semaine').icon}
          title={s('top-semaine').title}
          subtitle={s('top-semaine').subtitle}
        />
        <HorizontalRow>
          {trending.map((item, i) => (
            <Link
              key={item.anime.id}
              href={`/anime/${item.anime.slug}`}
              className="group relative w-30 shrink-0 sm:w-35 md:w-40"
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
        </HorizontalRow>
      </section>

      {/* ── Les plus aimés ────────────────────────────────────────────── */}
      <section id={s('plus-aimes').id} className="py-6">
        <SectionHeader
          icon={s('plus-aimes').icon}
          iconClass={s('plus-aimes').iconClass}
          title={s('plus-aimes').title}
          subtitle={s('plus-aimes').subtitle}
        />
        <HorizontalRow>
          {mostLiked.map((anime) => (
            <AnimeCard
              key={anime.id}
              anime={anime}
              className="w-37.5 shrink-0 sm:w-42.5 lg:w-46.25"
            />
          ))}
        </HorizontalRow>
      </section>

      {/* ── Derniers ajouts ───────────────────────────────────────────── */}
      <section id={s('derniers-ajouts').id} className="py-6">
        <SectionHeader
          icon={s('derniers-ajouts').icon}
          title={s('derniers-ajouts').title}
          subtitle={s('derniers-ajouts').subtitle}
        />
        <HorizontalRow>
          {latestAdditions.map((anime) => (
            <AnimeCard
              key={anime.id}
              anime={anime}
              className="w-37.5 shrink-0 sm:w-42.5 lg:w-46.25"
            />
          ))}
        </HorizontalRow>
      </section>

      {/* ── Sélection du moment ──────────────────────────────────────── */}
      <section id={s('selection-moment').id} className="py-6">
        <SectionHeader
          icon={s('selection-moment').icon}
          title={s('selection-moment').title}
          subtitle={s('selection-moment').subtitle}
        />
        <HorizontalRow>
          {editorialPicks.map((anime) => (
            <AnimeCard
              key={anime.id}
              anime={anime}
              className="w-37.5 shrink-0 sm:w-42.5 lg:w-46.25"
            />
          ))}
        </HorizontalRow>
      </section>

      {/* ── Pour vous ─────────────────────────────────────────────────── */}
      <section id={s('pour-vous').id} className="py-6">
        <SectionHeader
          icon={s('pour-vous').icon}
          title={s('pour-vous').title}
          subtitle={s('pour-vous').subtitle}
        />
        <div className="grid gap-4 px-4 sm:grid-cols-2 md:px-8 lg:grid-cols-4">
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.anime.id} rec={rec} />
          ))}
        </div>
      </section>

      {/* ── Cette saison ──────────────────────────────────────────────── */}
      <section id={s('cette-saison').id} className="py-6">
        <SectionHeader
          icon={s('cette-saison').icon}
          title={s('cette-saison').title}
          subtitle={s('cette-saison').subtitle}
        />
        <HorizontalRow>
          {seasonalPicks.map((pick) => (
            <SeasonalPickCard key={pick.anime.id} pick={pick} />
          ))}
        </HorizontalRow>
      </section>

      {/* ── Recherche rapide ──────────────────────────────────────────── */}
      <section id={s('recherche-rapide').id} className="py-6">
        <SectionHeader
          icon={s('recherche-rapide').icon}
          title={s('recherche-rapide').title}
          subtitle={s('recherche-rapide').subtitle}
        />
        <div className="px-4 lg:px-16">
          <SearchBar placeholder="Rechercher un animé, un studio, un genre…" />
          <div className="mt-4 flex flex-wrap gap-2">
            {GENRES.map((genre) => (
              <Link
                key={genre.id}
                href={`/browse?genre=${genre.id}`}
                className="shrink-0 rounded-full border border-border/60 bg-secondary/50 px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-foreground"
              >
                {genre.name}
              </Link>
            ))}
          </div>
          <Button asChild variant="ghost" className="mt-4 gap-2 text-muted-foreground">
            <Link href="/browse">
              Parcourir tout le catalogue
              <span className="text-lg leading-none">&rarr;</span>
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
