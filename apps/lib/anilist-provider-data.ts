export type ProviderStatus = "connected" | "disconnected" | "error" | "syncing";

export type JobStatus = "completed" | "running" | "failed" | "queued" | "cancelled";
export type JobType =
  | "list-sync"
  | "metadata-refresh"
  | "chart-update"
  | "character-sync"
  | "seasonal-fetch";

export type LogLevel = "info" | "warn" | "error" | "debug";

export type AniListMediaType = "anime" | "manga";
export type AniListMediaFormat =
  | "TV"
  | "TV_SHORT"
  | "MOVIE"
  | "OVA"
  | "ONA"
  | "SPECIAL"
  | "MANGA"
  | "NOVEL"
  | "ONE_SHOT";
export type AniListMediaStatus =
  | "FINISHING"
  | "FINISHED"
  | "RELEASING"
  | "NOT_YET_RELEASED"
  | "CANCELLED"
  | "HIATUS";
export type AniListListStatus =
  | "CURRENT"
  | "PLANNING"
  | "COMPLETED"
  | "DROPPED"
  | "PAUSED"
  | "REPEATING";

export interface ProviderInfo {
  id: string;
  name: string;
  slug: string;
  type: "anilist";
  status: ProviderStatus;
  version: string;
  apiUrl: string;
  lastSyncAt: string | null;
  totalTracked: number;
  oauthValid: boolean;
  rateLimitRemaining: number;
  rateLimitMax: number;
}

export interface ProviderStats {
  totalTracked: number;
  animeTracked: number;
  mangaTracked: number;
  totalAnimeEntries: number;
  totalMangaEntries: number;
  apiCallsToday: number;
  apiCallsLimit: number;
  lastSyncDuration: string;
  syncErrors: number;
  averageScore: number;
  watchHours: number;
  chaptersRead: number;
}

export interface ListCategory {
  id: string;
  type: AniListMediaType;
  status: AniListListStatus;
  label: string;
  count: number;
  lastSyncedAt: string | null;
  enabled: boolean;
  autoSync: boolean;
}

export interface SyncJob {
  id: string;
  type: JobType;
  status: JobStatus;
  target: string | null;
  startedAt: string;
  completedAt: string | null;
  progress: number;
  itemsProcessed: number;
  itemsTotal: number;
  errors: number;
  duration: string | null;
  triggeredBy: "manual" | "scheduled" | "webhook";
}

export interface MediaMapping {
  id: string;
  kamiId: string;
  kamiTitle: string;
  anilistId: string;
  anilistTitle: string;
  type: AniListMediaType;
  format: AniListMediaFormat;
  externalIds: {
    myAnimeList?: string;
    tmdb?: string;
    imdb?: string;
    kitsu?: string;
  };
  lastSyncedAt: string;
  matchScore: number;
}

export interface ProviderCapability {
  id: string;
  name: string;
  description: string;
  supported: boolean;
  enabled: boolean;
  version?: string;
}

export interface ProviderLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  source: string;
  details?: string;
}

export interface ProviderSettings {
  graphqlUrl: string;
  apiKey: string;
  oauthToken: string;
  oauthRefreshToken: string;
  timeout: number;
  autoSync: boolean;
  syncInterval: number;
  syncOnStartup: boolean;
  trackAnime: boolean;
  trackManga: boolean;
  syncRatings: boolean;
  syncWatchHistory: boolean;
  syncReadingProgress: boolean;
  fetchCharacterData: boolean;
  fetchStaffData: boolean;
  fetchSeasonalCharts: boolean;
  autoAddToList: boolean;
  defaultScoreFormat:
    | "POINT_10"
    | "POINT_10_DECIMAL"
    | "POINT_100"
    | "POINT_5"
    | "POINT_3"
    | "SMILEY"
    | "TEXT";
  notificationsEnabled: boolean;
  webhookEnabled: boolean;
  webhookUrl: string;
}

export interface AniListProviderData {
  provider: ProviderInfo;
  stats: ProviderStats;
  lists: ListCategory[];
  jobs: SyncJob[];
  mappings: MediaMapping[];
  capabilities: ProviderCapability[];
  logs: ProviderLog[];
  settings: ProviderSettings;
}

