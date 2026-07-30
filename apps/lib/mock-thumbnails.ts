export type ThumbnailMediaType = 'episode' | 'season' | 'series' | 'movie'
export type ThumbnailResolution = '4k' | '1080p' | '720p' | '480p' | 'sd'
export type ThumbnailFormat = 'jpg' | 'png' | 'webp'
export type ThumbnailStatus = 'active' | 'unused' | 'missing' | 'duplicate'
export type ThumbnailSource = 'tmdb' | 'anilist' | 'fanart' | 'plex' | 'manual'
export type ThumbnailLanguage = 'en' | 'ja' | 'fr' | 'es' | 'de' | 'pt' | 'ko' | 'zh'

export interface ThumbnailVersion {
  id: string
  label: string
  language: ThumbnailLanguage
  width: number
  height: number
  sizeBytes: number
  format: ThumbnailFormat
  isOriginal: boolean
}

export interface ThumbnailUsage {
  id: string
  type: string
  name: string
  url: string
}

export interface ThumbnailHistoryEntry {
  id: string
  action: 'upload' | 'replace' | 'modify' | 'optimize' | 'delete' | 'restore'
  description: string
  details?: string
  performedBy: string
  timestamp: string
}

export interface Thumbnail {
  id: string
  title: string
  mediaType: ThumbnailMediaType
  resolution: ThumbnailResolution
  format: ThumbnailFormat
  width: number
  height: number
  sizeBytes: number
  aspectRatio: string
  source: ThumbnailSource
  language: ThumbnailLanguage
  status: ThumbnailStatus
  usageCount: number
  usedBy: ThumbnailUsage[]
  versions: ThumbnailVersion[]
  history: ThumbnailHistoryEntry[]
  qualityIndicators: string[]
  importedAt: string
  updatedAt: string
  url: string
  thumbnailUrl: string
  checksum?: string
  colorProfile?: string
  provider: string
  author?: string
  copyright: string
  isDuplicate: boolean
  metadata: {
    dpi: number
    bitsPerChannel: number
    hasAlpha: boolean
    software?: string
    gamma: number
  }
  externalIds: Record<string, string>
}

export type ThumbnailMediaTypeLabel = Record<ThumbnailMediaType, string>
export type ThumbnailResolutionLabel = Record<ThumbnailResolution, string>
export type ThumbnailResolutionTone = Record<ThumbnailResolution, 'success' | 'info' | 'warning' | 'destructive' | 'neutral'>
export type ThumbnailStatusLabel = Record<ThumbnailStatus, string>
export type ThumbnailStatusTone = Record<ThumbnailStatus, 'success' | 'info' | 'warning' | 'destructive' | 'neutral'>
export type ThumbnailSourceLabel = Record<ThumbnailSource, string>
export type ThumbnailLanguageLabel = Record<ThumbnailLanguage, string>
export type QualityLabel = Record<string, string>

export const THUMBNAIL_MEDIA_TYPES: ThumbnailMediaType[] = ['episode', 'season', 'series', 'movie']
export const THUMBNAIL_MEDIA_TYPE_LABEL: ThumbnailMediaTypeLabel = {
  episode: 'Episode',
  season: 'Season',
  series: 'Series',
  movie: 'Movie',
}

export const THUMBNAIL_RESOLUTIONS: ThumbnailResolution[] = ['4k', '1080p', '720p', '480p', 'sd']
export const THUMBNAIL_RESOLUTION_LABEL: ThumbnailResolutionLabel = {
  '4k': '4K UHD',
  '1080p': '1080p',
  '720p': '720p',
  '480p': '480p',
  sd: 'SD',
}
export const THUMBNAIL_RESOLUTION_TONE: ThumbnailResolutionTone = {
  '4k': 'success',
  '1080p': 'info',
  '720p': 'info',
  '480p': 'warning',
  sd: 'destructive',
}

export const THUMBNAIL_FORMATS: ThumbnailFormat[] = ['jpg', 'png', 'webp']

export const THUMBNAIL_STATUSES: ThumbnailStatus[] = ['active', 'unused', 'missing', 'duplicate']
export const THUMBNAIL_STATUS_LABEL: ThumbnailStatusLabel = {
  active: 'Active',
  unused: 'Unused',
  missing: 'Missing',
  duplicate: 'Duplicate',
}
export const THUMBNAIL_STATUS_TONE: ThumbnailStatusTone = {
  active: 'success',
  unused: 'warning',
  missing: 'destructive',
  duplicate: 'info',
}

