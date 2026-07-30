export type ProviderStatus = 'connected' | 'disconnected' | 'error' | 'syncing'

export type JobStatus = 'completed' | 'running' | 'failed' | 'queued' | 'cancelled'
export type JobType = 'series-sync' | 'episode-fetch' | 'artwork-fetch' | 'batch-import' | 'cleanup'

export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

export type ArtworkType = 'poster' | 'banner' | 'fanart' | 'season' | 'thumb' | 'clearart' | 'logo' | 'character'

export type SeriesStatus = 'continuing' | 'ended' | 'upcoming'

export interface ProviderInfo {
  id: string
  name: string
  slug: string
  type: 'tvdb'
  status: ProviderStatus
  version: string
  apiUrl: string
  lastSyncAt: string | null
  seriesCount: number
  apiKeyValid: boolean
}

export interface ProviderStats {
  totalSeries: number
  totalEpisodes: number
  totalArtwork: number
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
  type: ArtworkType
  label: string
  count: number
  syncedCount: number
  lastSyncedAt: string | null
  enabled: boolean
  autoSync: boolean
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
  tvdbId: string
  seriesStatus: SeriesStatus
  seasons: number
  episodes: number
  externalIds: {
    tmdb?: string
    imdb?: string
    anilist?: string
  }
  lastSyncedAt: string
  matchScore: number
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
  includeArtwork: boolean
  fetchEpisodes: boolean
  fetchActors: boolean
  artworkLanguage: string
}

export interface TvdbProviderData {
  provider: ProviderInfo
  stats: ProviderStats
  categories: MediaCategory[]
  jobs: SyncJob[]
  mappings: MediaMapping[]
  capabilities: ProviderCapability[]
  logs: ProviderLog[]
  settings: ProviderSettings
}

