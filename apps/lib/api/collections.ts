import { apiRequest } from "@/lib/api/client";
import type { ApiSection } from "@/types/api/discover";

export interface ApiCollectionDiscover {
  enabled: boolean;
  order: number;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  href?: string;
}

export interface ApiCollectionEntry {
  animeId: string;
  seriesTitle: string;
  position: number;
  addedAt: string;
}

export interface ApiCollectionSource {
  provider: string;
  externalId: string;
  status: string;
  lastSyncedAt: string;
}

export interface ApiCollection {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: string;
  status: string;
  visibility: string;
  tags: string[];
  assets: { poster: string; banner: string };
  sources: ApiCollectionSource[];
  metadataStatus: string;
  discover: ApiCollectionDiscover;
  entries: ApiCollectionEntry[];
  updatedBy: string;
  updatedById: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCollectionPayload {
  title?: string;
  slug?: string;
  description?: string;
  type?: string;
  status?: string;
  visibility?: string;
  tags?: string[];
  entryIds?: string[];
  discover?: Partial<ApiCollectionDiscover>;
}

export interface CreateCollectionPayload {
  title: string;
  slug?: string;
  description?: string;
  type?: string;
  status?: string;
  visibility?: string;
  tags?: string[];
  entryIds?: string[];
  discover?: Partial<ApiCollectionDiscover>;
}

export interface CollectionListParams {
  status?: string;
  type?: string;
  visibility?: string;
  discover?: "true" | "false" | "all";
}

export const collectionsApi = {
  async list(params: CollectionListParams = {}): Promise<ApiCollection[]> {
    const search = new URLSearchParams();
    if (params.status) search.set("status", params.status);
    if (params.type) search.set("type", params.type);
    if (params.visibility) search.set("visibility", params.visibility);
    if (params.discover && params.discover !== "all") search.set("discover", params.discover);
    const suffix = search.size > 0 ? `?${search.toString()}` : "";
    const response = await apiRequest<{ items: ApiCollection[] }>(`/collections${suffix}`, {
      method: "GET",
    });
    return response.items;
  },

  async getById(collectionId: string): Promise<ApiCollection> {
    return apiRequest<ApiCollection>(`/collections/${collectionId}`, {
      method: "GET",
    });
  },

  async getBySlug(slug: string): Promise<ApiCollection> {
    return apiRequest<ApiCollection>(`/collections/slug/${slug}`, {
      method: "GET",
    });
  },

  async create(payload: CreateCollectionPayload): Promise<ApiCollection> {
    return apiRequest<ApiCollection, CreateCollectionPayload>("/collections", {
      method: "POST",
      body: payload,
    });
  },

  async update(collectionId: string, payload: UpdateCollectionPayload): Promise<ApiCollection> {
    return apiRequest<ApiCollection, UpdateCollectionPayload>(`/collections/${collectionId}`, {
      method: "PATCH",
      body: payload,
    });
  },

  async delete(collectionId: string): Promise<void> {
    await apiRequest<{ deleted: boolean }>(`/collections/${collectionId}`, {
      method: "DELETE",
    });
  },

  async listDiscoverSections(): Promise<ApiSection[]> {
    const response = await apiRequest<{ sections: ApiSection[] }>("/discover/sections", {
      method: "GET",
      skipAuth: true,
    });
    return response.sections;
  },
};
