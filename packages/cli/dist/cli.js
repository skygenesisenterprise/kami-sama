#!/usr/bin/env node
import {
  clearConfig,
  getConfig,
  getOutputFormat,
  getUser,
  getWorkspaceId,
  isAuthenticated,
  requireAuth,
  setRefreshToken,
  setServerUrl,
  setToken,
  setUser,
  setWorkspaceId
} from "./chunk-UTJ6R7AL.js";

// src/cli.ts
import { Command } from "commander";
import chalk4 from "chalk";

// src/commands/auth.ts
import { input, password } from "@inquirer/prompts";
import ora from "ora";
import { randomBytes } from "crypto";

// src/api/client.ts
var ApiClient = class {
  config;
  token = null;
  constructor() {
    this.config = getConfig();
  }
  setToken(token) {
    this.token = token;
  }
  getHeaders() {
    const headers = {
      "Content-Type": "application/json"
    };
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    return headers;
  }
  getUrl(path) {
    const base = this.config.serverUrl.replace(/\/+$/, "");
    if (base.endsWith("/api/v1")) {
      return `${base}${path}`;
    }
    return `${base}/api/v1${path}`;
  }
  async request(method, path, body, params) {
    let url = this.getUrl(path);
    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== void 0 && value !== null) {
          searchParams.set(key, String(value));
        }
      }
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }
    const options = {
      method,
      headers: this.getHeaders()
    };
    if (body && method !== "GET") {
      options.body = JSON.stringify(body);
    }
    const response = await fetch(url, options);
    const json = await response.json();
    if (!response.ok || !json.success) {
      const error13 = json;
      throw new Error(error13.message || error13.error || `HTTP ${response.status}`);
    }
    return json.data;
  }
  async get(path, params) {
    return this.request("GET", path, void 0, params);
  }
  async post(path, body) {
    return this.request("POST", path, body);
  }
  async put(path, body) {
    return this.request("PUT", path, body);
  }
  async patch(path, body) {
    return this.request("PATCH", path, body);
  }
  async delete(path) {
    return this.request("DELETE", path);
  }
  // --- Auth ---
  async login(email, password2) {
    const data = await this.post("/auth/login", { email, password: password2 });
    this.token = data.accessToken;
    return data;
  }
  async register(email, password2, displayName) {
    return this.post("/auth/register", { email, password: password2, displayName });
  }
  async getMe() {
    return this.get("/auth/me");
  }
  async refreshToken(refreshToken) {
    return this.post("/auth/refresh", { refreshToken });
  }
  // --- Dashboard ---
  async getDashboardStats() {
    return this.get("/dashboard/stats");
  }
  async getWeeklyViews() {
    return this.get("/dashboard/weekly-views");
  }
  async getTopAnime() {
    return this.get("/dashboard/top-anime");
  }
  async getRecentUploads() {
    return this.get("/dashboard/recent-uploads");
  }
  // --- Anime ---
  async listAnime(params) {
    return this.get("/anime", params);
  }
  async getAnime(id) {
    return this.get(`/anime/${id}`);
  }
  async createAnime(data) {
    return this.post("/anime", data);
  }
  async updateAnime(id, data) {
    return this.patch(`/anime/${id}`, data);
  }
  async deleteAnime(id) {
    return this.delete(`/anime/${id}`);
  }
  // --- Genres ---
  async listGenres() {
    return this.get("/genres");
  }
  async createGenre(data) {
    return this.post("/genres", data);
  }
  async updateGenre(id, data) {
    return this.patch(`/genres/${id}`, data);
  }
  async deleteGenre(id) {
    return this.delete(`/genres/${id}`);
  }
  // --- Studios ---
  async listStudios() {
    return this.get("/studios");
  }
  async createStudio(data) {
    return this.post("/studios", data);
  }
  async updateStudio(id, data) {
    return this.patch(`/studios/${id}`, data);
  }
  async deleteStudio(id) {
    return this.delete(`/studios/${id}`);
  }
  // --- Characters ---
  async listCharacters() {
    return this.get("/characters");
  }
  async createCharacter(data) {
    return this.post("/characters", data);
  }
  async updateCharacter(id, data) {
    return this.patch(`/characters/${id}`, data);
  }
  async deleteCharacter(id) {
    return this.delete(`/characters/${id}`);
  }
  // --- Episodes ---
  async listEpisodes(animeId) {
    return this.get(`/anime/${animeId}/episodes`);
  }
  async createEpisode(animeId, data) {
    return this.post(`/anime/${animeId}/episodes`, data);
  }
  async updateEpisode(animeId, episodeId, data) {
    return this.patch(`/anime/${animeId}/episodes/${episodeId}`, data);
  }
  async deleteEpisode(animeId, episodeId) {
    return this.delete(`/anime/${animeId}/episodes/${episodeId}`);
  }
  // --- Media ---
  async listMedia(params) {
    return this.get("/media", params);
  }
  async getMedia(id) {
    return this.get(`/media/${id}`);
  }
  async createMedia(data) {
    return this.post("/media", data);
  }
  async updateMedia(id, data) {
    return this.patch(`/media/${id}`, data);
  }
  async deleteMedia(id) {
    return this.delete(`/media/${id}`);
  }
  async listEncodingJobs() {
    return this.get("/media/encoding-jobs");
  }
  async getEncodingJob(id) {
    return this.get(`/media/encoding-jobs/${id}`);
  }
  async retryEncodingJob(id) {
    return this.post(`/media/encoding-jobs/${id}/retry`);
  }
  async cancelEncodingJob(id) {
    return this.post(`/media/encoding-jobs/${id}/cancel`);
  }
  // --- Sources ---
  async listSourceLibraries() {
    return this.get("/source/libraries");
  }
  async getSourceLibrary(id) {
    return this.get(`/source/libraries/${id}`);
  }
  async listSourceItems(params) {
    return this.get("/source/items", params);
  }
  async searchSourceItems(query) {
    return this.get("/source/items/search", { query });
  }
  async syncLibrary(id) {
    return this.post(`/source/libraries/${id}/sync`);
  }
  async getSyncStatus(id) {
    return this.get(`/source/libraries/${id}/sync`);
  }
  // --- Collections ---
  async listCollections() {
    return this.get("/collections");
  }
  async getCollection(id) {
    return this.get(`/collections/${id}`);
  }
  async createCollection(data) {
    return this.post("/collections", data);
  }
  async updateCollection(id, data) {
    return this.patch(`/collections/${id}`, data);
  }
  async deleteCollection(id) {
    return this.delete(`/collections/${id}`);
  }
  // --- Tags ---
  async listTags() {
    return this.get("/tags");
  }
  async createTag(data) {
    return this.post("/tags", data);
  }
  async updateTag(id, data) {
    return this.patch(`/tags/${id}`, data);
  }
  async deleteTag(id) {
    return this.delete(`/tags/${id}`);
  }
  // --- Categories ---
  async listCategories() {
    return this.get("/categories");
  }
  async createCategory(data) {
    return this.post("/categories", data);
  }
  async updateCategory(id, data) {
    return this.patch(`/categories/${id}`, data);
  }
  async deleteCategory(id) {
    return this.delete(`/categories/${id}`);
  }
  // --- Community ---
  async listReviews() {
    return this.get("/community/reviews");
  }
  async createReview(data) {
    return this.post("/community/reviews", data);
  }
  async listComments(reviewId) {
    return this.get(`/community/reviews/${reviewId}/comments`);
  }
  async createComment(reviewId, data) {
    return this.post(`/community/reviews/${reviewId}/comments`, data);
  }
  async listWatchlists() {
    return this.get("/community/watchlists");
  }
  async createWatchlist(data) {
    return this.post("/community/watchlists", data);
  }
  async listReports() {
    return this.get("/community/reports");
  }
  async createReport(data) {
    return this.post("/community/reports", data);
  }
  // --- Settings ---
  async listSettings() {
    return this.get("/settings");
  }
  async getSetting(key) {
    return this.get(`/settings/${key}`);
  }
  async updateSetting(key, value) {
    return this.put(`/settings/${key}`, { value });
  }
  async deleteSetting(key) {
    return this.delete(`/settings/${key}`);
  }
  async getGeneralSettings() {
    return this.get("/settings/general");
  }
  async updateGeneralSettings(data) {
    return this.put("/settings/general", data);
  }
  async getSecuritySettings() {
    return this.get("/settings/security");
  }
  async updateSecuritySettings(data) {
    return this.put("/settings/security", data);
  }
  async getBrandingSettings() {
    return this.get("/settings/branding");
  }
  async updateBrandingSettings(data) {
    return this.put("/settings/branding", data);
  }
  async getEmailSettings() {
    return this.get("/settings/email");
  }
  async updateEmailSettings(data) {
    return this.put("/settings/email", data);
  }
  async getStorageSettings() {
    return this.get("/settings/storage");
  }
  async updateStorageSettings(data) {
    return this.put("/settings/storage", data);
  }
  async getCDNSettings() {
    return this.get("/settings/cdn");
  }
  async updateCDNSettings(data) {
    return this.put("/settings/cdn", data);
  }
  async listDomains() {
    return this.get("/settings/domains");
  }
  async createDomain(data) {
    return this.post("/settings/domains", data);
  }
  async deleteDomain(id) {
    return this.delete(`/settings/domains/${id}`);
  }
  async listApiKeys() {
    return this.get("/settings/apis");
  }
  async createApiKey(data) {
    return this.post("/settings/apis", data);
  }
  async deleteApiKey(id) {
    return this.delete(`/settings/apis/${id}`);
  }
  async updateOAuth(provider, data) {
    return this.put(`/settings/oauth/${provider}`, data);
  }
  async getMaintenance() {
    return this.get("/settings/maintenance");
  }
  async updateMaintenance(data) {
    return this.put("/settings/maintenance", data);
  }
  async clearCache() {
    return this.post("/settings/maintenance/cache-clear");
  }
  async optimizeDB() {
    return this.post("/settings/maintenance/db-optimize");
  }
  // --- Admin ---
  async adminListUsers(params) {
    return this.get("/admin/users", params);
  }
  async adminGetUser(id) {
    return this.get(`/admin/users/${id}`);
  }
  async adminUpdateUser(id, data) {
    return this.patch(`/admin/users/${id}`, data);
  }
  async adminDeleteUser(id) {
    return this.delete(`/admin/users/${id}`);
  }
  async adminDisableUser(id) {
    return this.post(`/admin/users/${id}/disable`);
  }
  async adminEnableUser(id) {
    return this.post(`/admin/users/${id}/enable`);
  }
  async adminListRoles() {
    return this.get("/admin/roles");
  }
  async adminCreateRole(data) {
    return this.post("/admin/roles", data);
  }
  async adminUpdateRole(id, data) {
    return this.patch(`/admin/roles/${id}`, data);
  }
  async adminDeleteRole(id) {
    return this.delete(`/admin/roles/${id}`);
  }
  async adminAssignRole(roleId, data) {
    return this.post(`/admin/roles/${roleId}/assign`, data);
  }
  async adminGetPermissionMatrix() {
    return this.get("/admin/permissions");
  }
  async adminUpdatePermissions(data) {
    return this.patch("/admin/permissions", data);
  }
  async adminListModerations() {
    return this.get("/admin/moderations");
  }
  async adminModerateItem(id, action) {
    return this.post(`/admin/moderations/${id}/${action}`);
  }
  // --- System ---
  async getSystemHealth() {
    return this.get("/system/health/services");
  }
  async getSystemUptime() {
    return this.get("/system/health/uptime");
  }
  async listSystemLogs(params) {
    return this.get("/system/logs", params);
  }
  async searchSystemLogs(query) {
    return this.get("/system/logs/search", { q: query });
  }
  async getQueueStatus() {
    return this.get("/system/queue");
  }
  async listQueueJobs() {
    return this.get("/system/queue/jobs");
  }
  async retryQueueJob(id) {
    return this.post(`/system/queue/jobs/${id}/retry`);
  }
  async cancelQueueJob(id) {
    return this.post(`/system/queue/jobs/${id}/cancel`);
  }
  async flushQueue() {
    return this.post("/system/queue/flush");
  }
  async getCacheStatus() {
    return this.get("/system/cache");
  }
  async flushCacheSystem() {
    return this.post("/system/cache/flush");
  }
  async listCacheKeys() {
    return this.get("/system/cache/keys");
  }
  async deleteCacheKey(key) {
    return this.delete(`/system/cache/keys/${key}`);
  }
  async getSearchStatus() {
    return this.get("/system/search");
  }
  async triggerReindex() {
    return this.post("/system/search/reindex");
  }
  async listBackgroundJobs() {
    return this.get("/system/background-jobs");
  }
  async runBackgroundJob(id) {
    return this.post(`/system/background-jobs/${id}/run`);
  }
  // --- Analytics ---
  async getAnalyticsOverview(params) {
    return this.get("/analytics/overview", params);
  }
  async getWatchTime(params) {
    return this.get("/analytics/watch-time", params);
  }
  async getDevices() {
    return this.get("/analytics/devices");
  }
  async getPopular() {
    return this.get("/analytics/popular");
  }
  async getGeography() {
    return this.get("/analytics/geography");
  }
  async getActiveUsers() {
    return this.get("/analytics/active-users");
  }
  // --- Discover ---
  async getDiscover() {
    return this.get("/discover");
  }
  async getDiscoverSections() {
    return this.get("/discover/sections");
  }
  async getContentDetail(anilistId) {
    return this.get(`/discover/content/${anilistId}`);
  }
  // --- Integrations ---
  async anilistSearch(query) {
    return this.get("/integrations/anilist/search", { q: query });
  }
  async anilistTrending() {
    return this.get("/integrations/anilist/trending");
  }
  async anilistPopular() {
    return this.get("/integrations/anilist/popular");
  }
  async anilistImport(anilistId) {
    return this.post(`/integrations/anilist/${anilistId}/import`);
  }
  async plexHealth() {
    return this.get("/integrations/plex/health");
  }
  async plexLibraries() {
    return this.get("/integrations/plex/libraries");
  }
  async plexSearch(query) {
    return this.get("/integrations/plex/search", { query });
  }
  async plexImport(ratingKey) {
    return this.post("/integrations/plex/import", { ratingKey });
  }
  // --- Support ---
  async listTickets() {
    return this.get("/support/tickets");
  }
  async createTicket(data) {
    return this.post("/support/tickets", data);
  }
  async getTicket(id) {
    return this.get(`/support/tickets/${id}`);
  }
  async replyToTicket(id, data) {
    return this.post(`/support/tickets/${id}/reply`, data);
  }
  async closeTicket(id) {
    return this.post(`/support/tickets/${id}/close`);
  }
  async listFaq() {
    return this.get("/support/faq");
  }
  async createFaq(data) {
    return this.post("/support/faq", data);
  }
  async deleteFaq(id) {
    return this.delete(`/support/faq/${id}`);
  }
  // --- Search ---
  async search(query) {
    return this.get("/search", { q: query });
  }
  async searchAnime(query) {
    return this.get("/search/anime", { q: query });
  }
  // --- Watch ---
  async getWatchProgress(episodeId) {
    return this.get(`/watch/progress/${episodeId}`);
  }
  async updateWatchProgress(episodeId, data) {
    return this.put(`/watch/progress/${episodeId}`, data);
  }
  async listWatchHistory() {
    return this.get("/watch/history");
  }
  async continueWatching() {
    return this.get("/watch/continue");
  }
  // --- Scheduling ---
  async listSimulcasts() {
    return this.get("/scheduling/simulcasts");
  }
  async listUpcomingReleases() {
    return this.get("/scheduling/upcoming");
  }
  async listReleases() {
    return this.get("/scheduling/releases");
  }
  // --- Notifications ---
  async listNotifications() {
    return this.get("/notifications");
  }
  async getUnreadCount() {
    return this.get("/notifications/unread-count");
  }
  async markNotificationRead(id) {
    return this.patch(`/notifications/${id}/read`);
  }
  async markAllNotificationsRead() {
    return this.post("/notifications/read-all");
  }
  // --- Library ---
  async listLibrary() {
    return this.get("/libraries");
  }
  async createLibrary(data) {
    return this.post("/libraries", data);
  }
  async updateLibrary(id, data) {
    return this.patch(`/libraries/${id}`, data);
  }
  async deleteLibrary(id) {
    return this.delete(`/libraries/${id}`);
  }
  // --- Recommendations ---
  async getRecommendations() {
    return this.get("/recommendations");
  }
  // --- Profiles ---
  async listProfiles() {
    return this.get("/profiles");
  }
  async selectProfile(id) {
    return this.post(`/profiles/${id}/select`);
  }
  // --- Workspaces ---
  async listWorkspaces() {
    return this.get("/workspaces");
  }
  async getWorkspace(id) {
    return this.get(`/workspaces/${id}`);
  }
  async createWorkspace(data) {
    return this.post("/workspaces", data);
  }
  async updateWorkspace(id, data) {
    return this.patch(`/workspaces/${id}`, data);
  }
  async deleteWorkspace(id) {
    return this.delete(`/workspaces/${id}`);
  }
};
var _client = null;
function getClient() {
  if (!_client) {
    _client = new ApiClient();
  }
  return _client;
}

