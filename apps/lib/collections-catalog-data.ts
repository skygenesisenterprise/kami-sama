import type { StatusTone } from '@/components/dash/status-badge'

export type PublicationState =
  | 'Draft'
  | 'Review'
  | 'Approved'
  | 'Scheduled'
  | 'Published'
  | 'Archived'

export type CollectionType =
  | 'editorial'
  | 'genre'
  | 'seasonal'
  | 'thematic'
  | 'franchise'
  | 'ranking'
  | 'custom'

export type DataSource = 'TMDB' | 'IMDb' | 'AniList' | 'Manual'

export type MetadataStatus = 'synced' | 'stale' | 'error' | 'missing'

export interface CollectionEntry {
  seriesId: string
  seriesTitle: string
  position: number
  addedAt: string
}

export interface CollectionSource {
  provider: DataSource
  externalId: string
  lastSyncedAt: string
  status: 'active' | 'inactive' | 'error'
}

export interface CollectionAsset {
  poster: string
  banner: string
}

export interface CollectionItem {
  id: string
  slug: string
  title: string
  description: string
  type: CollectionType
  status: PublicationState
  visibility: 'public' | 'private' | 'unlisted'
  entries: CollectionEntry[]
  tags: string[]
  assets: CollectionAsset
  sources: CollectionSource[]
  metadataStatus: MetadataStatus
  updatedAt: string
  updatedBy: string
}

export const COLLECTION_STATUS_TONE: Record<PublicationState, StatusTone> = {
  Draft: 'neutral',
  Review: 'warning',
  Approved: 'info',
  Scheduled: 'warning',
  Published: 'success',
  Archived: 'destructive',
}

export const COLLECTION_TYPE_LABEL: Record<CollectionType, string> = {
  editorial: 'Editorial',
  genre: 'Genre',
  seasonal: 'Seasonal',
  thematic: 'Thematic',
  franchise: 'Franchise',
  ranking: 'Ranking',
  custom: 'Custom',
}

export const METADATA_STATUS_LABEL: Record<MetadataStatus, string> = {
  synced: 'Synced',
  stale: 'Stale',
  error: 'Error',
  missing: 'Missing',
}

export const ALL_COLLECTION_STATUSES: Array<PublicationState | 'all'> = [
  'all',
  'Draft',
  'Review',
  'Approved',
  'Scheduled',
  'Published',
  'Archived',
]

export const ALL_COLLECTION_TYPES: Array<CollectionType | 'all'> = [
  'all',
  'editorial',
  'genre',
  'seasonal',
  'thematic',
  'franchise',
  'ranking',
  'custom',
]

export const ALL_DATA_SOURCES: Array<DataSource | 'all'> = [
  'all',
  'TMDB',
  'IMDb',
  'AniList',
  'Manual',
]

