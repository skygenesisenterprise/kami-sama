import { apiRequest } from "@/lib/api/client";
import type {
  DataSource,
  ExternalIds,
  PublicationState,
  SeriesItem,
  SeriesSource,
  SeriesType,
} from "@/lib/series-catalog-data";
import type { MovieItem, MovieSource } from "@/lib/movies-catalog-data";
import type {
  TvShowItem,
  TvShowSeason,
  TvShowSource,
} from "@/lib/tv-shows-catalog-data";

/**
 * Catalog (anime) API client + mapper between the backend `Anime` model and the
 * rich front-end `SeriesItem` shape used by the series catalog pages.
 *
 * Backing endpoints: /api/v1/anime* (list, get, create, update, delete).
 *
 * The backend persists editorial status in `anime.status` (e.g. "added",
 * "draft", "published") and provider metadata (airing status, external IDs,
 * source links) in the `metadata` JSONB column.
 */

export interface ApiAnimeSource {
  provider: string;
  externalId: string;
  status: string;
  lastSyncedAt: string;
}

export interface ApiAnimeSeason {
  id: string;
  number: number;
  title?: string | null;
  episodeCount: number;
  airDate?: string | null;
}

export interface ApiAnime {
  id: string;
  slug: string;
  title: string;
  japaneseTitle?: string | null;
  synopsis?: string | null;
  coverImageUrl?: string | null;
  bannerImageUrl?: string | null;
  trailerUrl?: string | null;
  status: string;
  rating: number;
  totalEpisodes: number;
  releaseYear: number;
  season?: string | null;
  source?: string | null;
  ageRating?: string | null;
  isFeatured: boolean;
  isTrending: boolean;
  parentAnimeId?: string | null;
  metadata?: Record<string, unknown> | null;
  genres?: { id: string; name: string; slug: string }[];
  studios?: { id: string; name: string; slug: string; logoUrl?: string | null }[];
  seasons?: ApiAnimeSeason[];
  children?: ApiAnime[];
  createdAt: string;
  updatedAt: string;
}

/** Providers the admin movie / tv-show data models recognize — used to keep
 *  only compatible source badges when mapping persisted rows. */
const MOVIE_SOURCE_PROVIDERS = new Set<string>([
  'Plex',
  'Jellyfin',
  'IMDb',
  'TMDB',
])
const TV_SHOW_SOURCE_PROVIDERS = new Set<string>([
  'Plex',
  'Jellyfin',
  'TMDB',
  'IMDb',
  'TheTVDB',
  'Trakt',
  'TMDb',
])

export interface AnimeListParams {
  page?: number;
  limit?: number;
  q?: string;
  sort?: string;
  status?: string;
}

export interface AnimeListResult {
  items: ApiAnime[];
  total: number;
}

export interface CreateAnimePayload {
  title: string;
  japaneseTitle: string;
  synopsis: string;
  coverImageUrl: string;
  bannerImageUrl: string;
  trailerUrl: string;
  status: string;
  rating: number;
  totalEpisodes: number;
  releaseYear: number;
  season: string;
  source: string;
  ageRating: string;
  airingStatus: string;
  externalIds: Record<string, string>;
  sources: ApiAnimeSource[];
  genreIds: string[];
  studioIds: string[];
}

export type UpdateAnimePayload = Partial<CreateAnimePayload>;

function qs(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const suffix = search.toString();
  return suffix ? `?${suffix}` : "";
}

export const animeApi = {
  async list(params: AnimeListParams = {}): Promise<AnimeListResult> {
    const { page = 1, limit = 100, q, sort, status } = params;
    return apiRequest<AnimeListResult>(
      `/anime${qs({ page, limit, q, sort, status })}`
    );
  },

  get(animeId: string): Promise<ApiAnime> {
    return apiRequest<ApiAnime>(`/anime/${encodeURIComponent(animeId)}`);
  },

  create(payload: CreateAnimePayload): Promise<ApiAnime> {
    return apiRequest<ApiAnime, CreateAnimePayload>("/anime", {
      method: "POST",
      body: payload,
    });
  },

  update(animeId: string, payload: UpdateAnimePayload): Promise<ApiAnime> {
    return apiRequest<ApiAnime, UpdateAnimePayload>(
      `/anime/${encodeURIComponent(animeId)}`,
      { method: "PATCH", body: payload }
    );
  },

  remove(animeId: string): Promise<{ deleted: boolean }> {
    return apiRequest<{ deleted: boolean }>(`/anime/${encodeURIComponent(animeId)}`, {
      method: "DELETE",
    });
  },

  sync(animeId: string): Promise<ApiAnime> {
    return apiRequest<ApiAnime>(`/anime/${encodeURIComponent(animeId)}/sync`, {
      method: "POST",
    });
  },
};

