import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  Bookmark,
  Calendar,
  ChevronRight,
  Clock,
  Heart,
  Play,
  Share2,
  Star,
  ThumbsUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GenreTag } from '@/components/kami/genre-tag'
import { RatingBadge } from '@/components/kami/rating-badge'
import { AnimeCard } from '@/components/kami/anime-card'
import {
  getAnime,
  getAllAnime,
  getEpisodes,
  getReviews,
  formatDuration,
} from '@/lib/mock-data'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const anime = getAnime(slug)
  if (!anime) return { title: 'Anime Not Found — Kami-Sama' }
  return {
    title: `${anime.title} — Kami-Sama`,
    description: anime.synopsis,
  }
}

export default async function AnimeDetailPage({ params }: Props) {
  const { slug } = await params
  const anime = getAnime(slug)
  if (!anime) notFound()

  const episodes = getEpisodes(anime.id)
  const reviews = getReviews(anime.id)

  // Group episodes by season
  const episodesBySeason = new Map<number, typeof episodes>()
  for (const ep of episodes) {
    const list = episodesBySeason.get(ep.season) ?? []
    list.push(ep)
    episodesBySeason.set(ep.season, list)
  }

  // Related: same studio or shared genres (exclude self)
  const allAnime = getAllAnime()
  const related = allAnime
    .filter((a) => a.id !== anime.id)
    .map((a) => {
      let score = 0
      if (a.studio.id === anime.studio.id) score += 3
      score += a.genres.filter((g) => anime.genres.some((mg) => mg.id === g.id)).length
      return { anime: a, score }
    })
    .filter((a) => a.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)

  const firstEpisode = episodes[0]

  return (
    <div className="min-h-screen">
      {/* Hero banner */}
      <div className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
        <Image
          src={anime.banner || '/placeholder.svg'}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
      </div>

      {/* Content overlapping the banner */}
      <div className="relative z-10 -mt-32 mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:gap-8">
          {/* Cover image */}
          <div className="shrink-0">
            <div className="relative mx-auto w-48 overflow-hidden rounded-xl border border-border/60 shadow-2xl shadow-black/40 md:mx-0 md:w-56">
              <div className="aspect-[2/3]">
                <Image
                  src={anime.cover || '/placeholder.svg'}
                  alt={anime.title}
                  fill
                  sizes="224px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex min-w-0 flex-1 flex-col pt-2 md:pt-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className={
                  anime.status === 'airing'
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : anime.status === 'completed'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      : anime.status === 'upcoming'
                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                        : ''
                }
              >
                {anime.status === 'airing' && (
                  <span className="mr-1 inline-block size-1.5 rounded-full bg-primary animate-pulse" />
                )}
                {anime.status.charAt(0).toUpperCase() + anime.status.slice(1)}
              </Badge>
              <Badge variant="secondary">{anime.ageRating}</Badge>
            </div>

            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              {anime.title}
            </h1>
            <p className="mt-1 text-base text-muted-foreground md:text-lg">
              {anime.japaneseTitle}
            </p>

            {/* Meta row */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <RatingBadge rating={anime.rating} />
              <span className="text-sm text-muted-foreground">
                {anime.ratingCount.toLocaleString()} ratings
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">{anime.year}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">
                {anime.totalEpisodes} episodes
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">
                {anime.studio.name}
              </span>
            </div>

            {/* Genres */}
            <div className="mt-4 flex flex-wrap gap-2">
              {anime.genres.map((genre) => (
                <GenreTag key={genre.id} genre={genre} />
              ))}
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {firstEpisode && (
                <Button asChild size="lg" className="gap-2 px-6">
                  <Link href={`/watch/${anime.slug}?ep=${firstEpisode.id}`}>
                    <Play className="size-4 fill-current" />
                    Watch Now
                  </Link>
                </Button>
              )}
              <Button variant="secondary" size="lg" className="gap-2 px-5">
                <Bookmark className="size-4" />
                Add to List
              </Button>
              <Button variant="ghost" size="icon" className="size-10">
                <Heart className="size-5" />
              </Button>
              <Button variant="ghost" size="icon" className="size-10">
                <Share2 className="size-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Synopsis */}
        <div className="mt-10 max-w-3xl">
          <h2 className="font-display text-lg font-semibold">Synopsis</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {anime.synopsis}
          </p>
        </div>

        {/* Tabs: Episodes / Reviews / Related */}
        <Tabs defaultValue="episodes" className="mt-10">
          <TabsList>
            <TabsTrigger value="episodes">
              Episodes ({anime.totalEpisodes})
            </TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews ({reviews.length})
            </TabsTrigger>
            <TabsTrigger value="related">Related</TabsTrigger>
          </TabsList>

          {/* Episodes */}
          <TabsContent value="episodes" className="mt-6">
            <div className="space-y-8">
              {anime.seasons.map((season) => {
                const seasonEps = episodesBySeason.get(season.number) ?? []
                return (
                  <section key={season.number}>
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-base font-semibold">
                          {season.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {season.episodeCount} episodes · {season.year}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {seasonEps.length} / {season.episodeCount}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {seasonEps.map((ep) => (
                        <Link
                          key={ep.id}
                          href={`/watch/${anime.slug}?ep=${ep.id}`}
                          className="group flex gap-3 rounded-xl border border-border/60 bg-card p-2 transition-colors hover:bg-accent"
                        >
                          <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg">
                            <Image
                              src={ep.thumbnail || anime.cover || '/placeholder.svg'}
                              alt={ep.title}
                              fill
                              sizes="112px"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-background/30 opacity-0 transition-opacity group-hover:opacity-100">
                              <Play className="size-5 fill-white text-white" />
                            </div>
                            <span className="absolute bottom-1 right-1 rounded bg-background/80 px-1 py-0.5 text-[10px] backdrop-blur">
                              {formatDuration(ep.duration)}
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col justify-center">
                            <span className="text-xs font-medium text-primary">
                              Episode {ep.number}
                            </span>
                            <h4 className="mt-0.5 line-clamp-1 text-sm font-semibold">
                              {ep.title}
                            </h4>
                            {ep.description && (
                              <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                                {ep.description}
                              </p>
                            )}
                          </div>
                          <div className="flex shrink-0 items-center">
                            <span className="text-xs text-muted-foreground">
                              {ep.releaseDate}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>
          </TabsContent>

          {/* Reviews */}
          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-xl border border-border/60 bg-card p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
                        {review.user.displayName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          {review.user.displayName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{review.user.username} · {review.createdAt}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 rounded-lg bg-gold/10 px-2 py-1">
                      <Star className="size-3.5 fill-gold text-gold" />
                      <span className="text-sm font-semibold text-gold">
                        {review.rating}
                      </span>
                    </div>
                  </div>
                  <h4 className="mt-3 text-sm font-semibold">{review.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {review.body}
                  </p>
                  <div className="mt-3 flex items-center gap-4">
                    <button
                      type="button"
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <ThumbsUp className="size-3.5" />
                      {review.likes}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Related */}
          <TabsContent value="related" className="mt-6">
            {related.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {related.map(({ anime: rel }) => (
                  <AnimeCard key={rel.id} anime={rel} />
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No related titles found.
              </p>
            )}
          </TabsContent>
        </Tabs>

        {/* Bottom spacer */}
        <div className="h-16" />
      </div>
    </div>
  )
}
