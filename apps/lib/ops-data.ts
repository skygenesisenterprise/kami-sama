import type { StatusTone } from '@/components/dash/status-badge'

export const platformHealth: Array<{
  name: string
  status: string
  tone: StatusTone
  detail: string
}> = [
  { name: 'API Gateway', status: 'Operational', tone: 'success', detail: 'p99 42ms · 0.01% errors' },
  { name: 'Streaming CDN', status: 'Operational', tone: 'success', detail: '38 nodes · 2.4 Tbps' },
  { name: 'Encoding Cluster', status: 'Degraded', tone: 'warning', detail: '2/14 workers unhealthy' },
  { name: 'Search Index', status: 'Operational', tone: 'success', detail: 'Lag 1.2s · 84k docs/h' },
  { name: 'PostgreSQL', status: 'Operational', tone: 'success', detail: 'Primary + 2 replicas' },
  { name: 'Object Storage', status: 'Operational', tone: 'success', detail: '682 TB / 900 TB used' },
]

export const pendingTasks = [
  { title: 'Approve 7 items waiting for review', href: '/dash/publishing/reviews', tag: 'Publishing' },
  { title: 'Resolve 3 failed encoding jobs', href: '/dash/operations/encoding', tag: 'Operations' },
  { title: 'Map 18 unmatched TMDB imports', href: '/dash/sources/import-history', tag: 'Sources' },
  { title: 'Review 12 flagged comments', href: '/dash/community/reports', tag: 'Moderation' },
  { title: 'Renew 3 expiring licenses', href: '/dash/publishing/licenses', tag: 'Licensing' },
]

export const recentImports: Array<{
  source: string
  summary: string
  items: number
  status: string
  tone: StatusTone
  time: string
}> = [
  { source: 'TMDB', summary: 'Weekly metadata sync', items: 214, status: 'Completed', tone: 'success', time: '32m ago' },
  { source: 'AniList', summary: 'Seasonal anime refresh', items: 86, status: 'Completed', tone: 'success', time: '1h ago' },
  { source: 'FanArt', summary: 'Poster art backfill', items: 1240, status: 'Running', tone: 'info', time: 'running' },
  { source: 'TVDB', summary: 'Episode ordering fix', items: 45, status: 'Failed', tone: 'destructive', time: '3h ago' },
]

export const publicationQueue: Array<{
  title: string
  type: string
  stage: string
  tone: StatusTone
  scheduledFor: string
  owner: string
}> = [
  { title: 'Frieren: Beyond Journey\u2019s End S02E09', type: 'Episode', stage: 'Publishing', tone: 'info', scheduledFor: 'Now', owner: 'auto' },
  { title: 'Vinland Saga — Season 3 (batch)', type: 'Season', stage: 'Scheduled', tone: 'neutral', scheduledFor: 'Today 18:00', owner: 'M. Tanaka' },
  { title: 'The Apothecary Diaries S02E14', type: 'Episode', stage: 'Approved', tone: 'success', scheduledFor: 'Today 20:00', owner: 'auto' },
  { title: 'Spring 2026 Collection Refresh', type: 'Collection', stage: 'Review', tone: 'warning', scheduledFor: 'Tomorrow 09:00', owner: 'K. Ito' },
  { title: 'Chainsaw Man: Reze Arc (Movie)', type: 'Movie', stage: 'Scheduled', tone: 'neutral', scheduledFor: 'Fri 00:00', owner: 'L. Moreau' },
]

export const recentErrors: Array<{
  message: string
  service: string
  count: number
  time: string
}> = [
  { message: 'FFmpeg OOM on 4K HDR profile (exit 137)', service: 'encoder-07', count: 3, time: '12m ago' },
  { message: 'TVDB rate limit exceeded (429)', service: 'importer', count: 18, time: '2h ago' },
  { message: 'Subtitle sync drift > 2s detected', service: 'qa-pipeline', count: 2, time: '4h ago' },
  { message: 'Webhook delivery timeout: discord-notify', service: 'webhooks', count: 5, time: '6h ago' },
]

