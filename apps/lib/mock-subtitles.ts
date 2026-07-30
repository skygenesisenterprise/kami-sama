export type SubtitleMediaType = 'episode' | 'movie' | 'series'
export type SubtitleFormat = 'srt' | 'ass' | 'ssa' | 'vtt' | 'sub'
export type SubtitleStatus = 'active' | 'unused' | 'missing' | 'duplicate'
export type SubtitleSource = 'opensubtitles' | 'anilist' | 'manual' | 'tmdb' | 'subscene'
export type SubtitleLanguage = 'en' | 'ja' | 'fr' | 'es' | 'de' | 'pt' | 'ko' | 'zh' | 'ar' | 'it' | 'ru' | 'pl'

export interface SubtitleVersion {
  id: string
  label: string
  language: SubtitleLanguage
  sizeBytes: number
  format: SubtitleFormat
  isOriginal: boolean
}

export interface SubtitleUsage {
  id: string
  type: string
  name: string
  url: string
}

export interface SubtitleHistoryEntry {
  id: string
  action: 'upload' | 'replace' | 'modify' | 'sync' | 'delete' | 'restore'
  description: string
  details?: string
  performedBy: string
  timestamp: string
}

export interface SubtitleTrack {
  id: string
  title: string
  mediaType: SubtitleMediaType
  format: SubtitleFormat
  sizeBytes: number
  source: SubtitleSource
  language: SubtitleLanguage
  status: SubtitleStatus
  usageCount: number
  usedBy: SubtitleUsage[]
  versions: SubtitleVersion[]
  history: SubtitleHistoryEntry[]
  qualityIndicators: string[]
  importedAt: string
  updatedAt: string
  url: string
  checksum?: string
  provider: string
  isHearingImpaired: boolean
  isForced: boolean
  isDuplicate: boolean
  lineCount: number
  metadata: {
    encoding: string
    fps?: number
    timecodes?: string
    cuedBy?: string
    software?: string
  }
  externalIds: Record<string, string>
}

export type SubtitleMediaTypeLabel = Record<SubtitleMediaType, string>
export type SubtitleFormatLabel = Record<SubtitleFormat, string>
export type SubtitleStatusLabel = Record<SubtitleStatus, string>
export type SubtitleStatusTone = Record<SubtitleStatus, 'success' | 'info' | 'warning' | 'destructive' | 'neutral'>
export type SubtitleSourceLabel = Record<SubtitleSource, string>
export type SubtitleLanguageLabel = Record<SubtitleLanguage, string>
export type QualityLabel = Record<string, string>

export const SUBTITLE_MEDIA_TYPES: SubtitleMediaType[] = ['episode', 'movie', 'series']
export const SUBTITLE_MEDIA_TYPE_LABEL: SubtitleMediaTypeLabel = {
  episode: 'Episode',
  movie: 'Movie',
  series: 'Series',
}

export const SUBTITLE_FORMATS: SubtitleFormat[] = ['srt', 'ass', 'ssa', 'vtt', 'sub']

export const SUBTITLE_STATUSES: SubtitleStatus[] = ['active', 'unused', 'missing', 'duplicate']
export const SUBTITLE_STATUS_LABEL: SubtitleStatusLabel = {
  active: 'Active',
  unused: 'Unused',
  missing: 'Missing',
  duplicate: 'Duplicate',
}
export const SUBTITLE_STATUS_TONE: SubtitleStatusTone = {
  active: 'success',
  unused: 'warning',
  missing: 'destructive',
  duplicate: 'info',
}

export const SUBTITLE_SOURCES: SubtitleSource[] = ['opensubtitles', 'anilist', 'manual', 'tmdb', 'subscene']
export const SUBTITLE_SOURCE_LABEL: SubtitleSourceLabel = {
  opensubtitles: 'OpenSubtitles',
  anilist: 'AniList',
  manual: 'Manual',
  tmdb: 'TMDB',
  subscene: 'Subscene',
}