// ──────────────────────────────────────────────────────────────
// Mapping
// ──────────────────────────────────────────────────────────────

const PUBLICATION_FROM_API: Record<string, PublicationState> = {
  added: "Added",
  draft: "Draft",
  review: "Review",
  approved: "Approved",
  scheduled: "Scheduled",
  published: "Published",
  archived: "Archived",
};

export function apiAnimeToSeriesItem(a: ApiAnime): SeriesItem {
  const meta = a.metadata ?? {};
  const airing = str(meta.airing_status) || a.status;
  const genres = extractGenres(a, meta);
  const external = extractExternalIds(a, meta);
  const sources = extractSources(a, meta, external);
  const poster =
    a.coverImageUrl || str(meta.imageUrl) || str(meta.coverImage) || "";
  const banner =
    a.bannerImageUrl || str(meta.artUrl) || str(meta.bannerImage) || poster;

  // Collect seasons from this anime and all its children
  const allSeasons: { id: string; number: number; title: string; episodeCount: number; year: number; aired: boolean }[] = [];
  
  // Add seasons from this anime
  for (const s of a.seasons ?? []) {
    allSeasons.push({
      id: s.id,
      number: s.number,
      title: s.title ?? "",
      episodeCount: s.episodeCount,
      year: yearFromAirDate(s.airDate) ?? a.releaseYear,
      aired: !s.airDate,
    });
  }
  
  // Add seasons from children (sequels/prequels)
  for (const child of a.children ?? []) {
    for (const s of child.seasons ?? []) {
      allSeasons.push({
        id: s.id,
        number: s.number,
        title: s.title ?? "",
        episodeCount: s.episodeCount,
        year: yearFromAirDate(s.airDate) ?? child.releaseYear,
        aired: !s.airDate,
      });
    }
  }

  // Sort seasons by number
  allSeasons.sort((x, y) => x.number - y.number);

  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    titleOriginal: a.japaneseTitle ?? "",
    synopsis: a.synopsis ?? "",
    type: mapSeriesType(a),
    status: mapPublicationStatus(a.status),
    airingStatus: mapAiringStatus(airing),
    genres,
    studios: (a.studios ?? []).map((s) => s.name),
    tags: [],
    year: a.releaseYear,
    rating: a.rating,
    seasonCount: allSeasons.length,
    totalEpisodes: a.totalEpisodes,
    ageRating: a.ageRating ?? "Unknown",
    assets: { poster, banner, backdrop: banner || poster },
    externalIds: external,
    sources,
    seasons: allSeasons,
    relations: [],
    metadataStatus: sources.length > 0 ? "synced" : "missing",
    updatedAt: timeAgo(a.updatedAt),
    updatedBy: "API",
  };
}

export type AnimeContentKind = "series" | "movie" | "tv-show"

/**
 * Classifies a backend anime row into the admin catalog kind. Plex rows carry
 * metadata.type ("Movie" / "Series"), AniList rows carry metadata.format
 * ("MOVIE", "TV", "ONA", …). Anything without a movie hint stays a series
 * so movies are never flattened into the series tab.
 */
export function animeContentKind(a: ApiAnime): AnimeContentKind {
  const meta = a.metadata ?? {}
  const type = str(meta.type).toLowerCase()
  const format = str(meta.format).toLowerCase()
  if (type === "movie" || format === "movie") return "movie"
  if (type === "series" || type === "show") return "tv-show"
  return "series"
}

/** Maps a backend anime row to the admin MovieItem shape (metadata + assets). */
export function apiAnimeToMovieItem(a: ApiAnime): MovieItem {
  const meta = a.metadata ?? {}
  const external = extractExternalIds(a, meta)
  // Keep only providers the movie data model knows about (display-only).
  const sources = (extractSources(a, meta, external) as unknown as MovieSource[]).filter(
    (s) => MOVIE_SOURCE_PROVIDERS.has(s.provider),
  )
  const poster = a.coverImageUrl || str(meta.imageUrl) || str(meta.coverImage) || ""
  const banner = a.bannerImageUrl || str(meta.artUrl) || str(meta.bannerImage) || poster
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    titleOriginal: a.japaneseTitle ?? "",
    synopsis: a.synopsis ?? "",
    status: mapPublicationStatus(a.status),
    genres: extractGenres(a, meta),
    director: "",
    writers: [],
    cast: [],
    tags: [],
    year: a.releaseYear,
    rating: a.rating,
    duration: 0,
    ageRating: a.ageRating ?? "Unknown",
    assets: { poster, banner, backdrop: banner || poster },
    externalIds: external,
    sources,
    relations: [],
    metadataStatus: sources.length > 0 ? "synced" : "missing",
    updatedAt: timeAgo(a.updatedAt),
    updatedBy: "API",
  }
}

