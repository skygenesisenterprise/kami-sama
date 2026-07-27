import type { StatusTone } from '@/components/dash/status-badge'

export type TrendingPeriod = '24h' | '7d' | '30d' | '90d'

export type TrendingContentType =
  | 'series'
  | 'movie'
  | 'ova'
  | 'ona'
  | 'special'

export type TrendingStatus = 'rising' | 'stable' | 'falling' | 'new' | 'removed'

export type TrendingSource =
  | 'views'
  | 'watchlist'
  | 'completions'
  | 'search'
  | 'social'
  | 'reviews'

export type TrendingCountry = string

export interface TrendingContent {
  id: string
  title: string
  slug: string
  poster: string
  type: TrendingContentType
  trendScore: number
  rank: number
  views: number
  viewsChange: number
  growth: number
  watchTime: number
  countries: TrendingCountry[]
  genres: string[]
  provider: string
  status: TrendingStatus
  updatedAt: string
  publishDate?: string
  isPinned: boolean
  isBoosted: boolean
  isHidden: boolean
  isExcluded: boolean
  discoveryScore: number
  trendReasons: string[]
  rankingHistory: RankingEntry[]
  sources: SourceBreakdown[]
  analytics: ContentAnalytics
}

export interface RankingEntry {
  date: string
  rank: number
  score: number
}

export interface SourceBreakdown {
  source: TrendingSource
  value: number
  percentage: number
}

export interface ContentAnalytics {
  totalViews: number
  uniqueViewers: number
  avgWatchTime: number
  completionRate: number
  favoriteRate: number
  shareRate: number
  reviewCount: number
  averageRating: number
}

export interface TrendingStats {
  totalTrending: number
  totalViews: number
  avgGrowth: number
  avgWatchTime: number
  countriesActive: number
}