export const runningWorkers: Array<{
  name: string
  task: string
  progress: number
  status: 'busy' | 'idle'
}> = [
  { name: 'encoder-01', task: 'Transcoding Frieren S02E09 (1080p)', progress: 72, status: 'busy' },
  { name: 'encoder-02', task: 'Transcoding Frieren S02E09 (4K)', progress: 31, status: 'busy' },
  { name: 'thumbnailer-01', task: 'Generating sprite sheets (batch 42)', progress: 88, status: 'busy' },
  { name: 'importer-01', task: 'FanArt poster backfill', progress: 54, status: 'busy' },
  { name: 'indexer-01', task: 'Idle — waiting for jobs', progress: 0, status: 'idle' },
]

export const latestPublished = [
  { title: 'Frieren: Beyond Journey\u2019s End S02E08', time: '2h ago', views: '48.2k' },
  { title: 'One Piece E1142', time: '6h ago', views: '112.4k' },
  { title: 'The Apothecary Diaries S02E13', time: '1d ago', views: '67.9k' },
  { title: 'Blue Lock S03E04', time: '1d ago', views: '54.1k' },
]

export const storagePools = [
  { name: 'Media (video)', used: 540, total: 700, unit: 'TB' },
  { name: 'Assets (images)', used: 84, total: 120, unit: 'TB' },
  { name: 'Database', used: 2.1, total: 4, unit: 'TB' },
  { name: 'Backups', used: 56, total: 76, unit: 'TB' },
]

export const syncStatus: Array<{
  source: string
  lastSync: string
  nextSync: string
  tone: StatusTone
}> = [
  { source: 'TMDB', lastSync: '32m ago', nextSync: 'in 5h', tone: 'success' },
  { source: 'AniList', lastSync: '1h ago', nextSync: 'in 11h', tone: 'success' },
  { source: 'MyAnimeList', lastSync: '4h ago', nextSync: 'in 2h', tone: 'success' },
  { source: 'TVDB', lastSync: '3h ago', nextSync: 'paused', tone: 'destructive' },
  { source: 'FanArt', lastSync: 'running', nextSync: '—', tone: 'info' },
]

export const backgroundJobs = [
  { name: 'Sprite sheet generation', queued: 42, running: 3 },
  { name: 'Subtitle validation', queued: 18, running: 2 },
  { name: 'Search reindexing', queued: 5, running: 1 },
  { name: 'Poster optimization', queued: 260, running: 4 },
]

export const activityTimeline = [
  { actor: 'M. Tanaka', action: 'approved', target: 'Vinland Saga S03 metadata', time: '8m ago' },
  { actor: 'system', action: 'published', target: 'Frieren S02E08 to all regions', time: '2h ago' },
  { actor: 'K. Ito', action: 'edited', target: 'Spring 2026 Collection layout', time: '3h ago' },
  { actor: 'importer', action: 'imported', target: '214 episodes from TMDB', time: '32m ago' },
  { actor: 'L. Moreau', action: 'scheduled', target: 'Chainsaw Man: Reze Arc for Friday', time: '5h ago' },
  { actor: 'A. Kurosawa', action: 'rotated', target: 'production API key kv_prod_**', time: '1d ago' },
]

export const upcomingReleases = [
  { title: 'Frieren S02E09', when: 'Today 18:00', regions: 'Global' },
  { title: 'The Apothecary Diaries S02E14', when: 'Today 20:00', regions: 'Global' },
  { title: 'Chainsaw Man: Reze Arc', when: 'Fri 00:00', regions: 'US, EU, JP' },
  { title: 'Spring 2026 Collection', when: 'Sat 09:00', regions: 'Global' },
]

export const licenseAlerts = [
  { title: 'Jujutsu Kaisen', region: 'US', expires: '14 days' },
  { title: 'Attack on Titan (Final)', region: 'EU', expires: '30 days' },
  { title: 'Demon Slayer S01–S03', region: 'LATAM', expires: '45 days' },
]

export const moderatorQueue = [
  { type: 'Comment report', detail: 'Spoiler content in Frieren S02E08 thread', count: 7 },
  { type: 'Review report', detail: 'Review bombing on Blue Lock S03', count: 4 },
  { type: 'User report', detail: 'Impersonation of staff account', count: 1 },
]
