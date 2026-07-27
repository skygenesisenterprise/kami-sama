import type { StatusTone } from '@/components/dash/status-badge'

export type RecommendationPool =
  | 'personalized'
  | 'popular'
  | 'similar'
  | 'editorial'
  | 'seasonal'
  | 'new-releases'

export type RecommendationType =
  | 'collaborative'
  | 'content-based'
  | 'hybrid'
  | 'trending'
  | 'manual'

export type RecommendationStatus =
  | 'active'
  | 'paused'
  | 'disabled'
  | 'testing'

export interface RecommendationItem {
  id: string
  title: string
  slug: string
  poster: string
  pool: RecommendationPool
  type: RecommendationType
  status: RecommendationStatus
  ctr: number
  relevance: number
  impressions: number
  clicks: number
  conversions: number
  avgRating: number
  genres: string[]
  provider: string
  updatedAt: string
  isEnabled: boolean
  isPinned: boolean
  isExcluded: boolean
  abTest?: ABTest
  analytics: RecommendationAnalytics
  sources: RecommendationSource[]
}

export interface ABTest {
  id: string
  name: string
  variant: 'control' | 'variant-a' | 'variant-b'
  confidence: number
  startDate: string
}

export interface RecommendationAnalytics {
  totalImpressions: number
  totalClicks: number
  ctr: number
  avgRelevance: number
  conversionRate: number
  avgSessionDepth: number
  returnRate: number
  satisfactionScore: number
}

export interface RecommendationSource {
  name: string
  weight: number
  performance: number
}

export interface RecommendationStats {
  totalActive: number
  avgCTR: number
  avgRelevance: number
  usersServed: number
  abTestsRunning: number
}

export interface RecommendationPoolInfo {
  id: RecommendationPool
  label: string
  description: string
  count: number
  avgCTR: number
}

export const RECOMMENDATION_POOLS: RecommendationPool[] = [
  'personalized',
  'popular',
  'similar',
  'editorial',
  'seasonal',
  'new-releases',
]

export const RECOMMENDATION_POOL_LABEL: Record<RecommendationPool, string> = {
  personalized: 'Personalized',
  popular: 'Popular',
  similar: 'Similar',
  editorial: 'Editorial',
  seasonal: 'Seasonal',
  'new-releases': 'New Releases',
}

export const RECOMMENDATION_TYPES: RecommendationType[] = [
  'collaborative',
  'content-based',
  'hybrid',
  'trending',
  'manual',
]

export const RECOMMENDATION_TYPE_LABEL: Record<RecommendationType, string> = {
  collaborative: 'Collaborative',
  'content-based': 'Content-Based',
  hybrid: 'Hybrid',
  trending: 'Trending',
  manual: 'Manual',
}

export const RECOMMENDATION_STATUSES: RecommendationStatus[] = [
  'active',
  'paused',
  'disabled',
  'testing',
]

export const RECOMMENDATION_STATUS_LABEL: Record<RecommendationStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  disabled: 'Disabled',
  testing: 'Testing',
}

export const RECOMMENDATION_STATUS_TONE: Record<RecommendationStatus, StatusTone> = {
  active: 'success',
  paused: 'warning',
  disabled: 'neutral',
  testing: 'info',
}

export const MOCK_POOL_INFO: RecommendationPoolInfo[] = [
  {
    id: 'personalized',
    label: 'Personalized',
    description: 'AI-powered recommendations based on user behavior',
    count: 245,
    avgCTR: 12.4,
  },
  {
    id: 'popular',
    label: 'Popular',
    description: 'Trending and most-watched content',
    count: 180,
    avgCTR: 8.7,
  },
  {
    id: 'similar',
    label: 'Similar',
    description: 'Content similar to what the user is viewing',
    count: 320,
    avgCTR: 15.2,
  },
  {
    id: 'editorial',
    label: 'Editorial',
    description: 'Curated picks by the editorial team',
    count: 45,
    avgCTR: 6.3,
  },
  {
    id: 'seasonal',
    label: 'Seasonal',
    description: 'Seasonal and event-based recommendations',
    count: 60,
    avgCTR: 9.1,
  },
  {
    id: 'new-releases',
    label: 'New Releases',
    description: 'Recently added content',
    count: 95,
    avgCTR: 11.8,
  },
]

