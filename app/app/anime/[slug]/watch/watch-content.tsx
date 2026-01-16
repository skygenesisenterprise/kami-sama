"use client"

import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useMemo } from "react"
import { ArrowLeft, ChevronLeft, ChevronRight, ListVideo, MessageSquare } from "lucide-react"
import { Header } from "@/components/layout/header"
import { VideoPlayer } from "@/components/player/video-player"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { animes, getAnimeEpisodes } from "@/lib/data"
import { cn } from "@/lib/utils"

interface WatchPageContentProps {
  slug: string
}

export function WatchPageContent({ slug }: WatchPageContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const episodeNum = Number.parseInt(searchParams.get("ep") || "1")

  const anime = animes.find((a) => a.slug === slug)
  const seasons = anime ? getAnimeEpisodes(anime.id) : []

  const allEpisodes = useMemo(() => {
    return seasons.flatMap((season) => season.episodes)
  }, [seasons])

  const currentEpisode = allEpisodes.find((ep) => ep.number === episodeNum) || allEpisodes[0]
  const currentEpisodeIndex = allEpisodes.findIndex((ep) => ep.number === episodeNum)

  const hasPrevious = currentEpisodeIndex > 0
  const hasNext = currentEpisodeIndex < allEpisodes.length - 1

  const goToEpisode = (num: number) => {
    router.push(`/anime/${slug}/watch?ep=${num}`)
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Anime non trouvé</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          {/* Back button */}
          <Link
            href={`/anime/${slug}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à {anime.title}
          </Link>

          <div className="flex flex-col xl:flex-row gap-6">
            {/* Main content */}
            <div className="flex-1 space-y-4">
              {/* Video Player */}
              <VideoPlayer
                poster={currentEpisode?.thumbnail}
                title={`${anime.title} - Épisode ${currentEpisode?.number}`}
                hasPrevious={hasPrevious}
                hasNext={hasNext}
                onPrevious={() => hasPrevious && goToEpisode(allEpisodes[currentEpisodeIndex - 1].number)}
                onNext={() => hasNext && goToEpisode(allEpisodes[currentEpisodeIndex + 1].number)}
              />

              {/* Episode info & navigation */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-card rounded-xl">
                <div>
                  <h1 className="text-xl font-bold">
                    Épisode {currentEpisode?.number}: {currentEpisode?.title}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">{anime.title}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasPrevious}
                    onClick={() => hasPrevious && goToEpisode(allEpisodes[currentEpisodeIndex - 1].number)}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasNext}
                    onClick={() => hasNext && goToEpisode(allEpisodes[currentEpisodeIndex + 1].number)}
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>

              {/* Episode synopsis */}
              {currentEpisode?.synopsis && (
                <div className="p-4 bg-card rounded-xl">
                  <h2 className="font-semibold mb-2">Synopsis</h2>
                  <p className="text-sm text-muted-foreground">{currentEpisode.synopsis}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="xl:w-80 shrink-0">
              <div className="sticky top-20 bg-card rounded-xl overflow-hidden">
                <Tabs defaultValue="episodes" className="w-full">
                  <TabsList className="w-full bg-secondary rounded-none">
                    <TabsTrigger value="episodes" className="flex-1 gap-2">
                      <ListVideo className="h-4 w-4" />
                      Épisodes
                    </TabsTrigger>
                    <TabsTrigger value="comments" className="flex-1 gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Commentaires
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="episodes" className="m-0">
                    <ScrollArea className="h-[calc(100vh-200px)]">
                      <div className="p-2 space-y-1">
                        {allEpisodes.map((episode) => (
                          <button
                            key={episode.id}
                            onClick={() => goToEpisode(episode.number)}
                            className={cn(
                              "w-full flex gap-3 p-2 rounded-lg text-left transition-colors",
                              episode.number === currentEpisode?.number
                                ? "bg-primary/10 border border-primary/20"
                                : "hover:bg-secondary",
                            )}
                          >
                            <div className="relative w-24 aspect-video rounded-md overflow-hidden shrink-0 bg-muted">
                              <Image
                                src={episode.thumbnail || "/placeholder.svg"}
                                alt={episode.title}
                                fill
                                className="object-cover"
                              />
                              {episode.number === currentEpisode?.number && (
                                <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                                  <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                                    <span className="text-xs font-bold text-primary-foreground">▶</span>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={cn(
                                  "text-xs font-medium",
                                  episode.number === currentEpisode?.number ? "text-primary" : "text-muted-foreground",
                                )}
                              >
                                EP {episode.number}
                              </p>
                              <p className="text-sm font-medium line-clamp-2">{episode.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{episode.duration}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="comments" className="m-0 p-4">
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">Connectez-vous pour voir et poster des commentaires</p>
                      <Link href="/login">
                        <Button variant="outline" size="sm" className="mt-4 bg-transparent">
                          Se connecter
                        </Button>
                      </Link>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}
