import { env } from "../../config/env.js";
import { ApiError } from "../errors.js";
import { logger } from "../logger.js";

/**
 * Centralized client for the Kami-Sama API. Commands NEVER build HTTP requests
 * themselves — they call typed methods on this class.
 *
 * Base URL defaults: dev → http://api.kami-sama.localhost, prod →
 * https://api.kami-sama.tv. The backend wraps responses in
 * `{ data, meta }` / `{ error, meta }`.
 */
export class KamiSamaClient {
  constructor(options = {}) {
    this.baseUrl = (options.baseUrl ?? env.apiUrl).replace(/\/+$/, "");
    this.token = options.token ?? env.apiToken;
    this.timeoutMs = options.timeoutMs ?? env.apiTimeoutMs;
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch;
  }

  /** @returns {KamiSamaClient} a client scoped to a user's Bearer token. */
  asUser(token) {
    return new KamiSamaClient({ baseUrl: this.baseUrl, token, timeoutMs: this.timeoutMs });
  }

  async request(pathname, options = {}) {
    const {
      method = "GET",
      query,
      body,
      token = this.token,
      headers = {},
    } = options;

    const url = new URL(pathname, this.baseUrl);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null || value === "") continue;
        url.searchParams.set(key, String(value));
      }
    }

    const requestHeaders = { Accept: "application/json", ...headers };
    if (body !== undefined) requestHeaders["Content-Type"] = "application/json";
    if (token) requestHeaders["Authorization"] = `Bearer ${token}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    let response;

    try {
      response = await this.fetchImpl(url, {
        method,
        headers: requestHeaders,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
    } catch (error) {
      const isTimeout = error?.name === "AbortError";
      throw new ApiError(
        isTimeout ? `Délai dépassé après ${this.timeoutMs} ms` : `Réseau indisponible: ${error?.message ?? error}`,
        {
          status: 0,
          endpoint: url.pathname,
          cause: error,
          loggable: true,
        }
      );
    } finally {
      clearTimeout(timer);
    }

    const contentType = response.headers.get("content-type") ?? "";
    let payload = null;
    if (contentType.includes("application/json")) {
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }
    }

    if (!response.ok) {
      const apiError = payload?.error;
      throw new ApiError(apiError?.message ?? `Réponse HTTP ${response.status}`, {
        status: response.status,
        code: apiError?.code,
        details: apiError?.details,
        endpoint: url.pathname,
        requestId: payload?.meta?.requestId,
        userMessage: friendlyMessageFor(response.status),
      });
    }

    return payload?.data ?? payload;
  }

  // ── Health / readiness ────────────────────────────────────────────────
  health() {
    return this.request("/api/v1/health");
  }

  ready() {
    return this.request("/api/v1/ready");
  }

  // ── Public discover (no auth) ──────────────────────────────────────────
  discover(params = {}) {
    return this.request("/api/v1/discover", { query: params });
  }

  discoverSections() {
    return this.request("/api/v1/discover/sections");
  }

  discoverCatalog(params = {}) {
    return this.request("/api/v1/discover/catalog", { query: params });
  }

  discoverSearch(q, params = {}) {
    return this.request("/api/v1/discover/search", { query: { q, ...params } });
  }

  discoverItem(slug) {
    return this.request(`/api/v1/discover/item/${encodeURIComponent(slug)}`);
  }

  discoverContentDetail(anilistId, token) {
    return this.request(`/api/v1/discover/content/${encodeURIComponent(anilistId)}`, { token });
  }

  discoverContinueWatching(token) {
    return this.request("/api/v1/discover/continue-watching", { token });
  }

  // ── Search (protected) ─────────────────────────────────────────────────
  search(q, params = {}, token) {
    return this.request("/api/v1/search", { query: { q, ...params }, token });
  }

  searchAnime(q, params = {}, token) {
    return this.request("/api/v1/search/anime", { query: { q, ...params }, token });
  }

  searchCharacters(q, params = {}, token) {
    return this.request("/api/v1/search/characters", { query: { q, ...params }, token });
  }

  searchStudios(q, params = {}, token) {
    return this.request("/api/v1/search/studios", { query: { q, ...params }, token });
  }

  suggestions(q, token) {
    return this.request("/api/v1/search/suggestions", { query: { q }, token });
  }

  // ── Anime / genres / studios (protected) ───────────────────────────────
  animeList(params = {}, token) {
    return this.request("/api/v1/anime", { query: params, token });
  }

  animeGet(animeId, token) {
    return this.request(`/api/v1/anime/${encodeURIComponent(animeId)}`, { token });
  }

  animeGetBySlug(slug, token) {
    return this.request(`/api/v1/anime/slug/${encodeURIComponent(slug)}`, { token });
  }

  genresList(token) {
    return this.request("/api/v1/genres", { token });
  }

  studiosList(token) {
    return this.request("/api/v1/studios", { token });
  }

  // ── AniList integration (protected) ────────────────────────────────────
  anilistSearch(query, params = {}, token) {
    return this.request("/api/v1/integrations/anilist/search", {
      query: { query, ...params },
      token,
    });
  }

  anilistTrending(params = {}, token) {
    return this.request("/api/v1/integrations/anilist/trending", { query: params, token });
  }

  anilistPopular(params = {}, token) {
    return this.request("/api/v1/integrations/anilist/popular", { query: params, token });
  }

  anilistSeasonal(params = {}, token) {
    return this.request("/api/v1/integrations/anilist/seasonal", { query: params, token });
  }

  anilistAiringSchedule(params = {}, token) {
    return this.request("/api/v1/integrations/anilist/airing-schedule", { query: params, token });
  }

  anilistGetMedia(anilistId, token) {
    return this.request(`/api/v1/integrations/anilist/${encodeURIComponent(anilistId)}`, { token });
  }

  // ── Watch / history (protected, per-user) ──────────────────────────────
  watchListProgress(token) {
    return this.request("/api/v1/watch/progress", { token });
  }

  watchProgress(episodeId, token) {
    return this.request(`/api/v1/watch/progress/${encodeURIComponent(episodeId)}`, { token });
  }

  watchContinue(token) {
    return this.request("/api/v1/watch/continue", { token });
  }

  watchHistory(params = {}, token) {
    return this.request("/api/v1/watch/history", { query: params, token });
  }

  addWatchHistory(body, token) {
    return this.request("/api/v1/watch/history", { method: "POST", body, token });
  }

  recommendations(token) {
    return this.request("/api/v1/recommendations", { token });
  }

  // ── Community watchlists (protected, per-user) ─────────────────────────
  communityWatchlists(token) {
    return this.request("/api/v1/community/watchlists", { token });
  }

  createCommunityWatchlist(body, token) {
    return this.request("/api/v1/community/watchlists", { method: "POST", body, token });
  }

  communityWatchlist(watchlistId, token) {
    return this.request(`/api/v1/community/watchlists/${encodeURIComponent(watchlistId)}`, { token });
  }

  watchlistAnime(watchlistId, token) {
    return this.request(`/api/v1/community/watchlists/${encodeURIComponent(watchlistId)}/anime`, { token });
  }

  addToWatchlist(watchlistId, body, token) {
    return this.request(`/api/v1/community/watchlists/${encodeURIComponent(watchlistId)}/anime`, {
      method: "POST",
      body,
      token,
    });
  }

  removeFromWatchlist(watchlistId, animeId, token) {
    return this.request(
      `/api/v1/community/watchlists/${encodeURIComponent(watchlistId)}/anime/${encodeURIComponent(animeId)}`,
      { method: "DELETE", token }
    );
  }

  // ── Notifications (protected, per-user) ────────────────────────────────
  notificationsList(params = {}, token) {
    return this.request("/api/v1/notifications", { query: params, token });
  }

  notificationPreferences(token) {
    return this.request("/api/v1/notifications/preferences", { token });
  }

  updateNotificationPreferences(body, token) {
    return this.request("/api/v1/notifications/preferences", { method: "PUT", body, token });
  }

  // ── System health (protected) ──────────────────────────────────────────
  systemHealthServices(token) {
    return this.request("/api/v1/system/health/services", { token });
  }

  systemHealthUptime(token) {
    return this.request("/api/v1/system/health/uptime", { token });
  }

  systemHealthMetrics(token) {
    return this.request("/api/v1/system/health/metrics", { token });
  }

  // ── Auth (per-user) ────────────────────────────────────────────────────
  authMe(token) {
    return this.request("/api/v1/auth/me", { token });
  }
}

export const kamiSamaClient = new KamiSamaClient();

function friendlyMessageFor(status) {
  if (status === 401 || status === 403) {
    return "Votre session Kami-Sama est invalide ou a expiré. Reliez votre compte via `/account link`.";
  }
  if (status === 404) {
    return "Contenu introuvable sur Kami-Sama.";
  }
  if (status >= 500) {
    return "Kami-Sama rencontre actuellement un problème. Réessayez dans quelques instants.";
  }
  return "Impossible de contacter Kami-Sama actuellement. Réessayez dans quelques instants.";
}
