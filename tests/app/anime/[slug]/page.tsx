import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Play, Plus, Star, Calendar, Film, Building2, Share2 } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { EpisodeList } from "@/components/anime/episode-list"
import { AnimeCarousel } from "@/components/anime/anime-carousel"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { animes, getAnimeEpisodes } from "@/lib/data"

interface AnimePageProps {
  params: Promise<{ slug: string }>
}

export default async function AnimePage({ params }: AnimePageProps) {
  const { slug } = await params
  const anime = animes.find((a) => a.slug === slug)

  if (!anime) {
    notFound()
  }

  const seasons = getAnimeEpisodes(anime.id)
  const relatedAnimes = animes
    .filter((a) => a.id !== anime.id && a.genres.some((g) => anime.genres.includes(g)))
    .slice(0, 6)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Banner */}
      <section className="relative h-[60vh] min-h-[400px]">
        <Image src={anime.bannerImage || anime.coverImage} alt={anime.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </section>

      {/* Content */}
      <main className="-mt-48 relative z-10 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Poster */}
            <div className="shrink-0">
              <div className="relative w-48 sm:w-56 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl mx-auto lg:mx-0">
                <Image src={anime.coverImage || "/placeholder.svg"} alt={anime.title} fill className="object-cover" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center lg:text-left">
              {/* Tags */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-4">
                <Badge className="bg-primary text-primary-foreground">{anime.type}</Badge>
                {anime.status === "En cours" && (
                  <Badge variant="outline" className="border-green-500 text-green-500">
                    En cours
                  </Badge>
                )}
                {anime.status === "Terminé" && (
                  <Badge variant="outline" className="border-muted-foreground text-muted-foreground">
                    Terminé
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 text-balance">{anime.title}</h1>
              {anime.titleJapanese && <p className="text-lg text-muted-foreground mb-6">{anime.titleJapanese}</p>}

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mb-6 text-sm">
                <span className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-lg">{anime.rating}</span>
                  <span className="text-muted-foreground">/ 10</span>
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {anime.year}
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Film className="h-4 w-4" />
                  {anime.episodeCount ? `${anime.episodeCount} épisodes` : "N/A"}
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  {anime.studio}
                </span>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-8">
                {anime.genres.map((genre) => (
                  <Link key={genre} href={`/catalogue?genre=${genre.toLowerCase()}`}>
                    <Badge variant="secondary" className="hover:bg-secondary/80 cursor-pointer">
                      {genre}
                    </Badge>
                  </Link>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-8">
                <Link href={`/anime/${anime.slug}/watch`}>
                  <Button size="lg" className="gap-2">
                    <Play className="h-5 w-5" fill="currentColor" />
                    Regarder
                  </Button>
                </Link>
                <Button size="lg" variant="secondary" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Ma liste
                </Button>
                <Button size="lg" variant="ghost" className="gap-2">
                  <Share2 className="h-5 w-5" />
                  Partager
                </Button>
              </div>

              {/* Synopsis */}
              <div className="max-w-3xl">
                <h2 className="text-lg font-semibold mb-3">Synopsis</h2>
                <p className="text-muted-foreground leading-relaxed text-pretty">{anime.synopsis}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-12">
            <Tabs defaultValue="episodes" className="w-full">
              <TabsList className="bg-secondary">
                <TabsTrigger value="episodes">Épisodes</TabsTrigger>
                <TabsTrigger value="related">Similaires</TabsTrigger>
              </TabsList>

              <TabsContent value="episodes" className="mt-6">
                <EpisodeList seasons={seasons} animeSlug={anime.slug} />
              </TabsContent>

              <TabsContent value="related" className="mt-6">
                {relatedAnimes.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {relatedAnimes.map((relatedAnime) => (
                      <Link key={relatedAnime.id} href={`/anime/${relatedAnime.slug}`} className="group">
                        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-secondary">
                          <Image
                            src={relatedAnime.coverImage || "/placeholder.svg"}
                            alt={relatedAnime.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <h3 className="mt-2 text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                          {relatedAnime.title}
                        </h3>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">Aucun anime similaire trouvé.</p>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* More content */}
          <div className="mt-16">
            <AnimeCarousel title="Vous pourriez aussi aimer" animes={relatedAnimes} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export function generateStaticParams() {
  return animes.map((anime) => ({
    slug: anime.slug,
  }))
}
