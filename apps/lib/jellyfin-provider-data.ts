export type ProviderStatus = 'connected' | 'disconnected' | 'error' | 'syncing'

export type JobStatus = 'completed' | 'running' | 'failed' | 'queued' | 'cancelled'
export type JobType = 'library-scan' | 'metadata-fetch' | 'image-download' | 'transcode-prep' | 'cleanup'

export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

export type MediaType = 'movie' | 'series' | 'episode' | 'season' | 'music' | 'book'

export type LibraryType = 'movies' | 'series' | 'music' | 'books' | 'mixed'

export interface ProviderInfo {
  id: string
  name: string
  slug: string
  type: 'jellyfin'
  status: ProviderStatus
  version: string
  apiUrl: string
  lastSyncAt: string | null
  serverVersion: string
  apiKeyValid: boolean
}

export interface ProviderStats {
  totalItems: number
  movies: number
  series: number
  episodes: number
  musicTracks: number
  totalUsers: number
  activeStreams: number
  storageUsed: string
  storageTotal: string
  bandwidthToday: string
  transcodingJobs: number
  syncErrors: number
  lastScanDuration: string
  apiCallsToday: number
  apiCallsLimit: number
  averageResponseMs: number
}

export interface MediaLibrary {
  id: string
  name: string
  type: LibraryType
  itemCount: number
  lastScannedAt: string | null
  enabled: boolean
  autoScan: boolean
  monitored: boolean
  path: string
  size: string
}

