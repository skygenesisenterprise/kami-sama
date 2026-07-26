export type ProviderStatus = 'connected' | 'disconnected' | 'error' | 'syncing'

export type JobStatus = 'completed' | 'running' | 'failed' | 'queued' | 'cancelled'
export type JobType = 'artwork-sync' | 'cache-refresh' | 'metadata-fetch' | 'cleanup' | 'batch-download'

export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

export type ArtworkType =
  | 'movie-poster'
  | 'movie-fanart'
  | 'movie-banner'
  | 'movie-logo'
  | 'tv-poster'
  | 'tv-banner'
  | 'tv-fanart'
  | 'tv-logo'
  | 'tv-season-poster'
  | 'tv-season-banner'
  | 'tv-episode-thumb'

export interface ProviderInfo {
  id: string
  name: string
  slug: string
  type: 'fanart'
  status: ProviderStatus
  version: string
  apiUrl: string
  lastSyncAt: string | null
  artworkCount: number
  apiKeyValid: boolean
}

export interface ProviderStats {
  totalArtwork: number
  movieArtwork: number
  tvArtwork: number
  cachedImages: number
  cacheSize: string
  cacheTotalSize: string
  apiCallsToday: number
  apiCallsLimit: number
  lastSyncDuration: string
  syncErrors: number
  bandwidthSaved: string
  averageResponseMs: number
}