export interface TrendingChart {
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

export interface TrendingSettings {
  weights: {
    views: number
    watchTime: number
    favorites: number
    searches: number
    reviews: number
    social: number
  }
  recalculationFrequency: string
  decayFactor: number
  minimumThreshold: number
  maxTrendingItems: number
  boostMultiplier: number
  pinPriority: boolean
}

export const TRENDING_PERIODS: TrendingPeriod[] = ['24h', '7d', '30d', '90d']

export const TRENDING_CONTENT_TYPES: TrendingContentType[] = [
  'series',
  'movie',
  'ova',
  'ona',
  'special',
]

export const TRENDING_STATUSES: TrendingStatus[] = [
  'rising',
  'stable',
  'falling',
  'new',
  'removed',
]

export const TRENDING_STATUS_LABEL: Record<TrendingStatus, string> = {
  rising: 'Rising',
  stable: 'Stable',
  falling: 'Falling',
  new: 'New',
  removed: 'Removed',
}

export const TRENDING_STATUS_TONE: Record<TrendingStatus, StatusTone> = {
  rising: 'success',
  stable: 'info',
  falling: 'warning',
  new: 'success',
  removed: 'destructive',
}

export const CONTENT_TYPE_LABEL: Record<TrendingContentType, string> = {
  series: 'Series',
  movie: 'Movie',
  ova: 'OVA',
  ona: 'ONA',
  special: 'Special',
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
  'CA',
  'ES',
  'IT',
  'MX',
  'RU',
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
  CA: 'Canada',
  ES: 'Spain',
  IT: 'Italy',
  MX: 'Mexico',
  RU: 'Russia',
}

export const MOCK_TRENDING: TrendingContent[] = [
  {
    id: 'tr-001',
    title: 'Solo Leveling Season 2',
    slug: 'solo-leveling-season-2',
    poster: '/posters/solo-leveling-s2.jpg',
    type: 'series',
    trendScore: 9842,
    rank: 1,
    views: 2847593,
    viewsChange: 12.4,
    growth: 34.2,
    watchTime: 48.7,
    countries: ['JP', 'US', 'KR', 'BR', 'IN'],
    genres: ['Action', 'Fantasy', 'Adventure'],
    provider: 'Crunchyroll',
    status: 'rising',
    updatedAt: '2m ago',
    publishDate: '2026-01-01',
    isPinned: false,
    isBoosted: true,
    isHidden: false,
    isExcluded: false,
    discoveryScore: 96,
    trendReasons: [
      'Massive surge in episode completions',
      'High social media engagement',
      'Strong search volume growth',
    ],
    rankingHistory: [
      { date: '2026-07-20', rank: 3, score: 8200 },
      { date: '2026-07-21', rank: 2, score: 8900 },
      { date: '2026-07-22', rank: 2, score: 9100 },
      { date: '2026-07-23', rank: 1, score: 9842 },
    ],
    sources: [
      { source: 'views', value: 45, percentage: 45 },
      { source: 'watchlist', value: 20, percentage: 20 },
      { source: 'completions', value: 15, percentage: 15 },
      { source: 'search', value: 12, percentage: 12 },
      { source: 'social', value: 5, percentage: 5 },
      { source: 'reviews', value: 3, percentage: 3 },
    ],
    analytics: {
      totalViews: 2847593,
      uniqueViewers: 1892456,
      avgWatchTime: 48.7,
      completionRate: 87.3,
      favoriteRate: 23.4,
      shareRate: 8.9,
      reviewCount: 4521,
      averageRating: 4.8,
    },
  },
  {
    id: 'tr-002',
    title: 'Jujutsu Kaisen: Hidden Inventory',
    slug: 'jujutsu-kaisen-hidden-inventory',
    poster: '/posters/jjk-hidden-inventory.jpg',
    type: 'movie',
    trendScore: 9234,
    rank: 2,
    views: 1923847,
    viewsChange: 8.7,
    growth: 21.5,
    watchTime: 52.1,
    countries: ['JP', 'US', 'FR', 'GB', 'AU'],
    genres: ['Action', 'Supernatural', 'Drama'],
    provider: 'Crunchyroll',
    status: 'rising',
    updatedAt: '5m ago',
    publishDate: '2026-03-15',
    isPinned: true,
    isBoosted: false,
    isHidden: false,
    isExcluded: false,
    discoveryScore: 94,
    trendReasons: [
      'Recent movie premiere driving traffic',
      'High completion rate',
      'Strong critical reception',
    ],
    rankingHistory: [
      { date: '2026-07-20', rank: 5, score: 7800 },
      { date: '2026-07-21', rank: 4, score: 8100 },
      { date: '2026-07-22', rank: 3, score: 8700 },
      { date: '2026-07-23', rank: 2, score: 9234 },
    ],
    sources: [
      { source: 'views', value: 40, percentage: 40 },
      { source: 'completions', value: 25, percentage: 25 },
      { source: 'watchlist', value: 18, percentage: 18 },
      { source: 'search', value: 10, percentage: 10 },
      { source: 'reviews', value: 5, percentage: 5 },
      { source: 'social', value: 2, percentage: 2 },
    ],
    analytics: {
      totalViews: 1923847,
      uniqueViewers: 1456789,
      avgWatchTime: 52.1,
      completionRate: 91.2,
      favoriteRate: 28.7,
      shareRate: 11.2,
      reviewCount: 3892,
      averageRating: 4.7,
    },
  },
  {
    id: 'tr-003',
    title: 'Frieren: Beyond Journey\'s End',
    slug: 'frieren-beyond-journeys-end',
    poster: '/posters/frieren.jpg',
    type: 'series',
    trendScore: 8912,
    rank: 3,
    views: 1654321,
    viewsChange: 5.3,
    growth: 18.7,
    watchTime: 44.2,
    countries: ['JP', 'US', 'DE', 'FR', 'CA'],
    genres: ['Adventure', 'Drama', 'Fantasy'],
    provider: 'Crunchyroll',
    status: 'stable',
    updatedAt: '8m ago',
    publishDate: '2025-09-01',
    isPinned: false,
    isBoosted: false,
    isHidden: false,
    isExcluded: false,
    discoveryScore: 91,
    trendReasons: [
      'Consistent viewership over time',
      'Strong word-of-mouth recommendations',
      'Award nominations driving interest',
    ],
    rankingHistory: [
      { date: '2026-07-20', rank: 3, score: 8800 },
      { date: '2026-07-21', rank: 3, score: 8850 },
      { date: '2026-07-22', rank: 3, score: 8900 },
      { date: '2026-07-23', rank: 3, score: 8912 },
    ],
    sources: [
      { source: 'views', value: 35, percentage: 35 },
      { source: 'watchlist', value: 25, percentage: 25 },
      { source: 'completions', value: 20, percentage: 20 },
      { source: 'reviews', value: 10, percentage: 10 },
      { source: 'search', value: 7, percentage: 7 },
      { source: 'social', value: 3, percentage: 3 },
    ],
    analytics: {
      totalViews: 1654321,
      uniqueViewers: 1234567,
      avgWatchTime: 44.2,
      completionRate: 89.1,
      favoriteRate: 31.2,
      shareRate: 7.8,
      reviewCount: 5678,
      averageRating: 4.9,
    },
  },
  {
    id: 'tr-004',
    title: 'Dandadan',
    slug: 'dandadan',
    poster: '/posters/dandadan.jpg',
    type: 'series',
    trendScore: 8456,
    rank: 4,
    views: 1432198,
    viewsChange: 15.8,
    growth: 42.1,
    watchTime: 38.9,
    countries: ['JP', 'US', 'BR', 'MX', 'IN'],
    genres: ['Action', 'Comedy', 'Supernatural'],
    provider: 'Netflix',
    status: 'new',
    updatedAt: '12m ago',
    publishDate: '2026-04-01',
    isPinned: false,
    isBoosted: false,
    isHidden: false,
    isExcluded: false,
    discoveryScore: 88,
    trendReasons: [
      'Newly released series gaining momentum',
      'Viral social media clips',
      'Strong debut week performance',
    ],
    rankingHistory: [
      { date: '2026-07-20', rank: 12, score: 5200 },
      { date: '2026-07-21', rank: 8, score: 6800 },
      { date: '2026-07-22', rank: 5, score: 7900 },
      { date: '2026-07-23', rank: 4, score: 8456 },
    ],
    sources: [
      { source: 'views', value: 38, percentage: 38 },
      { source: 'social', value: 22, percentage: 22 },
      { source: 'search', value: 18, percentage: 18 },
      { source: 'watchlist', value: 12, percentage: 12 },
      { source: 'completions', value: 7, percentage: 7 },
      { source: 'reviews', value: 3, percentage: 3 },
    ],
    analytics: {
      totalViews: 1432198,
      uniqueViewers: 1123456,
      avgWatchTime: 38.9,
      completionRate: 82.4,
      favoriteRate: 19.8,
      shareRate: 14.3,
      reviewCount: 2345,
      averageRating: 4.6,
    },
  },
  {
    id: 'tr-005',
    title: 'Demon Slayer: Infinity Castle',
    slug: 'demon-slayer-infinity-castle',
    poster: '/posters/demon-slayer-ic.jpg',
    type: 'movie',
    trendScore: 8123,
    rank: 5,
    views: 1298765,
    viewsChange: -2.1,
    growth: -5.3,
    watchTime: 55.4,
    countries: ['JP', 'US', 'KR', 'CN', 'AU'],
    genres: ['Action', 'Supernatural', 'Drama'],
    provider: 'Funimation',
    status: 'falling',
    updatedAt: '15m ago',
    publishDate: '2025-12-20',
    isPinned: false,
    isBoosted: false,
    isHidden: false,
    isExcluded: false,
    discoveryScore: 85,
    trendReasons: [
      'Post-release viewership declining',
      'Still strong in Asian markets',
      'High completion rate among watchers',
    ],
    rankingHistory: [
      { date: '2026-07-20', rank: 2, score: 9100 },
      { date: '2026-07-21', rank: 3, score: 8700 },
      { date: '2026-07-22', rank: 4, score: 8300 },
      { date: '2026-07-23', rank: 5, score: 8123 },
    ],
    sources: [
      { source: 'views', value: 50, percentage: 50 },
      { source: 'completions', value: 20, percentage: 20 },
      { source: 'watchlist', value: 15, percentage: 15 },
      { source: 'search', value: 8, percentage: 8 },
      { source: 'reviews', value: 5, percentage: 5 },
      { source: 'social', value: 2, percentage: 2 },
    ],
    analytics: {
      totalViews: 1298765,
      uniqueViewers: 987654,
      avgWatchTime: 55.4,
      completionRate: 94.2,
      favoriteRate: 35.1,
      shareRate: 6.7,
      reviewCount: 6789,
      averageRating: 4.5,
    },
  },
  {
    id: 'tr-006',
    title: 'Oshi no Ko Season 2',
    slug: 'oshi-no-ko-season-2',
    poster: '/posters/oshi-no-ko-s2.jpg',
    type: 'series',
    trendScore: 7891,
    rank: 6,
    views: 1187654,
    viewsChange: 6.2,
    growth: 12.8,
    watchTime: 41.3,
    countries: ['JP', 'US', 'KR', 'DE', 'FR'],
    genres: ['Drama', 'Supernatural', 'Mystery'],
    provider: 'HIDIVE',
    status: 'stable',
    updatedAt: '18m ago',
    publishDate: '2026-02-15',
    isPinned: false,
    isBoosted: true,
    isHidden: false,
    isExcluded: false,
    discoveryScore: 87,
    trendReasons: [
      'Steady viewership growth',
      'Strong international appeal',
      'Critical acclaim driving discovery',
    ],
    rankingHistory: [
      { date: '2026-07-20', rank: 6, score: 7700 },
      { date: '2026-07-21', rank: 6, score: 7750 },
      { date: '2026-07-22', rank: 6, score: 7800 },
      { date: '2026-07-23', rank: 6, score: 7891 },
    ],
    sources: [
      { source: 'views', value: 42, percentage: 42 },
      { source: 'watchlist', value: 22, percentage: 22 },
      { source: 'completions', value: 18, percentage: 18 },
      { source: 'search', value: 10, percentage: 10 },
      { source: 'reviews', value: 5, percentage: 5 },
      { source: 'social', value: 3, percentage: 3 },
    ],
    analytics: {
      totalViews: 1187654,
      uniqueViewers: 876543,
      avgWatchTime: 41.3,
      completionRate: 85.6,
      favoriteRate: 26.3,
      shareRate: 9.1,
      reviewCount: 3210,
      averageRating: 4.7,
    },
  },
  {
    id: 'tr-007',
    title: 'One Piece',
    slug: 'one-piece',
    poster: '/posters/one-piece.jpg',
    type: 'series',
    trendScore: 7654,
    rank: 7,
    views: 1098765,
    viewsChange: 1.2,
    growth: 3.4,
    watchTime: 24.5,
    countries: ['JP', 'US', 'BR', 'IN', 'FR'],
    genres: ['Action', 'Adventure', 'Comedy'],
    provider: 'Crunchyroll',
    status: 'stable',
    updatedAt: '20m ago',
    publishDate: '1999-10-20',
    isPinned: false,
    isBoosted: false,
    isHidden: false,
    isExcluded: false,
    discoveryScore: 82,
    trendReasons: [
      'Long-running series with consistent audience',
      'New arc driving renewed interest',
      'Strong global brand recognition',
    ],
    rankingHistory: [
      { date: '2026-07-20', rank: 7, score: 7500 },
      { date: '2026-07-21', rank: 7, score: 7550 },
      { date: '2026-07-22', rank: 7, score: 7600 },
      { date: '2026-07-23', rank: 7, score: 7654 },
    ],
    sources: [
      { source: 'views', value: 55, percentage: 55 },
      { source: 'watchlist', value: 15, percentage: 15 },
      { source: 'search', value: 12, percentage: 12 },
      { source: 'completions', value: 10, percentage: 10 },
      { source: 'reviews', value: 5, percentage: 5 },
      { source: 'social', value: 3, percentage: 3 },
    ],
    analytics: {
      totalViews: 1098765,
      uniqueViewers: 876543,
      avgWatchTime: 24.5,
      completionRate: 78.9,
      favoriteRate: 42.1,
      shareRate: 5.4,
      reviewCount: 12345,
      averageRating: 4.8,
    },
  },
  {
    id: 'tr-008',
    title: 'Chainsaw Man Part 2',
    slug: 'chainsaw-man-part-2',
    poster: '/posters/chainsaw-man-p2.jpg',
    type: 'series',
    trendScore: 7432,
    rank: 8,
    views: 987654,
    viewsChange: 9.8,
    growth: 28.4,
    watchTime: 35.7,
    countries: ['JP', 'US', 'KR', 'GB', 'CA'],
    genres: ['Action', 'Horror', 'Supernatural'],
    provider: 'Crunchyroll',
    status: 'rising',
    updatedAt: '22m ago',
    publishDate: '2026-05-01',
    isPinned: false,
    isBoosted: false,
    isHidden: false,
    isExcluded: false,
    discoveryScore: 89,
    trendReasons: [
      'New season premiere boosting views',
      'Strong social media presence',
      'High completion rate for new episodes',
    ],
    rankingHistory: [
      { date: '2026-07-20', rank: 15, score: 4800 },
      { date: '2026-07-21', rank: 11, score: 5900 },
      { date: '2026-07-22', rank: 9, score: 6800 },
      { date: '2026-07-23', rank: 8, score: 7432 },
    ],
    sources: [
      { source: 'views', value: 40, percentage: 40 },
      { source: 'social', value: 20, percentage: 20 },
      { source: 'search', value: 15, percentage: 15 },
      { source: 'watchlist', value: 12, percentage: 12 },
      { source: 'completions', value: 8, percentage: 8 },
      { source: 'reviews', value: 5, percentage: 5 },
    ],
    analytics: {
      totalViews: 987654,
      uniqueViewers: 765432,
      avgWatchTime: 35.7,
      completionRate: 83.2,
      favoriteRate: 21.5,
      shareRate: 12.8,
      reviewCount: 2890,
      averageRating: 4.6,
    },
  },
  {
    id: 'tr-009',
    title: 'Spy x Family Code: White',
    slug: 'spy-x-family-code-white',
    poster: '/posters/spy-family-code-white.jpg',
    type: 'movie',
    trendScore: 7210,
    rank: 9,
    views: 876543,
    viewsChange: 3.4,
    growth: 8.9,
    watchTime: 46.8,
    countries: ['JP', 'US', 'FR', 'DE', 'GB'],
    genres: ['Action', 'Comedy', 'Slice of Life'],
    provider: 'Crunchyroll',
    status: 'stable',
    updatedAt: '25m ago',
    publishDate: '2025-12-22',
    isPinned: false,
    isBoosted: false,
    isHidden: false,
    isExcluded: false,
    discoveryScore: 84,
    trendReasons: [
      'Strong family-friendly appeal',
      'International distribution success',
      'High rewatch rate',
    ],
    rankingHistory: [
      { date: '2026-07-20', rank: 9, score: 7100 },
      { date: '2026-07-21', rank: 9, score: 7150 },
      { date: '2026-07-22', rank: 9, score: 7200 },
      { date: '2026-07-23', rank: 9, score: 7210 },
    ],
    sources: [
      { source: 'views', value: 45, percentage: 45 },
      { source: 'watchlist', value: 20, percentage: 20 },
      { source: 'completions', value: 18, percentage: 18 },
      { source: 'search', value: 8, percentage: 8 },
      { source: 'reviews', value: 5, percentage: 5 },
      { source: 'social', value: 4, percentage: 4 },
    ],
    analytics: {
      totalViews: 876543,
      uniqueViewers: 654321,
      avgWatchTime: 46.8,
      completionRate: 92.1,
      favoriteRate: 29.4,
      shareRate: 8.2,
      reviewCount: 4567,
      averageRating: 4.7,
    },
  },
  {
    id: 'tr-010',
    title: 'Vinland Saga Season 3',
    slug: 'vinland-saga-season-3',
    poster: '/posters/vinland-saga-s3.jpg',
    type: 'series',
    trendScore: 6987,
    rank: 10,
    views: 765432,
    viewsChange: 4.5,
    growth: 11.2,
    watchTime: 42.1,
    countries: ['JP', 'US', 'DE', 'GB', 'FR'],
    genres: ['Action', 'Adventure', 'Drama'],
    provider: 'Netflix',
    status: 'new',
    updatedAt: '28m ago',
    publishDate: '2026-06-01',
    isPinned: false,
    isBoosted: false,
    isHidden: false,
    isExcluded: false,
    discoveryScore: 86,
    trendReasons: [
      'New season gaining critical acclaim',
      'Strong European market performance',
      'Award buzz driving discovery',
    ],
    rankingHistory: [
      { date: '2026-07-20', rank: 18, score: 4200 },
      { date: '2026-07-21', rank: 14, score: 5400 },
      { date: '2026-07-22', rank: 11, score: 6300 },
      { date: '2026-07-23', rank: 10, score: 6987 },
    ],
    sources: [
      { source: 'views', value: 38, percentage: 38 },
      { source: 'reviews', value: 22, percentage: 22 },
      { source: 'watchlist', value: 18, percentage: 18 },
      { source: 'search', value: 12, percentage: 12 },
      { source: 'completions', value: 7, percentage: 7 },
      { source: 'social', value: 3, percentage: 3 },
    ],
    analytics: {
      totalViews: 765432,
      uniqueViewers: 543210,
      avgWatchTime: 42.1,
      completionRate: 88.7,
      favoriteRate: 27.6,
      shareRate: 6.9,
      reviewCount: 3456,
      averageRating: 4.8,
    },
  },
]

export const MOCK_TRENDING_CHARTS: TrendingChart[] = [
  {
    id: 'chart-views',
    title: 'Views Over Time',
    type: 'line',
    data: [
      { label: 'Jul 17', value: 8500000 },
      { label: 'Jul 18', value: 9200000 },
      { label: 'Jul 19', value: 8800000 },
      { label: 'Jul 20', value: 10100000 },
      { label: 'Jul 21', value: 11500000 },
      { label: 'Jul 22', value: 12800000 },
      { label: 'Jul 23', value: 14200000 },
    ],
  },
  {
    id: 'chart-categories',
    title: 'Content by Category',
    type: 'donut',
    data: [
      { label: 'Action', value: 45, color: '#ef4444' },
      { label: 'Fantasy', value: 25, color: '#8b5cf6' },
      { label: 'Drama', value: 15, color: '#3b82f6' },
      { label: 'Comedy', value: 10, color: '#22c55e' },
      { label: 'Other', value: 5, color: '#6b7280' },
    ],
  },
  {
    id: 'chart-countries',
    title: 'Top Countries',
    type: 'bar',
    data: [
      { label: 'Japan', value: 4200000 },
      { label: 'USA', value: 3800000 },
      { label: 'Brazil', value: 1500000 },
      { label: 'Korea', value: 1200000 },
      { label: 'France', value: 900000 },
      { label: 'Germany', value: 700000 },
      { label: 'India', value: 650000 },
      { label: 'UK', value: 550000 },
    ],
  },
]

export const MOCK_TRENDING_SETTINGS: TrendingSettings = {
  weights: {
    views: 35,
    watchTime: 25,
    favorites: 15,
    searches: 12,
    reviews: 8,
    social: 5,
  },
  recalculationFrequency: 'Every 15 minutes',
  decayFactor: 0.85,
  minimumThreshold: 1000,
  maxTrendingItems: 100,
  boostMultiplier: 1.5,
  pinPriority: true,
}

export function getTrendingStats(items: TrendingContent[]): TrendingStats {
  const totalTrending = items.length
  const totalViews = items.reduce((sum, i) => sum + i.views, 0)
  const avgGrowth =
    items.reduce((sum, i) => sum + i.growth, 0) / items.length
  const avgWatchTime =
    items.reduce((sum, i) => sum + i.watchTime, 0) / items.length
  const uniqueCountries = new Set(items.flatMap((i) => i.countries))
  return {
    totalTrending,
    totalViews,
    avgGrowth,
    avgWatchTime,
    countriesActive: uniqueCountries.size,
  }
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}