export const tvdbProviderData: TvdbProviderData = {
  provider: {
    id: 'tvdb-001',
    name: 'TheTVDB',
    slug: 'tvdb',
    type: 'tvdb',
    status: 'connected',
    version: 'API v4',
    apiUrl: 'https://api.thetvdb.com/v4',
    lastSyncAt: '2026-07-26T09:15:00Z',
    seriesCount: 15234,
    apiKeyValid: true,
  },
  stats: {
    totalSeries: 15234,
    totalEpisodes: 489120,
    totalArtwork: 89234,
    cachedEntries: 14800,
    cacheSize: '3.2 GB',
    cacheTotalSize: '8 GB',
    apiCallsToday: 3214,
    apiCallsLimit: 100000,
    lastSyncDuration: '5m 28s',
    syncErrors: 2,
    bandwidthSaved: '42.1 GB',
    averageResponseMs: 54,
  },
  categories: [
    { id: 'cat-1', type: 'poster', label: 'Series Posters', count: 15234, syncedCount: 15200, lastSyncedAt: '2026-07-26T09:15:00Z', enabled: true, autoSync: true },
    { id: 'cat-2', type: 'banner', label: 'Series Banners', count: 12456, syncedCount: 12400, lastSyncedAt: '2026-07-26T09:15:00Z', enabled: true, autoSync: true },
    { id: 'cat-3', type: 'fanart', label: 'Series Fanart', count: 18923, syncedCount: 18900, lastSyncedAt: '2026-07-26T09:15:00Z', enabled: true, autoSync: true },
    { id: 'cat-4', type: 'season', label: 'Season Artwork', count: 24567, syncedCount: 24500, lastSyncedAt: '2026-07-26T09:15:00Z', enabled: true, autoSync: true },
    { id: 'cat-5', type: 'thumb', label: 'Episode Thumbnails', count: 489120, syncedCount: 488000, lastSyncedAt: '2026-07-26T08:00:00Z', enabled: true, autoSync: true },
    { id: 'cat-6', type: 'clearart', label: 'Clear Art', count: 8234, syncedCount: 8200, lastSyncedAt: '2026-07-26T09:15:00Z', enabled: true, autoSync: false },
    { id: 'cat-7', type: 'logo', label: 'Series Logos', count: 12890, syncedCount: 12850, lastSyncedAt: '2026-07-26T09:15:00Z', enabled: true, autoSync: true },
    { id: 'cat-8', type: 'character', label: 'Character Art', count: 9234, syncedCount: 9200, lastSyncedAt: '2026-07-26T09:15:00Z', enabled: false, autoSync: false },
  ],
  jobs: [
    { id: 'job-1', type: 'series-sync', status: 'completed', category: 'All Series', startedAt: '2026-07-26T09:15:00Z', completedAt: '2026-07-26T09:20:28Z', progress: 100, itemsProcessed: 15234, itemsTotal: 15234, errors: 2, duration: '5m 28s', triggeredBy: 'scheduled' },
    { id: 'job-2', type: 'episode-fetch', status: 'running', category: 'New Episodes', startedAt: '2026-07-26T09:22:00Z', completedAt: null, progress: 78, itemsProcessed: 381420, itemsTotal: 489120, errors: 0, duration: null, triggeredBy: 'manual' },
    { id: 'job-3', type: 'artwork-fetch', status: 'completed', category: 'Posters', startedAt: '2026-07-26T08:30:00Z', completedAt: '2026-07-26T08:34:15Z', progress: 100, itemsProcessed: 15234, itemsTotal: 15234, errors: 0, duration: '4m 15s', triggeredBy: 'scheduled' },
    { id: 'job-4', type: 'batch-import', status: 'failed', category: 'Fanart', startedAt: '2026-07-26T07:00:00Z', completedAt: '2026-07-26T07:02:30Z', progress: 55, itemsProcessed: 10408, itemsTotal: 18923, errors: 5, duration: '2m 30s', triggeredBy: 'webhook' },
    { id: 'job-5', type: 'cleanup', status: 'queued', category: 'Cache', startedAt: '2026-07-26T09:25:00Z', completedAt: null, progress: 0, itemsProcessed: 0, itemsTotal: 0, errors: 0, duration: null, triggeredBy: 'manual' },
  ],
  mappings: [
    { id: 'map-1', kamiId: 'ks-anime-001', kamiTitle: 'Neon Samurai', tvdbId: '45678', seriesStatus: 'continuing', seasons: 3, episodes: 36, externalIds: { tmdb: '11223', anilist: '21' }, lastSyncedAt: '2026-07-26T09:15:00Z', matchScore: 100 },
    { id: 'map-2', kamiId: 'ks-anime-002', kamiTitle: 'Cyber Resonance', tvdbId: '45679', seriesStatus: 'continuing', seasons: 1, episodes: 12, externalIds: { anilist: '22' }, lastSyncedAt: '2026-07-26T09:15:00Z', matchScore: 98 },
    { id: 'map-3', kamiId: 'ks-anime-003', kamiTitle: 'Phantom Circuit', tvdbId: '45680', seriesStatus: 'ended', seasons: 2, episodes: 24, externalIds: { tmdb: '11225', anilist: '23' }, lastSyncedAt: '2026-07-25T09:00:00Z', matchScore: 95 },
    { id: 'map-4', kamiId: 'ks-anime-004', kamiTitle: 'Quantum Phase', tvdbId: '45681', seriesStatus: 'ended', seasons: 2, episodes: 24, externalIds: { anilist: '24' }, lastSyncedAt: '2026-07-26T09:15:00Z', matchScore: 92 },
    { id: 'map-5', kamiId: 'ks-tv-001', kamiTitle: 'Midnight Protocol', tvdbId: '45682', seriesStatus: 'continuing', seasons: 1, episodes: 10, externalIds: { tmdb: '22334', imdb: 'tt1234567' }, lastSyncedAt: '2026-07-26T09:15:00Z', matchScore: 100 },
    { id: 'map-6', kamiId: 'ks-anime-005', kamiTitle: 'Void Walker', tvdbId: '45683', seriesStatus: 'ended', seasons: 1, episodes: 3, externalIds: { anilist: '25' }, lastSyncedAt: '2026-07-24T12:00:00Z', matchScore: 78 },
  ],
  capabilities: [
    { id: 'cap-1', name: 'Series Metadata', description: 'Fetch series titles, overviews, ratings, genres', supported: true, enabled: true, version: '4.0' },
    { id: 'cap-2', name: 'Episode Data', description: 'Fetch episode guides, summaries, air dates', supported: true, enabled: true, version: '4.0' },
    { id: 'cap-3', name: 'Season Data', description: 'Fetch season-level metadata and artwork', supported: true, enabled: true },
    { id: 'cap-4', name: 'Series Artwork', description: 'Fetch posters, banners, fanart for series', supported: true, enabled: true },
    { id: 'cap-5', name: 'Episode Artwork', description: 'Fetch thumbnails and stills for episodes', supported: true, enabled: true, version: '2.0' },
    { id: 'cap-6', name: 'Actor Data', description: 'Fetch cast and crew information', supported: true, enabled: true },
    { id: 'cap-7', name: 'Ratings', description: 'Fetch series and episode ratings', supported: true, enabled: true },
    { id: 'cap-8', name: 'Translations', description: 'Fetch localized titles and descriptions', supported: true, enabled: true },
    { id: 'cap-9', name: 'Aliases', description: 'Fetch alternative series names', supported: true, enabled: true },
    { id: 'cap-10', name: 'Extended Info', description: 'Fetch extended series details (networks, studios)', supported: true, enabled: false },
    { id: 'cap-11', name: 'Fanart Hub', description: 'Integrate with Fanart.tv for HD artwork', supported: true, enabled: true, version: '1.0' },
    { id: 'cap-12', name: 'AI Recommendations', description: 'AI-powered series recommendations', supported: false, enabled: false },
  ],
  logs: [
    { id: 'log-1', timestamp: '2026-07-26T09:20:28Z', level: 'info', message: 'Series sync completed: 15,234 series', source: 'series-sync', details: '2 warnings. 5m 28s total.' },
    { id: 'log-2', timestamp: '2026-07-26T09:18:00Z', level: 'info', message: 'Rate limit: 3,214 / 100,000 calls today (3.2%)', source: 'rate-limiter' },
    { id: 'log-3', timestamp: '2026-07-26T09:15:00Z', level: 'info', message: 'Scheduled series sync initiated', source: 'scheduler' },
    { id: 'log-4', timestamp: '2026-07-26T09:10:00Z', level: 'info', message: 'Cache cleanup: freed 320 MB (expired entries)', source: 'cache-manager' },
    { id: 'log-5', timestamp: '2026-07-26T08:34:15Z', level: 'info', message: 'Artwork fetch completed for Posters (15,234 items)', source: 'artwork-fetch' },
    { id: 'log-6', timestamp: '2026-07-26T07:02:30Z', level: 'error', message: 'Batch import failed for Fanart', source: 'batch-importer', details: '5 items failed: HTTP 429 (rate limit exceeded). Retry scheduled in 60s.' },
    { id: 'log-7', timestamp: '2026-07-26T05:00:00Z', level: 'info', message: 'Nightly series sync completed', source: 'scheduler' },
    { id: 'log-8', timestamp: '2026-07-25T22:30:00Z', level: 'debug', message: 'Webhook received: series.updated', source: 'webhook-server', details: '{"type":"series","count":34}' },
    { id: 'log-9', timestamp: '2026-07-25T18:00:00Z', level: 'info', message: 'API key validated successfully', source: 'auth' },
    { id: 'log-10', timestamp: '2026-07-25T14:22:00Z', level: 'warn', message: 'Slow response from TVDB API: 2,890ms (threshold: 2,000ms)', source: 'api-client' },
  ],
  settings: {
    apiKey: 'tvdb_xK9mNpQrStUvWxYzAbCdEf',
    apiUrl: 'https://api.thetvdb.com/v4',
    timeout: 15,
    cacheEnabled: true,
    cacheTtlHours: 72,
    maxCacheSizeMb: 8192,
    autoSync: true,
    syncInterval: 3600,
    language: 'en',
    rateLimitPerSecond: 20,
    retryOnFail: true,
    maxRetries: 3,
    notificationsEnabled: true,
    webhookEnabled: true,
    webhookUrl: 'https://kami-sama.app/api/webhooks/tvdb',
    includeArtwork: true,
    fetchEpisodes: true,
    fetchActors: true,
    artworkLanguage: 'en',
  },
}
