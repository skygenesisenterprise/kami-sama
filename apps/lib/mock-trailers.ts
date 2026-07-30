export type TrailerMediaType = 'episode' | 'season' | 'series' | 'movie'
export type TrailerResolution = '4k' | '1080p' | '720p' | '480p' | 'sd'
export type TrailerFormat = 'mp4' | 'webm' | 'mkv' | 'avi'
export type TrailerStatus = 'active' | 'unused' | 'missing' | 'duplicate'
export type TrailerSource = 'tmdb' | 'anilist' | 'youtube' | 'vimeo' | 'manual'
export type TrailerLanguage = 'en' | 'ja' | 'fr' | 'es' | 'de' | 'pt' | 'ko' | 'zh'

export interface TrailerVersion {
  id: string
  label: string
  language: TrailerLanguage
  width: number
  height: number
  sizeBytes: number
  format: TrailerFormat
  isOriginal: boolean
  durationSeconds: number
}

export interface TrailerUsage {
  id: string
  type: string
  name: string
  url: string
}

export interface TrailerHistoryEntry {
  id: string
  action: 'upload' | 'replace' | 'modify' | 'optimize' | 'delete' | 'restore'
  description: string
  details?: string
  performedBy: string
  timestamp: string
}

export interface Trailer {
  id: string
  title: string
  mediaType: TrailerMediaType
  resolution: TrailerResolution
  format: TrailerFormat
  width: number
  height: number
  sizeBytes: number
  aspectRatio: string
  source: TrailerSource
  language: TrailerLanguage
  status: TrailerStatus
  usageCount: number
  usedBy: TrailerUsage[]
  versions: TrailerVersion[]
  history: TrailerHistoryEntry[]
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
  durationSeconds: number
  metadata: {
    dpi: number
    bitsPerChannel: number
    hasAlpha: boolean
    software?: string
    gamma: number
    fps: number
    bitrate: number
    codec: string
  }
  externalIds: Record<string, string>
}

export type TrailerMediaTypeLabel = Record<TrailerMediaType, string>
export type TrailerResolutionLabel = Record<TrailerResolution, string>
export type TrailerResolutionTone = Record<TrailerResolution, 'success' | 'info' | 'warning' | 'destructive' | 'neutral'>
export type TrailerStatusLabel = Record<TrailerStatus, string>
export type TrailerStatusTone = Record<TrailerStatus, 'success' | 'info' | 'warning' | 'destructive' | 'neutral'>
export type TrailerSourceLabel = Record<TrailerSource, string>
export type TrailerLanguageLabel = Record<TrailerLanguage, string>
export type QualityLabel = Record<string, string>

export const TRAILER_MEDIA_TYPES: TrailerMediaType[] = ['episode', 'season', 'series', 'movie']
export const TRAILER_MEDIA_TYPE_LABEL: TrailerMediaTypeLabel = {
  episode: 'Episode',
  season: 'Season',
  series: 'Series',
  movie: 'Movie',
}

export const TRAILER_RESOLUTIONS: TrailerResolution[] = ['4k', '1080p', '720p', '480p', 'sd']
export const TRAILER_RESOLUTION_LABEL: TrailerResolutionLabel = {
  '4k': '4K UHD',
  '1080p': '1080p',
  '720p': '720p',
  '480p': '480p',
  sd: 'SD',
}
export const TRAILER_RESOLUTION_TONE: TrailerResolutionTone = {
  '4k': 'success',
  '1080p': 'info',
  '720p': 'info',
  '480p': 'warning',
  sd: 'destructive',
}

export const TRAILER_FORMATS: TrailerFormat[] = ['mp4', 'webm', 'mkv', 'avi']

export const TRAILER_STATUSES: TrailerStatus[] = ['active', 'unused', 'missing', 'duplicate']
export const TRAILER_STATUS_LABEL: TrailerStatusLabel = {
  active: 'Active',
  unused: 'Unused',
  missing: 'Missing',
  duplicate: 'Duplicate',
}
export const TRAILER_STATUS_TONE: TrailerStatusTone = {
  active: 'success',
  unused: 'warning',
  missing: 'destructive',
  duplicate: 'info',
}

export const TRAILER_SOURCES: TrailerSource[] = ['tmdb', 'anilist', 'youtube', 'vimeo', 'manual']
export const TRAILER_SOURCE_LABEL: TrailerSourceLabel = {
  tmdb: 'TMDB',
  anilist: 'AniList',
  youtube: 'YouTube',
  vimeo: 'Vimeo',
  manual: 'Manual',
}

