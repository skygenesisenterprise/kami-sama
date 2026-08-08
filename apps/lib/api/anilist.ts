import { apiRequest } from "@/lib/api/client";

/**
 * Dedicated AniList integration client.
 *
 * Backing endpoints:
 *  - /api/v1/integrations/anilist/* (search, trending, popular, seasonal)
 */

export interface AniListSearchItem {
  anilistId: number;
  title: string;
  japaneseTitle: string;
  format: string;
  status: string;
  coverImage: string;
  bannerImage: string;
  episodes?: number | null;
  averageScore?: number | null;
  genres: string[];
  siteUrl: string;
}

export interface AniListSearchResult {
  items: AniListSearchItem[];
  total: number;
  page: number;
  hasNext: boolean;
}

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

export const anilistApi = {
  /** Full-text search against AniList (defaults to ANIME). */
  search(
    query: string,
    opts: { type?: string; page?: number; perPage?: number } = {}
  ) {
    const { type = "ANIME", page = 1, perPage = 10 } = opts;
    return apiRequest<AniListSearchResult>(
      `/integrations/anilist/search${qs({ q: query, type, page, perPage })}`
    );
  },

  /** Currently trending media. */
  trending(opts: { type?: string; page?: number; perPage?: number } = {}) {
    const { type = "ANIME", page = 1, perPage = 50 } = opts;
    return apiRequest<AniListSearchResult>(
      `/integrations/anilist/trending${qs({ type, page, perPage })}`
    );
  },

  /** All-time most popular media. */
  popular(opts: { type?: string; page?: number; perPage?: number } = {}) {
    const { type = "ANIME", page = 1, perPage = 50 } = opts;
    return apiRequest<AniListSearchResult>(
      `/integrations/anilist/popular${qs({ type, page, perPage })}`
    );
  },

  /** Media for the current (or given) season. */
  seasonal(
    opts: { type?: string; page?: number; perPage?: number; season?: string; year?: number } = {}
  ) {
    const { type = "ANIME", page = 1, perPage = 50, season, year } = opts;
    return apiRequest<AniListSearchResult>(
      `/integrations/anilist/seasonal${qs({ type, page, perPage, season, year })}`
    );
  },

  /** Import media from AniList. Returns the created/updated Anime. */
  import(anilistId: number) {
    return apiRequest<{ id: string; title: string }>(
      `/integrations/anilist/${anilistId}/import`,
      { method: "POST" }
    );
  },
};
