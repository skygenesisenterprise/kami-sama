import { apiRequest } from "@/lib/api/client";

/**
 * Dedicated media-server (Jellyfin) integration client.
 *
 * Jellyfin is the STREAMING provider: the watch page delegates all HLS
 * playback to it (see discoverApi.streamUrl / streamProxyUrl). These
 * endpoints drive the DB → Jellyfin "mirror" — pushing the Plex-fed catalog
 * rows (movies and, for series, every real episode) into the Jellyfin library
 * so the media-server reflects the catalog and playback needs no on-the-fly
 * bridge.
 *
 * Backing endpoints: /api/v1/integrations/jellyfin/*
 */

export interface JellyfinHealth {
  reachable: boolean;
  latencyMs: number;
  serverName?: string;
  version?: string;
}

/** Outcome of one DB → Jellyfin mirror run. */
export interface JellyfinMirrorStats {
  /** idle | running | completed | failed */
  status: string;
  itemsScanned: number;
  itemsCreated: number;
  itemsUpdated: number;
  itemsFailed: number;
  episodesScanned: number;
  episodesCreated: number;
  episodesUpdated: number;
  episodesFailed: number;
  startedAt: string;
  completedAt?: string | null;
  errorMessage?: string;
}

export interface JellyfinSyncResponse {
  started: boolean;
  status: JellyfinMirrorStats;
}

export const jellyfinApi = {
  /** Probes the media-server (reachability + latency). */
  health() {
    return apiRequest<JellyfinHealth>("/integrations/jellyfin/health");
  },

  /**
   * Launches the DB → Jellyfin mirror in the background: every Plex-sourced
   * catalog row (movies once, series episode by episode) is bridged into the
   * Jellyfin library. Returns immediately with the in-flight status — poll
   * syncStatus() for the final counts. The endpoint is idempotent: calling it
   * while a run is in progress reports the existing run instead of starting a
   * second one.
   */
  sync() {
    return apiRequest<JellyfinSyncResponse>("/integrations/jellyfin/sync", {
      method: "POST",
    });
  },

  /** Returns the outcome of the last (or in-flight) mirror run. */
  syncStatus() {
    return apiRequest<JellyfinMirrorStats>("/integrations/jellyfin/sync/status");
  },
};
