import { apiRequest } from "@/lib/api/client";

/**
 * Dedicated Plex integration client.
 *
 * Backing endpoints:
 *  - /api/v1/integrations/plex/*  (server identity, libraries, items, refresh)
 *  - /api/v1/source/libraries/*   (sync + sync logs through the media source)
 *  - /api/v1/libraries/*          (persisted SourceConfig rows)
 */

export interface PlexHealth {
  reachable: boolean;
  latencyMs: number;
  identityKeys: string[];
}

/** Full /identity MediaContainer envelope (raw Plex fields). */
export type PlexIdentity = Record<string, unknown>;

export interface PlexLibrary {
  id: string;
  sourceId: string;
  name: string;
  type: string;
  itemCount: number;
}

export interface PlexLibraryItem {
  id?: string;
  sourceId?: string;
  name?: string;
  title?: string;
  type?: string;
  year?: number;
  rating?: number;
  ratingKey?: string;
  originalTitle?: string;
  overview?: string;
  imageUrl?: string;
  artUrl?: string;
  duration?: number;
  genres?: string[];
  [key: string]: unknown;
}

export interface PlexImportResult {
  item: PlexLibraryItem;
  animeId: string;
  created: boolean;
  updated: boolean;
  sourceId: string;
  title: string;
}

export interface PlexSyncResult {
  libraryId: string;
  source: string;
  itemsCreated: number;
  itemsUpdated: number;
  itemsRemoved: number;
  startedAt: string;
  completedAt: string;
}

export interface PlexSyncStatus {
  libraryId: string;
  source: string;
  lastSyncAt: string | null;
  status: string;
  itemCount: number;
  errorMessage?: string;
}

export interface PlexSyncLog {
  id: string;
  libraryId: string;
  sourceType: string;
  status: string;
  itemsCreated: number;
  itemsUpdated: number;
  itemsRemoved: number;
  startedAt: string;
  completedAt?: string | null;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SourceConfig {
  id: string;
  sourceType: string;
  enabled: boolean;
  config: Record<string, unknown>;
  lastSyncAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Opaque config blob stored on the Plex SourceConfig row. */
export interface PlexConfigInput {
  url: string;
  token: string;
  clientIdentifier?: string;
  product?: string;
  version?: string;
  device?: string;
  timeoutSeconds: number;
}

interface PlexListResponse<T> {
  items: T[];
}

export interface PlexItemsResponse {
  items: PlexLibraryItem[];
  total: number;
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

export const plexApi = {
  /** Probes the configured Plex server (identity request + latency). */
  health() {
    return apiRequest<PlexHealth>("/integrations/plex/health");
  },

  /** Returns the raw Plex server identity (friendlyName, version, ...). */
  identity() {
    return apiRequest<PlexIdentity>("/integrations/plex/identity");
  },

  /** Lists the configured Plex library sections. */
  libraries() {
    return apiRequest<PlexListResponse<PlexLibrary>>("/integrations/plex/libraries");
  },

  /** Returns a single Plex library section. */
  library(libraryId: string) {
    return apiRequest<PlexLibrary>(`/integrations/plex/libraries/${encodeURIComponent(libraryId)}`);
  },

  /** Lists items inside a library (paginated, optional type filter). */
  items(libraryId: string, opts: { limit?: number; offset?: number; type?: string; q?: string } = {}) {
    const { limit, offset, type, q } = opts;
    return apiRequest<PlexItemsResponse>(
      `/integrations/plex/libraries/${encodeURIComponent(libraryId)}/items${qs({ limit, offset, type, q })}`
    );
  },

  /** Full-text search across the server. */
  search(query: string, opts: { limit?: number; type?: string } = {}) {
    const { limit, type } = opts;
    return apiRequest<PlexItemsResponse>(`/integrations/plex/search${qs({ q: query, limit, type })}`);
  },

  /** Upserts a single Plex item (by ratingKey) into the local catalog. */
  importItem(ratingKey: string) {
    return apiRequest<PlexImportResult>(`/integrations/plex/import`, {
      method: "POST",
      body: { ratingKey },
    });
  },

  /** Full metadata block for a ratingKey. */
  metadata(ratingKey: string) {
    return apiRequest<Record<string, unknown>>(`/integrations/plex/metadata/${encodeURIComponent(ratingKey)}`);
  },

  /** Triggers a metadata refresh on a library. */
  refresh(libraryId: string) {
    return apiRequest<{ refreshed: boolean; libraryId: string }>(
      `/integrations/plex/libraries/${encodeURIComponent(libraryId)}/refresh`,
      { method: "POST" }
    );
  },

  /** Runs a library sync through the active media source. */
  sync(libraryId: string) {
    return apiRequest<PlexSyncResult>(`/source/libraries/${encodeURIComponent(libraryId)}/sync`, {
      method: "POST",
    });
  },

  /** Returns the last sync status for a library. */
  syncStatus(libraryId: string) {
    return apiRequest<PlexSyncStatus>(`/source/libraries/${encodeURIComponent(libraryId)}/sync`);
  },

  /** Lists recent sync logs (optionally scoped to a library). */
  syncLogs(opts: { libraryId?: string; limit?: number } = {}) {
    const { libraryId, limit } = opts;
    return apiRequest<PlexListResponse<PlexSyncLog>>(`/source/sync/logs${qs({ libraryId, limit })}`);
  },
};

export const sourceConfigApi = {
  list() {
    return apiRequest<PlexListResponse<SourceConfig>>("/libraries");
  },

  create(input: { sourceType: string; enabled: boolean; config: Record<string, unknown> }) {
    return apiRequest<SourceConfig>("/libraries", { method: "POST", body: input });
  },

  update(
    id: string,
    input: Partial<{ sourceType: string; enabled: boolean; config: Record<string, unknown> }>
  ) {
    return apiRequest<SourceConfig>(`/libraries/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: input,
    });
  },

  remove(id: string) {
    return apiRequest<{ deleted: boolean }>(`/libraries/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
};
