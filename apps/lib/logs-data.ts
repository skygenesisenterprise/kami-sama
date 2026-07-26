export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace'
export type LogSourceStatus = 'active' | 'inactive' | 'error'
export type AlertSeverity = 'critical' | 'warning' | 'info'
export type AlertStatus = 'active' | 'acknowledged' | 'resolved'
export type GlobalLogsStatus = 'healthy' | 'degraded' | 'critical'

export interface LogsOverview {
  globalStatus: GlobalLogsStatus
  lastHeartbeat: string
  totalSources: number
  activeSources: number
  logsPerMinute: number
  logsPerHour: number
  errorRate: number
  warnRate: number
  totalStoredGb: number
  retentionDays: number
  avgQueryLatencyMs: number
  activeAlerts: number
  uptime: string
}

export interface LogEntry {
  id: string
  timestamp: string
  level: LogLevel
  source: string
  service: string
  message: string
  traceId: string | null
  spanId: string | null
  metadata: Record<string, string> | null
}

export interface LogSource {
  id: string
  name: string
  type: 'file' | 'syslog' | 'journald' | 'docker' | 'kubernetes' | 'api'
  status: LogSourceStatus
  path: string
  format: string
  logsPerMin: number
  errorCount: number
  lastIngested: string
  retentionDays: number
  compressionEnabled: boolean
  indexedFields: string[]
}

export interface LogPattern {
  id: string
  pattern: string
  count: number
  percentage: number
  level: LogLevel
  lastSeen: string
  example: string
}

export interface LogAlert {
  id: string
  severity: AlertSeverity
  title: string
  description: string
  source: string
  date: string
  status: AlertStatus
  triggerCount: number
}

export interface LogAnalytics {
  time: string
  error: number
  warn: number
  info: number
  debug: number
}

export interface LogRetentionPolicy {
  id: string
  name: string
  source: string
  level: LogLevel
  retentionDays: number
  archiveAfterDays: number
  compressed: boolean
  totalSizeGb: number
}

export interface LogActivityEvent {
  id: string
  type: 'source-added' | 'source-removed' | 'alert-triggered' | 'pattern-detected' | 'config-change' | 'retention-applied' | 'index-rebuilt' | 'source-recovered'
  message: string
  source: string
  timestamp: string
  details: string | null
}

export interface LogsData {
  overview: LogsOverview
  entries: LogEntry[]
  sources: LogSource[]
  patterns: LogPattern[]
  alerts: LogAlert[]
  analytics: LogAnalytics[]
  retention: LogRetentionPolicy[]
  activities: LogActivityEvent[]
}

