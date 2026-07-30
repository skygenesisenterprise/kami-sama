export type AudioMediaType = 'opening' | 'ending' | 'ost' | 'insert' | 'character' | 'full'
export type AudioFormat = 'mp3' | 'flac' | 'wav' | 'aac' | 'ogg'
export type AudioStatus = 'active' | 'unused' | 'missing' | 'duplicate'
export type AudioSource = 'tmdb' | 'anilist' | 'manually' | 'spotify' | 'manual'
export type AudioLanguage = 'en' | 'ja' | 'fr' | 'es' | 'de' | 'pt' | 'ko' | 'zh'

export interface AudioVersion {
  id: string
  label: string
  language: AudioLanguage
  sizeBytes: number
  format: AudioFormat
  isOriginal: boolean
  durationSeconds: number
  bitrate: number
}

export interface AudioUsage {
  id: string
  type: string
  name: string
  url: string
}

export interface AudioHistoryEntry {
  id: string
  action: 'upload' | 'replace' | 'modify' | 'normalize' | 'delete' | 'restore'
  description: string
  details?: string
  performedBy: string
  timestamp: string
}

export interface AudioTrack {
  id: string
  title: string
  mediaType: AudioMediaType
  format: AudioFormat
  sizeBytes: number
  source: AudioSource
  language: AudioLanguage
  status: AudioStatus
  usageCount: number
  usedBy: AudioUsage[]
  versions: AudioVersion[]
  history: AudioHistoryEntry[]
  qualityIndicators: string[]
  importedAt: string
  updatedAt: string
  url: string
  thumbnailUrl: string
  checksum?: string
  artist?: string
  album?: string
  provider: string
  copyright: string
  isDuplicate: boolean
  durationSeconds: number
  metadata: {
    bitrate: number
    sampleRate: number
    channels: number
    software?: string
    encoder?: string
    genre?: string
    trackNumber?: number
    year?: number
  }
  externalIds: Record<string, string>
}

export type AudioMediaTypeLabel = Record<AudioMediaType, string>
export type AudioFormatLabel = Record<AudioFormat, string>
export type AudioStatusLabel = Record<AudioStatus, string>
export type AudioStatusTone = Record<AudioStatus, 'success' | 'info' | 'warning' | 'destructive' | 'neutral'>
export type AudioSourceLabel = Record<AudioSource, string>
export type AudioLanguageLabel = Record<AudioLanguage, string>
export type QualityLabel = Record<string, string>

export const AUDIO_MEDIA_TYPES: AudioMediaType[] = ['opening', 'ending', 'ost', 'insert', 'character', 'full']
export const AUDIO_MEDIA_TYPE_LABEL: AudioMediaTypeLabel = {
  opening: 'Opening',
  ending: 'Ending',
  ost: 'OST',
  insert: 'Insert',
  character: 'Character',
  full: 'Full',
}

export const AUDIO_FORMATS: AudioFormat[] = ['mp3', 'flac', 'wav', 'aac', 'ogg']

export const AUDIO_STATUSES: AudioStatus[] = ['active', 'unused', 'missing', 'duplicate']
export const AUDIO_STATUS_LABEL: AudioStatusLabel = {
  active: 'Active',
  unused: 'Unused',
  missing: 'Missing',
  duplicate: 'Duplicate',
}
export const AUDIO_STATUS_TONE: AudioStatusTone = {
  active: 'success',
  unused: 'warning',
  missing: 'destructive',
  duplicate: 'info',
}

export const AUDIO_SOURCES: AudioSource[] = ['tmdb', 'anilist', 'manually', 'spotify', 'manual']
export const AUDIO_SOURCE_LABEL: AudioSourceLabel = {
  tmdb: 'TMDB',
  anilist: 'AniList',
  manually: 'Manually',
  spotify: 'Spotify',
  manual: 'Manual',
}

