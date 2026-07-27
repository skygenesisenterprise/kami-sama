import type { StatusTone } from '@/components/dash/status-badge'

export type CollectionType =
  | 'editorial'
  | 'auto_generated'
  | 'user_curated'
  | 'seasonal'
  | 'thematic'

export type CollectionStatus =
  | 'published'
  | 'draft'
  | 'archived'
  | 'scheduled'

export type SortOrder = 'manual' | 'score' | 'release_date' | 'popularity' | 'alphabetical'

export interface Collection {
  id: string
  title: string
  slug: string
  description: string
  coverImage: string
  type: CollectionType
  status: CollectionStatus
  itemCount: number
  totalViews: number
  totalFollowers: number
  avgScore: number
  curator: string
  tags: string[]
  genres: string[]
  sortOrder: SortOrder
  isFeatured: boolean
  isPinned: boolean
  isPublic: boolean
  createdAt: string
  updatedAt: string
  lastItemAdded: string
  items: CollectionItem[]
  analytics: CollectionAnalytics
}

export interface CollectionItem {
  id: string
  title: string
  slug: string
  score: number
  addedAt: string
  order: number
}

export interface CollectionAnalytics {
  totalViews: number
  uniqueViewers: number
  avgTimeSpent: number
  conversionRate: number
  followerGrowth: number
  shareRate: number
  completionRate: number
  topReferrer: string
}

export interface CollectionStats {
  totalCollections: number
  publishedCollections: number
  totalViews: number
  totalFollowers: number
  avgItemsPerCollection: number
}

