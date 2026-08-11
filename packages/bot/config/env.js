import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const botRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(botRoot, "..");
const envFiles = [path.join(botRoot, ".env"), path.join(workspaceRoot, ".env")];

for (const envFile of envFiles) {
  if (fs.existsSync(envFile)) {
    dotenv.config({ path: envFile, override: false });
  }
}

const requiredVars = ["DISCORD_TOKEN", "DISCORD_CLIENT_ID"];
const missingRequiredVars = requiredVars.filter((key) => !process.env[key]);

function bool(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  return value !== "false" && value !== "0";
}

function splitList(value) {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

const environment = process.env.NODE_ENV ?? "development";
const isProduction = environment === "production";

// Kami-Sama API endpoints. Defaults: dev → api.kami-sama.localhost (http),
// prod → api.kami-sama.tv (https). Overridable via KAMI_API_URL.
const defaultApiUrl = isProduction
  ? "https://api.kami-sama.tv"
  : "http://api.kami-sama.localhost";

const defaultWebUrl = isProduction
  ? "https://kami-sama.tv"
  : "http://kami-sama.localhost";

export const env = {
  // ── Discord ────────────────────────────────────────────────────────────
  token: process.env.DISCORD_TOKEN ?? "",
  clientId: process.env.DISCORD_CLIENT_ID ?? "",
  welcomeDmEnabled: bool(process.env.DISCORD_WELCOME_DM_ENABLED, true),
  commandScope: process.env.DISCORD_COMMAND_SCOPE ?? "global",
  announceDeployments: bool(process.env.DISCORD_ANNOUNCE_DEPLOYMENTS, true),
  welcomeChannelId: process.env.DISCORD_WELCOME_CHANNEL_ID ?? "",
  levelChannelId: process.env.DISCORD_LEVEL_CHANNEL_ID ?? "",
  memberRoleId: process.env.DISCORD_MEMBER_ROLE_ID ?? "",
  supportCategoryId: process.env.DISCORD_SUPPORT_CATEGORY_ID ?? "",
  customStatus: process.env.DISCORD_STATUS ?? "",

  // ── Kami-Sama API ──────────────────────────────────────────────────────
  apiUrl: (process.env.KAMI_API_URL ?? defaultApiUrl).replace(/\/+$/, ""),
  webUrl: (process.env.KAMI_WEB_URL ?? defaultWebUrl).replace(/\/+$/, ""),
  apiToken: process.env.KAMI_API_TOKEN ?? "",
  apiTimeoutMs: Number(process.env.KAMI_API_TIMEOUT_MS ?? 10000),

  // ── Permissions / roles ────────────────────────────────────────────────
  botOwnerIds: splitList(process.env.BOT_OWNER_IDS),
  sgeStaffRoles: splitList(process.env.SGE_STAFF_ROLES),
  kamiAdminRoles: splitList(process.env.KAMI_ADMIN_ROLES),
  moderatorRoles: splitList(process.env.MODERATOR_ROLES),

  // ── Feature flags (progressive rollout) ────────────────────────────────
  featureFlags: {
    catalog: bool(process.env.ENABLE_CATALOG, true),
    manga: bool(process.env.ENABLE_MANGA, true),
    recommendations: bool(process.env.ENABLE_RECOMMENDATIONS, true),
    notifications: bool(process.env.ENABLE_NOTIFICATIONS, true),
    community: bool(process.env.ENABLE_COMMUNITY, true),
    moderation: bool(process.env.ENABLE_MODERATION, true),
    account: bool(process.env.ENABLE_ACCOUNT, true),
    accountLinking: bool(process.env.ENABLE_ACCOUNT_LINKING, true),
    sge: bool(process.env.ENABLE_SGE, true),
  },

  // ── Cache / rate limiting ──────────────────────────────────────────────
  cacheEnabled: bool(process.env.CACHE_ENABLED, true),
  cacheTtlSeconds: Number(process.env.CACHE_TTL_SECONDS ?? 300),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX ?? 10),
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 5000),

  // ── Runtime ────────────────────────────────────────────────────────────
  environment,
  isProduction,
  version: process.env.APP_VERSION ?? "1.0.0",
  commitSha: process.env.GIT_COMMIT_SHA ?? process.env.COMMIT_SHA ?? "unknown",
  buildDate: process.env.BUILD_DATE ?? "unknown",
  logLevel: process.env.LOG_LEVEL ?? (isProduction ? "info" : "debug"),

  // ── Redis (optional; cache backend for later) ──────────────────────────
  redis: {
    enabled: bool(process.env.REDIS_ENABLED, true),
    required: bool(process.env.REDIS_REQUIRED, false),
    host: process.env.REDIS_HOST ?? "redis",
    port: Number(process.env.REDIS_PORT ?? 6379),
    password: process.env.REDIS_PASSWORD ?? "",
    db: Number(process.env.REDIS_DB ?? 0),
    url: process.env.REDIS_URL ?? "",
    keyPrefix: process.env.REDIS_KEY_PREFIX ?? "kami-sama:bot",
  },

  missingRequiredVars,
  isConfigured: missingRequiredVars.length === 0,
};

export function assertDiscordEnv() {
  if (!env.isConfigured) {
    throw new Error(
      `Missing required environment variables: ${env.missingRequiredVars.join(", ")}`
    );
  }
}