export const THUMBNAIL_SOURCES: ThumbnailSource[] = ['tmdb', 'anilist', 'fanart', 'plex', 'manual']
export const THUMBNAIL_SOURCE_LABEL: ThumbnailSourceLabel = {
  tmdb: 'TMDB',
  anilist: 'AniList',
  fanart: 'Fanart.tv',
  plex: 'Plex',
  manual: 'Manual',
}

export const THUMBNAIL_LANGUAGES: ThumbnailLanguage[] = ['en', 'ja', 'fr', 'es', 'de', 'pt', 'ko', 'zh']
export const THUMBNAIL_LANGUAGE_LABEL: ThumbnailLanguageLabel = {
  en: 'English',
  ja: 'Japanese',
  fr: 'French',
  es: 'Spanish',
  de: 'German',
  pt: 'Portuguese',
  ko: 'Korean',
  zh: 'Chinese',
}

export const QUALITY_LABEL: QualityLabel = {
  hq: 'High Quality',
  hq2x: 'Upscaled 2x',
  lossless: 'Lossless',
  hdr: 'HDR',
  sdr: 'SDR',
}

export type QualityTone = 'success' | 'info' | 'warning' | 'destructive' | 'neutral'

export const QUALITY_TONE: Record<string, QualityTone> = {
  hq: 'success',
  hq2x: 'success',
  lossless: 'success',
  hdr: 'info',
  sdr: 'info',
}

export const IMPORT_SOURCES: ThumbnailSource[] = ['tmdb', 'anilist', 'fanart']
export const IMPORT_SOURCE_LABEL: Record<ThumbnailSource, string> = {
  tmdb: 'TMDB',
  anilist: 'AniList',
  fanart: 'Fanart.tv',
  plex: 'Plex',
  manual: 'Manual',
}

export type ImportSource = ThumbnailSource

export interface ThumbnailSettings {
  maxUploadSizeMB: number
  autoOptimize: boolean
  generateThumbnails: boolean
  thumbnailSize: number
  compressionQuality: number
  duplicateDetection: boolean
  autoCleanupUnused: boolean
  unusedDaysThreshold: number
}

export const MOCK_THUMBNAIL_SETTINGS: ThumbnailSettings = {
  maxUploadSizeMB: 10,
  autoOptimize: true,
  generateThumbnails: true,
  thumbnailSize: 300,
  compressionQuality: 85,
  duplicateDetection: true,
  autoCleanupUnused: false,
  unusedDaysThreshold: 90,
}