export interface CollectionChart {
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

export interface CollectionSettings {
  maxItemsPerCollection: number
  autoRefreshEnabled: boolean
  autoRefreshFrequency: string
  defaultSortOrder: SortOrder
  allowDuplicates: boolean
  requireApproval: boolean
  featuredThreshold: number
}

export const COLLECTION_TYPES: CollectionType[] = [
  'editorial',
  'auto_generated',
  'user_curated',
  'seasonal',
  'thematic',
]

export const COLLECTION_TYPE_LABEL: Record<CollectionType, string> = {
  editorial: 'Editorial',
  auto_generated: 'Auto Generated',
  user_curated: 'User Curated',
  seasonal: 'Seasonal',
  thematic: 'Thematic',
}

export const COLLECTION_STATUSES: CollectionStatus[] = [
  'published',
  'draft',
  'archived',
  'scheduled',
]

export const COLLECTION_STATUS_LABEL: Record<CollectionStatus, string> = {
  published: 'Published',
  draft: 'Draft',
  archived: 'Archived',
  scheduled: 'Scheduled',
}

export const COLLECTION_STATUS_TONE: Record<CollectionStatus, StatusTone> = {
  published: 'success',
  draft: 'info',
  archived: 'neutral',
  scheduled: 'warning',
}

export const SORT_ORDERS: SortOrder[] = [
  'manual',
  'score',
  'release_date',
  'popularity',
  'alphabetical',
]

export const SORT_ORDER_LABEL: Record<SortOrder, string> = {
  manual: 'Manual',
  score: 'Score',
  release_date: 'Release Date',
  popularity: 'Popularity',
  alphabetical: 'Alphabetical',
}

export const MOCK_TAGS = [
  'Must Watch',
  'Hidden Gems',
  'Beginner Friendly',
  'Advanced',
  'Classic',
  'New Release',
  'Award Winner',
  'Cult Classic',
  'Binge Worthy',
  'Short Series',
  'Long Running',
  'Movie Night',
]

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

export const MOCK_CURATORS = [
  'Editorial Team',
  'AI Curator',
  'Community Vote',
  'Staff Picks',
  'Auto-Generated',
]

export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: 'col-001',
    title: 'Top 10 Anime of 2025',
    slug: 'top-10-anime-2025',
    description: 'The best anime series from 2025, handpicked by our editorial team.',
    coverImage: '/collections/top-10-2025.jpg',
    type: 'editorial',
    status: 'published',
    itemCount: 10,
    totalViews: 2876543,
    totalFollowers: 45678,
    avgScore: 8.72,
    curator: 'Editorial Team',
    tags: ['Must Watch', 'Award Winner', 'New Release'],
    genres: ['Action', 'Drama', 'Fantasy'],
    sortOrder: 'score',
    isFeatured: true,
    isPinned: true,
    isPublic: true,
    createdAt: '2025-12-15',
    updatedAt: '2025-12-20',
    lastItemAdded: '2025-12-20',
    items: [
      { id: 'item-001', title: 'Solo Leveling Season 2', slug: 'solo-leveling-s2', score: 9.12, addedAt: '2025-12-20', order: 1 },
      { id: 'item-002', title: 'Jujutsu Kaisen: Hidden Inventory', slug: 'jjk-hidden-inventory', score: 8.95, addedAt: '2025-12-19', order: 2 },
      { id: 'item-003', title: 'Frieren: Beyond Journey\'s End', slug: 'frieren', score: 8.87, addedAt: '2025-12-18', order: 3 },
      { id: 'item-004', title: 'Dandadan', slug: 'dandadan', score: 8.76, addedAt: '2025-12-17', order: 4 },
      { id: 'item-005', title: 'Demon Slayer: Infinity Castle', slug: 'demon-slayer-ic', score: 8.65, addedAt: '2025-12-16', order: 5 },
    ],
    analytics: {
      totalViews: 2876543,
      uniqueViewers: 1234567,
      avgTimeSpent: 8.5,
      conversionRate: 12.3,
      followerGrowth: 15.6,
      shareRate: 8.9,
      completionRate: 67.8,
      topReferrer: 'twitter.com',
    },
  },
  {
    id: 'col-002',
    title: 'Hidden Gems You Missed',
    slug: 'hidden-gems',
    description: 'Underrated anime that deserve more attention.',
    coverImage: '/collections/hidden-gems.jpg',
    type: 'editorial',
    status: 'published',
    itemCount: 15,
    totalViews: 1543210,
    totalFollowers: 23456,
    avgScore: 8.34,
    curator: 'Staff Picks',
    tags: ['Hidden Gems', 'Cult Classic', 'Beginner Friendly'],
    genres: ['Drama', 'Slice of Life', 'Mystery'],
    sortOrder: 'score',
    isFeatured: true,
    isPinned: false,
    isPublic: true,
    createdAt: '2025-06-01',
    updatedAt: '2025-12-10',
    lastItemAdded: '2025-12-10',
    items: [
      { id: 'item-010', title: 'Mushishi', slug: 'mushishi', score: 8.92, addedAt: '2025-06-01', order: 1 },
      { id: 'item-011', title: 'March Comes in Like a Lion', slug: '3gatsu-no-lion', score: 8.85, addedAt: '2025-06-02', order: 2 },
      { id: 'item-012', title: 'Wolf Children', slug: 'wolf-children', score: 8.78, addedAt: '2025-06-03', order: 3 },
      { id: 'item-013', title: 'The Tatami Galaxy', slug: 'tatami-galaxy', score: 8.71, addedAt: '2025-06-04', order: 4 },
      { id: 'item-014', title: 'Ping Pong', slug: 'ping-pong', score: 8.64, addedAt: '2025-06-05', order: 5 },
    ],
    analytics: {
      totalViews: 1543210,
      uniqueViewers: 876543,
      avgTimeSpent: 12.3,
      conversionRate: 18.7,
      followerGrowth: 22.4,
      shareRate: 15.2,
      completionRate: 72.1,
      topReferrer: 'reddit.com',
    },
  },
  {
    id: 'col-003',
    title: 'Winter 2026 Picks',
    slug: 'winter-2026-picks',
    description: 'Our curated selection of the best anime from Winter 2026.',
    coverImage: '/collections/winter-2026.jpg',
    type: 'seasonal',
    status: 'published',
    itemCount: 12,
    totalViews: 987654,
    totalFollowers: 12345,
    avgScore: 8.45,
    curator: 'Editorial Team',
    tags: ['New Release', 'Must Watch'],
    genres: ['Action', 'Fantasy', 'Adventure'],
    sortOrder: 'release_date',
    isFeatured: false,
    isPinned: true,
    isPublic: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-15',
    lastItemAdded: '2026-01-15',
    items: [
      { id: 'item-020', title: 'Solo Leveling Season 2', slug: 'solo-leveling-s2', score: 9.12, addedAt: '2026-01-01', order: 1 },
      { id: 'item-021', title: 'Demon Slayer: Infinity Castle Arc', slug: 'demon-slayer-ic', score: 8.91, addedAt: '2026-01-01', order: 2 },
      { id: 'item-022', title: 'My Hero Academia: You\'re Next', slug: 'mha-movie', score: 8.45, addedAt: '2026-01-05', order: 3 },
    ],
    analytics: {
      totalViews: 987654,
      uniqueViewers: 543210,
      avgTimeSpent: 6.2,
      conversionRate: 9.8,
      followerGrowth: 28.3,
      shareRate: 7.5,
      completionRate: 58.4,
      topReferrer: 'google.com',
    },
  },
  {
    id: 'col-004',
    title: 'Best Action Anime',
    slug: 'best-action',
    description: 'The ultimate collection of action-packed anime series and movies.',
    coverImage: '/collections/best-action.jpg',
    type: 'thematic',
    status: 'published',
    itemCount: 25,
    totalViews: 3456789,
    totalFollowers: 67890,
    avgScore: 8.56,
    curator: 'Community Vote',
    tags: ['Must Watch', 'Binge Worthy'],
    genres: ['Action', 'Adventure'],
    sortOrder: 'score',
    isFeatured: true,
    isPinned: false,
    isPublic: true,
    createdAt: '2024-03-15',
    updatedAt: '2025-12-01',
    lastItemAdded: '2025-12-01',
    items: [
      { id: 'item-030', title: 'Attack on Titan', slug: 'attack-on-titan', score: 9.05, addedAt: '2024-03-15', order: 1 },
      { id: 'item-031', title: 'Demon Slayer', slug: 'demon-slayer', score: 8.92, addedAt: '2024-03-15', order: 2 },
      { id: 'item-032', title: 'Jujutsu Kaisen', slug: 'jujutsu-kaisen', score: 8.87, addedAt: '2024-03-15', order: 3 },
      { id: 'item-033', title: 'Chainsaw Man', slug: 'chainsaw-man', score: 8.76, addedAt: '2024-03-15', order: 4 },
      { id: 'item-034', title: 'Solo Leveling', slug: 'solo-leveling', score: 8.65, addedAt: '2024-03-15', order: 5 },
    ],
    analytics: {
      totalViews: 3456789,
      uniqueViewers: 1876543,
      avgTimeSpent: 15.6,
      conversionRate: 22.1,
      followerGrowth: 12.8,
      shareRate: 11.3,
      completionRate: 78.9,
      topReferrer: 'twitter.com',
    },
  },
  {
    id: 'col-005',
    title: 'AI Generated: Similar to Solo Leveling',
    slug: 'ai-solo-leveling-similar',
    description: 'Auto-generated collection based on similar themes and styles to Solo Leveling.',
    coverImage: '/collections/ai-solo-leveling.jpg',
    type: 'auto_generated',
    status: 'published',
    itemCount: 8,
    totalViews: 654321,
    totalFollowers: 8765,
    avgScore: 8.23,
    curator: 'AI Curator',
    tags: ['Beginner Friendly'],
    genres: ['Action', 'Fantasy'],
    sortOrder: 'score',
    isFeatured: false,
    isPinned: false,
    isPublic: true,
    createdAt: '2026-01-10',
    updatedAt: '2026-01-14',
    lastItemAdded: '2026-01-14',
    items: [
      { id: 'item-040', title: 'Overlord', slug: 'overlord', score: 8.34, addedAt: '2026-01-10', order: 1 },
      { id: 'item-041', title: 'That Time I Got Reincarnated as a Slime', slug: 'slime', score: 8.28, addedAt: '2026-01-10', order: 2 },
      { id: 'item-042', title: 'The Rising of the Shield Hero', slug: 'shield-hero', score: 8.12, addedAt: '2026-01-11', order: 3 },
    ],
    analytics: {
      totalViews: 654321,
      uniqueViewers: 432109,
      avgTimeSpent: 5.8,
      conversionRate: 8.4,
      followerGrowth: 35.2,
      shareRate: 6.7,
      completionRate: 62.3,
      topReferrer: 'internal',
    },
  },
  {
    id: 'col-006',
    title: 'Cozy Winter Anime',
    slug: 'cozy-winter',
    description: 'Perfect anime to watch during cold winter nights.',
    coverImage: '/collections/cozy-winter.jpg',
    type: 'thematic',
    status: 'published',
    itemCount: 18,
    totalViews: 876543,
    totalFollowers: 15678,
    avgScore: 8.41,
    curator: 'Staff Picks',
    tags: ['Cozy', 'Slice of Life', 'Beginner Friendly'],
    genres: ['Slice of Life', 'Romance', 'Comedy'],
    sortOrder: 'score',
    isFeatured: false,
    isPinned: false,
    isPublic: true,
    createdAt: '2025-11-01',
    updatedAt: '2025-12-20',
    lastItemAdded: '2025-12-20',
    items: [
      { id: 'item-050', title: 'K-On!', slug: 'k-on', score: 8.56, addedAt: '2025-11-01', order: 1 },
      { id: 'item-051', title: 'Laid-Back Camp', slug: 'yuru-camp', score: 8.52, addedAt: '2025-11-01', order: 2 },
      { id: 'item-052', title: 'Non Non Biyori', slug: 'non-non-biyori', score: 8.45, addedAt: '2025-11-02', order: 3 },
    ],
    analytics: {
      totalViews: 876543,
      uniqueViewers: 543210,
      avgTimeSpent: 18.2,
      conversionRate: 25.6,
      followerGrowth: 19.8,
      shareRate: 12.4,
      completionRate: 85.3,
      topReferrer: 'pinterest.com',
    },
  },
  {
    id: 'col-007',
    title: 'Draft: 90s Classics',
    slug: '90s-classics-draft',
    description: 'A collection of classic anime from the 1990s.',
    coverImage: '/collections/90s-classics.jpg',
    type: 'editorial',
    status: 'draft',
    itemCount: 6,
    totalViews: 0,
    totalFollowers: 0,
    avgScore: 8.67,
    curator: 'Editorial Team',
    tags: ['Classic', 'Must Watch'],
    genres: ['Action', 'Sci-Fi', 'Drama'],
    sortOrder: 'release_date',
    isFeatured: false,
    isPinned: false,
    isPublic: false,
    createdAt: '2026-01-12',
    updatedAt: '2026-01-14',
    lastItemAdded: '2026-01-14',
    items: [
      { id: 'item-060', title: 'Neon Genesis Evangelion', slug: 'evangelion', score: 9.12, addedAt: '2026-01-12', order: 1 },
      { id: 'item-061', title: 'Cowboy Bebop', slug: 'cowboy-bebop', score: 8.98, addedAt: '2026-01-12', order: 2 },
      { id: 'item-062', title: 'Ghost in the Shell', slug: 'ghost-in-the-shell', score: 8.85, addedAt: '2026-01-13', order: 3 },
    ],
    analytics: {
      totalViews: 0,
      uniqueViewers: 0,
      avgTimeSpent: 0,
      conversionRate: 0,
      followerGrowth: 0,
      shareRate: 0,
      completionRate: 0,
      topReferrer: 'N/A',
    },
  },
  {
    id: 'col-008',
    title: 'Spring 2026 Preview',
    slug: 'spring-2026-preview',
    description: 'Upcoming anime to watch in Spring 2026.',
    coverImage: '/collections/spring-2026.jpg',
    type: 'seasonal',
    status: 'scheduled',
    itemCount: 8,
    totalViews: 0,
    totalFollowers: 2345,
    avgScore: 0,
    curator: 'Editorial Team',
    tags: ['New Release', 'Upcoming'],
    genres: ['Action', 'Fantasy', 'Comedy'],
    sortOrder: 'release_date',
    isFeatured: false,
    isPinned: false,
    isPublic: true,
    createdAt: '2026-01-15',
    updatedAt: '2026-01-15',
    lastItemAdded: '2026-01-15',
    items: [
      { id: 'item-070', title: 'Jujutsu Kaisen Season 3', slug: 'jjk-s3', score: 0, addedAt: '2026-01-15', order: 1 },
      { id: 'item-071', title: 'Chainsaw Man Part 2', slug: 'chainsaw-man-p2', score: 0, addedAt: '2026-01-15', order: 2 },
    ],
    analytics: {
      totalViews: 0,
      uniqueViewers: 0,
      avgTimeSpent: 0,
      conversionRate: 0,
      followerGrowth: 100,
      shareRate: 0,
      completionRate: 0,
      topReferrer: 'N/A',
    },
  },
  {
    id: 'col-009',
    title: 'Archived: Summer 2025',
    slug: 'summer-2025-archived',
    description: 'Curated picks from Summer 2025 season.',
    coverImage: '/collections/summer-2025.jpg',
    type: 'seasonal',
    status: 'archived',
    itemCount: 14,
    totalViews: 2134567,
    totalFollowers: 34567,
    avgScore: 8.38,
    curator: 'Editorial Team',
    tags: ['Summer', '2025'],
    genres: ['Action', 'Comedy', 'Romance'],
    sortOrder: 'score',
    isFeatured: false,
    isPinned: false,
    isPublic: false,
    createdAt: '2025-07-01',
    updatedAt: '2025-09-30',
    lastItemAdded: '2025-09-30',
    items: [
      { id: 'item-080', title: 'Oshi no Ko Season 2', slug: 'oshi-no-ko-s2', score: 8.72, addedAt: '2025-07-01', order: 1 },
      { id: 'item-081', title: 'My Hero Academia Season 7', slug: 'mha-s7', score: 8.45, addedAt: '2025-07-01', order: 2 },
    ],
    analytics: {
      totalViews: 2134567,
      uniqueViewers: 1234567,
      avgTimeSpent: 10.5,
      conversionRate: 15.6,
      followerGrowth: 0,
      shareRate: 9.8,
      completionRate: 71.2,
      topReferrer: 'google.com',
    },
  },
  {
    id: 'col-010',
    title: 'Best Short Anime (Under 15 eps)',
    slug: 'best-short',
    description: 'Great anime you can finish in a weekend.',
    coverImage: '/collections/best-short.jpg',
    type: 'thematic',
    status: 'published',
    itemCount: 20,
    totalViews: 1234567,
    totalFollowers: 19876,
    avgScore: 8.52,
    curator: 'Community Vote',
    tags: ['Short Series', 'Binge Worthy', 'Beginner Friendly'],
    genres: ['Drama', 'Mystery', 'Sci-Fi'],
    sortOrder: 'score',
    isFeatured: true,
    isPinned: false,
    isPublic: true,
    createdAt: '2025-04-10',
    updatedAt: '2025-12-15',
    lastItemAdded: '2025-12-15',
    items: [
      { id: 'item-090', title: 'Erased', slug: 'erased', score: 8.78, addedAt: '2025-04-10', order: 1 },
      { id: 'item-091', title: 'One Punch Man (Season 1)', slug: 'opm-s1', score: 8.72, addedAt: '2025-04-10', order: 2 },
      { id: 'item-092', title: 'Mob Psycho 100', slug: 'mob-psycho', score: 8.68, addedAt: '2025-04-11', order: 3 },
      { id: 'item-093', title: 'Death Parade', slug: 'death-parade', score: 8.54, addedAt: '2025-04-12', order: 4 },
      { id: 'item-094', title: 'Promised Neverland', slug: 'neverland', score: 8.45, addedAt: '2025-04-13', order: 5 },
    ],
    analytics: {
      totalViews: 1234567,
      uniqueViewers: 876543,
      avgTimeSpent: 14.2,
      conversionRate: 28.9,
      followerGrowth: 18.5,
      shareRate: 16.7,
      completionRate: 89.4,
      topReferrer: 'reddit.com',
    },
  },
]