export const logsData: LogsData = {
  overview: {
    globalStatus: 'healthy',
    lastHeartbeat: new Date(Date.now() - 5_000).toISOString(),
    totalSources: 8,
    activeSources: 7,
    logsPerMinute: 12400,
    logsPerHour: 744000,
    errorRate: 0.3,
    warnRate: 2.1,
    totalStoredGb: 284,
    retentionDays: 30,
    avgQueryLatencyMs: 42,
    activeAlerts: 2,
    uptime: '47d 12h',
  },
  entries: [
    { id: 'le-001', timestamp: new Date(Date.now() - 5_000).toISOString(), level: 'error', source: 'api-gateway', service: 'gateway', message: 'Rate limit exceeded for client 192.168.1.45 — 429 Too Many Requests', traceId: 'abc123def456', spanId: 'span-001', metadata: { clientIp: '192.168.1.45', endpoint: '/api/v1/search', method: 'POST' } },
    { id: 'le-002', timestamp: new Date(Date.now() - 12_000).toISOString(), level: 'warn', source: 'media-scanner', service: 'scanner', message: 'Slow file scan detected — /mnt/media/movies took 45s (threshold: 30s)', traceId: null, spanId: null, metadata: { path: '/mnt/media/movies', duration: '45s' } },
    { id: 'le-003', timestamp: new Date(Date.now() - 18_000).toISOString(), level: 'info', source: 'auth-service', service: 'auth', message: 'User "alice" authenticated successfully via OAuth2', traceId: 'xyz789abc012', spanId: 'span-002', metadata: { user: 'alice', provider: 'oauth2' } },
    { id: 'le-004', timestamp: new Date(Date.now() - 25_000).toISOString(), level: 'error', source: 'streaming-engine', service: 'transcoder', message: 'NVENC session failed — GPU memory overflow during 4K HDR encode', traceId: 'def456ghi789', spanId: 'span-003', metadata: { gpu: 'RTX 4090', job: 'ej-010', codec: 'H.265' } },
    { id: 'le-005', timestamp: new Date(Date.now() - 30_000).toISOString(), level: 'info', source: 'api-gateway', service: 'gateway', message: 'Health check passed — all upstream services responding', traceId: null, spanId: null, metadata: null },
    { id: 'le-006', timestamp: new Date(Date.now() - 35_000).toISOString(), level: 'debug', source: 'database-proxy', service: 'db-proxy', message: 'Connection pool stats: active=12, idle=8, waiting=0', traceId: null, spanId: null, metadata: { active: '12', idle: '8' } },
    { id: 'le-007', timestamp: new Date(Date.now() - 40_000).toISOString(), level: 'warn', source: 'encoding-worker', service: 'encoder', message: 'GPU temperature approaching threshold — 72°C (limit: 75°C)', traceId: null, spanId: null, metadata: { worker: 'encoder-worker-1', temp: '72' } },
    { id: 'le-008', timestamp: new Date(Date.now() - 45_000).toISOString(), level: 'info', source: 'backup-service', service: 'backup', message: 'Incremental backup completed — 320 MB transferred in 12m 45s', traceId: 'ghi789jkl012', spanId: 'span-004', metadata: { job: 'bk-002', size: '320 MB' } },
    { id: 'le-009', timestamp: new Date(Date.now() - 50_000).toISOString(), level: 'error', source: 'media-scanner', service: 'scanner', message: 'Failed to parse metadata for /mnt/media/tv/broken-file.mkv — invalid container format', traceId: null, spanId: null, metadata: { path: '/mnt/media/tv/broken-file.mkv', error: 'invalid_container' } },
    { id: 'le-010', timestamp: new Date(Date.now() - 55_000).toISOString(), level: 'info', source: 'notification-service', service: 'notifications', message: 'Push notification sent to 24 devices — new content available', traceId: null, spanId: null, metadata: { devices: '24', type: 'new_content' } },
    { id: 'le-011', timestamp: new Date(Date.now() - 60_000).toISOString(), level: 'trace', source: 'api-gateway', service: 'gateway', message: 'Request routed to upstream media-service — latency 12ms', traceId: 'jkl012mno345', spanId: 'span-005', metadata: { upstream: 'media-service', latency: '12ms' } },
    { id: 'le-012', timestamp: new Date(Date.now() - 65_000).toISOString(), level: 'info', source: 'kubernetes', service: 'k8s', message: 'Pod "streaming-engine-7b4f8c9d2-x2k9p" readiness probe passed', traceId: null, spanId: null, metadata: { pod: 'streaming-engine-7b4f8c9d2-x2k9p' } },
    { id: 'le-013', timestamp: new Date(Date.now() - 70_000).toISOString(), level: 'warn', source: 'database-proxy', service: 'db-proxy', message: 'Slow query detected — SELECT * FROM media_items WHERE ... (2.4s)', traceId: 'mno345pqr678', spanId: 'span-006', metadata: { duration: '2.4s', query: 'SELECT * FROM media_items' } },
    { id: 'le-014', timestamp: new Date(Date.now() - 75_000).toISOString(), level: 'info', source: 'auth-service', service: 'auth', message: 'API key "scanner-key-01" rotated successfully', traceId: null, spanId: null, metadata: { key: 'scanner-key-01' } },
    { id: 'le-015', timestamp: new Date(Date.now() - 80_000).toISOString(), level: 'debug', source: 'streaming-engine', service: 'transcoder', message: 'Transcode queue depth: 3 active, 8 queued, 0 failed', traceId: null, spanId: null, metadata: { active: '3', queued: '8' } },
  ],
  sources: [
    { id: 'ls-001', name: 'api-gateway', type: 'file', status: 'active', path: '/var/log/api-gateway/*.log', format: 'json', logsPerMin: 4200, errorCount: 12, lastIngested: new Date(Date.now() - 2_000).toISOString(), retentionDays: 30, compressionEnabled: true, indexedFields: ['level', 'service', 'traceId', 'clientIp', 'endpoint'] },
    { id: 'ls-002', name: 'streaming-engine', type: 'docker', status: 'active', path: 'container://streaming-engine', format: 'json', logsPerMin: 2800, errorCount: 8, lastIngested: new Date(Date.now() - 3_000).toISOString(), retentionDays: 14, compressionEnabled: true, indexedFields: ['level', 'service', 'jobId', 'gpu'] },
    { id: 'ls-003', name: 'encoding-worker', type: 'docker', status: 'active', path: 'container://encoding-worker-*', format: 'json', logsPerMin: 1900, errorCount: 5, lastIngested: new Date(Date.now() - 4_000).toISOString(), retentionDays: 14, compressionEnabled: true, indexedFields: ['level', 'service', 'worker', 'encoder'] },
    { id: 'ls-004', name: 'auth-service', type: 'file', status: 'active', path: '/var/log/auth-service/*.log', format: 'json', logsPerMin: 850, errorCount: 0, lastIngested: new Date(Date.now() - 5_000).toISOString(), retentionDays: 90, compressionEnabled: true, indexedFields: ['level', 'user', 'provider', 'action'] },
    { id: 'ls-005', name: 'media-scanner', type: 'file', status: 'active', path: '/var/log/media-scanner/*.log', format: 'json', logsPerMin: 1200, errorCount: 3, lastIngested: new Date(Date.now() - 6_000).toISOString(), retentionDays: 30, compressionEnabled: false, indexedFields: ['level', 'path', 'duration', 'error'] },
    { id: 'ls-006', name: 'database-proxy', type: 'file', status: 'active', path: '/var/log/database-proxy/*.log', format: 'json', logsPerMin: 980, errorCount: 2, lastIngested: new Date(Date.now() - 7_000).toISOString(), retentionDays: 30, compressionEnabled: true, indexedFields: ['level', 'query', 'duration', 'connection'] },
    { id: 'ls-007', name: 'kubernetes', type: 'kubernetes', status: 'active', path: 'k8s://cluster-main', format: 'json', logsPerMin: 3400, errorCount: 4, lastIngested: new Date(Date.now() - 3_000).toISOString(), retentionDays: 7, compressionEnabled: true, indexedFields: ['level', 'namespace', 'pod', 'container'] },
    { id: 'ls-008', name: 'backup-service', type: 'journald', status: 'inactive', path: 'journald://backup-service', format: 'text', logsPerMin: 0, errorCount: 1, lastIngested: new Date(Date.now() - 3600_000).toISOString(), retentionDays: 30, compressionEnabled: false, indexedFields: ['level', 'job', 'size'] },
  ],
  patterns: [
    { id: 'pp-001', pattern: 'Rate limit exceeded for client *', count: 234, percentage: 18.2, level: 'error', lastSeen: new Date(Date.now() - 5_000).toISOString(), example: 'Rate limit exceeded for client 192.168.1.45 — 429 Too Many Requests' },
    { id: 'pp-002', pattern: 'Health check passed — all upstream services responding', count: 890, percentage: 15.8, level: 'info', lastSeen: new Date(Date.now() - 30_000).toISOString(), example: 'Health check passed — all upstream services responding' },
    { id: 'pp-003', pattern: 'User "*" authenticated successfully via *', count: 567, percentage: 12.4, level: 'info', lastSeen: new Date(Date.now() - 18_000).toISOString(), example: 'User "alice" authenticated successfully via OAuth2' },
    { id: 'pp-004', pattern: 'Slow query detected — * (*)', count: 45, percentage: 8.9, level: 'warn', lastSeen: new Date(Date.now() - 70_000).toISOString(), example: 'Slow query detected — SELECT * FROM media_items WHERE ... (2.4s)' },
    { id: 'pp-005', pattern: 'Pod "*" readiness probe passed', count: 312, percentage: 7.6, level: 'info', lastSeen: new Date(Date.now() - 65_000).toISOString(), example: 'Pod "streaming-engine-7b4f8c9d2-x2k9p" readiness probe passed' },
    { id: 'pp-006', pattern: 'GPU temperature approaching threshold — *°C', count: 18, percentage: 5.1, level: 'warn', lastSeen: new Date(Date.now() - 40_000).toISOString(), example: 'GPU temperature approaching threshold — 72°C (limit: 75°C)' },
  ],
  alerts: [
    { id: 'la-001', severity: 'critical', title: 'Error rate spike on api-gateway', description: 'Error rate exceeded 1% threshold — currently at 2.8% over last 5 minutes', source: 'api-gateway', date: new Date(Date.now() - 300_000).toISOString(), status: 'active', triggerCount: 3 },
    { id: 'la-002', severity: 'warning', title: 'Log ingestion lag on backup-service', description: 'journald source stopped receiving logs — last entry 1h ago', source: 'backup-service', date: new Date(Date.now() - 3600_000).toISOString(), status: 'active', triggerCount: 1 },
    { id: 'la-003', severity: 'warning', title: 'Unusual error pattern detected', description: 'Repeated "invalid container format" errors from media-scanner — possible corrupted file', source: 'media-scanner', date: new Date(Date.now() - 600_000).toISOString(), status: 'acknowledged', triggerCount: 5 },
    { id: 'la-004', severity: 'info', title: 'Log storage approaching retention limit', description: 'api-gateway logs at 89% of 30-day retention — 252 GB of 284 GB used', source: 'api-gateway', date: new Date(Date.now() - 7200_000).toISOString(), status: 'acknowledged', triggerCount: 1 },
    { id: 'la-005', severity: 'info', title: 'Index rebuild completed', description: 'Full-text index for streaming-engine rebuilt in 4m 32s — 2.4M documents re-indexed', source: 'streaming-engine', date: new Date(Date.now() - 14400_000).toISOString(), status: 'resolved', triggerCount: 1 },
  ],
  analytics: [
    { time: '00:00', error: 12, warn: 45, info: 1200, debug: 320 },
    { time: '01:00', error: 8, warn: 32, info: 980, debug: 280 },
    { time: '02:00', error: 5, warn: 28, info: 750, debug: 210 },
    { time: '03:00', error: 3, warn: 22, info: 620, debug: 180 },
    { time: '04:00', error: 4, warn: 25, info: 580, debug: 160 },
    { time: '05:00', error: 6, warn: 30, info: 820, debug: 220 },
    { time: '06:00', error: 10, warn: 38, info: 1100, debug: 300 },
    { time: '07:00', error: 15, warn: 52, info: 1450, debug: 380 },
    { time: '08:00', error: 22, warn: 68, info: 1800, debug: 420 },
    { time: '09:00', error: 18, warn: 55, info: 1600, debug: 400 },
    { time: '10:00', error: 14, warn: 48, info: 1350, debug: 350 },
    { time: '11:00', error: 12, warn: 42, info: 1280, debug: 340 },
    { time: '12:00', error: 16, warn: 50, info: 1400, debug: 360 },
    { time: '13:00', error: 20, warn: 62, info: 1650, debug: 410 },
    { time: '14:00', error: 25, warn: 72, info: 1900, debug: 450 },
    { time: '15:00', error: 18, warn: 58, info: 1500, debug: 390 },
    { time: '16:00', error: 14, warn: 45, info: 1300, debug: 350 },
    { time: '17:00', error: 12, warn: 40, info: 1200, debug: 320 },
    { time: '18:00', error: 10, warn: 35, info: 1100, debug: 300 },
    { time: '19:00', error: 8, warn: 30, info: 950, debug: 260 },
    { time: '20:00', error: 6, warn: 28, info: 880, debug: 240 },
    { time: '21:00', error: 5, warn: 25, info: 820, debug: 220 },
    { time: '22:00', error: 4, warn: 22, info: 750, debug: 200 },
    { time: '23:00', error: 3, warn: 20, info: 680, debug: 180 },
  ],
  retention: [
    { id: 'rp-001', name: 'API Gateway Logs', source: 'api-gateway', level: 'info', retentionDays: 30, archiveAfterDays: 7, compressed: true, totalSizeGb: 89 },
    { id: 'rp-002', name: 'API Gateway Errors', source: 'api-gateway', level: 'error', retentionDays: 90, archiveAfterDays: 30, compressed: true, totalSizeGb: 12 },
    { id: 'rp-003', name: 'Streaming Engine', source: 'streaming-engine', level: 'info', retentionDays: 14, archiveAfterDays: 3, compressed: true, totalSizeGb: 45 },
    { id: 'rp-004', name: 'Encoding Workers', source: 'encoding-worker', level: 'info', retentionDays: 14, archiveAfterDays: 3, compressed: true, totalSizeGb: 32 },
    { id: 'rp-005', name: 'Auth Service', source: 'auth-service', level: 'info', retentionDays: 90, archiveAfterDays: 30, compressed: true, totalSizeGb: 28 },
    { id: 'rp-006', name: 'Media Scanner', source: 'media-scanner', level: 'info', retentionDays: 30, archiveAfterDays: 7, compressed: false, totalSizeGb: 18 },
    { id: 'rp-007', name: 'Database Proxy', source: 'database-proxy', level: 'info', retentionDays: 30, archiveAfterDays: 7, compressed: true, totalSizeGb: 22 },
    { id: 'rp-008', name: 'Kubernetes Events', source: 'kubernetes', level: 'info', retentionDays: 7, archiveAfterDays: 1, compressed: true, totalSizeGb: 38 },
  ],
  activities: [
    { id: 'lact-001', type: 'alert-triggered', message: 'Error rate spike detected on api-gateway', source: 'api-gateway', timestamp: new Date(Date.now() - 300_000).toISOString(), details: 'Error rate: 2.8% (threshold: 1%) | Last 5 minutes | 340 errors out of 12,100 logs' },
    { id: 'lact-002', type: 'source-removed', message: 'Backup service source went inactive', source: 'backup-service', timestamp: new Date(Date.now() - 3600_000).toISOString(), details: 'journald://backup-service stopped responding | Last log: 1h ago | Possible service restart needed' },
    { id: 'lact-003', type: 'pattern-detected', message: 'Repeated error pattern detected in media-scanner', source: 'media-scanner', timestamp: new Date(Date.now() - 600_000).toISOString(), details: 'Pattern: "invalid container format" | Count: 5 in 10 minutes | Possible corrupted file at /mnt/media/tv/' },
    { id: 'lact-004', type: 'config-change', message: 'Log retention policy updated for auth-service', source: 'auth-service', timestamp: new Date(Date.now() - 7200_000).toISOString(), details: 'Retention: 30d → 90d | Archive after: 7d → 30d | Reason: Compliance requirement' },
    { id: 'lact-005', type: 'index-rebuilt', message: 'Full-text index rebuilt for streaming-engine', source: 'streaming-engine', timestamp: new Date(Date.now() - 14400_000).toISOString(), details: 'Documents: 2.4M | Duration: 4m 32s | Index size: 890 MB | Trigger: Scheduled rebuild' },
    { id: 'lact-006', type: 'source-added', message: 'New log source registered: database-proxy', source: 'database-proxy', timestamp: new Date(Date.now() - 86400_000).toISOString(), details: 'Path: /var/log/database-proxy/*.log | Format: json | Indexed: level, query, duration' },
    { id: 'lact-007', type: 'retention-applied', message: 'Retention cleanup completed for kubernetes logs', source: 'kubernetes', timestamp: new Date(Date.now() - 43200_000).toISOString(), details: 'Deleted: 2.1 GB (14d old) | Archived: 0 B | Remaining: 38 GB | Sources affected: 1' },
    { id: 'lact-008', type: 'source-recovered', message: 'Encoding worker source recovered after restart', source: 'encoding-worker', timestamp: new Date(Date.now() - 28800_000).toISOString(), details: 'Downtime: 45 seconds | Logs ingested since recovery: 2,400/min | Status: active' },
    { id: 'lact-009', type: 'alert-triggered', message: 'Slow query pattern detected in database-proxy', source: 'database-proxy', timestamp: new Date(Date.now() - 1800_000).toISOString(), details: 'Queries > 2s: 12 in last hour | Affected tables: media_items, user_sessions | Avg: 2.4s' },
    { id: 'lact-010', type: 'config-change', message: 'Index fields updated for streaming-engine', source: 'streaming-engine', timestamp: new Date(Date.now() - 7200_000).toISOString(), details: 'Added fields: gpu, encoder, jobDuration | Removed fields: (none) | Rebuild triggered automatically' },
  ],
}