// src/ui/format.ts
import chalk from "chalk";
import Table from "cli-table3";
function success(message) {
  console.log(chalk.green("\u2714") + " " + message);
}
function error(message) {
  console.error(chalk.red("\u2716") + " " + message);
}
function info(message) {
  console.log(chalk.blue("\u2139") + " " + message);
}
function heading(message) {
  console.log(chalk.bold.underline(message));
}
function formatJson(data) {
  return JSON.stringify(data, null, 2);
}
function output(data, label) {
  const format = getOutputFormat();
  if (label) heading(label);
  if (format === "json") {
    console.log(formatJson(data));
  } else if (Array.isArray(data)) {
    printTable(data);
  } else if (typeof data === "object" && data !== null) {
    printKeyValueTable(data);
  } else {
    console.log(String(data));
  }
}
function printTable(rows, columns) {
  if (rows.length === 0) {
    info("No data found.");
    return;
  }
  const keys = columns ?? Object.keys(rows[0]);
  const table = new Table({
    head: keys.map((k) => chalk.cyan(k)),
    style: { head: ["cyan"] },
    wordWrap: true,
    colWidths: keys.map(() => null)
  });
  for (const row of rows) {
    table.push(keys.map((k) => formatCellValue(row[k])));
  }
  console.log(table.toString());
}
function printKeyValueTable(data) {
  const table = new Table({
    style: { head: ["cyan"] },
    colWidths: [25, 60],
    wordWrap: true
  });
  for (const [key, value] of Object.entries(data)) {
    table.push({ [chalk.cyan(key)]: formatCellValue(value) });
  }
  console.log(table.toString());
}
function formatCellValue(value) {
  if (value === null || value === void 0) return chalk.dim("\u2014");
  if (typeof value === "boolean") return value ? chalk.green("yes") : chalk.red("no");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

// src/auth/oauth-server.ts
import { createServer } from "http";
import { URL } from "url";
function waitForOAuthCallback(port, timeoutMs = 12e4) {
  return new Promise((resolve, reject) => {
    let resolved = false;
    const server = createServer(async (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }
      const url = new URL(req.url ?? "/", `http://localhost:${port}`);
      if (url.pathname === "/callback") {
        const token = url.searchParams.get("token");
        const refreshToken = url.searchParams.get("refreshToken");
        const state = url.searchParams.get("state");
        const error13 = url.searchParams.get("error");
        if (error13) {
          res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
          res.end(`
            <!DOCTYPE html>
            <html><body style="font-family:system-ui;text-align:center;padding:60px">
              <h2>\u274C Authentication failed</h2>
              <p>${error13}</p>
              <p style="color:#666">You can close this tab.</p>
            </body></html>
          `);
          if (!resolved) {
            resolved = true;
            server.close();
            reject(new Error(error13));
          }
          return;
        }
        if (!token) {
          if (req.method === "POST") {
            let body = "";
            for await (const chunk of req) body += chunk;
            try {
              const json = JSON.parse(body);
              const postToken = json.token;
              const postRefreshToken = json.refreshToken;
              const postState = json.state;
              const postUser = json.user;
              if (!postToken) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Missing token in POST body" }));
                return;
              }
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ ok: true }));
              if (!resolved) {
                resolved = true;
                server.close();
                resolve({
                  token: postToken,
                  refreshToken: postRefreshToken ?? void 0,
                  state: postState ?? void 0,
                  user: postUser ?? void 0
                });
              }
              return;
            } catch {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Invalid JSON body" }));
              return;
            }
          }
          res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
          res.end(`
            <!DOCTYPE html>
            <html><body style="font-family:system-ui;text-align:center;padding:60px">
              <h2>\u26A0\uFE0F Missing token</h2>
              <p style="color:#666">You can close this tab.</p>
            </body></html>
          `);
          return;
        }
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(`
          <!DOCTYPE html>
          <html><body style="font-family:system-ui;text-align:center;padding:60px">
            <h2>\u2705 Authenticated!</h2>
            <p>You can close this tab and return to the terminal.</p>
            <script>setTimeout(() => window.close(), 2000)</script>
          </body></html>
        `);
        if (!resolved) {
          resolved = true;
          server.close();
          resolve({
            token,
            refreshToken: refreshToken ?? void 0,
            state: state ?? void 0
          });
        }
      } else {
        res.writeHead(404);
        res.end("Not found");
      }
    });
    server.listen(port, "127.0.0.1");
    server.on("error", (err) => {
      if (!resolved) {
        resolved = true;
        reject(err);
      }
    });
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        server.close();
        reject(new Error("OAuth callback timed out"));
      }
    }, timeoutMs);
  });
}

// src/auth/sso.ts
import chalk2 from "chalk";
var DOMAINS = {
  production: {
    sso: "sso.kami-sama.tv",
    api: "api.kami-sama.tv",
    protocol: "https"
  },
  localhost: {
    sso: "sso.kami-sama.localhost",
    api: "api.kami-sama.localhost",
    protocol: "http"
  }
};
function detectEnvironment() {
  const serverUrl = getConfig().serverUrl;
  return serverUrl.includes("kami-sama.tv") ? "production" : "localhost";
}
function getDomainConfig() {
  return DOMAINS[detectEnvironment()];
}
function getSsoUrl(path = "") {
  const config = getDomainConfig();
  return `${config.protocol}://${config.sso}${path}`;
}

