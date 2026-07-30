export type SyncStatus = 'completed' | 'running' | 'failed' | 'queued' | 'paused' | 'cancelled'

export type SyncType = 'full-sync' | 'metadata' | 'artwork' | 'episodes' | 'subtitles' | 'watchlist' | 'ratings' | 'collections'

export type SyncDirection = 'push' | 'pull' | 'bidirectional'

export type SyncProvider = 'tmdb' | 'tvdb' | 'mal' | 'jellyfin' | 'fanart' | 'trakt' | 'simkl' | 'anilist'

export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

export type MediaType = 'movie' | 'series' | 'anime' | 'episode' | 'season'

export interface SyncProviderStatus {
  id: string
  provider: SyncProvider
  connected: boolean
  lastSyncAt: string | null
  nextSyncAt: string | null
  pendingChanges: number
  syncErrors: number
  apiKeyValid: boolean
}

export interface SyncPipeline {
  id: string
  name: string
  description: string
  source: SyncProvider
  target: SyncProvider
  type: SyncType
  direction: SyncDirection
  enabled: boolean
  autoSync: boolean
  syncInterval: number
  lastRunAt: string | null
  lastStatus: SyncStatus | null
  totalSynced: number
  pendingItems: number
}

export interface SyncJob {
  id: string
  pipelineId: string
  pipelineName: string
  type: SyncType
  direction: SyncDirection
  source: SyncProvider
  target: SyncProvider
  status: SyncStatus
  startedAt: string
  completedAt: string | null
  progress: number
  itemsProcessed: number
  itemsTotal: number
  itemsCreated: number
  itemsUpdated: number
  itemsSkipped: number
  itemsFailed: number
  errors: number
  duration: string | null
  triggeredBy: 'manual' | 'scheduled' | 'webhook' | 'api'
  bandwidth: string | null
}

export interface SyncConflict {
  id: string
  pipelineId: string
  pipelineName: string
  mediaTitle: string
  mediaType: MediaType
  sourceValue: string
  targetValue: string
  conflictType: 'metadata' | 'rating' | 'watchlist' | 'collection'
  detectedAt: string
  resolvedAt: string | null
  resolution: 'source-wins' | 'target-wins' | 'manual' | 'merged' | null
}

export interface SyncStats {
  totalSyncs: number
  successfulSyncs: number
  failedSyncs: number
  totalItemsSynced: number
  totalBandwidth: string
  averageSyncDuration: string
  lastSyncAt: string | null
  syncsToday: number
  syncsThisWeek: number
  conflictsDetected: number
  conflictsResolved: number
  pipelinesActive: number
}

export interface SyncLog {
  id: string
  timestamp: string
  level: LogLevel
  message: string
  pipelineId: string
  source: string
  details?: string
}

export interface SynchronizationData {
  providerStatuses: SyncProviderStatus[]
  pipelines: SyncPipeline[]
  jobs: SyncJob[]
  conflicts: SyncConflict[]
  stats: SyncStats
  logs: SyncLog[]
}