export const AUDIO_LANGUAGES: AudioLanguage[] = ['en', 'ja', 'fr', 'es', 'de', 'pt', 'ko', 'zh']
export const AUDIO_LANGUAGE_LABEL: AudioLanguageLabel = {
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

export const IMPORT_SOURCES: AudioSource[] = ['tmdb', 'anilist', 'spotify']
export const IMPORT_SOURCE_LABEL: Record<AudioSource, string> = {
  tmdb: 'TMDB',
  anilist: 'AniList',
  manually: 'Manually',
  spotify: 'Spotify',
  manual: 'Manual',
}

export type ImportSource = AudioSource

export interface AudioSettings {
  maxUploadSizeMB: number
  autoOptimize: boolean
  normalizeAudio: boolean
  targetLoudness: number
  compressionQuality: number
  duplicateDetection: boolean
  autoCleanupUnused: boolean
  unusedDaysThreshold: number
  maxDurationSeconds: number
}

export const MOCK_AUDIO_SETTINGS: AudioSettings = {
  maxUploadSizeMB: 100,
  autoOptimize: true,
  normalizeAudio: true,
  targetLoudness: -14,
  compressionQuality: 320,
  duplicateDetection: true,
  autoCleanupUnused: false,
  unusedDaysThreshold: 90,
  maxDurationSeconds: 600,
}

export interface ImportPreview {
  id: string
  source: AudioSource
  title: string
  url: string
  thumbnailUrl: string
  format: AudioFormat
  sizeBytes: number
  language: AudioLanguage
  alreadyExists: boolean
  selected: boolean
  durationSeconds: number
  artist: string
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

export const MOCK_AUDIO: AudioTrack[] = [
  {
    id: 'audio-1',
    title: 'Kick Back - Kenshi Yonezu',
    mediaType: 'opening',
    format: 'flac',
    sizeBytes: 35_000_000,
    source: 'spotify',
    language: 'ja',
    status: 'active',
    usageCount: 12,
    usedBy: [
      { id: 'u-1', type: 'anime', name: 'Chainsaw Man', url: '/anime/chainsaw-man' },
      { id: 'u-2', type: 'playlist', name: 'Anime Openings', url: '/playlists/openings' },
    ],
    versions: [
      { id: 'v-1', label: 'Original', language: 'ja', sizeBytes: 35_000_000, format: 'flac', isOriginal: true, durationSeconds: 245, bitrate: 1411 },
      { id: 'v-2', label: 'English', language: 'en', sizeBytes: 8_000_000, format: 'mp3', isOriginal: false, durationSeconds: 245, bitrate: 320 },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded from Spotify', performedBy: 'admin', timestamp: '2025-07-15T10:30:00Z' },
      { id: 'h-2', action: 'normalize', description: 'Normalized loudness to -14 LUFS', performedBy: 'system', timestamp: '2025-07-15T10:35:00Z' },
    ],
    qualityIndicators: ['hq', 'lossless'],
    importedAt: '2025-07-15',
    updatedAt: '2025-07-20',
    url: '/audio/chainsaw-man-op1.flac',
    thumbnailUrl: '/audio/thumbs/chainsaw-man-op1.jpg',
    checksum: 'a1b2c3d4e5f6g7h8i9j0',
    artist: 'Kenshi Yonezu',
    album: 'Chainsaw Man OST',
    provider: 'Spotify',
    copyright: '© MAPPA',
    isDuplicate: false,
    durationSeconds: 245,
    metadata: { bitrate: 1411, sampleRate: 44100, channels: 2, software: 'Adobe Audition', encoder: 'FLAC', genre: 'Anime', trackNumber: 1, year: 2022 },
    externalIds: { spotify: '6rqhFgbbKwnb9MLmUQDhG6', anilist: '113415' },
  },
  {
    id: 'audio-2',
    title: 'Zankyosanka - Aimer',
    mediaType: 'opening',
    format: 'mp3',
    sizeBytes: 8_500_000,
    source: 'spotify',
    language: 'ja',
    status: 'active',
    usageCount: 10,
    usedBy: [
      { id: 'u-1', type: 'anime', name: 'Demon Slayer: Entertainment District Arc', url: '/anime/demon-slayer-eda' },
    ],
    versions: [
      { id: 'v-1', label: 'Original', language: 'ja', sizeBytes: 8_500_000, format: 'mp3', isOriginal: true, durationSeconds: 228, bitrate: 320 },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded from Spotify', performedBy: 'admin', timestamp: '2025-07-10T14:20:00Z' },
    ],
    qualityIndicators: ['hq'],
    importedAt: '2025-07-10',
    updatedAt: '2025-07-18',
    url: '/audio/demon-slayer-eda-op1.mp3',
    thumbnailUrl: '/audio/thumbs/demon-slayer-eda-op1.jpg',
    artist: 'Aimer',
    album: 'Zankyosanka',
    provider: 'Spotify',
    copyright: '© Ufotable',
    isDuplicate: false,
    durationSeconds: 228,
    metadata: { bitrate: 320, sampleRate: 44100, channels: 2, encoder: 'LAME 3.100', genre: 'Anime', trackNumber: 1, year: 2021 },
    externalIds: { spotify: '4fEkD3YfJHqS6P8S5c5d5d', anilist: '101922' },
  },
  {
    id: 'audio-3',
    title: 'YOASOBI - Gunjou',
    mediaType: 'ending',
    format: 'flac',
    sizeBytes: 32_000_000,
    source: 'anilist',
    language: 'ja',
    status: 'active',
    usageCount: 8,
    usedBy: [
      { id: 'u-1', type: 'anime', name: 'Blue Period', url: '/anime/blue-period' },
    ],
    versions: [
      { id: 'v-1', label: 'Japanese', language: 'ja', sizeBytes: 32_000_000, format: 'flac', isOriginal: true, durationSeconds: 260, bitrate: 1411 },
      { id: 'v-2', label: 'English', language: 'en', sizeBytes: 7_500_000, format: 'mp3', isOriginal: false, durationSeconds: 260, bitrate: 320 },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded from AniList', performedBy: 'admin', timestamp: '2025-07-08T09:15:00Z' },
      { id: 'h-2', action: 'replace', description: 'Replaced with lossless version', performedBy: 'admin', timestamp: '2025-07-12T16:45:00Z' },
    ],
    qualityIndicators: ['hq', 'lossless'],
    importedAt: '2025-07-08',
    updatedAt: '2025-07-22',
    url: '/audio/blue-period-ed1.flac',
    thumbnailUrl: '/audio/thumbs/blue-period-ed1.jpg',
    checksum: 'f6g7h8i9j0k1l2m3n4o5',
    artist: 'YOASOBI',
    album: 'Gunjou',
    provider: 'AniList',
    copyright: '© Seven Arcs',
    isDuplicate: false,
    durationSeconds: 260,
    metadata: { bitrate: 1411, sampleRate: 44100, channels: 2, software: 'FL Studio', encoder: 'FLAC', genre: 'J-Pop', year: 2020 },
    externalIds: { anilist: '114234', mal: '114234' },
  },
  {
    id: 'audio-4',
    title: 'Sincerely - TRUE',
    mediaType: 'opening',
    format: 'mp3',
    sizeBytes: 7_800_000,
    source: 'tmdb',
    language: 'ja',
    status: 'active',
    usageCount: 15,
    usedBy: [
      { id: 'u-1', type: 'anime', name: 'Fullmetal Alchemist: Brotherhood', url: '/anime/fma-brotherhood' },
      { id: 'u-2', type: 'playlist', name: 'Classics', url: '/playlists/classics' },
    ],
    versions: [
      { id: 'v-1', label: 'Original', language: 'ja', sizeBytes: 7_800_000, format: 'mp3', isOriginal: true, durationSeconds: 255, bitrate: 320 },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded from TMDB', performedBy: 'admin', timestamp: '2025-07-05T11:00:00Z' },
    ],
    qualityIndicators: ['hq'],
    importedAt: '2025-07-05',
    updatedAt: '2025-07-19',
    url: '/audio/fma-brotherhood-op1.mp3',
    thumbnailUrl: '/audio/thumbs/fma-brotherhood-op1.jpg',
    artist: 'TRUE',
    album: 'Fullmetal Alchemist: Brotherhood OST',
    provider: 'TMDB',
    copyright: '© Bones',
    isDuplicate: false,
    durationSeconds: 255,
    metadata: { bitrate: 320, sampleRate: 44100, channels: 2, encoder: 'LAME 3.100', genre: 'Anime', trackNumber: 1, year: 2009 },
    externalIds: { tmdb: '123456', mal: '5114' },
  },
  {
    id: 'audio-5',
    title: 'Unravel - TK from Ling Tosite Sigure',
    mediaType: 'opening',
    format: 'flac',
    sizeBytes: 38_000_000,
    source: 'spotify',
    language: 'ja',
    status: 'active',
    usageCount: 20,
    usedBy: [
      { id: 'u-1', type: 'anime', name: 'Tokyo Ghoul', url: '/anime/tokyo-ghoul' },
      { id: 'u-2', type: 'playlist', name: 'Anime Openings', url: '/playlists/openings' },
    ],
    versions: [
      { id: 'v-1', label: 'Original', language: 'ja', sizeBytes: 38_000_000, format: 'flac', isOriginal: true, durationSeconds: 236, bitrate: 1411 },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded from Spotify', performedBy: 'admin', timestamp: '2025-06-28T12:00:00Z' },
    ],
    qualityIndicators: ['hq', 'lossless'],
    importedAt: '2025-06-28',
    updatedAt: '2025-07-15',
    url: '/audio/tokyo-ghoul-op1.flac',
    thumbnailUrl: '/audio/thumbs/tokyo-ghoul-op1.jpg',
    artist: 'TK from Ling Tosite Sigure',
    album: 'Tokyo Ghoul OST',
    provider: 'Spotify',
    copyright: '© Pierrot',
    isDuplicate: false,
    durationSeconds: 236,
    metadata: { bitrate: 1411, sampleRate: 44100, channels: 2, software: 'Adobe Audition', encoder: 'FLAC', genre: 'Rock', year: 2014 },
    externalIds: { spotify: '5K4W6rqMFWD31Cinq2eb93', anilist: '101922' },
  },
  {
    id: 'audio-6',
    title: 'The Rumbling - SiM',
    mediaType: 'opening',
    format: 'mp3',
    sizeBytes: 8_200_000,
    source: 'spotify',
    language: 'en',
    status: 'active',
    usageCount: 18,
    usedBy: [
      { id: 'u-1', type: 'anime', name: 'Attack on Titan Final Season', url: '/anime/aot-final' },
    ],
    versions: [
      { id: 'v-1', label: 'Original', language: 'en', sizeBytes: 8_200_000, format: 'mp3', isOriginal: true, durationSeconds: 210, bitrate: 320 },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded from Spotify', performedBy: 'admin', timestamp: '2025-06-25T15:30:00Z' },
    ],
    qualityIndicators: ['hq'],
    importedAt: '2025-06-25',
    updatedAt: '2025-07-10',
    url: '/audio/aot-final-op1.mp3',
    thumbnailUrl: '/audio/thumbs/aot-final-op1.jpg',
    artist: 'SiM',
    album: 'The Rumbling',
    provider: 'Spotify',
    copyright: '© MAPPA',
    isDuplicate: false,
    durationSeconds: 210,
    metadata: { bitrate: 320, sampleRate: 44100, channels: 2, encoder: 'LAME 3.100', genre: 'Metal', year: 2022 },
    externalIds: { spotify: '1Qrg8KqiBpTx0SQQbq0q0q', anilist: '101922' },
  },
  {
    id: 'audio-7',
    title: 'Gurenge - LiSA',
    mediaType: 'opening',
    format: 'flac',
    sizeBytes: 34_000_000,
    source: 'spotify',
    language: 'ja',
    status: 'active',
    usageCount: 22,
    usedBy: [
      { id: 'u-1', type: 'anime', name: 'Demon Slayer: Kimetsu no Yaiba', url: '/anime/demon-slayer' },
      { id: 'u-2', type: 'playlist', name: 'Anime Openings', url: '/playlists/openings' },
    ],
    versions: [
      { id: 'v-1', label: 'Original', language: 'ja', sizeBytes: 34_000_000, format: 'flac', isOriginal: true, durationSeconds: 235, bitrate: 1411 },
      { id: 'v-2', label: 'English', language: 'en', sizeBytes: 7_800_000, format: 'mp3', isOriginal: false, durationSeconds: 235, bitrate: 320 },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded from Spotify', performedBy: 'admin', timestamp: '2025-06-20T10:00:00Z' },
    ],
    qualityIndicators: ['hq', 'lossless'],
    importedAt: '2025-06-20',
    updatedAt: '2025-07-05',
    url: '/audio/demon-slayer-op1.flac',
    thumbnailUrl: '/audio/thumbs/demon-slayer-op1.jpg',
    checksum: 'k1l2m3n4o5p6q7r8s9t0',
    artist: 'LiSA',
    album: 'Gurenge',
    provider: 'Spotify',
    copyright: '© Ufotable',
    isDuplicate: false,
    durationSeconds: 235,
    metadata: { bitrate: 1411, sampleRate: 44100, channels: 2, software: 'Pro Tools', encoder: 'FLAC', genre: 'J-Pop', year: 2019 },
    externalIds: { spotify: '5CQ30WqJwcep0pYcV4AMNc', anilist: '101922' },
  },
  {
    id: 'audio-8',
    title: 'IDOL - YOASOBI',
    mediaType: 'opening',
    format: 'mp3',
    sizeBytes: 8_800_000,
    source: 'spotify',
    language: 'ja',
    status: 'active',
    usageCount: 25,
    usedBy: [
      { id: 'u-1', type: 'anime', name: 'Oshi no Ko', url: '/anime/oshi-no-ko' },
      { id: 'u-2', type: 'playlist', name: 'Anime Openings', url: '/playlists/openings' },
    ],
    versions: [
      { id: 'v-1', label: 'Original', language: 'ja', sizeBytes: 8_800_000, format: 'mp3', isOriginal: true, durationSeconds: 265, bitrate: 320 },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded from Spotify', performedBy: 'admin', timestamp: '2025-06-18T13:45:00Z' },
    ],
    qualityIndicators: ['hq'],
    importedAt: '2025-06-18',
    updatedAt: '2025-07-25',
    url: '/audio/oshi-no-ko-op1.mp3',
    thumbnailUrl: '/audio/thumbs/oshi-no-ko-op1.jpg',
    artist: 'YOASOBI',
    album: 'IDOL',
    provider: 'Spotify',
    copyright: '© Doga Kobo',
    isDuplicate: false,
    durationSeconds: 265,
    metadata: { bitrate: 320, sampleRate: 44100, channels: 2, encoder: 'LAME 3.100', genre: 'J-Pop', year: 2023 },
    externalIds: { spotify: '6NfrRhl5fWG3KSMQfSWqBH', anilist: '153556' },
  },
  {
    id: 'audio-9',
    title: 'Kick Back - Kenshi Yonezu (Dup)',
    mediaType: 'opening',
    format: 'flac',
    sizeBytes: 35_000_000,
    source: 'spotify',
    language: 'ja',
    status: 'duplicate',
    usageCount: 0,
    usedBy: [],
    versions: [
      { id: 'v-1', label: 'Original', language: 'ja', sizeBytes: 35_000_000, format: 'flac', isOriginal: true, durationSeconds: 245, bitrate: 1411 },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Duplicate detected', performedBy: 'system', timestamp: '2025-07-15T11:00:00Z' },
    ],
    qualityIndicators: [],
    importedAt: '2025-07-15',
    updatedAt: '2025-07-15',
    url: '/audio/chainsaw-man-op1-dup.flac',
    thumbnailUrl: '/audio/thumbs/chainsaw-man-op1-dup.jpg',
    artist: 'Kenshi Yonezu',
    provider: 'Spotify',
    copyright: '© MAPPA',
    isDuplicate: true,
    durationSeconds: 245,
    metadata: { bitrate: 1411, sampleRate: 44100, channels: 2, encoder: 'FLAC', genre: 'Anime', year: 2022 },
    externalIds: { spotify: '6rqhFgbbKwnb9MLmUQDhG6' },
  },
  {
    id: 'audio-10',
    title: 'Bocchi the Rock! - Guitar to Watashi',
    mediaType: 'ending',
    format: 'mp3',
    sizeBytes: 7_200_000,
    source: 'anilist',
    language: 'ja',
    status: 'unused',
    usageCount: 0,
    usedBy: [],
    versions: [
      { id: 'v-1', label: 'Original', language: 'ja', sizeBytes: 7_200_000, format: 'mp3', isOriginal: true, durationSeconds: 195, bitrate: 256 },
    ],
    history: [
      { id: 'h-1', action: 'upload', description: 'Uploaded from AniList', performedBy: 'admin', timestamp: '2025-06-15T09:30:00Z' },
    ],
    qualityIndicators: [],
    importedAt: '2025-06-15',
    updatedAt: '2025-06-15',
    url: '/audio/bocchi-ed1.mp3',
    thumbnailUrl: '/audio/thumbs/bocchi-ed1.jpg',
    artist: 'Kessoku Band',
    album: 'Bocchi the Rock! OST',
    provider: 'AniList',
    copyright: '© CloverWorks',
    isDuplicate: false,
    durationSeconds: 195,
    metadata: { bitrate: 256, sampleRate: 44100, channels: 2, encoder: 'LAME 3.100', genre: 'Rock', year: 2022 },
    externalIds: { anilist: '143498' },
  },
]
