import type { StatusTone } from '@/components/dash/status-badge'

export type Season = 'winter' | 'spring' | 'summer' | 'fall'

export type AiringStatus =
  | 'currently_airing'
  | 'upcoming'
  | 'completed'
  | 'hiatus'

export type SeasonalContentType =
  | 'series'
  | 'movie'
  | 'ova'
  | 'ona'
  | 'special'

export type SeasonalSource =
  | 'tv'
  | 'streaming'
  | 'theatrical'
  | 'digital'

export interface SeasonalAnime {
  id: string
  title: string
  slug: string
  poster: string
  type: SeasonalContentType
  season: Season
  year: number
  episodes: number
  airedEpisodes: number
  airingStatus: AiringStatus
  premiereDate: string
  endDate?: string
  studio: string
  source: SeasonalSource
  rating: string
  score: number
  members: number
  favorites: number
  genres: string[]
  countries: string[]
  provider: string
  popularity: number
  rank: number
  updatedAt: string
  isPinned: boolean
  isFeatured: boolean
  isHighlighted: boolean
  analytics: SeasonalAnalytics
  episodesList: EpisodeEntry[]
}

export interface EpisodeEntry {
  number: number
  title: string
  airDate: string
  views: number
  rating: number
}

export interface SeasonalAnalytics {
  totalViews: number
  uniqueViewers: number
  avgWatchTime: number
  completionRate: number
  favoriteRate: number
  shareRate: number
  reviewCount: number
  averageRating: number
  peakConcurrent: number
}

export interface SeasonalStats {
  totalAnime: number
  currentlyAiring: number
  upcoming: number
  completed: number
  avgScore: number
  totalMembers: number
}

export interface SeasonalChart {
  id: string
  title: string
  type: 'line' | 'bar' | 'donut'
  data: ChartDataPoint[]
}

export interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

export interface SeasonalSettings {
  autoUpdateFrequency: string
  highlightThreshold: number
  maxFeatured: number
  showScore: boolean
  showMembers: boolean
  defaultSort: 'score' | 'members' | 'popularity' | 'episodes'
}

export const SEASONS: Season[] = ['winter', 'spring', 'summer', 'fall']

export const SEASON_LABEL: Record<Season, string> = {
  winter: 'Winter',
  spring: 'Spring',
  summer: 'Summer',
  fall: 'Fall',
}

export const SEASON_EMOJI: Record<Season, string> = {
  winter: '❄️',
  spring: '🌸',
  summer: '☀️',
  fall: '🍂',
}

export const YEARS = [2024, 2025, 2026]

export const AIRING_STATUSES: AiringStatus[] = [
  'currently_airing',
  'upcoming',
  'completed',
  'hiatus',
]

export const AIRING_STATUS_LABEL: Record<AiringStatus, string> = {
  currently_airing: 'Currently Airing',
  upcoming: 'Upcoming',
  completed: 'Completed',
  hiatus: 'Hiatus',
}

export const AIRING_STATUS_TONE: Record<AiringStatus, StatusTone> = {
  currently_airing: 'success',
  upcoming: 'info',
  completed: 'neutral',
  hiatus: 'warning',
}

export const SEASONAL_CONTENT_TYPES: SeasonalContentType[] = [
  'series',
  'movie',
  'ova',
  'ona',
  'special',
]

export const CONTENT_TYPE_LABEL: Record<SeasonalContentType, string> = {
  series: 'TV Series',
  movie: 'Movie',
  ova: 'OVA',
  ona: 'ONA',
  special: 'Special',
}

export const SEASONAL_SOURCES: SeasonalSource[] = [
  'tv',
  'streaming',
  'theatrical',
  'digital',
]

export const SOURCE_LABEL: Record<SeasonalSource, string> = {
  tv: 'TV',
  streaming: 'Streaming',
  theatrical: 'Theatrical',
  digital: 'Digital',
}

export const MOCK_GENRES = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Slice of Life',
  'Sports',
  'Supernatural',
  'Thriller',
]

export const MOCK_STUDIOS = [
  'MAPPA',
  'ufotable',
  'CloverWorks',
  'WIT Studio',
  'Bones',
  'Madhouse',
  'A-1 Pictures',
  'Kyoto Animation',
  'Trigger',
  'Production I.G',
]

export const MOCK_PROVIDERS = [
  'Crunchyroll',
  'Netflix',
  'Funimation',
  'HIDIVE',
  'Amazon Prime',
  'Hulu',
  'Disney+',
  'Bilibili',
]