// src/commands/auth.ts
function registerAuthCommands(program2) {
  const auth = program2.command("auth").description("Authentication & configuration");
  auth.command("login").description("Login to your Kami server").option("-e, --email <email>", "Email address").option("-p, --password <password>", "Password").option("-s, --server <url>", "Server URL").option("--sso", "Login via SSO (opens browser)").action(async (opts) => {
    const config = getConfig();
    let serverUrl = opts.server || config.serverUrl;
    if (!opts.server) {
      serverUrl = await input({ message: "Server URL:", default: serverUrl });
    }
    setServerUrl(serverUrl);
    if (opts.sso) {
      const port = 18923 + Math.floor(Math.random() * 1e3);
      const state = randomBytes(16).toString("hex");
      const ssoUrl = getSsoUrl(`/cli-auth?port=${port}&state=${state}`);
      const spinner2 = ora("Starting local callback server...").start();
      try {
        const result = await waitForOAuthCallback(port, 12e4);
        if (result.state !== state) {
          spinner2.fail("State mismatch \u2014 possible CSRF attack.");
          process.exit(1);
        }
        setToken(result.token);
        if (result.refreshToken) setRefreshToken(result.refreshToken);
        spinner2.succeed("SSO login successful!");
        const client = getClient();
        client.setToken(result.token);
        const user = await client.getMe();
        setUser(user);
        printKeyValueTable({
          Server: serverUrl,
          User: user?.displayName ?? user?.email ?? "\u2014",
          Method: "SSO"
        });
      } catch (err) {
        spinner2.fail("SSO login failed");
        error(err.message);
        process.exit(1);
      }
      return;
    }
    const email = opts.email || await input({ message: "Email:" });
    const pass = opts.password || await password({ message: "Password:" });
    const spinner = ora("Logging in...").start();
    try {
      const client = getClient();
      const result = await client.login(email, pass);
      setToken(result.accessToken);
      setRefreshToken(result.refreshToken);
      setUser(result.user);
      spinner.succeed("Logged in successfully!");
      printKeyValueTable({
        Email: email,
        Server: serverUrl,
        User: result.user?.displayName || email
      });
    } catch (err) {
      spinner.fail("Login failed");
      error(err.message);
      process.exit(1);
    }
  });
  auth.command("logout").description("Logout and clear stored credentials").action(() => {
    clearConfig();
    success("Logged out. All credentials cleared.");
  });
  auth.command("register").description("Register a new account").option("-e, --email <email>", "Email address").option("-p, --password <password>", "Password").option("-n, --name <name>", "Display name").option("-s, --server <url>", "Server URL").action(async (opts) => {
    const config = getConfig();
    let serverUrl = opts.server || config.serverUrl;
    if (!opts.server) {
      serverUrl = await input({ message: "Server URL:", default: serverUrl });
    }
    setServerUrl(serverUrl);
    const email = opts.email || await input({ message: "Email:" });
    const pass = opts.password || await password({ message: "Password:" });
    const name = opts.name || await input({ message: "Display name:" });
    const spinner = ora("Registering...").start();
    try {
      const client = getClient();
      const result = await client.register(email, pass, name);
      setToken(result.accessToken);
      setRefreshToken(result.refreshToken);
      setUser(result.user);
      spinner.succeed("Registered and logged in!");
      printKeyValueTable({
        Email: email,
        Server: serverUrl,
        User: name
      });
    } catch (err) {
      spinner.fail("Registration failed");
      error(err.message);
      process.exit(1);
    }
  });
  auth.command("whoami").description("Show current authenticated user").action(async () => {
    if (!isAuthenticated()) {
      error("Not logged in. Run `kami auth login` first.");
      process.exit(1);
    }
    const spinner = ora("Fetching user info...").start();
    try {
      const client = getClient();
      const user = await client.getMe();
      spinner.stop();
      heading("Current User");
      printKeyValueTable(user);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  auth.command("configure").description("Configure server URL and preferences").option("-s, --server <url>", "Server URL").option("-f, --format <format>", "Output format (table|json)").action(async (opts) => {
    const config = getConfig();
    let serverUrl = opts.server;
    let format = opts.format;
    if (!serverUrl) {
      serverUrl = await input({ message: "Server URL:", default: config.serverUrl });
    }
    if (!format) {
      format = await input({ message: "Output format (table|json):", default: config.outputFormat });
    }
    setServerUrl(serverUrl);
    const { setOutputFormat } = await import("./config-4SEU42ZO.js");
    setOutputFormat(format);
    success("Configuration saved.");
  });
  auth.command("status").description("Show authentication status").action(() => {
    const config = getConfig();
    if (isAuthenticated()) {
      const user = getUser();
      heading("Authenticated");
      printKeyValueTable({
        Server: config.serverUrl,
        Email: user?.email ?? "\u2014",
        User: user?.displayName ?? "\u2014",
        Roles: (user?.roles ?? []).join(", ") || "\u2014",
        "Output Format": config.outputFormat
      });
    } else {
      heading("Not authenticated");
      console.log("Run `kami auth login` to authenticate.");
    }
  });
}

// src/commands/catalog.ts
import { input as input2, confirm as confirm2 } from "@inquirer/prompts";
import ora2 from "ora";
function registerCatalogCommands(program2) {
  const catalog = program2.command("catalog").description("Manage your media catalog");
  const anime = catalog.command("anime").description("Manage anime entries");
  anime.command("list").description("List all anime").option("-p, --page <n>", "Page number", "1").option("-l, --limit <n>", "Items per page", "20").option("--search <query>", "Search filter").action(async (opts) => {
    requireAuth();
    const spinner = ora2("Fetching anime...").start();
    try {
      const client = getClient();
      const data = await client.listAnime({ page: opts.page, limit: opts.limit, search: opts.search });
      spinner.stop();
      output(data, "Anime List");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  anime.command("get <id>").description("Get anime details").action(async (id) => {
    requireAuth();
    const spinner = ora2("Fetching...").start();
    try {
      const client = getClient();
      const data = await client.getAnime(id);
      spinner.stop();
      printKeyValueTable(data);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  anime.command("create").description("Create a new anime entry").option("-t, --title <title>", "Anime title").option("--slug <slug>", "URL slug").action(async (opts) => {
    requireAuth();
    const title = opts.title || await input2({ message: "Title:" });
    const slug = opts.slug || await input2({ message: "Slug:" });
    const spinner = ora2("Creating...").start();
    try {
      const client = getClient();
      const data = await client.createAnime({ title, slug });
      spinner.succeed(`Anime "${title}" created!`);
      output(data);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  anime.command("update <id>").description("Update an anime entry").option("-t, --title <title>", "New title").option("--slug <slug>", "New slug").option("--status <status>", "New status").action(async (id, opts) => {
    requireAuth();
    const updates = {};
    if (opts.title) updates.title = opts.title;
    if (opts.slug) updates.slug = opts.slug;
    if (opts.status) updates.status = opts.status;
    if (Object.keys(updates).length === 0) {
      error("No fields to update. Use --title, --slug, or --status.");
      process.exit(1);
    }
    const spinner = ora2("Updating...").start();
    try {
      const client = getClient();
      await client.updateAnime(id, updates);
      spinner.succeed("Anime updated!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  anime.command("delete <id>").description("Delete an anime entry").option("-y, --yes", "Skip confirmation").action(async (id, opts) => {
    requireAuth();
    if (!opts.yes) {
      const answer = await confirm2({ message: `Delete anime ${id}?`, default: false });
      if (!answer) {
        console.log("Cancelled.");
        return;
      }
    }
    const spinner = ora2("Deleting...").start();
    try {
      const client = getClient();
      await client.deleteAnime(id);
      spinner.succeed("Anime deleted!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  const genres = catalog.command("genres").description("Manage genres");
  genres.command("list").description("List all genres").action(async () => {
    requireAuth();
    const spinner = ora2("Fetching...").start();
    try {
      const client = getClient();
      const data = await client.listGenres();
      spinner.stop();
      output(data, "Genres");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  genres.command("create").description("Create a genre").option("-n, --name <name>", "Genre name").action(async (opts) => {
    requireAuth();
    const name = opts.name || await input2({ message: "Genre name:" });
    const spinner = ora2("Creating...").start();
    try {
      const client = getClient();
      await client.createGenre({ name });
      spinner.succeed(`Genre "${name}" created!`);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  genres.command("delete <id>").description("Delete a genre").option("-y, --yes", "Skip confirmation").action(async (id, opts) => {
    requireAuth();
    if (!opts.yes) {
      const answer = await confirm2({ message: `Delete genre ${id}?`, default: false });
      if (!answer) {
        console.log("Cancelled.");
        return;
      }
    }
    const spinner = ora2("Deleting...").start();
    try {
      const client = getClient();
      await client.deleteGenre(id);
      spinner.succeed("Genre deleted!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  const studios = catalog.command("studios").description("Manage studios");
  studios.command("list").description("List all studios").action(async () => {
    requireAuth();
    const spinner = ora2("Fetching...").start();
    try {
      const client = getClient();
      const data = await client.listStudios();
      spinner.stop();
      output(data, "Studios");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  studios.command("create").description("Create a studio").option("-n, --name <name>", "Studio name").action(async (opts) => {
    requireAuth();
    const name = opts.name || await input2({ message: "Studio name:" });
    const spinner = ora2("Creating...").start();
    try {
      const client = getClient();
      await client.createStudio({ name });
      spinner.succeed(`Studio "${name}" created!`);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  studios.command("delete <id>").description("Delete a studio").option("-y, --yes", "Skip confirmation").action(async (id, opts) => {
    requireAuth();
    if (!opts.yes) {
      const answer = await confirm2({ message: `Delete studio ${id}?`, default: false });
      if (!answer) {
        console.log("Cancelled.");
        return;
      }
    }
    const spinner = ora2("Deleting...").start();
    try {
      const client = getClient();
      await client.deleteStudio(id);
      spinner.succeed("Studio deleted!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  const characters = catalog.command("characters").description("Manage characters");
  characters.command("list").description("List all characters").action(async () => {
    requireAuth();
    const spinner = ora2("Fetching...").start();
    try {
      const client = getClient();
      const data = await client.listCharacters();
      spinner.stop();
      output(data, "Characters");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  characters.command("create").description("Create a character").option("-n, --name <name>", "Character name").action(async (opts) => {
    requireAuth();
    const name = opts.name || await input2({ message: "Character name:" });
    const spinner = ora2("Creating...").start();
    try {
      const client = getClient();
      await client.createCharacter({ name });
      spinner.succeed(`Character "${name}" created!`);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  characters.command("delete <id>").description("Delete a character").option("-y, --yes", "Skip confirmation").action(async (id, opts) => {
    requireAuth();
    if (!opts.yes) {
      const answer = await confirm2({ message: `Delete character ${id}?`, default: false });
      if (!answer) {
        console.log("Cancelled.");
        return;
      }
    }
    const spinner = ora2("Deleting...").start();
    try {
      const client = getClient();
      await client.deleteCharacter(id);
      spinner.succeed("Character deleted!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  const episodes = catalog.command("episodes").description("Manage episodes");
  episodes.command("list <animeId>").description("List episodes for an anime").action(async (animeId) => {
    requireAuth();
    const spinner = ora2("Fetching...").start();
    try {
      const client = getClient();
      const data = await client.listEpisodes(animeId);
      spinner.stop();
      output(data, "Episodes");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  episodes.command("create <animeId>").description("Create an episode").option("-n, --number <n>", "Episode number").option("-t, --title <title>", "Episode title").action(async (animeId, opts) => {
    requireAuth();
    const number = opts.number || await input2({ message: "Episode number:" });
    const title = opts.title || await input2({ message: "Title:" });
    const spinner = ora2("Creating...").start();
    try {
      const client = getClient();
      await client.createEpisode(animeId, { number: parseInt(number), title });
      spinner.succeed("Episode created!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  episodes.command("delete <animeId> <episodeId>").description("Delete an episode").option("-y, --yes", "Skip confirmation").action(async (animeId, episodeId, opts) => {
    requireAuth();
    if (!opts.yes) {
      const answer = await confirm2({ message: "Delete this episode?", default: false });
      if (!answer) {
        console.log("Cancelled.");
        return;
      }
    }
    const spinner = ora2("Deleting...").start();
    try {
      const client = getClient();
      await client.deleteEpisode(animeId, episodeId);
      spinner.succeed("Episode deleted!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  const collections = catalog.command("collections").description("Manage collections");
  collections.command("list").description("List all collections").action(async () => {
    requireAuth();
    const spinner = ora2("Fetching...").start();
    try {
      const client = getClient();
      const data = await client.listCollections();
      spinner.stop();
      output(data, "Collections");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  collections.command("create").description("Create a collection").option("-n, --name <name>", "Collection name").option("-d, --description <desc>", "Description").action(async (opts) => {
    requireAuth();
    const name = opts.name || await input2({ message: "Collection name:" });
    const description = opts.description || await input2({ message: "Description (optional):", default: "" });
    const spinner = ora2("Creating...").start();
    try {
      const client = getClient();
      await client.createCollection({ name, description });
      spinner.succeed(`Collection "${name}" created!`);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  collections.command("delete <id>").description("Delete a collection").option("-y, --yes", "Skip confirmation").action(async (id, opts) => {
    requireAuth();
    if (!opts.yes) {
      const answer = await confirm2({ message: `Delete collection ${id}?`, default: false });
      if (!answer) {
        console.log("Cancelled.");
        return;
      }
    }
    const spinner = ora2("Deleting...").start();
    try {
      const client = getClient();
      await client.deleteCollection(id);
      spinner.succeed("Collection deleted!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  const tags = catalog.command("tags").description("Manage tags");
  tags.command("list").description("List all tags").action(async () => {
    requireAuth();
    const spinner = ora2("Fetching...").start();
    try {
      const client = getClient();
      const data = await client.listTags();
      spinner.stop();
      output(data, "Tags");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  tags.command("create").description("Create a tag").option("-n, --name <name>", "Tag name").action(async (opts) => {
    requireAuth();
    const name = opts.name || await input2({ message: "Tag name:" });
    const spinner = ora2("Creating...").start();
    try {
      const client = getClient();
      await client.createTag({ name });
      spinner.succeed(`Tag "${name}" created!`);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  tags.command("delete <id>").description("Delete a tag").option("-y, --yes", "Skip confirmation").action(async (id, opts) => {
    requireAuth();
    if (!opts.yes) {
      const answer = await confirm2({ message: `Delete tag ${id}?`, default: false });
      if (!answer) {
        console.log("Cancelled.");
        return;
      }
    }
    const spinner = ora2("Deleting...").start();
    try {
      const client = getClient();
      await client.deleteTag(id);
      spinner.succeed("Tag deleted!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  const categories = catalog.command("categories").description("Manage categories");
  categories.command("list").description("List all categories").action(async () => {
    requireAuth();
    const spinner = ora2("Fetching...").start();
    try {
      const client = getClient();
      const data = await client.listCategories();
      spinner.stop();
      output(data, "Categories");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  categories.command("create").description("Create a category").option("-n, --name <name>", "Category name").action(async (opts) => {
    requireAuth();
    const name = opts.name || await input2({ message: "Category name:" });
    const spinner = ora2("Creating...").start();
    try {
      const client = getClient();
      await client.createCategory({ name });
      spinner.succeed(`Category "${name}" created!`);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  categories.command("delete <id>").description("Delete a category").option("-y, --yes", "Skip confirmation").action(async (id, opts) => {
    requireAuth();
    if (!opts.yes) {
      const answer = await confirm2({ message: `Delete category ${id}?`, default: false });
      if (!answer) {
        console.log("Cancelled.");
        return;
      }
    }
    const spinner = ora2("Deleting...").start();
    try {
      const client = getClient();
      await client.deleteCategory(id);
      spinner.succeed("Category deleted!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
}

// src/commands/media.ts
import { confirm as confirm3 } from "@inquirer/prompts";
import ora3 from "ora";
function registerMediaCommands(program2) {
  const media = program2.command("media").description("Manage media files");
  media.command("list").description("List all media").option("-p, --page <n>", "Page number", "1").option("-l, --limit <n>", "Items per page", "20").option("--type <type>", "Filter by type (video|audio|image)").action(async (opts) => {
    requireAuth();
    const spinner = ora3("Fetching media...").start();
    try {
      const client = getClient();
      const data = await client.listMedia({ page: opts.page, limit: opts.limit, type: opts.type });
      spinner.stop();
      output(data, "Media Files");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  media.command("get <id>").description("Get media details").action(async (id) => {
    requireAuth();
    const spinner = ora3("Fetching...").start();
    try {
      const client = getClient();
      const data = await client.getMedia(id);
      spinner.stop();
      printKeyValueTable(data);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  media.command("delete <id>").description("Delete a media file").option("-y, --yes", "Skip confirmation").action(async (id, opts) => {
    requireAuth();
    if (!opts.yes) {
      const answer = await confirm3({ message: `Delete media ${id}?`, default: false });
      if (!answer) {
        console.log("Cancelled.");
        return;
      }
    }
    const spinner = ora3("Deleting...").start();
    try {
      const client = getClient();
      await client.deleteMedia(id);
      spinner.succeed("Media deleted!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  const encoding = media.command("encoding").description("Manage encoding jobs");
  encoding.command("list").description("List encoding jobs").option("-p, --page <n>", "Page number", "1").option("-l, --limit <n>", "Items per page", "20").action(async (opts) => {
    requireAuth();
    const spinner = ora3("Fetching encoding jobs...").start();
    try {
      const client = getClient();
      const data = await client.listEncodingJobs();
      spinner.stop();
      output(data, "Encoding Jobs");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  encoding.command("get <id>").description("Get encoding job details").action(async (id) => {
    requireAuth();
    const spinner = ora3("Fetching...").start();
    try {
      const client = getClient();
      const data = await client.getEncodingJob(id);
      spinner.stop();
      printKeyValueTable(data);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  encoding.command("retry <id>").description("Retry a failed encoding job").action(async (id) => {
    requireAuth();
    const spinner = ora3("Retrying...").start();
    try {
      const client = getClient();
      await client.retryEncodingJob(id);
      spinner.succeed("Job retry queued!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  encoding.command("cancel <id>").description("Cancel an encoding job").option("-y, --yes", "Skip confirmation").action(async (id, opts) => {
    requireAuth();
    if (!opts.yes) {
      const answer = await confirm3({ message: "Cancel this encoding job?", default: false });
      if (!answer) {
        console.log("Cancelled.");
        return;
      }
    }
    const spinner = ora3("Cancelling...").start();
    try {
      const client = getClient();
      await client.cancelEncodingJob(id);
      spinner.succeed("Job cancelled!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
}

// src/commands/source.ts
import { input as input4 } from "@inquirer/prompts";
import ora4 from "ora";
function registerSourceCommands(program2) {
  const source = program2.command("source").description("Manage the content media source (Plex, local); streaming is delegated to the media-server");
  const libraries = source.command("libraries").description("Manage source libraries");
  libraries.command("list").description("List all source libraries").action(async () => {
    requireAuth();
    const spinner = ora4("Fetching libraries...").start();
    try {
      const client = getClient();
      const data = await client.listSourceLibraries();
      spinner.stop();
      output(data, "Source Libraries");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  libraries.command("get <id>").description("Get library details").action(async (id) => {
    requireAuth();
    const spinner = ora4("Fetching...").start();
    try {
      const client = getClient();
      const data = await client.getSourceLibrary(id);
      spinner.stop();
      printKeyValueTable(data);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  libraries.command("sync <id>").description("Sync a library from its source").action(async (id) => {
    requireAuth();
    const spinner = ora4("Syncing library...").start();
    try {
      const client = getClient();
      await client.syncLibrary(id);
      spinner.succeed("Library sync initiated!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  libraries.command("status <id>").description("Get sync status for a library").action(async (id) => {
    requireAuth();
    const spinner = ora4("Fetching sync status...").start();
    try {
      const client = getClient();
      const data = await client.getSyncStatus(id);
      spinner.stop();
      printKeyValueTable(data);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  const items = source.command("items").description("Manage source items");
  items.command("list").description("List items from sources").option("-l, --library <id>", "Filter by library ID").option("-p, --page <n>", "Page number", "1").action(async (opts) => {
    requireAuth();
    const spinner = ora4("Fetching items...").start();
    try {
      const client = getClient();
      const data = await client.listSourceItems({ libraryId: opts.library, page: opts.page });
      spinner.stop();
      output(data, "Source Items");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  items.command("search").description("Search items across all sources").argument("[query]", "Search query").action(async (query) => {
    requireAuth();
    const q = query || await input4({ message: "Search query:" });
    const spinner = ora4("Searching...").start();
    try {
      const client = getClient();
      const data = await client.searchSourceItems(q);
      spinner.stop();
      output(data, `Results for "${q}"`);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
}

// src/commands/community.ts
import { input as input5 } from "@inquirer/prompts";
import ora5 from "ora";
function registerCommunityCommands(program2) {
  const community = program2.command("community").description("Community features: reviews, comments, watchlists");
  const reviews = community.command("reviews").description("Manage reviews");
  reviews.command("list").description("List all reviews").action(async () => {
    requireAuth();
    const spinner = ora5("Fetching reviews...").start();
    try {
      const client = getClient();
      const data = await client.listReviews();
      spinner.stop();
      output(data, "Reviews");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  reviews.command("create").description("Create a review").option("--anime <id>", "Anime ID").option("--rating <n>", "Rating (1-10)").option("--body <text>", "Review body").action(async (opts) => {
    requireAuth();
    const animeId = opts.anime || await input5({ message: "Anime ID:" });
    const rating = opts.rating || await input5({ message: "Rating (1-10):" });
    const body = opts.body || await input5({ message: "Review text:" });
    const spinner = ora5("Creating review...").start();
    try {
      const client = getClient();
      await client.createReview({ animeId, rating: parseInt(rating), body });
      spinner.succeed("Review created!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  const comments = community.command("comments").description("Manage comments");
  comments.command("list <reviewId>").description("List comments on a review").action(async (reviewId) => {
    requireAuth();
    const spinner = ora5("Fetching comments...").start();
    try {
      const client = getClient();
      const data = await client.listComments(reviewId);
      spinner.stop();
      output(data, "Comments");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  comments.command("create <reviewId>").description("Comment on a review").option("--body <text>", "Comment text").action(async (reviewId, opts) => {
    requireAuth();
    const body = opts.body || await input5({ message: "Comment:" });
    const spinner = ora5("Posting comment...").start();
    try {
      const client = getClient();
      await client.createComment(reviewId, { body });
      spinner.succeed("Comment posted!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  const watchlists = community.command("watchlists").description("Manage watchlists");
  watchlists.command("list").description("List all watchlists").action(async () => {
    requireAuth();
    const spinner = ora5("Fetching watchlists...").start();
    try {
      const client = getClient();
      const data = await client.listWatchlists();
      spinner.stop();
      output(data, "Watchlists");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  watchlists.command("create").description("Create a watchlist").option("-n, --name <name>", "Watchlist name").option("-d, --description <desc>", "Description").action(async (opts) => {
    requireAuth();
    const name = opts.name || await input5({ message: "Watchlist name:" });
    const description = opts.description || await input5({ message: "Description (optional):", default: "" });
    const spinner = ora5("Creating...").start();
    try {
      const client = getClient();
      await client.createWatchlist({ name, description });
      spinner.succeed(`Watchlist "${name}" created!`);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  const reports = community.command("reports").description("Manage reports");
  reports.command("list").description("List all reports").action(async () => {
    requireAuth();
    const spinner = ora5("Fetching reports...").start();
    try {
      const client = getClient();
      const data = await client.listReports();
      spinner.stop();
      output(data, "Reports");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  reports.command("create").description("Create a report").option("--target <type>", "Target type (review|comment|user)").option("--target-id <id>", "Target ID").option("--reason <reason>", "Reason").action(async (opts) => {
    requireAuth();
    const targetType = opts.target || await input5({ message: "Target type (review|comment|user):" });
    const targetId = opts.targetId || await input5({ message: "Target ID:" });
    const reason = opts.reason || await input5({ message: "Reason:" });
    const spinner = ora5("Submitting report...").start();
    try {
      const client = getClient();
      await client.createReport({ targetType, targetId, reason });
      spinner.succeed("Report submitted!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
}

// src/commands/settings.ts
import { input as input6, confirm as confirm5 } from "@inquirer/prompts";
import ora6 from "ora";
function registerSettingsCommands(program2) {
  const settings = program2.command("settings").description("Platform settings & configuration");
  const general = settings.command("general").description("General settings");
  general.command("get").description("View general settings").action(async () => {
    requireAuth();
    const spinner = ora6("Loading...").start();
    try {
      const client = getClient();
      const data = await client.getGeneralSettings();
      spinner.stop();
      printKeyValueTable(data);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  general.command("update").description("Update general settings").option("--site-name <name>", "Site name").option("--site-url <url>", "Site URL").option("--description <desc>", "Site description").option("--language <lang>", "Default language").option("--timezone <tz>", "Timezone").action(async (opts) => {
    requireAuth();
    const updates = {};
    if (opts.siteName) updates.siteName = opts.siteName;
    if (opts.siteUrl) updates.siteUrl = opts.siteUrl;
    if (opts.description) updates.description = opts.description;
    if (opts.language) updates.language = opts.language;
    if (opts.timezone) updates.timezone = opts.timezone;
    if (Object.keys(updates).length === 0) {
      error("No fields to update.");
      process.exit(1);
    }
    const spinner = ora6("Updating...").start();
    try {
      const client = getClient();
      await client.updateGeneralSettings(updates);
      spinner.succeed("General settings updated!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  const security = settings.command("security").description("Security settings");
  security.command("get").description("View security settings").action(async () => {
    requireAuth();
    const spinner = ora6("Loading...").start();
    try {
      const client = getClient();
      const data = await client.getSecuritySettings();
      spinner.stop();
      printKeyValueTable(data);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  security.command("update").description("Update security settings").option("--enable-2fa <bool>", "Enable 2FA (true|false)").option("--session-timeout <minutes>", "Session timeout in minutes").option("--max-login-attempts <n>", "Max login attempts before lockout").action(async (opts) => {
    requireAuth();
    const updates = {};
    if (opts.enable2fa) updates.enable2fa = opts.enable2fa === "true";
    if (opts.sessionTimeout) updates.sessionTimeout = parseInt(opts.sessionTimeout);
    if (opts.maxLoginAttempts) updates.maxLoginAttempts = parseInt(opts.maxLoginAttempts);
    if (Object.keys(updates).length === 0) {
      error("No fields to update.");
      process.exit(1);
    }
    const spinner = ora6("Updating...").start();
    try {
      const client = getClient();
      await client.updateSecuritySettings(updates);
      spinner.succeed("Security settings updated!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  const branding = settings.command("branding").description("Branding settings");
  branding.command("get").description("View branding settings").action(async () => {
    requireAuth();
    const spinner = ora6("Loading...").start();
    try {
      const client = getClient();
      const data = await client.getBrandingSettings();
      spinner.stop();
      printKeyValueTable(data);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  branding.command("update").description("Update branding settings").option("--brand-color <color>", "Primary brand color").option("--accent-color <color>", "Accent color").option("--font <font>", "Primary font").action(async (opts) => {
    requireAuth();
    const updates = {};
    if (opts.brandColor) updates.brandColor = opts.brandColor;
    if (opts.accentColor) updates.accentColor = opts.accentColor;
    if (opts.font) updates.font = opts.font;
    if (Object.keys(updates).length === 0) {
      error("No fields to update.");
      process.exit(1);
    }
    const spinner = ora6("Updating...").start();
    try {
      const client = getClient();
      await client.updateBrandingSettings(updates);
      spinner.succeed("Branding updated!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  const email = settings.command("email").description("Email settings");
  email.command("get").description("View email settings").action(async () => {
    requireAuth();
    const spinner = ora6("Loading...").start();
    try {
      const client = getClient();
      const data = await client.getEmailSettings();
      spinner.stop();
      printKeyValueTable(data);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  email.command("update").description("Update email settings").option("--smtp-host <host>", "SMTP host").option("--smtp-port <port>", "SMTP port").option("--smtp-user <user>", "SMTP username").option("--smtp-pass <pass>", "SMTP password").option("--from-email <email>", "Sender email").option("--from-name <name>", "Sender name").action(async (opts) => {
    requireAuth();
    const updates = {};
    if (opts.smtpHost) updates.smtpHost = opts.smtpHost;
    if (opts.smtpPort) updates.smtpPort = parseInt(opts.smtpPort);
    if (opts.smtpUser) updates.smtpUser = opts.smtpUser;
    if (opts.smtpPass) updates.smtpPass = opts.smtpPass;
    if (opts.fromEmail) updates.fromEmail = opts.fromEmail;
    if (opts.fromName) updates.fromName = opts.fromName;
    if (Object.keys(updates).length === 0) {
      error("No fields to update.");
      process.exit(1);
    }
    const spinner = ora6("Updating...").start();
    try {
      const client = getClient();
      await client.updateEmailSettings(updates);
      spinner.succeed("Email settings updated!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  const storage = settings.command("storage").description("Storage settings");
  storage.command("get").description("View storage settings").action(async () => {
    requireAuth();
    const spinner = ora6("Loading...").start();
    try {
      const client = getClient();
      const data = await client.getStorageSettings();
      spinner.stop();
      printKeyValueTable(data);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  storage.command("update").description("Update storage settings").option("--provider <provider>", "Storage provider (s3|gcs|azure|local)").option("--bucket <bucket>", "Bucket name").option("--region <region>", "Region").action(async (opts) => {
    requireAuth();
    const updates = {};
    if (opts.provider) updates.provider = opts.provider;
    if (opts.bucket) updates.bucket = opts.bucket;
    if (opts.region) updates.region = opts.region;
    if (Object.keys(updates).length === 0) {
      error("No fields to update.");
      process.exit(1);
    }
    const spinner = ora6("Updating...").start();
    try {
      const client = getClient();
      await client.updateStorageSettings(updates);
      spinner.succeed("Storage settings updated!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  const cdn = settings.command("cdn").description("CDN settings");
  cdn.command("get").description("View CDN settings").action(async () => {
    requireAuth();
    const spinner = ora6("Loading...").start();
    try {
      const client = getClient();
      const data = await client.getCDNSettings();
      spinner.stop();
      printKeyValueTable(data);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  cdn.command("update").description("Update CDN settings").option("--url <url>", "CDN URL").option("--enabled <bool>", "Enable CDN (true|false)").action(async (opts) => {
    requireAuth();
    const updates = {};
    if (opts.url) updates.url = opts.url;
    if (opts.enabled) updates.enabled = opts.enabled === "true";
    if (Object.keys(updates).length === 0) {
      error("No fields to update.");
      process.exit(1);
    }
    const spinner = ora6("Updating...").start();
    try {
      const client = getClient();
      await client.updateCDNSettings(updates);
      spinner.succeed("CDN settings updated!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  cdn.command("purge").description("Purge CDN cache").option("-y, --yes", "Skip confirmation").action(async (opts) => {
    requireAuth();
    if (!opts.yes) {
      const answer = await confirm5({ message: "Purge entire CDN cache?", default: false });
      if (!answer) {
        console.log("Cancelled.");
        return;
      }
    }
    const spinner = ora6("Purging CDN cache...").start();
    try {
      const client = getClient();
      await client.updateCDNSettings({ purge: true });
      spinner.succeed("CDN cache purged!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  const domains = settings.command("domains").description("Domain management");
  domains.command("list").description("List all domains").action(async () => {
    requireAuth();
    const spinner = ora6("Loading...").start();
    try {
      const client = getClient();
      const data = await client.listDomains();
      spinner.stop();
      output(data, "Domains");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  domains.command("add").description("Add a domain").option("-d, --domain <domain>", "Domain name").action(async (opts) => {
    requireAuth();
    const domain = opts.domain || await input6({ message: "Domain name:" });
    const spinner = ora6("Adding domain...").start();
    try {
      const client = getClient();
      await client.createDomain({ domain });
      spinner.succeed(`Domain "${domain}" added!`);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  domains.command("delete <id>").description("Remove a domain").option("-y, --yes", "Skip confirmation").action(async (id, opts) => {
    requireAuth();
    if (!opts.yes) {
      const answer = await confirm5({ message: "Remove this domain?", default: false });
      if (!answer) {
        console.log("Cancelled.");
        return;
      }
    }
    const spinner = ora6("Removing...").start();
    try {
      const client = getClient();
      await client.deleteDomain(id);
      spinner.succeed("Domain removed!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  const apis = settings.command("api-keys").description("API key management");
  apis.command("list").description("List all API keys").action(async () => {
    requireAuth();
    const spinner = ora6("Loading...").start();
    try {
      const client = getClient();
      const data = await client.listApiKeys();
      spinner.stop();
      output(data, "API Keys");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  apis.command("create").description("Create a new API key").option("-n, --name <name>", "Key name").option("--scopes <scopes>", "Comma-separated scopes").action(async (opts) => {
    requireAuth();
    const name = opts.name || await input6({ message: "Key name:" });
    const scopes = opts.scopes || await input6({ message: "Scopes (comma-separated):", default: "*" });
    const spinner = ora6("Creating key...").start();
    try {
      const client = getClient();
      const result = await client.createApiKey({ name, scopes: scopes.split(",").map((s) => s.trim()) });
      spinner.succeed("API key created!");
      printKeyValueTable(result);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  apis.command("delete <id>").description("Revoke an API key").option("-y, --yes", "Skip confirmation").action(async (id, opts) => {
    requireAuth();
    if (!opts.yes) {
      const answer = await confirm5({ message: "Revoke this API key?", default: false });
      if (!answer) {
        console.log("Cancelled.");
        return;
      }
    }
    const spinner = ora6("Revoking...").start();
    try {
      const client = getClient();
      await client.deleteApiKey(id);
      spinner.succeed("API key revoked!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  const oauth = settings.command("oauth").description("OAuth provider settings");
  oauth.command("update <provider>").description("Update OAuth provider config").option("--client-id <id>", "Client ID").option("--client-secret <secret>", "Client secret").option("--enabled <bool>", "Enable provider (true|false)").action(async (provider, opts) => {
    requireAuth();
    const updates = {};
    if (opts.clientId) updates.clientId = opts.clientId;
    if (opts.clientSecret) updates.clientSecret = opts.clientSecret;
    if (opts.enabled) updates.enabled = opts.enabled === "true";
    if (Object.keys(updates).length === 0) {
      error("No fields to update.");
      process.exit(1);
    }
    const spinner = ora6("Updating...").start();
    try {
      const client = getClient();
      await client.updateOAuth(provider, updates);
      spinner.succeed(`OAuth "${provider}" updated!`);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  const maintenance = settings.command("maintenance").description("Maintenance & system operations");
  maintenance.command("status").description("View maintenance status").action(async () => {
    requireAuth();
    const spinner = ora6("Loading...").start();
    try {
      const client = getClient();
      const data = await client.getMaintenance();
      spinner.stop();
      printKeyValueTable(data);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  maintenance.command("clear-cache").description("Clear application cache").option("-y, --yes", "Skip confirmation").action(async (opts) => {
    requireAuth();
    if (!opts.yes) {
      const answer = await confirm5({ message: "Clear all cache?", default: false });
      if (!answer) {
        console.log("Cancelled.");
        return;
      }
    }
    const spinner = ora6("Clearing cache...").start();
    try {
      const client = getClient();
      await client.clearCache();
      spinner.succeed("Cache cleared!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  maintenance.command("optimize-db").description("Optimize the database").option("-y, --yes", "Skip confirmation").action(async (opts) => {
    requireAuth();
    if (!opts.yes) {
      const answer = await confirm5({ message: "Optimize database?", default: false });
      if (!answer) {
        console.log("Cancelled.");
        return;
      }
    }
    const spinner = ora6("Optimizing database...").start();
    try {
      const client = getClient();
      await client.optimizeDB();
      spinner.succeed("Database optimized!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
}

// src/commands/admin.ts
import { input as input7, confirm as confirm6 } from "@inquirer/prompts";
import ora7 from "ora";
function registerAdminCommands(program2) {
  const admin = program2.command("admin").description("Administrative operations");
  const users = admin.command("users").description("Manage users");
  users.command("list").description("List all users").option("-p, --page <n>", "Page number", "1").option("-l, --limit <n>", "Items per page", "20").option("--search <query>", "Search filter").action(async (opts) => {
    requireAuth();
    const spinner = ora7("Fetching users...").start();
    try {
      const client = getClient();
      const data = await client.adminListUsers({ page: opts.page, limit: opts.limit, search: opts.search });
      spinner.stop();
      output(data, "Users");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  users.command("get <id>").description("Get user details").action(async (id) => {
    requireAuth();
    const spinner = ora7("Fetching...").start();
    try {
      const client = getClient();
      const data = await client.adminGetUser(id);
      spinner.stop();
      printKeyValueTable(data);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  users.command("update <id>").description("Update a user").option("--email <email>", "New email").option("--name <name>", "New display name").option("--status <status>", "New status").action(async (id, opts) => {
    requireAuth();
    const updates = {};
    if (opts.email) updates.email = opts.email;
    if (opts.name) updates.displayName = opts.name;
    if (opts.status) updates.status = opts.status;
    if (Object.keys(updates).length === 0) {
      error("No fields to update.");
      process.exit(1);
    }
    const spinner = ora7("Updating...").start();
    try {
      const client = getClient();
      await client.adminUpdateUser(id, updates);
      spinner.succeed("User updated!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  users.command("disable <id>").description("Disable a user").option("-y, --yes", "Skip confirmation").action(async (id, opts) => {
    requireAuth();
    if (!opts.yes) {
      const answer = await confirm6({ message: `Disable user ${id}?`, default: false });
      if (!answer) {
        console.log("Cancelled.");
        return;
      }
    }
    const spinner = ora7("Disabling...").start();
    try {
      const client = getClient();
      await client.adminDisableUser(id);
      spinner.succeed("User disabled!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  users.command("enable <id>").description("Enable a user").action(async (id) => {
    requireAuth();
    const spinner = ora7("Enabling...").start();
    try {
      const client = getClient();
      await client.adminEnableUser(id);
      spinner.succeed("User enabled!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  users.command("delete <id>").description("Delete a user").option("-y, --yes", "Skip confirmation").action(async (id, opts) => {
    requireAuth();
    if (!opts.yes) {
      const answer = await confirm6({ message: `Permanently delete user ${id}?`, default: false });
      if (!answer) {
        console.log("Cancelled.");
        return;
      }
    }
    const spinner = ora7("Deleting...").start();
    try {
      const client = getClient();
      await client.adminDeleteUser(id);
      spinner.succeed("User deleted!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  const roles = admin.command("roles").description("Manage roles");
  roles.command("list").description("List all roles").action(async () => {
    requireAuth();
    const spinner = ora7("Fetching roles...").start();
    try {
      const client = getClient();
      const data = await client.adminListRoles();
      spinner.stop();
      output(data, "Roles");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  roles.command("create").description("Create a role").option("-n, --name <name>", "Role name").option("-d, --description <desc>", "Description").action(async (opts) => {
    requireAuth();
    const name = opts.name || await input7({ message: "Role name:" });
    const description = opts.description || await input7({ message: "Description:", default: "" });
    const spinner = ora7("Creating...").start();
    try {
      const client = getClient();
      await client.adminCreateRole({ name, description });
      spinner.succeed(`Role "${name}" created!`);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  roles.command("update <id>").description("Update a role").option("-n, --name <name>", "New name").option("-d, --description <desc>", "New description").action(async (id, opts) => {
    requireAuth();
    const updates = {};
    if (opts.name) updates.name = opts.name;
    if (opts.description) updates.description = opts.description;
    if (Object.keys(updates).length === 0) {
      error("No fields to update.");
      process.exit(1);
    }
    const spinner = ora7("Updating...").start();
    try {
      const client = getClient();
      await client.adminUpdateRole(id, updates);
      spinner.succeed("Role updated!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  roles.command("delete <id>").description("Delete a role").option("-y, --yes", "Skip confirmation").action(async (id, opts) => {
    requireAuth();
    if (!opts.yes) {
      const answer = await confirm6({ message: `Delete role ${id}?`, default: false });
      if (!answer) {
        console.log("Cancelled.");
        return;
      }
    }
    const spinner = ora7("Deleting...").start();
    try {
      const client = getClient();
      await client.adminDeleteRole(id);
      spinner.succeed("Role deleted!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  roles.command("assign <roleId>").description("Assign role to user").option("--user <userId>", "User ID").action(async (roleId, opts) => {
    requireAuth();
    const userId = opts.user || await input7({ message: "User ID:" });
    const spinner = ora7("Assigning role...").start();
    try {
      const client = getClient();
      await client.adminAssignRole(roleId, { userId });
      spinner.succeed("Role assigned!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  const perms = admin.command("permissions").description("Manage permissions");
  perms.command("matrix").description("Show permission matrix").action(async () => {
    requireAuth();
    const spinner = ora7("Loading...").start();
    try {
      const client = getClient();
      const data = await client.adminGetPermissionMatrix();
      spinner.stop();
      output(data, "Permission Matrix");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  const moderation = admin.command("moderation").description("Content moderation");
  moderation.command("queue").description("View moderation queue").action(async () => {
    requireAuth();
    const spinner = ora7("Loading...").start();
    try {
      const client = getClient();
      const data = await client.adminListModerations();
      spinner.stop();
      output(data, "Moderation Queue");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  moderation.command("approve <id>").description("Approve a moderation item").action(async (id) => {
    requireAuth();
    const spinner = ora7("Approving...").start();
    try {
      const client = getClient();
      await client.adminModerateItem(id, "approve");
      spinner.succeed("Item approved!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  moderation.command("reject <id>").description("Reject a moderation item").action(async (id) => {
    requireAuth();
    const spinner = ora7("Rejecting...").start();
    try {
      const client = getClient();
      await client.adminModerateItem(id, "reject");
      spinner.succeed("Item rejected!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  moderation.command("escalate <id>").description("Escalate a moderation item").action(async (id) => {
    requireAuth();
    const spinner = ora7("Escalating...").start();
    try {
      const client = getClient();
      await client.adminModerateItem(id, "escalate");
      spinner.succeed("Item escalated!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
}

// src/commands/system.ts
import { input as input8, confirm as confirm7 } from "@inquirer/prompts";
import ora8 from "ora";
function registerSystemCommands(program2) {
  const system = program2.command("system").description("System monitoring & operations");
  const health = system.command("health").description("Health checks");
  health.command("status").description("Check system health").action(async () => {
    requireAuth();
    const spinner = ora8("Checking health...").start();
    try {
      const client = getClient();
      const data = await client.getSystemHealth();
      spinner.stop();
      heading("System Health");
      printKeyValueTable(data);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  health.command("uptime").description("Check system uptime").action(async () => {
    requireAuth();
    const spinner = ora8("Loading...").start();
    try {
      const client = getClient();
      const data = await client.getSystemUptime();
      spinner.stop();
      printKeyValueTable(data);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  const logs = system.command("logs").description("System logs");
  logs.command("list").description("List recent logs").option("-l, --limit <n>", "Number of entries", "50").option("--level <level>", "Filter by level (info|warn|error)").action(async (opts) => {
    requireAuth();
    const spinner = ora8("Fetching logs...").start();
    try {
      const client = getClient();
      const data = await client.listSystemLogs({ limit: opts.limit, level: opts.level });
      spinner.stop();
      output(data, "System Logs");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  logs.command("search").description("Search logs").argument("[query]", "Search query").action(async (query) => {
    requireAuth();
    const q = query || await input8({ message: "Search query:" });
    const spinner = ora8("Searching...").start();
    try {
      const client = getClient();
      const data = await client.searchSystemLogs(q);
      spinner.stop();
      output(data, `Log search: "${q}"`);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  const queue = system.command("queue").description("Background job queue");
  queue.command("status").description("View queue status").action(async () => {
    requireAuth();
    const spinner = ora8("Loading...").start();
    try {
      const client = getClient();
      const data = await client.getQueueStatus();
      spinner.stop();
      printKeyValueTable(data);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  queue.command("jobs").description("List queued jobs").action(async () => {
    requireAuth();
    const spinner = ora8("Loading...").start();
    try {
      const client = getClient();
      const data = await client.listQueueJobs();
      spinner.stop();
      output(data, "Queue Jobs");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  queue.command("retry <id>").description("Retry a failed job").action(async (id) => {
    requireAuth();
    const spinner = ora8("Retrying...").start();
    try {
      const client = getClient();
      await client.retryQueueJob(id);
      spinner.succeed("Job retry queued!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  queue.command("cancel <id>").description("Cancel a queued job").option("-y, --yes", "Skip confirmation").action(async (id, opts) => {
    requireAuth();
    if (!opts.yes) {
      const answer = await confirm7({ message: "Cancel this job?", default: false });
      if (!answer) {
        console.log("Cancelled.");
        return;
      }
    }
    const spinner = ora8("Cancelling...").start();
    try {
      const client = getClient();
      await client.cancelQueueJob(id);
      spinner.succeed("Job cancelled!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  queue.command("flush").description("Flush the entire queue").option("-y, --yes", "Skip confirmation").action(async (opts) => {
    requireAuth();
    if (!opts.yes) {
      const answer = await confirm7({ message: "Flush entire queue?", default: false });
      if (!answer) {
        console.log("Cancelled.");
        return;
      }
    }
    const spinner = ora8("Flushing queue...").start();
    try {
      const client = getClient();
      await client.flushQueue();
      spinner.succeed("Queue flushed!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  const cache = system.command("cache").description("Cache management");
  cache.command("status").description("View cache status").action(async () => {
    requireAuth();
    const spinner = ora8("Loading...").start();
    try {
      const client = getClient();
      const data = await client.getCacheStatus();
      spinner.stop();
      printKeyValueTable(data);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  cache.command("flush").description("Flush entire cache").option("-y, --yes", "Skip confirmation").action(async (opts) => {
    requireAuth();
    if (!opts.yes) {
      const answer = await confirm7({ message: "Flush entire cache?", default: false });
      if (!answer) {
        console.log("Cancelled.");
        return;
      }
    }
    const spinner = ora8("Flushing cache...").start();
    try {
      const client = getClient();
      await client.flushCacheSystem();
      spinner.succeed("Cache flushed!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  cache.command("keys").description("List cache keys").action(async () => {
    requireAuth();
    const spinner = ora8("Loading...").start();
    try {
      const client = getClient();
      const data = await client.listCacheKeys();
      spinner.stop();
      output(data, "Cache Keys");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  cache.command("delete <key>").description("Delete a cache key").action(async (key) => {
    requireAuth();
    const spinner = ora8("Deleting...").start();
    try {
      const client = getClient();
      await client.deleteCacheKey(key);
      spinner.succeed("Cache key deleted!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  const search = system.command("search").description("Search engine management");
  search.command("status").description("View search engine status").action(async () => {
    requireAuth();
    const spinner = ora8("Loading...").start();
    try {
      const client = getClient();
      const data = await client.getSearchStatus();
      spinner.stop();
      printKeyValueTable(data);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  search.command("reindex").description("Trigger full reindex").option("-y, --yes", "Skip confirmation").action(async (opts) => {
    requireAuth();
    if (!opts.yes) {
      const answer = await confirm7({ message: "Trigger full reindex?", default: false });
      if (!answer) {
        console.log("Cancelled.");
        return;
      }
    }
    const spinner = ora8("Triggering reindex...").start();
    try {
      const client = getClient();
      await client.triggerReindex();
      spinner.succeed("Reindex triggered!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  const bgJobs = system.command("jobs").description("Background job management");
  bgJobs.command("list").description("List background jobs").action(async () => {
    requireAuth();
    const spinner = ora8("Loading...").start();
    try {
      const client = getClient();
      const data = await client.listBackgroundJobs();
      spinner.stop();
      output(data, "Background Jobs");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  bgJobs.command("run <id>").description("Manually run a background job").action(async (id) => {
    requireAuth();
    const spinner = ora8("Running job...").start();
    try {
      const client = getClient();
      await client.runBackgroundJob(id);
      spinner.succeed("Job started!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
}

// src/commands/analytics.ts
import ora9 from "ora";
function registerAnalyticsCommands(program2) {
  const analytics = program2.command("analytics").description("Analytics & insights");
  analytics.command("overview").description("View analytics overview").option("--period <period>", "Time period (7d|30d|90d|1y)", "30d").action(async (opts) => {
    requireAuth();
    const spinner = ora9("Loading analytics...").start();
    try {
      const client = getClient();
      const data = await client.getAnalyticsOverview({ period: opts.period });
      spinner.stop();
      heading("Analytics Overview");
      printKeyValueTable(data);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  analytics.command("watch-time").description("View watch time statistics").option("--period <period>", "Time period (7d|30d|90d|1y)", "30d").action(async (opts) => {
    requireAuth();
    const spinner = ora9("Loading watch time...").start();
    try {
      const client = getClient();
      const data = await client.getWatchTime({ period: opts.period });
      spinner.stop();
      heading("Watch Time Statistics");
      printKeyValueTable(data);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  analytics.command("devices").description("View device statistics").action(async () => {
    requireAuth();
    const spinner = ora9("Loading...").start();
    try {
      const client = getClient();
      const data = await client.getDevices();
      spinner.stop();
      heading("Device Statistics");
      printKeyValueTable(data);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  analytics.command("popular").description("View popular content").action(async () => {
    requireAuth();
    const spinner = ora9("Loading...").start();
    try {
      const client = getClient();
      const data = await client.getPopular();
      spinner.stop();
      output(data, "Popular Content");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  analytics.command("geography").description("View geographic distribution").action(async () => {
    requireAuth();
    const spinner = ora9("Loading...").start();
    try {
      const client = getClient();
      const data = await client.getGeography();
      spinner.stop();
      heading("Geographic Distribution");
      printKeyValueTable(data);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  analytics.command("active-users").description("View active user statistics").action(async () => {
    requireAuth();
    const spinner = ora9("Loading...").start();
    try {
      const client = getClient();
      const data = await client.getActiveUsers();
      spinner.stop();
      heading("Active Users");
      printKeyValueTable(data);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
}

// src/commands/discover.ts
import ora10 from "ora";
function registerDiscoverCommands(program2) {
  const discover = program2.command("discover").description("Content discovery & recommendations");
  discover.command("home").description("View discover home feed").action(async () => {
    requireAuth();
    const spinner = ora10("Loading...").start();
    try {
      const client = getClient();
      const data = await client.getDiscover();
      spinner.stop();
      output(data, "Discover Feed");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  discover.command("sections").description("View discover sections").action(async () => {
    requireAuth();
    const spinner = ora10("Loading...").start();
    try {
      const client = getClient();
      const data = await client.getDiscoverSections();
      spinner.stop();
      output(data, "Discover Sections");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  discover.command("content <anilistId>").description("View content details from AniList").action(async (anilistId) => {
    requireAuth();
    const spinner = ora10("Loading...").start();
    try {
      const client = getClient();
      const data = await client.getContentDetail(anilistId);
      spinner.stop();
      printKeyValueTable(data);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  discover.command("recommendations").description("View personalized recommendations").action(async () => {
    requireAuth();
    const spinner = ora10("Loading...").start();
    try {
      const client = getClient();
      const data = await client.getRecommendations();
      spinner.stop();
      output(data, "Recommendations");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
}

// src/commands/integrations.ts
import { input as input9 } from "@inquirer/prompts";
import ora11 from "ora";
function registerIntegrationCommands(program2) {
  const integrations = program2.command("integrations").description("External integrations (AniList, Plex)");
  const anilist = integrations.command("anilist").description("AniList integration");
  anilist.command("search").description("Search AniList").argument("[query]", "Search query").action(async (query) => {
    requireAuth();
    const q = query || await input9({ message: "Search query:" });
    const spinner = ora11("Searching AniList...").start();
    try {
      const client = getClient();
      const data = await client.anilistSearch(q);
      spinner.stop();
      output(data, `AniList: "${q}"`);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  anilist.command("trending").description("View trending anime on AniList").action(async () => {
    requireAuth();
    const spinner = ora11("Loading trending...").start();
    try {
      const client = getClient();
      const data = await client.anilistTrending();
      spinner.stop();
      output(data, "AniList Trending");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  anilist.command("popular").description("View popular anime on AniList").action(async () => {
    requireAuth();
    const spinner = ora11("Loading popular...").start();
    try {
      const client = getClient();
      const data = await client.anilistPopular();
      spinner.stop();
      output(data, "AniList Popular");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  anilist.command("import <anilistId>").description("Import media from AniList").action(async (anilistId) => {
    requireAuth();
    const spinner = ora11("Importing from AniList...").start();
    try {
      const client = getClient();
      await client.anilistImport(anilistId);
      spinner.succeed("Imported from AniList!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  const plex = integrations.command("plex").description("Plex integration");
  plex.command("health").description("Check Plex server health").action(async () => {
    requireAuth();
    const spinner = ora11("Checking Plex...").start();
    try {
      const client = getClient();
      const data = await client.plexHealth();
      spinner.stop();
      heading("Plex Health");
      printKeyValueTable(data);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  plex.command("libraries").description("List Plex libraries").action(async () => {
    requireAuth();
    const spinner = ora11("Loading...").start();
    try {
      const client = getClient();
      const data = await client.plexLibraries();
      spinner.stop();
      output(data, "Plex Libraries");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  plex.command("search").description("Search Plex").argument("[query]", "Search query").action(async (query) => {
    requireAuth();
    const q = query || await input9({ message: "Search query:" });
    const spinner = ora11("Searching Plex...").start();
    try {
      const client = getClient();
      const data = await client.plexSearch(q);
      spinner.stop();
      output(data, `Plex: "${q}"`);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  plex.command("import <ratingKey>").description("Import item from Plex").action(async (ratingKey) => {
    requireAuth();
    const spinner = ora11("Importing from Plex...").start();
    try {
      const client = getClient();
      await client.plexImport(ratingKey);
      spinner.succeed("Imported from Plex!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
}

// src/commands/support.ts
import { input as input10, confirm as confirm9 } from "@inquirer/prompts";
import ora12 from "ora";
function registerSupportCommands(program2) {
  const support = program2.command("support").description("Support tickets & FAQ");
  const tickets = support.command("tickets").description("Manage support tickets");
  tickets.command("list").description("List all tickets").action(async () => {
    requireAuth();
    const spinner = ora12("Loading...").start();
    try {
      const client = getClient();
      const data = await client.listTickets();
      spinner.stop();
      output(data, "Support Tickets");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  tickets.command("create").description("Create a support ticket").option("-s, --subject <subject>", "Subject").option("-b, --body <body>", "Message body").option("--priority <priority>", "Priority (low|medium|high|critical)").action(async (opts) => {
    requireAuth();
    const subject = opts.subject || await input10({ message: "Subject:" });
    const body = opts.body || await input10({ message: "Message:" });
    const priority = opts.priority || await input10({ message: "Priority (low|medium|high|critical):", default: "medium" });
    const spinner = ora12("Creating ticket...").start();
    try {
      const client = getClient();
      const ticket = await client.createTicket({ subject, body, priority });
      spinner.succeed("Ticket created!");
      printKeyValueTable(ticket);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  tickets.command("get <id>").description("View a ticket").action(async (id) => {
    requireAuth();
    const spinner = ora12("Loading...").start();
    try {
      const client = getClient();
      const data = await client.getTicket(id);
      spinner.stop();
      printKeyValueTable(data);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  tickets.command("reply <id>").description("Reply to a ticket").option("-b, --body <body>", "Reply body").action(async (id, opts) => {
    requireAuth();
    const body = opts.body || await input10({ message: "Reply:" });
    const spinner = ora12("Sending reply...").start();
    try {
      const client = getClient();
      await client.replyToTicket(id, { body });
      spinner.succeed("Reply sent!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  tickets.command("close <id>").description("Close a ticket").option("-y, --yes", "Skip confirmation").action(async (id, opts) => {
    requireAuth();
    if (!opts.yes) {
      const answer = await confirm9({ message: "Close this ticket?", default: false });
      if (!answer) {
        console.log("Cancelled.");
        return;
      }
    }
    const spinner = ora12("Closing...").start();
    try {
      const client = getClient();
      await client.closeTicket(id);
      spinner.succeed("Ticket closed!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  const faq = support.command("faq").description("FAQ management");
  faq.command("list").description("List all FAQ entries").action(async () => {
    requireAuth();
    const spinner = ora12("Loading...").start();
    try {
      const client = getClient();
      const data = await client.listFaq();
      spinner.stop();
      output(data, "FAQ");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  faq.command("create").description("Create a FAQ entry").option("-q, --question <q>", "Question").option("-a, --answer <a>", "Answer").action(async (opts) => {
    requireAuth();
    const question = opts.question || await input10({ message: "Question:" });
    const answer = opts.answer || await input10({ message: "Answer:" });
    const spinner = ora12("Creating...").start();
    try {
      const client = getClient();
      await client.createFaq({ question, answer });
      spinner.succeed("FAQ entry created!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  faq.command("delete <id>").description("Delete a FAQ entry").option("-y, --yes", "Skip confirmation").action(async (id, opts) => {
    requireAuth();
    if (!opts.yes) {
      const answer = await confirm9({ message: "Delete this FAQ entry?", default: false });
      if (!answer) {
        console.log("Cancelled.");
        return;
      }
    }
    const spinner = ora12("Deleting...").start();
    try {
      const client = getClient();
      await client.deleteFaq(id);
      spinner.succeed("FAQ entry deleted!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
}

// src/commands/workspace.ts
import { input as input11, confirm as confirm10, select as select2 } from "@inquirer/prompts";
import chalk3 from "chalk";
import ora13 from "ora";
function registerWorkspaceCommands(program2) {
  const workspace = program2.command("workspace").description("Workspace management");
  workspace.command("list").description("List all workspaces").action(async () => {
    requireAuth();
    const spinner = ora13("Loading workspaces...").start();
    try {
      const client = getClient();
      const data = await client.listWorkspaces();
      spinner.stop();
      output(data, "Workspaces");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  workspace.command("current").description("Show current workspace").action(() => {
    const wsId = getWorkspaceId();
    if (wsId) {
      heading("Current Workspace");
      console.log(`  ID: ${wsId}`);
    } else {
      info2("No workspace selected. Use `kami workspace switch` to select one.");
    }
  });
  workspace.command("switch").description("Switch to a workspace").argument("[id]", "Workspace ID").action(async (id) => {
    requireAuth();
    let wsId = id;
    if (!wsId) {
      const spinner = ora13("Loading workspaces...").start();
      try {
        const client = getClient();
        const workspaces = await client.listWorkspaces();
        spinner.stop();
        if (workspaces.length === 0) {
          error("No workspaces found.");
          return;
        }
        wsId = await select2({
          message: "Select workspace:",
          choices: workspaces.map((ws) => ({
            name: `${ws.name || ws.id} (${ws.id})`,
            value: ws.id
          }))
        });
      } catch (err) {
        spinner.fail(err.message);
        process.exit(1);
      }
    }
    setWorkspaceId(wsId);
    success(`Switched to workspace ${wsId}`);
  });
  workspace.command("create").description("Create a workspace").option("-n, --name <name>", "Workspace name").option("-s, --slug <slug>", "URL slug").option("-d, --description <desc>", "Description").action(async (opts) => {
    requireAuth();
    const name = opts.name || await input11({ message: "Workspace name:" });
    const slug = opts.slug || await input11({ message: "Slug:" });
    const description = opts.description || await input11({ message: "Description:", default: "" });
    const spinner = ora13("Creating workspace...").start();
    try {
      const client = getClient();
      const ws = await client.createWorkspace({ name, slug, description });
      spinner.succeed(`Workspace "${name}" created!`);
      printKeyValueTable(ws);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  workspace.command("delete <id>").description("Delete a workspace").option("-y, --yes", "Skip confirmation").action(async (id, opts) => {
    requireAuth();
    if (!opts.yes) {
      const answer = await confirm10({ message: `Permanently delete workspace ${id}?`, default: false });
      if (!answer) {
        console.log("Cancelled.");
        return;
      }
    }
    const spinner = ora13("Deleting workspace...").start();
    try {
      const client = getClient();
      await client.deleteWorkspace(id);
      spinner.succeed("Workspace deleted!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
}
function info2(message) {
  console.log(chalk3.blue("\u2139") + " " + message);
}

// src/commands/search.ts
import { input as input12 } from "@inquirer/prompts";
import ora14 from "ora";
function registerSearchCommands(program2) {
  const search = program2.command("search").description("Search the platform");
  search.command("all").description("Search across all content").argument("[query]", "Search query").action(async (query) => {
    requireAuth();
    const q = query || await input12({ message: "Search query:" });
    const spinner = ora14("Searching...").start();
    try {
      const client = getClient();
      const data = await client.search(q);
      spinner.stop();
      output(data, `Search: "${q}"`);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  search.command("anime").description("Search anime specifically").argument("[query]", "Search query").action(async (query) => {
    requireAuth();
    const q = query || await input12({ message: "Search anime:" });
    const spinner = ora14("Searching...").start();
    try {
      const client = getClient();
      const data = await client.searchAnime(q);
      spinner.stop();
      output(data, `Anime: "${q}"`);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
}

// src/commands/watch.ts
import ora15 from "ora";
function registerWatchCommands(program2) {
  const watch = program2.command("watch").description("Watch progress & history");
  watch.command("continue").description("Continue watching (shows in-progress episodes)").action(async () => {
    requireAuth();
    const spinner = ora15("Loading...").start();
    try {
      const client = getClient();
      const data = await client.continueWatching();
      spinner.stop();
      output(data, "Continue Watching");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  watch.command("history").description("View watch history").action(async () => {
    requireAuth();
    const spinner = ora15("Loading...").start();
    try {
      const client = getClient();
      const data = await client.listWatchHistory();
      spinner.stop();
      output(data, "Watch History");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  watch.command("progress <episodeId>").description("View progress for an episode").action(async (episodeId) => {
    requireAuth();
    const spinner = ora15("Loading...").start();
    try {
      const client = getClient();
      const data = await client.getWatchProgress(episodeId);
      spinner.stop();
      printKeyValueTable(data);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  watch.command("update-progress <episodeId>").description("Update watch progress for an episode").option("--position <seconds>", "Current position in seconds").option("--completed <bool>", "Mark as completed (true|false)").action(async (episodeId, opts) => {
    requireAuth();
    const updates = {};
    if (opts.position) updates.position = parseInt(opts.position);
    if (opts.completed) updates.completed = opts.completed === "true";
    if (Object.keys(updates).length === 0) {
      error("Specify --position or --completed.");
      process.exit(1);
    }
    const spinner = ora15("Updating progress...").start();
    try {
      const client = getClient();
      await client.updateWatchProgress(episodeId, updates);
      spinner.succeed("Progress updated!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
}

// src/commands/schedule.ts
import ora16 from "ora";
function registerScheduleCommands(program2) {
  const schedule = program2.command("schedule").description("Scheduling & releases");
  schedule.command("simulcasts").description("List simulcast schedule").action(async () => {
    requireAuth();
    const spinner = ora16("Loading...").start();
    try {
      const client = getClient();
      const data = await client.listSimulcasts();
      spinner.stop();
      output(data, "Simulcast Schedule");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  schedule.command("upcoming").description("List upcoming releases").action(async () => {
    requireAuth();
    const spinner = ora16("Loading...").start();
    try {
      const client = getClient();
      const data = await client.listUpcomingReleases();
      spinner.stop();
      output(data, "Upcoming Releases");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  schedule.command("releases").description("List all releases").action(async () => {
    requireAuth();
    const spinner = ora16("Loading...").start();
    try {
      const client = getClient();
      const data = await client.listReleases();
      spinner.stop();
      output(data, "Releases");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
}

// src/commands/notifications.ts
import ora17 from "ora";
function registerNotificationCommands(program2) {
  const notifications = program2.command("notifications").description("Notification management");
  notifications.command("list").description("List notifications").action(async () => {
    requireAuth();
    const spinner = ora17("Loading...").start();
    try {
      const client = getClient();
      const data = await client.listNotifications();
      spinner.stop();
      output(data, "Notifications");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  notifications.command("unread").description("Show unread notification count").action(async () => {
    requireAuth();
    const spinner = ora17("Loading...").start();
    try {
      const client = getClient();
      const data = await client.getUnreadCount();
      spinner.stop();
      heading("Unread Notifications");
      console.log(`  Count: ${data.count}`);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  notifications.command("read <id>").description("Mark a notification as read").action(async (id) => {
    requireAuth();
    const spinner = ora17("Marking as read...").start();
    try {
      const client = getClient();
      await client.markNotificationRead(id);
      spinner.succeed("Marked as read!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
  notifications.command("read-all").description("Mark all notifications as read").action(async () => {
    requireAuth();
    const spinner = ora17("Marking all as read...").start();
    try {
      const client = getClient();
      await client.markAllNotificationsRead();
      spinner.succeed("All notifications marked as read!");
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
  });
}

// src/commands/index.ts
function registerAllCommands(program2) {
  registerAuthCommands(program2);
  registerCatalogCommands(program2);
  registerMediaCommands(program2);
  registerSourceCommands(program2);
  registerCommunityCommands(program2);
  registerSettingsCommands(program2);
  registerAdminCommands(program2);
  registerSystemCommands(program2);
  registerAnalyticsCommands(program2);
  registerDiscoverCommands(program2);
  registerIntegrationCommands(program2);
  registerSupportCommands(program2);
  registerWorkspaceCommands(program2);
  registerSearchCommands(program2);
  registerWatchCommands(program2);
  registerScheduleCommands(program2);
  registerNotificationCommands(program2);
}

// src/cli.ts
var program = new Command();
program.name("kami").description(`${chalk4.bold.cyan("Kami Sama")} \u2014 Terminal dashboard for managing your media platform`).version("1.0.0");
registerAllCommands(program);
program.exitOverride();
try {
  program.parse(process.argv);
} catch (err) {
  if (err.code === "commander.helpDisplayed" || err.code === "commander.version") {
    process.exit(0);
  }
  if (err.code === "commander.missingArgument" || err.code === "commander.missingMandatoryOptionValue") {
    console.error(chalk4.red("Error:"), err.message);
    process.exit(1);
  }
  if (err.message) {
    console.error(chalk4.red("Error:"), err.message);
  }
  process.exit(1);
}