export const MOCK_COLLECTION_CHARTS: CollectionChart[] = [
  {
    id: 'chart-types',
    title: 'Collections by Type',
    type: 'donut',
    data: [
      { label: 'Editorial', value: 35, color: '#3b82f6' },
      { label: 'Thematic', value: 30, color: '#8b5cf6' },
      { label: 'Seasonal', value: 20, color: '#22c55e' },
      { label: 'Auto Generated', value: 10, color: '#f59e0b' },
      { label: 'User Curated', value: 5, color: '#6b7280' },
    ],
  },
  {
    id: 'chart-views',
    title: 'Top Collections by Views',
    type: 'bar',
    data: [
      { label: 'Best Action', value: 3456789 },
      { label: 'Top 10 2025', value: 2876543 },
      { label: 'Summer 2025', value: 2134567 },
      { label: 'Hidden Gems', value: 1543210 },
      { label: 'Best Short', value: 1234567 },
    ],
  },
  {
    id: 'chart-genres',
    title: 'Most Common Genres',
    type: 'bar',
    data: [
      { label: 'Action', value: 45 },
      { label: 'Drama', value: 38 },
      { label: 'Fantasy', value: 32 },
      { label: 'Comedy', value: 28 },
      { label: 'Slice of Life', value: 22 },
      { label: 'Sci-Fi', value: 18 },
    ],
  },
]

export const MOCK_COLLECTION_SETTINGS: CollectionSettings = {
  maxItemsPerCollection: 50,
  autoRefreshEnabled: true,
  autoRefreshFrequency: 'Daily',
  defaultSortOrder: 'score',
  allowDuplicates: false,
  requireApproval: true,
  featuredThreshold: 10000,
}

export function getCollectionStats(items: Collection[]): CollectionStats {
  const totalCollections = items.length
  const publishedCollections = items.filter(
    (i) => i.status === 'published',
  ).length
  const totalViews = items.reduce((sum, i) => sum + i.totalViews, 0)
  const totalFollowers = items.reduce((sum, i) => sum + i.totalFollowers, 0)
  const avgItemsPerCollection =
    totalCollections > 0
      ? items.reduce((sum, i) => sum + i.itemCount, 0) / totalCollections
      : 0
  return {
    totalCollections,
    publishedCollections,
    totalViews,
    totalFollowers,
    avgItemsPerCollection,
  }
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}