/** Maps a backend anime row to the admin TvShowItem shape (seasons included). */
export function apiAnimeToTvShowItem(a: ApiAnime): TvShowItem {
  const meta = a.metadata ?? {}
  const airing = str(meta.airing_status) || a.status
  const external = extractExternalIds(a, meta)
  // Keep only providers the tv-show data model knows about (display-only).
  const sources = (extractSources(a, meta, external) as unknown as TvShowSource[]).filter(
    (s) => TV_SHOW_SOURCE_PROVIDERS.has(s.provider),
  )
  const poster = a.coverImageUrl || str(meta.imageUrl) || str(meta.coverImage) || ""
  const banner = a.bannerImageUrl || str(meta.artUrl) || str(meta.bannerImage) || poster
  const seasons: TvShowSeason[] = (a.seasons ?? []).map((s) => ({
    id: s.id,
    number: s.number,
    title: s.title ?? "",
    episodeCount: s.episodeCount,
    year: yearFromAirDate(s.airDate) ?? a.releaseYear,
    aired: !s.airDate,
  }))
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    titleOriginal: a.japaneseTitle ?? "",
    synopsis: a.synopsis ?? "",
    type: "animation",
    status: mapPublicationStatus(a.status),
    airingStatus: mapAiringStatus(airing),
    genres: extractGenres(a, meta),
    networks: [],
    tags: [],
    year: a.releaseYear,
    rating: a.rating,
    seasonCount: seasons.length,
    totalEpisodes: a.totalEpisodes,
    ageRating: a.ageRating ?? "Unknown",
    assets: { poster, banner, backdrop: banner || poster },
    externalIds: external,
    sources,
    seasons,
    relations: [],
    metadataStatus: sources.length > 0 ? "synced" : "missing",
    updatedAt: timeAgo(a.updatedAt),
    updatedBy: "API",
  }
}

export function seriesItemToAnimeCreatePayload(item: SeriesItem): CreateAnimePayload {
  return {
    title: item.title,
    japaneseTitle: item.titleOriginal,
    synopsis: item.synopsis,
    coverImageUrl: item.assets.poster,
    bannerImageUrl: item.assets.banner,
    trailerUrl: "",
    status: publicationToApi(item.status),
    rating: item.rating,
    totalEpisodes: item.totalEpisodes,
    releaseYear: item.year,
    season: "",
    source: item.sources[0]?.provider.toLowerCase() ?? "",
    ageRating: item.ageRating,
    airingStatus: item.airingStatus,
    externalIds: pickExternalIds(item.externalIds),
    sources: item.sources.map((s) => ({
      provider: s.provider,
      externalId: s.externalId,
      status: s.status,
      lastSyncedAt: s.lastSyncedAt,
    })),
    genreIds: [],
    studioIds: [],
  };
}

