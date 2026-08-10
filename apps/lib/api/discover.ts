import { apiRequest } from "@/lib/api/client";
import type {
  ApiContentDetailResponse,
  ApiContentItem,
  ApiSection,
} from "@/types/api/discover";

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

export interface DiscoverStreamResponse {
  /** Direct play / transcode URL handed off to the <video> element. */
  streamUrl: string;
  title: string;
  isMovie: boolean;
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
   * Full-text search over the published catalog (title + synopsis), returning
   * the same ApiContentItem shape as the other public discover endpoints so
   * results can be rendered with mapApiItemToAnime.
   */
  async search(
    q: string,
    opts: { page?: number; limit?: number; signal?: AbortSignal } = {}
  ): Promise<{ items: ApiContentItem[]; total: number }> {
    const { page = 1, limit = 24, signal } = opts;
    const params = new URLSearchParams({
      q,
      page: String(page),
      limit: String(limit),
    });
    return apiRequest<{ items: ApiContentItem[]; total: number }>(
      `/discover/search?${params.toString()}`,
      { method: "GET", skipAuth: true, signal }
    );
  },

  /**
   * Real data feed for the public series/movie detail pages: the published
   * item (header) plus its seasons and episodes. Returns 404 for unknown or
   * unpublished slugs.
   */
  async itemBySlug(slug: string): Promise<ApiContentDetailResponse> {
    return apiRequest<ApiContentDetailResponse>(
      `/discover/item/${encodeURIComponent(slug)}`,
      { method: "GET", skipAuth: true }
    );
  },

  /**
   * Resolves a playable stream URL for a published item (movie) or one of
   * its episodes (series). Stream resolution is delegated to the
   * media-server (Jellyfin) container by the worker — Plex and the other
   * dashboard sources only feed the catalog, they never back playback. The
   * endpoint answers 404 with STREAM_UNAVAILABLE when the title has no
   * source yet.
   */
  async streamUrl(
    slug: string,
    opts: { episodeId?: string; signal?: AbortSignal; timeoutMs?: number } = {}
  ): Promise<DiscoverStreamResponse> {
    const { episodeId, signal, timeoutMs } = opts;
    const params = new URLSearchParams();
    if (episodeId) params.set("episodeId", episodeId);
    const qs = params.toString();
    return apiRequest<DiscoverStreamResponse>(
      `/discover/item/${encodeURIComponent(slug)}/stream${qs ? `?${qs}` : ""}`,
      { method: "GET", skipAuth: true, signal, timeoutMs }
    );
  },

  /**
   * Build a *same-origin* stream proxy URL for hls.js. The backend route at
   * `/discover/item/:slug/stream/proxy/manifest` re-fetches the upstream
   * manifest from the media-server (Jellyfin) inside Kami-Sama (carrying
   * the API key as a header), streams it back to the browser, and rewrites
   * every URL line inside the manifest to point at `/segment/<origin>`
   * (also handled by the proxy). Two benefits:
   *   1. Neither Jellyfin nor Plex sends `Access-Control-Allow-Origin`
   *      reliably, so handing their raw URL to hls.js yields a NETWORK_ERROR
   *      on every browser except the media server's own host. The proxy
   *      sidesteps CORS entirely.
   *   2. The API key / token never leaves the backend — no leaking of the
   *      credential in the browser's network log or a referer header.
   */
  streamProxyUrl(
    slug: string,
    opts: { episodeId?: string } = {}
  ): string {
    const params = new URLSearchParams();
    if (opts.episodeId) params.set("episodeId", opts.episodeId);
    const qs = params.toString();
    return `/api/v1/discover/item/${encodeURIComponent(
      slug
    )}/stream/proxy/manifest${qs ? `?${qs}` : ""}`;
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
