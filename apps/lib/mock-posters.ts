import type { StatusTone } from '@/components/dash/status-badge'

export type PosterMediaType = 'anime' | 'movie' | 'series'

export type PosterResolution =
  | '4k'
  | '1080p'
  | '720p'
  | '480p'
  | 'sd'

export type PosterFormat = 'jpg' | 'png' | 'webp' | 'avif'

export type PosterStatus =
  | 'active'
  | 'unused'
  | 'missing'
  | 'duplicate'
  | 'corrupted'

export type PosterSource =
  | 'tmdb'
  | 'anilist'
  | 'fanart'
  | 'plex'
  | 'jellyfin'
  | 'upload'
  | 'generated'

export type PosterLanguage =
  | 'en'
  | 'fr'
  | 'ja'
  | 'es'
  | 'de'
  | 'pt'
  | 'it'
  | 'ko'
  | 'zh'
  | 'ar'

export type ImportSource =
  | 'tmdb'
  | 'anilist'
  | 'fanart'
  | 'plex'
  | 'jellyfin'
  | 'local'

export interface Poster {
  id: string
  title: string
  slug: string
  url: string
  thumbnailUrl: string
  mediaType: PosterMediaType
  resolution: PosterResolution
  format: PosterFormat
  width: number
  height: number
  sizeBytes: number
  aspectRatio: string
  colorProfile: string
  language: PosterLanguage
  source: PosterSource
  provider: string
  status: PosterStatus
  usageCount: number
  usedBy: PosterUsage[]
  versions: PosterVersion[]
  metadata: PosterMetadata
  history: PosterHistoryEntry[]
  qualityIndicators: QualityIndicator[]
  checksum: string
  copyright: string
  author: string
  externalIds: Record<string, string>
  isDuplicate: boolean
  importedAt: string
  updatedAt: string
  createdAt: string
}

export interface PosterUsage {
  id: string
  type: 'series' | 'movie' | 'collection' | 'homepage' | 'discover' | 'community' | 'campaign'
  name: string
  url: string
}

export interface PosterVersion {
  id: string
  label: string
  language: PosterLanguage
  resolution: PosterResolution
  format: PosterFormat
  width: number
  height: number
  sizeBytes: number
  url: string
  isOriginal: boolean
}

export interface PosterMetadata {
  dpi: number
  bitsPerChannel: number
  hasAlpha: boolean
  isInterlaced: boolean
  gamma: number
  dateTaken?: string
  camera?: string
  software?: string
}

export interface PosterHistoryEntry {
  id: string
  action: 'upload' | 'replace' | 'modify' | 'optimize' | 'delete' | 'restore'
  description: string
  performedBy: string
  timestamp: string
  details?: string
}

export type QualityIndicator =
  | 'high_resolution'
  | 'low_resolution'
  | 'potential_duplicate'
  | 'corrupted'
  | 'transparent'
  | 'optimized'

export interface PosterStats {
  totalPosters: number
  totalStorageBytes: number
  unusedPosters: number
  missingPosters: number
  activePosters: number
  duplicatePosters: number
  byMediaType: Record<PosterMediaType, number>
  byResolution: Record<PosterResolution, number>
  byFormat: Record<PosterFormat, number>
}