export function seriesItemToAnimeUpdatePayload(item: SeriesItem): UpdateAnimePayload {
  return {
    title: item.title,
    japaneseTitle: item.titleOriginal,
    synopsis: item.synopsis,
    coverImageUrl: item.assets.poster,
    bannerImageUrl: item.assets.banner,
    status: publicationToApi(item.status),
    rating: item.rating,
    totalEpisodes: item.totalEpisodes,
    releaseYear: item.year,
    ageRating: item.ageRating,
    airingStatus: item.airingStatus,
    externalIds: pickExternalIds(item.externalIds),
    sources: item.sources.map((s) => ({
      provider: s.provider,
      externalId: s.externalId,
      status: s.status,
      lastSyncedAt: s.lastSyncedAt,
    })),
  };
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

function str(v: unknown): string {
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return "";
}

function publicationToApi(status: PublicationState): string {
  return status.toLowerCase();
}

function mapPublicationStatus(status: string): PublicationState {
  return PUBLICATION_FROM_API[status.toLowerCase()] ?? "Added";
}

function mapSeriesType(a: ApiAnime): SeriesType {
  const contentType = (a as { contentType?: string | null }).contentType;
  if (contentType === "movie") return "animation";
  if (contentType === "ova" || contentType === "special") return "anime";
  return "anime";
}

function mapAiringStatus(status: string): SeriesItem["airingStatus"] {
  switch (status.toLowerCase()) {
    case "airing":
    case "currently_airing":
      return "airing";
    case "complete":
    case "completed":
    case "finished":
    case "finished_airing":
      return "completed";
    case "upcoming":
    case "not_yet_aired":
    case "not_yet_published":
      return "upcoming";
    case "hiatus":
    case "on_hiatus":
    case "cancelled":
      return "hiatus";
    default:
      return "upcoming";
  }
}

function extractGenres(a: ApiAnime, meta: Record<string, unknown>): string[] {
  const fromRelations = (a.genres ?? []).map((g) => g.name).filter(Boolean);
  if (fromRelations.length > 0) return fromRelations;
  const g = meta.genres;
  if (!Array.isArray(g)) return [];
  return g
    .map((x) => {
      if (typeof x === "string") return x;
      if (x && typeof x === "object" && "name" in x) return String((x as { name: unknown }).name);
      return "";
    })
    .filter(Boolean);
}

function extractExternalIds(
  a: ApiAnime,
  meta: Record<string, unknown>
): ExternalIds {
  const out: ExternalIds = {};
  const ext = meta.external_ids;
  if (ext && typeof ext === "object") {
    for (const [key, value] of Object.entries(ext as Record<string, unknown>)) {
      if (typeof value !== "string" || !value) continue;
      const k = key.toLowerCase();
      if (k === "myanimelist" || k === "mal") out.myAnimeList = value;
      else if (k === "anilist") out.anilist = value;
      else if (k === "plex") out.plex = value;
      else if (k === "tmdb") out.tmdb = value;
      else if (k === "imdb") out.imdb = value;
      else if (k === "thetvdb") out.thetvdb = value;
      else if (k === "kitsu") out.kitsu = value;
      else if (k === "jellyfin") out.jellyfin = value;
    }
  }
  if (!out.myAnimeList) {
    const v = str(meta.mal_id);
    if (v) out.myAnimeList = v;
  }
  if (!out.anilist) {
    const v = str(meta.anilist_id);
    if (v) out.anilist = v;
  }
  if (!out.plex) {
    const v = str(meta.sourceId);
    if (v) out.plex = v;
  }
  return out;
}

function extractSources(
  a: ApiAnime,
  meta: Record<string, unknown>,
  external: ExternalIds
): SeriesSource[] {
  const raw = meta.sources;
  if (Array.isArray(raw) && raw.length > 0) {
    return raw
      .map((s): SeriesSource | null => {
        if (!s || typeof s !== "object") return null;
        const provider = str((s as { provider?: unknown }).provider);
        const externalId = str((s as { externalId?: unknown }).externalId);
        if (!provider || !externalId) return null;
        const status = str((s as { status?: unknown }).status);
        const last = str((s as { lastSyncedAt?: unknown }).lastSyncedAt);
        return {
          provider: provider as DataSource,
          externalId,
          status:
            status === "active" || status === "error" || status === "inactive"
              ? (status as SeriesSource["status"])
              : "active",
          lastSyncedAt:
            last || new Date(a.updatedAt).toISOString(),
        };
      })
      .filter((s): s is SeriesSource => s !== null);
  }

  const out: SeriesSource[] = [];
  const syncAt = new Date(a.updatedAt).toISOString();
  if (external.myAnimeList)
    out.push({ provider: "MyAnimeList", externalId: external.myAnimeList, lastSyncedAt: syncAt, status: "active" });
  if (external.anilist)
    out.push({ provider: "AniList", externalId: external.anilist, lastSyncedAt: syncAt, status: "active" });
  if (external.plex)
    out.push({ provider: "Plex", externalId: external.plex, lastSyncedAt: syncAt, status: "active" });
  return out;
}

function pickExternalIds(ext: ExternalIds): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(ext)) {
    if (value) out[key] = value;
  }
  return out;
}

function yearFromAirDate(airDate?: string | null): number | undefined {
  if (!airDate) return undefined;
  const m = airDate.match(/(20\d{2}|19\d{2})/);
  return m ? Number(m[1]) : undefined;
}

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "just now";
  const diff = Date.now() - t;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}
