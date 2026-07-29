import type { Anime, Episode } from '@/types/anime'

export interface WatchHistoryItem {
  id: string
  anime: Anime
  episode: Episode
  watchedAt: string
  progressPercent: number
  watchDuration: number // in seconds
}

function getAnimeById(id: string): Anime {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getAnime } = require('@/lib/mock-data')
  return getAnime(id)
}

function getEpisodeById(animeId: string, episodeId: string): Episode {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getEpisode, getEpisodes } = require('@/lib/mock-data')
  return getEpisode(animeId, episodeId) ?? getEpisodes(animeId)[0]
}

export function getWatchHistory(): WatchHistoryItem[] {
  const now = Date.now()
  const hour = 3_600_000
  const day = 86_400_000

  return [
    {
      id: 'wh-1',
      anime: getAnimeById('neon-samurai'),
      episode: getEpisodeById('neon-samurai', 'ns-s1-e1'),
      watchedAt: new Date(now - 2 * hour).toISOString(),
      progressPercent: 100,
      watchDuration: 1440,
    },
    {
      id: 'wh-2',
      anime: getAnimeById('crimson-vow'),
      episode: getEpisodeById('crimson-vow', 'cv-s1-e1'),
      watchedAt: new Date(now - 5 * hour).toISOString(),
      progressPercent: 85,
      watchDuration: 1230,
    },
    {
      id: 'wh-3',
      anime: getAnimeById('moonlit-path'),
      episode: getEpisodeById('moonlit-path', 'mp-s1-e1'),
      watchedAt: new Date(now - 1 * day).toISOString(),
      progressPercent: 100,
      watchDuration: 1440,
    },
    {
      id: 'wh-4',
      anime: getAnimeById('ember-crown'),
      episode: getEpisodeById('ember-crown', 'ec-s1-e1'),
      watchedAt: new Date(now - 1 * day - 3 * hour).toISOString(),
      progressPercent: 60,
      watchDuration: 864,
    },
    {
      id: 'wh-5',
      anime: getAnimeById('starfall-academy'),
      episode: getEpisodeById('starfall-academy', 'sa-s1-e1'),
      watchedAt: new Date(now - 2 * day).toISOString(),
      progressPercent: 100,
      watchDuration: 1440,
    },
    {
      id: 'wh-6',
      anime: getAnimeById('spirit-veil'),
      episode: getEpisodeById('spirit-veil', 'sv-s1-e1'),
      watchedAt: new Date(now - 2 * day - 6 * hour).toISOString(),
      progressPercent: 100,
      watchDuration: 1440,
    },
    {
      id: 'wh-7',
      anime: getAnimeById('after-school-skies'),
      episode: getEpisodeById('after-school-skies', 'ask-s1-e1'),
      watchedAt: new Date(now - 3 * day).toISOString(),
      progressPercent: 45,
      watchDuration: 648,
    },
    {
      id: 'wh-8',
      anime: getAnimeById('neon-orbit'),
      episode: getEpisodeById('neon-orbit', 'no-s1-e1'),
      watchedAt: new Date(now - 4 * day).toISOString(),
      progressPercent: 100,
      watchDuration: 1440,
    },
    {
      id: 'wh-9',
      anime: getAnimeById('void-protocol'),
      episode: getEpisodeById('void-protocol', 'vp-s1-e1'),
      watchedAt: new Date(now - 5 * day).toISOString(),
      progressPercent: 30,
      watchDuration: 432,
    },
    {
      id: 'wh-10',
      anime: getAnimeById('phantom-blade'),
      episode: getEpisodeById('phantom-blade', 'pb-s1-e1'),
      watchedAt: new Date(now - 6 * day).toISOString(),
      progressPercent: 100,
      watchDuration: 1440,
    },
  ]
}
