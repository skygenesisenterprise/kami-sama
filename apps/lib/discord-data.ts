/**
 * Discord community dashboard — data layer.
 *
 * This module owns every shape the UI consumes. Replace the mock exports
 * below with real API calls (keeping the same types) and the page will keep
 * working unchanged.
 */

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type DiscordConnectionState = 'connected' | 'disconnected' | 'error'

export type ServiceStatus = 'healthy' | 'warning' | 'offline' | 'unknown'

export type IntegrationState = 'enabled' | 'disabled'

export type ActivityEventType =
  | 'episode'
  | 'member'
  | 'automation'
  | 'config'
  | 'integration'
  | 'announcement'

export type PreviewKind = 'anime-release' | 'new-anime' | 'weekly-trending'

export type ActivityRange = '7d' | '30d' | '90d'

export interface DiscordServer {
  id: string
  name: string
  description: string
  members: number
  online: number
  channels: number
  connectedAt: string
  botVersion: string
  inviteUrl: string | null
}

export interface DiscordStats {
  members: number
  membersDelta: number | null
  online: number
  messages30d: number
  messagesDelta: number | null
  uptime30d: number
  uptimeDelta: number | null
}

export interface DiscordActivityPoint {
  date: string
  messages: number
  members: number
}

export interface DiscordActivitySeries {
  range: ActivityRange
  label: string
  points: DiscordActivityPoint[]
}

export interface DiscordBotService {
  id: string
  label: string
  status: ServiceStatus
  detail?: string
}

export interface DiscordBotStatus {
  state: 'online' | 'offline'
  version: string
  services: DiscordBotService[]
  latencyMs: number
  uptime: string
  lastHeartbeat: string
}

export interface DiscordIntegration {
  id: string
  name: string
  description: string
  state: IntegrationState
  configurable: boolean
}

export interface DiscordAutomationPreview {
  kind: PreviewKind
  label: string
  channel: string
  title: string
  subtitle: string
  body: string
  cta: string
  meta: string
}

export interface DiscordActivityEvent {
  id: string
  type: ActivityEventType
  title: string
  detail: string
  time: string
}

export interface DiscordCommunityData {
  connectionState: DiscordConnectionState
  lastSync: string
  server: DiscordServer
  stats: DiscordStats
  activity: DiscordActivitySeries[]
  bot: DiscordBotStatus
  integrations: DiscordIntegration[]
  previews: DiscordAutomationPreview[]
  activityFeed: DiscordActivityEvent[]
}

/* -------------------------------------------------------------------------- */
/*  Mock data                                                                 */
/* -------------------------------------------------------------------------- */

export const discordServerMock: DiscordServer = {
  id: 'srv_9f2c4a7e1b8d',
  name: 'Sky Genesis Enterprise',
  description: 'Kami-Sama Community',
  members: 1284,
  online: 42,
  channels: 18,
  connectedAt: '2025-03-12T09:24:00Z',
  botVersion: '2.4.1',
  inviteUrl: 'https://discord.gg/kamisama',
}

export const discordStatsMock: DiscordStats = {
  members: 1284,
  membersDelta: 8.2,
  online: 42,
  messages30d: 8421,
  messagesDelta: 14.3,
  uptime30d: 99.98,
  uptimeDelta: 0.02,
}

/* Seeded, deterministic activity data — stable across SSR + hydration. */
function buildSeries(range: ActivityRange, label: string, points: number, seed: number): DiscordActivitySeries {
  let state = seed
  const rand = () => {
    state = (state * 9301 + 49297) % 233280
    return state / 233280
  }

  const base = new Date('2026-08-10T00:00:00Z')
  const totalDays = range === '90d' ? 90 : range === '30d' ? 30 : 7

  const arr: DiscordActivityPoint[] = []
  for (let i = 0; i < points; i++) {
    const dayOffset = Math.round((i / Math.max(points - 1, 1)) * totalDays)
    const date = new Date(base.getTime() - dayOffset * 24 * 60 * 60 * 1000)
    const labelDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    // Gentle upward trend with weekly seasonality
    const trend = 1 + (dayOffset / totalDays) * 0.45
    const season = 1 + Math.sin((dayOffset / totalDays) * Math.PI * 2) * 0.15
    const noise = 0.85 + rand() * 0.3
    const messages = Math.round(95 * trend * season * noise)
    const members = Math.round(2 + 5 * trend * season * (0.7 + rand() * 0.6))

    arr.push({ date: labelDate, messages, members })
  }

  // Oldest → newest
  arr.reverse()

  return { range, label, points: arr }
}

