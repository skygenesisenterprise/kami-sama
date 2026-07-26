export type UserStatus = 'active' | 'suspended' | 'banned' | 'pending'
export type UserRole = 'user' | 'moderator' | 'admin'
export type SubscriptionTier = 'free' | 'premium' | 'enterprise'

export interface UserActivityStats {
  watchTimeMinutes: number
  contentWatched: number
  favorites: number
  lists: number
  historyEntries: number
}

export interface UserSession {
  id: string
  device: string
  browser: string
  ip: string
  location: string
  lastActive: string
  createdAt: string
}

export interface UserHistoryEntry {
  id: string
  contentTitle: string
  contentType: 'movie' | 'series' | 'episode'
  watchedAt: string
  progressPercent: number
}

export interface User {
  id: string
  username: string
  email: string
  avatarUrl: string | null
  status: UserStatus
  role: UserRole
  subscription: SubscriptionTier
  country: string
  createdAt: string
  lastActivity: string
  lastLogin: string
  emailVerified: boolean
  oauthProvider: string | null
  bio: string | null
  stats: UserActivityStats
  sessions: UserSession[]
  recentHistory: UserHistoryEntry[]
  permissions: string[]
}

export interface UsersOverview {
  totalUsers: number
  activeUsers: number
  newUsersThisMonth: number
  suspendedUsers: number
  bannedUsers: number
  pendingUsers: number
  premiumUsers: number
  enterpriseUsers: number
  freeUsers: number
  averageWatchTimeMinutes: number
}

export interface CommunityUsersData {
  overview: UsersOverview
  users: User[]
}

const flag = (country: string) => {
  const flags: Record<string, string> = {
    FR: '🇫🇷', US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪', JP: '🇯🇵', CA: '🇨🇦',
    ES: '🇪🇸', IT: '🇮🇹', BR: '🇧🇷', AU: '🇦🇺', KR: '🇰🇷', NL: '🇳🇱',
    SE: '🇸🇪', PL: '🇵🇱', MX: '🇲🇽',
  }
  return flags[country] ?? '🌍'
}

export const countryName = (code: string) => {
  const names: Record<string, string> = {
    FR: 'France', US: 'United States', GB: 'United Kingdom', DE: 'Germany',
    JP: 'Japan', CA: 'Canada', ES: 'Spain', IT: 'Italy', BR: 'Brazil',
    AU: 'Australia', KR: 'South Korea', NL: 'Netherlands', SE: 'Sweden',
    PL: 'Poland', MX: 'Mexico',
  }
  return names[code] ?? code
}

export const countryFlag = flag