export interface ImportPreview {
  id: string
  source: ThumbnailSource
  title: string
  url: string
  thumbnailUrl: string
  resolution: ThumbnailResolution
  format: ThumbnailFormat
  width: number
  height: number
  sizeBytes: number
  language: ThumbnailLanguage
  alreadyExists: boolean
  selected: boolean
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export function formatNumber(n: number): string {
  return n.toLocaleString()
}

export const MOCK_THUMBNAILS: Thumbnail[] = [
  {
    id: 'thumb-1',
    title: 'Solo Leveling S2 E1',
    mediaType: 'episode',
    resolution: '4k',
    format: 'jpg',
    width: 1920,
    height: 1080,
    sizeBytes: 850_000,
    aspectRatio: '16:9',
    source: 'tmdb',
    language: 'en',
    status: 'active',
    usageCount: 12,
    usedBy: [
      { id: 'u-1', type: 'anime', name: 'Solo Leveling Season 2', url: '/anime/solo-leveling-s2' },
      { id: 'u-2', type: 'episode', name: 'E1: The Shadow Monarch', url: '/anime/solo-leveling-s2/e1' },
      { id: 'u-3', type: 'carousel', name: 'Trending Now', url: '/discover' },
    ],
    versions: [
      { id: 'v-1', label: 'Original', language: 'en', width: 1920, height: 1080, sizeBytes: 850_000, format: 'jpg', isOriginal: true },
      { id: 'v-2', label: 'Japanese', language: 'ja', width: 1920, height: 1080, sizeBytes: 820_000, format: 'jpg', isOriginal: false },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded original thumbnail', performedBy: 'admin', timestamp: '2025-07-15T10:30:00Z' },
      { id: 'h-2', action: 'optimize', description: 'Auto-optimized to WebP', performedBy: 'system', timestamp: '2025-07-15T10:31:00Z' },
    ],
    qualityIndicators: ['hq', 'lossless'],
    importedAt: '2025-07-15',
    updatedAt: '2025-07-20',
    url: '/thumbnails/solo-leveling-s2-e1.jpg',
    thumbnailUrl: '/thumbnails/thumbs/solo-leveling-s2-e1.jpg',
    checksum: 'a1b2c3d4e5f6g7h8i9j0',
    colorProfile: 'sRGB',
    provider: 'TMDB',
    copyright: '© A-1 Pictures',
    isDuplicate: false,
    metadata: { dpi: 72, bitsPerChannel: 8, hasAlpha: false, software: 'Adobe Photoshop', gamma: 2.2 },
    externalIds: { tmdb: '123456', anilist: '789012' },
  },
  {
    id: 'thumb-2',
    title: 'Chainsaw Man Part 2 E1',
    mediaType: 'episode',
    resolution: '4k',
    format: 'webp',
    width: 1920,
    height: 1080,
    sizeBytes: 720_000,
    aspectRatio: '16:9',
    source: 'fanart',
    language: 'en',
    status: 'active',
    usageCount: 8,
    usedBy: [
      { id: 'u-1', type: 'anime', name: 'Chainsaw Man Part 2', url: '/anime/chainsaw-man-p2' },
    ],
    versions: [
      { id: 'v-1', label: 'Original', language: 'en', width: 1920, height: 1080, sizeBytes: 720_000, format: 'webp', isOriginal: true },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded from Fanart.tv', performedBy: 'admin', timestamp: '2025-07-10T14:20:00Z' },
    ],
    qualityIndicators: ['hq'],
    importedAt: '2025-07-10',
    updatedAt: '2025-07-18',
    url: '/thumbnails/chainsaw-man-p2-e1.jpg',
    thumbnailUrl: '/thumbnails/thumbs/chainsaw-man-p2-e1.jpg',
    provider: 'Fanart.tv',
    copyright: '© MAPPA',
    isDuplicate: false,
    metadata: { dpi: 72, bitsPerChannel: 8, hasAlpha: false, gamma: 2.2 },
    externalIds: { fanart: 'fanart-123' },
  },
  {
    id: 'thumb-3',
    title: 'Frieren S2 E1',
    mediaType: 'episode',
    resolution: '1080p',
    format: 'png',
    width: 1920,
    height: 1080,
    sizeBytes: 1_200_000,
    aspectRatio: '16:9',
    source: 'anilist',
    language: 'ja',
    status: 'active',
    usageCount: 15,
    usedBy: [
      { id: 'u-1', type: 'anime', name: 'Frieren: Beyond Journey\'s End S2', url: '/anime/frieren-s2' },
      { id: 'u-2', type: 'episode', name: 'E1: The Beginning of the Journey', url: '/anime/frieren-s2/e1' },
    ],
    versions: [
      { id: 'v-1', label: 'Japanese', language: 'ja', width: 1920, height: 1080, sizeBytes: 1_200_000, format: 'png', isOriginal: true },
      { id: 'v-2', label: 'English', language: 'en', width: 1920, height: 1080, sizeBytes: 950_000, format: 'jpg', isOriginal: false },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded from AniList', performedBy: 'admin', timestamp: '2025-07-08T09:15:00Z' },
      { id: 'h-2', action: 'replace', description: 'Replaced with higher quality version', performedBy: 'admin', timestamp: '2025-07-12T16:45:00Z' },
    ],
    qualityIndicators: ['hq', 'hq2x'],
    importedAt: '2025-07-08',
    updatedAt: '2025-07-22',
    url: '/thumbnails/frieren-s2-e1.png',
    thumbnailUrl: '/thumbnails/thumbs/frieren-s2-e1.png',
    checksum: 'f6g7h8i9j0k1l2m3n4o5',
    colorProfile: 'Display P3',
    provider: 'AniList',
    copyright: '© Madhouse',
    isDuplicate: false,
    metadata: { dpi: 144, bitsPerChannel: 10, hasAlpha: true, software: 'Figma', gamma: 2.4 },
    externalIds: { anilist: '153556', mal: '167845' },
  },
  {
    id: 'thumb-4',
    title: 'Demon Slayer Infinity Castle',
    mediaType: 'movie',
    resolution: '4k',
    format: 'jpg',
    width: 1920,
    height: 1080,
    sizeBytes: 980_000,
    aspectRatio: '16:9',
    source: 'tmdb',
    language: 'en',
    status: 'active',
    usageCount: 20,
    usedBy: [
      { id: 'u-1', type: 'anime', name: 'Demon Slayer: Infinity Castle', url: '/anime/demon-slayer-ic' },
      { id: 'u-2', type: 'carousel', name: 'Popular This Season', url: '/discover' },
    ],
    versions: [
      { id: 'v-1', label: 'Original', language: 'en', width: 1920, height: 1080, sizeBytes: 980_000, format: 'jpg', isOriginal: true },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded from TMDB', performedBy: 'admin', timestamp: '2025-07-05T11:00:00Z' },
    ],
    qualityIndicators: ['hq', 'hdr'],
    importedAt: '2025-07-05',
    updatedAt: '2025-07-19',
    url: '/thumbnails/demon-slayer-ic.jpg',
    thumbnailUrl: '/thumbnails/thumbs/demon-slayer-ic.jpg',
    provider: 'TMDB',
    copyright: '© Ufotable',
    isDuplicate: false,
    metadata: { dpi: 72, bitsPerChannel: 10, hasAlpha: false, gamma: 2.2 },
    externalIds: { tmdb: '987654' },
  },
  {
    id: 'thumb-5',
    title: 'Dandadan E1',
    mediaType: 'episode',
    resolution: '1080p',
    format: 'jpg',
    width: 1920,
    height: 1080,
    sizeBytes: 680_000,
    aspectRatio: '16:9',
    source: 'tmdb',
    language: 'en',
    status: 'active',
    usageCount: 6,
    usedBy: [
      { id: 'u-1', type: 'anime', name: 'Dandadan', url: '/anime/dandadan' },
    ],
    versions: [
      { id: 'v-1', label: 'Original', language: 'en', width: 1920, height: 1080, sizeBytes: 680_000, format: 'jpg', isOriginal: true },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded from TMDB', performedBy: 'admin', timestamp: '2025-07-01T08:30:00Z' },
    ],
    qualityIndicators: ['hq'],
    importedAt: '2025-07-01',
    updatedAt: '2025-07-15',
    url: '/thumbnails/dandadan-e1.jpg',
    thumbnailUrl: '/thumbnails/thumbs/dandadan-e1.jpg',
    provider: 'TMDB',
    copyright: '© Science SARU',
    isDuplicate: false,
    metadata: { dpi: 72, bitsPerChannel: 8, hasAlpha: false, gamma: 2.2 },
    externalIds: { tmdb: '111222' },
  },
  {
    id: 'thumb-6',
    title: 'One Piece E1100',
    mediaType: 'episode',
    resolution: '720p',
    format: 'jpg',
    width: 1280,
    height: 720,
    sizeBytes: 450_000,
    aspectRatio: '16:9',
    source: 'plex',
    language: 'en',
    status: 'unused',
    usageCount: 0,
    usedBy: [],
    versions: [
      { id: 'v-1', label: 'Original', language: 'en', width: 1280, height: 720, sizeBytes: 450_000, format: 'jpg', isOriginal: true },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Synced from Plex', performedBy: 'system', timestamp: '2025-06-28T12:00:00Z' },
    ],
    qualityIndicators: [],
    importedAt: '2025-06-28',
    updatedAt: '2025-06-28',
    url: '/thumbnails/one-piece-e1100.jpg',
    thumbnailUrl: '/thumbnails/thumbs/one-piece-e1100.jpg',
    provider: 'Plex',
    copyright: '© Toei Animation',
    isDuplicate: false,
    metadata: { dpi: 72, bitsPerChannel: 8, hasAlpha: false, gamma: 2.2 },
    externalIds: { plex: 'plex-123' },
  },
  {
    id: 'thumb-7',
    title: 'Spy x Family Code: White',
    mediaType: 'movie',
    resolution: '4k',
    format: 'webp',
    width: 1920,
    height: 1080,
    sizeBytes: 780_000,
    aspectRatio: '16:9',
    source: 'fanart',
    language: 'fr',
    status: 'active',
    usageCount: 10,
    usedBy: [
      { id: 'u-1', type: 'anime', name: 'Spy x Family Code: White', url: '/anime/spy-family-cw' },
    ],
    versions: [
      { id: 'v-1', label: 'French', language: 'fr', width: 1920, height: 1080, sizeBytes: 780_000, format: 'webp', isOriginal: true },
      { id: 'v-2', label: 'English', language: 'en', width: 1920, height: 1080, sizeBytes: 750_000, format: 'webp', isOriginal: false },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded from Fanart.tv', performedBy: 'admin', timestamp: '2025-06-25T15:30:00Z' },
    ],
    qualityIndicators: ['hq'],
    importedAt: '2025-06-25',
    updatedAt: '2025-07-10',
    url: '/thumbnails/spy-family-cw.jpg',
    thumbnailUrl: '/thumbnails/thumbs/spy-family-cw.jpg',
    provider: 'Fanart.tv',
    copyright: '© WIT Studio',
    isDuplicate: false,
    metadata: { dpi: 72, bitsPerChannel: 8, hasAlpha: false, gamma: 2.2 },
    externalIds: { fanart: 'fanart-456' },
  },
  {
    id: 'thumb-8',
    title: 'Attack on Titan Final Season',
    mediaType: 'series',
    resolution: '1080p',
    format: 'jpg',
    width: 1920,
    height: 1080,
    sizeBytes: 890_000,
    aspectRatio: '16:9',
    source: 'tmdb',
    language: 'en',
    status: 'active',
    usageCount: 25,
    usedBy: [
      { id: 'u-1', type: 'anime', name: 'Attack on Titan Final Season', url: '/anime/aot-final' },
      { id: 'u-2', type: 'carousel', name: 'Classics', url: '/collections' },
    ],
    versions: [
      { id: 'v-1', label: 'Original', language: 'en', width: 1920, height: 1080, sizeBytes: 890_000, format: 'jpg', isOriginal: true },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded from TMDB', performedBy: 'admin', timestamp: '2025-06-20T10:00:00Z' },
    ],
    qualityIndicators: ['hq', 'lossless'],
    importedAt: '2025-06-20',
    updatedAt: '2025-07-05',
    url: '/thumbnails/aot-final.jpg',
    thumbnailUrl: '/thumbnails/thumbs/aot-final.jpg',
    checksum: 'k1l2m3n4o5p6q7r8s9t0',
    colorProfile: 'sRGB',
    provider: 'TMDB',
    copyright: '© MAPPA',
    isDuplicate: false,
    metadata: { dpi: 72, bitsPerChannel: 8, hasAlpha: false, gamma: 2.2 },
    externalIds: { tmdb: '333444', mal: '555666' },
  },
  {
    id: 'thumb-9',
    title: 'Solo Leveling S2 E1 (Dup)',
    mediaType: 'episode',
    resolution: '4k',
    format: 'jpg',
    width: 1920,
    height: 1080,
    sizeBytes: 850_000,
    aspectRatio: '16:9',
    source: 'tmdb',
    language: 'en',
    status: 'duplicate',
    usageCount: 0,
    usedBy: [],
    versions: [
      { id: 'v-1', label: 'Original', language: 'en', width: 1920, height: 1080, sizeBytes: 850_000, format: 'jpg', isOriginal: true },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Duplicate detected', performedBy: 'system', timestamp: '2025-07-15T11:00:00Z' },
    ],
    qualityIndicators: [],
    importedAt: '2025-07-15',
    updatedAt: '2025-07-15',
    url: '/thumbnails/solo-leveling-s2-e1-dup.jpg',
    thumbnailUrl: '/thumbnails/thumbs/solo-leveling-s2-e1-dup.jpg',
    provider: 'TMDB',
    copyright: '© A-1 Pictures',
    isDuplicate: true,
    metadata: { dpi: 72, bitsPerChannel: 8, hasAlpha: false, gamma: 2.2 },
    externalIds: { tmdb: '123456' },
  },
  {
    id: 'thumb-10',
    title: 'Oshi no Ko S2 E1',
    mediaType: 'episode',
    resolution: '1080p',
    format: 'png',
    width: 1920,
    height: 1080,
    sizeBytes: 1_100_000,
    aspectRatio: '16:9',
    source: 'anilist',
    language: 'ja',
    status: 'active',
    usageCount: 9,
    usedBy: [
      { id: 'u-1', type: 'anime', name: 'Oshi no Ko Season 2', url: '/anime/oshi-no-ko-s2' },
    ],
    versions: [
      { id: 'v-1', label: 'Japanese', language: 'ja', width: 1920, height: 1080, sizeBytes: 1_100_000, format: 'png', isOriginal: true },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded from AniList', performedBy: 'admin', timestamp: '2025-07-18T13:45:00Z' },
    ],
    qualityIndicators: ['hq'],
    importedAt: '2025-07-18',
    updatedAt: '2025-07-25',
    url: '/thumbnails/oshi-no-ko-s2-e1.png',
    thumbnailUrl: '/thumbnails/thumbs/oshi-no-ko-s2-e1.png',
    provider: 'AniList',
    copyright: '© Doga Kobo',
    isDuplicate: false,
    metadata: { dpi: 144, bitsPerChannel: 10, hasAlpha: true, gamma: 2.4 },
    externalIds: { anilist: '168456' },
  },
]

export const MOCK_THUMBNAIL_CHARTS = {
  storageOverTime: [
    { date: '2025-06', value: 2_500_000 },
    { date: '2025-07', value: 8_700_000 },
  ],
  resolutionDistribution: [
    { resolution: '4k', count: 4 },
    { resolution: '1080p', count: 4 },
    { resolution: '720p', count: 1 },
    { resolution: '480p', count: 0 },
    { resolution: 'sd', count: 0 },
  ],
}