export interface PosterChart {
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

export interface PosterSettings {
  maxUploadSizeMB: number
  allowedFormats: PosterFormat[]
  autoOptimize: boolean
  generateThumbnails: boolean
  thumbnailSize: number
  requireApproval: boolean
  duplicateDetection: boolean
  autoCleanupUnused: boolean
  unusedDaysThreshold: number
  compressionQuality: number
}

export interface ImportPreview {
  id: string
  source: ImportSource
  title: string
  url: string
  thumbnailUrl: string
  resolution: PosterResolution
  format: PosterFormat
  width: number
  height: number
  sizeBytes: number
  language: PosterLanguage
  alreadyExists: boolean
  selected: boolean
}

export const POSTER_MEDIA_TYPES: PosterMediaType[] = ['anime', 'movie', 'series']

export const POSTER_MEDIA_TYPE_LABEL: Record<PosterMediaType, string> = {
  anime: 'Anime',
  movie: 'Movie',
  series: 'Series',
}

export const POSTER_RESOLUTIONS: PosterResolution[] = ['4k', '1080p', '720p', '480p', 'sd']

export const POSTER_RESOLUTION_LABEL: Record<PosterResolution, string> = {
  '4k': '4K (2160p)',
  '1080p': '1080p',
  '720p': '720p',
  '480p': '480p',
  'sd': 'SD',
}

export const POSTER_RESOLUTION_TONE: Record<PosterResolution, StatusTone> = {
  '4k': 'success',
  '1080p': 'success',
  '720p': 'info',
  '480p': 'warning',
  'sd': 'destructive',
}

export const POSTER_FORMATS: PosterFormat[] = ['jpg', 'png', 'webp', 'avif']

export const POSTER_STATUSES: PosterStatus[] = [
  'active',
  'unused',
  'missing',
  'duplicate',
  'corrupted',
]

export const POSTER_STATUS_LABEL: Record<PosterStatus, string> = {
  active: 'Active',
  unused: 'Unused',
  missing: 'Missing',
  duplicate: 'Duplicate',
  corrupted: 'Corrupted',
}

export const POSTER_STATUS_TONE: Record<PosterStatus, StatusTone> = {
  active: 'success',
  unused: 'warning',
  missing: 'destructive',
  duplicate: 'info',
  corrupted: 'destructive',
}

export const POSTER_SOURCES: PosterSource[] = [
  'tmdb',
  'anilist',
  'fanart',
  'plex',
  'jellyfin',
  'upload',
  'generated',
]

export const POSTER_SOURCE_LABEL: Record<PosterSource, string> = {
  tmdb: 'TMDB',
  anilist: 'AniList',
  fanart: 'FanArt.tv',
  plex: 'Plex',
  jellyfin: 'Jellyfin',
  upload: 'Upload',
  generated: 'Generated',
}

export const POSTER_LANGUAGES: PosterLanguage[] = [
  'en',
  'fr',
  'ja',
  'es',
  'de',
  'pt',
  'it',
  'ko',
  'zh',
  'ar',
]

export const POSTER_LANGUAGE_LABEL: Record<PosterLanguage, string> = {
  en: 'English',
  fr: 'French',
  ja: 'Japanese',
  es: 'Spanish',
  de: 'German',
  pt: 'Portuguese',
  it: 'Italian',
  ko: 'Korean',
  zh: 'Chinese',
  ar: 'Arabic',
}

export const IMPORT_SOURCES: ImportSource[] = [
  'tmdb',
  'anilist',
  'fanart',
  'plex',
  'jellyfin',
  'local',
]

export const IMPORT_SOURCE_LABEL: Record<ImportSource, string> = {
  tmdb: 'TMDB',
  anilist: 'AniList',
  fanart: 'FanArt.tv',
  plex: 'Plex',
  jellyfin: 'Jellyfin',
  local: 'Upload Local',
}

export const QUALITY_LABEL: Record<QualityIndicator, string> = {
  high_resolution: 'High Resolution',
  low_resolution: 'Low Resolution',
  potential_duplicate: 'Potential Duplicate',
  corrupted: 'Corrupted',
  transparent: 'Transparent',
  optimized: 'Optimized',
}

export const QUALITY_TONE: Record<QualityIndicator, StatusTone> = {
  high_resolution: 'success',
  low_resolution: 'warning',
  potential_duplicate: 'info',
  corrupted: 'destructive',
  transparent: 'info',
  optimized: 'success',
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

export const MOCK_POSTERS: Poster[] = [
  {
    id: 'poster-001',
    title: 'Solo Leveling Season 2',
    slug: 'solo-leveling-s2',
    url: '/posters/solo-leveling-s2.jpg',
    thumbnailUrl: '/posters/thumbs/solo-leveling-s2.jpg',
    mediaType: 'anime',
    resolution: '4k',
    format: 'jpg',
    width: 2160,
    height: 3240,
    sizeBytes: 4_523_891,
    aspectRatio: '2:3',
    colorProfile: 'sRGB IEC61966-2.1',
    language: 'en',
    source: 'tmdb',
    provider: 'TMDB',
    status: 'active',
    usageCount: 12,
    usedBy: [
      { id: 'u1', type: 'series', name: 'Solo Leveling S2', url: '/catalog/series/solo-leveling-s2' },
      { id: 'u2', type: 'homepage', name: 'Homepage Hero', url: '/home' },
      { id: 'u3', type: 'discover', name: 'Trending Section', url: '/discovery/trending' },
      { id: 'u4', type: 'collection', name: 'Top 10 2025', url: '/collections/top-10-2025' },
      { id: 'u5', type: 'campaign', name: 'Winter 2026 Promo', url: '/campaigns/winter-2026' },
    ],
    versions: [
      { id: 'v1', label: 'Original', language: 'en', resolution: '4k', format: 'jpg', width: 2160, height: 3240, sizeBytes: 4_523_891, url: '/posters/solo-leveling-s2.jpg', isOriginal: true },
      { id: 'v2', label: 'Français', language: 'fr', resolution: '1080p', format: 'jpg', width: 1080, height: 1620, sizeBytes: 1_234_567, url: '/posters/solo-leveling-s2-fr.jpg', isOriginal: false },
      { id: 'v3', label: 'Japanese', language: 'ja', resolution: '4k', format: 'webp', width: 2160, height: 3240, sizeBytes: 2_345_678, url: '/posters/solo-leveling-s2-ja.webp', isOriginal: false },
      { id: 'v4', label: 'Mobile', language: 'en', resolution: '1080p', format: 'webp', width: 1080, height: 1920, sizeBytes: 876_543, url: '/posters/solo-leveling-s2-mobile.webp', isOriginal: false },
      { id: 'v5', label: 'Dark', language: 'en', resolution: '4k', format: 'png', width: 2160, height: 3240, sizeBytes: 8_765_432, url: '/posters/solo-leveling-s2-dark.png', isOriginal: false },
    ],
    metadata: {
      dpi: 300,
      bitsPerChannel: 8,
      hasAlpha: false,
      isInterlaced: false,
      gamma: 2.2,
      software: 'Adobe Photoshop 25.0',
    },
    history: [
      { id: 'h1', action: 'upload', description: 'Original poster uploaded', performedBy: 'admin@kami-sama.io', timestamp: '2025-12-01T10:00:00Z' },
      { id: 'h2', action: 'optimize', description: 'Auto-optimized for web delivery', performedBy: 'system', timestamp: '2025-12-01T10:05:00Z', details: 'Compressed from 6.2MB to 4.5MB' },
      { id: 'h3', action: 'modify', description: 'French version added', performedBy: 'editor@kami-sama.io', timestamp: '2025-12-05T14:30:00Z' },
      { id: 'h4', action: 'replace', description: 'Replaced with higher quality version', performedBy: 'admin@kami-sama.io', timestamp: '2025-12-10T09:15:00Z', details: 'Updated to 4K resolution' },
    ],
    qualityIndicators: ['high_resolution', 'optimized'],
    checksum: 'sha256:a1b2c3d4e5f6789012345678901234567890abcdef',
    copyright: '© A-1 Pictures / D&C Media',
    author: 'Kami-Sama Editorial',
    externalIds: { tmdb: '12345', anilist: '123456' },
    isDuplicate: false,
    importedAt: '2025-12-01',
    updatedAt: '2025-12-10',
    createdAt: '2025-12-01',
  },
  {
    id: 'poster-002',
    title: 'Jujutsu Kaisen: Hidden Inventory',
    slug: 'jjk-hidden-inventory',
    url: '/posters/jjk-hidden-inventory.jpg',
    thumbnailUrl: '/posters/thumbs/jjk-hidden-inventory.jpg',
    mediaType: 'movie',
    resolution: '4k',
    format: 'webp',
    width: 2160,
    height: 3240,
    sizeBytes: 2_876_543,
    aspectRatio: '2:3',
    colorProfile: 'sRGB IEC61966-2.1',
    language: 'en',
    source: 'tmdb',
    provider: 'TMDB',
    status: 'active',
    usageCount: 8,
    usedBy: [
      { id: 'u1', type: 'movie', name: 'JJK: Hidden Inventory', url: '/catalog/movies/jjk-hidden-inventory' },
      { id: 'u2', type: 'discover', name: 'Now Playing', url: '/discovery/trending' },
      { id: 'u3', type: 'collection', name: 'Best Movies 2025', url: '/collections/best-movies-2025' },
    ],
    versions: [
      { id: 'v1', label: 'Original', language: 'en', resolution: '4k', format: 'webp', width: 2160, height: 3240, sizeBytes: 2_876_543, url: '/posters/jjk-hidden-inventory.jpg', isOriginal: true },
      { id: 'v2', label: 'Japanese', language: 'ja', resolution: '4k', format: 'jpg', width: 2160, height: 3240, sizeBytes: 3_456_789, url: '/posters/jjk-hidden-inventory-ja.jpg', isOriginal: false },
    ],
    metadata: {
      dpi: 300,
      bitsPerChannel: 8,
      hasAlpha: false,
      isInterlaced: false,
      gamma: 2.2,
      software: 'Adobe Photoshop 25.0',
    },
    history: [
      { id: 'h1', action: 'upload', description: 'Uploaded from TMDB', performedBy: 'system', timestamp: '2025-11-15T08:00:00Z' },
      { id: 'h2', action: 'optimize', description: 'Converted to WebP', performedBy: 'system', timestamp: '2025-11-15T08:02:00Z', details: 'Reduced from 5.1MB to 2.9MB' },
    ],
    qualityIndicators: ['high_resolution', 'optimized'],
    checksum: 'sha256:b2c3d4e5f6789012345678901234567890abcdef01',
    copyright: '© MAPPA / Shueisha',
    author: 'Kami-Sama Editorial',
    externalIds: { tmdb: '67890', anilist: '654321' },
    isDuplicate: false,
    importedAt: '2025-11-15',
    updatedAt: '2025-11-15',
    createdAt: '2025-11-15',
  },
  {
    id: 'poster-003',
    title: 'Frieren: Beyond Journey\'s End',
    slug: 'frieren',
    url: '/posters/frieren.jpg',
    thumbnailUrl: '/posters/thumbs/frieren.jpg',
    mediaType: 'anime',
    resolution: '1080p',
    format: 'png',
    width: 1080,
    height: 1620,
    sizeBytes: 8_765_432,
    aspectRatio: '2:3',
    colorProfile: 'sRGB IEC61966-2.1',
    language: 'ja',
    source: 'anilist',
    provider: 'AniList',
    status: 'active',
    usageCount: 6,
    usedBy: [
      { id: 'u1', type: 'series', name: 'Frieren', url: '/catalog/series/frieren' },
      { id: 'u2', type: 'homepage', name: 'Featured Carousel', url: '/home' },
    ],
    versions: [
      { id: 'v1', label: 'Original', language: 'ja', resolution: '1080p', format: 'png', width: 1080, height: 1620, sizeBytes: 8_765_432, url: '/posters/frieren.jpg', isOriginal: true },
    ],
    metadata: {
      dpi: 150,
      bitsPerChannel: 8,
      hasAlpha: true,
      isInterlaced: false,
      gamma: 2.2,
    },
    history: [
      { id: 'h1', action: 'upload', description: 'Uploaded from AniList', performedBy: 'admin@kami-sama.io', timestamp: '2025-09-01T12:00:00Z' },
    ],
    qualityIndicators: ['transparent'],
    checksum: 'sha256:c3d4e5f6789012345678901234567890abcdef0123',
    copyright: '© Madhouse / Shogakukan',
    author: 'Kami-Sama Editorial',
    externalIds: { anilist: '125145' },
    isDuplicate: false,
    importedAt: '2025-09-01',
    updatedAt: '2025-09-01',
    createdAt: '2025-09-01',
  },
  {
    id: 'poster-004',
    title: 'Demon Slayer: Infinity Castle',
    slug: 'demon-slayer-ic',
    url: '/posters/demon-slayer-ic.jpg',
    thumbnailUrl: '/posters/thumbs/demon-slayer-ic.jpg',
    mediaType: 'anime',
    resolution: '4k',
    format: 'jpg',
    width: 2160,
    height: 3240,
    sizeBytes: 5_123_456,
    aspectRatio: '2:3',
    colorProfile: 'sRGB IEC61966-2.1',
    language: 'en',
    source: 'fanart',
    provider: 'FanArt.tv',
    status: 'active',
    usageCount: 15,
    usedBy: [
      { id: 'u1', type: 'series', name: 'Demon Slayer IC Arc', url: '/catalog/series/demon-slayer-ic' },
      { id: 'u2', type: 'homepage', name: 'Hero Banner', url: '/home' },
      { id: 'u3', type: 'discover', name: 'Top Rated', url: '/discovery/trending' },
      { id: 'u4', type: 'campaign', name: 'Winter Premiere', url: '/campaigns/winter-premiere' },
    ],
    versions: [
      { id: 'v1', label: 'Original', language: 'en', resolution: '4k', format: 'jpg', width: 2160, height: 3240, sizeBytes: 5_123_456, url: '/posters/demon-slayer-ic.jpg', isOriginal: true },
      { id: 'v2', label: 'French', language: 'fr', resolution: '1080p', format: 'jpg', width: 1080, height: 1620, sizeBytes: 1_456_789, url: '/posters/demon-slayer-ic-fr.jpg', isOriginal: false },
      { id: 'v3', label: 'Mobile', language: 'en', resolution: '1080p', format: 'webp', width: 1080, height: 1920, sizeBytes: 987_654, url: '/posters/demon-slayer-ic-mobile.webp', isOriginal: false },
    ],
    metadata: {
      dpi: 300,
      bitsPerChannel: 8,
      hasAlpha: false,
      isInterlaced: false,
      gamma: 2.2,
      software: 'GIMP 2.10',
    },
    history: [
      { id: 'h1', action: 'upload', description: 'Uploaded from FanArt.tv', performedBy: 'system', timestamp: '2025-12-20T06:00:00Z' },
      { id: 'h2', action: 'optimize', description: 'Auto-optimized', performedBy: 'system', timestamp: '2025-12-20T06:03:00Z' },
    ],
    qualityIndicators: ['high_resolution', 'optimized'],
    checksum: 'sha256:d4e5f6789012345678901234567890abcdef012345',
    copyright: '© ufotable / Aniplex',
    author: 'FanArt Contributor',
    externalIds: { fanart: '98765', tmdb: '54321' },
    isDuplicate: false,
    importedAt: '2025-12-20',
    updatedAt: '2025-12-20',
    createdAt: '2025-12-20',
  },
  {
    id: 'poster-005',
    title: 'Dandadan',
    slug: 'dandadan',
    url: '/posters/dandadan.jpg',
    thumbnailUrl: '/posters/thumbs/dandadan.jpg',
    mediaType: 'anime',
    resolution: '1080p',
    format: 'jpg',
    width: 1080,
    height: 1620,
    sizeBytes: 1_234_567,
    aspectRatio: '2:3',
    colorProfile: 'sRGB IEC61966-2.1',
    language: 'en',
    source: 'tmdb',
    provider: 'TMDB',
    status: 'active',
    usageCount: 4,
    usedBy: [
      { id: 'u1', type: 'series', name: 'Dandadan', url: '/catalog/series/dandadan' },
    ],
    versions: [
      { id: 'v1', label: 'Original', language: 'en', resolution: '1080p', format: 'jpg', width: 1080, height: 1620, sizeBytes: 1_234_567, url: '/posters/dandadan.jpg', isOriginal: true },
    ],
    metadata: {
      dpi: 150,
      bitsPerChannel: 8,
      hasAlpha: false,
      isInterlaced: false,
      gamma: 2.2,
    },
    history: [
      { id: 'h1', action: 'upload', description: 'Uploaded from TMDB', performedBy: 'system', timestamp: '2026-04-01T10:00:00Z' },
    ],
    qualityIndicators: ['optimized'],
    checksum: 'sha256:e5f6789012345678901234567890abcdef01234567',
    copyright: '© Science SARU / Shueisha',
    author: 'Kami-Sama Editorial',
    externalIds: { tmdb: '11111', anilist: '111111' },
    isDuplicate: false,
    importedAt: '2026-04-01',
    updatedAt: '2026-04-01',
    createdAt: '2026-04-01',
  },
  {
    id: 'poster-006',
    title: 'One Piece',
    slug: 'one-piece',
    url: '/posters/one-piece.jpg',
    thumbnailUrl: '/posters/thumbs/one-piece.jpg',
    mediaType: 'series',
    resolution: '720p',
    format: 'jpg',
    width: 720,
    height: 1080,
    sizeBytes: 567_890,
    aspectRatio: '2:3',
    colorProfile: 'sRGB IEC61966-2.1',
    language: 'en',
    source: 'plex',
    provider: 'Plex',
    status: 'active',
    usageCount: 3,
    usedBy: [
      { id: 'u1', type: 'series', name: 'One Piece', url: '/catalog/series/one-piece' },
    ],
    versions: [
      { id: 'v1', label: 'Original', language: 'en', resolution: '720p', format: 'jpg', width: 720, height: 1080, sizeBytes: 567_890, url: '/posters/one-piece.jpg', isOriginal: true },
    ],
    metadata: {
      dpi: 72,
      bitsPerChannel: 8,
      hasAlpha: false,
      isInterlaced: false,
      gamma: 2.2,
    },
    history: [
      { id: 'h1', action: 'upload', description: 'Imported from Plex', performedBy: 'system', timestamp: '2025-06-15T14:00:00Z' },
    ],
    qualityIndicators: ['low_resolution'],
    checksum: 'sha256:f6789012345678901234567890abcdef0123456789',
    copyright: '© Toei Animation',
    author: 'Plex Agent',
    externalIds: { plex: '22222', tmdb: '33333' },
    isDuplicate: false,
    importedAt: '2025-06-15',
    updatedAt: '2025-06-15',
    createdAt: '2025-06-15',
  },
  {
    id: 'poster-007',
    title: 'Spy x Family Code: White',
    slug: 'spy-family-code-white',
    url: '/posters/spy-family-code-white.jpg',
    thumbnailUrl: '/posters/thumbs/spy-family-code-white.jpg',
    mediaType: 'movie',
    resolution: '4k',
    format: 'avif',
    width: 2160,
    height: 3240,
    sizeBytes: 1_876_543,
    aspectRatio: '2:3',
    colorProfile: 'sRGB IEC61966-2.1',
    language: 'fr',
    source: 'upload',
    provider: 'Manual Upload',
    status: 'active',
    usageCount: 5,
    usedBy: [
      { id: 'u1', type: 'movie', name: 'Spy x Family Movie', url: '/catalog/movies/spy-family-code-white' },
      { id: 'u2', type: 'collection', name: 'Family Friendly', url: '/collections/family-friendly' },
    ],
    versions: [
      { id: 'v1', label: 'Original', language: 'fr', resolution: '4k', format: 'avif', width: 2160, height: 3240, sizeBytes: 1_876_543, url: '/posters/spy-family-code-white.jpg', isOriginal: true },
      { id: 'v2', label: 'English', language: 'en', resolution: '4k', format: 'jpg', width: 2160, height: 3240, sizeBytes: 4_321_098, url: '/posters/spy-family-code-white-en.jpg', isOriginal: false },
    ],
    metadata: {
      dpi: 300,
      bitsPerChannel: 10,
      hasAlpha: false,
      isInterlaced: false,
      gamma: 2.2,
      software: 'Adobe Photoshop 25.0',
    },
    history: [
      { id: 'h1', action: 'upload', description: 'Manually uploaded', performedBy: 'admin@kami-sama.io', timestamp: '2025-12-22T16:00:00Z' },
      { id: 'h2', action: 'optimize', description: 'Converted to AVIF', performedBy: 'system', timestamp: '2025-12-22T16:02:00Z', details: 'Reduced from 5.8MB to 1.9MB' },
    ],
    qualityIndicators: ['high_resolution', 'optimized'],
    checksum: 'sha256:7890abcdef012345678901234567890abcdef012345',
    copyright: '© WIT Studio / CloverWorks',
    author: 'Kami-Sama Editorial',
    externalIds: { tmdb: '44444' },
    isDuplicate: false,
    importedAt: '2025-12-22',
    updatedAt: '2025-12-22',
    createdAt: '2025-12-22',
  },
  {
    id: 'poster-008',
    title: 'Chainsaw Man Part 2',
    slug: 'chainsaw-man-p2',
    url: '/posters/chainsaw-man-p2.jpg',
    thumbnailUrl: '/posters/thumbs/chainsaw-man-p2.jpg',
    mediaType: 'anime',
    resolution: '1080p',
    format: 'png',
    width: 1080,
    height: 1620,
    sizeBytes: 9_876_543,
    aspectRatio: '2:3',
    colorProfile: 'Display P3',
    language: 'en',
    source: 'anilist',
    provider: 'AniList',
    status: 'active',
    usageCount: 7,
    usedBy: [
      { id: 'u1', type: 'series', name: 'Chainsaw Man P2', url: '/catalog/series/chainsaw-man-p2' },
      { id: 'u2', type: 'discover', name: 'New This Season', url: '/discovery/seasonal' },
    ],
    versions: [
      { id: 'v1', label: 'Original', language: 'en', resolution: '1080p', format: 'png', width: 1080, height: 1620, sizeBytes: 9_876_543, url: '/posters/chainsaw-man-p2.jpg', isOriginal: true },
    ],
    metadata: {
      dpi: 150,
      bitsPerChannel: 8,
      hasAlpha: true,
      isInterlaced: false,
      gamma: 2.2,
    },
    history: [
      { id: 'h1', action: 'upload', description: 'Uploaded from AniList', performedBy: 'admin@kami-sama.io', timestamp: '2026-03-15T11:00:00Z' },
    ],
    qualityIndicators: ['transparent'],
    checksum: 'sha256:90abcdef012345678901234567890abcdef01234567',
    copyright: '© MAPPA',
    author: 'AniList Community',
    externalIds: { anilist: '999999' },
    isDuplicate: false,
    importedAt: '2026-03-15',
    updatedAt: '2026-03-15',
    createdAt: '2026-03-15',
  },
  {
    id: 'poster-009',
    title: 'Attack on Titan: Final Season',
    slug: 'aot-final',
    url: '/posters/aot-final.jpg',
    thumbnailUrl: '/posters/thumbs/aot-final.jpg',
    mediaType: 'anime',
    resolution: '4k',
    format: 'jpg',
    width: 2160,
    height: 3240,
    sizeBytes: 3_456_789,
    aspectRatio: '2:3',
    colorProfile: 'sRGB IEC61966-2.1',
    language: 'en',
    source: 'fanart',
    provider: 'FanArt.tv',
    status: 'active',
    usageCount: 9,
    usedBy: [
      { id: 'u1', type: 'series', name: 'Attack on Titan', url: '/catalog/series/aot' },
      { id: 'u2', type: 'collection', name: 'Best Action Anime', url: '/collections/best-action' },
      { id: 'u3', type: 'homepage', name: 'Classic Section', url: '/home' },
    ],
    versions: [
      { id: 'v1', label: 'Original', language: 'en', resolution: '4k', format: 'jpg', width: 2160, height: 3240, sizeBytes: 3_456_789, url: '/posters/aot-final.jpg', isOriginal: true },
      { id: 'v2', label: 'Japanese', language: 'ja', resolution: '4k', format: 'jpg', width: 2160, height: 3240, sizeBytes: 3_234_567, url: '/posters/aot-final-ja.jpg', isOriginal: false },
      { id: 'v3', label: 'Alternative', language: 'en', resolution: '1080p', format: 'webp', width: 1080, height: 1620, sizeBytes: 765_432, url: '/posters/aot-final-alt.webp', isOriginal: false },
    ],
    metadata: {
      dpi: 300,
      bitsPerChannel: 8,
      hasAlpha: false,
      isInterlaced: false,
      gamma: 2.2,
    },
    history: [
      { id: 'h1', action: 'upload', description: 'Uploaded from FanArt.tv', performedBy: 'system', timestamp: '2025-01-01T08:00:00Z' },
      { id: 'h2', action: 'optimize', description: 'Auto-optimized', performedBy: 'system', timestamp: '2025-01-01T08:02:00Z' },
      { id: 'h3', action: 'modify', description: 'Alternative version added', performedBy: 'editor@kami-sama.io', timestamp: '2025-02-15T14:00:00Z' },
    ],
    qualityIndicators: ['high_resolution', 'optimized'],
    checksum: 'sha256:abcdef012345678901234567890abcdef0123456789',
    copyright: '© MAPPA / Kodansha',
    author: 'FanArt Contributor',
    externalIds: { fanart: '11111', tmdb: '22222' },
    isDuplicate: false,
    importedAt: '2025-01-01',
    updatedAt: '2025-02-15',
    createdAt: '2025-01-01',
  },
  {
    id: 'poster-010',
    title: 'Solo Leveling Season 2 (Duplicate)',
    slug: 'solo-leveling-s2-dup',
    url: '/posters/solo-leveling-s2-dup.jpg',
    thumbnailUrl: '/posters/thumbs/solo-leveling-s2-dup.jpg',
    mediaType: 'anime',
    resolution: '1080p',
    format: 'jpg',
    width: 1080,
    height: 1620,
    sizeBytes: 1_987_654,
    aspectRatio: '2:3',
    colorProfile: 'sRGB IEC61966-2.1',
    language: 'en',
    source: 'jellyfin',
    provider: 'Jellyfin',
    status: 'duplicate',
    usageCount: 0,
    usedBy: [],
    versions: [
      { id: 'v1', label: 'Original', language: 'en', resolution: '1080p', format: 'jpg', width: 1080, height: 1620, sizeBytes: 1_987_654, url: '/posters/solo-leveling-s2-dup.jpg', isOriginal: true },
    ],
    metadata: {
      dpi: 72,
      bitsPerChannel: 8,
      hasAlpha: false,
      isInterlaced: false,
      gamma: 2.2,
    },
    history: [
      { id: 'h1', action: 'upload', description: 'Imported from Jellyfin', performedBy: 'system', timestamp: '2025-12-05T16:00:00Z' },
    ],
    qualityIndicators: ['potential_duplicate'],
    checksum: 'sha256:bbccdd012345678901234567890abcdef0123456789',
    copyright: '© A-1 Pictures',
    author: 'Jellyfin Agent',
    externalIds: { jellyfin: '33333' },
    isDuplicate: true,
    importedAt: '2025-12-05',
    updatedAt: '2025-12-05',
    createdAt: '2025-12-05',
  },
  {
    id: 'poster-011',
    title: 'Vinland Saga Season 3',
    slug: 'vinland-saga-s3',
    url: '',
    thumbnailUrl: '',
    mediaType: 'anime',
    resolution: '1080p',
    format: 'jpg',
    width: 0,
    height: 0,
    sizeBytes: 0,
    aspectRatio: '2:3',
    colorProfile: '',
    language: 'en',
    source: 'tmdb',
    provider: 'TMDB',
    status: 'missing',
    usageCount: 1,
    usedBy: [
      { id: 'u1', type: 'series', name: 'Vinland Saga S3', url: '/catalog/series/vinland-saga-s3' },
    ],
    versions: [],
    metadata: {
      dpi: 0,
      bitsPerChannel: 0,
      hasAlpha: false,
      isInterlaced: false,
      gamma: 0,
    },
    history: [
      { id: 'h1', action: 'delete', description: 'Poster removed during cleanup', performedBy: 'admin@kami-sama.io', timestamp: '2025-12-18T10:00:00Z', details: 'Accidentally deleted' },
      { id: 'h2', action: 'restore', description: 'Restore requested', performedBy: 'editor@kami-sama.io', timestamp: '2025-12-19T09:00:00Z' },
    ],
    qualityIndicators: [],
    checksum: '',
    copyright: '© MAPPA',
    author: '',
    externalIds: { tmdb: '55555' },
    isDuplicate: false,
    importedAt: '2025-11-01',
    updatedAt: '2025-12-18',
    createdAt: '2025-11-01',
  },
  {
    id: 'poster-012',
    title: 'Oshi no Ko Season 2',
    slug: 'oshi-no-ko-s2',
    url: '/posters/oshi-no-ko-s2.jpg',
    thumbnailUrl: '/posters/thumbs/oshi-no-ko-s2.jpg',
    mediaType: 'anime',
    resolution: '480p',
    format: 'png',
    width: 480,
    height: 720,
    sizeBytes: 234_567,
    aspectRatio: '2:3',
    colorProfile: 'sRGB IEC61966-2.1',
    language: 'en',
    source: 'generated',
    provider: 'AI Generated',
    status: 'unused',
    usageCount: 0,
    usedBy: [],
    versions: [
      { id: 'v1', label: 'Original', language: 'en', resolution: '480p', format: 'png', width: 480, height: 720, sizeBytes: 234_567, url: '/posters/oshi-no-ko-s2.jpg', isOriginal: true },
    ],
    metadata: {
      dpi: 72,
      bitsPerChannel: 8,
      hasAlpha: false,
      isInterlaced: false,
      gamma: 2.2,
    },
    history: [
      { id: 'h1', action: 'upload', description: 'AI-generated placeholder', performedBy: 'system', timestamp: '2025-10-01T12:00:00Z' },
    ],
    qualityIndicators: ['low_resolution'],
    checksum: 'sha256:ccddeeff012345678901234567890abcdef01234567',
    copyright: '© Doga Kobo',
    author: 'AI Generator',
    externalIds: {},
    isDuplicate: false,
    importedAt: '2025-10-01',
    updatedAt: '2025-10-01',
    createdAt: '2025-10-01',
  },
]

export const MOCK_POSTER_CHARTS: PosterChart[] = [
  {
    id: 'chart-storage',
    title: 'Storage by Type',
    type: 'donut',
    data: [
      { label: 'Anime', value: 45, color: '#3b82f6' },
      { label: 'Movie', value: 30, color: '#8b5cf6' },
      { label: 'Series', value: 25, color: '#22c55e' },
    ],
  },
  {
    id: 'chart-formats',
    title: 'Formats',
    type: 'bar',
    data: [
      { label: 'JPG', value: 48 },
      { label: 'PNG', value: 28 },
      { label: 'WebP', value: 18 },
      { label: 'AVIF', value: 6 },
    ],
  },
  {
    id: 'chart-uploads',
    title: 'Uploads Over Time',
    type: 'line',
    data: [
      { label: 'Jul', value: 120 },
      { label: 'Aug', value: 185 },
      { label: 'Sep', value: 142 },
      { label: 'Oct', value: 198 },
      { label: 'Nov', value: 267 },
      { label: 'Dec', value: 312 },
    ],
  },
]

export const MOCK_POSTER_SETTINGS: PosterSettings = {
  maxUploadSizeMB: 50,
  allowedFormats: ['jpg', 'png', 'webp', 'avif'],
  autoOptimize: true,
  generateThumbnails: true,
  thumbnailSize: 300,
  requireApproval: false,
  duplicateDetection: true,
  autoCleanupUnused: false,
  unusedDaysThreshold: 90,
  compressionQuality: 85,
}

export function getPosterStats(posters: Poster[]): PosterStats {
  const totalPosters = posters.length
  const totalStorageBytes = posters.reduce((sum, p) => sum + p.sizeBytes, 0)
  const unusedPosters = posters.filter((p) => p.status === 'unused').length
  const missingPosters = posters.filter((p) => p.status === 'missing').length
  const activePosters = posters.filter((p) => p.status === 'active').length
  const duplicatePosters = posters.filter((p) => p.isDuplicate).length
  const byMediaType: Record<PosterMediaType, number> = { anime: 0, movie: 0, series: 0 }
  const byResolution: Record<PosterResolution, number> = { '4k': 0, '1080p': 0, '720p': 0, '480p': 0, 'sd': 0 }
  const byFormat: Record<PosterFormat, number> = { jpg: 0, png: 0, webp: 0, avif: 0 }
  for (const p of posters) {
    byMediaType[p.mediaType]++
    byResolution[p.resolution]++
    byFormat[p.format]++
  }
  return {
    totalPosters,
    totalStorageBytes,
    unusedPosters,
    missingPosters,
    activePosters,
    duplicatePosters,
    byMediaType,
    byResolution,
    byFormat,
  }
}