export const communityUsersData: CommunityUsersData = {
  overview: {
    totalUsers: 14832,
    activeUsers: 11205,
    newUsersThisMonth: 847,
    suspendedUsers: 124,
    bannedUsers: 38,
    pendingUsers: 56,
    premiumUsers: 4210,
    enterpriseUsers: 312,
    freeUsers: 10310,
    averageWatchTimeMinutes: 4250,
  },
  users: [
    {
      id: 'usr-001', username: 'akira_miyamoto', email: 'akira.miyamoto@gmail.com', avatarUrl: null,
      status: 'active', role: 'user', subscription: 'premium', country: 'JP',
      createdAt: '2024-03-15T08:30:00Z', lastActivity: new Date(Date.now() - 180_000).toISOString(),
      lastLogin: new Date(Date.now() - 180_000).toISOString(), emailVerified: true,
      oauthProvider: 'google', bio: 'Anime enthusiast & collector',
      stats: { watchTimeMinutes: 12400, contentWatched: 342, favorites: 28, lists: 5, historyEntries: 1204 },
      sessions: [
        { id: 's-001', device: 'MacBook Pro 16"', browser: 'Chrome 124', ip: '203.104.42.15', location: 'Tokyo, JP', lastActive: new Date(Date.now() - 180_000).toISOString(), createdAt: '2025-07-20T10:00:00Z' },
        { id: 's-002', device: 'iPhone 15 Pro', browser: 'Safari 18', ip: '203.104.42.16', location: 'Tokyo, JP', lastActive: new Date(Date.now() - 86400_000).toISOString(), createdAt: '2025-07-25T08:30:00Z' },
      ],
      recentHistory: [
        { id: 'h-001', contentTitle: 'Jujutsu Kaisen S2', contentType: 'series', watchedAt: new Date(Date.now() - 180_000).toISOString(), progressPercent: 85 },
        { id: 'h-002', contentTitle: 'One Piece Film: Red', contentType: 'movie', watchedAt: new Date(Date.now() - 86400_000).toISOString(), progressPercent: 100 },
      ],
      permissions: ['content:read', 'profile:edit', 'subscription:manage'],
    },
    {
      id: 'usr-002', username: 'sarah.connor', email: 'sarah.connor@proton.me', avatarUrl: null,
      status: 'active', role: 'admin', subscription: 'enterprise', country: 'US',
      createdAt: '2023-11-01T14:20:00Z', lastActivity: new Date(Date.now() - 300_000).toISOString(),
      lastLogin: new Date(Date.now() - 300_000).toISOString(), emailVerified: true,
      oauthProvider: null, bio: 'Platform administrator',
      stats: { watchTimeMinutes: 8200, contentWatched: 215, favorites: 12, lists: 3, historyEntries: 890 },
      sessions: [
        { id: 's-003', device: 'ThinkPad X1', browser: 'Firefox 128', ip: '198.51.100.42', location: 'San Francisco, US', lastActive: new Date(Date.now() - 300_000).toISOString(), createdAt: '2025-07-25T06:00:00Z' },
      ],
      recentHistory: [
        { id: 'h-003', contentTitle: 'The Bear S3', contentType: 'series', watchedAt: new Date(Date.now() - 300_000).toISOString(), progressPercent: 45 },
      ],
      permissions: ['content:read', 'content:write', 'users:read', 'users:write', 'users:delete', 'settings:manage', 'analytics:read'],
    },
    {
      id: 'usr-003', username: 'lucas_martin', email: 'lucas.martin@orange.fr', avatarUrl: null,
      status: 'active', role: 'moderator', subscription: 'premium', country: 'FR',
      createdAt: '2024-01-20T09:15:00Z', lastActivity: new Date(Date.now() - 600_000).toISOString(),
      lastLogin: new Date(Date.now() - 600_000).toISOString(), emailVerified: true,
      oauthProvider: 'github', bio: 'French cinema lover',
      stats: { watchTimeMinutes: 15600, contentWatched: 489, favorites: 67, lists: 12, historyEntries: 2103 },
      sessions: [
        { id: 's-004', device: 'iPad Pro M4', browser: 'Safari 18', ip: '90.45.12.88', location: 'Paris, FR', lastActive: new Date(Date.now() - 600_000).toISOString(), createdAt: '2025-07-24T14:00:00Z' },
        { id: 's-005', device: 'MacBook Air', browser: 'Chrome 124', ip: '90.45.12.89', location: 'Paris, FR', lastActive: new Date(Date.now() - 86400_000 * 2).toISOString(), createdAt: '2025-07-23T09:00:00Z' },
      ],
      recentHistory: [
        { id: 'h-004', contentTitle: 'Les Misérables (2019)', contentType: 'movie', watchedAt: new Date(Date.now() - 600_000).toISOString(), progressPercent: 100 },
        { id: 'h-005', contentTitle: 'Lupin S3', contentType: 'series', watchedAt: new Date(Date.now() - 86400_000).toISOString(), progressPercent: 72 },
      ],
      permissions: ['content:read', 'profile:edit', 'moderation:read', 'moderation:warn', 'moderation:ban'],
    },
    {
      id: 'usr-004', username: 'emma_schmidt', email: 'emma.schmidt@web.de', avatarUrl: null,
      status: 'suspended', role: 'user', subscription: 'free', country: 'DE',
      createdAt: '2024-06-10T11:45:00Z', lastActivity: new Date(Date.now() - 86400_000 * 5).toISOString(),
      lastLogin: new Date(Date.now() - 86400_000 * 5).toISOString(), emailVerified: true,
      oauthProvider: null, bio: null,
      stats: { watchTimeMinutes: 3200, contentWatched: 87, favorites: 5, lists: 1, historyEntries: 234 },
      sessions: [],
      recentHistory: [],
      permissions: ['content:read', 'profile:edit'],
    },
    {
      id: 'usr-005', username: 'diego_garcia', email: 'diego.garcia@gmail.com', avatarUrl: null,
      status: 'active', role: 'user', subscription: 'premium', country: 'ES',
      createdAt: '2024-02-28T16:00:00Z', lastActivity: new Date(Date.now() - 420_000).toISOString(),
      lastLogin: new Date(Date.now() - 420_000).toISOString(), emailVerified: true,
      oauthProvider: 'google', bio: 'Horror & thriller fan',
      stats: { watchTimeMinutes: 9800, contentWatched: 267, favorites: 34, lists: 7, historyEntries: 987 },
      sessions: [
        { id: 's-006', device: 'PS5', browser: 'PlayStation Browser', ip: '85.46.12.33', location: 'Madrid, ES', lastActive: new Date(Date.now() - 420_000).toISOString(), createdAt: '2025-07-25T11:00:00Z' },
      ],
      recentHistory: [
        { id: 'h-006', contentTitle: 'The Conjuring 4', contentType: 'movie', watchedAt: new Date(Date.now() - 420_000).toISOString(), progressPercent: 100 },
      ],
      permissions: ['content:read', 'profile:edit', 'subscription:manage'],
    },
    {
      id: 'usr-006', username: 'chloe_dubois', email: 'chloe.dubois@laposte.net', avatarUrl: null,
      status: 'active', role: 'user', subscription: 'enterprise', country: 'FR',
      createdAt: '2023-09-05T07:30:00Z', lastActivity: new Date(Date.now() - 120_000).toISOString(),
      lastLogin: new Date(Date.now() - 120_000).toISOString(), emailVerified: true,
      oauthProvider: null, bio: 'Documentary filmmaker, research account',
      stats: { watchTimeMinutes: 22400, contentWatched: 612, favorites: 89, lists: 24, historyEntries: 3456 },
      sessions: [
        { id: 's-007', device: 'Mac Studio', browser: 'Safari 18', ip: '90.45.12.100', location: 'Lyon, FR', lastActive: new Date(Date.now() - 120_000).toISOString(), createdAt: '2025-07-25T12:00:00Z' },
        { id: 's-008', device: 'iPad Air', browser: 'Safari 18', ip: '90.45.12.101', location: 'Lyon, FR', lastActive: new Date(Date.now() - 86400_000).toISOString(), createdAt: '2025-07-24T18:00:00Z' },
        { id: 's-009', device: 'iPhone 14', browser: 'Safari 18', ip: '90.45.12.102', location: 'Lyon, FR', lastActive: new Date(Date.now() - 86400_000 * 3).toISOString(), createdAt: '2025-07-22T08:00:00Z' },
      ],
      recentHistory: [
        { id: 'h-007', contentTitle: 'Planet Earth III', contentType: 'series', watchedAt: new Date(Date.now() - 120_000).toISOString(), progressPercent: 60 },
        { id: 'h-008', contentTitle: 'Our Planet S2', contentType: 'series', watchedAt: new Date(Date.now() - 86400_000).toISOString(), progressPercent: 100 },
      ],
      permissions: ['content:read', 'profile:edit', 'subscription:manage', 'api:access'],
    },
    {
      id: 'usr-007', username: 'tom_baker', email: 'tom.baker@outlook.com', avatarUrl: null,
      status: 'banned', role: 'user', subscription: 'free', country: 'GB',
      createdAt: '2024-08-12T13:00:00Z', lastActivity: new Date(Date.now() - 86400_000 * 12).toISOString(),
      lastLogin: new Date(Date.now() - 86400_000 * 12).toISOString(), emailVerified: true,
      oauthProvider: 'microsoft', bio: null,
      stats: { watchTimeMinutes: 1800, contentWatched: 42, favorites: 2, lists: 0, historyEntries: 98 },
      sessions: [],
      recentHistory: [],
      permissions: [],
    },
    {
      id: 'usr-008', username: 'yuki_tanaka', email: 'yuki.tanaka@yahoo.co.jp', avatarUrl: null,
      status: 'active', role: 'user', subscription: 'premium', country: 'JP',
      createdAt: '2024-04-22T05:10:00Z', lastActivity: new Date(Date.now() - 900_000).toISOString(),
      lastLogin: new Date(Date.now() - 900_000).toISOString(), emailVerified: true,
      oauthProvider: 'google', bio: 'Sci-fi & mecha enthusiast',
      stats: { watchTimeMinutes: 7600, contentWatched: 198, favorites: 22, lists: 4, historyEntries: 678 },
      sessions: [
        { id: 's-010', device: 'Galaxy S24 Ultra', browser: 'Samsung Browser', ip: '126.72.44.88', location: 'Osaka, JP', lastActive: new Date(Date.now() - 900_000).toISOString(), createdAt: '2025-07-25T09:00:00Z' },
      ],
      recentHistory: [
        { id: 'h-009', contentTitle: 'Mobile Suit Gundam: Witch from Mercury S2', contentType: 'series', watchedAt: new Date(Date.now() - 900_000).toISOString(), progressPercent: 90 },
      ],
      permissions: ['content:read', 'profile:edit', 'subscription:manage'],
    },
    {
      id: 'usr-009', username: 'olivia_johnson', email: 'olivia.j@fastmail.com', avatarUrl: null,
      status: 'pending', role: 'user', subscription: 'free', country: 'AU',
      createdAt: new Date(Date.now() - 86400_000 * 2).toISOString(), lastActivity: new Date(Date.now() - 86400_000 * 2).toISOString(),
      lastLogin: new Date(Date.now() - 86400_000 * 2).toISOString(), emailVerified: false,
      oauthProvider: null, bio: null,
      stats: { watchTimeMinutes: 0, contentWatched: 0, favorites: 0, lists: 0, historyEntries: 0 },
      sessions: [],
      recentHistory: [],
      permissions: ['content:read', 'profile:edit'],
    },
    {
      id: 'usr-010', username: 'marco_rossi', email: 'marco.rossi@libero.it', avatarUrl: null,
      status: 'active', role: 'user', subscription: 'free', country: 'IT',
      createdAt: '2024-07-01T10:20:00Z', lastActivity: new Date(Date.now() - 3600_000).toISOString(),
      lastLogin: new Date(Date.now() - 3600_000).toISOString(), emailVerified: true,
      oauthProvider: 'google', bio: null,
      stats: { watchTimeMinutes: 4100, contentWatched: 112, favorites: 8, lists: 2, historyEntries: 345 },
      sessions: [
        { id: 's-011', device: 'Smart TV LG', browser: 'webOS Browser', ip: '93.45.67.12', location: 'Rome, IT', lastActive: new Date(Date.now() - 3600_000).toISOString(), createdAt: '2025-07-25T07:00:00Z' },
      ],
      recentHistory: [
        { id: 'h-010', contentTitle: 'Suburra S3', contentType: 'series', watchedAt: new Date(Date.now() - 3600_000).toISOString(), progressPercent: 30 },
      ],
      permissions: ['content:read', 'profile:edit'],
    },
    {
      id: 'usr-011', username: 'anna_andersson', email: 'anna.andersson@icloud.com', avatarUrl: null,
      status: 'active', role: 'moderator', subscription: 'premium', country: 'SE',
      createdAt: '2023-12-10T08:00:00Z', lastActivity: new Date(Date.now() - 240_000).toISOString(),
      lastLogin: new Date(Date.now() - 240_000).toISOString(), emailVerified: true,
      oauthProvider: null, bio: 'Nordic cinema specialist & community moderator',
      stats: { watchTimeMinutes: 18200, contentWatched: 534, favorites: 78, lists: 15, historyEntries: 2890 },
      sessions: [
        { id: 's-012', device: 'Dell XPS 15', browser: 'Firefox 128', ip: '85.24.12.45', location: 'Stockholm, SE', lastActive: new Date(Date.now() - 240_000).toISOString(), createdAt: '2025-07-25T10:30:00Z' },
      ],
      recentHistory: [
        { id: 'h-011', contentTitle: 'The Bridge S4', contentType: 'series', watchedAt: new Date(Date.now() - 240_000).toISOString(), progressPercent: 55 },
      ],
      permissions: ['content:read', 'profile:edit', 'moderation:read', 'moderation:warn', 'moderation:ban'],
    },
    {
      id: 'usr-012', username: 'pedro_silva', email: 'pedro.silva@gmail.com', avatarUrl: null,
      status: 'active', role: 'user', subscription: 'enterprise', country: 'BR',
      createdAt: '2024-01-05T12:00:00Z', lastActivity: new Date(Date.now() - 600_000).toISOString(),
      lastLogin: new Date(Date.now() - 600_000).toISOString(), emailVerified: true,
      oauthProvider: 'google', bio: 'Content curator for Brazilian market',
      stats: { watchTimeMinutes: 14200, contentWatched: 398, favorites: 56, lists: 18, historyEntries: 1678 },
      sessions: [
        { id: 's-013', device: 'MacBook Pro 14"', browser: 'Chrome 124', ip: '177.45.23.88', location: 'São Paulo, BR', lastActive: new Date(Date.now() - 600_000).toISOString(), createdAt: '2025-07-25T08:00:00Z' },
        { id: 's-014', device: 'iPhone 15', browser: 'Safari 18', ip: '177.45.23.89', location: 'São Paulo, BR', lastActive: new Date(Date.now() - 86400_000).toISOString(), createdAt: '2025-07-24T12:00:00Z' },
      ],
      recentHistory: [
        { id: 'h-012', contentTitle: '3% S4', contentType: 'series', watchedAt: new Date(Date.now() - 600_000).toISOString(), progressPercent: 100 },
      ],
      permissions: ['content:read', 'profile:edit', 'subscription:manage', 'api:access'],
    },
    {
      id: 'usr-013', username: 'lisa_van_berg', email: 'lisa.vanberg@gmail.com', avatarUrl: null,
      status: 'active', role: 'user', subscription: 'premium', country: 'NL',
      createdAt: '2024-05-18T14:30:00Z', lastActivity: new Date(Date.now() - 540_000).toISOString(),
      lastLogin: new Date(Date.now() - 540_000).toISOString(), emailVerified: true,
      oauthProvider: null, bio: 'Dutch thriller fan',
      stats: { watchTimeMinutes: 6800, contentWatched: 178, favorites: 19, lists: 6, historyEntries: 567 },
      sessions: [
        { id: 's-015', device: 'Pixel 8 Pro', browser: 'Chrome Mobile', ip: '82.161.34.21', location: 'Amsterdam, NL', lastActive: new Date(Date.now() - 540_000).toISOString(), createdAt: '2025-07-25T09:30:00Z' },
      ],
      recentHistory: [
        { id: 'h-013', contentTitle: 'Undercover S5', contentType: 'series', watchedAt: new Date(Date.now() - 540_000).toISOString(), progressPercent: 40 },
      ],
      permissions: ['content:read', 'profile:edit', 'subscription:manage'],
    },
    {
      id: 'usr-014', username: 'james_wilson', email: 'james.wilson@yahoo.com', avatarUrl: null,
      status: 'pending', role: 'user', subscription: 'free', country: 'CA',
      createdAt: new Date(Date.now() - 86400_000).toISOString(), lastActivity: new Date(Date.now() - 86400_000).toISOString(),
      lastLogin: new Date(Date.now() - 86400_000).toISOString(), emailVerified: false,
      oauthProvider: 'apple', bio: null,
      stats: { watchTimeMinutes: 0, contentWatched: 0, favorites: 0, lists: 0, historyEntries: 0 },
      sessions: [],
      recentHistory: [],
      permissions: ['content:read', 'profile:edit'],
    },
    {
      id: 'usr-015', username: 'mika_kowalski', email: 'mika.kowalski@wp.pl', avatarUrl: null,
      status: 'active', role: 'user', subscription: 'free', country: 'PL',
      createdAt: '2024-09-20T09:00:00Z', lastActivity: new Date(Date.now() - 1200_000).toISOString(),
      lastLogin: new Date(Date.now() - 1200_000).toISOString(), emailVerified: true,
      oauthProvider: 'google', bio: null,
      stats: { watchTimeMinutes: 2400, contentWatched: 65, favorites: 4, lists: 1, historyEntries: 178 },
      sessions: [
        { id: 's-016', device: 'Windows PC', browser: 'Edge 124', ip: '91.200.45.67', location: 'Warsaw, PL', lastActive: new Date(Date.now() - 1200_000).toISOString(), createdAt: '2025-07-25T06:00:00Z' },
      ],
      recentHistory: [
        { id: 'h-014', contentTitle: 'The Witcher S3', contentType: 'series', watchedAt: new Date(Date.now() - 1200_000).toISOString(), progressPercent: 20 },
      ],
      permissions: ['content:read', 'profile:edit'],
    },
    {
      id: 'usr-016', username: 'sofia_hernandez', email: 'sofia.hernandez@outlook.com', avatarUrl: null,
      status: 'suspended', role: 'user', subscription: 'premium', country: 'MX',
      createdAt: '2024-03-10T11:00:00Z', lastActivity: new Date(Date.now() - 86400_000 * 8).toISOString(),
      lastLogin: new Date(Date.now() - 86400_000 * 8).toISOString(), emailVerified: true,
      oauthProvider: null, bio: null,
      stats: { watchTimeMinutes: 5400, contentWatched: 145, favorites: 12, lists: 3, historyEntries: 456 },
      sessions: [],
      recentHistory: [],
      permissions: ['content:read', 'profile:edit'],
    },
    {
      id: 'usr-017', username: 'kai_mueller', email: 'kai.mueller@gmx.de', avatarUrl: null,
      status: 'active', role: 'user', subscription: 'premium', country: 'DE',
      createdAt: '2024-02-14T16:45:00Z', lastActivity: new Date(Date.now() - 180_000).toISOString(),
      lastLogin: new Date(Date.now() - 180_000).toISOString(), emailVerified: true,
      oauthProvider: 'github', bio: 'German dubbing quality analyst',
      stats: { watchTimeMinutes: 11200, contentWatched: 312, favorites: 45, lists: 9, historyEntries: 1456 },
      sessions: [
        { id: 's-017', device: 'Framework 16', browser: 'Firefox 128', ip: '85.214.34.12', location: 'Berlin, DE', lastActive: new Date(Date.now() - 180_000).toISOString(), createdAt: '2025-07-25T11:30:00Z' },
      ],
      recentHistory: [
        { id: 'h-015', contentTitle: 'Dark S3', contentType: 'series', watchedAt: new Date(Date.now() - 180_000).toISOString(), progressPercent: 100 },
      ],
      permissions: ['content:read', 'profile:edit', 'subscription:manage'],
    },
    {
      id: 'usr-018', username: 'grace_kim', email: 'grace.kim@naver.com', avatarUrl: null,
      status: 'active', role: 'user', subscription: 'free', country: 'KR',
      createdAt: '2024-08-01T03:00:00Z', lastActivity: new Date(Date.now() - 720_000).toISOString(),
      lastLogin: new Date(Date.now() - 720_000).toISOString(), emailVerified: true,
      oauthProvider: 'google', bio: 'K-drama binge watcher',
      stats: { watchTimeMinutes: 8900, contentWatched: 234, favorites: 31, lists: 8, historyEntries: 890 },
      sessions: [
        { id: 's-018', device: 'Galaxy Tab S9', browser: 'Samsung Browser', ip: '121.160.23.44', location: 'Seoul, KR', lastActive: new Date(Date.now() - 720_000).toISOString(), createdAt: '2025-07-25T08:00:00Z' },
      ],
      recentHistory: [
        { id: 'h-016', contentTitle: 'Squid Game S2', contentType: 'series', watchedAt: new Date(Date.now() - 720_000).toISOString(), progressPercent: 75 },
      ],
      permissions: ['content:read', 'profile:edit'],
    },
  ],
}
