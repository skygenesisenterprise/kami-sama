export type ImportStatus = 'completed' | 'running' | 'failed' | 'queued' | 'cancelled'

export type ImportType = 'metadata' | 'artwork' | 'episode' | 'subtitle' | 'trailer' | 'audio' | 'full-sync'

export type ImportSource = 'tmdb' | 'tvdb' | 'mal' | 'jellyfin' | 'fanart' | 'manual' | 'auto'

export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

export type MediaType = 'movie' | 'series' | 'anime' | 'episode' | 'season'

export interface ImportJob {
  id: string
  type: ImportType
  source: ImportSource
  status: ImportStatus
  mediaType: MediaType
  title: string
  externalId: string
  startedAt: string
  completedAt: string | null
  progress: number
  itemsProcessed: number
  itemsTotal: number
  errors: number
  duration: string | null
  triggeredBy: 'manual' | 'scheduled' | 'webhook' | 'api'
  fileSize: string | null
  bandwidth: string | null
}

export interface ImportStats {
  totalImports: number
  successfulImports: number
  failedImports: number
  totalItemsProcessed: number
  totalBandwidth: string
  averageDuration: string
  lastImportAt: string | null
  importsToday: number
  importsThisWeek: number
  importsThisMonth: number
  successRate: number
  mostActiveSource: ImportSource
}

export interface ImportFilter {
  sources: ImportSource[]
  types: ImportType[]
  statuses: ImportStatus[]
  mediaTypes: MediaType[]
  dateRange: {
    from: string | null
    to: string | null
  }
}

export interface ImportLog {
  id: string
  timestamp: string
  level: LogLevel
  message: string
  source: string
  jobId: string
  details?: string
}

export interface ImportHistoryData {
  stats: ImportStats
  jobs: ImportJob[]
  logs: ImportLog[]
}

