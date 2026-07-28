import type { StatusTone } from '@/components/dash/status-badge'

export type BackgroundMediaType = 'anime' | 'movie' | 'series' | 'generic'

export type BackgroundResolution = '4k' | '1440p' | '1080p' | '720p'

export type BackgroundFormat = 'jpg' | 'png' | 'webp' | 'avif'

export type BackgroundStatus = 'active' | 'unused' | 'missing' | 'duplicate' | 'corrupted'

export type BackgroundSource = 'tmdb' | 'anilist' | 'fanart' | 'plex' | 'jellyfin' | 'upload' | 'generated'

export type BackgroundLanguage = 'en' | 'fr' | 'ja' | 'es' | 'de' | 'pt' | 'it' | 'ko' | 'zh' | 'ar'

export type ImportSource = 'tmdb' | 'anilist' | 'fanart' | 'plex' | 'jellyfin' | 'local'

export type QualityIndicator = 'high_resolution' | 'low_resolution' | 'potential_duplicate' | 'corrupted' | 'transparent' | 'optimized' | 'hdr'

export interface Background {
  id: string
  title: string
  slug: string
  url: string
  thumbnailUrl: string
  mediaType: BackgroundMediaType
  resolution: BackgroundResolution
  format: BackgroundFormat
  width: number
  height: number
  sizeBytes: number
  aspectRatio: string
  colorProfile: string
  language: BackgroundLanguage
  source: BackgroundSource
  provider: string
  status: BackgroundStatus
  usageCount: number
  usedBy: BackgroundUsage[]
  versions: BackgroundVersion[]
  metadata: BackgroundMetadata
  history: BackgroundHistoryEntry[]
  qualityIndicators: QualityIndicator[]
  checksum: string
  copyright: string
  author: string
  externalIds: Record<string, string>
  isDuplicate: boolean
  blurHash: string
  dominantColor: string
  importedAt: string
  updatedAt: string
  createdAt: string
}

export interface BackgroundUsage {
  id: string
  type: 'series' | 'movie' | 'collection' | 'homepage' | 'discover' | 'community' | 'campaign' | 'hero'
  name: string
  url: string
}

export interface BackgroundVersion {
  id: string
  label: string
  language: BackgroundLanguage
  resolution: BackgroundResolution
  format: BackgroundFormat
  width: number
  height: number
  sizeBytes: number
  url: string
  isOriginal: boolean
}

export interface BackgroundMetadata {
  dpi: number
  bitsPerChannel: number
  hasAlpha: boolean
  isInterlaced: boolean
  gamma: number
  dateTaken?: string
  camera?: string
  software?: string
}

export interface BackgroundHistoryEntry {
  id: string
  action: 'upload' | 'replace' | 'modify' | 'optimize' | 'delete' | 'restore'
  description: string
  performedBy: string
  timestamp: string
  details?: string
}

export interface BackgroundStats {
  totalBackgrounds: number
  totalStorageBytes: number
  unusedBackgrounds: number
  missingBackgrounds: number
  activeBackgrounds: number
  duplicateBackgrounds: number
}

