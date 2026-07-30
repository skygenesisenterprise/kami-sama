export type ProviderStatus = 'connected' | 'disconnected' | 'error' | 'syncing'

export type JobStatus = 'completed' | 'running' | 'failed' | 'queued' | 'cancelled'
export type JobType = 'anime-sync' | 'manga-sync' | 'character-fetch' | 'review-fetch' | 'seasonal-sync' | 'cleanup'

export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

export type MediaType = 'anime' | 'manga'

export type AnimeStatus = 'airing' | 'complete' | 'upcoming' | 'hiatus'
export type AnimeType = 'tv' | 'movie' | 'ova' | 'ona' | 'special'
export type MangaType = 'manga' | 'light_novel' | 'one_shot' | 'doujin' | 'manhwa' | 'manhua'

export interface ProviderInfo {
  id: string
  name: string
  slug: string
  type: 'mal'
  status: ProviderStatus
  version: string
  apiUrl: string
  lastSyncAt: string | null
  mediaCount: number
  apiKeyValid: boolean
}

export interface ProviderStats {
  totalAnime: number
  totalManga: number
  airingAnime: number
  completeAnime: number
  upcomingAnime: number
  cachedEntries: number
  cacheSize: string
  cacheTotalSize: string
  apiCallsToday: number
  apiCallsLimit: number
  lastSyncDuration: string
  syncErrors: number
  bandwidthSaved: string
  averageResponseMs: number
}

export interface MediaCategory {
  id: string
  type: MediaType
  label: string
  count: number
  syncedCount: number
  lastSyncedAt: string | null
  enabled: boolean
  autoSync: boolean
  season?: string
}

export interface SyncJob {
  id: string
  type: JobType
  status: JobStatus
  category: string | null
  startedAt: string
  completedAt: string | null
  progress: number
  itemsProcessed: number
  itemsTotal: number
  errors: number
  duration: string | null
  triggeredBy: 'manual' | 'scheduled' | 'webhook'
}

export interface MediaMapping {
  id: string
  kamiId: string
  kamiTitle: string
  malId: string
  mediaType: MediaType
  malType: AnimeType | MangaType
  status: AnimeStatus
  externalIds: {
    tmdb?: string
    anilist?: string
    kitsu?: string
    anidb?: string
  }
  lastSyncedAt: string
  matchScore: number
  episodes: number | null
  score: number
}

export interface ProviderCapability {
  id: string
  name: string
  description: string
  supported: boolean
  enabled: boolean
  version?: string
}

export interface ProviderLog {
  id: string
  timestamp: string
  level: LogLevel
  message: string
  source: string
  details?: string
}

export interface ProviderSettings {
  apiKey: string
  apiUrl: string
  timeout: number
  cacheEnabled: boolean
  cacheTtlHours: number
  maxCacheSizeMb: number
  autoSync: boolean
  syncInterval: number
  rateLimitPerSecond: number
  retryOnFail: boolean
  maxRetries: number
  notificationsEnabled: boolean
  webhookEnabled: boolean
  webhookUrl: string
  includeNsfw: boolean
  includeManga: boolean
  seasonalSync: boolean
  fetchCharacters: boolean
  fetchReviews: boolean
  fetchRecommendations: boolean
}

export interface MalProviderData {
  provider: ProviderInfo
  stats: ProviderStats
  categories: MediaCategory[]
  jobs: SyncJob[]
  mappings: MediaMapping[]
  capabilities: ProviderCapability[]
  logs: ProviderLog[]
  settings: ProviderSettings
}