export const COLLECTIONS_MOCK: CollectionItem[] = [
  {
    id: 'col-001',
    slug: 'best-anime-2024',
    title: 'Best Anime of 2024',
    description:
      'A curated selection of the finest anime series released in 2024, chosen by our editorial team for outstanding storytelling, animation quality, and cultural impact.',
    type: 'editorial',
    status: 'Published',
    visibility: 'public',
    entries: [
      { seriesId: 'ser-001', seriesTitle: 'Eternal Frost', position: 1, addedAt: '2024-12-01' },
      { seriesId: 'ser-010', seriesTitle: 'Neon Samurai', position: 2, addedAt: '2024-12-01' },
      { seriesId: 'ser-004', seriesTitle: 'Spirit Veil', position: 3, addedAt: '2024-12-01' },
      { seriesId: 'ser-009', seriesTitle: 'Blade of the Fallen', position: 4, addedAt: '2024-12-05' },
      { seriesId: 'ser-003', seriesTitle: 'Neon Orbit', position: 5, addedAt: '2024-12-05' },
    ],
    tags: ['editorial', 'best-of', '2024'],
    assets: {
      poster: '/covers/eternal-frost.png',
      banner: '/banners/eternal-frost-banner.png',
    },
    sources: [
      { provider: 'Manual', externalId: 'manual-001', lastSyncedAt: '2h ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '2h ago',
    updatedBy: 'admin',
  },
  {
    id: 'col-002',
    slug: 'dark-fantasy',
    title: 'Dark Fantasy',
    description:
      'Gripping tales set in brutal, shadow-drenched worlds where heroism comes at a price and victory is never guaranteed.',
    type: 'genre',
    status: 'Published',
    visibility: 'public',
    entries: [
      { seriesId: 'ser-002', seriesTitle: 'Crimson Blade', position: 1, addedAt: '2024-06-10' },
      { seriesId: 'ser-006', seriesTitle: 'Hollow Kingdom', position: 2, addedAt: '2024-06-10' },
      { seriesId: 'ser-009', seriesTitle: 'Blade of the Fallen', position: 3, addedAt: '2024-06-15' },
      { seriesId: 'ser-014', seriesTitle: 'Crimson Vow', position: 4, addedAt: '2024-07-01' },
    ],
    tags: ['genre', 'dark', 'fantasy'],
    assets: {
      poster: '/covers/crimson-blade.png',
      banner: '/banners/crimson-blade-banner.png',
    },
    sources: [
      { provider: 'Manual', externalId: 'manual-002', lastSyncedAt: '1d ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '1d ago',
    updatedBy: 'admin',
  },
  {
    id: 'col-003',
    slug: 'winter-2025-anime',
    title: 'Winter 2025 Anime',
    description:
      'All anime series airing during the Winter 2025 season. Updated weekly as new episodes drop.',
    type: 'seasonal',
    status: 'Published',
    visibility: 'public',
    entries: [
      { seriesId: 'ser-001', seriesTitle: 'Eternal Frost', position: 1, addedAt: '2025-01-01' },
      { seriesId: 'ser-003', seriesTitle: 'Neon Orbit', position: 2, addedAt: '2025-01-01' },
      { seriesId: 'ser-008', seriesTitle: 'Starfall Academy', position: 3, addedAt: '2025-01-05' },
      { seriesId: 'ser-009', seriesTitle: 'Blade of the Fallen', position: 4, addedAt: '2025-01-05' },
      { seriesId: 'ser-012', seriesTitle: 'Thunder League', position: 5, addedAt: '2025-01-10' },
      { seriesId: 'ser-007', seriesTitle: 'Last Serve', position: 6, addedAt: '2025-01-10' },
    ],
    tags: ['seasonal', '2025', 'winter'],
    assets: {
      poster: '/covers/neon-orbit.png',
      banner: '/banners/neon-orbit-banner.png',
    },
    sources: [
      { provider: 'TMDB', externalId: 'tmdb-w2025', lastSyncedAt: '4h ago', status: 'active' },
      { provider: 'Manual', externalId: 'manual-003', lastSyncedAt: '4h ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '4h ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'col-004',
    slug: 'cyberpunk-neon',
    title: 'Cyberpunk & Neon',
    description:
      'Rain-soaked streets, holographic billboards, and the fragile humanity hiding beneath layers of chrome and circuitry.',
    type: 'thematic',
    status: 'Published',
    visibility: 'public',
    entries: [
      { seriesId: 'ser-010', seriesTitle: 'Neon Samurai', position: 1, addedAt: '2024-06-15' },
      { seriesId: 'ser-003', seriesTitle: 'Neon Orbit', position: 2, addedAt: '2024-08-01' },
    ],
    tags: ['thematic', 'cyberpunk', 'sci-fi'],
    assets: {
      poster: '/covers/neon-orbit.png',
      banner: '/banners/neon-orbit-banner.png',
    },
    sources: [
      { provider: 'Manual', externalId: 'manual-004', lastSyncedAt: '3d ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '3d ago',
    updatedBy: 'admin',
  },
  {
    id: 'col-005',
    slug: 'studio-aurora-collection',
    title: 'Studio Aurora Collection',
    description:
      'All series produced by Studio Aurora — from ethereal fantasy to supernatural romance.',
    type: 'franchise',
    status: 'Published',
    visibility: 'public',
    entries: [
      { seriesId: 'ser-001', seriesTitle: 'Eternal Frost', position: 1, addedAt: '2024-01-15' },
      { seriesId: 'ser-004', seriesTitle: 'Spirit Veil', position: 2, addedAt: '2024-04-01' },
      { seriesId: 'ser-014', seriesTitle: 'Crimson Vow', position: 3, addedAt: '2024-08-01' },
    ],
    tags: ['franchise', 'studio'],
    assets: {
      poster: '/covers/spirit-veil.png',
      banner: '/banners/eternal-frost-banner.png',
    },
    sources: [
      { provider: 'Manual', externalId: 'manual-005', lastSyncedAt: '5d ago', status: 'active' },
    ],
    metadataStatus: 'stale',
    updatedAt: '5d ago',
    updatedBy: 'admin',
  },
  {
    id: 'col-006',
    slug: 'top-rated-anime',
    title: 'Top Rated Anime',
    description:
      'The highest-rated anime series in our catalog, ranked by community score. Updated monthly.',
    type: 'ranking',
    status: 'Published',
    visibility: 'public',
    entries: [
      { seriesId: 'ser-001', seriesTitle: 'Eternal Frost', position: 1, addedAt: '2024-12-01' },
      { seriesId: 'ser-010', seriesTitle: 'Neon Samurai', position: 2, addedAt: '2024-12-01' },
      { seriesId: 'ser-014', seriesTitle: 'Crimson Vow', position: 3, addedAt: '2024-12-01' },
      { seriesId: 'ser-002', seriesTitle: 'Crimson Blade', position: 4, addedAt: '2024-12-01' },
      { seriesId: 'ser-009', seriesTitle: 'Blade of the Fallen', position: 5, addedAt: '2024-12-01' },
      { seriesId: 'ser-004', seriesTitle: 'Spirit Veil', position: 6, addedAt: '2024-12-01' },
      { seriesId: 'ser-003', seriesTitle: 'Neon Orbit', position: 7, addedAt: '2024-12-01' },
      { seriesId: 'ser-005', seriesTitle: 'After School Skies', position: 8, addedAt: '2024-12-01' },
    ],
    tags: ['ranking', 'best-of'],
    assets: {
      poster: '/covers/neon-orbit.png',
      banner: '/banners/neon-orbit-banner.png',
    },
    sources: [
      { provider: 'TMDB', externalId: 'tmdb-top-rated', lastSyncedAt: '1d ago', status: 'active' },
      { provider: 'Manual', externalId: 'manual-006', lastSyncedAt: '1d ago', status: 'active' },
    ],
    metadataStatus: 'synced',
    updatedAt: '1d ago',
    updatedBy: 'auto-import',
  },
  {
    id: 'col-007',
    slug: 'upcoming-releases',
    title: 'Upcoming Releases',
    description:
      'Series confirmed for future release. Draft collection — not yet visible to users.',
    type: 'seasonal',
    status: 'Draft',
    visibility: 'private',
    entries: [
      { seriesId: 'ser-006', seriesTitle: 'Hollow Kingdom', position: 1, addedAt: '2025-01-10' },
      { seriesId: 'ser-011', seriesTitle: 'Ember Crown', position: 2, addedAt: '2025-01-10' },
    ],
    tags: ['upcoming', 'draft'],
    assets: {
      poster: '/covers/hollow-kingdom.png',
      banner: '/banners/crimson-blade-banner.png',
    },
    sources: [
      { provider: 'Manual', externalId: 'manual-007', lastSyncedAt: '7d ago', status: 'active' },
    ],
    metadataStatus: 'missing',
    updatedAt: '7d ago',
    updatedBy: 'admin',
  },
  {
    id: 'col-008',
    slug: 'feel-good-anime',
    title: 'Feel-Good Anime',
    description:
      'Warm, comforting series perfect for when you need a break from the heavier stuff.',
    type: 'thematic',
    status: 'Review',
    visibility: 'unlisted',
    entries: [
      { seriesId: 'ser-005', seriesTitle: 'After School Skies', position: 1, addedAt: '2024-09-01' },
      { seriesId: 'ser-007', seriesTitle: 'Last Serve', position: 2, addedAt: '2024-09-01' },
      { seriesId: 'ser-013', seriesTitle: "Ocean's Whisper", position: 3, addedAt: '2024-09-05' },
    ],
    tags: ['thematic', 'slice-of-life', 'comfort'],
    assets: {
      poster: '/covers/after-school-skies.png',
      banner: '/banners/eternal-frost-banner.png',
    },
    sources: [
      { provider: 'Manual', externalId: 'manual-008', lastSyncedAt: '2d ago', status: 'active' },
    ],
    metadataStatus: 'stale',
    updatedAt: '2d ago',
    updatedBy: 'admin',
  },
]

export function getCollectionStats(collections: CollectionItem[]) {
  const total = collections.length
  const published = collections.filter((c) => c.status === 'Published').length
  const drafts = collections.filter((c) => c.status === 'Draft').length
  const metadataErrors = collections.filter(
    (c) => c.metadataStatus === 'error' || c.metadataStatus === 'missing',
  ).length
  const inReview = collections.filter((c) => c.status === 'Review').length
  const archived = collections.filter((c) => c.status === 'Archived').length
  const totalEntries = collections.reduce((acc, c) => acc + c.entries.length, 0)

  return {
    total,
    published,
    drafts,
    metadataErrors,
    inReview,
    archived,
    totalEntries,
  }
}