export const MOCK_COUNTRIES = [
  'JP',
  'US',
  'KR',
  'CN',
  'FR',
  'DE',
  'GB',
  'BR',
  'IN',
  'AU',
]

export const COUNTRY_LABEL: Record<string, string> = {
  JP: 'Japan',
  US: 'United States',
  KR: 'South Korea',
  CN: 'China',
  FR: 'France',
  DE: 'Germany',
  GB: 'United Kingdom',
  BR: 'Brazil',
  IN: 'India',
  AU: 'Australia',
}

export const MOCK_SEASONAL: SeasonalAnime[] = [
  {
    id: 'sa-001',
    title: 'Solo Leveling Season 2: Arise from the Shadow',
    slug: 'solo-leveling-season-2',
    poster: '/posters/solo-leveling-s2.jpg',
    type: 'series',
    season: 'winter',
    year: 2026,
    episodes: 13,
    airedEpisodes: 8,
    airingStatus: 'currently_airing',
    premiereDate: '2026-01-04',
    studio: 'A-1 Pictures',
    source: 'streaming',
    rating: 'PG-13',
    score: 8.72,
    members: 487234,
    favorites: 45678,
    genres: ['Action', 'Fantasy', 'Adventure'],
    countries: ['JP', 'US', 'KR', 'BR', 'IN'],
    provider: 'Crunchyroll',
    popularity: 1,
    rank: 1,
    updatedAt: '2h ago',
    isPinned: true,
    isFeatured: true,
    isHighlighted: true,
    analytics: {
      totalViews: 14238765,
      uniqueViewers: 3456789,
      avgWatchTime: 24.3,
      completionRate: 92.1,
      favoriteRate: 34.5,
      shareRate: 12.8,
      reviewCount: 8765,
      averageRating: 4.8,
      peakConcurrent: 892345,
    },
    episodesList: [
      { number: 1, title: 'Arise', airDate: '2026-01-04', views: 2345678, rating: 4.9 },
      { number: 2, title: 'Shadow Exchange', airDate: '2026-01-11', views: 2123456, rating: 4.7 },
      { number: 3, title: 'The Hunt Begins', airDate: '2026-01-18', views: 1987654, rating: 4.8 },
      { number: 4, title: 'Iron Blood', airDate: '2026-01-25', views: 1876543, rating: 4.6 },
      { number: 5, title: 'Shadow Army', airDate: '2026-02-01', views: 1765432, rating: 4.7 },
      { number: 6, title: 'Rise Up', airDate: '2026-02-08', views: 1654321, rating: 4.8 },
      { number: 7, title: 'The Monarch', airDate: '2026-02-15', views: 1543210, rating: 4.9 },
      { number: 8, title: 'Awakening', airDate: '2026-02-22', views: 1432109, rating: 4.7 },
    ],
  },
  {
    id: 'sa-002',
    title: 'Demon Slayer: Kimetsu no Yaiba – Infinity Castle Arc',
    slug: 'demon-slayer-infinity-castle',
    poster: '/posters/demon-slayer-ic.jpg',
    type: 'series',
    season: 'winter',
    year: 2026,
    episodes: 26,
    airedEpisodes: 26,
    airingStatus: 'completed',
    premiereDate: '2026-01-05',
    endDate: '2026-06-28',
    studio: 'ufotable',
    source: 'tv',
    rating: 'R',
    score: 8.91,
    members: 654321,
    favorites: 67890,
    genres: ['Action', 'Supernatural', 'Drama'],
    countries: ['JP', 'US', 'KR', 'CN', 'AU'],
    provider: 'Crunchyroll',
    popularity: 2,
    rank: 2,
    updatedAt: '1d ago',
    isPinned: false,
    isFeatured: true,
    isHighlighted: false,
    analytics: {
      totalViews: 28765432,
      uniqueViewers: 5678901,
      avgWatchTime: 24.8,
      completionRate: 94.5,
      favoriteRate: 38.2,
      shareRate: 15.6,
      reviewCount: 12345,
      averageRating: 4.9,
      peakConcurrent: 1234567,
    },
    episodesList: [],
  },
  {
    id: 'sa-003',
    title: 'My Hero Academia: The Movie – You\'re Next',
    slug: 'mha-movie-youre-next',
    poster: '/posters/mha-movie.jpg',
    type: 'movie',
    season: 'winter',
    year: 2026,
    episodes: 1,
    airedEpisodes: 1,
    airingStatus: 'completed',
    premiereDate: '2026-02-20',
    endDate: '2026-02-20',
    studio: 'Bones',
    source: 'theatrical',
    rating: 'PG-13',
    score: 8.45,
    members: 234567,
    favorites: 23456,
    genres: ['Action', 'Superhero', 'Drama'],
    countries: ['JP', 'US', 'FR', 'BR'],
    provider: 'Funimation',
    popularity: 5,
    rank: 5,
    updatedAt: '3d ago',
    isPinned: false,
    isFeatured: false,
    isHighlighted: false,
    analytics: {
      totalViews: 8765432,
      uniqueViewers: 2345678,
      avgWatchTime: 112.5,
      completionRate: 96.2,
      favoriteRate: 42.1,
      shareRate: 18.9,
      reviewCount: 5678,
      averageRating: 4.7,
      peakConcurrent: 567890,
    },
    episodesList: [],
  },
  {
    id: 'sa-004',
    title: 'Jujutsu Kaisen Season 3',
    slug: 'jujutsu-kaisen-season-3',
    poster: '/posters/jjk-s3.jpg',
    type: 'series',
    season: 'spring',
    year: 2026,
    episodes: 24,
    airedEpisodes: 12,
    airingStatus: 'currently_airing',
    premiereDate: '2026-04-06',
    studio: 'MAPPA',
    source: 'tv',
    rating: 'R',
    score: 8.83,
    members: 543210,
    favorites: 54321,
    genres: ['Action', 'Supernatural', 'Horror'],
    countries: ['JP', 'US', 'KR', 'GB', 'CA'],
    provider: 'Crunchyroll',
    popularity: 3,
    rank: 3,
    updatedAt: '5h ago',
    isPinned: true,
    isFeatured: true,
    isHighlighted: true,
    analytics: {
      totalViews: 18234567,
      uniqueViewers: 4567890,
      avgWatchTime: 24.1,
      completionRate: 91.8,
      favoriteRate: 36.7,
      shareRate: 14.2,
      reviewCount: 9876,
      averageRating: 4.8,
      peakConcurrent: 1023456,
    },
    episodesList: [
      { number: 1, title: 'The Beginning', airDate: '2026-04-06', views: 2876543, rating: 4.9 },
      { number: 2, title: 'Cursed Womb', airDate: '2026-04-13', views: 2654321, rating: 4.7 },
      { number: 3, title: 'Black Flash', airDate: '2026-04-20', views: 2543210, rating: 4.8 },
      { number: 4, title: 'Domain Expansion', airDate: '2026-04-27', views: 2432109, rating: 4.9 },
      { number: 5, title: 'Shibuya Incident', airDate: '2026-05-04', views: 2321098, rating: 4.8 },
      { number: 6, title: 'Battle of Wills', airDate: '2026-05-11', views: 2210987, rating: 4.7 },
      { number: 7, title: 'Curse Manipulation', airDate: '2026-05-18', views: 2109876, rating: 4.8 },
      { number: 8, title: 'Awakening', airDate: '2026-05-25', views: 2098765, rating: 4.9 },
      { number: 9, title: 'Special Grade', airDate: '2026-06-01', views: 1987654, rating: 4.7 },
      { number: 10, title: 'Culling Game', airDate: '2026-06-08', views: 1876543, rating: 4.8 },
      { number: 11, title: 'Deadly Game', airDate: '2026-06-15', views: 1765432, rating: 4.8 },
      { number: 12, title: 'Convergence', airDate: '2026-06-22', views: 1654321, rating: 4.9 },
    ],
  },
  {
    id: 'sa-005',
    title: 'Chainsaw Man Part 2',
    slug: 'chainsaw-man-part-2',
    poster: '/posters/chainsaw-man-p2.jpg',
    type: 'series',
    season: 'spring',
    year: 2026,
    episodes: 12,
    airedEpisodes: 6,
    airingStatus: 'currently_airing',
    premiereDate: '2026-04-13',
    studio: 'MAPPA',
    source: 'streaming',
    rating: 'R',
    score: 8.67,
    members: 432109,
    favorites: 43210,
    genres: ['Action', 'Horror', 'Supernatural'],
    countries: ['JP', 'US', 'KR', 'GB', 'CA'],
    provider: 'Crunchyroll',
    popularity: 4,
    rank: 4,
    updatedAt: '8h ago',
    isPinned: false,
    isFeatured: true,
    isHighlighted: false,
    analytics: {
      totalViews: 12345678,
      uniqueViewers: 3456789,
      avgWatchTime: 23.8,
      completionRate: 89.4,
      favoriteRate: 32.1,
      shareRate: 13.5,
      reviewCount: 7654,
      averageRating: 4.7,
      peakConcurrent: 876543,
    },
    episodesList: [
      { number: 1, title: 'Bathroom War', airDate: '2026-04-13', views: 2543210, rating: 4.8 },
      { number: 2, title: 'Gun Devil', airDate: '2026-04-20', views: 2432109, rating: 4.7 },
      { number: 3, title: 'Bat Devil', airDate: '2026-04-27', views: 2321098, rating: 4.6 },
      { number: 4, title: 'Eternity Devil', airDate: '2026-05-04', views: 2210987, rating: 4.8 },
      { number: 5, title: 'Violence Devil', airDate: '2026-05-11', views: 2109876, rating: 4.7 },
      { number: 6, title: 'Darkness Devil', airDate: '2026-05-18', views: 1998765, rating: 4.9 },
    ],
  },
  {
    id: 'sa-006',
    title: 'Spy x Family Movie 2',
    slug: 'spy-x-family-movie-2',
    poster: '/posters/spy-family-movie-2.jpg',
    type: 'movie',
    season: 'summer',
    year: 2026,
    episodes: 1,
    airedEpisodes: 0,
    airingStatus: 'upcoming',
    premiereDate: '2026-07-18',
    studio: 'WIT Studio',
    source: 'theatrical',
    rating: 'PG',
    score: 0,
    members: 123456,
    favorites: 12345,
    genres: ['Action', 'Comedy', 'Slice of Life'],
    countries: ['JP', 'US', 'FR', 'DE', 'GB'],
    provider: 'Crunchyroll',
    popularity: 6,
    rank: 6,
    updatedAt: '1d ago',
    isPinned: false,
    isFeatured: true,
    isHighlighted: true,
    analytics: {
      totalViews: 0,
      uniqueViewers: 0,
      avgWatchTime: 0,
      completionRate: 0,
      favoriteRate: 0,
      shareRate: 0,
      reviewCount: 0,
      averageRating: 0,
      peakConcurrent: 0,
    },
    episodesList: [],
  },
  {
    id: 'sa-007',
    title: 'Frieren: Beyond Journey\'s End Season 2',
    slug: 'frieren-season-2',
    poster: '/posters/frieren-s2.jpg',
    type: 'series',
    season: 'summer',
    year: 2026,
    episodes: 28,
    airedEpisodes: 0,
    airingStatus: 'upcoming',
    premiereDate: '2026-07-05',
    studio: 'Madhouse',
    source: 'tv',
    rating: 'PG-13',
    score: 0,
    members: 98765,
    favorites: 9876,
    genres: ['Adventure', 'Drama', 'Fantasy'],
    countries: ['JP', 'US', 'DE', 'FR', 'CA'],
    provider: 'Crunchyroll',
    popularity: 7,
    rank: 7,
    updatedAt: '2d ago',
    isPinned: false,
    isFeatured: false,
    isHighlighted: false,
    analytics: {
      totalViews: 0,
      uniqueViewers: 0,
      avgWatchTime: 0,
      completionRate: 0,
      favoriteRate: 0,
      shareRate: 0,
      reviewCount: 0,
      averageRating: 0,
      peakConcurrent: 0,
    },
    episodesList: [],
  },
  {
    id: 'sa-008',
    title: 'One Punch Man Season 3',
    slug: 'one-punch-man-season-3',
    poster: '/posters/opm-s3.jpg',
    type: 'series',
    season: 'fall',
    year: 2026,
    episodes: 12,
    airedEpisodes: 0,
    airingStatus: 'upcoming',
    premiereDate: '2026-10-04',
    studio: 'J.C.Staff',
    source: 'tv',
    rating: 'PG-13',
    score: 0,
    members: 87654,
    favorites: 8765,
    genres: ['Action', 'Comedy', 'Superhero'],
    countries: ['JP', 'US', 'KR', 'BR'],
    provider: 'Crunchyroll',
    popularity: 8,
    rank: 8,
    updatedAt: '3d ago',
    isPinned: false,
    isFeatured: false,
    isHighlighted: false,
    analytics: {
      totalViews: 0,
      uniqueViewers: 0,
      avgWatchTime: 0,
      completionRate: 0,
      favoriteRate: 0,
      shareRate: 0,
      reviewCount: 0,
      averageRating: 0,
      peakConcurrent: 0,
    },
    episodesList: [],
  },
  {
    id: 'sa-009',
    title: 'Attack on Titan: The Final Season – The Final Attack',
    slug: 'aot-final-attack',
    poster: '/posters/aot-final.jpg',
    type: 'ova',
    season: 'winter',
    year: 2026,
    episodes: 1,
    airedEpisodes: 1,
    airingStatus: 'completed',
    premiereDate: '2026-01-01',
    endDate: '2026-01-01',
    studio: 'MAPPA',
    source: 'theatrical',
    rating: 'R',
    score: 9.12,
    members: 765432,
    favorites: 76543,
    genres: ['Action', 'Drama', 'Military'],
    countries: ['JP', 'US', 'KR', 'FR', 'DE'],
    provider: 'Crunchyroll',
    popularity: 9,
    rank: 9,
    updatedAt: '1w ago',
    isPinned: false,
    isFeatured: false,
    isHighlighted: false,
    analytics: {
      totalViews: 32109876,
      uniqueViewers: 8765432,
      avgWatchTime: 142.3,
      completionRate: 98.7,
      favoriteRate: 56.2,
      shareRate: 22.4,
      reviewCount: 15678,
      averageRating: 4.9,
      peakConcurrent: 2345678,
    },
    episodesList: [],
  },
  {
    id: 'sa-010',
    title: 'Dandadan Season 2',
    slug: 'dandadan-season-2',
    poster: '/posters/dandadan-s2.jpg',
    type: 'series',
    season: 'summer',
    year: 2026,
    episodes: 12,
    airedEpisodes: 0,
    airingStatus: 'upcoming',
    premiereDate: '2026-07-12',
    studio: 'Science SARU',
    source: 'streaming',
    rating: 'PG-13',
    score: 0,
    members: 76543,
    favorites: 7654,
    genres: ['Action', 'Comedy', 'Supernatural'],
    countries: ['JP', 'US', 'BR', 'MX', 'IN'],
    provider: 'Netflix',
    popularity: 10,
    rank: 10,
    updatedAt: '2d ago',
    isPinned: false,
    isFeatured: false,
    isHighlighted: false,
    analytics: {
      totalViews: 0,
      uniqueViewers: 0,
      avgWatchTime: 0,
      completionRate: 0,
      favoriteRate: 0,
      shareRate: 0,
      reviewCount: 0,
      averageRating: 0,
      peakConcurrent: 0,
    },
    episodesList: [],
  },
]