export interface ArtworkCategory {
  id: string
  type: ArtworkType
  label: string
  count: number
  cachedCount: number
  lastFetchedAt: string | null
  enabled: boolean
  autoFetch: boolean
  imageSize: string
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

export interface ArtworkMapping {
  id: string
  kamiId: string
  kamiTitle: string
  fanartId: string
  fanartType: ArtworkType
  externalIds: {
    tmdb?: string
    imdb?: string
    tvdb?: string
    anilist?: string
  }
  lastSyncedAt: string
  matchScore: number
  url: string
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
  autoFetch: boolean
  fetchInterval: number
  imageQuality: 'thumb' | 'medium' | 'high' | 'original'
  includeDlcs: boolean
  fanartLanguage: string
  rateLimitPerSecond: number
  retryOnFail: boolean
  maxRetries: number
  notificationsEnabled: boolean
  webhookEnabled: boolean
  webhookUrl: string
}

export interface FanartProviderData {
  provider: ProviderInfo
  stats: ProviderStats
  categories: ArtworkCategory[]
  jobs: SyncJob[]
  mappings: ArtworkMapping[]
  capabilities: ProviderCapability[]
  logs: ProviderLog[]
  settings: ProviderSettings
}

export const fanartProviderData: FanartProviderData = {
  provider: {
    id: 'fanart-001',
    name: 'Fanart.tv',
    slug: 'fanart',
    type: 'fanart',
    status: 'connected',
    version: 'API v3',
    apiUrl: 'https://webservice.fanart.tv/v3',
    lastSyncAt: '2026-07-26T09:15:00Z',
    artworkCount: 12847,
    apiKeyValid: true,
  },
  stats: {
    totalArtwork: 12847,
    movieArtwork: 5312,
    tvArtwork: 7535,
    cachedImages: 8234,
    cacheSize: '2.4 GB',
    cacheTotalSize: '4 GB',
    apiCallsToday: 1847,
    apiCallsLimit: 5000,
    lastSyncDuration: '2m 18s',
    syncErrors: 1,
    bandwidthSaved: '18.7 GB',
    averageResponseMs: 142,
  },
  categories: [
    { id: 'cat-1', type: 'movie-poster', label: 'Movie Posters', count: 1842, cachedCount: 1840, lastFetchedAt: '2026-07-26T09:15:00Z', enabled: true, autoFetch: true, imageSize: '500x750' },
    { id: 'cat-2', type: 'movie-fanart', label: 'Movie Fanart', count: 1567, cachedCount: 1560, lastFetchedAt: '2026-07-26T09:15:00Z', enabled: true, autoFetch: true, imageSize: '1920x1080' },
    { id: 'cat-3', type: 'movie-banner', label: 'Movie Banners', count: 423, cachedCount: 420, lastFetchedAt: '2026-07-26T09:15:00Z', enabled: true, autoFetch: false, imageSize: '1000x185' },
    { id: 'cat-4', type: 'movie-logo', label: 'Movie Logos', count: 1480, cachedCount: 1414, lastFetchedAt: '2026-07-26T09:15:00Z', enabled: true, autoFetch: true, imageSize: '800x310' },
    { id: 'cat-5', type: 'tv-poster', label: 'TV Show Posters', count: 2134, cachedCount: 2130, lastFetchedAt: '2026-07-26T09:15:00Z', enabled: true, autoFetch: true, imageSize: '500x750' },
    { id: 'cat-6', type: 'tv-banner', label: 'TV Show Banners', count: 987, cachedCount: 985, lastFetchedAt: '2026-07-26T09:15:00Z', enabled: true, autoFetch: true, imageSize: '1000x185' },
    { id: 'cat-7', type: 'tv-fanart', label: 'TV Show Fanart', count: 1856, cachedCount: 1850, lastFetchedAt: '2026-07-26T09:15:00Z', enabled: true, autoFetch: true, imageSize: '1920x1080' },
    { id: 'cat-8', type: 'tv-logo', label: 'TV Show Logos', count: 1642, cachedCount: 1640, lastFetchedAt: '2026-07-26T09:15:00Z', enabled: true, autoFetch: true, imageSize: '800x310' },
    { id: 'cat-9', type: 'tv-season-poster', label: 'Season Posters', count: 1203, cachedCount: 1198, lastFetchedAt: '2026-07-26T09:15:00Z', enabled: true, autoFetch: false, imageSize: '500x750' },
    { id: 'cat-10', type: 'tv-season-banner', label: 'Season Banners', count: 678, cachedCount: 675, lastFetchedAt: '2026-07-26T09:15:00Z', enabled: false, autoFetch: false, imageSize: '1000x185' },
    { id: 'cat-11', type: 'tv-episode-thumb', label: 'Episode Thumbnails', count: 3534, cachedCount: 3500, lastFetchedAt: '2026-07-26T08:00:00Z', enabled: true, autoFetch: true, imageSize: '400x225' },
  ],
  jobs: [
    {
      id: 'job-1', type: 'artwork-sync', status: 'completed', category: 'All Categories',
      startedAt: '2026-07-26T09:15:00Z', completedAt: '2026-07-26T09:17:18Z', progress: 100,
      itemsProcessed: 12847, itemsTotal: 12847, errors: 1, duration: '2m 18s', triggeredBy: 'scheduled',
    },
    {
      id: 'job-2', type: 'cache-refresh', status: 'running', category: 'Movie Posters',
      startedAt: '2026-07-26T09:20:00Z', completedAt: null, progress: 45,
      itemsProcessed: 828, itemsTotal: 1842, errors: 0, duration: null, triggeredBy: 'manual',
    },
    {
      id: 'job-3', type: 'metadata-fetch', status: 'completed', category: 'TV Show Logos',
      startedAt: '2026-07-26T08:30:00Z', completedAt: '2026-07-26T08:31:05Z', progress: 100,
      itemsProcessed: 1642, itemsTotal: 1642, errors: 0, duration: '1m 05s', triggeredBy: 'scheduled',
    },
    {
      id: 'job-4', type: 'batch-download', status: 'failed', category: 'Movie Fanart',
      startedAt: '2026-07-26T07:00:00Z', completedAt: '2026-07-26T07:02:30Z', progress: 62,
      itemsProcessed: 971, itemsTotal: 1567, errors: 8, duration: '2m 30s', triggeredBy: 'webhook',
    },
    {
      id: 'job-5', type: 'cleanup', status: 'queued', category: 'Cache',
      startedAt: '2026-07-26T09:25:00Z', completedAt: null, progress: 0,
      itemsProcessed: 0, itemsTotal: 0, errors: 0, duration: null, triggeredBy: 'manual',
    },
    {
      id: 'job-6', type: 'artwork-sync', status: 'completed', category: 'All Categories',
      startedAt: '2026-07-26T05:00:00Z', completedAt: '2026-07-26T05:02:10Z', progress: 100,
      itemsProcessed: 12847, itemsTotal: 12847, errors: 0, duration: '2m 10s', triggeredBy: 'scheduled',
    },
  ],
  mappings: [
    { id: 'map-1', kamiId: 'ks-movie-001', kamiTitle: 'Stellar Drift', fanartId: 'fd-77012', fanartType: 'movie-poster', externalIds: { tmdb: '20001', imdb: 'tt1234567' }, lastSyncedAt: '2026-07-26T09:15:00Z', matchScore: 100, url: 'https://assets.fanart.tv/fanart/movies/77012/movieposter/stellar-drift-77012.jpg' },
    { id: 'map-2', kamiId: 'ks-movie-002', kamiTitle: 'Dark Horizon', fanartId: 'fd-77013', fanartType: 'movie-fanart', externalIds: { tmdb: '20002', imdb: 'tt2345678' }, lastSyncedAt: '2026-07-26T09:15:00Z', matchScore: 100, url: 'https://assets.fanart.tv/fanart/movies/77013/hdmovieinfoart/dark-horizon-77013.jpg' },
    { id: 'map-3', kamiId: 'ks-movie-003', kamiTitle: 'Quantum Paradox', fanartId: 'fd-77014', fanartType: 'movie-logo', externalIds: { tmdb: '20003' }, lastSyncedAt: '2026-07-26T09:15:00Z', matchScore: 95, url: 'https://assets.fanart.tv/fanart/movies/77014/hdmovielogo/quantum-paradox-77014.png' },
    { id: 'map-4', kamiId: 'ks-anime-001', kamiTitle: 'Neon Samurai', fanartId: 'fd-34567', fanartType: 'tv-poster', externalIds: { tmdb: '12345', tvdb: '98765', anilist: '21' }, lastSyncedAt: '2026-07-26T09:15:00Z', matchScore: 100, url: 'https://assets.fanart.tv/fanart/tv/34567/tvposter/neon-samurai-34567.jpg' },
    { id: 'map-5', kamiId: 'ks-anime-002', kamiTitle: 'Cyber Resonance', fanartId: 'fd-34568', fanartType: 'tv-banner', externalIds: { tmdb: '12346', anilist: '22' }, lastSyncedAt: '2026-07-26T09:15:00Z', matchScore: 100, url: 'https://assets.fanart.tv/fanart/tv/34568/tvbanner/cyber-resonance-34568.jpg' },
    { id: 'map-6', kamiId: 'ks-anime-003', kamiTitle: 'Phantom Circuit', fanartId: 'fd-34569', fanartType: 'tv-fanart', externalIds: { anilist: '23', tvdb: '98766' }, lastSyncedAt: '2026-07-26T09:15:00Z', matchScore: 88, url: 'https://assets.fanart.tv/fanart/tv/34569/showbackground/phantom-circuit-34569.jpg' },
    { id: 'map-7', kamiId: 'ks-anime-004', kamiTitle: 'Quantum Phase', fanartId: 'fd-34570', fanartType: 'tv-logo', externalIds: { tmdb: '12348', anilist: '24' }, lastSyncedAt: '2026-07-26T09:15:00Z', matchScore: 92, url: 'https://assets.fanart.tv/fanart/tv/34570/hdtvlogo/quantum-phase-34570.png' },
    { id: 'map-8', kamiId: 'ks-movie-004', kamiTitle: 'Neon Nights', fanartId: 'fd-77015', fanartType: 'movie-banner', externalIds: { tmdb: '20004', imdb: 'tt3456789' }, lastSyncedAt: '2026-07-25T09:00:00Z', matchScore: 78, url: 'https://assets.fanart.tv/fanart/movies/77015/moviebanner/neon-nights-77015.jpg' },
  ],
  capabilities: [
    { id: 'cap-1', name: 'Movie Artwork', description: 'Fetch posters, fanart, banners and logos for movies', supported: true, enabled: true, version: '3.0' },
    { id: 'cap-2', name: 'TV Show Artwork', description: 'Fetch posters, banners, fanart and logos for TV series', supported: true, enabled: true, version: '3.0' },
    { id: 'cap-3', name: 'Season Artwork', description: 'Fetch season-specific posters and banners', supported: true, enabled: true },
    { id: 'cap-4', name: 'Episode Thumbnails', description: 'Fetch thumbnail images for individual episodes', supported: true, enabled: true },
    { id: 'cap-5', name: 'HD Artwork', description: 'Prefer high-definition artwork variants when available', supported: true, enabled: true, version: '2.0' },
    { id: 'cap-6', name: 'Disc Art', description: 'Fetch disc-specific artwork (Blu-ray, DVD)', supported: true, enabled: false },
    { id: 'cap-7', name: 'Character Art', description: 'Fetch character artwork for TV shows', supported: true, enabled: false },
    { id: 'cap-8', name: 'Season Backgrounds', description: 'Fetch background art for individual seasons', supported: true, enabled: true },
    { id: 'cap-9', name: 'Webhook Updates', description: 'Receive notifications when new artwork is available', supported: true, enabled: true, version: '1.0' },
    { id: 'cap-10', name: 'Batch Export', description: 'Bulk download artwork for offline caching', supported: true, enabled: true },
    { id: 'cap-11', name: 'Multi-language', description: 'Fetch localized artwork for different languages', supported: true, enabled: true },
    { id: 'cap-12', name: 'AI Upscaling', description: 'Server-side image upscaling for low-res artwork', supported: false, enabled: false },
  ],
  logs: [
    { id: 'log-1', timestamp: '2026-07-26T09:17:18Z', level: 'info', message: 'Artwork sync completed: 12,847 items', source: 'artwork-sync', details: '1 warning. 2m 18s total.' },
    { id: 'log-2', timestamp: '2026-07-26T09:16:45Z', level: 'warn', message: 'Rate limit approaching: 3,694 / 5,000 calls today', source: 'rate-limiter' },
    { id: 'log-3', timestamp: '2026-07-26T09:15:00Z', level: 'info', message: 'Scheduled artwork sync initiated', source: 'scheduler' },
    { id: 'log-4', timestamp: '2026-07-26T09:10:22Z', level: 'info', message: 'Cache cleanup: freed 340 MB (expired items)', source: 'cache-manager' },
    { id: 'log-5', timestamp: '2026-07-26T08:31:05Z', level: 'info', message: 'Metadata fetch completed for TV Show Logos (1,642 items)', source: 'metadata-fetch' },
    { id: 'log-6', timestamp: '2026-07-26T07:02:30Z', level: 'error', message: 'Batch download failed for Movie Fanart', source: 'batch-downloader', details: '8 items failed: HTTP 429 (rate limit exceeded). Retry scheduled in 60s.' },
    { id: 'log-7', timestamp: '2026-07-26T05:00:00Z', level: 'info', message: 'Nightly artwork sync completed', source: 'scheduler' },
    { id: 'log-8', timestamp: '2026-07-25T23:45:00Z', level: 'debug', message: 'Webhook received: artwork.updated', source: 'webhook-server', details: '{"type":"movie-poster","count":12}' },
    { id: 'log-9', timestamp: '2026-07-25T18:30:00Z', level: 'info', message: 'API key validated successfully', source: 'auth' },
    { id: 'log-10', timestamp: '2026-07-25T12:00:00Z', level: 'warn', message: 'Slow response from Fanart API: 2,340ms (threshold: 2,000ms)', source: 'api-client' },
  ],
  settings: {
    apiKey: 'fK9mNpQrStUvWxYzAbCdEf',
    apiUrl: 'https://webservice.fanart.tv/v3',
    timeout: 15,
    cacheEnabled: true,
    cacheTtlHours: 168,
    maxCacheSizeMb: 4096,
    autoFetch: true,
    fetchInterval: 3600,
    imageQuality: 'high',
    includeDlcs: false,
    fanartLanguage: 'en',
    rateLimitPerSecond: 4,
    retryOnFail: true,
    maxRetries: 3,
    notificationsEnabled: true,
    webhookEnabled: true,
    webhookUrl: 'https://kami-sama.app/api/webhooks/fanart',
  },
}
