import { apiRequest } from "@/lib/api/client";
import type { ApiContentItem, ApiSection } from "@/types/api/discover";

/**
 * Public discover API — these endpoints are unauthenticated (skipAuth) and
 * serve the content published through the admin catalog, Netflix-style.
 */
export interface DiscoverCatalogResponse {
  /** Automatically selected hero slides (max 5). */
  hero: ApiContentItem[];
  /** Auto-generated rails (featured, popular, latest, genres). */
  sections: ApiSection[];
}

/**
 * Watch progress returned by the authenticated /watch/continue endpoint.
 * Mirrors server/src/models/watch.go (WatchProgress).
 */
export interface ApiWatchProgress {
  userId: string;
  episodeId: string;
  animeId: string;
  /** Current position in seconds. */
  progress: number;
  /** Duration in seconds. */
  duration: number;
  /** 0-100 progress percentage. */
  percentage: number;
  completed: boolean;
  lastWatched: string;
}

export interface ApiWatchProgressResponse {
  items: ApiWatchProgress[];
}

export const discoverApi = {
  /**
   * The discover algorithm: hero slides + rails are built server-side from
   * the published catalog, so no manual collection curation is required.
   */
  async catalog(): Promise<DiscoverCatalogResponse> {
    return apiRequest<DiscoverCatalogResponse>("/discover/catalog", {
      method: "GET",
      skipAuth: true,
    });
  },

  /**
   * Continue watching for the authenticated user (real watch progress).
   * Returns an empty list when there is no progress — the caller should
   * hide the rail instead of showing mock data.
   */
  async continueWatching(limit = 10): Promise<ApiWatchProgressResponse> {
    return apiRequest<ApiWatchProgressResponse>(
      `/watch/continue?limit=${limit}`,
      { method: "GET" }
    );
  },
};