export const anilistProviderData: AniListProviderData = {
  provider: {
    id: "anilist-001",
    name: "AniList",
    slug: "anilist",
    type: "anilist",
    status: "connected",
    version: "GraphQL v2",
    apiUrl: "https://graphql.anilist.co",
    lastSyncAt: "2026-07-26T10:00:00Z",
    totalTracked: 347,
    oauthValid: true,
    rateLimitRemaining: 88,
    rateLimitMax: 90,
  },
  stats: {
    totalTracked: 347,
    animeTracked: 214,
    mangaTracked: 133,
    totalAnimeEntries: 18472,
    totalMangaEntries: 9234,
    apiCallsToday: 1247,
    apiCallsLimit: 5000,
    lastSyncDuration: "1m 42s",
    syncErrors: 2,
    averageScore: 7.8,
    watchHours: 2847,
    chaptersRead: 4521,
  },
  lists: [
    {
      id: "list-1",
      type: "anime",
      status: "CURRENT",
      label: "Watching",
      count: 12,
      lastSyncedAt: "2026-07-26T10:00:00Z",
      enabled: true,
      autoSync: true,
    },
    {
      id: "list-2",
      type: "anime",
      status: "PLANNING",
      label: "Plan to Watch",
      count: 89,
      lastSyncedAt: "2026-07-26T10:00:00Z",
      enabled: true,
      autoSync: true,
    },
    {
      id: "list-3",
      type: "anime",
      status: "COMPLETED",
      label: "Completed",
      count: 98,
      lastSyncedAt: "2026-07-26T10:00:00Z",
      enabled: true,
      autoSync: true,
    },
    {
      id: "list-4",
      type: "anime",
      status: "DROPPED",
      label: "Dropped",
      count: 7,
      lastSyncedAt: "2026-07-26T10:00:00Z",
      enabled: true,
      autoSync: false,
    },
    {
      id: "list-5",
      type: "anime",
      status: "PAUSED",
      label: "On Hold",
      count: 8,
      lastSyncedAt: "2026-07-25T10:00:00Z",
      enabled: true,
      autoSync: false,
    },
    {
      id: "list-6",
      type: "manga",
      status: "CURRENT",
      label: "Reading",
      count: 15,
      lastSyncedAt: "2026-07-26T10:00:00Z",
      enabled: true,
      autoSync: true,
    },
    {
      id: "list-7",
      type: "manga",
      status: "PLANNING",
      label: "Plan to Read",
      count: 67,
      lastSyncedAt: "2026-07-26T10:00:00Z",
      enabled: true,
      autoSync: true,
    },
    {
      id: "list-8",
      type: "manga",
      status: "COMPLETED",
      label: "Completed",
      count: 41,
      lastSyncedAt: "2026-07-26T10:00:00Z",
      enabled: true,
      autoSync: true,
    },
    {
      id: "list-9",
      type: "manga",
      status: "DROPPED",
      label: "Dropped",
      count: 5,
      lastSyncedAt: "2026-07-24T10:00:00Z",
      enabled: false,
      autoSync: false,
    },
    {
      id: "list-10",
      type: "manga",
      status: "PAUSED",
      label: "On Hold",
      count: 5,
      lastSyncedAt: "2026-07-23T10:00:00Z",
      enabled: true,
      autoSync: false,
    },
  ],
  jobs: [
    {
      id: "job-1",
      type: "list-sync",
      status: "completed",
      target: "All Lists",
      startedAt: "2026-07-26T10:00:00Z",
      completedAt: "2026-07-26T10:01:42Z",
      progress: 100,
      itemsProcessed: 347,
      itemsTotal: 347,
      errors: 2,
      duration: "1m 42s",
      triggeredBy: "scheduled",
    },
    {
      id: "job-2",
      type: "metadata-refresh",
      status: "running",
      target: "Watching",
      startedAt: "2026-07-26T10:15:00Z",
      completedAt: null,
      progress: 58,
      itemsProcessed: 7,
      itemsTotal: 12,
      errors: 0,
      duration: null,
      triggeredBy: "manual",
    },
    {
      id: "job-3",
      type: "seasonal-fetch",
      status: "completed",
      target: "Summer 2026",
      startedAt: "2026-07-26T06:00:00Z",
      completedAt: "2026-07-26T06:00:45Z",
      progress: 100,
      itemsProcessed: 186,
      itemsTotal: 186,
      errors: 0,
      duration: "45s",
      triggeredBy: "scheduled",
    },
    {
      id: "job-4",
      type: "chart-update",
      status: "completed",
      target: "Top Anime",
      startedAt: "2026-07-26T05:30:00Z",
      completedAt: "2026-07-26T05:31:10Z",
      progress: 100,
      itemsProcessed: 50,
      itemsTotal: 50,
      errors: 0,
      duration: "1m 10s",
      triggeredBy: "scheduled",
    },
    {
      id: "job-5",
      type: "character-sync",
      status: "failed",
      target: "Neon Samurai",
      startedAt: "2026-07-26T04:00:00Z",
      completedAt: "2026-07-26T04:00:30Z",
      progress: 35,
      itemsProcessed: 8,
      itemsTotal: 23,
      errors: 5,
      duration: "30s",
      triggeredBy: "manual",
    },
    {
      id: "job-6",
      type: "list-sync",
      status: "completed",
      target: "All Lists",
      startedAt: "2026-07-26T04:00:00Z",
      completedAt: "2026-07-26T04:01:38Z",
      progress: 100,
      itemsProcessed: 347,
      itemsTotal: 347,
      errors: 0,
      duration: "1m 38s",
      triggeredBy: "scheduled",
    },
  ],
  mappings: [
    {
      id: "map-1",
      kamiId: "ks-anime-001",
      kamiTitle: "Neon Samurai",
      anilistId: "21",
      anilistTitle: "Neon Samurai",
      type: "anime",
      format: "TV",
      externalIds: { myAnimeList: "12345", tmdb: "12345", kitsu: "1234" },
      lastSyncedAt: "2026-07-26T10:00:00Z",
      matchScore: 100,
    },
    {
      id: "map-2",
      kamiId: "ks-anime-002",
      kamiTitle: "Cyber Resonance",
      anilistId: "22",
      anilistTitle: "Cyber Resonance",
      type: "anime",
      format: "TV",
      externalIds: { myAnimeList: "12346", kitsu: "1235" },
      lastSyncedAt: "2026-07-26T10:00:00Z",
      matchScore: 100,
    },
    {
      id: "map-3",
      kamiId: "ks-anime-003",
      kamiTitle: "Phantom Circuit",
      anilistId: "23",
      anilistTitle: "Phantom Circuit",
      type: "anime",
      format: "TV",
      externalIds: { myAnimeList: "12347" },
      lastSyncedAt: "2026-07-26T10:00:00Z",
      matchScore: 95,
    },
    {
      id: "map-4",
      kamiId: "ks-anime-004",
      kamiTitle: "Quantum Phase",
      anilistId: "24",
      anilistTitle: "Quantum Phase (2025)",
      type: "anime",
      format: "TV",
      externalIds: { myAnimeList: "12348", tmdb: "12348" },
      lastSyncedAt: "2026-07-26T10:00:00Z",
      matchScore: 88,
    },
    {
      id: "map-5",
      kamiId: "ks-anime-005",
      kamiTitle: "Ethereal Blade",
      anilistId: "25",
      anilistTitle: "Ethereal Blade",
      type: "anime",
      format: "TV",
      externalIds: { myAnimeList: "12349" },
      lastSyncedAt: "2026-07-25T10:00:00Z",
      matchScore: 100,
    },
    {
      id: "map-6",
      kamiId: "ks-manga-001",
      kamiTitle: "Stellar Drift",
      anilistId: "1001",
      anilistTitle: "Stellar Drift",
      type: "manga",
      format: "MANGA",
      externalIds: { myAnimeList: "20001" },
      lastSyncedAt: "2026-07-26T10:00:00Z",
      matchScore: 100,
    },
    {
      id: "map-7",
      kamiId: "ks-manga-002",
      kamiTitle: "Dark Horizon",
      anilistId: "1002",
      anilistTitle: "Dark Horizon",
      type: "manga",
      format: "NOVEL",
      externalIds: { myAnimeList: "20002" },
      lastSyncedAt: "2026-07-26T10:00:00Z",
      matchScore: 92,
    },
    {
      id: "map-8",
      kamiId: "ks-anime-006",
      kamiTitle: "Moonlit Serenade",
      anilistId: "26",
      anilistTitle: "Moonlit Serenade",
      type: "anime",
      format: "MOVIE",
      externalIds: { myAnimeList: "12350", tmdb: "12350", imdb: "tt3456789" },
      lastSyncedAt: "2026-07-24T10:00:00Z",
      matchScore: 76,
    },
  ],
  capabilities: [
    {
      id: "cap-1",
      name: "Anime Tracking",
      description: "Track anime watching progress and scores",
      supported: true,
      enabled: true,
      version: "2.0",
    },
    {
      id: "cap-2",
      name: "Manga Tracking",
      description: "Track manga reading progress and scores",
      supported: true,
      enabled: true,
      version: "2.0",
    },
    {
      id: "cap-3",
      name: "List Management",
      description: "Sync anime and manga lists (Watching, Completed, etc.)",
      supported: true,
      enabled: true,
    },
    {
      id: "cap-4",
      name: "Metadata Fetch",
      description: "Retrieve anime/manga metadata via GraphQL",
      supported: true,
      enabled: true,
    },
    {
      id: "cap-5",
      name: "Character Data",
      description: "Fetch character and staff information",
      supported: true,
      enabled: true,
    },
    {
      id: "cap-6",
      name: "Seasonal Charts",
      description: "Sync seasonal anime charts and trends",
      supported: true,
      enabled: true,
      version: "1.0",
    },
    {
      id: "cap-7",
      name: "User Reviews",
      description: "Sync user reviews and ratings",
      supported: true,
      enabled: false,
    },
    {
      id: "cap-8",
      name: "Activity Feed",
      description: "Track user activity and social feed",
      supported: true,
      enabled: false,
    },
    {
      id: "cap-9",
      name: "Recommendations",
      description: "Fetch personalized anime/manga recommendations",
      supported: true,
      enabled: true,
    },
    {
      id: "cap-10",
      name: "Genre Tags",
      description: "Sync genre and tag metadata",
      supported: true,
      enabled: true,
    },
    {
      id: "cap-11",
      name: "Studio Data",
      description: "Fetch studio and producer information",
      supported: true,
      enabled: false,
    },
    {
      id: "cap-12",
      name: "Forum Integration",
      description: "Access AniList forum discussions",
      supported: false,
      enabled: false,
    },
  ],
  logs: [
    {
      id: "log-1",
      timestamp: "2026-07-26T10:01:42Z",
      level: "info",
      message: "List sync completed: 347 entries (2 warnings)",
      source: "list-sync",
    },
    {
      id: "log-2",
      timestamp: "2026-07-26T10:00:15Z",
      level: "warn",
      message: "Rate limit nearing threshold: 88/90 requests used",
      source: "rate-limiter",
    },
    {
      id: "log-3",
      timestamp: "2026-07-26T10:00:00Z",
      level: "info",
      message: "Scheduled list sync initiated",
      source: "scheduler",
    },
    {
      id: "log-4",
      timestamp: "2026-07-26T06:00:45Z",
      level: "info",
      message: "Seasonal fetch completed: Summer 2026 (186 titles)",
      source: "seasonal-fetch",
    },
    {
      id: "log-5",
      timestamp: "2026-07-26T05:31:10Z",
      level: "info",
      message: "Chart update completed: Top Anime (50 entries)",
      source: "chart-updater",
    },
    {
      id: "log-6",
      timestamp: "2026-07-26T04:00:30Z",
      level: "error",
      message: 'Character sync failed for "Neon Samurai"',
      source: "character-sync",
      details: "5 items failed: GraphQL timeout after 15s. Partial data retrieved.",
    },
    {
      id: "log-7",
      timestamp: "2026-07-26T04:00:00Z",
      level: "info",
      message: "Nightly list sync completed",
      source: "scheduler",
    },
    {
      id: "log-8",
      timestamp: "2026-07-25T22:15:00Z",
      level: "debug",
      message: "Webhook received: media.updated",
      source: "webhook-server",
      details: '{"mediaId":"21","type":"anime","status":"RELEASING"}',
    },
    {
      id: "log-9",
      timestamp: "2026-07-25T18:00:00Z",
      level: "info",
      message: "OAuth token refreshed successfully",
      source: "auth",
    },
    {
      id: "log-10",
      timestamp: "2026-07-25T14:30:00Z",
      level: "warn",
      message: "Slow GraphQL response: 2,800ms (threshold: 2,000ms)",
      source: "graphql-client",
    },
  ],
  settings: {
    graphqlUrl: "https://graphql.anilist.co",
    apiKey: "al_k9mNpQrStUvWxYzAbCdEf",
    oauthToken: "al_oauth_xK9mNpQrStUvWxYz",
    oauthRefreshToken: "al_refresh_aBcDeFgHiJkLmNoP",
    timeout: 15,
    autoSync: true,
    syncInterval: 3600,
    syncOnStartup: true,
    trackAnime: true,
    trackManga: true,
    syncRatings: true,
    syncWatchHistory: true,
    syncReadingProgress: true,
    fetchCharacterData: true,
    fetchStaffData: false,
    fetchSeasonalCharts: true,
    autoAddToList: false,
    defaultScoreFormat: "POINT_10_DECIMAL",
    notificationsEnabled: true,
    webhookEnabled: true,
    webhookUrl: "https://kami-sama.app/api/webhooks/anilist",
  },
};
