import type { StatusTone } from '@/components/dash/status-badge'

export type PublicationState =
  | 'Draft'
  | 'Review'
  | 'Approved'
  | 'Scheduled'
  | 'Published'
  | 'Archived'

export type SeriesType = 'anime' | 'live-action' | 'documentary' | 'animation'

export type DataSource =
  | 'AniList'
  | 'TMDB'
  | 'MyAnimeList'
  | 'Jellyfin'
  | 'Plex'
  | 'TheTVDB'
  | 'Kitsu'

export type MetadataStatus = 'synced' | 'stale' | 'error' | 'missing'

export interface ExternalIds {
  anilist?: string
  myAnimeList?: string
  tmdb?: string
  imdb?: string
  thetvdb?: string
  kitsu?: string
  jellyfin?: string
  plex?: string
}

export interface SeriesSource {
  provider: DataSource
  externalId: string
  lastSyncedAt: string
  status: 'active' | 'inactive' | 'error'
}

export interface SeriesSeason {
  id: string
  number: number
  title: string
  episodeCount: number
  year: number
  aired: boolean
}

export interface SeriesRelation {
  id: string
  title: string
  type: 'sequel' | 'prequel' | 'spin-off' | 'adaptation' | 'related'
}

export interface SeriesAsset {
  poster: string
  banner: string
  backdrop: string
}

export interface SeriesItem {
  id: string
  slug: string
  title: string
  titleOriginal: string
  synopsis: string
  type: SeriesType
  status: PublicationState
  airingStatus: 'airing' | 'completed' | 'upcoming' | 'hiatus'
  genres: string[]
  studios: string[]
  tags: string[]
  year: number
  rating: number
  seasonCount: number
  totalEpisodes: number
  ageRating: string
  assets: SeriesAsset
  externalIds: ExternalIds
  sources: SeriesSource[]
  seasons: SeriesSeason[]
  relations: SeriesRelation[]
  metadataStatus: MetadataStatus
  updatedAt: string
  updatedBy: string
}

export const SERIES_STATUS_TONE: Record<PublicationState, StatusTone> = {
  Draft: 'neutral',
  Review: 'warning',
  Approved: 'info',
  Scheduled: 'warning',
  Published: 'success',
  Archived: 'destructive',
}

export const AIRING_STATUS_LABEL: Record<string, string> = {
  airing: 'Airing',
  completed: 'Completed',
  upcoming: 'Upcoming',
  hiatus: 'Hiatus',
}

export const METADATA_STATUS_LABEL: Record<MetadataStatus, string> = {
  synced: 'Synced',
  stale: 'Stale',
  error: 'Error',
  missing: 'Missing',
}

export const ALL_SERIES_STATUSES: Array<PublicationState | 'all'> = [
  'all',
  'Draft',
  'Review',
  'Approved',
  'Scheduled',
  'Published',
  'Archived',
]

export const ALL_SERIES_TYPES: Array<SeriesType | 'all'> = [
  'all',
  'anime',
  'live-action',
  'documentary',
  'animation',
]

export const ALL_DATA_SOURCES: Array<DataSource | 'all'> = [
  'all',
  'AniList',
  'TMDB',
  'MyAnimeList',
  'Jellyfin',
  'Plex',
  'TheTVDB',
  'Kitsu',
]