export const malProviderData: MalProviderData = {
  provider: {
    id: 'mal-001',
    name: 'MyAnimeList',
    slug: 'myanimelist',
    type: 'mal',
    status: 'connected',
    version: 'API v2',
    apiUrl: 'https://api.myanimelist.net/v2',
    lastSyncAt: '2026-07-26T09:15:00Z',
    mediaCount: 12847,
    apiKeyValid: true,
  },
  stats: {
    totalAnime: 9234,
    totalManga: 3613,
    airingAnime: 412,
    completeAnime: 7891,
    upcomingAnime: 931,
    cachedEntries: 12400,
    cacheSize: '2.1 GB',
    cacheTotalSize: '4 GB',
    apiCallsToday: 1523,
    apiCallsLimit: 60000,
    lastSyncDuration: '4m 12s',
    syncErrors: 0,
    bandwidthSaved: '31.2 GB',
    averageResponseMs: 67,
  },
  categories: [
    { id: 'cat-1', type: 'anime', label: 'Anime', count: 9234, syncedCount: 9200, lastSyncedAt: '2026-07-26T09:15:00Z', enabled: true, autoSync: true },
    { id: 'cat-2', type: 'manga', label: 'Manga', count: 3613, syncedCount: 3600, lastSyncedAt: '2026-07-26T09:15:00Z', enabled: true, autoSync: true },
  ],
  jobs: [
    {
      id: 'job-1', type: 'anime-sync', status: 'completed', category: 'All Anime',
      startedAt: '2026-07-26T09:15:00Z', completedAt: '2026-07-26T09:19:12Z', progress: 100,
      itemsProcessed: 9234, itemsTotal: 9234, errors: 0, duration: '4m 12s', triggeredBy: 'scheduled',
    },
    {
      id: 'job-2', type: 'character-fetch', status: 'running', category: 'Anime',
      startedAt: '2026-07-26T09:20:00Z', completedAt: null, progress: 72,
      itemsProcessed: 6649, itemsTotal: 9234, errors: 0, duration: null, triggeredBy: 'manual',
    },
    {
      id: 'job-3', type: 'seasonal-sync', status: 'completed', category: 'Summer 2026',
      startedAt: '2026-07-26T08:00:00Z', completedAt: '2026-07-26T08:02:45Z', progress: 100,
      itemsProcessed: 156, itemsTotal: 156, errors: 0, duration: '2m 45s', triggeredBy: 'scheduled',
    },
    {
      id: 'job-4', type: 'manga-sync', status: 'failed', category: 'All Manga',
      startedAt: '2026-07-26T07:00:00Z', completedAt: '2026-07-26T07:01:30Z', progress: 38,
      itemsProcessed: 1373, itemsTotal: 3613, errors: 2, duration: '1m 30s', triggeredBy: 'webhook',
    },
    {
      id: 'job-5', type: 'review-fetch', status: 'completed', category: 'Top Rated',
      startedAt: '2026-07-26T06:00:00Z', completedAt: '2026-07-26T06:05:18Z', progress: 100,
      itemsProcessed: 500, itemsTotal: 500, errors: 0, duration: '5m 18s', triggeredBy: 'scheduled',
    },
    {
      id: 'job-6', type: 'cleanup', status: 'queued', category: 'Cache',
      startedAt: '2026-07-26T09:25:00Z', completedAt: null, progress: 0,
      itemsProcessed: 0, itemsTotal: 0, errors: 0, duration: null, triggeredBy: 'manual',
    },
  ],
  mappings: [
    { id: 'map-1', kamiId: 'ks-anime-001', kamiTitle: 'Neon Samurai', malId: '56789', mediaType: 'anime', malType: 'tv', status: 'airing', externalIds: { tmdb: '11223', anilist: '21' }, lastSyncedAt: '2026-07-26T09:15:00Z', matchScore: 100, episodes: 12, score: 8.45 },
    { id: 'map-2', kamiId: 'ks-anime-002', kamiTitle: 'Cyber Resonance', malId: '56790', mediaType: 'anime', malType: 'tv', status: 'airing', externalIds: { anilist: '22', kitsu: '12345' }, lastSyncedAt: '2026-07-26T09:15:00Z', matchScore: 100, episodes: 24, score: 8.12 },
    { id: 'map-3', kamiId: 'ks-anime-003', kamiTitle: 'Phantom Circuit', malId: '56791', mediaType: 'anime', malType: 'tv', status: 'complete', externalIds: { tmdb: '11225', anilist: '23', anidb: '18765' }, lastSyncedAt: '2026-07-25T09:00:00Z', matchScore: 95, episodes: 12, score: 7.89 },
    { id: 'map-4', kamiId: 'ks-anime-004', kamiTitle: 'Quantum Phase', malId: '56792', mediaType: 'anime', malType: 'tv', status: 'complete', externalIds: { anilist: '24' }, lastSyncedAt: '2026-07-26T09:15:00Z', matchScore: 92, episodes: 24, score: 8.67 },
    { id: 'map-5', kamiId: 'ks-manga-001', kamiTitle: 'Stellar Drift', malId: '123456', mediaType: 'manga', malType: 'manga', status: 'airing', externalIds: { anilist: '101' }, lastSyncedAt: '2026-07-26T09:15:00Z', matchScore: 88, episodes: null, score: 7.56 },
    { id: 'map-6', kamiId: 'ks-anime-005', kamiTitle: 'Midnight Protocol', malId: '56793', mediaType: 'anime', malType: 'movie', status: 'complete', externalIds: { tmdb: '22334' }, lastSyncedAt: '2026-07-26T09:15:00Z', matchScore: 100, episodes: 1, score: 8.91 },
    { id: 'map-7', kamiId: 'ks-anime-006', kamiTitle: 'Void Walker', malId: '56794', mediaType: 'anime', malType: 'ova', status: 'complete', externalIds: { anilist: '25', kitsu: '12346' }, lastSyncedAt: '2026-07-24T12:00:00Z', matchScore: 78, episodes: 3, score: 7.23 },
  ],
  capabilities: [
    { id: 'cap-1', name: 'Anime Metadata', description: 'Fetch titles, synopses, scores, genres for anime entries', supported: true, enabled: true, version: '2.0' },
    { id: 'cap-2', name: 'Manga Metadata', description: 'Fetch manga titles, chapters, volumes, scores', supported: true, enabled: true, version: '2.0' },
    { id: 'cap-3', name: 'Character Data', description: 'Fetch voice actors, character descriptions, images', supported: true, enabled: true },
    { id: 'cap-4', name: 'Staff Data', description: 'Fetch anime/manga staff and production info', supported: true, enabled: true },
    { id: 'cap-5', name: 'Seasonal Anime', description: 'Fetch seasonal anime schedules and lineups', supported: true, enabled: true, version: '1.0' },
    { id: 'cap-6', name: 'Top Lists', description: 'Fetch top rated anime and manga', supported: true, enabled: true },
    { id: 'cap-7', name: 'Reviews', description: 'Fetch user reviews and recommendations', supported: true, enabled: true },
    { id: 'cap-8', name: 'Recommendations', description: 'Fetch similar anime/manga recommendations', supported: true, enabled: true },
    { id: 'cap-9', name: 'Forum Data', description: 'Fetch forum discussion topics', supported: true, enabled: false },
    { id: 'cap-10', name: 'User Lists', description: 'Fetch user watchlist and reading list data', supported: true, enabled: false, version: '1.0' },
    { id: 'cap-11', name: 'Club Data', description: 'Fetch anime/manga club information', supported: true, enabled: false },
    { id: 'cap-12', name: 'News Feed', description: 'Fetch latest anime/manga news articles', supported: false, enabled: false },
  ],
  logs: [
    { id: 'log-1', timestamp: '2026-07-26T09:19:12Z', level: 'info', message: 'Anime sync completed: 9,234 entries', source: 'anime-sync', details: '0 errors. 4m 12s total.' },
    { id: 'log-2', timestamp: '2026-07-26T09:17:30Z', level: 'info', message: 'Rate limit: 1,523 / 60,000 calls today (2.5%)', source: 'rate-limiter' },
    { id: 'log-3', timestamp: '2026-07-26T09:15:00Z', level: 'info', message: 'Scheduled anime sync initiated', source: 'scheduler' },
    { id: 'log-4', timestamp: '2026-07-26T09:10:00Z', level: 'info', message: 'Cache cleanup: freed 210 MB (expired entries)', source: 'cache-manager' },
    { id: 'log-5', timestamp: '2026-07-26T08:02:45Z', level: 'info', message: 'Seasonal sync completed for Summer 2026 (156 titles)', source: 'seasonal-sync' },
    { id: 'log-6', timestamp: '2026-07-26T07:01:30Z', level: 'error', message: 'Manga sync failed partially', source: 'manga-sync', details: '2 items failed: HTTP 429 (rate limit exceeded). Retry scheduled in 60s.' },
    { id: 'log-7', timestamp: '2026-07-26T06:05:18Z', level: 'info', message: 'Review fetch completed for Top Rated (500 entries)', source: 'review-fetch' },
    { id: 'log-8', timestamp: '2026-07-26T04:00:00Z', level: 'info', message: 'Nightly anime sync completed', source: 'scheduler' },
    { id: 'log-9', timestamp: '2026-07-25T22:30:00Z', level: 'debug', message: 'Webhook received: anime.updated', source: 'webhook-server', details: '{"type":"anime","count":45}' },
    { id: 'log-10', timestamp: '2026-07-25T18:00:00Z', level: 'info', message: 'API key validated successfully', source: 'auth' },
  ],
  settings: {
    apiKey: 'mal_xK9mNpQrStUvWxYzAbCdEf',
    apiUrl: 'https://api.myanimelist.net/v2',
    timeout: 15,
    cacheEnabled: true,
    cacheTtlHours: 48,
    maxCacheSizeMb: 4096,
    autoSync: true,
    syncInterval: 3600,
    rateLimitPerSecond: 3,
    retryOnFail: true,
    maxRetries: 3,
    notificationsEnabled: true,
    webhookEnabled: true,
    webhookUrl: 'https://kami-sama.app/api/webhooks/mal',
    includeNsfw: false,
    includeManga: true,
    seasonalSync: true,
    fetchCharacters: true,
    fetchReviews: true,
    fetchRecommendations: true,
  },
}
