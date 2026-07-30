export type ProviderStatus = 'connected' | 'disconnected' | 'error' | 'syncing'

export type JobStatus = 'completed' | 'running' | 'failed' | 'queued' | 'cancelled'
export type JobType = 'metadata-sync' | 'cast-fetch' | 'trailer-fetch' | 'cleanup' | 'batch-import'

export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

export type MediaType = 'movie' | 'tv' | 'anime'

export interface ProviderInfo {
  id: string
  name: string
  slug: string
  type: 'tmdb'
  status: ProviderStatus
  version: string
  apiUrl: string
  lastSyncAt: string | null
  mediaCount: number
  apiKeyValid: boolean
}

export interface ProviderStats {
  totalMedia: number
  movieCount: number
  tvCount: number
  animeCount: number
  cachedMetadata: number
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
  language: string
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
  tmdbId: string
  mediaType: MediaType
  externalIds: {
    imdb?: string
    tvdb?: string
    anilist?: string
    mal?: string
  }
  lastSyncedAt: string
  matchScore: number
  overview: string
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
  language: string
  rateLimitPerSecond: number
  retryOnFail: boolean
  maxRetries: number
  notificationsEnabled: boolean
  webhookEnabled: boolean
  webhookUrl: string
  includeAdult: boolean
  includeAnime: boolean
}

export interface TmdbProviderData {
  provider: ProviderInfo
  stats: ProviderStats
  categories: MediaCategory[]
  jobs: SyncJob[]
  mappings: MediaMapping[]
  capabilities: ProviderCapability[]
  logs: ProviderLog[]
  settings: ProviderSettings
}