export const SERIES_MOCK: SeriesItem[] = [
  {
    id: 'ser-001',
    slug: 'eternal-frost',
    title: 'Eternal Frost',
    titleOriginal: '永遠の霜',
    synopsis:
      'Long after the demon war has ended, the elven mage Liora journeys across a peaceful world she no longer recognizes. As the decades pass in an instant for her kind, she sets out to understand the fleeting human lives she once fought beside.',
    type: 'anime',
    status: 'Published',
    airingStatus: 'airing',
    genres: ['Fantasy', 'Adventure', 'Drama'],
    studios: ['Studio Aurora'],
    tags: ['isekai', 'magic', 'longevity', 'travel'],
    year: 2024,
    rating: 9.3,
    seasonCount: 2,
    totalEpisodes: 20,
    ageRating: 'PG-13',
    assets: {
      poster: '/covers/eternal-frost.png',
      banner: '/banners/eternal-frost-banner.png',
      backdrop: '/banners/eternal-frost-banner.png',
    },
    externalIds: {
      anilist: '12847',
      myAnimeList: '56712',
      tmdb: '98765',
      imdb: 'tt1234567',
    },
    sources: [
      { provider: 'AniList', externalId: '12847', lastSyncedAt: '2h ago', status: 'active' },
      { provider: 'TMDB', externalId: '98765', lastSyncedAt: '1h ago', status: 'active' },
      { provider: 'MyAnimeList', externalId: '56712', lastSyncedAt: '3h ago', status: 'active' },
      { provider: 'Jellyfin', externalId: 'jf-eternal-frost', lastSyncedAt: '30m ago', status: 'active' },
    ],
    seasons: [
      { id: 's1', number: 1, title: 'Season 1', episodeCount: 12, year: 2024, aired: true },
      { id: 's2', number: 2, title: 'Season 2', episodeCount: 8, year: 2025, aired: true },
    ],
    relations: [
      { id: 'ser-004', title: 'Spirit Veil', type: 'related' },
      { id: 'ser-014', title: 'Crimson Vow', type: 'related' },
    ],
    metadataStatus: 'synced',
    updatedAt: '2h ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'ser-002',
    slug: 'crimson-blade',
    title: 'Crimson Blade',
    titleOriginal: '紅の刃',
    synopsis:
      'In a feudal capital ruled by fear, a wandering swordsman with a scarlet scarf hunts the corrupt lords who destroyed his village. Each strike of his blade brings him closer to the truth — and further from the man he used to be.',
    type: 'anime',
    status: 'Published',
    airingStatus: 'completed',
    genres: ['Action', 'Adventure', 'Drama'],
    studios: ['Kaze Animation'],
    tags: ['samurai', 'revenge', 'feudal'],
    year: 2023,
    rating: 8.9,
    seasonCount: 1,
    totalEpisodes: 12,
    ageRating: 'R',
    assets: {
      poster: '/covers/crimson-blade.png',
      banner: '/banners/crimson-blade-banner.png',
      backdrop: '/banners/crimson-blade-banner.png',
    },
    externalIds: {
      anilist: '11234',
      myAnimeList: '48920',
      tmdb: '87654',
    },
    sources: [
      { provider: 'AniList', externalId: '11234', lastSyncedAt: '1d ago', status: 'active' },
      { provider: 'TMDB', externalId: '87654', lastSyncedAt: '1d ago', status: 'active' },
      { provider: 'Plex', externalId: 'plex-crimson-blade', lastSyncedAt: '2d ago', status: 'active' },
    ],
    seasons: [
      { id: 's1', number: 1, title: 'Season 1', episodeCount: 12, year: 2023, aired: true },
    ],
    relations: [
      { id: 'ser-010', title: 'Blade of the Fallen', type: 'spin-off' },
    ],
    metadataStatus: 'synced',
    updatedAt: '1d ago',
    updatedBy: 'admin',
  },
  {
    id: 'ser-003',
    slug: 'neon-orbit',
    title: 'Neon Orbit',
    titleOriginal: 'ネオンオービット',
    synopsis:
      'In the floating megacity of New Kanazawa, an ace pilot bonds with an experimental AI-driven mech. Together they are drawn into a conspiracy that could send the entire orbital colony crashing back to Earth.',
    type: 'anime',
    status: 'Published',
    airingStatus: 'airing',
    genres: ['Sci-Fi', 'Action', 'Mystery'],
    studios: ['Helix Works'],
    tags: ['mecha', 'cyberpunk', 'space'],
    year: 2025,
    rating: 8.6,
    seasonCount: 1,
    totalEpisodes: 10,
    ageRating: 'PG-13',
    assets: {
      poster: '/covers/neon-orbit.png',
      banner: '/banners/neon-orbit-banner.png',
      backdrop: '/banners/neon-orbit-banner.png',
    },
    externalIds: {
      anilist: '15678',
      tmdb: '76543',
      kitsu: 'k-neon-orbit',
    },
    sources: [
      { provider: 'AniList', externalId: '15678', lastSyncedAt: '4h ago', status: 'active' },
      { provider: 'TMDB', externalId: '76543', lastSyncedAt: '3h ago', status: 'active' },
      { provider: 'Kitsu', externalId: 'k-neon-orbit', lastSyncedAt: '5h ago', status: 'active' },
    ],
    seasons: [
      { id: 's1', number: 1, title: 'Season 1', episodeCount: 10, year: 2025, aired: true },
    ],
    relations: [
      { id: 'ser-009', title: 'Starfall Academy', type: 'related' },
    ],
    metadataStatus: 'synced',
    updatedAt: '4h ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'ser-004',
    slug: 'spirit-veil',
    title: 'Spirit Veil',
    titleOriginal: '霊の帳',
    synopsis:
      'A young shrine maiden discovers she can see the spirits that drift between our world and the next. When restless souls begin gathering in her mountain town, she must learn to guide them home before the veil tears open.',
    type: 'anime',
    status: 'Published',
    airingStatus: 'airing',
    genres: ['Supernatural', 'Mystery', 'Drama'],
    studios: ['Studio Aurora'],
    tags: ['spirits', 'japanese folklore', 'mystery'],
    year: 2024,
    rating: 8.8,
    seasonCount: 1,
    totalEpisodes: 11,
    ageRating: 'PG-13',
    assets: {
      poster: '/covers/spirit-veil.png',
      banner: '/banners/eternal-frost-banner.png',
      backdrop: '/banners/eternal-frost-banner.png',
    },
    externalIds: {
      anilist: '13456',
      myAnimeList: '52340',
      tmdb: '65432',
    },
    sources: [
      { provider: 'AniList', externalId: '13456', lastSyncedAt: '6h ago', status: 'active' },
      { provider: 'TMDB', externalId: '65432', lastSyncedAt: '5h ago', status: 'active' },
      { provider: 'MyAnimeList', externalId: '52340', lastSyncedAt: '1d ago', status: 'active' },
    ],
    seasons: [
      { id: 's1', number: 1, title: 'Season 1', episodeCount: 11, year: 2024, aired: true },
    ],
    relations: [
      { id: 'ser-001', title: 'Eternal Frost', type: 'related' },
    ],
    metadataStatus: 'synced',
    updatedAt: '6h ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'ser-005',
    slug: 'after-school-skies',
    title: 'After School Skies',
    titleOriginal: '放課後の空',
    synopsis:
      'Three friends in their final year of high school make a pact to chase one impossible dream each before graduation. A tender, funny, and bittersweet story about the last golden days before growing up.',
    type: 'anime',
    status: 'Published',
    airingStatus: 'completed',
    genres: ['Slice of Life', 'Drama', 'Romance'],
    studios: ['Lumine Studio'],
    tags: ['high school', 'coming-of-age', 'friendship'],
    year: 2023,
    rating: 8.4,
    seasonCount: 1,
    totalEpisodes: 13,
    ageRating: 'PG',
    assets: {
      poster: '/covers/after-school-skies.png',
      banner: '/banners/eternal-frost-banner.png',
      backdrop: '/banners/eternal-frost-banner.png',
    },
    externalIds: {
      anilist: '10987',
      tmdb: '54321',
    },
    sources: [
      { provider: 'AniList', externalId: '10987', lastSyncedAt: '3d ago', status: 'active' },
      { provider: 'TMDB', externalId: '54321', lastSyncedAt: '2d ago', status: 'active' },
    ],
    seasons: [
      { id: 's1', number: 1, title: 'Season 1', episodeCount: 13, year: 2023, aired: true },
    ],
    relations: [],
    metadataStatus: 'synced',
    updatedAt: '3d ago',
    updatedBy: 'admin',
  },
  {
    id: 'ser-006',
    slug: 'hollow-kingdom',
    title: 'Hollow Kingdom',
    titleOriginal: '虚ろな王国',
    synopsis:
      'The last knight of a fallen realm awakens beneath a ruined cathedral with no memory and a cursed blade. To reclaim his name he must descend through the hollow kingdom and face the god that devoured it.',
    type: 'anime',
    status: 'Draft',
    airingStatus: 'upcoming',
    genres: ['Fantasy', 'Action', 'Mystery'],
    studios: ['Kaze Animation'],
    tags: ['dark fantasy', 'amnesia', 'cursed weapon'],
    year: 2025,
    rating: 8.7,
    seasonCount: 1,
    totalEpisodes: 12,
    ageRating: 'R',
    assets: {
      poster: '/covers/hollow-kingdom.png',
      banner: '/banners/crimson-blade-banner.png',
      backdrop: '/banners/crimson-blade-banner.png',
    },
    externalIds: {
      anilist: '16789',
      myAnimeList: '59012',
    },
    sources: [
      { provider: 'AniList', externalId: '16789', lastSyncedAt: '1d ago', status: 'active' },
    ],
    seasons: [
      { id: 's1', number: 1, title: 'Season 1', episodeCount: 12, year: 2025, aired: false },
    ],
    relations: [
      { id: 'ser-002', title: 'Crimson Blade', type: 'related' },
    ],
    metadataStatus: 'stale',
    updatedAt: '5d ago',
    updatedBy: 'admin',
  },
  {
    id: 'ser-007',
    slug: 'last-serve',
    title: 'Last Serve',
    titleOriginal: 'ラストサーブ',
    synopsis:
      'A washed-up volleyball prodigy returns to his hometown court to coach a ragtag high school team with more heart than talent. Their road to nationals starts with a single, impossible serve.',
    type: 'anime',
    status: 'Published',
    airingStatus: 'airing',
    genres: ['Sports', 'Slice of Life', 'Drama'],
    studios: ['Lumine Studio'],
    tags: ['volleyball', 'redemption', 'teamwork'],
    year: 2024,
    rating: 8.2,
    seasonCount: 1,
    totalEpisodes: 14,
    ageRating: 'PG',
    assets: {
      poster: '/covers/last-serve.png',
      banner: '/banners/neon-orbit-banner.png',
      backdrop: '/banners/neon-orbit-banner.png',
    },
    externalIds: {
      anilist: '14321',
      tmdb: '43210',
    },
    sources: [
      { provider: 'AniList', externalId: '14321', lastSyncedAt: '12h ago', status: 'active' },
      { provider: 'TMDB', externalId: '43210', lastSyncedAt: '8h ago', status: 'active' },
    ],
    seasons: [
      { id: 's1', number: 1, title: 'Season 1', episodeCount: 14, year: 2024, aired: true },
    ],
    relations: [],
    metadataStatus: 'synced',
    updatedAt: '12h ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'ser-008',
    slug: 'starfall-academy',
    title: 'Starfall Academy',
    titleOriginal: 'スターフォール学園',
    synopsis:
      'At a prestigious academy orbiting Earth, gifted cadets train to defend the solar system. When a first-year student discovers she can interface with ancient alien technology, she becomes the target of both corporate agents and a shadowy military faction.',
    type: 'anime',
    status: 'Review',
    airingStatus: 'airing',
    genres: ['Sci-Fi', 'Action', 'Mystery'],
    studios: ['Helix Works'],
    tags: ['academy', 'military', 'alien technology'],
    year: 2025,
    rating: 8.3,
    seasonCount: 1,
    totalEpisodes: 12,
    ageRating: 'PG-13',
    assets: {
      poster: '/covers/neon-orbit.png',
      banner: '/banners/neon-orbit-banner.png',
      backdrop: '/banners/neon-orbit-banner.png',
    },
    externalIds: {
      anilist: '17890',
      tmdb: '32109',
    },
    sources: [
      { provider: 'AniList', externalId: '17890', lastSyncedAt: '2d ago', status: 'active' },
    ],
    seasons: [
      { id: 's1', number: 1, title: 'Season 1', episodeCount: 12, year: 2025, aired: true },
    ],
    relations: [
      { id: 'ser-003', title: 'Neon Orbit', type: 'related' },
    ],
    metadataStatus: 'stale',
    updatedAt: '2d ago',
    updatedBy: 'admin',
  },
  {
    id: 'ser-009',
    slug: 'blade-of-the-fallen',
    title: 'Blade of the Fallen',
    titleOriginal: '堕ちた者の刃',
    synopsis:
      "A disgraced knight is resurrected by a vengeful spirit with one condition: wield the cursed blade until the one who betrayed him falls. But the sword hungers for more than just revenge — it feeds on the wielder's memories.",
    type: 'anime',
    status: 'Published',
    airingStatus: 'airing',
    genres: ['Fantasy', 'Action', 'Supernatural'],
    studios: ['Kaze Animation'],
    tags: ['dark fantasy', 'cursed weapon', 'revenge'],
    year: 2025,
    rating: 8.7,
    seasonCount: 1,
    totalEpisodes: 13,
    ageRating: 'R',
    assets: {
      poster: '/covers/crimson-blade.png',
      banner: '/banners/crimson-blade-banner.png',
      backdrop: '/banners/crimson-blade-banner.png',
    },
    externalIds: {
      anilist: '18901',
      tmdb: '21098',
      kitsu: 'k-blade-fallen',
    },
    sources: [
      { provider: 'AniList', externalId: '18901', lastSyncedAt: '6h ago', status: 'active' },
      { provider: 'TMDB', externalId: '21098', lastSyncedAt: '5h ago', status: 'active' },
      { provider: 'Kitsu', externalId: 'k-blade-fallen', lastSyncedAt: '4h ago', status: 'active' },
    ],
    seasons: [
      { id: 's1', number: 1, title: 'Season 1', episodeCount: 13, year: 2025, aired: true },
    ],
    relations: [
      { id: 'ser-002', title: 'Crimson Blade', type: 'sequel' },
    ],
    metadataStatus: 'synced',
    updatedAt: '6h ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'ser-010',
    slug: 'neon-samurai',
    title: 'Neon Samurai',
    titleOriginal: 'ネオン侍',
    synopsis:
      "In rain-soaked Neo-Kyoto 2187, a ronin without a clan takes mercenary jobs while searching for the AI that murdered his master. Every circuit he follows leads deeper into a conspiracy linking the city's founding families to a weapon that could end consciousness itself.",
    type: 'anime',
    status: 'Published',
    airingStatus: 'completed',
    genres: ['Sci-Fi', 'Action', 'Mystery'],
    studios: ['Helix Works'],
    tags: ['cyberpunk', 'ronin', 'neo-tokyo'],
    year: 2024,
    rating: 9.1,
    seasonCount: 1,
    totalEpisodes: 12,
    ageRating: 'R',
    assets: {
      poster: '/covers/neon-orbit.png',
      banner: '/banners/neon-orbit-banner.png',
      backdrop: '/banners/neon-orbit-banner.png',
    },
    externalIds: {
      anilist: '12345',
      myAnimeList: '45678',
      tmdb: '98765',
      imdb: 'tt9876543',
    },
    sources: [
      { provider: 'AniList', externalId: '12345', lastSyncedAt: '1d ago', status: 'active' },
      { provider: 'TMDB', externalId: '98765', lastSyncedAt: '1d ago', status: 'active' },
      { provider: 'MyAnimeList', externalId: '45678', lastSyncedAt: '2d ago', status: 'active' },
      { provider: 'Jellyfin', externalId: 'jf-neon-samurai', lastSyncedAt: '1d ago', status: 'active' },
      { provider: 'Plex', externalId: 'plex-neon-samurai', lastSyncedAt: '1d ago', status: 'active' },
    ],
    seasons: [
      { id: 's1', number: 1, title: 'Season 1', episodeCount: 12, year: 2024, aired: true },
    ],
    relations: [
      { id: 'ser-003', title: 'Neon Orbit', type: 'related' },
    ],
    metadataStatus: 'synced',
    updatedAt: '1d ago',
    updatedBy: 'admin',
  },
  {
    id: 'ser-011',
    slug: 'ember-crown',
    title: 'Ember Crown',
    titleOriginal: '炎の王冠',
    synopsis:
      'When the fire god chooses a peasant girl as the new Flame Sovereign, the five noble houses unite against her. Guided by a disgraced general and a trickster spirit, she must master her power before the kingdom tears itself apart.',
    type: 'anime',
    status: 'Draft',
    airingStatus: 'upcoming',
    genres: ['Fantasy', 'Adventure', 'Drama'],
    studios: ['Kaze Animation'],
    tags: ['royalty', 'fire magic', 'political intrigue'],
    year: 2025,
    rating: 8.8,
    seasonCount: 1,
    totalEpisodes: 24,
    ageRating: 'PG-13',
    assets: {
      poster: '/covers/hollow-kingdom.png',
      banner: '/banners/crimson-blade-banner.png',
      backdrop: '/banners/crimson-blade-banner.png',
    },
    externalIds: {
      anilist: '19012',
    },
    sources: [
      { provider: 'AniList', externalId: '19012', lastSyncedAt: '7d ago', status: 'active' },
    ],
    seasons: [
      { id: 's1', number: 1, title: 'Season 1', episodeCount: 24, year: 2025, aired: false },
    ],
    relations: [
      { id: 'ser-006', title: 'Hollow Kingdom', type: 'related' },
    ],
    metadataStatus: 'error',
    updatedAt: '7d ago',
    updatedBy: 'admin',
  },
  {
    id: 'ser-012',
    slug: 'thunder-league',
    title: 'Thunder League',
    titleOriginal: 'サンダーリーグ',
    synopsis:
      'In a world where soccer matches are decided by both skill and elemental power, a boy with no affinity for magic joins a underdog team. His only weapon: relentless training and a tactical mind that can outwit any storm.',
    type: 'anime',
    status: 'Approved',
    airingStatus: 'airing',
    genres: ['Sports', 'Action', 'Adventure'],
    studios: ['Kaze Animation'],
    tags: ['soccer', 'elemental power', 'underdog'],
    year: 2025,
    rating: 8.1,
    seasonCount: 1,
    totalEpisodes: 24,
    ageRating: 'PG',
    assets: {
      poster: '/covers/last-serve.png',
      banner: '/banners/neon-orbit-banner.png',
      backdrop: '/banners/neon-orbit-banner.png',
    },
    externalIds: {
      anilist: '20123',
      tmdb: '10987',
    },
    sources: [
      { provider: 'AniList', externalId: '20123', lastSyncedAt: '1d ago', status: 'active' },
      { provider: 'TMDB', externalId: '10987', lastSyncedAt: '1d ago', status: 'active' },
    ],
    seasons: [
      { id: 's1', number: 1, title: 'Season 1', episodeCount: 24, year: 2025, aired: true },
    ],
    relations: [],
    metadataStatus: 'synced',
    updatedAt: '1d ago',
    updatedBy: 'admin',
  },
  {
    id: 'ser-013',
    slug: 'ocean-whisper',
    title: "Ocean's Whisper",
    titleOriginal: '海の囁き',
    synopsis:
      'A marine biologist returns to her coastal hometown and reunites with the childhood friend who once promised to show her every secret the ocean held. As they explore tide pools and shipwrecks, old feelings resurface alongside something ancient stirring in the deep.',
    type: 'live-action',
    status: 'Scheduled',
    airingStatus: 'airing',
    genres: ['Romance', 'Slice of Life', 'Drama'],
    studios: ['Lumine Studio'],
    tags: ['marine', 'romance', 'hometown'],
    year: 2025,
    rating: 8.6,
    seasonCount: 1,
    totalEpisodes: 12,
    ageRating: 'PG',
    assets: {
      poster: '/covers/letter-to-spring.png',
      banner: '/banners/eternal-frost-banner.png',
      backdrop: '/banners/eternal-frost-banner.png',
    },
    externalIds: {
      tmdb: '87654',
    },
    sources: [
      { provider: 'TMDB', externalId: '87654', lastSyncedAt: '4h ago', status: 'active' },
      { provider: 'Plex', externalId: 'plex-ocean-whisper', lastSyncedAt: '6h ago', status: 'active' },
    ],
    seasons: [
      { id: 's1', number: 1, title: 'Season 1', episodeCount: 12, year: 2025, aired: true },
    ],
    relations: [
      { id: 'ser-005', title: 'After School Skies', type: 'related' },
    ],
    metadataStatus: 'synced',
    updatedAt: '4h ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'ser-014',
    slug: 'crimson-vow',
    title: 'Crimson Vow',
    titleOriginal: '紅の誓い',
    synopsis:
      'A vampire countess breaks her ancient blood oath to protect a human scholar she has loved across centuries. Hunted by her own kind, she must choose between immortality and the one person who made eternity worth living.',
    type: 'anime',
    status: 'Archived',
    airingStatus: 'completed',
    genres: ['Romance', 'Supernatural', 'Drama'],
    studios: ['Studio Aurora'],
    tags: ['vampire', 'romance', 'immortality'],
    year: 2024,
    rating: 9.0,
    seasonCount: 1,
    totalEpisodes: 12,
    ageRating: 'PG-13',
    assets: {
      poster: '/covers/eternal-frost.png',
      banner: '/banners/crimson-blade-banner.png',
      backdrop: '/banners/crimson-blade-banner.png',
    },
    externalIds: {
      anilist: '14567',
      tmdb: '76543',
    },
    sources: [
      { provider: 'AniList', externalId: '14567', lastSyncedAt: '5d ago', status: 'inactive' },
      { provider: 'TMDB', externalId: '76543', lastSyncedAt: '5d ago', status: 'inactive' },
    ],
    seasons: [
      { id: 's1', number: 1, title: 'Season 1', episodeCount: 12, year: 2024, aired: true },
    ],
    relations: [
      { id: 'ser-001', title: 'Eternal Frost', type: 'related' },
    ],
    metadataStatus: 'stale',
    updatedAt: '5d ago',
    updatedBy: 'admin',
  },
]

export function getSeriesStats(series: SeriesItem[]) {
  const total = series.length
  const published = series.filter((s) => s.status === 'Published').length
  const drafts = series.filter((s) => s.status === 'Draft').length
  const metadataErrors = series.filter(
    (s) => s.metadataStatus === 'error' || s.metadataStatus === 'missing',
  ).length
  const inReview = series.filter((s) => s.status === 'Review').length
  const archived = series.filter((s) => s.status === 'Archived').length
  const totalEpisodes = series.reduce((acc, s) => acc + s.totalEpisodes, 0)
  const avgRating =
    series.length > 0
      ? series.reduce((acc, s) => acc + s.rating, 0) / series.length
      : 0

  return {
    total,
    published,
    drafts,
    metadataErrors,
    inReview,
    archived,
    totalEpisodes,
    avgRating,
  }
}