export const TRAILER_LANGUAGES: TrailerLanguage[] = ['en', 'ja', 'fr', 'es', 'de', 'pt', 'ko', 'zh']
export const TRAILER_LANGUAGE_LABEL: TrailerLanguageLabel = {
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

export const IMPORT_SOURCES: TrailerSource[] = ['tmdb', 'anilist', 'youtube']
export const IMPORT_SOURCE_LABEL: Record<TrailerSource, string> = {
  tmdb: 'TMDB',
  anilist: 'AniList',
  youtube: 'YouTube',
  vimeo: 'Vimeo',
  manual: 'Manual',
}

export type ImportSource = TrailerSource

export interface TrailerSettings {
  maxUploadSizeMB: number
  autoOptimize: boolean
  generateThumbnails: boolean
  thumbnailSize: number
  compressionQuality: number
  duplicateDetection: boolean
  autoCleanupUnused: boolean
  unusedDaysThreshold: number
  maxDurationSeconds: number
}

export const MOCK_TRAILER_SETTINGS: TrailerSettings = {
  maxUploadSizeMB: 500,
  autoOptimize: true,
  generateThumbnails: true,
  thumbnailSize: 300,
  compressionQuality: 85,
  duplicateDetection: true,
  autoCleanupUnused: false,
  unusedDaysThreshold: 90,
  maxDurationSeconds: 300,
}

export interface ImportPreview {
  id: string
  source: TrailerSource
  title: string
  url: string
  thumbnailUrl: string
  resolution: TrailerResolution
  format: TrailerFormat
  width: number
  height: number
  sizeBytes: number
  language: TrailerLanguage
  alreadyExists: boolean
  selected: boolean
  durationSeconds: number
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

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export const MOCK_TRAILERS: Trailer[] = [
  {
    id: 'trailer-1',
    title: 'Solo Leveling S2 - Official Trailer',
    mediaType: 'series',
    resolution: '4k',
    format: 'mp4',
    width: 1920,
    height: 1080,
    sizeBytes: 45_000_000,
    aspectRatio: '16:9',
    source: 'youtube',
    language: 'en',
    status: 'active',
    usageCount: 18,
    usedBy: [
      { id: 'u-1', type: 'anime', name: 'Solo Leveling Season 2', url: '/anime/solo-leveling-s2' },
      { id: 'u-2', type: 'carousel', name: 'Trending Now', url: '/discover' },
      { id: 'u-3', type: 'banner', name: 'Hero Banner', url: '/' },
    ],
    versions: [
      { id: 'v-1', label: 'Original', language: 'en', width: 1920, height: 1080, sizeBytes: 45_000_000, format: 'mp4', isOriginal: true, durationSeconds: 152 },
      { id: 'v-2', label: 'Japanese', language: 'ja', width: 1920, height: 1080, sizeBytes: 42_000_000, format: 'mp4', isOriginal: false, durationSeconds: 152 },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded from YouTube', performedBy: 'admin', timestamp: '2025-07-15T10:30:00Z' },
      { id: 'h-2', action: 'optimize', description: 'Compressed to H.265', performedBy: 'system', timestamp: '2025-07-15T10:35:00Z' },
    ],
    qualityIndicators: ['hq', 'hdr'],
    importedAt: '2025-07-15',
    updatedAt: '2025-07-20',
    url: '/trailers/solo-leveling-s2-trailer.mp4',
    thumbnailUrl: '/trailers/thumbs/solo-leveling-s2-trailer.jpg',
    checksum: 'a1b2c3d4e5f6g7h8i9j0',
    colorProfile: 'sRGB',
    provider: 'YouTube',
    copyright: '© A-1 Pictures',
    isDuplicate: false,
    durationSeconds: 152,
    metadata: { dpi: 72, bitsPerChannel: 8, hasAlpha: false, software: 'Adobe Premiere Pro', gamma: 2.2, fps: 24, bitrate: 2400, codec: 'H.265' },
    externalIds: { youtube: 'dQw4w9WgXcQ', tmdb: '123456' },
  },
  {
    id: 'trailer-2',
    title: 'Chainsaw Man Part 2 - Teaser',
    mediaType: 'series',
    resolution: '4k',
    format: 'mp4',
    width: 1920,
    height: 1080,
    sizeBytes: 38_000_000,
    aspectRatio: '16:9',
    source: 'youtube',
    language: 'en',
    status: 'active',
    usageCount: 12,
    usedBy: [
      { id: 'u-1', type: 'anime', name: 'Chainsaw Man Part 2', url: '/anime/chainsaw-man-p2' },
    ],
    versions: [
      { id: 'v-1', label: 'Original', language: 'en', width: 1920, height: 1080, sizeBytes: 38_000_000, format: 'mp4', isOriginal: true, durationSeconds: 90 },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded from YouTube', performedBy: 'admin', timestamp: '2025-07-10T14:20:00Z' },
    ],
    qualityIndicators: ['hq'],
    importedAt: '2025-07-10',
    updatedAt: '2025-07-18',
    url: '/trailers/chainsaw-man-p2-teaser.mp4',
    thumbnailUrl: '/trailers/thumbs/chainsaw-man-p2-teaser.jpg',
    provider: 'YouTube',
    copyright: '© MAPPA',
    isDuplicate: false,
    durationSeconds: 90,
    metadata: { dpi: 72, bitsPerChannel: 8, hasAlpha: false, gamma: 2.2, fps: 24, bitrate: 2000, codec: 'H.264' },
    externalIds: { youtube: 'abc123def456' },
  },
  {
    id: 'trailer-3',
    title: 'Frieren S2 - Announcement Trailer',
    mediaType: 'series',
    resolution: '1080p',
    format: 'webm',
    width: 1920,
    height: 1080,
    sizeBytes: 32_000_000,
    aspectRatio: '16:9',
    source: 'anilist',
    language: 'ja',
    status: 'active',
    usageCount: 15,
    usedBy: [
      { id: 'u-1', type: 'anime', name: 'Frieren: Beyond Journey\'s End S2', url: '/anime/frieren-s2' },
      { id: 'u-2', type: 'carousel', name: 'Coming Soon', url: '/discover' },
    ],
    versions: [
      { id: 'v-1', label: 'Japanese', language: 'ja', width: 1920, height: 1080, sizeBytes: 32_000_000, format: 'webm', isOriginal: true, durationSeconds: 120 },
      { id: 'v-2', label: 'English', language: 'en', width: 1920, height: 1080, sizeBytes: 30_000_000, format: 'mp4', isOriginal: false, durationSeconds: 120 },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded from AniList', performedBy: 'admin', timestamp: '2025-07-08T09:15:00Z' },
      { id: 'h-2', action: 'replace', description: 'Replaced with higher quality version', performedBy: 'admin', timestamp: '2025-07-12T16:45:00Z' },
    ],
    qualityIndicators: ['hq', 'lossless'],
    importedAt: '2025-07-08',
    updatedAt: '2025-07-22',
    url: '/trailers/frieren-s2-announcement.webm',
    thumbnailUrl: '/trailers/thumbs/frieren-s2-announcement.jpg',
    checksum: 'f6g7h8i9j0k1l2m3n4o5',
    colorProfile: 'Display P3',
    provider: 'AniList',
    copyright: '© Madhouse',
    isDuplicate: false,
    durationSeconds: 120,
    metadata: { dpi: 144, bitsPerChannel: 10, hasAlpha: false, software: 'DaVinci Resolve', gamma: 2.4, fps: 30, bitrate: 2100, codec: 'VP9' },
    externalIds: { anilist: '153556', mal: '167845' },
  },
  {
    id: 'trailer-4',
    title: 'Demon Slayer Infinity Castle - Official Trailer',
    mediaType: 'movie',
    resolution: '4k',
    format: 'mp4',
    width: 3840,
    height: 2160,
    sizeBytes: 120_000_000,
    aspectRatio: '16:9',
    source: 'tmdb',
    language: 'en',
    status: 'active',
    usageCount: 25,
    usedBy: [
      { id: 'u-1', type: 'anime', name: 'Demon Slayer: Infinity Castle', url: '/anime/demon-slayer-ic' },
      { id: 'u-2', type: 'carousel', name: 'Popular This Season', url: '/discover' },
      { id: 'u-3', type: 'banner', name: 'Hero Banner', url: '/' },
    ],
    versions: [
      { id: 'v-1', label: 'Original', language: 'en', width: 3840, height: 2160, sizeBytes: 120_000_000, format: 'mp4', isOriginal: true, durationSeconds: 180 },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded from TMDB', performedBy: 'admin', timestamp: '2025-07-05T11:00:00Z' },
    ],
    qualityIndicators: ['hq', 'hdr', 'hq2x'],
    importedAt: '2025-07-05',
    updatedAt: '2025-07-19',
    url: '/trailers/demon-slayer-ic-official.mp4',
    thumbnailUrl: '/trailers/thumbs/demon-slayer-ic-official.jpg',
    provider: 'TMDB',
    copyright: '© Ufotable',
    isDuplicate: false,
    durationSeconds: 180,
    metadata: { dpi: 72, bitsPerChannel: 10, hasAlpha: false, gamma: 2.2, fps: 24, bitrate: 5000, codec: 'H.265' },
    externalIds: { tmdb: '987654' },
  },
  {
    id: 'trailer-5',
    title: 'Dandadan - PV 2',
    mediaType: 'series',
    resolution: '1080p',
    format: 'mp4',
    width: 1920,
    height: 1080,
    sizeBytes: 28_000_000,
    aspectRatio: '16:9',
    source: 'youtube',
    language: 'en',
    status: 'active',
    usageCount: 8,
    usedBy: [
      { id: 'u-1', type: 'anime', name: 'Dandadan', url: '/anime/dandadan' },
    ],
    versions: [
      { id: 'v-1', label: 'Original', language: 'en', width: 1920, height: 1080, sizeBytes: 28_000_000, format: 'mp4', isOriginal: true, durationSeconds: 135 },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded from YouTube', performedBy: 'admin', timestamp: '2025-07-01T08:30:00Z' },
    ],
    qualityIndicators: ['hq'],
    importedAt: '2025-07-01',
    updatedAt: '2025-07-15',
    url: '/trailers/dandadan-pv2.mp4',
    thumbnailUrl: '/trailers/thumbs/dandadan-pv2.jpg',
    provider: 'YouTube',
    copyright: '© Science SARU',
    isDuplicate: false,
    durationSeconds: 135,
    metadata: { dpi: 72, bitsPerChannel: 8, hasAlpha: false, gamma: 2.2, fps: 24, bitrate: 1800, codec: 'H.264' },
    externalIds: { youtube: 'xyz789abc123' },
  },
  {
    id: 'trailer-6',
    title: 'One Piece Film: Red - Legacy Trailer',
    mediaType: 'movie',
    resolution: '720p',
    format: 'mp4',
    width: 1280,
    height: 720,
    sizeBytes: 18_000_000,
    aspectRatio: '16:9',
    source: 'manual',
    language: 'en',
    status: 'unused',
    usageCount: 0,
    usedBy: [],
    versions: [
      { id: 'v-1', label: 'Original', language: 'en', width: 1280, height: 720, sizeBytes: 18_000_000, format: 'mp4', isOriginal: true, durationSeconds: 145 },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded manually', performedBy: 'admin', timestamp: '2025-06-28T12:00:00Z' },
    ],
    qualityIndicators: [],
    importedAt: '2025-06-28',
    updatedAt: '2025-06-28',
    url: '/trailers/one-piece-red-legacy.mp4',
    thumbnailUrl: '/trailers/thumbs/one-piece-red-legacy.jpg',
    provider: 'Manual',
    copyright: '© Toei Animation',
    isDuplicate: false,
    durationSeconds: 145,
    metadata: { dpi: 72, bitsPerChannel: 8, hasAlpha: false, gamma: 2.2, fps: 24, bitrate: 1200, codec: 'H.264' },
    externalIds: {},
  },
  {
    id: 'trailer-7',
    title: 'Spy x Family Code: White - International Trailer',
    mediaType: 'movie',
    resolution: '4k',
    format: 'webm',
    width: 1920,
    height: 1080,
    sizeBytes: 42_000_000,
    aspectRatio: '16:9',
    source: 'vimeo',
    language: 'fr',
    status: 'active',
    usageCount: 10,
    usedBy: [
      { id: 'u-1', type: 'anime', name: 'Spy x Family Code: White', url: '/anime/spy-family-cw' },
    ],
    versions: [
      { id: 'v-1', label: 'French', language: 'fr', width: 1920, height: 1080, sizeBytes: 42_000_000, format: 'webm', isOriginal: true, durationSeconds: 160 },
      { id: 'v-2', label: 'English', language: 'en', width: 1920, height: 1080, sizeBytes: 40_000_000, format: 'mp4', isOriginal: false, durationSeconds: 160 },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded from Vimeo', performedBy: 'admin', timestamp: '2025-06-25T15:30:00Z' },
    ],
    qualityIndicators: ['hq'],
    importedAt: '2025-06-25',
    updatedAt: '2025-07-10',
    url: '/trailers/spy-family-cw-intl.webm',
    thumbnailUrl: '/trailers/thumbs/spy-family-cw-intl.jpg',
    provider: 'Vimeo',
    copyright: '© WIT Studio',
    isDuplicate: false,
    durationSeconds: 160,
    metadata: { dpi: 72, bitsPerChannel: 8, hasAlpha: false, gamma: 2.2, fps: 24, bitrate: 2100, codec: 'VP9' },
    externalIds: { vimeo: '123456789' },
  },
  {
    id: 'trailer-8',
    title: 'Attack on Titan Final Season - Recap',
    mediaType: 'series',
    resolution: '1080p',
    format: 'mp4',
    width: 1920,
    height: 1080,
    sizeBytes: 55_000_000,
    aspectRatio: '16:9',
    source: 'tmdb',
    language: 'en',
    status: 'active',
    usageCount: 30,
    usedBy: [
      { id: 'u-1', type: 'anime', name: 'Attack on Titan Final Season', url: '/anime/aot-final' },
      { id: 'u-2', type: 'carousel', name: 'Classics', url: '/collections' },
      { id: 'u-3', type: 'banner', name: 'Hero Banner', url: '/' },
    ],
    versions: [
      { id: 'v-1', label: 'Original', language: 'en', width: 1920, height: 1080, sizeBytes: 55_000_000, format: 'mp4', isOriginal: true, durationSeconds: 240 },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded from TMDB', performedBy: 'admin', timestamp: '2025-06-20T10:00:00Z' },
    ],
    qualityIndicators: ['hq', 'lossless'],
    importedAt: '2025-06-20',
    updatedAt: '2025-07-05',
    url: '/trailers/aot-final-recap.mp4',
    thumbnailUrl: '/trailers/thumbs/aot-final-recap.jpg',
    checksum: 'k1l2m3n4o5p6q7r8s9t0',
    colorProfile: 'sRGB',
    provider: 'TMDB',
    copyright: '© MAPPA',
    isDuplicate: false,
    durationSeconds: 240,
    metadata: { dpi: 72, bitsPerChannel: 8, hasAlpha: false, gamma: 2.2, fps: 24, bitrate: 2300, codec: 'H.264' },
    externalIds: { tmdb: '333444', mal: '555666' },
  },
  {
    id: 'trailer-9',
    title: 'Solo Leveling S2 - Official Trailer (Dup)',
    mediaType: 'series',
    resolution: '4k',
    format: 'mp4',
    width: 1920,
    height: 1080,
    sizeBytes: 45_000_000,
    aspectRatio: '16:9',
    source: 'youtube',
    language: 'en',
    status: 'duplicate',
    usageCount: 0,
    usedBy: [],
    versions: [
      { id: 'v-1', label: 'Original', language: 'en', width: 1920, height: 1080, sizeBytes: 45_000_000, format: 'mp4', isOriginal: true, durationSeconds: 152 },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Duplicate detected', performedBy: 'system', timestamp: '2025-07-15T11:00:00Z' },
    ],
    qualityIndicators: [],
    importedAt: '2025-07-15',
    updatedAt: '2025-07-15',
    url: '/trailers/solo-leveling-s2-trailer-dup.mp4',
    thumbnailUrl: '/trailers/thumbs/solo-leveling-s2-trailer-dup.jpg',
    provider: 'YouTube',
    copyright: '© A-1 Pictures',
    isDuplicate: true,
    durationSeconds: 152,
    metadata: { dpi: 72, bitsPerChannel: 8, hasAlpha: false, gamma: 2.2, fps: 24, bitrate: 2400, codec: 'H.265' },
    externalIds: { youtube: 'dQw4w9WgXcQ' },
  },
  {
    id: 'trailer-10',
    title: 'Oshi no Ko S2 - Character PV',
    mediaType: 'series',
    resolution: '1080p',
    format: 'mp4',
    width: 1920,
    height: 1080,
    sizeBytes: 25_000_000,
    aspectRatio: '16:9',
    source: 'anilist',
    language: 'ja',
    status: 'active',
    usageCount: 7,
    usedBy: [
      { id: 'u-1', type: 'anime', name: 'Oshi no Ko Season 2', url: '/anime/oshi-no-ko-s2' },
    ],
    versions: [
      { id: 'v-1', label: 'Japanese', language: 'ja', width: 1920, height: 1080, sizeBytes: 25_000_000, format: 'mp4', isOriginal: true, durationSeconds: 75 },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded from AniList', performedBy: 'admin', timestamp: '2025-07-18T13:45:00Z' },
    ],
    qualityIndicators: ['hq'],
    importedAt: '2025-07-18',
    updatedAt: '2025-07-25',
    url: '/trailers/oshi-no-ko-s2-charpv.mp4',
    thumbnailUrl: '/trailers/thumbs/oshi-no-ko-s2-charpv.jpg',
    provider: 'AniList',
    copyright: '© Doga Kobo',
    isDuplicate: false,
    durationSeconds: 75,
    metadata: { dpi: 144, bitsPerChannel: 8, hasAlpha: false, gamma: 2.4, fps: 30, bitrate: 1600, codec: 'H.264' },
    externalIds: { anilist: '168456' },
  },
]