export const MOCK_RECOMMENDATIONS: RecommendationItem[] = [
  {
    id: 'rec-001',
    title: 'Solo Leveling Season 2',
    slug: 'solo-leveling-season-2',
    poster: '/posters/solo-leveling-s2.jpg',
    pool: 'personalized',
    type: 'hybrid',
    status: 'active',
    ctr: 18.4,
    relevance: 94,
    impressions: 45231,
    clicks: 8322,
    conversions: 2156,
    avgRating: 4.8,
    genres: ['Action', 'Fantasy'],
    provider: 'Crunchyroll',
    updatedAt: '2m ago',
    isEnabled: true,
    isPinned: false,
    isExcluded: false,
    abTest: {
      id: 'ab-001',
      name: 'Hybrid vs Content-Based',
      variant: 'variant-a',
      confidence: 87,
      startDate: '2026-07-15',
    },
    analytics: {
      totalImpressions: 45231,
      totalClicks: 8322,
      ctr: 18.4,
      avgRelevance: 94,
      conversionRate: 25.9,
      avgSessionDepth: 3.2,
      returnRate: 78.4,
      satisfactionScore: 4.6,
    },
    sources: [
      { name: 'User History', weight: 35, performance: 92 },
      { name: 'Similar Users', weight: 25, performance: 88 },
      { name: 'Content Similarity', weight: 20, performance: 85 },
      { name: 'Trending Signal', weight: 15, performance: 78 },
      { name: 'Editorial Boost', weight: 5, performance: 70 },
    ],
  },
  {
    id: 'rec-002',
    title: 'Frieren: Beyond Journey\'s End',
    slug: 'frieren',
    poster: '/posters/frieren.jpg',
    pool: 'similar',
    type: 'content-based',
    status: 'active',
    ctr: 22.1,
    relevance: 91,
    impressions: 38456,
    clicks: 8498,
    conversions: 1876,
    avgRating: 4.9,
    genres: ['Adventure', 'Drama', 'Fantasy'],
    provider: 'Crunchyroll',
    updatedAt: '5m ago',
    isEnabled: true,
    isPinned: true,
    isExcluded: false,
    analytics: {
      totalImpressions: 38456,
      totalClicks: 8498,
      ctr: 22.1,
      avgRelevance: 91,
      conversionRate: 22.1,
      avgSessionDepth: 2.8,
      returnRate: 82.1,
      satisfactionScore: 4.8,
    },
    sources: [
      { name: 'Genre Match', weight: 40, performance: 95 },
      { name: 'Tag Similarity', weight: 30, performance: 89 },
      { name: 'User Rating Pattern', weight: 20, performance: 82 },
      { name: 'Watch History', weight: 10, performance: 76 },
    ],
  },
  {
    id: 'rec-003',
    title: 'Jujutsu Kaisen: Hidden Inventory',
    slug: 'jjk-hidden-inventory',
    poster: '/posters/jjk-hidden-inventory.jpg',
    pool: 'popular',
    type: 'trending',
    status: 'active',
    ctr: 15.7,
    relevance: 88,
    impressions: 52341,
    clicks: 8218,
    conversions: 2543,
    avgRating: 4.7,
    genres: ['Action', 'Supernatural'],
    provider: 'Crunchyroll',
    updatedAt: '8m ago',
    isEnabled: true,
    isPinned: false,
    isExcluded: false,
    abTest: {
      id: 'ab-002',
      name: 'Trending Placement',
      variant: 'control',
      confidence: 62,
      startDate: '2026-07-10',
    },
    analytics: {
      totalImpressions: 52341,
      totalClicks: 8218,
      ctr: 15.7,
      avgRelevance: 88,
      conversionRate: 30.9,
      avgSessionDepth: 3.5,
      returnRate: 75.2,
      satisfactionScore: 4.5,
    },
    sources: [
      { name: 'View Count', weight: 45, performance: 91 },
      { name: 'Rating Average', weight: 25, performance: 87 },
      { name: 'Completion Rate', weight: 20, performance: 83 },
      { name: 'Social Buzz', weight: 10, performance: 72 },
    ],
  },
  {
    id: 'rec-004',
    title: 'Dandadan',
    slug: 'dandadan',
    poster: '/posters/dandadan.jpg',
    pool: 'new-releases',
    type: 'content-based',
    status: 'active',
    ctr: 19.8,
    relevance: 85,
    impressions: 28765,
    clicks: 5695,
    conversions: 1234,
    avgRating: 4.6,
    genres: ['Action', 'Comedy', 'Supernatural'],
    provider: 'Netflix',
    updatedAt: '12m ago',
    isEnabled: true,
    isPinned: false,
    isExcluded: false,
    analytics: {
      totalImpressions: 28765,
      totalClicks: 5695,
      ctr: 19.8,
      avgRelevance: 85,
      conversionRate: 21.7,
      avgSessionDepth: 2.5,
      returnRate: 68.9,
      satisfactionScore: 4.4,
    },
    sources: [
      { name: 'Release Recency', weight: 35, performance: 88 },
      { name: 'Genre Match', weight: 30, performance: 84 },
      { name: 'Platform Trend', weight: 20, performance: 79 },
      { name: 'User Interest', weight: 15, performance: 74 },
    ],
  },
  {
    id: 'rec-005',
    title: 'Vinland Saga Season 3',
    slug: 'vinland-saga-s3',
    poster: '/posters/vinland-saga-s3.jpg',
    pool: 'editorial',
    type: 'manual',
    status: 'active',
    ctr: 11.3,
    relevance: 89,
    impressions: 18234,
    clicks: 2060,
    conversions: 876,
    avgRating: 4.8,
    genres: ['Action', 'Adventure', 'Drama'],
    provider: 'Netflix',
    updatedAt: '15m ago',
    isEnabled: true,
    isPinned: true,
    isExcluded: false,
    analytics: {
      totalImpressions: 18234,
      totalClicks: 2060,
      ctr: 11.3,
      avgRelevance: 89,
      conversionRate: 42.5,
      avgSessionDepth: 3.8,
      returnRate: 85.3,
      satisfactionScore: 4.7,
    },
    sources: [
      { name: 'Editorial Pick', weight: 50, performance: 90 },
      { name: 'Critical Acclaim', weight: 30, performance: 86 },
      { name: 'Award Nominations', weight: 20, performance: 81 },
    ],
  },
  {
    id: 'rec-006',
    title: 'Chainsaw Man Part 2',
    slug: 'chainsaw-man-p2',
    poster: '/posters/chainsaw-man-p2.jpg',
    pool: 'personalized',
    type: 'collaborative',
    status: 'testing',
    ctr: 16.9,
    relevance: 87,
    impressions: 34567,
    clicks: 5842,
    conversions: 1543,
    avgRating: 4.6,
    genres: ['Action', 'Horror', 'Supernatural'],
    provider: 'Crunchyroll',
    updatedAt: '18m ago',
    isEnabled: true,
    isPinned: false,
    isExcluded: false,
    abTest: {
      id: 'ab-003',
      name: 'Collaborative vs Hybrid',
      variant: 'variant-b',
      confidence: 73,
      startDate: '2026-07-18',
    },
    analytics: {
      totalImpressions: 34567,
      totalClicks: 5842,
      ctr: 16.9,
      avgRelevance: 87,
      conversionRate: 26.4,
      avgSessionDepth: 3.0,
      returnRate: 71.8,
      satisfactionScore: 4.5,
    },
    sources: [
      { name: 'User Similarity', weight: 40, performance: 86 },
      { name: 'Watch Pattern', weight: 30, performance: 82 },
      { name: 'Rating Correlation', weight: 20, performance: 78 },
      { name: 'Genre Overlap', weight: 10, performance: 74 },
    ],
  },
  {
    id: 'rec-007',
    title: 'Spy x Family Code: White',
    slug: 'spy-family-code-white',
    poster: '/posters/spy-family-code-white.jpg',
    pool: 'seasonal',
    type: 'hybrid',
    status: 'active',
    ctr: 13.2,
    relevance: 82,
    impressions: 22345,
    clicks: 2949,
    conversions: 1123,
    avgRating: 4.7,
    genres: ['Action', 'Comedy', 'Slice of Life'],
    provider: 'Crunchyroll',
    updatedAt: '22m ago',
    isEnabled: true,
    isPinned: false,
    isExcluded: false,
    analytics: {
      totalImpressions: 22345,
      totalClicks: 2949,
      ctr: 13.2,
      avgRelevance: 82,
      conversionRate: 38.1,
      avgSessionDepth: 2.6,
      returnRate: 79.4,
      satisfactionScore: 4.6,
    },
    sources: [
      { name: 'Seasonal Relevance', weight: 35, performance: 84 },
      { name: 'Family Appeal', weight: 25, performance: 80 },
      { name: 'Rewatch Signal', weight: 25, performance: 77 },
      { name: 'Market Trend', weight: 15, performance: 72 },
    ],
  },
  {
    id: 'rec-008',
    title: 'One Piece',
    slug: 'one-piece',
    poster: '/posters/one-piece.jpg',
    pool: 'popular',
    type: 'trending',
    status: 'paused',
    ctr: 8.4,
    relevance: 75,
    impressions: 67890,
    clicks: 5703,
    conversions: 2345,
    avgRating: 4.8,
    genres: ['Action', 'Adventure', 'Comedy'],
    provider: 'Crunchyroll',
    updatedAt: '25m ago',
    isEnabled: false,
    isPinned: false,
    isExcluded: false,
    analytics: {
      totalImpressions: 67890,
      totalClicks: 5703,
      ctr: 8.4,
      avgRelevance: 75,
      conversionRate: 41.1,
      avgSessionDepth: 4.2,
      returnRate: 88.7,
      satisfactionScore: 4.7,
    },
    sources: [
      { name: 'View Count', weight: 50, performance: 82 },
      { name: 'Legacy Factor', weight: 30, performance: 78 },
      { name: 'New Arc Hype', weight: 20, performance: 71 },
    ],
  },
  {
    id: 'rec-009',
    title: 'Oshi no Ko Season 2',
    slug: 'oshi-no-ko-s2',
    poster: '/posters/oshi-no-ko-s2.jpg',
    pool: 'similar',
    type: 'content-based',
    status: 'active',
    ctr: 17.6,
    relevance: 90,
    impressions: 31234,
    clicks: 5497,
    conversions: 1678,
    avgRating: 4.7,
    genres: ['Drama', 'Supernatural', 'Mystery'],
    provider: 'HIDIVE',
    updatedAt: '28m ago',
    isEnabled: true,
    isPinned: false,
    isExcluded: false,
    analytics: {
      totalImpressions: 31234,
      totalClicks: 5497,
      ctr: 17.6,
      avgRelevance: 90,
      conversionRate: 30.5,
      avgSessionDepth: 3.1,
      returnRate: 76.2,
      satisfactionScore: 4.6,
    },
    sources: [
      { name: 'Genre Similarity', weight: 35, performance: 91 },
      { name: 'Theme Match', weight: 30, performance: 87 },
      { name: 'Studio Affinity', weight: 20, performance: 82 },
      { name: 'User Overlap', weight: 15, performance: 78 },
    ],
  },
  {
    id: 'rec-010',
    title: 'Demon Slayer: Infinity Castle',
    slug: 'demon-slayer-ic',
    poster: '/posters/demon-slayer-ic.jpg',
    pool: 'popular',
    type: 'trending',
    status: 'disabled',
    ctr: 6.2,
    relevance: 68,
    impressions: 45678,
    clicks: 2832,
    conversions: 987,
    avgRating: 4.5,
    genres: ['Action', 'Supernatural', 'Drama'],
    provider: 'Funimation',
    updatedAt: '30m ago',
    isEnabled: false,
    isPinned: false,
    isExcluded: true,
    analytics: {
      totalImpressions: 45678,
      totalClicks: 2832,
      ctr: 6.2,
      avgRelevance: 68,
      conversionRate: 34.9,
      avgSessionDepth: 2.4,
      returnRate: 62.1,
      satisfactionScore: 4.3,
    },
    sources: [
      { name: 'View Count', weight: 45, performance: 72 },
      { name: 'Rating', weight: 30, performance: 68 },
      { name: 'Recency Decay', weight: 25, performance: 58 },
    ],
  },
]

export function getRecommendationStats(
  items: RecommendationItem[],
): RecommendationStats {
  const active = items.filter((i) => i.status === 'active' || i.status === 'testing')
  const totalActive = active.length
  const avgCTR =
    active.reduce((sum, i) => sum + i.ctr, 0) / (active.length || 1)
  const avgRelevance =
    active.reduce((sum, i) => sum + i.relevance, 0) / (active.length || 1)
  const usersServed = 124567
  const abTestsRunning = items.filter((i) => i.abTest).length
  return { totalActive, avgCTR, avgRelevance, usersServed, abTestsRunning }
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}