export const importHistoryData: ImportHistoryData = {
  stats: {
    totalImports: 12847,
    successfulImports: 12691,
    failedImports: 156,
    totalItemsProcessed: 892341,
    totalBandwidth: '2.4 TB',
    averageDuration: '4m 23s',
    lastImportAt: '2026-07-26T09:15:00Z',
    importsToday: 342,
    importsThisWeek: 2156,
    importsThisMonth: 8923,
    successRate: 98.8,
    mostActiveSource: 'tmdb',
  },
  jobs: [
    { id: 'imp-1', type: 'full-sync', source: 'tmdb', status: 'completed', mediaType: 'movie', title: 'Neon Samurai: Origins', externalId: 'tmdb-11223', startedAt: '2026-07-26T09:15:00Z', completedAt: '2026-07-26T09:18:42Z', progress: 100, itemsProcessed: 24, itemsTotal: 24, errors: 0, duration: '3m 42s', triggeredBy: 'manual', fileSize: '156 MB', bandwidth: '156 MB' },
    { id: 'imp-2', type: 'artwork', source: 'fanart', status: 'running', mediaType: 'series', title: 'Cyber Resonance', externalId: 'fanart-45679', startedAt: '2026-07-26T09:20:00Z', completedAt: null, progress: 78, itemsProcessed: 156, itemsTotal: 200, errors: 0, duration: null, triggeredBy: 'scheduled', fileSize: null, bandwidth: null },
    { id: 'imp-3', type: 'episode', source: 'tvdb', status: 'completed', mediaType: 'series', title: 'Midnight Protocol', externalId: 'tvdb-45682', startedAt: '2026-07-26T08:30:00Z', completedAt: '2026-07-26T08:35:15Z', progress: 100, itemsProcessed: 10, itemsTotal: 10, errors: 0, duration: '5m 15s', triggeredBy: 'manual', fileSize: '89 MB', bandwidth: '89 MB' },
    { id: 'imp-4', type: 'metadata', source: 'mal', status: 'completed', mediaType: 'anime', title: 'Phantom Circuit', externalId: 'mal-23456', startedAt: '2026-07-26T08:00:00Z', completedAt: '2026-07-26T08:02:30Z', progress: 100, itemsProcessed: 1, itemsTotal: 1, errors: 0, duration: '2m 30s', triggeredBy: 'api', fileSize: '2 KB', bandwidth: '2 KB' },
    { id: 'imp-5', type: 'subtitle', source: 'manual', status: 'failed', mediaType: 'movie', title: 'Void Walker', externalId: 'manual-7890', startedAt: '2026-07-26T07:45:00Z', completedAt: '2026-07-26T07:46:12Z', progress: 45, itemsProcessed: 3, itemsTotal: 7, errors: 4, duration: '1m 12s', triggeredBy: 'manual', fileSize: null, bandwidth: null },
    { id: 'imp-6', type: 'artwork', source: 'jellyfin', status: 'completed', mediaType: 'movie', title: 'Quantum Phase', externalId: 'jf-5678', startedAt: '2026-07-26T07:30:00Z', completedAt: '2026-07-26T07:32:45Z', progress: 100, itemsProcessed: 8, itemsTotal: 8, errors: 0, duration: '2m 45s', triggeredBy: 'webhook', fileSize: '34 MB', bandwidth: '34 MB' },
    { id: 'imp-7', type: 'trailer', source: 'tmdb', status: 'completed', mediaType: 'movie', title: 'Neon Samurai: Origins', externalId: 'tmdb-11223', startedAt: '2026-07-26T07:00:00Z', completedAt: '2026-07-26T07:08:20Z', progress: 100, itemsProcessed: 3, itemsTotal: 3, errors: 0, duration: '8m 20s', triggeredBy: 'manual', fileSize: '567 MB', bandwidth: '567 MB' },
    { id: 'imp-8', type: 'audio', source: 'tmdb', status: 'queued', mediaType: 'series', title: 'Cyber Resonance', externalId: 'tmdb-11224', startedAt: '2026-07-26T09:25:00Z', completedAt: null, progress: 0, itemsProcessed: 0, itemsTotal: 12, errors: 0, duration: null, triggeredBy: 'api', fileSize: null, bandwidth: null },
    { id: 'imp-9', type: 'full-sync', source: 'auto', status: 'completed', mediaType: 'anime', title: 'Void Walker', externalId: 'mal-23458', startedAt: '2026-07-26T06:00:00Z', completedAt: '2026-07-26T06:12:30Z', progress: 100, itemsProcessed: 45, itemsTotal: 45, errors: 0, duration: '12m 30s', triggeredBy: 'scheduled', fileSize: '234 MB', bandwidth: '234 MB' },
    { id: 'imp-10', type: 'metadata', source: 'tmdb', status: 'completed', mediaType: 'series', title: 'Midnight Protocol', externalId: 'tmdb-22334', startedAt: '2026-07-26T05:30:00Z', completedAt: '2026-07-26T05:31:15Z', progress: 100, itemsProcessed: 1, itemsTotal: 1, errors: 0, duration: '1m 15s', triggeredBy: 'webhook', fileSize: '1 KB', bandwidth: '1 KB' },
    { id: 'imp-11', type: 'episode', source: 'tvdb', status: 'completed', mediaType: 'anime', title: 'Phantom Circuit S2', externalId: 'tvdb-45680', startedAt: '2026-07-26T04:00:00Z', completedAt: '2026-07-26T04:18:45Z', progress: 100, itemsProcessed: 24, itemsTotal: 24, errors: 0, duration: '18m 45s', triggeredBy: 'scheduled', fileSize: '1.2 GB', bandwidth: '1.2 GB' },
    { id: 'imp-12', type: 'artwork', source: 'fanart', status: 'completed', mediaType: 'movie', title: 'Neon Samurai: Origins', externalId: 'fanart-11223', startedAt: '2026-07-26T03:00:00Z', completedAt: '2026-07-26T03:05:30Z', progress: 100, itemsProcessed: 15, itemsTotal: 15, errors: 0, duration: '5m 30s', triggeredBy: 'scheduled', fileSize: '89 MB', bandwidth: '89 MB' },
    { id: 'imp-13', type: 'subtitle', source: 'manual', status: 'completed', mediaType: 'movie', title: 'Neon Samurai: Origins', externalId: 'manual-11223', startedAt: '2026-07-26T02:00:00Z', completedAt: '2026-07-26T02:03:45Z', progress: 100, itemsProcessed: 12, itemsTotal: 12, errors: 0, duration: '3m 45s', triggeredBy: 'manual', fileSize: '45 MB', bandwidth: '45 MB' },
    { id: 'imp-14', type: 'full-sync', source: 'jellyfin', status: 'failed', mediaType: 'series', title: 'Cyber Resonance S2', externalId: 'jf-6790', startedAt: '2026-07-26T01:00:00Z', completedAt: '2026-07-26T01:05:00Z', progress: 35, itemsProcessed: 4, itemsTotal: 12, errors: 8, duration: '5m 0s', triggeredBy: 'manual', fileSize: null, bandwidth: null },
    { id: 'imp-15', type: 'trailer', source: 'tmdb', status: 'completed', mediaType: 'anime', title: 'Phantom Circuit', externalId: 'tmdb-11225', startedAt: '2026-07-25T22:00:00Z', completedAt: '2026-07-25T22:04:30Z', progress: 100, itemsProcessed: 2, itemsTotal: 2, errors: 0, duration: '4m 30s', triggeredBy: 'manual', fileSize: '234 MB', bandwidth: '234 MB' },
  ],
  logs: [
    { id: 'log-1', timestamp: '2026-07-26T09:18:42Z', level: 'info', message: 'Import completed: Neon Samurai: Origins (full-sync)', source: 'tmdb', jobId: 'imp-1', details: '24 items processed. 3m 42s. 156 MB transferred.' },
    { id: 'log-2', timestamp: '2026-07-26T09:20:00Z', level: 'info', message: 'Import started: Cyber Resonance (artwork)', source: 'fanart', jobId: 'imp-2', details: '200 items to process.' },
    { id: 'log-3', timestamp: '2026-07-26T08:35:15Z', level: 'info', message: 'Import completed: Midnight Protocol (episodes)', source: 'tvdb', jobId: 'imp-3', details: '10 episodes imported. 5m 15s.' },
    { id: 'log-4', timestamp: '2026-07-26T08:02:30Z', level: 'info', message: 'Import completed: Phantom Circuit (metadata)', source: 'mal', jobId: 'imp-4', details: 'MAL metadata synced. 2m 30s.' },
    { id: 'log-5', timestamp: '2026-07-26T07:46:12Z', level: 'error', message: 'Import failed: Void Walker (subtitles)', source: 'manual', jobId: 'imp-5', details: '4 items failed: HTTP 404 (subtitle file not found). 3 of 7 items imported.' },
    { id: 'log-6', timestamp: '2026-07-26T07:32:45Z', level: 'info', message: 'Import completed: Quantum Phase (artwork)', source: 'jellyfin', jobId: 'imp-6', details: '8 images downloaded. 2m 45s. 34 MB.' },
    { id: 'log-7', timestamp: '2026-07-26T07:08:20Z', level: 'info', message: 'Import completed: Neon Samurai: Origins (trailers)', source: 'tmdb', jobId: 'imp-7', details: '3 trailers downloaded. 8m 20s. 567 MB.' },
    { id: 'log-8', timestamp: '2026-07-26T06:12:30Z', level: 'info', message: 'Auto-import completed: Void Walker (full-sync)', source: 'auto', jobId: 'imp-9', details: 'Scheduled batch. 45 items. 12m 30s.' },
    { id: 'log-9', timestamp: '2026-07-26T05:31:15Z', level: 'info', message: 'Webhook import: Midnight Protocol (metadata)', source: 'tmdb', jobId: 'imp-10', details: 'Triggered by TMDB webhook. 1 item.' },
    { id: 'log-10', timestamp: '2026-07-26T04:18:45Z', level: 'info', message: 'Scheduled import: Phantom Circuit S2 (episodes)', source: 'tvdb', jobId: 'imp-11', details: '24 episodes. 18m 45s. 1.2 GB.' },
    { id: 'log-11', timestamp: '2026-07-26T01:05:00Z', level: 'error', message: 'Import failed: Cyber Resonance S2 (full-sync)', source: 'jellyfin', jobId: 'imp-14', details: '8 items failed: Connection timeout to Jellyfin server. 4 of 12 items imported.' },
    { id: 'log-12', timestamp: '2026-07-25T22:04:30Z', level: 'info', message: 'Import completed: Phantom Circuit (trailers)', source: 'tmdb', jobId: 'imp-15', details: '2 trailers downloaded. 4m 30s. 234 MB.' },
  ],
}