export const synchronizationData: SynchronizationData = {
  providerStatuses: [
    { id: 'ps-1', provider: 'tmdb', connected: true, lastSyncAt: '2026-07-26T09:15:00Z', nextSyncAt: '2026-07-26T10:15:00Z', pendingChanges: 12, syncErrors: 0, apiKeyValid: true },
    { id: 'ps-2', provider: 'tvdb', connected: true, lastSyncAt: '2026-07-26T09:00:00Z', nextSyncAt: '2026-07-26T10:00:00Z', pendingChanges: 8, syncErrors: 0, apiKeyValid: true },
    { id: 'ps-3', provider: 'mal', connected: true, lastSyncAt: '2026-07-26T08:30:00Z', nextSyncAt: '2026-07-26T09:30:00Z', pendingChanges: 5, syncErrors: 1, apiKeyValid: true },
    { id: 'ps-4', provider: 'jellyfin', connected: true, lastSyncAt: '2026-07-26T08:00:00Z', nextSyncAt: '2026-07-26T09:00:00Z', pendingChanges: 0, syncErrors: 0, apiKeyValid: true },
    { id: 'ps-5', provider: 'fanart', connected: true, lastSyncAt: '2026-07-26T07:30:00Z', nextSyncAt: '2026-07-26T08:30:00Z', pendingChanges: 3, syncErrors: 0, apiKeyValid: true },
    { id: 'ps-6', provider: 'trakt', connected: false, lastSyncAt: '2026-07-25T22:00:00Z', nextSyncAt: null, pendingChanges: 0, syncErrors: 3, apiKeyValid: false },
    { id: 'ps-7', provider: 'simkl', connected: false, lastSyncAt: null, nextSyncAt: null, pendingChanges: 0, syncErrors: 0, apiKeyValid: false },
    { id: 'ps-8', provider: 'anilist', connected: true, lastSyncAt: '2026-07-26T06:00:00Z', nextSyncAt: '2026-07-26T07:00:00Z', pendingChanges: 15, syncErrors: 0, apiKeyValid: true },
  ],
  pipelines: [
    { id: 'pl-1', name: 'TMDB → Jellyfin Metadata', description: 'Sync movie and series metadata from TMDB to Jellyfin', source: 'tmdb', target: 'jellyfin', type: 'metadata', direction: 'push', enabled: true, autoSync: true, syncInterval: 3600, lastRunAt: '2026-07-26T09:15:00Z', lastStatus: 'completed', totalSynced: 3456, pendingItems: 12, errors: 0 },
    { id: 'pl-2', name: 'Jellyfin → TMDB Ratings', description: 'Push user ratings from Jellyfin to TMDB', source: 'jellyfin', target: 'tmdb', type: 'ratings', direction: 'push', enabled: true, autoSync: true, syncInterval: 7200, lastRunAt: '2026-07-26T08:00:00Z', lastStatus: 'completed', totalSynced: 234, pendingItems: 5, errors: 0 },
    { id: 'pl-3', name: 'MAL ↔ Anilist Anime', description: 'Bidirectional sync of anime watchlist between MAL and Anilist', source: 'mal', target: 'anilist', type: 'watchlist', direction: 'bidirectional', enabled: true, autoSync: true, syncInterval: 1800, lastRunAt: '2026-07-26T08:30:00Z', lastStatus: 'completed', totalSynced: 456, pendingItems: 8, errors: 1 },
    { id: 'pl-4', name: 'Fanart → Jellyfin Artwork', description: 'Pull artwork from Fanart.tv to Jellyfin', source: 'fanart', target: 'jellyfin', type: 'artwork', direction: 'pull', enabled: true, autoSync: true, syncInterval: 86400, lastRunAt: '2026-07-26T07:30:00Z', lastStatus: 'completed', totalSynced: 1234, pendingItems: 3, errors: 0 },
    { id: 'pl-5', name: 'TVDB → Jellyfin Episodes', description: 'Sync episode data from TVDB to Jellyfin', source: 'tvdb', target: 'jellyfin', type: 'episodes', direction: 'push', enabled: true, autoSync: true, syncInterval: 3600, lastRunAt: '2026-07-26T09:00:00Z', lastStatus: 'completed', totalSynced: 18234, pendingItems: 8, errors: 0 },
    { id: 'pl-6', name: 'Jellyfin → Trakt Watchlist', description: 'Push watchlist from Jellyfin to Trakt', source: 'jellyfin', target: 'trakt', type: 'watchlist', direction: 'push', enabled: false, autoSync: false, syncInterval: 3600, lastRunAt: '2026-07-25T22:00:00Z', lastStatus: 'failed', totalSynced: 89, pendingItems: 0, errors: 3 },
    { id: 'pl-7', name: 'MAL → Jellyfin Collections', description: 'Sync anime collections from MAL to Jellyfin', source: 'mal', target: 'jellyfin', type: 'collections', direction: 'push', enabled: true, autoSync: true, syncInterval: 7200, lastRunAt: '2026-07-26T06:00:00Z', lastStatus: 'completed', totalSynced: 67, pendingItems: 2, errors: 0 },
    { id: 'pl-8', name: 'TMDB → Anilist Metadata', description: 'Sync anime metadata from TMDB to Anilist', source: 'tmdb', target: 'anilist', type: 'metadata', direction: 'push', enabled: true, autoSync: false, syncInterval: 14400, lastRunAt: '2026-07-25T18:00:00Z', lastStatus: 'completed', totalSynced: 234, pendingItems: 15, errors: 0 },
  ],
  jobs: [
    { id: 'sj-1', pipelineId: 'pl-1', pipelineName: 'TMDB → Jellyfin Metadata', type: 'metadata', direction: 'push', source: 'tmdb', target: 'jellyfin', status: 'completed', startedAt: '2026-07-26T09:15:00Z', completedAt: '2026-07-26T09:18:42Z', progress: 100, itemsProcessed: 3456, itemsTotal: 3456, itemsCreated: 12, itemsUpdated: 45, itemsSkipped: 3399, itemsFailed: 0, errors: 0, duration: '3m 42s', triggeredBy: 'scheduled', bandwidth: '45 MB' },
    { id: 'sj-2', pipelineId: 'pl-3', pipelineName: 'MAL ↔ Anilist Anime', type: 'watchlist', direction: 'bidirectional', source: 'mal', target: 'anilist', status: 'running', startedAt: '2026-07-26T09:20:00Z', completedAt: null, progress: 65, itemsProcessed: 296, itemsTotal: 456, itemsCreated: 8, itemsUpdated: 23, itemsSkipped: 265, itemsFailed: 0, errors: 0, duration: null, triggeredBy: 'manual', bandwidth: null },
    { id: 'sj-3', pipelineId: 'pl-5', pipelineName: 'TVDB → Jellyfin Episodes', type: 'episodes', direction: 'push', source: 'tvdb', target: 'jellyfin', status: 'completed', startedAt: '2026-07-26T09:00:00Z', completedAt: '2026-07-26T09:05:15Z', progress: 100, itemsProcessed: 18234, itemsTotal: 18234, itemsCreated: 24, itemsUpdated: 89, itemsSkipped: 18121, itemsFailed: 0, errors: 0, duration: '5m 15s', triggeredBy: 'scheduled', bandwidth: '123 MB' },
    { id: 'sj-4', pipelineId: 'pl-4', pipelineName: 'Fanart → Jellyfin Artwork', type: 'artwork', direction: 'pull', source: 'fanart', target: 'jellyfin', status: 'queued', startedAt: '2026-07-26T09:30:00Z', completedAt: null, progress: 0, itemsProcessed: 0, itemsTotal: 1234, itemsCreated: 0, itemsUpdated: 0, itemsSkipped: 0, itemsFailed: 0, errors: 0, duration: null, triggeredBy: 'manual', bandwidth: null },
    { id: 'sj-5', pipelineId: 'pl-2', pipelineName: 'Jellyfin → TMDB Ratings', type: 'ratings', direction: 'push', source: 'jellyfin', target: 'tmdb', status: 'completed', startedAt: '2026-07-26T08:00:00Z', completedAt: '2026-07-26T08:02:30Z', progress: 100, itemsProcessed: 234, itemsTotal: 234, itemsCreated: 0, itemsUpdated: 234, itemsSkipped: 0, itemsFailed: 0, errors: 0, duration: '2m 30s', triggeredBy: 'scheduled', bandwidth: '2 MB' },
    { id: 'sj-6', pipelineId: 'pl-6', pipelineName: 'Jellyfin → Trakt Watchlist', type: 'watchlist', direction: 'push', source: 'jellyfin', target: 'trakt', status: 'failed', startedAt: '2026-07-25T22:00:00Z', completedAt: '2026-07-25T22:05:00Z', progress: 35, itemsProcessed: 31, itemsTotal: 89, itemsCreated: 0, itemsUpdated: 31, itemsSkipped: 0, itemsFailed: 58, errors: 3, duration: '5m 0s', triggeredBy: 'scheduled', bandwidth: null },
    { id: 'sj-7', pipelineId: 'pl-7', pipelineName: 'MAL → Jellyfin Collections', type: 'collections', direction: 'push', source: 'mal', target: 'jellyfin', status: 'completed', startedAt: '2026-07-26T06:00:00Z', completedAt: '2026-07-26T06:01:45Z', progress: 100, itemsProcessed: 67, itemsTotal: 67, itemsCreated: 3, itemsUpdated: 12, itemsSkipped: 52, itemsFailed: 0, errors: 0, duration: '1m 45s', triggeredBy: 'scheduled', bandwidth: '1 MB' },
    { id: 'sj-8', pipelineId: 'pl-8', pipelineName: 'TMDB → Anilist Metadata', type: 'metadata', direction: 'push', source: 'tmdb', target: 'anilist', status: 'completed', startedAt: '2026-07-25T18:00:00Z', completedAt: '2026-07-25T18:04:20Z', progress: 100, itemsProcessed: 234, itemsTotal: 234, itemsCreated: 15, itemsUpdated: 34, itemsSkipped: 185, itemsFailed: 0, errors: 0, duration: '4m 20s', triggeredBy: 'api', bandwidth: '3 MB' },
  ],
  conflicts: [
    { id: 'cf-1', pipelineId: 'pl-3', pipelineName: 'MAL ↔ Anilist Anime', mediaTitle: 'Phantom Circuit', mediaType: 'anime', sourceValue: 'Score: 9/10', targetValue: 'Score: 8/10', conflictType: 'rating', detectedAt: '2026-07-26T09:22:00Z', resolvedAt: null, resolution: null },
    { id: 'cf-2', pipelineId: 'pl-1', pipelineName: 'TMDB → Jellyfin Metadata', mediaTitle: 'Neon Samurai: Origins', mediaType: 'movie', sourceValue: 'Title: Neon Samurai: Origins (2025)', targetValue: 'Title: Neon Samurai (2025)', conflictType: 'metadata', detectedAt: '2026-07-26T09:16:00Z', resolvedAt: '2026-07-26T09:16:30Z', resolution: 'source-wins' },
    { id: 'cf-3', pipelineId: 'pl-6', pipelineName: 'Jellyfin → Trakt Watchlist', mediaTitle: 'Cyber Resonance S2', mediaType: 'series', sourceValue: 'Watchlist: true', targetValue: 'Watchlist: false', conflictType: 'watchlist', detectedAt: '2026-07-25T22:02:00Z', resolvedAt: null, resolution: null },
    { id: 'cf-4', pipelineId: 'pl-2', pipelineName: 'Jellyfin → TMDB Ratings', mediaTitle: 'Midnight Protocol', mediaType: 'series', sourceValue: 'Rating: 8.5', targetValue: 'Rating: 8.8', conflictType: 'rating', detectedAt: '2026-07-26T08:01:00Z', resolvedAt: '2026-07-26T08:01:45Z', resolution: 'manual' },
    { id: 'cf-5', pipelineId: 'pl-7', pipelineName: 'MAL → Jellyfin Collections', mediaTitle: 'Void Walker', mediaType: 'anime', sourceValue: 'Collection: Favorites', targetValue: 'Collection: None', conflictType: 'collection', detectedAt: '2026-07-26T06:00:30Z', resolvedAt: '2026-07-26T06:01:00Z', resolution: 'source-wins' },
  ],
  stats: {
    totalSyncs: 8923,
    successfulSyncs: 8845,
    failedSyncs: 78,
    totalItemsSynced: 345678,
    totalBandwidth: '12.8 GB',
    averageSyncDuration: '3m 45s',
    lastSyncAt: '2026-07-26T09:18:42Z',
    syncsToday: 45,
    syncsThisWeek: 312,
    conflictsDetected: 234,
    conflictsResolved: 219,
    pipelinesActive: 6,
  },
  logs: [
    { id: 'sl-1', timestamp: '2026-07-26T09:18:42Z', level: 'info', message: 'Pipeline completed: TMDB → Jellyfin Metadata (3,456 items)', pipelineId: 'pl-1', source: 'tmdb', details: '12 created, 45 updated. 3m 42s. 45 MB.' },
    { id: 'sl-2', timestamp: '2026-07-26T09:20:00Z', level: 'info', message: 'Pipeline started: MAL ↔ Anilist Anime', pipelineId: 'pl-3', source: 'mal', details: '456 items to sync.' },
    { id: 'sl-3', timestamp: '2026-07-26T09:15:00Z', level: 'info', message: 'Scheduled sync triggered for all active pipelines', pipelineId: 'global', source: 'scheduler' },
    { id: 'sl-4', timestamp: '2026-07-26T09:05:15Z', level: 'info', message: 'Pipeline completed: TVDB → Jellyfin Episodes (18,234 items)', pipelineId: 'pl-5', source: 'tvdb', details: '24 created, 89 updated. 5m 15s.' },
    { id: 'sl-5', timestamp: '2026-07-26T08:30:00Z', level: 'info', message: 'Pipeline completed: MAL ↔ Anilist Anime (456 items)', pipelineId: 'pl-3', source: 'mal', details: '8 created, 23 updated. 1 warning.' },
    { id: 'sl-6', timestamp: '2026-07-26T08:02:30Z', level: 'info', message: 'Pipeline completed: Jellyfin → TMDB Ratings (234 items)', pipelineId: 'pl-2', source: 'jellyfin', details: '234 ratings pushed. 2m 30s.' },
    { id: 'sl-7', timestamp: '2026-07-26T07:30:00Z', level: 'info', message: 'Pipeline completed: Fanart → Jellyfin Artwork (1,234 items)', pipelineId: 'pl-4', source: 'fanart', details: '15 created, 67 updated. 8m 45s.' },
    { id: 'sl-8', timestamp: '2026-07-25T22:05:00Z', level: 'error', message: 'Pipeline failed: Jellyfin → Trakt Watchlist', pipelineId: 'pl-6', source: 'jellyfin', details: '3 errors: Trakt API rate limit exceeded. 58 items failed. 35% completed.' },
    { id: 'sl-9', timestamp: '2026-07-26T06:01:45Z', level: 'info', message: 'Pipeline completed: MAL → Jellyfin Collections (67 items)', pipelineId: 'pl-7', source: 'mal', details: '3 created, 12 updated. 1m 45s.' },
    { id: 'sl-10', timestamp: '2026-07-25T18:04:20Z', level: 'info', message: 'Pipeline completed: TMDB → Anilist Metadata (234 items)', pipelineId: 'pl-8', source: 'tmdb', details: '15 created, 34 updated. 4m 20s.' },
  ],
}