export const tmdbProviderData: TmdbProviderData = {
  provider: {
    id: 'tmdb-001',
    name: 'The Movie Database',
    slug: 'tmdb',
    type: 'tmdb',
    status: 'connected',
    version: 'API v3',
    apiUrl: 'https://api.themoviedb.org/3',
    lastSyncAt: '2026-07-26T09:15:00Z',
    mediaCount: 8432,
    apiKeyValid: true,
  },
  stats: {
    totalMedia: 8432,
    movieCount: 4215,
    tvCount: 3127,
    animeCount: 1090,
    cachedMetadata: 8120,
    cacheSize: '1.8 GB',
    cacheTotalSize: '4 GB',
    apiCallsToday: 2341,
    apiCallsLimit: 40000,
    lastSyncDuration: '3m 42s',
    syncErrors: 0,
    bandwidthSaved: '24.3 GB',
    averageResponseMs: 89,
  },
  categories: [
    { id: 'cat-1', type: 'movie', label: 'Movies', count: 4215, syncedCount: 4200, lastSyncedAt: '2026-07-26T09:15:00Z', enabled: true, autoSync: true, language: 'en' },
    { id: 'cat-2', type: 'tv', label: 'TV Shows', count: 3127, syncedCount: 3120, lastSyncedAt: '2026-07-26T09:15:00Z', enabled: true, autoSync: true, language: 'en' },
    { id: 'cat-3', type: 'anime', label: 'Anime', count: 1090, syncedCount: 1080, lastSyncedAt: '2026-07-26T08:30:00Z', enabled: true, autoSync: true, language: 'ja' },
  ],
  jobs: [
    {
      id: 'job-1', type: 'metadata-sync', status: 'completed', category: 'All Categories',
      startedAt: '2026-07-26T09:15:00Z', completedAt: '2026-07-26T09:18:42Z', progress: 100,
      itemsProcessed: 8432, itemsTotal: 8432, errors: 0, duration: '3m 42s', triggeredBy: 'scheduled',
    },
    {
      id: 'job-2', type: 'cast-fetch', status: 'running', category: 'Movies',
      startedAt: '2026-07-26T09:20:00Z', completedAt: null, progress: 67,
      itemsProcessed: 2824, itemsTotal: 4215, errors: 0, duration: null, triggeredBy: 'manual',
    },
    {
      id: 'job-3', type: 'trailer-fetch', status: 'completed', category: 'TV Shows',
      startedAt: '2026-07-26T08:00:00Z', completedAt: '2026-07-26T08:04:15Z', progress: 100,
      itemsProcessed: 3127, itemsTotal: 3127, errors: 0, duration: '4m 15s', triggeredBy: 'scheduled',
    },
    {
      id: 'job-4', type: 'batch-import', status: 'failed', category: 'Anime',
      startedAt: '2026-07-26T07:00:00Z', completedAt: '2026-07-26T07:01:30Z', progress: 42,
      itemsProcessed: 458, itemsTotal: 1090, errors: 3, duration: '1m 30s', triggeredBy: 'webhook',
    },
    {
      id: 'job-5', type: 'cleanup', status: 'queued', category: 'Cache',
      startedAt: '2026-07-26T09:25:00Z', completedAt: null, progress: 0,
      itemsProcessed: 0, itemsTotal: 0, errors: 0, duration: null, triggeredBy: 'manual',
    },
  ],
  mappings: [
    { id: 'map-1', kamiId: 'ks-movie-001', kamiTitle: 'Stellar Drift', tmdbId: '98765', mediaType: 'movie', externalIds: { imdb: 'tt1234567' }, lastSyncedAt: '2026-07-26T09:15:00Z', matchScore: 100, overview: 'A deep space exploration epic.' },
    { id: 'map-2', kamiId: 'ks-movie-002', kamiTitle: 'Dark Horizon', tmdbId: '98766', mediaType: 'movie', externalIds: { imdb: 'tt2345678' }, lastSyncedAt: '2026-07-26T09:15:00Z', matchScore: 100, overview: 'A dystopian thriller set in 2087.' },
    { id: 'map-3', kamiId: 'ks-movie-003', kamiTitle: 'Quantum Paradox', tmdbId: '98767', mediaType: 'movie', externalIds: { imdb: 'tt3456789' }, lastSyncedAt: '2026-07-26T09:15:00Z', matchScore: 95, overview: 'A mind-bending time travel story.' },
    { id: 'map-4', kamiId: 'ks-anime-001', kamiTitle: 'Neon Samurai', tmdbId: '11223', mediaType: 'anime', externalIds: { anilist: '21', mal: '12345' }, lastSyncedAt: '2026-07-26T09:15:00Z', matchScore: 100, overview: 'Cyberpunk samurai action in Neo-Tokyo.' },
    { id: 'map-5', kamiId: 'ks-anime-002', kamiTitle: 'Cyber Resonance', tmdbId: '11224', mediaType: 'anime', externalIds: { anilist: '22', mal: '12346' }, lastSyncedAt: '2026-07-26T09:15:00Z', matchScore: 100, overview: 'AI and humanity collide.' },
    { id: 'map-6', kamiId: 'ks-tv-001', kamiTitle: 'Midnight Protocol', tmdbId: '22334', mediaType: 'tv', externalIds: { imdb: 'tt4567890' }, lastSyncedAt: '2026-07-26T09:15:00Z', matchScore: 92, overview: 'A cybersecurity thriller series.' },
    { id: 'map-7', kamiId: 'ks-anime-003', kamiTitle: 'Phantom Circuit', tmdbId: '11225', mediaType: 'anime', externalIds: { anilist: '23', mal: '12347' }, lastSyncedAt: '2026-07-25T09:00:00Z', matchScore: 88, overview: 'Ghost in the machine.' },
  ],
  capabilities: [
    { id: 'cap-1', name: 'Movie Metadata', description: 'Fetch titles, overviews, ratings, release dates for movies', supported: true, enabled: true, version: '3.0' },
    { id: 'cap-2', name: 'TV Show Metadata', description: 'Fetch series info, episode guides, seasons for TV shows', supported: true, enabled: true, version: '3.0' },
    { id: 'cap-3', name: 'Anime Metadata', description: 'Fetch anime-specific metadata from TMDB', supported: true, enabled: true },
    { id: 'cap-4', name: 'Cast & Crew', description: 'Fetch actor and crew member information', supported: true, enabled: true },
    { id: 'cap-5', name: 'Trailers & Videos', description: 'Fetch trailer and video URLs for media', supported: true, enabled: true, version: '2.0' },
    { id: 'cap-6', name: 'Recommendations', description: 'Fetch similar and recommended titles', supported: true, enabled: true },
    { id: 'cap-7', name: 'Ratings Aggregation', description: 'Aggregate ratings from multiple sources', supported: true, enabled: true },
    { id: 'cap-8', name: 'Translations', description: 'Fetch translated titles and overviews', supported: true, enabled: true },
    { id: 'cap-9', name: 'Watch Providers', description: 'Fetch streaming provider availability', supported: true, enabled: true, version: '1.0' },
    { id: 'cap-10', name: 'Keyword Search', description: 'Search media by keywords and genres', supported: true, enabled: true },
    { id: 'cap-11', name: 'Collection Support', description: 'Fetch movie collection groupings', supported: true, enabled: false },
    { id: 'cap-12', name: 'AI Summaries', description: 'AI-generated plot summaries', supported: false, enabled: false },
  ],
  logs: [
    { id: 'log-1', timestamp: '2026-07-26T09:18:42Z', level: 'info', message: 'Metadata sync completed: 8,432 items', source: 'metadata-sync', details: '0 errors. 3m 42s total.' },
    { id: 'log-2', timestamp: '2026-07-26T09:16:10Z', level: 'info', message: 'Rate limit: 2,341 / 40,000 calls today (5.8%)', source: 'rate-limiter' },
    { id: 'log-3', timestamp: '2026-07-26T09:15:00Z', level: 'info', message: 'Scheduled metadata sync initiated', source: 'scheduler' },
    { id: 'log-4', timestamp: '2026-07-26T09:10:00Z', level: 'info', message: 'Cache cleanup: freed 180 MB (expired items)', source: 'cache-manager' },
    { id: 'log-5', timestamp: '2026-07-26T08:04:15Z', level: 'info', message: 'Trailer fetch completed for TV Shows (3,127 items)', source: 'trailer-fetch' },
    { id: 'log-6', timestamp: '2026-07-26T07:01:30Z', level: 'error', message: 'Batch import failed for Anime', source: 'batch-importer', details: '3 items failed: HTTP 429 (rate limit exceeded). Retry scheduled in 60s.' },
    { id: 'log-7', timestamp: '2026-07-26T05:00:00Z', level: 'info', message: 'Nightly metadata sync completed', source: 'scheduler' },
    { id: 'log-8', timestamp: '2026-07-25T22:00:00Z', level: 'debug', message: 'Webhook received: media.updated', source: 'webhook-server', details: '{"type":"movie","count":24}' },
    { id: 'log-9', timestamp: '2026-07-25T18:30:00Z', level: 'info', message: 'API key validated successfully', source: 'auth' },
    { id: 'log-10', timestamp: '2026-07-25T14:22:00Z', level: 'warn', message: 'Slow response from TMDB API: 3,120ms (threshold: 2,000ms)', source: 'api-client' },
  ],
  settings: {
    apiKey: 'tmdb_xK9mNpQrStUvWxYzAbCdEf',
    apiUrl: 'https://api.themoviedb.org/3',
    timeout: 15,
    cacheEnabled: true,
    cacheTtlHours: 72,
    maxCacheSizeMb: 4096,
    autoSync: true,
    syncInterval: 3600,
    language: 'en',
    rateLimitPerSecond: 40,
    retryOnFail: true,
    maxRetries: 3,
    notificationsEnabled: true,
    webhookEnabled: true,
    webhookUrl: 'https://kami-sama.app/api/webhooks/tmdb',
    includeAdult: false,
    includeAnime: true,
  },
}