export const SUBTITLE_LANGUAGES: SubtitleLanguage[] = ['en', 'ja', 'fr', 'es', 'de', 'pt', 'ko', 'zh', 'ar', 'it', 'ru', 'pl']
export const SUBTITLE_LANGUAGE_LABEL: SubtitleLanguageLabel = {
  en: 'English',
  ja: 'Japanese',
  fr: 'French',
  es: 'Spanish',
  de: 'German',
  pt: 'Portuguese',
  ko: 'Korean',
  zh: 'Chinese',
  ar: 'Arabic',
  it: 'Italian',
  ru: 'Russian',
  pl: 'Polish',
}

export const QUALITY_LABEL: QualityLabel = {
  hq: 'High Quality',
  synced: 'Synced',
  verified: 'Verified',
  auto: 'Auto-generated',
  manual: 'Manually Cued',
}

export const IMPORT_SOURCES: SubtitleSource[] = ['opensubtitles', 'anilist', 'subscene']
export const IMPORT_SOURCE_LABEL: Record<SubtitleSource, string> = {
  opensubtitles: 'OpenSubtitles',
  anilist: 'AniList',
  manual: 'Manual',
  tmdb: 'TMDB',
  subscene: 'Subscene',
}

export type ImportSource = SubtitleSource

export interface SubtitleSettings {
  maxUploadSizeMB: number
  autoSync: boolean
  defaultFormat: SubtitleFormat
  autoDetectLanguage: boolean
  duplicateDetection: boolean
  autoCleanupUnused: boolean
  unusedDaysThreshold: number
}

export const MOCK_SUBTITLE_SETTINGS: SubtitleSettings = {
  maxUploadSizeMB: 10,
  autoSync: true,
  defaultFormat: 'srt',
  autoDetectLanguage: true,
  duplicateDetection: true,
  autoCleanupUnused: false,
  unusedDaysThreshold: 90,
}

