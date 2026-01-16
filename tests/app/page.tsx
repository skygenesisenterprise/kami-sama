import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/home/hero-section"
import { AnimeCarousel } from "@/components/anime/anime-carousel"
import { animes, trendingAnimes, newReleases, popularAnimes } from "@/lib/data"

export default function HomePage() {
  const heroAnimes = animes.slice(0, 5)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <HeroSection animes={heroAnimes} />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-16">
          <AnimeCarousel title="Tendances" animes={trendingAnimes} />
          <AnimeCarousel title="Nouveautés" animes={newReleases} />
          <AnimeCarousel title="Les mieux notés" animes={popularAnimes} />
          <AnimeCarousel title="Tous les animes" animes={animes} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
