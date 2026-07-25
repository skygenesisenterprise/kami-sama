import type { StatusTone } from '@/components/dash/status-badge'

export type PublicationState =
  | 'Draft'
  | 'Review'
  | 'Approved'
  | 'Scheduled'
  | 'Published'
  | 'Archived'

export type MovieGenre =
  | 'Action'
  | 'Adventure'
  | 'Animation'
  | 'Comedy'
  | 'Crime'
  | 'Documentary'
  | 'Drama'
  | 'Fantasy'
  | 'Horror'
  | 'Mystery'
  | 'Romance'
  | 'Sci-Fi'
  | 'Thriller'

export type DataSource =
  | 'TMDB'
  | 'IMDb'
  | 'Jellyfin'
  | 'Plex'

export type MetadataStatus = 'synced' | 'stale' | 'error' | 'missing'

export interface ExternalIds {
  tmdb?: string
  imdb?: string
  jellyfin?: string
  plex?: string
}

export interface MovieSource {
  provider: DataSource
  externalId: string
  lastSyncedAt: string
  status: 'active' | 'inactive' | 'error'
}

export interface MovieAsset {
  poster: string
  banner: string
  backdrop: string
}

export interface MovieRelation {
  id: string
  title: string
  type: 'sequel' | 'prequel' | 'spin-off' | 'adaptation' | 'related'
}

export interface MovieItem {
  id: string
  slug: string
  title: string
  titleOriginal: string
  synopsis: string
  status: PublicationState
  genres: string[]
  director: string
  writers: string[]
  cast: string[]
  tags: string[]
  year: number
  rating: number
  duration: number
  ageRating: string
  assets: MovieAsset
  externalIds: ExternalIds
  sources: MovieSource[]
  relations: MovieRelation[]
  metadataStatus: MetadataStatus
  updatedAt: string
  updatedBy: string
}

