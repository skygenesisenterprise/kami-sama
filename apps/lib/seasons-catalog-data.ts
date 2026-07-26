import type { StatusTone } from '@/components/dash/status-badge'

export type PublicationState =
  | 'Draft'
  | 'Review'
  | 'Approved'
  | 'Scheduled'
  | 'Published'
  | 'Archived'

export type DataSource =
  | 'TMDB'
  | 'IMDb'
  | 'TheTVDB'
  | 'AniList'
  | 'MyAnimeList'
  | 'Kitsu'

export type MetadataStatus = 'synced' | 'stale' | 'error' | 'missing'

export interface ExternalIds {
  tmdb?: string
  imdb?: string
  thetvdb?: string
  anilist?: string
}

export interface SeasonSource {
  provider: DataSource
  externalId: string
  lastSyncedAt: string
  status: 'active' | 'inactive' | 'error'
}

export interface SeasonAsset {
  poster: string
  banner: string
}

export interface SeasonItem {
  id: string
  seriesId: string
  seriesTitle: string
  number: number
  title: string
  synopsis: string
  status: PublicationState
  episodeCount: number
  year: number
  aired: boolean
  assets: SeasonAsset
  externalIds: ExternalIds
  sources: SeasonSource[]
  metadataStatus: MetadataStatus
  updatedAt: string
  updatedBy: string
}

export const SEASON_STATUS_TONE: Record<PublicationState, StatusTone> = {
  Draft: 'neutral',
  Review: 'warning',
  Approved: 'info',
  Scheduled: 'warning',
  Published: 'success',
  Archived: 'destructive',
}

export const METADATA_STATUS_LABEL: Record<MetadataStatus, string> = {
  synced: 'Synced',
  stale: 'Stale',
  error: 'Error',
  missing: 'Missing',
}

export const ALL_SEASON_STATUSES: Array<PublicationState | 'all'> = [
  'all',
  'Draft',
  'Review',
  'Approved',
  'Scheduled',
  'Published',
  'Archived',
]

export const ALL_DATA_SOURCES: Array<DataSource | 'all'> = [
  'all',
  'TMDB',
  'IMDb',
  'TheTVDB',
  'AniList',
  'MyAnimeList',
  'Kitsu',
]