export interface BackgroundChart {
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

export interface BackgroundSettings {
  maxUploadSizeMB: number
  allowedFormats: BackgroundFormat[]
  autoOptimize: boolean
  generateThumbnails: boolean
  thumbnailSize: number
  requireApproval: boolean
  duplicateDetection: boolean
  autoCleanupUnused: boolean
  unusedDaysThreshold: number
  compressionQuality: number
  defaultAspectRatio: string
}

export interface ImportPreview {
  id: string
  source: ImportSource
  title: string
  url: string
  thumbnailUrl: string
  resolution: BackgroundResolution
  format: BackgroundFormat
  width: number
  height: number
  sizeBytes: number
  language: BackgroundLanguage
  alreadyExists: boolean
  selected: boolean
}

export const BACKGROUND_MEDIA_TYPES: BackgroundMediaType[] = ['anime', 'movie', 'series', 'generic']

export const BACKGROUND_MEDIA_TYPE_LABEL: Record<BackgroundMediaType, string> = {
  anime: 'Anime',
  movie: 'Movie',
  series: 'Series',
  generic: 'Generic',
}

export const BACKGROUND_RESOLUTIONS: BackgroundResolution[] = ['4k', '1440p', '1080p', '720p']

export const BACKGROUND_RESOLUTION_LABEL: Record<BackgroundResolution, string> = {
  '4k': '4K (2160p)',
  '1440p': '1440p',
  '1080p': '1080p',
  '720p': '720p',
}

export const BACKGROUND_RESOLUTION_TONE: Record<BackgroundResolution, StatusTone> = {
  '4k': 'success',
  '1440p': 'success',
  '1080p': 'info',
  '720p': 'warning',
}

export const BACKGROUND_FORMATS: BackgroundFormat[] = ['jpg', 'png', 'webp', 'avif']

export const BACKGROUND_STATUSES: BackgroundStatus[] = ['active', 'unused', 'missing', 'duplicate', 'corrupted']

export const BACKGROUND_STATUS_LABEL: Record<BackgroundStatus, string> = {
  active: 'Active',
  unused: 'Unused',
  missing: 'Missing',
  duplicate: 'Duplicate',
  corrupted: 'Corrupted',
}

export const BACKGROUND_STATUS_TONE: Record<BackgroundStatus, StatusTone> = {
  active: 'success',
  unused: 'warning',
  missing: 'destructive',
  duplicate: 'info',
  corrupted: 'destructive',
}

export const BACKGROUND_SOURCES: BackgroundSource[] = ['tmdb', 'anilist', 'fanart', 'plex', 'jellyfin', 'upload', 'generated']

export const BACKGROUND_SOURCE_LABEL: Record<BackgroundSource, string> = {
  tmdb: 'TMDB',
  anilist: 'AniList',
  fanart: 'FanArt.tv',
  plex: 'Plex',
  jellyfin: 'Jellyfin',
  upload: 'Upload',
  generated: 'Generated',
}

export const BACKGROUND_LANGUAGES: BackgroundLanguage[] = ['en', 'fr', 'ja', 'es', 'de', 'pt', 'it', 'ko', 'zh', 'ar']

export const BACKGROUND_LANGUAGE_LABEL: Record<BackgroundLanguage, string> = {
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

export const IMPORT_SOURCES: ImportSource[] = ['tmdb', 'anilist', 'fanart', 'plex', 'jellyfin', 'local']

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
  hdr: 'HDR',
}

export const QUALITY_TONE: Record<QualityIndicator, StatusTone> = {
  high_resolution: 'success',
  low_resolution: 'warning',
  potential_duplicate: 'info',
  corrupted: 'destructive',
  transparent: 'info',
  optimized: 'success',
  hdr: 'success',
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

export const MOCK_BACKGROUNDS: Background[] = [
  {
    id: 'bg-001',
    title: 'Solo Leveling Season 2 – Key Visual',
    slug: 'solo-leveling-s2-bg',
    url: '/backgrounds/solo-leveling-s2-bg.jpg',
    thumbnailUrl: '/backgrounds/thumbs/solo-leveling-s2-bg.jpg',
    mediaType: 'anime',
    resolution: '4k',
    format: 'jpg',
    width: 3840,
    height: 2160,
    sizeBytes: 8_234_567,
    aspectRatio: '16:9',
    colorProfile: 'Display P3',
    language: 'en',
    source: 'tmdb',
    provider: 'TMDB',
    status: 'active',
    usageCount: 8,
    usedBy: [
      { id: 'u1', type: 'hero', name: 'Homepage Hero Banner', url: '/home' },
      { id: 'u2', type: 'series', name: 'Solo Leveling S2 Detail', url: '/catalog/series/solo-leveling-s2' },
      { id: 'u3', type: 'discover', name: 'Trending Background', url: '/discovery/trending' },
    ],
    versions: [
      { id: 'v1', label: 'Original', language: 'en', resolution: '4k', format: 'jpg', width: 3840, height: 2160, sizeBytes: 8_234_567, url: '/backgrounds/solo-leveling-s2-bg.jpg', isOriginal: true },
      { id: 'v2', label: 'French', language: 'fr', resolution: '1080p', format: 'jpg', width: 1920, height: 1080, sizeBytes: 2_345_678, url: '/backgrounds/solo-leveling-s2-bg-fr.jpg', isOriginal: false },
      { id: 'v3', label: 'Mobile', language: 'en', resolution: '1080p', format: 'webp', width: 1080, height: 1920, sizeBytes: 1_234_567, url: '/backgrounds/solo-leveling-s2-bg-mobile.webp', isOriginal: false },
    ],
    metadata: { dpi: 72, bitsPerChannel: 8, hasAlpha: false, isInterlaced: false, gamma: 2.2, software: 'Adobe Photoshop 25.0' },
    history: [
      { id: 'h1', action: 'upload', description: 'Original background uploaded', performedBy: 'admin@kami-sama.io', timestamp: '2025-12-01T10:00:00Z' },
      { id: 'h2', action: 'optimize', description: 'Auto-optimized for web', performedBy: 'system', timestamp: '2025-12-01T10:05:00Z', details: 'Compressed from 12.1MB to 8.2MB' },
    ],
    qualityIndicators: ['high_resolution', 'optimized'],
    checksum: 'sha256:bg001a1b2c3d4e5f678901234567890abcdef',
    copyright: '© A-1 Pictures',
    author: 'Kami-Sama Editorial',
    externalIds: { tmdb: '12345' },
    isDuplicate: false,
    blurHash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH',
    dominantColor: '#1a1a2e',
    importedAt: '2025-12-01',
    updatedAt: '2025-12-10',
    createdAt: '2025-12-01',
  },
  {
    id: 'bg-002',
    title: 'Jujutsu Kaisen – Cursed Energy',
    slug: 'jjk-bg',
    url: '/backgrounds/jjk-bg.jpg',
    thumbnailUrl: '/backgrounds/thumbs/jjk-bg.jpg',
    mediaType: 'anime',
    resolution: '4k',
    format: 'webp',
    width: 3840,
    height: 2160,
    sizeBytes: 5_876_543,
    aspectRatio: '16:9',
    colorProfile: 'sRGB IEC61966-2.1',
    language: 'en',
    source: 'fanart',
    provider: 'FanArt.tv',
    status: 'active',
    usageCount: 12,
    usedBy: [
      { id: 'u1', type: 'hero', name: 'Homepage Hero', url: '/home' },
      { id: 'u2', type: 'discover', name: 'Top Rated', url: '/discovery/trending' },
      { id: 'u3', type: 'campaign', name: 'JJK Campaign', url: '/campaigns/jjk' },
    ],
    versions: [
      { id: 'v1', label: 'Original', language: 'en', resolution: '4k', format: 'webp', width: 3840, height: 2160, sizeBytes: 5_876_543, url: '/backgrounds/jjk-bg.jpg', isOriginal: true },
      { id: 'v2', label: 'Japanese', language: 'ja', resolution: '4k', format: 'jpg', width: 3840, height: 2160, sizeBytes: 9_123_456, url: '/backgrounds/jjk-bg-ja.jpg', isOriginal: false },
    ],
    metadata: { dpi: 72, bitsPerChannel: 10, hasAlpha: false, isInterlaced: false, gamma: 2.2, software: 'GIMP 2.10' },
    history: [
      { id: 'h1', action: 'upload', description: 'Uploaded from FanArt.tv', performedBy: 'system', timestamp: '2025-11-15T08:00:00Z' },
    ],
    qualityIndicators: ['high_resolution', 'hdr'],
    checksum: 'sha256:bg002b2c3d4e5f678901234567890abcdef01',
    copyright: '© MAPPA',
    author: 'FanArt Contributor',
    externalIds: { fanart: '98765' },
    isDuplicate: false,
    blurHash: 'LhK}p]RPxuwH~BRi?xu%;RPxuwH',
    dominantColor: '#2d1b69',
    importedAt: '2025-11-15',
    updatedAt: '2025-11-15',
    createdAt: '2025-11-15',
  },
  {
    id: 'bg-003',
    title: 'Frieren – Journey Landscape',
    slug: 'frieren-bg',
    url: '/backgrounds/frieren-bg.jpg',
    thumbnailUrl: '/backgrounds/thumbs/frieren-bg.jpg',
    mediaType: 'anime',
    resolution: '1440p',
    format: 'png',
    width: 2560,
    height: 1440,
    sizeBytes: 12_345_678,
    aspectRatio: '16:9',
    colorProfile: 'sRGB IEC61966-2.1',
    language: 'ja',
    source: 'anilist',
    provider: 'AniList',
    status: 'active',
    usageCount: 5,
    usedBy: [
      { id: 'u1', type: 'series', name: 'Frieren Detail', url: '/catalog/series/frieren' },
      { id: 'u2', type: 'collection', name: 'Best Fantasy', url: '/collections/best-fantasy' },
    ],
    versions: [
      { id: 'v1', label: 'Original', language: 'ja', resolution: '1440p', format: 'png', width: 2560, height: 1440, sizeBytes: 12_345_678, url: '/backgrounds/frieren-bg.jpg', isOriginal: true },
    ],
    metadata: { dpi: 96, bitsPerChannel: 8, hasAlpha: true, isInterlaced: false, gamma: 2.2 },
    history: [
      { id: 'h1', action: 'upload', description: 'Uploaded from AniList', performedBy: 'admin@kami-sama.io', timestamp: '2025-09-01T12:00:00Z' },
    ],
    qualityIndicators: ['transparent'],
    checksum: 'sha256:bg003c3d4e5f678901234567890abcdef0123',
    copyright: '© Madhouse',
    author: 'AniList Community',
    externalIds: { anilist: '125145' },
    isDuplicate: false,
    blurHash: 'LGF5?x9kBy%NRjofa{WBP]t6ofxb',
    dominantColor: '#4a7c59',
    importedAt: '2025-09-01',
    updatedAt: '2025-09-01',
    createdAt: '2025-09-01',
  },
  {
    id: 'bg-004',
    title: 'Demon Slayer – Infinity Castle',
    slug: 'demon-slayer-ic-bg',
    url: '/backgrounds/demon-slayer-ic-bg.jpg',
    thumbnailUrl: '/backgrounds/thumbs/demon-slayer-ic-bg.jpg',
    mediaType: 'anime',
    resolution: '4k',
    format: 'jpg',
    width: 3840,
    height: 2160,
    sizeBytes: 9_876_543,
    aspectRatio: '16:9',
    colorProfile: 'Display P3',
    language: 'en',
    source: 'fanart',
    provider: 'FanArt.tv',
    status: 'active',
    usageCount: 15,
    usedBy: [
      { id: 'u1', type: 'hero', name: 'Main Hero Banner', url: '/home' },
      { id: 'u2', type: 'discover', name: 'Now Playing', url: '/discovery/seasonal' },
      { id: 'u3', type: 'campaign', name: 'Winter Premiere', url: '/campaigns/winter' },
      { id: 'u4', type: 'collection', name: 'Top Action', url: '/collections/top-action' },
    ],
    versions: [
      { id: 'v1', label: 'Original', language: 'en', resolution: '4k', format: 'jpg', width: 3840, height: 2160, sizeBytes: 9_876_543, url: '/backgrounds/demon-slayer-ic-bg.jpg', isOriginal: true },
      { id: 'v2', label: 'French', language: 'fr', resolution: '1080p', format: 'jpg', width: 1920, height: 1080, sizeBytes: 2_876_543, url: '/backgrounds/demon-slayer-ic-bg-fr.jpg', isOriginal: false },
      { id: 'v3', label: 'Dark', language: 'en', resolution: '4k', format: 'png', width: 3840, height: 2160, sizeBytes: 15_432_109, url: '/backgrounds/demon-slayer-ic-bg-dark.png', isOriginal: false },
    ],
    metadata: { dpi: 72, bitsPerChannel: 8, hasAlpha: false, isInterlaced: false, gamma: 2.2, software: 'Adobe Photoshop 25.0' },
    history: [
      { id: 'h1', action: 'upload', description: 'Uploaded from FanArt.tv', performedBy: 'system', timestamp: '2025-12-20T06:00:00Z' },
      { id: 'h2', action: 'optimize', description: 'Auto-optimized', performedBy: 'system', timestamp: '2025-12-20T06:03:00Z' },
    ],
    qualityIndicators: ['high_resolution', 'optimized'],
    checksum: 'sha256:bg004d4e5f678901234567890abcdef012345',
    copyright: '© ufotable / Aniplex',
    author: 'FanArt Contributor',
    externalIds: { fanart: '11111', tmdb: '54321' },
    isDuplicate: false,
    blurHash: 'LHC$4?w{RjM{.Ns:WBof?GRPofxu',
    dominantColor: '#1a0a2e',
    importedAt: '2025-12-20',
    updatedAt: '2025-12-20',
    createdAt: '2025-12-20',
  },
  {
    id: 'bg-005',
    title: 'Chainsaw Man – Red Chains',
    slug: 'chainsaw-man-bg',
    url: '/backgrounds/chainsaw-man-bg.jpg',
    thumbnailUrl: '/backgrounds/thumbs/chainsaw-man-bg.jpg',
    mediaType: 'anime',
    resolution: '1080p',
    format: 'jpg',
    width: 1920,
    height: 1080,
    sizeBytes: 2_345_678,
    aspectRatio: '16:9',
    colorProfile: 'sRGB IEC61966-2.1',
    language: 'en',
    source: 'anilist',
    provider: 'AniList',
    status: 'active',
    usageCount: 3,
    usedBy: [
      { id: 'u1', type: 'series', name: 'Chainsaw Man Detail', url: '/catalog/series/chainsaw-man' },
    ],
    versions: [
      { id: 'v1', label: 'Original', language: 'en', resolution: '1080p', format: 'jpg', width: 1920, height: 1080, sizeBytes: 2_345_678, url: '/backgrounds/chainsaw-man-bg.jpg', isOriginal: true },
    ],
    metadata: { dpi: 72, bitsPerChannel: 8, hasAlpha: false, isInterlaced: false, gamma: 2.2 },
    history: [
      { id: 'h1', action: 'upload', description: 'Uploaded from AniList', performedBy: 'admin@kami-sama.io', timestamp: '2026-03-15T11:00:00Z' },
    ],
    qualityIndicators: ['optimized'],
    checksum: 'sha256:bg005e5f678901234567890abcdef01234567',
    copyright: '© MAPPA',
    author: 'AniList Community',
    externalIds: { anilist: '999999' },
    isDuplicate: false,
    blurHash: 'LkG8?w%MofxuRjofa{WBRPoet6xb',
    dominantColor: '#8b0000',
    importedAt: '2026-03-15',
    updatedAt: '2026-03-15',
    createdAt: '2026-03-15',
  },
  {
    id: 'bg-006',
    title: 'Generic – Dark Abstract',
    slug: 'generic-dark',
    url: '/backgrounds/generic-dark.jpg',
    thumbnailUrl: '/backgrounds/thumbs/generic-dark.jpg',
    mediaType: 'generic',
    resolution: '4k',
    format: 'jpg',
    width: 3840,
    height: 2160,
    sizeBytes: 4_567_890,
    aspectRatio: '16:9',
    colorProfile: 'sRGB IEC61966-2.1',
    language: 'en',
    source: 'upload',
    provider: 'Manual Upload',
    status: 'active',
    usageCount: 20,
    usedBy: [
      { id: 'u1', type: 'hero', name: 'Default Hero', url: '/home' },
      { id: 'u2', type: 'discover', name: 'Discover Background', url: '/discovery' },
      { id: 'u3', type: 'homepage', name: 'Fallback BG', url: '/home' },
    ],
    versions: [
      { id: 'v1', label: 'Original', language: 'en', resolution: '4k', format: 'jpg', width: 3840, height: 2160, sizeBytes: 4_567_890, url: '/backgrounds/generic-dark.jpg', isOriginal: true },
    ],
    metadata: { dpi: 72, bitsPerChannel: 8, hasAlpha: false, isInterlaced: false, gamma: 2.2, software: 'Figma' },
    history: [
      { id: 'h1', action: 'upload', description: 'Created in Figma', performedBy: 'design@kami-sama.io', timestamp: '2025-06-01T09:00:00Z' },
    ],
    qualityIndicators: ['optimized'],
    checksum: 'sha256:bg006f678901234567890abcdef0123456789',
    copyright: '© Kami-Sama',
    author: 'Design Team',
    externalIds: {},
    isDuplicate: false,
    blurHash: 'L234?w%MofofRjofa{WBRPofxb',
    dominantColor: '#0f0f1a',
    importedAt: '2025-06-01',
    updatedAt: '2025-06-01',
    createdAt: '2025-06-01',
  },
  {
    id: 'bg-007',
    title: 'One Piece – Grand Line',
    slug: 'one-piece-bg',
    url: '/backgrounds/one-piece-bg.jpg',
    thumbnailUrl: '/backgrounds/thumbs/one-piece-bg.jpg',
    mediaType: 'series',
    resolution: '720p',
    format: 'jpg',
    width: 1280,
    height: 720,
    sizeBytes: 876_543,
    aspectRatio: '16:9',
    colorProfile: 'sRGB IEC61966-2.1',
    language: 'en',
    source: 'plex',
    provider: 'Plex',
    status: 'active',
    usageCount: 2,
    usedBy: [
      { id: 'u1', type: 'series', name: 'One Piece Detail', url: '/catalog/series/one-piece' },
    ],
    versions: [
      { id: 'v1', label: 'Original', language: 'en', resolution: '720p', format: 'jpg', width: 1280, height: 720, sizeBytes: 876_543, url: '/backgrounds/one-piece-bg.jpg', isOriginal: true },
    ],
    metadata: { dpi: 72, bitsPerChannel: 8, hasAlpha: false, isInterlaced: false, gamma: 2.2 },
    history: [
      { id: 'h1', action: 'upload', description: 'Imported from Plex', performedBy: 'system', timestamp: '2025-06-15T14:00:00Z' },
    ],
    qualityIndicators: ['low_resolution'],
    checksum: 'sha256:bg00778901234567890abcdef012345678901',
    copyright: '© Toei Animation',
    author: 'Plex Agent',
    externalIds: { plex: '22222' },
    isDuplicate: false,
    blurHash: 'LmG5?w%Ma{fRofoa{WBRPofxb',
    dominantColor: '#1e3a5f',
    importedAt: '2025-06-15',
    updatedAt: '2025-06-15',
    createdAt: '2025-06-15',
  },
  {
    id: 'bg-008',
    title: 'Spy x Family – Family Portrait',
    slug: 'spy-family-bg',
    url: '/backgrounds/spy-family-bg.jpg',
    thumbnailUrl: '/backgrounds/thumbs/spy-family-bg.jpg',
    mediaType: 'movie',
    resolution: '4k',
    format: 'avif',
    width: 3840,
    height: 2160,
    sizeBytes: 3_210_987,
    aspectRatio: '16:9',
    colorProfile: 'Display P3',
    language: 'fr',
    source: 'upload',
    provider: 'Manual Upload',
    status: 'active',
    usageCount: 4,
    usedBy: [
      { id: 'u1', type: 'movie', name: 'Spy x Family Movie', url: '/catalog/movies/spy-family' },
      { id: 'u2', type: 'collection', name: 'Family Friendly', url: '/collections/family-friendly' },
    ],
    versions: [
      { id: 'v1', label: 'Original', language: 'fr', resolution: '4k', format: 'avif', width: 3840, height: 2160, sizeBytes: 3_210_987, url: '/backgrounds/spy-family-bg.jpg', isOriginal: true },
    ],
    metadata: { dpi: 72, bitsPerChannel: 8, hasAlpha: false, isInterlaced: false, gamma: 2.2, software: 'Adobe Photoshop 25.0' },
    history: [
      { id: 'h1', action: 'upload', description: 'Manually uploaded', performedBy: 'admin@kami-sama.io', timestamp: '2025-12-22T16:00:00Z' },
    ],
    qualityIndicators: ['high_resolution', 'optimized'],
    checksum: 'sha256:bg0088901234567890abcdef01234567890123',
    copyright: '© WIT Studio',
    author: 'Kami-Sama Editorial',
    externalIds: { tmdb: '44444' },
    isDuplicate: false,
    blurHash: 'LmH6?w%Mb{fRofoa{WBRPofxb',
    dominantColor: '#2d5a27',
    importedAt: '2025-12-22',
    updatedAt: '2025-12-22',
    createdAt: '2025-12-22',
  },
  {
    id: 'bg-009',
    title: 'Attack on Titan – Final Battle',
    slug: 'aot-bg',
    url: '/backgrounds/aot-bg.jpg',
    thumbnailUrl: '/backgrounds/thumbs/aot-bg.jpg',
    mediaType: 'anime',
    resolution: '4k',
    format: 'jpg',
    width: 3840,
    height: 2160,
    sizeBytes: 7_654_321,
    aspectRatio: '21:9',
    colorProfile: 'sRGB IEC61966-2.1',
    language: 'en',
    source: 'fanart',
    provider: 'FanArt.tv',
    status: 'active',
    usageCount: 10,
    usedBy: [
      { id: 'u1', type: 'hero', name: 'Ultrawide Hero', url: '/home' },
      { id: 'u2', type: 'series', name: 'AoT Detail', url: '/catalog/series/aot' },
      { id: 'u3', type: 'collection', name: 'Best Action', url: '/collections/best-action' },
    ],
    versions: [
      { id: 'v1', label: 'Original', language: 'en', resolution: '4k', format: 'jpg', width: 3840, height: 2160, sizeBytes: 7_654_321, url: '/backgrounds/aot-bg.jpg', isOriginal: true },
      { id: 'v2', label: 'Ultrawide', language: 'en', resolution: '4k', format: 'webp', width: 5120, height: 2160, sizeBytes: 6_543_210, url: '/backgrounds/aot-bg-uw.webp', isOriginal: false },
    ],
    metadata: { dpi: 72, bitsPerChannel: 8, hasAlpha: false, isInterlaced: false, gamma: 2.2 },
    history: [
      { id: 'h1', action: 'upload', description: 'Uploaded from FanArt.tv', performedBy: 'system', timestamp: '2025-01-01T08:00:00Z' },
      { id: 'h2', action: 'modify', description: 'Added ultrawide version', performedBy: 'editor@kami-sama.io', timestamp: '2025-02-15T14:00:00Z' },
    ],
    qualityIndicators: ['high_resolution', 'optimized'],
    checksum: 'sha256:bg009901234567890abcdef012345678901234',
    copyright: '© MAPPA / Kodansha',
    author: 'FanArt Contributor',
    externalIds: { fanart: '11111' },
    isDuplicate: false,
    blurHash: 'LlI8?w%MofxuRjofa{WBRPofxb',
    dominantColor: '#3d1c02',
    importedAt: '2025-01-01',
    updatedAt: '2025-02-15',
    createdAt: '2025-01-01',
  },
  {
    id: 'bg-010',
    title: 'Generic – Gradient Purple',
    slug: 'generic-gradient',
    url: '/backgrounds/generic-gradient.jpg',
    thumbnailUrl: '/backgrounds/thumbs/generic-gradient.jpg',
    mediaType: 'generic',
    resolution: '1080p',
    format: 'png',
    width: 1920,
    height: 1080,
    sizeBytes: 1_987_654,
    aspectRatio: '16:9',
    colorProfile: 'sRGB IEC61966-2.1',
    language: 'en',
    source: 'generated',
    provider: 'AI Generated',
    status: 'unused',
    usageCount: 0,
    usedBy: [],
    versions: [
      { id: 'v1', label: 'Original', language: 'en', resolution: '1080p', format: 'png', width: 1920, height: 1080, sizeBytes: 1_987_654, url: '/backgrounds/generic-gradient.jpg', isOriginal: true },
    ],
    metadata: { dpi: 72, bitsPerChannel: 8, hasAlpha: true, isInterlaced: false, gamma: 2.2 },
    history: [
      { id: 'h1', action: 'upload', description: 'AI-generated gradient', performedBy: 'system', timestamp: '2025-10-01T12:00:00Z' },
    ],
    qualityIndicators: ['transparent'],
    checksum: 'sha256:bg01001234567890abcdef0123456789012345',
    copyright: '© Kami-Sama',
    author: 'AI Generator',
    externalIds: {},
    isDuplicate: false,
    blurHash: 'LmJ9?w%Ma{fRofoa{WBRPofxb',
    dominantColor: '#6b21a8',
    importedAt: '2025-10-01',
    updatedAt: '2025-10-01',
    createdAt: '2025-10-01',
  },
]

export const MOCK_BACKGROUND_CHARTS: BackgroundChart[] = [
  {
    id: 'chart-storage',
    title: 'Storage by Type',
    type: 'donut',
    data: [
      { label: 'Anime', value: 50, color: '#3b82f6' },
      { label: 'Movie', value: 20, color: '#8b5cf6' },
      { label: 'Series', value: 15, color: '#22c55e' },
      { label: 'Generic', value: 15, color: '#6b7280' },
    ],
  },
  {
    id: 'chart-resolutions',
    title: 'Resolutions',
    type: 'bar',
    data: [
      { label: '4K', value: 45 },
      { label: '1440p', value: 15 },
      { label: '1080p', value: 30 },
      { label: '720p', value: 10 },
    ],
  },
  {
    id: 'chart-uploads',
    title: 'Uploads Over Time',
    type: 'line',
    data: [
      { label: 'Jul', value: 85 },
      { label: 'Aug', value: 120 },
      { label: 'Sep', value: 98 },
      { label: 'Oct', value: 145 },
      { label: 'Nov', value: 178 },
      { label: 'Dec', value: 210 },
    ],
  },
]

export const MOCK_BACKGROUND_SETTINGS: BackgroundSettings = {
  maxUploadSizeMB: 100,
  allowedFormats: ['jpg', 'png', 'webp', 'avif'],
  autoOptimize: true,
  generateThumbnails: true,
  thumbnailSize: 640,
  requireApproval: false,
  duplicateDetection: true,
  autoCleanupUnused: false,
  unusedDaysThreshold: 90,
  compressionQuality: 85,
  defaultAspectRatio: '16:9',
}

export function getBackgroundStats(backgrounds: Background[]): BackgroundStats {
  return {
    totalBackgrounds: backgrounds.length,
    totalStorageBytes: backgrounds.reduce((s, b) => s + b.sizeBytes, 0),
    unusedBackgrounds: backgrounds.filter((b) => b.status === 'unused').length,
    missingBackgrounds: backgrounds.filter((b) => b.status === 'missing').length,
    activeBackgrounds: backgrounds.filter((b) => b.status === 'active').length,
    duplicateBackgrounds: backgrounds.filter((b) => b.isDuplicate).length,
  }
}