export const MOVIE_STATUS_TONE: Record<PublicationState, StatusTone> = {
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

export const ALL_MOVIE_STATUSES: Array<PublicationState | 'all'> = [
  'all',
  'Draft',
  'Review',
  'Approved',
  'Scheduled',
  'Published',
  'Archived',
]

export const ALL_MOVIE_GENRES: Array<string | 'all'> = [
  'all',
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
]

export const ALL_DATA_SOURCES: Array<DataSource | 'all'> = [
  'all',
  'TMDB',
  'IMDb',
  'Jellyfin',
  'Plex',
]

export const MOVIES_MOCK: MovieItem[] = [
  {
    id: 'mov-001',
    slug: 'shattered-dawn',
    title: 'Shattered Dawn',
    titleOriginal: '砕かれた夜明け',
    synopsis:
      'After a mysterious meteor shower wipes out most of the world\'s technology, a ragtag group of survivors must cross a fractured continent to reach the last known broadcast tower — and send a signal that could reunite what\'s left of humanity.',
    status: 'Published',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    director: 'Hayao Miyazaki',
    writers: ['Hayao Miyazaki', 'Isao Takahata'],
    cast: ['Yuri Tanaka', 'Kenji Watanabe', 'Aiko Sato'],
    tags: ['post-apocalyptic', 'survival', 'hope'],
    year: 2024,
    rating: 9.2,
    duration: 142,
    ageRating: 'PG-13',
    assets: {
      poster: '/covers/shattered-dawn.png',
      banner: '/banners/shattered-dawn-banner.png',
      backdrop: '/banners/shattered-dawn-banner.png',
    },
    externalIds: {
      tmdb: '10234',
      imdb: 'tt1023456',
    },
    sources: [
      { provider: 'TMDB', externalId: '10234', lastSyncedAt: '1h ago', status: 'active' },
      { provider: 'IMDb', externalId: 'tt1023456', lastSyncedAt: '2h ago', status: 'active' },
      { provider: 'Jellyfin', externalId: 'jf-shattered-dawn', lastSyncedAt: '30m ago', status: 'active' },
    ],
    relations: [
      { id: 'mov-005', title: 'Echoes of Silence', type: 'related' },
    ],
    metadataStatus: 'synced',
    updatedAt: '1h ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'mov-002',
    slug: 'crimson-horizon',
    title: 'Crimson Horizon',
    titleOriginal: '紅の地平線',
    synopsis:
      'In a war-torn kingdom, a disgraced general leads a desperate mission behind enemy lines to rescue a group of children taken by a ruthless warlord. Every step forward demands a sacrifice.',
    status: 'Published',
    genres: ['Action', 'Drama', 'Thriller'],
    director: 'Mamoru Hosoda',
    writers: ['Mamoru Hosoda'],
    cast: ['Takeshi Kaneshiro', 'Rinko Kikuchi', 'Masaharu Fukuyama'],
    tags: ['war', 'redemption', 'rescue'],
    year: 2023,
    rating: 8.8,
    duration: 128,
    ageRating: 'R',
    assets: {
      poster: '/covers/crimson-horizon.png',
      banner: '/banners/crimson-horizon-banner.png',
      backdrop: '/banners/crimson-horizon-banner.png',
    },
    externalIds: {
      tmdb: '20456',
      imdb: 'tt2045678',
    },
    sources: [
      { provider: 'TMDB', externalId: '20456', lastSyncedAt: '3h ago', status: 'active' },
      { provider: 'IMDb', externalId: 'tt2045678', lastSyncedAt: '5h ago', status: 'active' },
    ],
    relations: [],
    metadataStatus: 'synced',
    updatedAt: '3h ago',
    updatedBy: 'admin',
  },
  {
    id: 'mov-003',
    slug: 'whispers-in-the-rain',
    title: 'Whispers in the Rain',
    titleOriginal: '雨の中の囁き',
    synopsis:
      'A reclusive calligrapher discovers that the anonymous letters she receives are written by her estranged father, a man she believed died twenty years ago. As she traces his steps through rain-soaked streets, she uncovers a truth that changes everything.',
    status: 'Published',
    genres: ['Drama', 'Mystery', 'Romance'],
    director: 'Hirokazu Kore-eda',
    writers: ['Hirokazu Kore-eda'],
    cast: ['Sakura Ando', 'Lily Franky', 'Hidetoshi Nishijima'],
    tags: ['family', 'letters', 'identity'],
    year: 2024,
    rating: 8.9,
    duration: 118,
    ageRating: 'PG-13',
    assets: {
      poster: '/covers/whispers-rain.png',
      banner: '/banners/whispers-rain-banner.png',
      backdrop: '/banners/whispers-rain-banner.png',
    },
    externalIds: {
      tmdb: '30789',
      imdb: 'tt3078901',
    },
    sources: [
      { provider: 'TMDB', externalId: '30789', lastSyncedAt: '6h ago', status: 'active' },
      { provider: 'IMDb', externalId: 'tt3078901', lastSyncedAt: '8h ago', status: 'active' },
      { provider: 'Plex', externalId: 'plex-whispers-rain', lastSyncedAt: '1d ago', status: 'active' },
    ],
    relations: [
      { id: 'mov-001', title: 'Shattered Dawn', type: 'related' },
    ],
    metadataStatus: 'synced',
    updatedAt: '6h ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'mov-004',
    slug: 'phantom-circuit',
    title: 'Phantom Circuit',
    titleOriginal: 'ファントムサーキット',
    synopsis:
      'In a near-future Tokyo where memories can be traded like currency, a black-market memory dealer stumbles upon a set of implant chips containing the suppressed memories of a murdered AI researcher — and realizes someone powerful will kill to keep them buried.',
    status: 'Draft',
    genres: ['Sci-Fi', 'Thriller', 'Mystery'],
    director: 'Katsuhiro Otomo',
    writers: ['Katsuhiro Otomo', 'Sadayuki Murai'],
    cast: ['Takeru Satoh', 'Tao Tsuchiya', 'Shun Oguri'],
    tags: ['cyberpunk', 'memories', 'conspiracy'],
    year: 2025,
    rating: 8.5,
    duration: 135,
    ageRating: 'R',
    assets: {
      poster: '/covers/phantom-circuit.png',
      banner: '/banners/phantom-circuit-banner.png',
      backdrop: '/banners/phantom-circuit-banner.png',
    },
    externalIds: {
      tmdb: '41012',
      imdb: 'tt4101234',
    },
    sources: [
      { provider: 'TMDB', externalId: '41012', lastSyncedAt: '2d ago', status: 'active' },
    ],
    relations: [],
    metadataStatus: 'stale',
    updatedAt: '2d ago',
    updatedBy: 'admin',
  },
  {
    id: 'mov-005',
    slug: 'echoes-of-silence',
    title: 'Echoes of Silence',
    titleOriginal: '沈黙のエコー',
    synopsis:
      'A deaf musician navigates the bustling nightlife of Osaka, finding connection through rhythm and vibration. When she\'s offered a chance to perform at an underground festival, she must confront the trauma that silenced her voice years ago.',
    status: 'Published',
    genres: ['Drama', 'Romance', 'Music'],
    director: 'Naomi Kawase',
    writers: ['Naomi Kawase'],
    cast: ['Minami Hamabe', 'Kento Yamazaki', 'Nana Mori'],
    tags: ['music', 'disability', 'self-discovery'],
    year: 2024,
    rating: 8.7,
    duration: 112,
    ageRating: 'PG',
    assets: {
      poster: '/covers/echoes-silence.png',
      banner: '/banners/echoes-silence-banner.png',
      backdrop: '/banners/echoes-silence-banner.png',
    },
    externalIds: {
      tmdb: '52345',
      imdb: 'tt5234567',
    },
    sources: [
      { provider: 'TMDB', externalId: '52345', lastSyncedAt: '12h ago', status: 'active' },
      { provider: 'IMDb', externalId: 'tt5234567', lastSyncedAt: '1d ago', status: 'active' },
    ],
    relations: [
      { id: 'mov-001', title: 'Shattered Dawn', type: 'related' },
    ],
    metadataStatus: 'synced',
    updatedAt: '12h ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'mov-006',
    slug: 'the-last-samurai-chronicle',
    title: 'The Last Samurai Chronicle',
    titleOriginal: '最後の侍クロニクル',
    synopsis:
      'As the Meiji era dawns, the last remaining samurai must protect his village from industrialists who want to turn their sacred forest into a railway. His only allies: a group of outcasts and a foreign journalist seeking the truth.',
    status: 'Review',
    genres: ['Action', 'Drama', 'Historical'],
    director: 'Takashi Yamazaki',
    writers: ['Takashi Yamazaki', 'Kazunari Kondo'],
    cast: ['Hiroyuki Sanada', 'Masataka Kubota', 'Kasumi Arimura'],
    tags: ['samurai', 'meiji', 'tradition vs modernity'],
    year: 2025,
    rating: 8.6,
    duration: 155,
    ageRating: 'PG-13',
    assets: {
      poster: '/covers/last-samurai-chronicle.png',
      banner: '/banners/last-samurai-chronicle-banner.png',
      backdrop: '/banners/last-samurai-chronicle-banner.png',
    },
    externalIds: {
      tmdb: '63456',
      imdb: 'tt6345678',
    },
    sources: [
      { provider: 'TMDB', externalId: '63456', lastSyncedAt: '1d ago', status: 'active' },
    ],
    relations: [],
    metadataStatus: 'stale',
    updatedAt: '1d ago',
    updatedBy: 'admin',
  },
  {
    id: 'mov-007',
    slug: 'neon-wasteland',
    title: 'Neon Wasteland',
    titleOriginal: 'ネオン荒地',
    synopsis:
      'In a derelict district of Neo-Osaka 2089, a scavenger with a prosthetic arm uncovers a sealed vault containing pre-collapse AI technology. Corporate kill-squads and rival scavengers converge on her location as she tries to unlock its secrets.',
    status: 'Approved',
    genres: ['Sci-Fi', 'Action', 'Thriller'],
    director: 'Shinichiro Watanabe',
    writers: ['Shinichiro Watanabe'],
    cast: ['Ryota Katayone', 'Mayu Matsuoka', 'Tadanobu Asano'],
    tags: ['cyberpunk', 'scavenger', 'corporate dystopia'],
    year: 2025,
    rating: 8.4,
    duration: 122,
    ageRating: 'R',
    assets: {
      poster: '/covers/neon-wasteland.png',
      banner: '/banners/neon-wasteland-banner.png',
      backdrop: '/banners/neon-wasteland-banner.png',
    },
    externalIds: {
      tmdb: '74567',
      imdb: 'tt7456789',
    },
    sources: [
      { provider: 'TMDB', externalId: '74567', lastSyncedAt: '3d ago', status: 'active' },
      { provider: 'IMDb', externalId: 'tt7456789', lastSyncedAt: '3d ago', status: 'active' },
    ],
    relations: [],
    metadataStatus: 'synced',
    updatedAt: '3d ago',
    updatedBy: 'admin',
  },
  {
    id: 'mov-008',
    slug: 'gentle-typhoon',
    title: 'Gentle Typhoon',
    titleOriginal: '優しい台風',
    synopsis:
      'A retired typhoon chaser reunites with his estranged daughter during a record-breaking storm season. As the most powerful typhoon in decades approaches, they must reconcile their differences and save a coastal town that refuses to evacuate.',
    status: 'Scheduled',
    genres: ['Drama', 'Adventure'],
    director: 'Yojiro Takita',
    writers: ['Yojiro Takita'],
    cast: ['Tomokazu Miura', 'Aoi Yuuki', 'Go Ayano'],
    tags: ['family', 'natural disaster', 'reconciliation'],
    year: 2025,
    rating: 8.3,
    duration: 130,
    ageRating: 'PG-13',
    assets: {
      poster: '/covers/gentle-typhoon.png',
      banner: '/banners/gentle-typhoon-banner.png',
      backdrop: '/banners/gentle-typhoon-banner.png',
    },
    externalIds: {
      tmdb: '85678',
      imdb: 'tt8567890',
    },
    sources: [
      { provider: 'TMDB', externalId: '85678', lastSyncedAt: '5d ago', status: 'active' },
    ],
    relations: [],
    metadataStatus: 'error',
    updatedAt: '5d ago',
    updatedBy: 'admin',
  },
  {
    id: 'mov-009',
    slug: 'shadow-garden',
    title: 'Shadow Garden',
    titleOriginal: '影の庭園',
    synopsis:
      'A retired assassin living under a false identity tends a peaceful garden in rural Japan. When her former organization tracks her down, she must decide whether to fight or let the life she built burn — along with the people she loves.',
    status: 'Draft',
    genres: ['Action', 'Thriller', 'Drama'],
    director: 'Sion Sono',
    writers: ['Sion Sono'],
    cast: ['Yuko Takeuchi', 'Junichi Okada', 'Takeshi Kitano'],
    tags: ['assassin', 'retirement', 'rural japan'],
    year: 2025,
    rating: 8.1,
    duration: 118,
    ageRating: 'R',
    assets: {
      poster: '/covers/shadow-garden.png',
      banner: '/banners/shadow-garden-banner.png',
      backdrop: '/banners/shadow-garden-banner.png',
    },
    externalIds: {
      tmdb: '96789',
    },
    sources: [
      { provider: 'TMDB', externalId: '96789', lastSyncedAt: '7d ago', status: 'active' },
    ],
    relations: [],
    metadataStatus: 'missing',
    updatedAt: '7d ago',
    updatedBy: 'admin',
  },
  {
    id: 'mov-010',
    slug: 'celestial-drift',
    title: 'Celestial Drift',
    titleOriginal: '天体漂流',
    synopsis:
      'A deep-space probe discovers a signal that matches a lullaby from Earth\'s earliest civilizations. A linguist and an astronaut must decode the message before their deteriorating station falls silent forever.',
    status: 'Archived',
    genres: ['Sci-Fi', 'Mystery', 'Drama'],
    director: 'Makoto Shinkai',
    writers: ['Makoto Shinkai'],
    cast: ['Ryunosuke Kamiki', 'Nanami Sakuraba', 'Kazuhiko Inoue'],
    tags: ['space', 'first contact', 'linguistics'],
    year: 2024,
    rating: 9.0,
    duration: 138,
    ageRating: 'PG-13',
    assets: {
      poster: '/covers/celestial-drift.png',
      banner: '/banners/celestial-drift-banner.png',
      backdrop: '/banners/celestial-drift-banner.png',
    },
    externalIds: {
      tmdb: '10890',
      imdb: 'tt1089012',
    },
    sources: [
      { provider: 'TMDB', externalId: '10890', lastSyncedAt: '4d ago', status: 'inactive' },
      { provider: 'IMDb', externalId: 'tt1089012', lastSyncedAt: '4d ago', status: 'inactive' },
    ],
    relations: [],
    metadataStatus: 'stale',
    updatedAt: '4d ago',
    updatedBy: 'admin',
  },
]

export function getMovieStats(movies: MovieItem[]) {
  const total = movies.length
  const published = movies.filter((m) => m.status === 'Published').length
  const drafts = movies.filter((m) => m.status === 'Draft').length
  const metadataErrors = movies.filter(
    (m) => m.metadataStatus === 'error' || m.metadataStatus === 'missing',
  ).length
  const inReview = movies.filter((m) => m.status === 'Review').length
  const archived = movies.filter((m) => m.status === 'Archived').length
  const avgRating =
    movies.length > 0
      ? movies.reduce((acc, m) => acc + m.rating, 0) / movies.length
      : 0
  const avgDuration =
    movies.length > 0
      ? Math.round(movies.reduce((acc, m) => acc + m.duration, 0) / movies.length)
      : 0

  return {
    total,
    published,
    drafts,
    metadataErrors,
    inReview,
    archived,
    avgRating,
    avgDuration,
  }
}
