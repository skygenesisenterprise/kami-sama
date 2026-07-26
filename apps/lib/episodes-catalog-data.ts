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

export interface EpisodeSource {
  provider: DataSource
  externalId: string
  lastSyncedAt: string
  status: 'active' | 'inactive' | 'error'
}

export interface EpisodeAsset {
  thumbnail: string
  still: string
}

export interface EpisodeItem {
  id: string
  slug: string
  seriesId: string
  seriesTitle: string
  seasonNumber: number
  episodeNumber: number
  title: string
  synopsis: string
  status: PublicationState
  duration: number
  airDate: string
  rating: number
  assets: EpisodeAsset
  externalIds: ExternalIds
  sources: EpisodeSource[]
  metadataStatus: MetadataStatus
  updatedAt: string
  updatedBy: string
}

export const EPISODE_STATUS_TONE: Record<PublicationState, StatusTone> = {
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

export const ALL_EPISODE_STATUSES: Array<PublicationState | 'all'> = [
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

export const EPISODES_MOCK: EpisodeItem[] = [
  // ── Eternal Frost S1 ──────────────────────────────────
  {
    id: 'ep-001',
    slug: 'eternal-frost-s1e1',
    seriesId: 'ser-001',
    seriesTitle: 'Eternal Frost',
    seasonNumber: 1,
    episodeNumber: 1,
    title: 'The Waking World',
    synopsis:
      'Liora awakens from a centuries-long slumber to find the demon war over and the world transformed beyond recognition.',
    status: 'Published',
    duration: 1440,
    airDate: '2024-01-07',
    rating: 9.1,
    assets: {
      thumbnail: '/covers/eternal-frost.png',
      still: '/banners/eternal-frost-banner.png',
    },
    externalIds: {
      anilist: '1284701',
      tmdb: '9876501',
      imdb: 'tt12345671',
    },
    sources: [
      { provider: 'AniList', externalId: '1284701', lastSyncedAt: '2h ago', status: 'active' },
      { provider: 'TMDB', externalId: '9876501', lastSyncedAt: '1h ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '2h ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'ep-002',
    slug: 'eternal-frost-s1e2',
    seriesId: 'ser-001',
    seriesTitle: 'Eternal Frost',
    seasonNumber: 1,
    episodeNumber: 2,
    title: 'Echoes of the Past',
    synopsis:
      'Liora visits a village that once welcomed her as a hero, only to find the descendants of her old companions have forgotten the war entirely.',
    status: 'Published',
    duration: 1440,
    airDate: '2024-01-14',
    rating: 8.9,
    assets: {
      thumbnail: '/covers/eternal-frost.png',
      still: '/banners/eternal-frost-banner.png',
    },
    externalIds: {
      anilist: '1284702',
      tmdb: '9876502',
    },
    sources: [
      { provider: 'AniList', externalId: '1284702', lastSyncedAt: '2h ago', status: 'active' },
      { provider: 'TMDB', externalId: '9876502', lastSyncedAt: '2h ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '2h ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'ep-003',
    slug: 'eternal-frost-s1e3',
    seriesId: 'ser-001',
    seriesTitle: 'Eternal Frost',
    seasonNumber: 1,
    episodeNumber: 3,
    title: 'The Cartographer',
    synopsis:
      'A young mapmaker joins Liora\'s journey, eager to chart lands that no living person has documented.',
    status: 'Published',
    duration: 1440,
    airDate: '2024-01-21',
    rating: 8.7,
    assets: {
      thumbnail: '/covers/eternal-frost.png',
      still: '/banners/eternal-frost-banner.png',
    },
    externalIds: { anilist: '1284703', tmdb: '9876503' },
    sources: [
      { provider: 'AniList', externalId: '1284703', lastSyncedAt: '3d ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '3d ago',
    updatedBy: 'admin',
  },
  {
    id: 'ep-004',
    slug: 'eternal-frost-s1e4',
    seriesId: 'ser-001',
    seriesTitle: 'Eternal Frost',
    seasonNumber: 1,
    episodeNumber: 4,
    title: 'Beneath the Ash',
    synopsis:
      'The ruins of a battlefield reveal a sealed vault containing weapons from the demon war — and something still alive inside.',
    status: 'Published',
    duration: 1440,
    airDate: '2024-01-28',
    rating: 8.8,
    assets: {
      thumbnail: '/covers/eternal-frost.png',
      still: '/banners/eternal-frost-banner.png',
    },
    externalIds: { anilist: '1284704', tmdb: '9876504' },
    sources: [
      { provider: 'AniList', externalId: '1284704', lastSyncedAt: '1d ago', status: 'active' },
    ],
    metadataStatus: 'stale',
    updatedAt: '5d ago',
    updatedBy: 'admin',
  },
  {
    id: 'ep-005',
    slug: 'eternal-frost-s1e5',
    seriesId: 'ser-001',
    seriesTitle: 'Eternal Frost',
    seasonNumber: 1,
    episodeNumber: 5,
    title: 'The Hollow Market',
    synopsis:
      'A hidden trading post thrives on artifacts salvaged from the war. Liora recognizes a relic that was once hers.',
    status: 'Draft',
    duration: 1440,
    airDate: '2024-02-04',
    rating: 0,
    assets: {
      thumbnail: '/covers/eternal-frost.png',
      still: '/banners/eternal-frost-banner.png',
    },
    externalIds: { anilist: '1284705' },
    sources: [
      { provider: 'AniList', externalId: '1284705', lastSyncedAt: '7d ago', status: 'active' },
    ],
    metadataStatus: 'error',
    updatedAt: '7d ago',
    updatedBy: 'admin',
  },
  // ── Eternal Frost S2 ──────────────────────────────────
  {
    id: 'ep-006',
    slug: 'eternal-frost-s2e1',
    seriesId: 'ser-001',
    seriesTitle: 'Eternal Frost',
    seasonNumber: 2,
    episodeNumber: 1,
    title: 'The Second Thaw',
    synopsis:
      'Season 2 opens with Liora arriving at the southern coast, where an ancient elven city lies buried beneath the tide.',
    status: 'Published',
    duration: 1440,
    airDate: '2025-01-12',
    rating: 9.0,
    assets: {
      thumbnail: '/covers/eternal-frost.png',
      still: '/banners/eternal-frost-banner.png',
    },
    externalIds: { anilist: '1284801', tmdb: '9876511' },
    sources: [
      { provider: 'AniList', externalId: '1284801', lastSyncedAt: '1h ago', status: 'active' },
      { provider: 'TMDB', externalId: '9876511', lastSyncedAt: '1h ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '1h ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'ep-007',
    slug: 'eternal-frost-s2e2',
    seriesId: 'ser-001',
    seriesTitle: 'Eternal Frost',
    seasonNumber: 2,
    episodeNumber: 2,
    title: 'Tides of Memory',
    synopsis:
      'Beneath the waves, Liora discovers a preserved memory garden — and a message left for her by a long-dead ally.',
    status: 'Published',
    duration: 1440,
    airDate: '2025-01-19',
    rating: 8.8,
    assets: {
      thumbnail: '/covers/eternal-frost.png',
      still: '/banners/eternal-frost-banner.png',
    },
    externalIds: { anilist: '1284802', tmdb: '9876512' },
    sources: [
      { provider: 'AniList', externalId: '1284802', lastSyncedAt: '2h ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '2h ago',
    updatedBy: 'auto-import',
  },
  // ── Crimson Blade S1 ──────────────────────────────────
  {
    id: 'ep-008',
    slug: 'crimson-blade-s1e1',
    seriesId: 'ser-002',
    seriesTitle: 'Crimson Blade',
    seasonNumber: 1,
    episodeNumber: 1,
    title: 'The Scarlet Scarf',
    synopsis:
      'A nameless swordsman arrives at a village ruled by a corrupt magistrate, his crimson scarf the only hint at his past.',
    status: 'Published',
    duration: 1440,
    airDate: '2023-04-05',
    rating: 9.0,
    assets: {
      thumbnail: '/covers/crimson-blade.png',
      still: '/banners/crimson-blade-banner.png',
    },
    externalIds: { anilist: '1123401', tmdb: '8765401', imdb: 'tt8765401' },
    sources: [
      { provider: 'AniList', externalId: '1123401', lastSyncedAt: '1d ago', status: 'active' },
      { provider: 'TMDB', externalId: '8765401', lastSyncedAt: '1d ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '1d ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'ep-009',
    slug: 'crimson-blade-s1e2',
    seriesId: 'ser-002',
    seriesTitle: 'Crimson Blade',
    seasonNumber: 1,
    episodeNumber: 2,
    title: 'The Gate of Thorns',
    synopsis:
      'The swordsman infiltrates the magistrate\'s fortress under cover of night, but discovers the corruption runs deeper than one man.',
    status: 'Published',
    duration: 1440,
    airDate: '2023-04-12',
    rating: 8.8,
    assets: {
      thumbnail: '/covers/crimson-blade.png',
      still: '/banners/crimson-blade-banner.png',
    },
    externalIds: { anilist: '1123402', tmdb: '8765402' },
    sources: [
      { provider: 'AniList', externalId: '1123402', lastSyncedAt: '1d ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '1d ago',
    updatedBy: 'admin',
  },
  {
    id: 'ep-010',
    slug: 'crimson-blade-s1e3',
    seriesId: 'ser-002',
    seriesTitle: 'Crimson Blade',
    seasonNumber: 1,
    episodeNumber: 3,
    title: 'Blood on the River',
    synopsis:
      'A ambush on the river road forces the swordsman to protect a group of refugees — and confront why he fights.',
    status: 'Published',
    duration: 1440,
    airDate: '2023-04-19',
    rating: 8.7,
    assets: {
      thumbnail: '/covers/crimson-blade.png',
      still: '/banners/crimson-blade-banner.png',
    },
    externalIds: { anilist: '1123403', tmdb: '8765403' },
    sources: [
      { provider: 'AniList', externalId: '1123403', lastSyncedAt: '2d ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '2d ago',
    updatedBy: 'admin',
  },
  // ── Neon Orbit S1 ─────────────────────────────────────
  {
    id: 'ep-011',
    slug: 'neon-orbit-s1e1',
    seriesId: 'ser-003',
    seriesTitle: 'Neon Orbit',
    seasonNumber: 1,
    episodeNumber: 1,
    title: 'First Contact',
    synopsis:
      'Ace pilot Kai bonds with an experimental AI mech during a routine patrol that turns into a fight for survival.',
    status: 'Published',
    duration: 1440,
    airDate: '2025-01-08',
    rating: 8.7,
    assets: {
      thumbnail: '/covers/neon-orbit.png',
      still: '/banners/neon-orbit-banner.png',
    },
    externalIds: { anilist: '1567801', tmdb: '7654301' },
    sources: [
      { provider: 'AniList', externalId: '1567801', lastSyncedAt: '4h ago', status: 'active' },
      { provider: 'TMDB', externalId: '7654301', lastSyncedAt: '3h ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '4h ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'ep-012',
    slug: 'neon-orbit-s1e2',
    seriesId: 'ser-003',
    seriesTitle: 'Neon Orbit',
    seasonNumber: 1,
    episodeNumber: 2,
    title: 'Ghost in the Wires',
    synopsis:
      'The AI begins exhibiting unexplained behavior, and Kai suspects someone is remotely accessing the mech\'s neural link.',
    status: 'Published',
    duration: 1440,
    airDate: '2025-01-15',
    rating: 8.5,
    assets: {
      thumbnail: '/covers/neon-orbit.png',
      still: '/banners/neon-orbit-banner.png',
    },
    externalIds: { anilist: '1567802', tmdb: '7654302' },
    sources: [
      { provider: 'AniList', externalId: '1567802', lastSyncedAt: '4h ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '4h ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'ep-013',
    slug: 'neon-orbit-s1e3',
    seriesId: 'ser-003',
    seriesTitle: 'Neon Orbit',
    seasonNumber: 1,
    episodeNumber: 3,
    title: 'Orbital Decay',
    synopsis:
      'A sabotage attempt sends the colony into a decaying orbit. Kai must trust the AI\'s judgment over the command center\'s.',
    status: 'Review',
    duration: 1440,
    airDate: '2025-01-22',
    rating: 0,
    assets: {
      thumbnail: '/covers/neon-orbit.png',
      still: '/banners/neon-orbit-banner.png',
    },
    externalIds: { anilist: '1567803' },
    sources: [
      { provider: 'AniList', externalId: '1567803', lastSyncedAt: '1d ago', status: 'active' },
    ],
    metadataStatus: 'stale',
    updatedAt: '3d ago',
    updatedBy: 'admin',
  },
  // ── Spirit Veil S1 ────────────────────────────────────
  {
    id: 'ep-014',
    slug: 'spirit-veil-s1e1',
    seriesId: 'ser-004',
    seriesTitle: 'Spirit Veil',
    seasonNumber: 1,
    episodeNumber: 1,
    title: 'Between Worlds',
    synopsis:
      'Shrine maiden Hana sees her first spirit — a confused child wandering the mountain path — and learns the veil is thinning.',
    status: 'Published',
    duration: 1440,
    airDate: '2024-04-03',
    rating: 8.9,
    assets: {
      thumbnail: '/covers/spirit-veil.png',
      still: '/banners/eternal-frost-banner.png',
    },
    externalIds: { anilist: '1345601', tmdb: '6543201' },
    sources: [
      { provider: 'AniList', externalId: '1345601', lastSyncedAt: '6h ago', status: 'active' },
      { provider: 'TMDB', externalId: '6543201', lastSyncedAt: '5h ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '6h ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'ep-015',
    slug: 'spirit-veil-s1e2',
    seriesId: 'ser-004',
    seriesTitle: 'Spirit Veil',
    seasonNumber: 1,
    episodeNumber: 2,
    title: 'The Gathering',
    synopsis:
      'More spirits arrive than Hana can guide alone. An elderly monk offers to teach her the old rites — for a price.',
    status: 'Published',
    duration: 1440,
    airDate: '2024-04-10',
    rating: 8.7,
    assets: {
      thumbnail: '/covers/spirit-veil.png',
      still: '/banners/eternal-frost-banner.png',
    },
    externalIds: { anilist: '1345602', tmdb: '6543202' },
    sources: [
      { provider: 'AniList', externalId: '1345602', lastSyncedAt: '6h ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '6h ago',
    updatedBy: 'auto-import',
  },
  // ── After School Skies S1 ─────────────────────────────
  {
    id: 'ep-016',
    slug: 'after-school-skies-s1e1',
    seriesId: 'ser-005',
    seriesTitle: 'After School Skies',
    seasonNumber: 1,
    episodeNumber: 1,
    title: 'The Pact',
    synopsis:
      'On the last day of summer, three friends make a pact: before graduation, each will chase one impossible dream.',
    status: 'Published',
    duration: 1440,
    airDate: '2023-07-05',
    rating: 8.5,
    assets: {
      thumbnail: '/covers/after-school-skies.png',
      still: '/banners/eternal-frost-banner.png',
    },
    externalIds: { anilist: '1098701', tmdb: '5432101' },
    sources: [
      { provider: 'AniList', externalId: '1098701', lastSyncedAt: '3d ago', status: 'active' },
      { provider: 'TMDB', externalId: '5432101', lastSyncedAt: '2d ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '3d ago',
    updatedBy: 'admin',
  },
  {
    id: 'ep-017',
    slug: 'after-school-skies-s1e2',
    seriesId: 'ser-005',
    seriesTitle: 'After School Skies',
    seasonNumber: 1,
    episodeNumber: 2,
    title: 'Starlight Sonata',
    synopsis:
      'Yuki practices her piano piece for the school festival while grappling with the decision to audition for a conservatory abroad.',
    status: 'Published',
    duration: 1440,
    airDate: '2023-07-12',
    rating: 8.3,
    assets: {
      thumbnail: '/covers/after-school-skies.png',
      still: '/banners/eternal-frost-banner.png',
    },
    externalIds: { anilist: '1098702', tmdb: '5432102' },
    sources: [
      { provider: 'AniList', externalId: '1098702', lastSyncedAt: '3d ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '3d ago',
    updatedBy: 'admin',
  },
  // ── Hollow Kingdom S1 ─────────────────────────────────
  {
    id: 'ep-018',
    slug: 'hollow-kingdom-s1e1',
    seriesId: 'ser-006',
    seriesTitle: 'Hollow Kingdom',
    seasonNumber: 1,
    episodeNumber: 1,
    title: 'Cathedral of Dust',
    synopsis:
      'The last knight awakens beneath a ruined cathedral with no memory and a cursed blade that whispers his forgotten name.',
    status: 'Draft',
    duration: 1440,
    airDate: '2025-10-01',
    rating: 0,
    assets: {
      thumbnail: '/covers/hollow-kingdom.png',
      still: '/banners/crimson-blade-banner.png',
    },
    externalIds: { anilist: '1678901' },
    sources: [
      { provider: 'AniList', externalId: '1678901', lastSyncedAt: '1d ago', status: 'active' },
    ],
    metadataStatus: 'missing',
    updatedAt: '5d ago',
    updatedBy: 'admin',
  },
  {
    id: 'ep-019',
    slug: 'hollow-kingdom-s1e2',
    seriesId: 'ser-006',
    seriesTitle: 'Hollow Kingdom',
    seasonNumber: 1,
    episodeNumber: 2,
    title: 'The Descent',
    synopsis:
      'Following the blade\'s pull, the knight enters the first level of the hollow kingdom — a forest of petrified giants.',
    status: 'Draft',
    duration: 1440,
    airDate: '2025-10-08',
    rating: 0,
    assets: {
      thumbnail: '/covers/hollow-kingdom.png',
      still: '/banners/crimson-blade-banner.png',
    },
    externalIds: { anilist: '1678902' },
    sources: [
      { provider: 'AniList', externalId: '1678902', lastSyncedAt: '5d ago', status: 'active' },
    ],
    metadataStatus: 'missing',
    updatedAt: '5d ago',
    updatedBy: 'admin',
  },
  // ── Neon Samurai S1 ───────────────────────────────────
  {
    id: 'ep-020',
    slug: 'neon-samurai-s1e1',
    seriesId: 'ser-010',
    seriesTitle: 'Neon Samurai',
    seasonNumber: 1,
    episodeNumber: 1,
    title: 'Rain and Rust',
    synopsis:
      'In rain-soaked Neo-Kyoto 2187, ronin Kaito takes a mercenary job that leads him to the first clue about his master\'s murder.',
    status: 'Published',
    duration: 1440,
    airDate: '2024-06-01',
    rating: 9.2,
    assets: {
      thumbnail: '/covers/neon-orbit.png',
      still: '/banners/neon-orbit-banner.png',
    },
    externalIds: { anilist: '1234501', tmdb: '9876501', imdb: 'tt9876501' },
    sources: [
      { provider: 'AniList', externalId: '1234501', lastSyncedAt: '1d ago', status: 'active' },
      { provider: 'TMDB', externalId: '9876501', lastSyncedAt: '1d ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '1d ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'ep-021',
    slug: 'neon-samurai-s1e2',
    seriesId: 'ser-010',
    seriesTitle: 'Neon Samurai',
    seasonNumber: 1,
    episodeNumber: 2,
    title: 'The Circuit Ronin',
    synopsis:
      'Kaito tracks a data broker through the neon-lit undercity, discovering his master\'s research was stolen by a founding family.',
    status: 'Published',
    duration: 1440,
    airDate: '2024-06-08',
    rating: 9.0,
    assets: {
      thumbnail: '/covers/neon-orbit.png',
      still: '/banners/neon-orbit-banner.png',
    },
    externalIds: { anilist: '1234502', tmdb: '9876502' },
    sources: [
      { provider: 'AniList', externalId: '1234502', lastSyncedAt: '1d ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '1d ago',
    updatedBy: 'auto-import',
  },
  // ── Last Serve S1 ─────────────────────────────────────
  {
    id: 'ep-022',
    slug: 'last-serve-s1e1',
    seriesId: 'ser-007',
    seriesTitle: 'Last Serve',
    seasonNumber: 1,
    episodeNumber: 1,
    title: 'Return to Court',
    synopsis:
      'Washed-up volleyball prodigy Takeda returns to his hometown and is roped into coaching a high school team with zero wins.',
    status: 'Published',
    duration: 1440,
    airDate: '2024-04-10',
    rating: 8.3,
    assets: {
      thumbnail: '/covers/last-serve.png',
      still: '/banners/neon-orbit-banner.png',
    },
    externalIds: { anilist: '1432101', tmdb: '4321001' },
    sources: [
      { provider: 'AniList', externalId: '1432101', lastSyncedAt: '12h ago', status: 'active' },
      { provider: 'TMDB', externalId: '4321001', lastSyncedAt: '8h ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '12h ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'ep-023',
    slug: 'last-serve-s1e2',
    seriesId: 'ser-007',
    seriesTitle: 'Last Serve',
    seasonNumber: 1,
    episodeNumber: 2,
    title: 'Formation',
    synopsis:
      'Takeda tries to drill basics into a team that can barely serve. His frustration hides a deeper fear of failing again.',
    status: 'Published',
    duration: 1440,
    airDate: '2024-04-17',
    rating: 8.1,
    assets: {
      thumbnail: '/covers/last-serve.png',
      still: '/banners/neon-orbit-banner.png',
    },
    externalIds: { anilist: '1432102', tmdb: '4321002' },
    sources: [
      { provider: 'AniList', externalId: '1432102', lastSyncedAt: '12h ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '12h ago',
    updatedBy: 'admin',
  },
  // ── Starfall Academy S1 ───────────────────────────────
  {
    id: 'ep-024',
    slug: 'starfall-academy-s1e1',
    seriesId: 'ser-008',
    seriesTitle: 'Starfall Academy',
    seasonNumber: 1,
    episodeNumber: 1,
    title: 'First Year',
    synopsis:
      'Cadet Mira arrives at Starfall Academy orbiting Earth, unaware that her latent ability to interface with alien tech will change everything.',
    status: 'Review',
    duration: 1440,
    airDate: '2025-04-02',
    rating: 0,
    assets: {
      thumbnail: '/covers/neon-orbit.png',
      still: '/banners/neon-orbit-banner.png',
    },
    externalIds: { anilist: '1789001', tmdb: '3210901' },
    sources: [
      { provider: 'AniList', externalId: '1789001', lastSyncedAt: '2d ago', status: 'active' },
    ],
    metadataStatus: 'stale',
    updatedAt: '2d ago',
    updatedBy: 'admin',
  },
  {
    id: 'ep-025',
    slug: 'starfall-academy-s1e2',
    seriesId: 'ser-008',
    seriesTitle: 'Starfall Academy',
    seasonNumber: 1,
    episodeNumber: 2,
    title: 'Signal in the Dark',
    synopsis:
      'During a deep-space training exercise, Mira intercepts an alien signal that the military faction wants buried.',
    status: 'Draft',
    duration: 1440,
    airDate: '2025-04-09',
    rating: 0,
    assets: {
      thumbnail: '/covers/neon-orbit.png',
      still: '/banners/neon-orbit-banner.png',
    },
    externalIds: { anilist: '1789002' },
    sources: [
      { provider: 'AniList', externalId: '1789002', lastSyncedAt: '5d ago', status: 'active' },
    ],
    metadataStatus: 'missing',
    updatedAt: '5d ago',
    updatedBy: 'admin',
  },
]

export function getEpisodeStats(episodes: EpisodeItem[]) {
  const total = episodes.length
  const published = episodes.filter((e) => e.status === 'Published').length
  const drafts = episodes.filter((e) => e.status === 'Draft').length
  const metadataErrors = episodes.filter(
    (e) => e.metadataStatus === 'error' || e.metadataStatus === 'missing',
  ).length
  const inReview = episodes.filter((e) => e.status === 'Review').length
  const archived = episodes.filter((e) => e.status === 'Archived').length
  const totalDuration = episodes.reduce((acc, e) => acc + e.duration, 0)
  const avgRating =
    episodes.filter((e) => e.rating > 0).length > 0
      ? episodes.filter((e) => e.rating > 0).reduce((acc, e) => acc + e.rating, 0) /
        episodes.filter((e) => e.rating > 0).length
      : 0

  return {
    total,
    published,
    drafts,
    metadataErrors,
    inReview,
    archived,
    totalDuration,
    avgRating,
  }
}
