import type { AniListSearchItem } from '@/lib/api/anilist'
import type { PlexLibraryItem } from '@/lib/api/plex'
import type { SourceResultItem } from '@/components/dash/source-result-card'

/** Maps a Plex library item into the generic source-result shape. */
export function plexItemToSourceItem(item: PlexLibraryItem): SourceResultItem {
  return {
    id: item.sourceId ?? item.id ?? item.ratingKey ?? '',
    title: item.name ?? item.title ?? 'Untitled',
    subtitle: item.originalTitle,
    type: item.type,
    year: item.year,
    durationSeconds: item.duration,
    rating: item.rating,
    genres: item.genres,
    overview: item.overview,
    imageUrl: item.imageUrl,
    artUrl: item.artUrl,
  }
}

/** Maps an AniList media search hit into the generic source-result shape. */
export function anilistItemToSourceItem(item: AniListSearchItem): SourceResultItem {
  const extraMeta: string[] = []
  if (typeof item.episodes === 'number' && item.episodes > 0) {
    extraMeta.push(`${item.episodes} eps`)
  }
  if (item.status) {
    extraMeta.push(item.status)
  }
  return {
    id: String(item.anilistId),
    title: item.title,
    subtitle:
      item.japaneseTitle && item.japaneseTitle !== item.title
        ? item.japaneseTitle
        : undefined,
    type: item.format || undefined,
    rating: typeof item.averageScore === 'number' ? item.averageScore : undefined,
    genres: item.genres ?? [],
    imageUrl: item.coverImage || undefined,
    artUrl: item.bannerImage || undefined,
    extraMeta,
  }
}
