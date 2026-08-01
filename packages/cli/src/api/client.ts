import { getConfig, type Config } from '../config/index.js';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface ApiListResponse<T = unknown> {
  success: boolean;
  data: T[];
  total?: number;
  page?: number;
  pageSize?: number;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  statusCode: number;
}

export class ApiClient {
  private config: Config;
  private token: string | null = null;

  constructor() {
    this.config = getConfig();
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  private getUrl(path: string): string {
    const base = this.config.serverUrl.replace(/\/+$/, '');
    // If the base URL already ends with /api/v1, don't double-prepend
    if (base.endsWith('/api/v1')) {
      return `${base}${path}`;
    }
    return `${base}/api/v1${path}`;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    let url = this.getUrl(path);

    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value));
        }
      }
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }

    const options: RequestInit = {
      method,
      headers: this.getHeaders(),
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const json = (await response.json()) as ApiResponse<T> | ApiError;

    if (!response.ok || !json.success) {
      const error = json as ApiError;
      throw new Error(error.message || error.error || `HTTP ${response.status}`);
    }

    return (json as ApiResponse<T>).data;
  }

  async get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>('GET', path, undefined, params);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PUT', path, body);
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PATCH', path, body);
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
  }

  // --- Auth ---
  async login(email: string, password: string) {
    const data = await this.post<{ accessToken: string; refreshToken: string; user: unknown }>('/auth/login', { email, password });
    this.token = data.accessToken;
    return data;
  }

  async register(email: string, password: string, displayName: string) {
    return this.post<{ accessToken: string; refreshToken: string; user: unknown }>('/auth/register', { email, password, displayName });
  }

  async getMe() {
    return this.get<Record<string, unknown>>('/auth/me');
  }

  async refreshToken(refreshToken: string) {
    return this.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken });
  }

  // --- Dashboard ---
  async getDashboardStats() {
    return this.get<Record<string, unknown>>('/dashboard/stats');
  }

  async getWeeklyViews() {
    return this.get<unknown[]>('/dashboard/weekly-views');
  }

  async getTopAnime() {
    return this.get<unknown[]>('/dashboard/top-anime');
  }

  async getRecentUploads() {
    return this.get<unknown[]>('/dashboard/recent-uploads');
  }

  // --- Anime ---
  async listAnime(params?: Record<string, string | number | boolean | undefined>) {
    return this.get<unknown[]>('/anime', params);
  }

  async getAnime(id: string) {
    return this.get<Record<string, unknown>>(`/anime/${id}`);
  }

  async createAnime(data: Record<string, unknown>) {
    return this.post<Record<string, unknown>>('/anime', data);
  }

  async updateAnime(id: string, data: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/anime/${id}`, data);
  }

  async deleteAnime(id: string) {
    return this.delete<{ deleted: boolean }>(`/anime/${id}`);
  }

  // --- Genres ---
  async listGenres() {
    return this.get<unknown[]>('/genres');
  }

  async createGenre(data: Record<string, unknown>) {
    return this.post<Record<string, unknown>>('/genres', data);
  }

  async updateGenre(id: string, data: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/genres/${id}`, data);
  }

  async deleteGenre(id: string) {
    return this.delete<{ deleted: boolean }>(`/genres/${id}`);
  }

  // --- Studios ---
  async listStudios() {
    return this.get<unknown[]>('/studios');
  }

  async createStudio(data: Record<string, unknown>) {
    return this.post<Record<string, unknown>>('/studios', data);
  }

  async updateStudio(id: string, data: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/studios/${id}`, data);
  }

  async deleteStudio(id: string) {
    return this.delete<{ deleted: boolean }>(`/studios/${id}`);
  }

  // --- Characters ---
  async listCharacters() {
    return this.get<unknown[]>('/characters');
  }

  async createCharacter(data: Record<string, unknown>) {
    return this.post<Record<string, unknown>>('/characters', data);
  }

  async updateCharacter(id: string, data: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/characters/${id}`, data);
  }

  async deleteCharacter(id: string) {
    return this.delete<{ deleted: boolean }>(`/characters/${id}`);
  }

  // --- Episodes ---
  async listEpisodes(animeId: string) {
    return this.get<unknown[]>(`/anime/${animeId}/episodes`);
  }

  async createEpisode(animeId: string, data: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/anime/${animeId}/episodes`, data);
  }

  async updateEpisode(animeId: string, episodeId: string, data: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/anime/${animeId}/episodes/${episodeId}`, data);
  }

  async deleteEpisode(animeId: string, episodeId: string) {
    return this.delete<{ deleted: boolean }>(`/anime/${animeId}/episodes/${episodeId}`);
  }

  // --- Media ---
  async listMedia(params?: Record<string, string | number | boolean | undefined>) {
    return this.get<unknown[]>('/media', params);
  }

  async getMedia(id: string) {
    return this.get<Record<string, unknown>>(`/media/${id}`);
  }

  async createMedia(data: Record<string, unknown>) {
    return this.post<Record<string, unknown>>('/media', data);
  }

  async updateMedia(id: string, data: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/media/${id}`, data);
  }

  async deleteMedia(id: string) {
    return this.delete<{ deleted: boolean }>(`/media/${id}`);
  }

  async listEncodingJobs() {
    return this.get<unknown[]>('/media/encoding-jobs');
  }

  async getEncodingJob(id: string) {
    return this.get<Record<string, unknown>>(`/media/encoding-jobs/${id}`);
  }

  async retryEncodingJob(id: string) {
    return this.post<{ retried: boolean }>(`/media/encoding-jobs/${id}/retry`);
  }

  async cancelEncodingJob(id: string) {
    return this.post<{ cancelled: boolean }>(`/media/encoding-jobs/${id}/cancel`);
  }

  // --- Sources ---
  async listSourceLibraries() {
    return this.get<unknown[]>('/source/libraries');
  }

  async getSourceLibrary(id: string) {
    return this.get<Record<string, unknown>>(`/source/libraries/${id}`);
  }

  async listSourceItems(params?: Record<string, string | number | boolean | undefined>) {
    return this.get<unknown[]>('/source/items', params);
  }

  async searchSourceItems(query: string) {
    return this.get<unknown[]>('/source/items/search', { query });
  }

  async syncLibrary(id: string) {
    return this.post<{ synced: boolean }>(`/source/libraries/${id}/sync`);
  }

  async getSyncStatus(id: string) {
    return this.get<Record<string, unknown>>(`/source/libraries/${id}/sync`);
  }

  // --- Collections ---
  async listCollections() {
    return this.get<unknown[]>('/collections');
  }

  async getCollection(id: string) {
    return this.get<Record<string, unknown>>(`/collections/${id}`);
  }

  async createCollection(data: Record<string, unknown>) {
    return this.post<Record<string, unknown>>('/collections', data);
  }

  async updateCollection(id: string, data: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/collections/${id}`, data);
  }

  async deleteCollection(id: string) {
    return this.delete<{ deleted: boolean }>(`/collections/${id}`);
  }

  // --- Tags ---
  async listTags() {
    return this.get<unknown[]>('/tags');
  }

  async createTag(data: Record<string, unknown>) {
    return this.post<Record<string, unknown>>('/tags', data);
  }

  async updateTag(id: string, data: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/tags/${id}`, data);
  }

  async deleteTag(id: string) {
    return this.delete<{ deleted: boolean }>(`/tags/${id}`);
  }

  // --- Categories ---
  async listCategories() {
    return this.get<unknown[]>('/categories');
  }

  async createCategory(data: Record<string, unknown>) {
    return this.post<Record<string, unknown>>('/categories', data);
  }

  async updateCategory(id: string, data: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/categories/${id}`, data);
  }

  async deleteCategory(id: string) {
    return this.delete<{ deleted: boolean }>(`/categories/${id}`);
  }

  // --- Community ---
  async listReviews() {
    return this.get<unknown[]>('/community/reviews');
  }

  async createReview(data: Record<string, unknown>) {
    return this.post<Record<string, unknown>>('/community/reviews', data);
  }

  async listComments(reviewId: string) {
    return this.get<unknown[]>(`/community/reviews/${reviewId}/comments`);
  }

  async createComment(reviewId: string, data: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/community/reviews/${reviewId}/comments`, data);
  }

  async listWatchlists() {
    return this.get<unknown[]>('/community/watchlists');
  }

  async createWatchlist(data: Record<string, unknown>) {
    return this.post<Record<string, unknown>>('/community/watchlists', data);
  }

  async listReports() {
    return this.get<unknown[]>('/community/reports');
  }

  async createReport(data: Record<string, unknown>) {
    return this.post<Record<string, unknown>>('/community/reports', data);
  }

  // --- Settings ---
  async listSettings() {
    return this.get<unknown[]>('/settings');
  }

  async getSetting(key: string) {
    return this.get<Record<string, unknown>>(`/settings/${key}`);
  }

  async updateSetting(key: string, value: unknown) {
    return this.put<{ updated: boolean }>(`/settings/${key}`, { value });
  }

  async deleteSetting(key: string) {
    return this.delete<{ deleted: boolean }>(`/settings/${key}`);
  }

  async getGeneralSettings() {
    return this.get<Record<string, unknown>>('/settings/general');
  }

  async updateGeneralSettings(data: Record<string, unknown>) {
    return this.put<Record<string, unknown>>('/settings/general', data);
  }

  async getSecuritySettings() {
    return this.get<Record<string, unknown>>('/settings/security');
  }

  async updateSecuritySettings(data: Record<string, unknown>) {
    return this.put<Record<string, unknown>>('/settings/security', data);
  }

  async getBrandingSettings() {
    return this.get<Record<string, unknown>>('/settings/branding');
  }

  async updateBrandingSettings(data: Record<string, unknown>) {
    return this.put<Record<string, unknown>>('/settings/branding', data);
  }

  async getEmailSettings() {
    return this.get<Record<string, unknown>>('/settings/email');
  }

  async updateEmailSettings(data: Record<string, unknown>) {
    return this.put<Record<string, unknown>>('/settings/email', data);
  }

  async getStorageSettings() {
    return this.get<Record<string, unknown>>('/settings/storage');
  }

  async updateStorageSettings(data: Record<string, unknown>) {
    return this.put<Record<string, unknown>>('/settings/storage', data);
  }

  async getCDNSettings() {
    return this.get<Record<string, unknown>>('/settings/cdn');
  }

  async updateCDNSettings(data: Record<string, unknown>) {
    return this.put<Record<string, unknown>>('/settings/cdn', data);
  }

  async listDomains() {
    return this.get<unknown[]>('/settings/domains');
  }

  async createDomain(data: Record<string, unknown>) {
    return this.post<Record<string, unknown>>('/settings/domains', data);
  }

  async deleteDomain(id: string) {
    return this.delete<{ deleted: boolean }>(`/settings/domains/${id}`);
  }

  async listApiKeys() {
    return this.get<unknown[]>('/settings/apis');
  }

  async createApiKey(data: Record<string, unknown>) {
    return this.post<Record<string, unknown>>('/settings/apis', data);
  }

  async deleteApiKey(id: string) {
    return this.delete<{ deleted: boolean }>(`/settings/apis/${id}`);
  }

  async updateOAuth(provider: string, data: Record<string, unknown>) {
    return this.put<Record<string, unknown>>(`/settings/oauth/${provider}`, data);
  }

  async getMaintenance() {
    return this.get<Record<string, unknown>>('/settings/maintenance');
  }

  async updateMaintenance(data: Record<string, unknown>) {
    return this.put<Record<string, unknown>>('/settings/maintenance', data);
  }

  async clearCache() {
    return this.post<{ cleared: boolean }>('/settings/maintenance/cache-clear');
  }

  async optimizeDB() {
    return this.post<{ optimized: boolean }>('/settings/maintenance/db-optimize');
  }

  // --- Admin ---
  async adminListUsers(params?: Record<string, string | number | boolean | undefined>) {
    return this.get<unknown[]>('/admin/users', params);
  }

  async adminGetUser(id: string) {
    return this.get<Record<string, unknown>>(`/admin/users/${id}`);
  }

  async adminUpdateUser(id: string, data: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/admin/users/${id}`, data);
  }

  async adminDeleteUser(id: string) {
    return this.delete<{ deleted: boolean }>(`/admin/users/${id}`);
  }

  async adminDisableUser(id: string) {
    return this.post<{ disabled: boolean }>(`/admin/users/${id}/disable`);
  }

  async adminEnableUser(id: string) {
    return this.post<{ enabled: boolean }>(`/admin/users/${id}/enable`);
  }

  async adminListRoles() {
    return this.get<unknown[]>('/admin/roles');
  }

  async adminCreateRole(data: Record<string, unknown>) {
    return this.post<Record<string, unknown>>('/admin/roles', data);
  }

  async adminUpdateRole(id: string, data: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/admin/roles/${id}`, data);
  }

  async adminDeleteRole(id: string) {
    return this.delete<{ deleted: boolean }>(`/admin/roles/${id}`);
  }

  async adminAssignRole(roleId: string, data: Record<string, unknown>) {
    return this.post<{ assigned: boolean }>(`/admin/roles/${roleId}/assign`, data);
  }

  async adminGetPermissionMatrix() {
    return this.get<Record<string, unknown>>('/admin/permissions');
  }

  async adminUpdatePermissions(data: Record<string, unknown>) {
    return this.patch<{ updated: boolean }>('/admin/permissions', data);
  }

  async adminListModerations() {
    return this.get<unknown[]>('/admin/moderations');
  }

  async adminModerateItem(id: string, action: 'approve' | 'reject' | 'escalate') {
    return this.post<{ moderated: boolean }>(`/admin/moderations/${id}/${action}`);
  }

  // --- System ---
  async getSystemHealth() {
    return this.get<Record<string, unknown>>('/system/health/services');
  }

  async getSystemUptime() {
    return this.get<Record<string, unknown>>('/system/health/uptime');
  }

  async listSystemLogs(params?: Record<string, string | number | boolean | undefined>) {
    return this.get<unknown[]>('/system/logs', params);
  }

  async searchSystemLogs(query: string) {
    return this.get<unknown[]>('/system/logs/search', { q: query });
  }

  async getQueueStatus() {
    return this.get<Record<string, unknown>>('/system/queue');
  }

  async listQueueJobs() {
    return this.get<unknown[]>('/system/queue/jobs');
  }

  async retryQueueJob(id: string) {
    return this.post<{ retried: boolean }>(`/system/queue/jobs/${id}/retry`);
  }

  async cancelQueueJob(id: string) {
    return this.post<{ cancelled: boolean }>(`/system/queue/jobs/${id}/cancel`);
  }

  async flushQueue() {
    return this.post<{ flushed: boolean }>('/system/queue/flush');
  }

  async getCacheStatus() {
    return this.get<Record<string, unknown>>('/system/cache');
  }

  async flushCacheSystem() {
    return this.post<{ flushed: boolean }>('/system/cache/flush');
  }

  async listCacheKeys() {
    return this.get<unknown[]>('/system/cache/keys');
  }

  async deleteCacheKey(key: string) {
    return this.delete<{ deleted: boolean }>(`/system/cache/keys/${key}`);
  }

  async getSearchStatus() {
    return this.get<Record<string, unknown>>('/system/search');
  }

  async triggerReindex() {
    return this.post<{ triggered: boolean }>('/system/search/reindex');
  }

  async listBackgroundJobs() {
    return this.get<unknown[]>('/system/background-jobs');
  }

  async runBackgroundJob(id: string) {
    return this.post<{ running: boolean }>(`/system/background-jobs/${id}/run`);
  }

  // --- Analytics ---
  async getAnalyticsOverview(params?: Record<string, string | number | boolean | undefined>) {
    return this.get<Record<string, unknown>>('/analytics/overview', params);
  }

  async getWatchTime(params?: Record<string, string | number | boolean | undefined>) {
    return this.get<Record<string, unknown>>('/analytics/watch-time', params);
  }

  async getDevices() {
    return this.get<Record<string, unknown>>('/analytics/devices');
  }

  async getPopular() {
    return this.get<unknown[]>('/analytics/popular');
  }

  async getGeography() {
    return this.get<Record<string, unknown>>('/analytics/geography');
  }

  async getActiveUsers() {
    return this.get<Record<string, unknown>>('/analytics/active-users');
  }

  // --- Discover ---
  async getDiscover() {
    return this.get<unknown[]>('/discover');
  }

  async getDiscoverSections() {
    return this.get<unknown[]>('/discover/sections');
  }

  async getContentDetail(anilistId: string) {
    return this.get<Record<string, unknown>>(`/discover/content/${anilistId}`);
  }

  // --- Integrations ---
  async anilistSearch(query: string) {
    return this.get<unknown[]>('/integrations/anilist/search', { q: query });
  }

  async anilistTrending() {
    return this.get<unknown[]>('/integrations/anilist/trending');
  }

  async anilistPopular() {
    return this.get<unknown[]>('/integrations/anilist/popular');
  }

  async anilistImport(anilistId: string) {
    return this.post<{ imported: boolean }>(`/integrations/anilist/${anilistId}/import`);
  }

  async plexHealth() {
    return this.get<Record<string, unknown>>('/integrations/plex/health');
  }

  async plexLibraries() {
    return this.get<unknown[]>('/integrations/plex/libraries');
  }

  async plexSearch(query: string) {
    return this.get<unknown[]>('/integrations/plex/search', { query });
  }

  async plexImport(ratingKey: string) {
    return this.post<{ imported: boolean }>('/integrations/plex/import', { ratingKey });
  }

  // --- Support ---
  async listTickets() {
    return this.get<unknown[]>('/support/tickets');
  }

  async createTicket(data: Record<string, unknown>) {
    return this.post<Record<string, unknown>>('/support/tickets', data);
  }

  async getTicket(id: string) {
    return this.get<Record<string, unknown>>(`/support/tickets/${id}`);
  }

  async replyToTicket(id: string, data: Record<string, unknown>) {
    return this.post<Record<string, unknown>>(`/support/tickets/${id}/reply`, data);
  }

  async closeTicket(id: string) {
    return this.post<{ closed: boolean }>(`/support/tickets/${id}/close`);
  }

  async listFaq() {
    return this.get<unknown[]>('/support/faq');
  }

  async createFaq(data: Record<string, unknown>) {
    return this.post<Record<string, unknown>>('/support/faq', data);
  }

  async deleteFaq(id: string) {
    return this.delete<{ deleted: boolean }>(`/support/faq/${id}`);
  }

  // --- Search ---
  async search(query: string) {
    return this.get<unknown[]>('/search', { q: query });
  }

  async searchAnime(query: string) {
    return this.get<unknown[]>('/search/anime', { q: query });
  }

  // --- Watch ---
  async getWatchProgress(episodeId: string) {
    return this.get<Record<string, unknown>>(`/watch/progress/${episodeId}`);
  }

  async updateWatchProgress(episodeId: string, data: Record<string, unknown>) {
    return this.put<Record<string, unknown>>(`/watch/progress/${episodeId}`, data);
  }

  async listWatchHistory() {
    return this.get<unknown[]>('/watch/history');
  }

  async continueWatching() {
    return this.get<unknown[]>('/watch/continue');
  }

  // --- Scheduling ---
  async listSimulcasts() {
    return this.get<unknown[]>('/scheduling/simulcasts');
  }

  async listUpcomingReleases() {
    return this.get<unknown[]>('/scheduling/upcoming');
  }

  async listReleases() {
    return this.get<unknown[]>('/scheduling/releases');
  }

  // --- Notifications ---
  async listNotifications() {
    return this.get<unknown[]>('/notifications');
  }

  async getUnreadCount() {
    return this.get<{ count: number }>('/notifications/unread-count');
  }

  async markNotificationRead(id: string) {
    return this.patch<{ marked: boolean }>(`/notifications/${id}/read`);
  }

  async markAllNotificationsRead() {
    return this.post<{ marked: boolean }>('/notifications/read-all');
  }

  // --- Library ---
  async listLibrary() {
    return this.get<unknown[]>('/libraries');
  }

  async createLibrary(data: Record<string, unknown>) {
    return this.post<Record<string, unknown>>('/libraries', data);
  }

  async updateLibrary(id: string, data: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/libraries/${id}`, data);
  }

  async deleteLibrary(id: string) {
    return this.delete<{ deleted: boolean }>(`/libraries/${id}`);
  }

  // --- Recommendations ---
  async getRecommendations() {
    return this.get<unknown[]>('/recommendations');
  }

  // --- Profiles ---
  async listProfiles() {
    return this.get<unknown[]>('/profiles');
  }

  async selectProfile(id: string) {
    return this.post<{ selected: boolean }>(`/profiles/${id}/select`);
  }

  // --- Workspaces ---
  async listWorkspaces() {
    return this.get<unknown[]>('/workspaces');
  }

  async getWorkspace(id: string) {
    return this.get<Record<string, unknown>>(`/workspaces/${id}`);
  }

  async createWorkspace(data: Record<string, unknown>) {
    return this.post<Record<string, unknown>>('/workspaces', data);
  }

  async updateWorkspace(id: string, data: Record<string, unknown>) {
    return this.patch<Record<string, unknown>>(`/workspaces/${id}`, data);
  }

  async deleteWorkspace(id: string) {
    return this.delete<{ deleted: boolean }>(`/workspaces/${id}`);
  }
}

let _client: ApiClient | null = null;

export function getClient(): ApiClient {
  if (!_client) {
    _client = new ApiClient();
  }
  return _client;
}

export function resetClient() {
  _client = null;
}