export interface ImportPreview {
  id: string
  source: SubtitleSource
  title: string
  url: string
  format: SubtitleFormat
  sizeBytes: number
  language: SubtitleLanguage
  alreadyExists: boolean
  selected: boolean
  lineCount: number
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

export const MOCK_SUBTITLES: SubtitleTrack[] = [
  {
    id: 'sub-1',
    title: 'Chainsaw Man S1 E1 - English',
    mediaType: 'episode',
    format: 'srt',
    sizeBytes: 45_000,
    source: 'opensubtitles',
    language: 'en',
    status: 'active',
    usageCount: 8,
    usedBy: [
      { id: 'u-1', type: 'episode', name: 'Chainsaw Man E1', url: '/anime/chainsaw-man/e1' },
      { id: 'u-2', type: 'player', name: 'Video Player', url: '/watch/chainsaw-man/e1' },
    ],
    versions: [
      { id: 'v-1', label: 'English', language: 'en', sizeBytes: 45_000, format: 'srt', isOriginal: true },
      { id: 'v-2', label: 'English (SDH)', language: 'en', sizeBytes: 52_000, format: 'srt', isOriginal: false },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded from OpenSubtitles', performedBy: 'admin', timestamp: '2025-07-15T10:30:00Z' },
      { id: 'h-2', action: 'sync', description: 'Synchronized with video timestamps', performedBy: 'system', timestamp: '2025-07-15T10:35:00Z' },
    ],
    qualityIndicators: ['hq', 'synced'],
    importedAt: '2025-07-15',
    updatedAt: '2025-07-20',
    url: '/subtitles/chainsaw-man-e1-en.srt',
    checksum: 'a1b2c3d4e5f6g7h8i9j0',
    provider: 'OpenSubtitles',
    isHearingImpaired: false,
    isForced: false,
    isDuplicate: false,
    lineCount: 342,
    metadata: { encoding: 'UTF-8', fps: 24, timecodes: 'VFR', cuedBy: 'Aegisub', software: 'Subtitle Edit' },
    externalIds: { opensubtitles: '12345678', imdb: 'tt1134156' },
  },
  {
    id: 'sub-2',
    title: 'Chainsaw Man S1 E1 - French',
    mediaType: 'episode',
    format: 'ass',
    sizeBytes: 52_000,
    source: 'anilist',
    language: 'fr',
    status: 'active',
    usageCount: 6,
    usedBy: [
      { id: 'u-1', type: 'episode', name: 'Chainsaw Man E1', url: '/anime/chainsaw-man/e1' },
    ],
    versions: [
      { id: 'v-1', label: 'French', language: 'fr', sizeBytes: 52_000, format: 'ass', isOriginal: true },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded from AniList', performedBy: 'admin', timestamp: '2025-07-10T14:20:00Z' },
    ],
    qualityIndicators: ['hq', 'verified'],
    importedAt: '2025-07-10',
    updatedAt: '2025-07-18',
    url: '/subtitles/chainsaw-man-e1-fr.ass',
    provider: 'AniList',
    isHearingImpaired: false,
    isForced: false,
    isDuplicate: false,
    lineCount: 356,
    metadata: { encoding: 'UTF-8', fps: 24, cuedBy: 'Aegisub' },
    externalIds: { anilist: '113415' },
  },
  {
    id: 'sub-3',
    title: 'Frieren S2 E1 - Japanese',
    mediaType: 'episode',
    format: 'srt',
    sizeBytes: 38_000,
    source: 'opensubtitles',
    language: 'ja',
    status: 'active',
    usageCount: 10,
    usedBy: [
      { id: 'u-1', type: 'episode', name: 'Frieren S2 E1', url: '/anime/frieren-s2/e1' },
      { id: 'u-2', type: 'player', name: 'Video Player', url: '/watch/frieren-s2/e1' },
    ],
    versions: [
      { id: 'v-1', label: 'Japanese', language: 'ja', sizeBytes: 38_000, format: 'srt', isOriginal: true },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded from OpenSubtitles', performedBy: 'admin', timestamp: '2025-07-08T09:15:00Z' },
      { id: 'h-2', action: 'replace', description: 'Replaced with synced version', performedBy: 'admin', timestamp: '2025-07-12T16:45:00Z' },
    ],
    qualityIndicators: ['hq', 'synced', 'verified'],
    importedAt: '2025-07-08',
    updatedAt: '2025-07-22',
    url: '/subtitles/frieren-s2-e1-ja.srt',
    checksum: 'f6g7h8i9j0k1l2m3n4o5',
    provider: 'OpenSubtitles',
    isHearingImpaired: false,
    isForced: false,
    isDuplicate: false,
    lineCount: 298,
    metadata: { encoding: 'UTF-8', fps: 24, timecodes: 'CFR', cuedBy: 'Aegisub', software: 'Subtitle Edit' },
    externalIds: { opensubtitles: '87654321', mal: '153556' },
  },
  {
    id: 'sub-4',
    title: 'Demon Slayer: Infinity Castle - English',
    mediaType: 'movie',
    format: 'srt',
    sizeBytes: 62_000,
    source: 'opensubtitles',
    language: 'en',
    status: 'active',
    usageCount: 15,
    usedBy: [
      { id: 'u-1', type: 'movie', name: 'Demon Slayer: Infinity Castle', url: '/anime/demon-slayer-ic' },
      { id: 'u-2', type: 'player', name: 'Video Player', url: '/watch/demon-slayer-ic' },
    ],
    versions: [
      { id: 'v-1', label: 'English', language: 'en', sizeBytes: 62_000, format: 'srt', isOriginal: true },
      { id: 'v-2', label: 'English (Forced)', language: 'en', sizeBytes: 12_000, format: 'srt', isOriginal: false },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded from OpenSubtitles', performedBy: 'admin', timestamp: '2025-07-05T11:00:00Z' },
    ],
    qualityIndicators: ['hq', 'synced'],
    importedAt: '2025-07-05',
    updatedAt: '2025-07-19',
    url: '/subtitles/demon-slayer-ic-en.srt',
    provider: 'OpenSubtitles',
    isHearingImpaired: false,
    isForced: false,
    isDuplicate: false,
    lineCount: 425,
    metadata: { encoding: 'UTF-8', fps: 24, timecodes: 'VFR', software: 'Subtitle Edit' },
    externalIds: { opensubtitles: '11223344', imdb: 'tt9876543' },
  },
  {
    id: 'sub-5',
    title: 'Dandadan E1 - English',
    mediaType: 'episode',
    format: 'vtt',
    sizeBytes: 42_000,
    source: 'anilist',
    language: 'en',
    status: 'active',
    usageCount: 7,
    usedBy: [
      { id: 'u-1', type: 'episode', name: 'Dandadan E1', url: '/anime/dandadan/e1' },
    ],
    versions: [
      { id: 'v-1', label: 'English', language: 'en', sizeBytes: 42_000, format: 'vtt', isOriginal: true },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded from AniList', performedBy: 'admin', timestamp: '2025-07-01T08:30:00Z' },
    ],
    qualityIndicators: ['hq'],
    importedAt: '2025-07-01',
    updatedAt: '2025-07-15',
    url: '/subtitles/dandadan-e1-en.vtt',
    provider: 'AniList',
    isHearingImpaired: false,
    isForced: false,
    isDuplicate: false,
    lineCount: 310,
    metadata: { encoding: 'UTF-8', fps: 24 },
    externalIds: { anilist: '114234' },
  },
  {
    id: 'sub-6',
    title: 'One Piece Film: Red - Spanish',
    mediaType: 'movie',
    format: 'srt',
    sizeBytes: 58_000,
    source: 'subscene',
    language: 'es',
    status: 'unused',
    usageCount: 0,
    usedBy: [],
    versions: [
      { id: 'v-1', label: 'Spanish', language: 'es', sizeBytes: 58_000, format: 'srt', isOriginal: true },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded from Subscene', performedBy: 'admin', timestamp: '2025-06-28T12:00:00Z' },
    ],
    qualityIndicators: [],
    importedAt: '2025-06-28',
    updatedAt: '2025-06-28',
    url: '/subtitles/one-piece-red-es.srt',
    provider: 'Subscene',
    isHearingImpaired: false,
    isForced: false,
    isDuplicate: false,
    lineCount: 380,
    metadata: { encoding: 'UTF-8', fps: 24 },
    externalIds: { subscene: '12345' },
  },
  {
    id: 'sub-7',
    title: 'Spy x Family Code: White - French',
    mediaType: 'movie',
    format: 'ass',
    sizeBytes: 55_000,
    source: 'anilist',
    language: 'fr',
    status: 'active',
    usageCount: 9,
    usedBy: [
      { id: 'u-1', type: 'movie', name: 'Spy x Family Code: White', url: '/anime/spy-family-cw' },
    ],
    versions: [
      { id: 'v-1', label: 'French', language: 'fr', sizeBytes: 55_000, format: 'ass', isOriginal: true },
      { id: 'v-2', label: 'French (SDH)', language: 'fr', sizeBytes: 62_000, format: 'ass', isOriginal: false },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded from AniList', performedBy: 'admin', timestamp: '2025-06-25T15:30:00Z' },
    ],
    qualityIndicators: ['hq', 'verified'],
    importedAt: '2025-06-25',
    updatedAt: '2025-07-10',
    url: '/subtitles/spy-family-cw-fr.ass',
    provider: 'AniList',
    isHearingImpaired: false,
    isForced: false,
    isDuplicate: false,
    lineCount: 365,
    metadata: { encoding: 'UTF-8', fps: 24, cuedBy: 'Aegisub' },
    externalIds: { anilist: '151808' },
  },
  {
    id: 'sub-8',
    title: 'Attack on Titan Final Season - English',
    mediaType: 'series',
    format: 'srt',
    sizeBytes: 185_000,
    source: 'opensubtitles',
    language: 'en',
    status: 'active',
    usageCount: 20,
    usedBy: [
      { id: 'u-1', type: 'series', name: 'Attack on Titan Final Season', url: '/anime/aot-final' },
      { id: 'u-2', type: 'player', name: 'Video Player', url: '/watch/aot-final' },
    ],
    versions: [
      { id: 'v-1', label: 'English', language: 'en', sizeBytes: 185_000, format: 'srt', isOriginal: true },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded from OpenSubtitles', performedBy: 'admin', timestamp: '2025-06-20T10:00:00Z' },
    ],
    qualityIndicators: ['hq', 'synced', 'verified'],
    importedAt: '2025-06-20',
    updatedAt: '2025-07-05',
    url: '/subtitles/aot-final-en.srt',
    checksum: 'k1l2m3n4o5p6q7r8s9t0',
    provider: 'OpenSubtitles',
    isHearingImpaired: false,
    isForced: false,
    isDuplicate: false,
    lineCount: 2850,
    metadata: { encoding: 'UTF-8', fps: 24, timecodes: 'VFR', software: 'Subtitle Edit' },
    externalIds: { opensubtitles: '55667788', mal: '5114' },
  },
  {
    id: 'sub-9',
    title: 'Chainsaw Man S1 E1 - English (Dup)',
    mediaType: 'episode',
    format: 'srt',
    sizeBytes: 45_000,
    source: 'opensubtitles',
    language: 'en',
    status: 'duplicate',
    usageCount: 0,
    usedBy: [],
    versions: [
      { id: 'v-1', label: 'English', language: 'en', sizeBytes: 45_000, format: 'srt', isOriginal: true },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Duplicate detected', performedBy: 'system', timestamp: '2025-07-15T11:00:00Z' },
    ],
    qualityIndicators: [],
    importedAt: '2025-07-15',
    updatedAt: '2025-07-15',
    url: '/subtitles/chainsaw-man-e1-en-dup.srt',
    provider: 'OpenSubtitles',
    isHearingImpaired: false,
    isForced: false,
    isDuplicate: true,
    lineCount: 342,
    metadata: { encoding: 'UTF-8', fps: 24 },
    externalIds: { opensubtitles: '12345678' },
  },
  {
    id: 'sub-10',
    title: 'Oshi no Ko S2 E1 - Japanese (SDH)',
    mediaType: 'episode',
    format: 'srt',
    sizeBytes: 48_000,
    source: 'opensubtitles',
    language: 'ja',
    status: 'active',
    usageCount: 5,
    usedBy: [
      { id: 'u-1', type: 'episode', name: 'Oshi no Ko S2 E1', url: '/anime/oshi-no-ko-s2/e1' },
    ],
    versions: [
      { id: 'v-1', label: 'Japanese (SDH)', language: 'ja', sizeBytes: 48_000, format: 'srt', isOriginal: true },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded from OpenSubtitles', performedBy: 'admin', timestamp: '2025-07-18T13:45:00Z' },
    ],
    qualityIndicators: ['hq', 'synced'],
    importedAt: '2025-07-18',
    updatedAt: '2025-07-25',
    url: '/subtitles/oshi-no-ko-s2-e1-ja.srt',
    provider: 'OpenSubtitles',
    isHearingImpaired: true,
    isForced: false,
    isDuplicate: false,
    lineCount: 315,
    metadata: { encoding: 'UTF-8', fps: 24, timecodes: 'CFR', software: 'Subtitle Edit' },
    externalIds: { opensubtitles: '99887766', mal: '168456' },
  },
]