export interface SyncJob {
  id: string
  type: JobType
  status: JobStatus
  library: string | null
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
  jellyfinId: string
  mediaType: MediaType
  year: number
  rating: number
  externalIds: {
    imdb?: string
    tmdb?: string
    tvdb?: string
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
  autoScan: boolean
  scanInterval: number
  syncMetadata: boolean
  syncImages: boolean
  transcodeOnSync: boolean
  language: string
  maxBitrate: number
  retryOnFail: boolean
  maxRetries: number
  notificationsEnabled: boolean
  webhookEnabled: boolean
  webhookUrl: string
  enableLiveTv: boolean
  enableDownloads: boolean
  hardwareAcceleration: boolean
  hardwareDevice: string
}

export interface JellyfinProviderData {
  provider: ProviderInfo
  stats: ProviderStats
  libraries: MediaLibrary[]
  jobs: SyncJob[]
  mappings: MediaMapping[]
  capabilities: ProviderCapability[]
  logs: ProviderLog[]
  settings: ProviderSettings
}

export const jellyfinProviderData: JellyfinProviderData = {
  provider: {
    id: 'jellyfin-001',
    name: 'Jellyfin',
    slug: 'jellyfin',
    type: 'jellyfin',
    status: 'connected',
    version: 'API v10.9',
    apiUrl: 'https://media.kami-sama.app',
    lastSyncAt: '2026-07-26T08:30:00Z',
    serverVersion: '10.9.7',
    apiKeyValid: true,
  },
  stats: {
    totalItems: 24891,
    movies: 3456,
    series: 892,
    episodes: 18234,
    musicTracks: 2309,
    totalUsers: 8,
    activeStreams: 3,
    storageUsed: '4.2 TB',
    storageTotal: '8 TB',
    bandwidthToday: '128.5 GB',
    transcodingJobs: 1,
    syncErrors: 0,
    lastScanDuration: '12m 45s',
    apiCallsToday: 1247,
    apiCallsLimit: 50000,
    averageResponseMs: 23,
  },
  libraries: [
    { id: 'lib-1', name: 'Films', type: 'movies', itemCount: 3456, lastScannedAt: '2026-07-26T08:30:00Z', enabled: true, autoScan: true, monitored: true, path: '/media/movies', size: '2.8 TB' },
    { id: 'lib-2', name: 'Séries TV', type: 'series', itemCount: 18234, lastScannedAt: '2026-07-26T08:30:00Z', enabled: true, autoScan: true, monitored: true, path: '/media/tv', size: '1.1 TB' },
    { id: 'lib-3', name: 'Anime', type: 'series', itemCount: 4523, lastScannedAt: '2026-07-26T07:00:00Z', enabled: true, autoScan: true, monitored: true, path: '/media/anime', size: '210 GB' },
    { id: 'lib-4', name: 'Musique', type: 'music', itemCount: 2309, lastScannedAt: '2026-07-25T22:00:00Z', enabled: true, autoScan: false, monitored: true, path: '/media/music', size: '18 GB' },
    { id: 'lib-5', name: 'Concerts', type: 'movies', itemCount: 156, lastScannedAt: '2026-07-20T10:00:00Z', enabled: true, autoScan: false, monitored: false, path: '/media/concerts', size: '89 GB' },
    { id: 'lib-6', name: 'Documents', type: 'books', itemCount: 213, lastScannedAt: '2026-07-18T14:00:00Z', enabled: false, autoScan: false, monitored: false, path: '/media/docs', size: '4 GB' },
  ],
  jobs: [
    { id: 'job-1', type: 'library-scan', status: 'completed', library: 'Films', startedAt: '2026-07-26T08:30:00Z', completedAt: '2026-07-26T08:35:12Z', progress: 100, itemsProcessed: 3456, itemsTotal: 3456, errors: 0, duration: '5m 12s', triggeredBy: 'scheduled' },
    { id: 'job-2', type: 'metadata-fetch', status: 'running', library: 'Séries TV', startedAt: '2026-07-26T08:40:00Z', completedAt: null, progress: 67, itemsProcessed: 12217, itemsTotal: 18234, errors: 0, duration: null, triggeredBy: 'manual' },
    { id: 'job-3', type: 'image-download', status: 'completed', library: 'Anime', startedAt: '2026-07-26T07:00:00Z', completedAt: '2026-07-26T07:08:30Z', progress: 100, itemsProcessed: 4523, itemsTotal: 4523, errors: 0, duration: '8m 30s', triggeredBy: 'scheduled' },
    { id: 'job-4', type: 'transcode-prep', status: 'queued', library: null, startedAt: '2026-07-26T09:00:00Z', completedAt: null, progress: 0, itemsProcessed: 0, itemsTotal: 15, errors: 0, duration: null, triggeredBy: 'webhook' },
    { id: 'job-5', type: 'cleanup', status: 'completed', library: null, startedAt: '2026-07-26T06:00:00Z', completedAt: '2026-07-26T06:02:15Z', progress: 100, itemsProcessed: 0, itemsTotal: 0, errors: 0, duration: '2m 15s', triggeredBy: 'scheduled' },
  ],
  mappings: [
    { id: 'map-1', kamiId: 'ks-movie-001', kamiTitle: 'Neon Samurai: Origins', jellyfinId: 'jf-movie-4521', mediaType: 'movie', year: 2025, rating: 8.7, externalIds: { imdb: 'tt1234567', tmdb: '11223' }, lastSyncedAt: '2026-07-26T08:30:00Z', matchScore: 100 },
    { id: 'map-2', kamiId: 'ks-series-001', kamiTitle: 'Cyber Resonance', jellyfinId: 'jf-series-6789', mediaType: 'series', year: 2024, rating: 9.1, externalIds: { tvdb: '45679', anilist: '22' }, lastSyncedAt: '2026-07-26T08:30:00Z', matchScore: 98 },
    { id: 'map-3', kamiId: 'ks-anime-001', kamiTitle: 'Phantom Circuit', jellyfinId: 'jf-series-7890', mediaType: 'series', year: 2023, rating: 8.9, externalIds: { anilist: '23' }, lastSyncedAt: '2026-07-25T09:00:00Z', matchScore: 95 },
    { id: 'map-4', kamiId: 'ks-movie-002', kamiTitle: 'Quantum Phase', jellyfinId: 'jf-movie-5678', mediaType: 'movie', year: 2024, rating: 8.2, externalIds: { tmdb: '11225', imdb: 'tt7654321' }, lastSyncedAt: '2026-07-26T08:30:00Z', matchScore: 100 },
    { id: 'map-5', kamiId: 'ks-series-002', kamiTitle: 'Midnight Protocol', jellyfinId: 'jf-series-8901', mediaType: 'series', year: 2025, rating: 8.8, externalIds: { tmdb: '22334', tvdb: '45682' }, lastSyncedAt: '2026-07-26T08:30:00Z', matchScore: 97 },
    { id: 'map-6', kamiId: 'ks-music-001', kamiTitle: 'Synthwave Dreams Vol.1', jellyfinId: 'jf-music-1122', mediaType: 'music', year: 2024, rating: 8.5, externalIds: {}, lastSyncedAt: '2026-07-25T22:00:00Z', matchScore: 100 },
  ],
  capabilities: [
    { id: 'cap-1', name: 'Library Scanning', description: 'Scan and index media libraries automatically', supported: true, enabled: true, version: '10.9' },
    { id: 'cap-2', name: 'Metadata Sync', description: 'Sync metadata from external providers', supported: true, enabled: true },
    { id: 'cap-3', name: 'Image Download', description: 'Download posters, backdrops, and thumbnails', supported: true, enabled: true },
    { id: 'cap-4', name: 'Transcoding', description: 'Hardware-accelerated transcoding', supported: true, enabled: true, version: 'VAAPI' },
    { id: 'cap-5', name: 'Live TV', description: 'Live TV and DVR support', supported: true, enabled: false },
    { id: 'cap-6', name: 'Multi-User', description: 'Multi-user support with parental controls', supported: true, enabled: true },
    { id: 'cap-7', name: 'Sync Play', description: 'Synchronized playback across devices', supported: true, enabled: true },
    { id: 'cap-8', name: 'Downloads', description: 'Offline media downloads for mobile', supported: true, enabled: true },
    { id: 'cap-9', name: 'Lyrics', description: 'Automatic lyrics fetching', supported: true, enabled: false },
    { id: 'cap-10', name: 'Subtitles', description: 'Automatic subtitle downloading', supported: true, enabled: true },
    { id: 'cap-11', name: 'Collections', description: 'Smart collections and playlists', supported: true, enabled: true },
    { id: 'cap-12', name: 'Plugins', description: 'Third-party plugin ecosystem', supported: true, enabled: true, version: '42 installed' },
  ],
  logs: [
    { id: 'log-1', timestamp: '2026-07-26T08:35:12Z', level: 'info', message: 'Library scan completed: Films (3,456 items)', source: 'library-scanner', details: '0 errors. 5m 12s total.' },
    { id: 'log-2', timestamp: '2026-07-26T08:30:00Z', level: 'info', message: 'Scheduled library scan initiated', source: 'scheduler' },
    { id: 'log-3', timestamp: '2026-07-26T08:28:00Z', level: 'info', message: 'Active streams: 3 (2 direct, 1 transcoding)', source: 'session-manager' },
    { id: 'log-4', timestamp: '2026-07-26T08:00:00Z', level: 'info', message: 'Bandwidth usage today: 128.5 GB', source: 'network-monitor' },
    { id: 'log-5', timestamp: '2026-07-26T07:08:30Z', level: 'info', message: 'Image download completed: Anime (4,523 items)', source: 'image-fetcher' },
    { id: 'log-6', timestamp: '2026-07-26T06:00:00Z', level: 'info', message: 'Cache cleanup: freed 12.3 GB', source: 'cache-manager' },
    { id: 'log-7', timestamp: '2026-07-26T05:30:00Z', level: 'info', message: 'Transcoding session started: Neon Samurai: Origins (H.265 → H.264)', source: 'transcoder' },
    { id: 'log-8', timestamp: '2026-07-26T03:00:00Z', level: 'info', message: 'Nightly metadata sync completed', source: 'scheduler' },
    { id: 'log-9', timestamp: '2026-07-25T22:00:00Z', level: 'info', message: 'Music library scan completed: Musique (2,309 tracks)', source: 'library-scanner' },
    { id: 'log-10', timestamp: '2026-07-25T18:30:00Z', level: 'warn', message: 'Slow transcoding detected: session jf-sess-4521 exceeded 120% CPU', source: 'transcoder' },
  ],
  settings: {
    apiKey: 'jf_xK9mNpQrStUvWxYzAbCdEf',
    apiUrl: 'https://media.kami-sama.app',
    timeout: 30,
    cacheEnabled: true,
    cacheTtlHours: 24,
    maxCacheSizeMb: 4096,
    autoScan: true,
    scanInterval: 3600,
    syncMetadata: true,
    syncImages: true,
    transcodeOnSync: false,
    language: 'fr',
    maxBitrate: 100000,
    retryOnFail: true,
    maxRetries: 3,
    notificationsEnabled: true,
    webhookEnabled: true,
    webhookUrl: 'https://kami-sama.app/api/webhooks/jellyfin',
    enableLiveTv: false,
    enableDownloads: true,
    hardwareAcceleration: true,
    hardwareDevice: 'VAAPI',
  },
}
