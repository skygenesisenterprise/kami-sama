import type { StatusTone } from '@/components/dash/status-badge'

export type PublicationState =
  | 'Added'
  | 'Draft'
  | 'Review'
  | 'Approved'
  | 'Scheduled'
  | 'Published'
  | 'Archived'

export type TvShowType =
  | 'drama'
  | 'comedy'
  | 'thriller'
  | 'reality'
  | 'documentary'
  | 'animation'
  | 'talk-show'

export type DataSource =
  | 'TMDB'
  | 'IMDb'
  | 'TheTVDB'
  | 'Jellyfin'
  | 'Plex'
  | 'Trakt'
  | 'TMDb'

export type MetadataStatus = 'synced' | 'stale' | 'error' | 'missing'

export interface ExternalIds {
  tmdb?: string
  imdb?: string
  thetvdb?: string
  trakt?: string
  jellyfin?: string
  plex?: string
}

export interface TvShowSource {
  provider: DataSource
  externalId: string
  lastSyncedAt: string
  status: 'active' | 'inactive' | 'error'
}

export interface TvShowSeason {
  id: string
  number: number
  title: string
  episodeCount: number
  year: number
  aired: boolean
}

export interface TvShowRelation {
  id: string
  title: string
  type: 'sequel' | 'prequel' | 'spin-off' | 'adaptation' | 'related'
}

export interface TvShowAsset {
  poster: string
  banner: string
  backdrop: string
}

export interface TvShowItem {
  id: string
  slug: string
  title: string
  titleOriginal: string
  synopsis: string
  type: TvShowType
  status: PublicationState
  airingStatus: 'airing' | 'completed' | 'upcoming' | 'hiatus'
  genres: string[]
  networks: string[]
  tags: string[]
  year: number
  rating: number
  seasonCount: number
  totalEpisodes: number
  ageRating: string
  assets: TvShowAsset
  externalIds: ExternalIds
  sources: TvShowSource[]
  seasons: TvShowSeason[]
  relations: TvShowRelation[]
  metadataStatus: MetadataStatus
  updatedAt: string
  updatedBy: string
}

