/**
 * Adapter functions to convert API response types to the existing frontend types.
 *
 * When the backend API is ready, swap the mock data source and pipe through
 * these mappers. The UI components stay untouched.
 *
 * @see types/api/discover.ts  — API response types
 * @see types/anime.ts         — frontend types used by components
 */

import type {
  ApiContentItem,
  ApiSection,
  DiscoverPageResponse,
  ApiContinueWatchingItem,
} from '@/types/api/discover'
import type { Anime, Genre, Season, ContinueWatchingItem } from '@/types/anime'

/* ---------------------------------------------------------------------------
 * Single item mapper
 * ------------------------------------------------------------------------- */

/** Maps an API content item to the existing Anime type. */
export function mapApiItemToAnime(item: ApiContentItem): Anime {
  const genres: Genre[] = item.metadata.genres.map((name) => ({
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
  }))

  const seasons: Season[] = []
  const seasonCount = item.availability.seasons ?? (item.format === 'movie' ? 0 : 1)
  for (let i = 1; i <= seasonCount; i++) {
    seasons.push({
      number: i,
      title: `Season ${i}`,
      episodeCount:
        i === seasonCount
          ? item.availability.episodes - (seasonCount - 1) * Math.ceil(item.availability.episodes / seasonCount)
          : Math.ceil(item.availability.episodes / seasonCount),
      year: item.year,
    })
  }

  // Content-type classification: only real movies map to /movies — every
  // TV-show flavour (Plex "Series", AniList "TV"/"TV_SHORT", a future
  // "tv-show" type…) is introduced on the public page as a series so Plex
  // TV shows and anime series share the same /series/ rails and paths.
  const isMovie =
    item.format === 'movie' || item.type === 'movie'

  return {
    id: item.id,
    slug: item.slug,
    type: isMovie ? 'movies' : 'series',
    title: item.title,
    japaneseTitle: item.metadata.japaneseTitle ?? '',
    synopsis: item.metadata.synopsis ?? '',
    cover: item.images.poster.url,
    banner: item.images.backdrop.url,
    genres,
    studio: { id: item.metadata.studio.toLowerCase().replace(/\s+/g, '-'), name: item.metadata.studio },
    year: item.year,
    status: item.status as Anime['status'],
    rating: item.metadata.rating,
    ratingCount: item.metadata.ratingCount ?? 0,
    ageRating: item.metadata.ageRating ?? '',
    seasons,
    totalEpisodes: item.availability.episodes,
  }
}

/* ---------------------------------------------------------------------------
 * Section mapper
 * ------------------------------------------------------------------------- */

/** Maps an API section to the shape the DiscoverRail component expects. */
export function mapApiSectionToDiscoverSection(section: ApiSection) {
  return {
    title: section.title,
    href: section.ctaHref ?? '/catalog',
    animes: section.items.map(mapApiItemToAnime),
    subtitle: section.subtitle,
    ctaLabel: section.ctaLabel,
  }
}

/* ---------------------------------------------------------------------------
 * Full page mapper
 * ------------------------------------------------------------------------- */

/** Maps the full API response to the sections array used by DiscoverPage. */
export function mapDiscoverPageResponse(response: DiscoverPageResponse) {
  return response.sections.map(mapApiSectionToDiscoverSection)
}

/* ---------------------------------------------------------------------------
 * Continue watching mapper
 * ------------------------------------------------------------------------- */

/** Maps an API continue-watching item to the frontend ContinueWatchingItem. */
export function mapApiContinueWatching(
  item: ApiContinueWatchingItem,
): ContinueWatchingItem {
  const anime = mapApiItemToAnime(item.content)
  const remaining = Math.round((item.duration * (100 - item.progressPercent)) / 100 / 60)

  return {
    anime,
    episode: {
      id: `${item.content.id}-s${item.seasonNumber}e${item.episodeNumber}`,
      animeId: item.content.id,
      season: item.seasonNumber,
      number: item.episodeNumber,
      title: `Episode ${item.episodeNumber}`,
      thumbnail: item.content.images.poster.url,
      cover: item.content.images.backdrop.url,
      videoUrl: '',
      tracks: [],
      duration: item.duration,
      releaseDate: item.watchedAt,
      progress: item.currentTime,
    },
    progressPercent: item.progressPercent,
    remainingLabel: `${remaining}m left`,
  }
}