export const discordActivityMock: DiscordActivitySeries[] = [
  buildSeries('7d', 'Last 7 days', 7, 1337),
  buildSeries('30d', 'Last 30 days', 30, 4242),
  buildSeries('90d', 'Last 90 days', 30, 9001),
]

export const discordBotStatusMock: DiscordBotStatus = {
  state: 'online',
  version: '2.4.1',
  services: [
    { id: 'gateway', label: 'Discord Gateway', status: 'healthy', detail: '38 ms' },
    { id: 'api', label: 'Kami-Sama API', status: 'healthy', detail: '42 ms' },
    { id: 'notifications', label: 'Notifications', status: 'healthy', detail: '21 ms' },
    { id: 'database', label: 'Database', status: 'healthy', detail: '12 ms' },
  ],
  latencyMs: 38,
  uptime: '14d 07h 32m',
  lastHeartbeat: 'Just now',
}

export const discordIntegrationsMock: DiscordIntegration[] = [
  {
    id: 'anime-releases',
    name: 'Anime Releases',
    description: 'Automatically announce new episodes in Discord.',
    state: 'enabled',
    configurable: true,
  },
  {
    id: 'manga-releases',
    name: 'Manga Releases',
    description: 'Announce new manga chapters as they drop.',
    state: 'enabled',
    configurable: true,
  },
  {
    id: 'account-linking',
    name: 'Account Linking',
    description: 'Allow Discord users to link their Kami-Sama account.',
    state: 'enabled',
    configurable: true,
  },
  {
    id: 'community-recommendations',
    name: 'Community Recommendations',
    description: 'Publish trending community recommendations.',
    state: 'disabled',
    configurable: true,
  },
]

export const discordPreviewsMock: DiscordAutomationPreview[] = [
  {
    kind: 'anime-release',
    label: 'Anime Release',
    channel: '#anime-releases',
    title: 'New episode',
    subtitle: 'One Piece',
    body: 'Episode 1138 — "A New Era" is now live on Kami-Sama.',
    cta: 'Watch on Kami-Sama',
    meta: 'Shueisha · Simulcast',
  },
  {
    kind: 'new-anime',
    label: 'New Anime',
    channel: '#announcements',
    title: 'Added to the catalog',
    subtitle: 'Solo Leveling — Season 2',
    body: 'All episodes are available now, including the new season premiere.',
    cta: 'Explore now',
    meta: 'A-1 Pictures · 13 episodes',
  },
  {
    kind: 'weekly-trending',
    label: 'Weekly Trending',
    channel: '#community',
    title: 'Trending this week',
    subtitle: 'Top picks from the community',
    body: 'Jujutsu Kaisen, Frieren and Dandadan lead the weekly rankings.',
    cta: 'View rankings',
    meta: 'Updated every Monday',
  },
]

export const discordActivityFeedMock: DiscordActivityEvent[] = [
  {
    id: 'act-001',
    type: 'episode',
    title: 'New episode announced',
    detail: 'One Piece — Episode 1138',
    time: '8 minutes ago',
  },
  {
    id: 'act-002',
    type: 'member',
    title: 'Member joined',
    detail: '@Alex',
    time: '24 minutes ago',
  },
  {
    id: 'act-003',
    type: 'automation',
    title: 'Automation executed',
    detail: 'Weekly Trending',
    time: '1 hour ago',
  },
  {
    id: 'act-004',
    type: 'config',
    title: 'Bot configuration updated',
    detail: 'Announcement channel moved to #announcements',
    time: '3 hours ago',
  },
  {
    id: 'act-005',
    type: 'integration',
    title: 'Integration enabled',
    detail: 'Account Linking',
    time: 'Yesterday',
  },
  {
    id: 'act-006',
    type: 'announcement',
    title: 'Announcement published',
    detail: 'Season simulcast schedule',
    time: '2 days ago',
  },
]

export const discordCommunityMock: DiscordCommunityData = {
  connectionState: 'connected',
  lastSync: '2 minutes ago',
  server: discordServerMock,
  stats: discordStatsMock,
  activity: discordActivityMock,
  bot: discordBotStatusMock,
  integrations: discordIntegrationsMock,
  previews: discordPreviewsMock,
  activityFeed: discordActivityFeedMock,
}
