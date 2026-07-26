export type ProviderStatus = 'connected' | 'disconnected' | 'error' | 'syncing'

export type JobStatus = 'completed' | 'running' | 'failed' | 'queued' | 'cancelled'
export type JobType = 'full-sync' | 'library-sync' | 'metadata-refresh' | 'scan' | 'repair'

export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

export interface ProviderInfo {
  id: string
  name: string
  slug: string
  type: 'plex' | 'jellyfin' | 'emby'
  status: ProviderStatus
  version: string
  url: string
  lastSyncAt: string | null
  libraryCount: number
  mediaCount: number
  uptime: string
}

export interface ProviderStats {
  totalLibraries: number
  activeLibraries: number
  totalMedia: number
  movies: number
  shows: number
  episodes: number
  music: number
  lastSyncDuration: string
  syncErrors: number
  storageUsed: string
  storageTotal: string
  bandwidthMbps: number
}

export interface ProviderLibrary {
  id: string
  name: string
  type: 'movie' | 'show' | 'music' | 'photo'
  enabled: boolean
  autoSync: boolean
  syncInterval: number
  mediaCount: number
  lastSyncAt: string | null
  lastSyncStatus: 'success' | 'partial' | 'failed' | null
  folder: string
  agent: string
  scanner: string
}

export interface SyncJob {
  id: string
  type: JobType
  status: JobStatus
  libraryId: string | null
  libraryName: string
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
  plexRatingKey: string
  plexTitle: string
  type: 'movie' | 'show' | 'episode' | 'season'
  externalIds: {
    tmdb?: string
    imdb?: string
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
  url: string
  token: string
  timeout: number
  sslVerification: boolean
  autoSync: boolean
  syncInterval: number
  syncOnStartup: boolean
  webhooksEnabled: boolean
  webhookUrl: string
  metadataRefreshDays: number
  maxConcurrentSyncs: number
  importProfiles: boolean
  importWatchHistory: boolean
  importRatings: boolean
  preferLocalMetadata: boolean
  scanAllLibraries: boolean
  notificationsEnabled: boolean
}

export interface PlexProviderData {
  provider: ProviderInfo
  stats: ProviderStats
  libraries: ProviderLibrary[]
  jobs: SyncJob[]
  mappings: MediaMapping[]
  capabilities: ProviderCapability[]
  logs: ProviderLog[]
  settings: ProviderSettings
}

export const plexProviderData: PlexProviderData = {
  provider: {
    id: 'plex-001',
    name: 'Plex Media Server',
    slug: 'plex',
    type: 'plex',
    status: 'connected',
    version: '1.40.1.8292',
    url: 'http://192.168.1.50:32400',
    lastSyncAt: '2026-07-26T10:30:00Z',
    libraryCount: 6,
    mediaCount: 4823,
    uptime: '14d 7h 23m',
  },
  stats: {
    totalLibraries: 6,
    activeLibraries: 5,
    totalMedia: 4823,
    movies: 1247,
    shows: 312,
    episodes: 3189,
    music: 75,
    lastSyncDuration: '4m 32s',
    syncErrors: 3,
    storageUsed: '8.2 TB',
    storageTotal: '12 TB',
    bandwidthMbps: 850,
  },
  libraries: [
    {
      id: 'lib-1',
      name: 'Anime',
      type: 'show',
      enabled: true,
      autoSync: true,
      syncInterval: 3600,
      mediaCount: 1842,
      lastSyncAt: '2026-07-26T10:30:00Z',
      lastSyncStatus: 'success',
      folder: '/media/anime',
      agent: 'Plex TV Series',
      scanner: 'Plex Series',
    },
    {
      id: 'lib-2',
      name: 'Movies',
      type: 'movie',
      enabled: true,
      autoSync: true,
      syncInterval: 7200,
      mediaCount: 1247,
      lastSyncAt: '2026-07-26T08:15:00Z',
      lastSyncStatus: 'success',
      folder: '/media/movies',
      agent: 'Plex Movie',
      scanner: 'Plex Movie',
    },
    {
      id: 'lib-3',
      name: 'TV Shows',
      type: 'show',
      enabled: true,
      autoSync: true,
      syncInterval: 3600,
      mediaCount: 968,
      lastSyncAt: '2026-07-26T09:45:00Z',
      lastSyncStatus: 'partial',
      folder: '/media/tv',
      agent: 'Plex TV Series',
      scanner: 'Plex Series',
    },
    {
      id: 'lib-4',
      name: 'Documentaries',
      type: 'movie',
      enabled: true,
      autoSync: false,
      syncInterval: 14400,
      mediaCount: 312,
      lastSyncAt: '2026-07-25T22:00:00Z',
      lastSyncStatus: 'success',
      folder: '/media/docs',
      agent: 'Plex Movie',
      scanner: 'Plex Movie',
    },
    {
      id: 'lib-5',
      name: 'Live Action Series',
      type: 'show',
      enabled: true,
      autoSync: true,
      syncInterval: 3600,
      mediaCount: 379,
      lastSyncAt: '2026-07-26T07:00:00Z',
      lastSyncStatus: 'success',
      folder: '/media/live-action',
      agent: 'Plex TV Series',
      scanner: 'Plex Series',
    },
    {
      id: 'lib-6',
      name: 'Music',
      type: 'music',
      enabled: false,
      autoSync: false,
      syncInterval: 86400,
      mediaCount: 75,
      lastSyncAt: null,
      lastSyncStatus: null,
      folder: '/media/music',
      agent: 'Plex Music',
      scanner: 'Plex Music',
    },
  ],
  jobs: [
    {
      id: 'job-1',
      type: 'full-sync',
      status: 'completed',
      libraryId: null,
      libraryName: 'All Libraries',
      startedAt: '2026-07-26T10:30:00Z',
      completedAt: '2026-07-26T10:34:32Z',
      progress: 100,
      itemsProcessed: 4823,
      itemsTotal: 4823,
      errors: 3,
      duration: '4m 32s',
      triggeredBy: 'scheduled',
    },
    {
      id: 'job-2',
      type: 'library-sync',
      status: 'running',
      libraryId: 'lib-1',
      libraryName: 'Anime',
      startedAt: '2026-07-26T11:00:00Z',
      completedAt: null,
      progress: 67,
      itemsProcessed: 1234,
      itemsTotal: 1842,
      errors: 0,
      duration: null,
      triggeredBy: 'manual',
    },
    {
      id: 'job-3',
      type: 'metadata-refresh',
      status: 'completed',
      libraryId: 'lib-2',
      libraryName: 'Movies',
      startedAt: '2026-07-26T08:00:00Z',
      completedAt: '2026-07-26T08:12:15Z',
      progress: 100,
      itemsProcessed: 1247,
      itemsTotal: 1247,
      errors: 0,
      duration: '12m 15s',
      triggeredBy: 'scheduled',
    },
    {
      id: 'job-4',
      type: 'scan',
      status: 'failed',
      libraryId: 'lib-3',
      libraryName: 'TV Shows',
      startedAt: '2026-07-26T06:00:00Z',
      completedAt: '2026-07-26T06:03:45Z',
      progress: 23,
      itemsProcessed: 223,
      itemsTotal: 968,
      errors: 12,
      duration: '3m 45s',
      triggeredBy: 'webhook',
    },
    {
      id: 'job-5',
      type: 'repair',
      status: 'queued',
      libraryId: 'lib-3',
      libraryName: 'TV Shows',
      startedAt: '2026-07-26T11:05:00Z',
      completedAt: null,
      progress: 0,
      itemsProcessed: 0,
      itemsTotal: 968,
      errors: 0,
      duration: null,
      triggeredBy: 'manual',
    },
    {
      id: 'job-6',
      type: 'full-sync',
      status: 'completed',
      libraryId: null,
      libraryName: 'All Libraries',
      startedAt: '2026-07-26T04:00:00Z',
      completedAt: '2026-07-26T04:04:10Z',
      progress: 100,
      itemsProcessed: 4823,
      itemsTotal: 4823,
      errors: 0,
      duration: '4m 10s',
      triggeredBy: 'scheduled',
    },
    {
      id: 'job-7',
      type: 'library-sync',
      status: 'cancelled',
      libraryId: 'lib-5',
      libraryName: 'Live Action Series',
      startedAt: '2026-07-25T20:00:00Z',
      completedAt: '2026-07-25T20:01:30Z',
      progress: 8,
      itemsProcessed: 30,
      itemsTotal: 379,
      errors: 0,
      duration: '1m 30s',
      triggeredBy: 'manual',
    },
  ],
  mappings: [
    {
      id: 'map-1',
      kamiId: 'ks-anime-001',
      kamiTitle: 'Neon Samurai',
      plexRatingKey: '52845',
      plexTitle: 'Neon Samurai',
      type: 'show',
      externalIds: { tmdb: '12345', tvdb: '98765', anilist: '21' },
      lastSyncedAt: '2026-07-26T10:30:00Z',
      matchScore: 100,
    },
    {
      id: 'map-2',
      kamiId: 'ks-anime-002',
      kamiTitle: 'Cyber Resonance',
      plexRatingKey: '52846',
      plexTitle: 'Cyber Resonance',
      type: 'show',
      externalIds: { tmdb: '12346', anilist: '22' },
      lastSyncedAt: '2026-07-26T10:30:00Z',
      matchScore: 100,
    },
    {
      id: 'map-3',
      kamiId: 'ks-movie-001',
      kamiTitle: 'Stellar Drift',
      plexRatingKey: '60112',
      plexTitle: 'Stellar Drift',
      type: 'movie',
      externalIds: { tmdb: '20001', imdb: 'tt1234567' },
      lastSyncedAt: '2026-07-26T08:15:00Z',
      matchScore: 100,
    },
    {
      id: 'map-4',
      kamiId: 'ks-anime-003',
      kamiTitle: 'Phantom Circuit',
      plexRatingKey: '52847',
      plexTitle: 'Phantom Circuit',
      type: 'show',
      externalIds: { anilist: '23', tvdb: '98766' },
      lastSyncedAt: '2026-07-26T10:30:00Z',
      matchScore: 95,
    },
    {
      id: 'map-5',
      kamiId: 'ks-anime-004',
      kamiTitle: 'Quantum Phase',
      plexRatingKey: '52848',
      plexTitle: 'Quantum Phase (2025)',
      type: 'show',
      externalIds: { tmdb: '12348', anilist: '24' },
      lastSyncedAt: '2026-07-26T10:30:00Z',
      matchScore: 88,
    },
    {
      id: 'map-6',
      kamiId: 'ks-movie-002',
      kamiTitle: 'Dark Horizon',
      plexRatingKey: '60113',
      plexTitle: 'Dark Horizon',
      type: 'movie',
      externalIds: { tmdb: '20002', imdb: 'tt2345678' },
      lastSyncedAt: '2026-07-26T08:15:00Z',
      matchScore: 100,
    },
    {
      id: 'map-7',
      kamiId: 'ks-ep-001',
      kamiTitle: 'S01E01 - Awakening',
      plexRatingKey: '73001',
      plexTitle: 'Awakening',
      type: 'episode',
      externalIds: { tmdb: '12345:1:1', tvdb: '98765:1:1' },
      lastSyncedAt: '2026-07-26T10:30:00Z',
      matchScore: 100,
    },
    {
      id: 'map-8',
      kamiId: 'ks-anime-005',
      kamiTitle: 'Ethereal Blade',
      plexRatingKey: '52849',
      plexTitle: 'Ethereal Blade',
      type: 'show',
      externalIds: { anilist: '25' },
      lastSyncedAt: '2026-07-25T10:00:00Z',
      matchScore: 72,
    },
  ],
  capabilities: [
    { id: 'cap-1', name: 'Library Scanning', description: 'Scan and discover media files in configured library folders', supported: true, enabled: true, version: '2.0' },
    { id: 'cap-2', name: 'Metadata Fetch', description: 'Retrieve metadata from Plex agents and external sources', supported: true, enabled: true, version: '2.0' },
    { id: 'cap-3', name: 'Watch Sync', description: 'Synchronize watch history and playback progress', supported: true, enabled: true },
    { id: 'cap-4', name: 'Transcode Control', description: 'Manage transcoding sessions and quality settings', supported: true, enabled: false },
    { id: 'cap-5', name: 'Live TV', description: 'Integration with Plex Live TV and DVR', supported: false, enabled: false },
    { id: 'cap-6', name: 'Downloads', description: 'Offline media download management', supported: true, enabled: true },
    { id: 'cap-7', name: 'Watchlist Sync', description: 'Synchronize Plex watchlist with Kami-Sama', supported: true, enabled: true },
    { id: 'cap-8', name: 'Rating Sync', description: 'Bidirectional sync of user ratings', supported: true, enabled: true },
    { id: 'cap-9', name: 'Collections', description: 'Sync and manage Plex collections', supported: true, enabled: true },
    { id: 'cap-10', name: 'Webhooks', description: 'Receive real-time event notifications from Plex', supported: true, enabled: true, version: '1.1' },
    { id: 'cap-11', name: 'Bandwidth Control', description: 'Monitor and limit streaming bandwidth', supported: true, enabled: false },
    { id: 'cap-12', name: 'Multi-server', description: 'Connect to multiple Plex server instances', supported: false, enabled: false },
  ],
  logs: [
    { id: 'log-1', timestamp: '2026-07-26T10:34:32Z', level: 'info', message: 'Full sync completed successfully', source: 'sync-engine', details: '4823 items processed in 4m 32s. 3 warnings.' },
    { id: 'log-2', timestamp: '2026-07-26T10:34:10Z', level: 'warn', message: 'Metadata mismatch for "Quantum Phase"', source: 'metadata-resolver', details: 'Plex title includes year suffix. Auto-corrected during mapping.' },
    { id: 'log-3', timestamp: '2026-07-26T10:33:55Z', level: 'info', message: 'Library "Anime" sync completed (1842 items)', source: 'library-sync' },
    { id: 'log-4', timestamp: '2026-07-26T10:33:20Z', level: 'warn', message: 'Duplicate entry detected: "Dark Horizon" exists in 2 libraries', source: 'dedup-engine' },
    { id: 'log-5', timestamp: '2026-07-26T10:32:45Z', level: 'error', message: 'Failed to fetch metadata for ratingKey 60200', source: 'metadata-resolver', details: 'Timeout after 30s. Plex server may be under heavy load.' },
    { id: 'log-6', timestamp: '2026-07-26T10:30:00Z', level: 'info', message: 'Scheduled full sync initiated', source: 'scheduler' },
    { id: 'log-7', timestamp: '2026-07-26T09:45:00Z', level: 'info', message: 'Library "TV Shows" partial sync started', source: 'library-sync' },
    { id: 'log-8', timestamp: '2026-07-26T08:15:00Z', level: 'info', message: 'Library "Movies" sync completed (1247 items)', source: 'library-sync' },
    { id: 'log-9', timestamp: '2026-07-26T06:03:45Z', level: 'error', message: 'Scan failed for "TV Shows" library', source: 'scanner', details: '12 files could not be read. Check disk permissions at /media/tv.' },
    { id: 'log-10', timestamp: '2026-07-26T04:00:00Z', level: 'info', message: 'Nightly full sync completed', source: 'scheduler' },
    { id: 'log-11', timestamp: '2026-07-25T22:00:00Z', level: 'debug', message: 'Webhook received: library.update', source: 'webhook-server', details: '{"libraryId":"lib-2","type":"scan"}' },
    { id: 'log-12', timestamp: '2026-07-25T20:01:30Z', level: 'warn', message: 'Sync cancelled by user for "Live Action Series"', source: 'sync-engine' },
  ],
  settings: {
    url: 'http://192.168.1.50:32400',
    token: 'xK9mNpQrStUvWxYz',
    timeout: 30,
    sslVerification: false,
    autoSync: true,
    syncInterval: 3600,
    syncOnStartup: true,
    webhooksEnabled: true,
    webhookUrl: 'https://kami-sama.app/api/webhooks/plex',
    metadataRefreshDays: 7,
    maxConcurrentSyncs: 2,
    importProfiles: true,
    importWatchHistory: true,
    importRatings: true,
    preferLocalMetadata: false,
    scanAllLibraries: true,
    notificationsEnabled: true,
  },
}
