import { TrendingUp } from 'lucide-react'
import { HeroBanner } from '@/components/kami/hero-banner'
import { CarouselSection } from '@/components/kami/carousel-section'
import { AnimeCard } from '@/components/kami/anime-card'
import { ContinueWatchingCard } from '@/components/kami/continue-watching-card'
import { CommunityCard } from '@/components/kami/community-card'
import { RecommendationCard } from '@/components/kami/recommendation-card'
import { Badge } from '@/components/ui/badge'
import {
  getAnime,
  getCommunityPicks,
  getContinueWatching,
  getRecentlyAdded,
  getRecommendations,
  getTrending,
} from '@/lib/mock-data'

export default function HomePage() {
  const featured = ['crimson-blade', 'eternal-frost', 'neon-orbit'].map((id) => getAnime(id)!)
  const continueWatching = getContinueWatching()
  const trending = getTrending()
  const recentlyAdded = getRecentlyAdded()
  const communityPicks = getCommunityPicks()
  const recommendations = getRecommendations()

  return (
    <div className="pb-8">
      <HeroBanner items={featured} />

      <div className="relative z-10 -mt-8 md:-mt-12">
        {/* Continue Watching */}
        <CarouselSection
          title="Continue Watching"
          subtitle="Pick up where you left off"
          href="/library"
          itemClassName="w-[260px] sm:w-[290px]"
        >
          {continueWatching.map((item) => (
            <ContinueWatchingCard key={item.anime.id} item={item} />
          ))}
        </CarouselSection>

        {/* Trending */}
        <CarouselSection title="Trending Now" subtitle="What everyone is watching this week" href="/discover">
          {trending.map((item) => (
            <AnimeCard
              key={item.anime.id}
              anime={item.anime}
              badge={
                <span className="flex size-7 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground shadow">
                  {item.rank}
                </span>
              }
            />
          ))}
        </CarouselSection>

        {/* Recently Added */}
        <CarouselSection title="Recently Added" subtitle="Fresh episodes just dropped" href="/browse">
          {recentlyAdded.map((item) => (
            <AnimeCard
              key={item.anime.id}
              anime={item.anime}
              badge={
                <Badge className="bg-primary text-primary-foreground">
                  EP {item.episode.number}
                </Badge>
              }
            />
          ))}
        </CarouselSection>

        {/* Community Picks */}
        <section className="py-6">
          <div className="mb-4 flex items-center justify-between px-4 md:px-8">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="size-5 text-primary" />
                <h2 className="font-display text-lg font-semibold tracking-tight md:text-xl">
                  Most Requested by the Community
                </h2>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Titles our members are voting to bring to Kami-Sama
              </p>
            </div>
          </div>
          <div className="grid gap-3 px-4 md:grid-cols-2 md:px-8 lg:grid-cols-3">
            {communityPicks.slice(0, 6).map((pick, i) => (
              <CommunityCard key={pick.anime.id} pick={pick} rank={i + 1} />
            ))}
          </div>
        </section>

        {/* Recommended */}
        <section className="py-6">
          <div className="mb-4 px-4 md:px-8">
            <h2 className="font-display text-lg font-semibold tracking-tight md:text-xl">
              Recommended For You
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Personalized picks based on your watch history
            </p>
          </div>
          <div className="grid gap-4 px-4 md:grid-cols-2 md:px-8 lg:grid-cols-4">
            {recommendations.map((rec) => (
              <RecommendationCard key={rec.anime.id} rec={rec} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