export const MOCK_SEASONAL_CHARTS: SeasonalChart[] = [
  {
    id: 'chart-airing',
    title: 'Airing Distribution',
    type: 'donut',
    data: [
      { label: 'Currently Airing', value: 42, color: '#22c55e' },
      { label: 'Upcoming', value: 28, color: '#3b82f6' },
      { label: 'Completed', value: 25, color: '#6b7280' },
      { label: 'Hiatus', value: 5, color: '#f59e0b' },
    ],
  },
  {
    id: 'chart-genres',
    title: 'Top Genres',
    type: 'bar',
    data: [
      { label: 'Action', value: 45 },
      { label: 'Fantasy', value: 28 },
      { label: 'Drama', value: 22 },
      { label: 'Comedy', value: 18 },
      { label: 'Supernatural', value: 15 },
      { label: 'Sci-Fi', value: 12 },
      { label: 'Romance', value: 8 },
    ],
  },
  {
    id: 'chart-seasons',
    title: 'Content by Season',
    type: 'bar',
    data: [
      { label: 'Winter', value: 48 },
      { label: 'Spring', value: 52 },
      { label: 'Summer', value: 35 },
      { label: 'Fall', value: 41 },
    ],
  },
]

export const MOCK_SEASONAL_SETTINGS: SeasonalSettings = {
  autoUpdateFrequency: 'Every 6 hours',
  highlightThreshold: 8.5,
  maxFeatured: 5,
  showScore: true,
  showMembers: true,
  defaultSort: 'score',
}

export function getSeasonalStats(items: SeasonalAnime[]): SeasonalStats {
  const totalAnime = items.length
  const currentlyAiring = items.filter(
    (i) => i.airingStatus === 'currently_airing',
  ).length
  const upcoming = items.filter((i) => i.airingStatus === 'upcoming').length
  const completed = items.filter((i) => i.airingStatus === 'completed').length
  const scored = items.filter((i) => i.score > 0)
  const avgScore =
    scored.length > 0
      ? scored.reduce((sum, i) => sum + i.score, 0) / scored.length
      : 0
  const totalMembers = items.reduce((sum, i) => sum + i.members, 0)
  return {
    totalAnime,
    currentlyAiring,
    upcoming,
    completed,
    avgScore,
    totalMembers,
  }
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}