export const SEASONS_MOCK: SeasonItem[] = [
  // ── Eternal Frost ─────────────────────────────────────
  {
    id: 'sea-001',
    seriesId: 'ser-001',
    seriesTitle: 'Eternal Frost',
    number: 1,
    title: 'Season 1',
    synopsis:
      'Liora awakens in a world that no longer remembers the demon war. Across twelve episodes she journeys from the northern wastes to the capital, discovering that peace has its own scars.',
    status: 'Published',
    episodeCount: 12,
    year: 2024,
    aired: true,
    assets: {
      poster: '/covers/eternal-frost.png',
      banner: '/banners/eternal-frost-banner.png',
    },
    externalIds: {
      anilist: '12847',
      tmdb: '98765',
      imdb: 'tt1234567',
    },
    sources: [
      { provider: 'AniList', externalId: '12847', lastSyncedAt: '2h ago', status: 'active' },
      { provider: 'TMDB', externalId: '98765', lastSyncedAt: '1h ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '2h ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'sea-002',
    seriesId: 'ser-001',
    seriesTitle: 'Eternal Frost',
    number: 2,
    title: 'Season 2',
    synopsis:
      'The journey continues south. Liora reaches the coast where an ancient elven city lies buried beneath the tide, and confronts the first signs that the demon war never truly ended.',
    status: 'Published',
    episodeCount: 8,
    year: 2025,
    aired: true,
    assets: {
      poster: '/covers/eternal-frost.png',
      banner: '/banners/eternal-frost-banner.png',
    },
    externalIds: {
      anilist: '12848',
      tmdb: '98766',
    },
    sources: [
      { provider: 'AniList', externalId: '12848', lastSyncedAt: '1h ago', status: 'active' },
      { provider: 'TMDB', externalId: '98766', lastSyncedAt: '1h ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '1h ago',
    updatedBy: 'auto-import',
  },
  // ── Crimson Blade ─────────────────────────────────────
  {
    id: 'sea-003',
    seriesId: 'ser-002',
    seriesTitle: 'Crimson Blade',
    number: 1,
    title: 'Season 1',
    synopsis:
      'A wandering swordsman with a scarlet scarf hunts the corrupt lords who destroyed his village. Each strike of his blade brings him closer to the truth — and further from the man he used to be.',
    status: 'Published',
    episodeCount: 12,
    year: 2023,
    aired: true,
    assets: {
      poster: '/covers/crimson-blade.png',
      banner: '/banners/crimson-blade-banner.png',
    },
    externalIds: {
      anilist: '11234',
      tmdb: '87654',
    },
    sources: [
      { provider: 'AniList', externalId: '11234', lastSyncedAt: '1d ago', status: 'active' },
      { provider: 'TMDB', externalId: '87654', lastSyncedAt: '1d ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '1d ago',
    updatedBy: 'auto-import',
  },
  // ── Neon Orbit ────────────────────────────────────────
  {
    id: 'sea-004',
    seriesId: 'ser-003',
    seriesTitle: 'Neon Orbit',
    number: 1,
    title: 'Season 1',
    synopsis:
      'Ace pilot Kai bonds with an experimental AI-driven mech. Together they are drawn into a conspiracy that could send the entire orbital colony crashing back to Earth.',
    status: 'Published',
    episodeCount: 10,
    year: 2025,
    aired: true,
    assets: {
      poster: '/covers/neon-orbit.png',
      banner: '/banners/neon-orbit-banner.png',
    },
    externalIds: {
      anilist: '15678',
      tmdb: '76543',
    },
    sources: [
      { provider: 'AniList', externalId: '15678', lastSyncedAt: '4h ago', status: 'active' },
      { provider: 'TMDB', externalId: '76543', lastSyncedAt: '3h ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '4h ago',
    updatedBy: 'auto-import',
  },
  // ── Spirit Veil ───────────────────────────────────────
  {
    id: 'sea-005',
    seriesId: 'ser-004',
    seriesTitle: 'Spirit Veil',
    number: 1,
    title: 'Season 1',
    synopsis:
      'A young shrine maiden discovers she can see the spirits that drift between our world and the next. When restless souls begin gathering in her mountain town, she must learn to guide them home.',
    status: 'Published',
    episodeCount: 11,
    year: 2024,
    aired: true,
    assets: {
      poster: '/covers/spirit-veil.png',
      banner: '/banners/eternal-frost-banner.png',
    },
    externalIds: {
      anilist: '13456',
      tmdb: '65432',
    },
    sources: [
      { provider: 'AniList', externalId: '13456', lastSyncedAt: '6h ago', status: 'active' },
      { provider: 'TMDB', externalId: '65432', lastSyncedAt: '5h ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '6h ago',
    updatedBy: 'auto-import',
  },
  // ── After School Skies ────────────────────────────────
  {
    id: 'sea-006',
    seriesId: 'ser-005',
    seriesTitle: 'After School Skies',
    number: 1,
    title: 'Season 1',
    synopsis:
      'Three friends in their final year of high school make a pact to chase one impossible dream each before graduation. A tender, funny, and bittersweet story about the last golden days.',
    status: 'Published',
    episodeCount: 13,
    year: 2023,
    aired: true,
    assets: {
      poster: '/covers/after-school-skies.png',
      banner: '/banners/eternal-frost-banner.png',
    },
    externalIds: {
      anilist: '10987',
      tmdb: '54321',
    },
    sources: [
      { provider: 'AniList', externalId: '10987', lastSyncedAt: '3d ago', status: 'active' },
      { provider: 'TMDB', externalId: '54321', lastSyncedAt: '2d ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '3d ago',
    updatedBy: 'admin',
  },
  // ── Hollow Kingdom ────────────────────────────────────
  {
    id: 'sea-007',
    seriesId: 'ser-006',
    seriesTitle: 'Hollow Kingdom',
    number: 1,
    title: 'Season 1',
    synopsis:
      'The last knight of a fallen realm awakens beneath a ruined cathedral with no memory and a cursed blade. To reclaim his name he must descend through the hollow kingdom.',
    status: 'Draft',
    episodeCount: 12,
    year: 2025,
    aired: false,
    assets: {
      poster: '/covers/hollow-kingdom.png',
      banner: '/banners/crimson-blade-banner.png',
    },
    externalIds: {
      anilist: '16789',
    },
    sources: [
      { provider: 'AniList', externalId: '16789', lastSyncedAt: '1d ago', status: 'active' },
    ],
    metadataStatus: 'stale',
    updatedAt: '5d ago',
    updatedBy: 'admin',
  },
  // ── Last Serve ────────────────────────────────────────
  {
    id: 'sea-008',
    seriesId: 'ser-007',
    seriesTitle: 'Last Serve',
    number: 1,
    title: 'Season 1',
    synopsis:
      'A washed-up volleyball prodigy returns to his hometown court to coach a ragtag high school team with more heart than talent. Their road to nationals starts with a single impossible serve.',
    status: 'Published',
    episodeCount: 14,
    year: 2024,
    aired: true,
    assets: {
      poster: '/covers/last-serve.png',
      banner: '/banners/neon-orbit-banner.png',
    },
    externalIds: {
      anilist: '14321',
      tmdb: '43210',
    },
    sources: [
      { provider: 'AniList', externalId: '14321', lastSyncedAt: '12h ago', status: 'active' },
      { provider: 'TMDB', externalId: '43210', lastSyncedAt: '8h ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '12h ago',
    updatedBy: 'auto-import',
  },
  // ── Starfall Academy ──────────────────────────────────
  {
    id: 'sea-009',
    seriesId: 'ser-008',
    seriesTitle: 'Starfall Academy',
    number: 1,
    title: 'Season 1',
    synopsis:
      'At a prestigious academy orbiting Earth, gifted cadets train to defend the solar system. When a first-year student discovers she can interface with ancient alien technology, everything changes.',
    status: 'Review',
    episodeCount: 12,
    year: 2025,
    aired: true,
    assets: {
      poster: '/covers/neon-orbit.png',
      banner: '/banners/neon-orbit-banner.png',
    },
    externalIds: {
      anilist: '17890',
      tmdb: '32109',
    },
    sources: [
      { provider: 'AniList', externalId: '17890', lastSyncedAt: '2d ago', status: 'active' },
    ],
    metadataStatus: 'stale',
    updatedAt: '2d ago',
    updatedBy: 'admin',
  },
  // ── Blade of the Fallen ───────────────────────────────
  {
    id: 'sea-010',
    seriesId: 'ser-009',
    seriesTitle: 'Blade of the Fallen',
    number: 1,
    title: 'Season 1',
    synopsis:
      'A disgraced knight is resurrected by a vengeful spirit with one condition: wield the cursed blade until the one who betrayed him falls.',
    status: 'Published',
    episodeCount: 13,
    year: 2025,
    aired: true,
    assets: {
      poster: '/covers/crimson-blade.png',
      banner: '/banners/crimson-blade-banner.png',
    },
    externalIds: {
      anilist: '18901',
      tmdb: '21098',
    },
    sources: [
      { provider: 'AniList', externalId: '18901', lastSyncedAt: '6h ago', status: 'active' },
      { provider: 'TMDB', externalId: '21098', lastSyncedAt: '5h ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '6h ago',
    updatedBy: 'auto-import',
  },
  // ── Neon Samurai ──────────────────────────────────────
  {
    id: 'sea-011',
    seriesId: 'ser-010',
    seriesTitle: 'Neon Samurai',
    number: 1,
    title: 'Season 1',
    synopsis:
      'In rain-soaked Neo-Kyoto 2187, a ronin without a clan takes mercenary jobs while searching for the AI that murdered his master.',
    status: 'Published',
    episodeCount: 12,
    year: 2024,
    aired: true,
    assets: {
      poster: '/covers/neon-orbit.png',
      banner: '/banners/neon-orbit-banner.png',
    },
    externalIds: {
      anilist: '12345',
      tmdb: '98765',
      imdb: 'tt9876543',
    },
    sources: [
      { provider: 'AniList', externalId: '12345', lastSyncedAt: '1d ago', status: 'active' },
      { provider: 'TMDB', externalId: '98765', lastSyncedAt: '1d ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '1d ago',
    updatedBy: 'admin',
  },
  // ── Ember Crown ───────────────────────────────────────
  {
    id: 'sea-012',
    seriesId: 'ser-011',
    seriesTitle: 'Ember Crown',
    number: 1,
    title: 'Season 1',
    synopsis:
      'When the fire god chooses a peasant girl as the new Flame Sovereign, the five noble houses unite against her. She must master her power before the kingdom tears itself apart.',
    status: 'Draft',
    episodeCount: 24,
    year: 2025,
    aired: false,
    assets: {
      poster: '/covers/hollow-kingdom.png',
      banner: '/banners/crimson-blade-banner.png',
    },
    externalIds: {
      anilist: '19012',
    },
    sources: [
      { provider: 'AniList', externalId: '19012', lastSyncedAt: '7d ago', status: 'active' },
    ],
    metadataStatus: 'error',
    updatedAt: '7d ago',
    updatedBy: 'admin',
  },
  // ── Thunder League ────────────────────────────────────
  {
    id: 'sea-013',
    seriesId: 'ser-012',
    seriesTitle: 'Thunder League',
    number: 1,
    title: 'Season 1',
    synopsis:
      'In a world where soccer matches are decided by both skill and elemental power, a boy with no affinity for magic joins an underdog team.',
    status: 'Approved',
    episodeCount: 24,
    year: 2025,
    aired: true,
    assets: {
      poster: '/covers/last-serve.png',
      banner: '/banners/neon-orbit-banner.png',
    },
    externalIds: {
      anilist: '20123',
      tmdb: '10987',
    },
    sources: [
      { provider: 'AniList', externalId: '20123', lastSyncedAt: '1d ago', status: 'active' },
      { provider: 'TMDB', externalId: '10987', lastSyncedAt: '1d ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '1d ago',
    updatedBy: 'admin',
  },
  // ── Ocean's Whisper ───────────────────────────────────
  {
    id: 'sea-014',
    seriesId: 'ser-013',
    seriesTitle: "Ocean's Whisper",
    number: 1,
    title: 'Season 1',
    synopsis:
      'A marine biologist returns to her coastal hometown and reunites with the childhood friend who once promised to show her every secret the ocean held.',
    status: 'Scheduled',
    episodeCount: 12,
    year: 2025,
    aired: true,
    assets: {
      poster: '/covers/letter-to-spring.png',
      banner: '/banners/eternal-frost-banner.png',
    },
    externalIds: {
      tmdb: '87654',
    },
    sources: [
      { provider: 'TMDB', externalId: '87654', lastSyncedAt: '4h ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '4h ago',
    updatedBy: 'auto-import',
  },
  // ── Crimson Vow ───────────────────────────────────────
  {
    id: 'sea-015',
    seriesId: 'ser-014',
    seriesTitle: 'Crimson Vow',
    number: 1,
    title: 'Season 1',
    synopsis:
      'A vampire countess breaks her ancient blood oath to protect a human scholar she has loved across centuries.',
    status: 'Archived',
    episodeCount: 12,
    year: 2024,
    aired: true,
    assets: {
      poster: '/covers/eternal-frost.png',
      banner: '/banners/crimson-blade-banner.png',
    },
    externalIds: {
      anilist: '14567',
      tmdb: '76543',
    },
    sources: [
      { provider: 'AniList', externalId: '14567', lastSyncedAt: '5d ago', status: 'inactive' },
      { provider: 'TMDB', externalId: '76543', lastSyncedAt: '5d ago', status: 'inactive' },
    ],
    metadataStatus: 'stale',
    updatedAt: '5d ago',
    updatedBy: 'admin',
  },
]

export function getSeasonStats(seasons: SeasonItem[]) {
  const total = seasons.length
  const published = seasons.filter((s) => s.status === 'Published').length
  const drafts = seasons.filter((s) => s.status === 'Draft').length
  const metadataErrors = seasons.filter(
    (s) => s.metadataStatus === 'error' || s.metadataStatus === 'missing',
  ).length
  const inReview = seasons.filter((s) => s.status === 'Review').length
  const archived = seasons.filter((s) => s.status === 'Archived').length
  const totalEpisodes = seasons.reduce((acc, s) => acc + s.episodeCount, 0)
  const totalSeries = new Set(seasons.map((s) => s.seriesId)).size

  return {
    total,
    published,
    drafts,
    metadataErrors,
    inReview,
    archived,
    totalEpisodes,
    totalSeries,
  }
}