export const TV_SHOW_STATUS_TONE: Record<PublicationState, StatusTone> = {
  Added: 'neutral',
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

export const ALL_TV_SHOW_STATUSES: Array<PublicationState | 'all'> = [
  'all',
  'Draft',
  'Review',
  'Approved',
  'Scheduled',
  'Published',
  'Archived',
]

export const ALL_TV_SHOW_TYPES: Array<TvShowType | 'all'> = [
  'all',
  'drama',
  'comedy',
  'thriller',
  'reality',
  'documentary',
  'animation',
  'talk-show',
]

export const ALL_DATA_SOURCES: Array<DataSource | 'all'> = [
  'all',
  'TMDB',
  'IMDb',
  'TheTVDB',
  'Jellyfin',
  'Plex',
  'Trakt',
]

export const TV_SHOWS_MOCK: TvShowItem[] = [
  {
    id: 'tv-001',
    slug: 'breaking-bad',
    title: 'Breaking Bad',
    titleOriginal: 'Breaking Bad',
    synopsis:
      'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student to secure his family\'s future.',
    type: 'drama',
    status: 'Published',
    airingStatus: 'completed',
    genres: ['Drama', 'Thriller', 'Crime'],
    networks: ['AMC'],
    tags: ['crime', 'family', 'transformation', 'dark'],
    year: 2008,
    rating: 9.5,
    seasonCount: 5,
    totalEpisodes: 62,
    ageRating: 'TV-MA',
    assets: {
      poster: '/covers/breaking-bad.png',
      banner: '/banners/breaking-bad-banner.png',
      backdrop: '/banners/breaking-bad-backdrop.png',
    },
    externalIds: {
      tmdb: '1396',
      imdb: 'tt0903747',
      thetvdb: '81189',
      trakt: 'breaking-bad',
    },
    sources: [
      { provider: 'TMDB', externalId: '1396', lastSyncedAt: '1h ago', status: 'active' },
      { provider: 'IMDb', externalId: 'tt0903747', lastSyncedAt: '2h ago', status: 'active' },
      { provider: 'TheTVDB', externalId: '81189', lastSyncedAt: '3h ago', status: 'active' },
      { provider: 'Jellyfin', externalId: 'jf-breaking-bad', lastSyncedAt: '30m ago', status: 'active' },
    ],
    seasons: [
      { id: 's1', number: 1, title: 'Season 1', episodeCount: 7, year: 2008, aired: true },
      { id: 's2', number: 2, title: 'Season 2', episodeCount: 13, year: 2009, aired: true },
      { id: 's3', number: 3, title: 'Season 3', episodeCount: 13, year: 2010, aired: true },
      { id: 's4', number: 4, title: 'Season 4', episodeCount: 13, year: 2011, aired: true },
      { id: 's5', number: 5, title: 'Season 5', episodeCount: 16, year: 2012, aired: true },
    ],
    relations: [
      { id: 'tv-002', title: 'Better Call Saul', type: 'spin-off' },
      { id: 'tv-003', title: 'El Camino', type: 'spin-off' },
    ],
    metadataStatus: 'synced',
    updatedAt: '1h ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'tv-002',
    slug: 'better-call-saul',
    title: 'Better Call Saul',
    titleOriginal: 'Better Call Saul',
    synopsis:
      'The transformation of Jimmy McGill into the morally compromised lawyer Saul Goodman, set six years before the events of Breaking Bad.',
    type: 'drama',
    status: 'Published',
    airingStatus: 'completed',
    genres: ['Drama', 'Crime', 'Legal'],
    networks: ['AMC'],
    tags: ['prequel', 'lawyer', 'character study'],
    year: 2015,
    rating: 8.9,
    seasonCount: 6,
    totalEpisodes: 63,
    ageRating: 'TV-MA',
    assets: {
      poster: '/covers/better-call-saul.png',
      banner: '/banners/better-call-saul-banner.png',
      backdrop: '/banners/better-call-saul-backdrop.png',
    },
    externalIds: {
      tmdb: '273181',
      imdb: 'tt3032476',
      thetvdb: '273181',
    },
    sources: [
      { provider: 'TMDB', externalId: '273181', lastSyncedAt: '2h ago', status: 'active' },
      { provider: 'IMDb', externalId: 'tt3032476', lastSyncedAt: '3h ago', status: 'active' },
    ],
    seasons: [
      { id: 's1', number: 1, title: 'Season 1', episodeCount: 10, year: 2015, aired: true },
      { id: 's2', number: 2, title: 'Season 2', episodeCount: 10, year: 2016, aired: true },
      { id: 's3', number: 3, title: 'Season 3', episodeCount: 10, year: 2017, aired: true },
      { id: 's4', number: 4, title: 'Season 4', episodeCount: 10, year: 2018, aired: true },
      { id: 's5', number: 5, title: 'Season 5', episodeCount: 10, year: 2020, aired: true },
      { id: 's6', number: 6, title: 'Season 6', episodeCount: 13, year: 2022, aired: true },
    ],
    relations: [
      { id: 'tv-001', title: 'Breaking Bad', type: 'prequel' },
    ],
    metadataStatus: 'synced',
    updatedAt: '2h ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'tv-003',
    slug: 'el-camino',
    title: 'El Camino: A Breaking Bad Movie',
    titleOriginal: 'El Camino: A Breaking Bad Movie',
    synopsis:
      'In the wake of his dramatic escape from captivity, Jesse Pinkman must come to terms with his past in order to forge some kind of future.',
    type: 'drama',
    status: 'Published',
    airingStatus: 'completed',
    genres: ['Drama', 'Crime', 'Thriller'],
    networks: ['Netflix'],
    tags: ['movie', 'sequel', 'escape'],
    year: 2019,
    rating: 8.1,
    seasonCount: 1,
    totalEpisodes: 1,
    ageRating: 'TV-MA',
    assets: {
      poster: '/covers/el-camino.png',
      banner: '/banners/el-camino-banner.png',
      backdrop: '/banners/el-camino-backdrop.png',
    },
    externalIds: {
      tmdb: '566525',
      imdb: 'tt9248952',
    },
    sources: [
      { provider: 'TMDB', externalId: '566525', lastSyncedAt: '4h ago', status: 'active' },
      { provider: 'IMDb', externalId: 'tt9248952', lastSyncedAt: '5h ago', status: 'active' },
    ],
    seasons: [
      { id: 's1', number: 1, title: 'Movie', episodeCount: 1, year: 2019, aired: true },
    ],
    relations: [
      { id: 'tv-001', title: 'Breaking Bad', type: 'sequel' },
    ],
    metadataStatus: 'synced',
    updatedAt: '4h ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'tv-004',
    slug: 'the-last-of-us',
    title: 'The Last of Us',
    titleOriginal: 'The Last of Us',
    synopsis:
      'Twenty years after modern civilization has been destroyed, Joel is hired to smuggle Ellie out of an oppressive quarantine zone. What starts as a small job soon becomes a brutal and heartbreaking journey.',
    type: 'drama',
    status: 'Published',
    airingStatus: 'airing',
    genres: ['Drama', 'Action', 'Post-Apocalyptic'],
    networks: ['HBO'],
    tags: ['adaptation', 'post-apocalyptic', 'zombie', 'survival'],
    year: 2023,
    rating: 8.8,
    seasonCount: 2,
    totalEpisodes: 9,
    ageRating: 'TV-MA',
    assets: {
      poster: '/covers/the-last-of-us.png',
      banner: '/banners/the-last-of-us-banner.png',
      backdrop: '/banners/the-last-of-us-backdrop.png',
    },
    externalIds: {
      tmdb: '100088',
      imdb: 'tt3581920',
      thetvdb: '361121',
    },
    sources: [
      { provider: 'TMDB', externalId: '100088', lastSyncedAt: '30m ago', status: 'active' },
      { provider: 'IMDb', externalId: 'tt3581920', lastSyncedAt: '1h ago', status: 'active' },
      { provider: 'TheTVDB', externalId: '361121', lastSyncedAt: '2h ago', status: 'active' },
    ],
    seasons: [
      { id: 's1', number: 1, title: 'Season 1', episodeCount: 9, year: 2023, aired: true },
      { id: 's2', number: 2, title: 'Season 2', episodeCount: 0, year: 2025, aired: false },
    ],
    relations: [],
    metadataStatus: 'synced',
    updatedAt: '30m ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'tv-005',
    slug: 'succession',
    title: 'Succession',
    titleOriginal: 'Succession',
    synopsis:
      'The Roy family controls one of the biggest media and entertainment conglomerates in the world. When the head of the company decides to step down, his children begin a battle for control.',
    type: 'drama',
    status: 'Published',
    airingStatus: 'completed',
    genres: ['Drama', 'Family', 'Business'],
    networks: ['HBO'],
    tags: ['family', 'power', 'media', 'dynasty'],
    year: 2018,
    rating: 8.9,
    seasonCount: 4,
    totalEpisodes: 39,
    ageRating: 'TV-MA',
    assets: {
      poster: '/covers/succession.png',
      banner: '/banners/succession-banner.png',
      backdrop: '/banners/succession-backdrop.png',
    },
    externalIds: {
      tmdb: '82856',
      imdb: 'tt7660850',
    },
    sources: [
      { provider: 'TMDB', externalId: '82856', lastSyncedAt: '3h ago', status: 'active' },
      { provider: 'IMDb', externalId: 'tt7660850', lastSyncedAt: '4h ago', status: 'active' },
    ],
    seasons: [
      { id: 's1', number: 1, title: 'Season 1', episodeCount: 10, year: 2018, aired: true },
      { id: 's2', number: 2, title: 'Season 2', episodeCount: 10, year: 2019, aired: true },
      { id: 's3', number: 3, title: 'Season 3', episodeCount: 9, year: 2021, aired: true },
      { id: 's4', number: 4, title: 'Season 4', episodeCount: 10, year: 2023, aired: true },
    ],
    relations: [],
    metadataStatus: 'synced',
    updatedAt: '3h ago',
    updatedBy: 'admin',
  },
  {
    id: 'tv-006',
    slug: 'stranger-things',
    title: 'Stranger Things',
    titleOriginal: 'Stranger Things',
    synopsis:
      'When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.',
    type: 'drama',
    status: 'Published',
    airingStatus: 'completed',
    genres: ['Sci-Fi', 'Horror', 'Drama'],
    networks: ['Netflix'],
    tags: ['supernatural', '80s', 'kids', 'parallel worlds'],
    year: 2016,
    rating: 8.7,
    seasonCount: 4,
    totalEpisodes: 34,
    ageRating: 'TV-14',
    assets: {
      poster: '/covers/stranger-things.png',
      banner: '/banners/stranger-things-banner.png',
      backdrop: '/banners/stranger-things-backdrop.png',
    },
    externalIds: {
      tmdb: '66732',
      imdb: 'tt4574334',
      thetvdb: '304547',
    },
    sources: [
      { provider: 'TMDB', externalId: '66732', lastSyncedAt: '2h ago', status: 'active' },
      { provider: 'IMDb', externalId: 'tt4574334', lastSyncedAt: '3h ago', status: 'active' },
      { provider: 'TheTVDB', externalId: '304547', lastSyncedAt: '4h ago', status: 'active' },
    ],
    seasons: [
      { id: 's1', number: 1, title: 'Season 1', episodeCount: 8, year: 2016, aired: true },
      { id: 's2', number: 2, title: 'Season 2', episodeCount: 9, year: 2017, aired: true },
      { id: 's3', number: 3, title: 'Season 3', episodeCount: 8, year: 2019, aired: true },
      { id: 's4', number: 4, title: 'Season 4', episodeCount: 9, year: 2022, aired: true },
    ],
    relations: [],
    metadataStatus: 'synced',
    updatedAt: '2h ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'tv-007',
    slug: 'the-crown',
    title: 'The Crown',
    titleOriginal: 'The Crown',
    synopsis:
      'Follows the political rivalries and romance of Queen Elizabeth II\'s reign and the events that shaped the second half of the twentieth century.',
    type: 'drama',
    status: 'Published',
    airingStatus: 'completed',
    genres: ['Drama', 'Historical', 'Biography'],
    networks: ['Netflix'],
    tags: ['royalty', 'historical', 'british', 'political'],
    year: 2016,
    rating: 8.7,
    seasonCount: 6,
    totalEpisodes: 60,
    ageRating: 'TV-MA',
    assets: {
      poster: '/covers/the-crown.png',
      banner: '/banners/the-crown-banner.png',
      backdrop: '/banners/the-crown-backdrop.png',
    },
    externalIds: {
      tmdb: '71360',
      imdb: 'tt4786824',
      thetvdb: '302597',
    },
    sources: [
      { provider: 'TMDB', externalId: '71360', lastSyncedAt: '5h ago', status: 'active' },
      { provider: 'IMDb', externalId: 'tt4786824', lastSyncedAt: '6h ago', status: 'active' },
      { provider: 'TheTVDB', externalId: '302597', lastSyncedAt: '1d ago', status: 'active' },
    ],
    seasons: [
      { id: 's1', number: 1, title: 'Season 1', episodeCount: 10, year: 2016, aired: true },
      { id: 's2', number: 2, title: 'Season 2', episodeCount: 10, year: 2017, aired: true },
      { id: 's3', number: 3, title: 'Season 3', episodeCount: 10, year: 2019, aired: true },
      { id: 's4', number: 4, title: 'Season 4', episodeCount: 10, year: 2020, aired: true },
      { id: 's5', number: 5, title: 'Season 5', episodeCount: 10, year: 2022, aired: true },
      { id: 's6', number: 6, title: 'Season 6', episodeCount: 10, year: 2023, aired: true },
    ],
    relations: [],
    metadataStatus: 'synced',
    updatedAt: '5h ago',
    updatedBy: 'admin',
  },
  {
    id: 'tv-008',
    slug: 'the-bear',
    title: 'The Bear',
    titleOriginal: 'The Bear',
    synopsis:
      'A young chef from the fine dining world returns to Chicago to run his family\'s Italian beef sandwich shop after the death of his brother.',
    type: 'drama',
    status: 'Published',
    airingStatus: 'airing',
    genres: ['Drama', 'Comedy', 'Culinary'],
    networks: ['FX', 'Hulu'],
    tags: ['cooking', 'family', 'grief', 'chicago'],
    year: 2022,
    rating: 8.6,
    seasonCount: 3,
    totalEpisodes: 28,
    ageRating: 'TV-MA',
    assets: {
      poster: '/covers/the-bear.png',
      banner: '/banners/the-bear-banner.png',
      backdrop: '/banners/the-bear-backdrop.png',
    },
    externalIds: {
      tmdb: '190560',
      imdb: 'tt15450676',
    },
    sources: [
      { provider: 'TMDB', externalId: '190560', lastSyncedAt: '1h ago', status: 'active' },
      { provider: 'IMDb', externalId: 'tt15450676', lastSyncedAt: '2h ago', status: 'active' },
    ],
    seasons: [
      { id: 's1', number: 1, title: 'Season 1', episodeCount: 8, year: 2022, aired: true },
      { id: 's2', number: 2, title: 'Season 2', episodeCount: 10, year: 2023, aired: true },
      { id: 's3', number: 3, title: 'Season 3', episodeCount: 10, year: 2024, aired: true },
    ],
    relations: [],
    metadataStatus: 'synced',
    updatedAt: '1h ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'tv-009',
    slug: 'house-of-the-dragon',
    title: 'House of the Dragon',
    titleOriginal: 'House of the Dragon',
    synopsis:
      'The story of the Targaryen civil war, fought 200 years before the events of Game of Thrones, which tore their dynasty apart.',
    type: 'drama',
    status: 'Published',
    airingStatus: 'airing',
    genres: ['Fantasy', 'Drama', 'Action'],
    networks: ['HBO'],
    tags: ['fantasy', 'medieval', 'dragons', 'political'],
    year: 2022,
    rating: 8.4,
    seasonCount: 2,
    totalEpisodes: 18,
    ageRating: 'TV-MA',
    assets: {
      poster: '/covers/house-of-the-dragon.png',
      banner: '/banners/house-of-the-dragon-banner.png',
      backdrop: '/banners/house-of-the-dragon-backdrop.png',
    },
    externalIds: {
      tmdb: '94997',
      imdb: 'tt11198330',
      thetvdb: '362061',
    },
    sources: [
      { provider: 'TMDB', externalId: '94997', lastSyncedAt: '2h ago', status: 'active' },
      { provider: 'IMDb', externalId: 'tt11198330', lastSyncedAt: '3h ago', status: 'active' },
      { provider: 'TheTVDB', externalId: '362061', lastSyncedAt: '4h ago', status: 'active' },
    ],
    seasons: [
      { id: 's1', number: 1, title: 'Season 1', episodeCount: 10, year: 2022, aired: true },
      { id: 's2', number: 2, title: 'Season 2', episodeCount: 8, year: 2024, aired: true },
    ],
    relations: [
      { id: 'tv-010', title: 'Game of Thrones', type: 'related' },
    ],
    metadataStatus: 'synced',
    updatedAt: '2h ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'tv-010',
    slug: 'game-of-thrones',
    title: 'Game of Thrones',
    titleOriginal: 'Game of Thrones',
    synopsis:
      'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.',
    type: 'drama',
    status: 'Published',
    airingStatus: 'completed',
    genres: ['Fantasy', 'Drama', 'Action'],
    networks: ['HBO'],
    tags: ['fantasy', 'medieval', 'political', 'epic'],
    year: 2011,
    rating: 9.3,
    seasonCount: 8,
    totalEpisodes: 73,
    ageRating: 'TV-MA',
    assets: {
      poster: '/covers/game-of-thrones.png',
      banner: '/banners/game-of-thrones-banner.png',
      backdrop: '/banners/game-of-thrones-backdrop.png',
    },
    externalIds: {
      tmdb: '1399',
      imdb: 'tt0944947',
      thetvdb: '121361',
    },
    sources: [
      { provider: 'TMDB', externalId: '1399', lastSyncedAt: '1h ago', status: 'active' },
      { provider: 'IMDb', externalId: 'tt0944947', lastSyncedAt: '2h ago', status: 'active' },
      { provider: 'TheTVDB', externalId: '121361', lastSyncedAt: '3h ago', status: 'active' },
      { provider: 'Jellyfin', externalId: 'jf-game-of-thrones', lastSyncedAt: '30m ago', status: 'active' },
    ],
    seasons: [
      { id: 's1', number: 1, title: 'Season 1', episodeCount: 10, year: 2011, aired: true },
      { id: 's2', number: 2, title: 'Season 2', episodeCount: 10, year: 2012, aired: true },
      { id: 's3', number: 3, title: 'Season 3', episodeCount: 10, year: 2013, aired: true },
      { id: 's4', number: 4, title: 'Season 4', episodeCount: 10, year: 2014, aired: true },
      { id: 's5', number: 5, title: 'Season 5', episodeCount: 10, year: 2015, aired: true },
      { id: 's6', number: 6, title: 'Season 6', episodeCount: 10, year: 2016, aired: true },
      { id: 's7', number: 7, title: 'Season 7', episodeCount: 7, year: 2017, aired: true },
      { id: 's8', number: 8, title: 'Season 8', episodeCount: 6, year: 2019, aired: true },
    ],
    relations: [
      { id: 'tv-009', title: 'House of the Dragon', type: 'related' },
    ],
    metadataStatus: 'synced',
    updatedAt: '1h ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'tv-011',
    slug: 'ted-lasso',
    title: 'Ted Lasso',
    titleOriginal: 'Ted Lasso',
    synopsis:
      'An American college football coach is hired to manage a professional soccer team in England despite having no experience in the sport.',
    type: 'comedy',
    status: 'Published',
    airingStatus: 'completed',
    genres: ['Comedy', 'Drama', 'Sports'],
    networks: ['Apple TV+'],
    tags: ['soccer', 'optimism', 'fish-out-of-water', 'feel-good'],
    year: 2020,
    rating: 8.8,
    seasonCount: 3,
    totalEpisodes: 34,
    ageRating: 'TV-14',
    assets: {
      poster: '/covers/ted-lasso.png',
      banner: '/banners/ted-lasso-banner.png',
      backdrop: '/banners/ted-lasso-backdrop.png',
    },
    externalIds: {
      tmdb: '110647',
      imdb: 'tt1097455',
    },
    sources: [
      { provider: 'TMDB', externalId: '110647', lastSyncedAt: '4h ago', status: 'active' },
      { provider: 'IMDb', externalId: 'tt1097455', lastSyncedAt: '5h ago', status: 'active' },
    ],
    seasons: [
      { id: 's1', number: 1, title: 'Season 1', episodeCount: 10, year: 2020, aired: true },
      { id: 's2', number: 2, title: 'Season 2', episodeCount: 12, year: 2021, aired: true },
      { id: 's3', number: 3, title: 'Season 3', episodeCount: 12, year: 2023, aired: true },
    ],
    relations: [],
    metadataStatus: 'synced',
    updatedAt: '4h ago',
    updatedBy: 'admin',
  },
  {
    id: 'tv-012',
    slug: 'the-boys',
    title: 'The Boys',
    titleOriginal: 'The Boys',
    synopsis:
      'A group of vigilantes take on corrupt superheroes who abuse their superpowers. When the Boys discover a conspiracy involving these so-called heroes, they embark on a journey to expose the truth.',
    type: 'drama',
    status: 'Published',
    airingStatus: 'airing',
    genres: ['Action', 'Sci-Fi', 'Dark Comedy'],
    networks: ['Prime Video'],
    tags: ['superheroes', 'corruption', 'anti-hero', 'satire'],
    year: 2019,
    rating: 8.7,
    seasonCount: 4,
    totalEpisodes: 32,
    ageRating: 'TV-MA',
    assets: {
      poster: '/covers/the-boys.png',
      banner: '/banners/the-boys-banner.png',
      backdrop: '/banners/the-boys-backdrop.png',
    },
    externalIds: {
      tmdb: '76479',
      imdb: 'tt1190634',
    },
    sources: [
      { provider: 'TMDB', externalId: '76479', lastSyncedAt: '3h ago', status: 'active' },
      { provider: 'IMDb', externalId: 'tt1190634', lastSyncedAt: '4h ago', status: 'active' },
    ],
    seasons: [
      { id: 's1', number: 1, title: 'Season 1', episodeCount: 8, year: 2019, aired: true },
      { id: 's2', number: 2, title: 'Season 2', episodeCount: 8, year: 2020, aired: true },
      { id: 's3', number: 3, title: 'Season 3', episodeCount: 8, year: 2022, aired: true },
      { id: 's4', number: 4, title: 'Season 4', episodeCount: 8, year: 2024, aired: true },
    ],
    relations: [],
    metadataStatus: 'synced',
    updatedAt: '3h ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'tv-013',
    slug: 'planet-earth-iii',
    title: 'Planet Earth III',
    titleOriginal: 'Planet Earth III',
    synopsis:
      'David Attenborough returns for the third installment of the groundbreaking natural history documentary series, showcasing the most spectacular wildlife on our planet.',
    type: 'documentary',
    status: 'Draft',
    airingStatus: 'completed',
    genres: ['Documentary', 'Nature', 'Science'],
    networks: ['BBC'],
    tags: ['nature', 'wildlife', 'environment', 'educational'],
    year: 2023,
    rating: 9.2,
    seasonCount: 1,
    totalEpisodes: 8,
    ageRating: 'TV-G',
    assets: {
      poster: '/covers/planet-earth-iii.png',
      banner: '/banners/planet-earth-iii-banner.png',
      backdrop: '/banners/planet-earth-iii-backdrop.png',
    },
    externalIds: {
      tmdb: '224568',
      imdb: 'tt21124032',
      thetvdb: '421243',
    },
    sources: [
      { provider: 'TMDB', externalId: '224568', lastSyncedAt: '1d ago', status: 'active' },
      { provider: 'IMDb', externalId: 'tt21124032', lastSyncedAt: '1d ago', status: 'active' },
    ],
    seasons: [
      { id: 's1', number: 1, title: 'Season 1', episodeCount: 8, year: 2023, aired: true },
    ],
    relations: [],
    metadataStatus: 'stale',
    updatedAt: '5d ago',
    updatedBy: 'admin',
  },
  {
    id: 'tv-014',
    slug: 'squid-game',
    title: 'Squid Game',
    titleOriginal: '오징어 게임',
    synopsis:
      'Hundreds of cash-strapped players accept a strange invitation to compete in children\'s games. Inside, a tempting prize awaits with deadly high stakes.',
    type: 'thriller',
    status: 'Review',
    airingStatus: 'upcoming',
    genres: ['Thriller', 'Drama', 'Survival'],
    networks: ['Netflix'],
    tags: ['survival', 'korean', 'games', 'social commentary'],
    year: 2021,
    rating: 8.0,
    seasonCount: 2,
    totalEpisodes: 13,
    ageRating: 'TV-MA',
    assets: {
      poster: '/covers/squid-game.png',
      banner: '/banners/squid-game-banner.png',
      backdrop: '/banners/squid-game-backdrop.png',
    },
    externalIds: {
      tmdb: '93405',
      imdb: 'tt10919420',
    },
    sources: [
      { provider: 'TMDB', externalId: '93405', lastSyncedAt: '6h ago', status: 'active' },
      { provider: 'IMDb', externalId: 'tt10919420', lastSyncedAt: '8h ago', status: 'active' },
    ],
    seasons: [
      { id: 's1', number: 1, title: 'Season 1', episodeCount: 9, year: 2021, aired: true },
      { id: 's2', number: 2, title: 'Season 2', episodeCount: 4, year: 2025, aired: false },
    ],
    relations: [],
    metadataStatus: 'stale',
    updatedAt: '6h ago',
    updatedBy: 'admin',
  },
]

export function getTvShowStats(shows: TvShowItem[]) {
  const total = shows.length
  const published = shows.filter((s) => s.status === 'Published').length
  const drafts = shows.filter((s) => s.status === 'Draft').length
  const metadataErrors = shows.filter(
    (s) => s.metadataStatus === 'error' || s.metadataStatus === 'missing',
  ).length
  const inReview = shows.filter((s) => s.status === 'Review').length
  const archived = shows.filter((s) => s.status === 'Archived').length
  const totalEpisodes = shows.reduce((acc, s) => acc + s.totalEpisodes, 0)
  const avgRating =
    shows.length > 0
      ? shows.reduce((acc, s) => acc + s.rating, 0) / shows.length
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
