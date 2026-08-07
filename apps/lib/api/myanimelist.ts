import { apiRequest } from "@/lib/api/client"
import type {
  JobType,
  MalProviderData,
  ProviderSettings,
  SyncJob,
} from "@/lib/mal-provider-data"

export interface MalConnectionTestResult {
  reachable: boolean
  latencyMs: number
  apiKeyValid: boolean
  clientId: string
  apiUrl: string
}

/** Normalized MAL search hit (mirrors SourceResultItem). */
export interface MalSearchItem {
  id: string
  source?: string
  title: string
  subtitle?: string
  type?: string
  year?: number
  rating?: number
  genres?: string[]
  overview?: string
  imageUrl?: string
  artUrl?: string
  extraMeta?: string[]
}

export interface MalSearchResult {
  items: MalSearchItem[]
}

export const myanimelistApi = {
  async getSnapshot(): Promise<MalProviderData> {
    return apiRequest<MalProviderData>("/integrations/myanimelist/snapshot", {
      method: "GET",
    })
  },

  async getSettings(): Promise<ProviderSettings> {
    return apiRequest<ProviderSettings>("/integrations/myanimelist/settings", {
      method: "GET",
    })
  },

  async saveSettings(settings: ProviderSettings): Promise<{ saved: boolean }> {
    return apiRequest<{ saved: boolean }, ProviderSettings>(
      "/integrations/myanimelist/settings",
      { method: "PUT", body: settings },
    )
  },

  async testConnection(): Promise<MalConnectionTestResult> {
    return apiRequest<MalConnectionTestResult>("/integrations/myanimelist/test", {
      method: "POST",
    })
  },

  /** Searches anime or manga by title. */
  search(query: string, opts: { type?: string; limit?: number } = {}) {
    const { type = "anime", limit = 8 } = opts
    const params = new URLSearchParams({ q: query, type, limit: String(limit) })
    return apiRequest<MalSearchResult>(`/integrations/myanimelist/search?${params.toString()}`)
  },

  async runSync(jobType: JobType, triggeredBy: "manual" | "scheduled" | "webhook" = "manual"): Promise<SyncJob> {
    return apiRequest<SyncJob, { jobType: JobType; triggeredBy: string }>(
      "/integrations/myanimelist/actions/sync",
      { method: "POST", body: { jobType, triggeredBy } },
    )
  },
}
