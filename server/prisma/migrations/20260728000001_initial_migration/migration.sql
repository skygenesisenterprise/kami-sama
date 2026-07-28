-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'suspended', 'disabled', 'deleted');

-- CreateEnum
CREATE TYPE "PresenceStatus" AS ENUM ('offline', 'online', 'idle', 'dnd', 'invisible');

-- CreateEnum
CREATE TYPE "LoginStatus" AS ENUM ('success', 'failed', 'blocked', 'requires_mfa');

-- CreateEnum
CREATE TYPE "AnimeStatus" AS ENUM ('upcoming', 'airing', 'completed', 'hiatus', 'cancelled');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('series', 'movie', 'ova', 'special');

-- CreateEnum
CREATE TYPE "ScheduleEntryType" AS ENUM ('simulcast', 'premiere', 'release', 'event');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('scheduled', 'airing', 'completed', 'cancelled', 'delayed');

-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('like', 'love', 'insightful', 'funny');

-- DropForeignKey
ALTER TABLE "anime_characters" DROP CONSTRAINT "fk_anime_characters_anime";

-- DropForeignKey
ALTER TABLE "anime_characters" DROP CONSTRAINT "fk_anime_characters_character";

-- DropForeignKey
ALTER TABLE "anime_genres" DROP CONSTRAINT "fk_anime_genres_anime";

-- DropForeignKey
ALTER TABLE "anime_genres" DROP CONSTRAINT "fk_anime_genres_genre";

-- DropForeignKey
ALTER TABLE "anime_studios" DROP CONSTRAINT "fk_anime_studios_anime";

-- DropForeignKey
ALTER TABLE "anime_studios" DROP CONSTRAINT "fk_anime_studios_studio";

-- DropForeignKey
ALTER TABLE "auth_accounts" DROP CONSTRAINT "fk_auth_accounts_user";

-- DropIndex
DROP INDEX "idx_anime_deleted_at";

-- DropIndex
DROP INDEX "idx_auth_accounts_user_id";

-- DropIndex
DROP INDEX "idx_auth_audit_events_workspace_id";

-- DropIndex
DROP INDEX "idx_auth_refresh_tokens_family_id";

-- DropIndex
DROP INDEX "idx_auth_refresh_tokens_revoked_at";

-- DropIndex
DROP INDEX "idx_auth_refresh_tokens_session_id";

-- DropIndex
DROP INDEX "idx_auth_refresh_tokens_used_at";

-- DropIndex
DROP INDEX "idx_auth_sessions_expires_at";

-- DropIndex
DROP INDEX "idx_auth_sessions_refresh_token_family_id";

-- DropIndex
DROP INDEX "idx_auth_sessions_refresh_token_hash";

-- DropIndex
DROP INDEX "idx_auth_sessions_revoked_at";

-- DropIndex
DROP INDEX "idx_auth_sessions_user_id";

-- DropIndex
DROP INDEX "idx_auth_sessions_workspace_id";

-- DropIndex
DROP INDEX "idx_categories_deleted_at";

-- DropIndex
DROP INDEX "idx_characters_deleted_at";

-- DropIndex
DROP INDEX "idx_comments_deleted_at";

-- DropIndex
DROP INDEX "idx_comments_episode_id";

-- DropIndex
DROP INDEX "idx_contact_groups_workspace_id";

-- DropIndex
DROP INDEX "idx_contacts_user_id";

-- DropIndex
DROP INDEX "devices_session_id_idx";

-- DropIndex
DROP INDEX "idx_email_verification_tokens_expires_at";

-- DropIndex
DROP INDEX "idx_episodes_deleted_at";

-- DropIndex
DROP INDEX "idx_genres_deleted_at";

-- DropIndex
DROP INDEX "idx_mfa_recovery_codes_user_id";

-- DropIndex
DROP INDEX "idx_notifications_user_id";

-- DropIndex
DROP INDEX "idx_password_reset_tokens_expires_at";

-- DropIndex
DROP INDEX "idx_profiles_deleted_at";

-- DropIndex
DROP INDEX "idx_profiles_user_default";

-- DropIndex
DROP INDEX "idx_reviews_deleted_at";

-- DropIndex
DROP INDEX "idx_reviews_user_id";

-- DropIndex
DROP INDEX "idx_studios_deleted_at";

-- DropIndex
DROP INDEX "idx_tickets_deleted_at";

-- DropIndex
DROP INDEX "idx_users_deleted_at";

-- DropIndex
DROP INDEX "idx_users_last_seen_at";

-- DropIndex
DROP INDEX "users_status_last_seen_at_idx";

-- DropIndex
DROP INDEX "idx_watchlist_items_watchlist_id";

-- DropIndex
DROP INDEX "idx_workspace_members_workspace_id";

-- DropIndex
DROP INDEX "idx_workspaces_deleted_at";

-- AlterTable
ALTER TABLE "anime" ADD COLUMN "contentType" "ContentType" NOT NULL DEFAULT 'series',
DROP COLUMN "status",
ADD COLUMN "status" "AnimeStatus" NOT NULL DEFAULT 'upcoming',
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "api_keys" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "audit_logs" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "auth_accounts" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "auth_audit_events" DROP COLUMN "workspace_id",
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "auth_refresh_tokens" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "auth_sessions" DROP COLUMN "refresh_token_hash",
DROP COLUMN "workspace_id",
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "categories" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "characters" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "comments" ADD COLUMN "is_spoiler" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "post_id" TEXT,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "contact_groups" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "contact_messages" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "contacts" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "devices" DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "ip_address",
DROP COLUMN "is_current",
DROP COLUMN "location",
DROP COLUMN "session_id",
DROP COLUMN "user_agent";

-- AlterTable
ALTER TABLE "domain_configs" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "email_verification_tokens" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "encoding_jobs" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "episodes" ALTER COLUMN "number" SET DATA TYPE INTEGER,
ALTER COLUMN "duration" SET NOT NULL,
ALTER COLUMN "duration" SET DEFAULT 0,
ALTER COLUMN "duration" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "faqs" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "genres" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "integrations" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "local_credentials" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "login_history" DROP COLUMN "browser",
DROP COLUMN "device_type",
DROP COLUMN "os",
DROP COLUMN "updated_at",
ADD COLUMN "device_id" TEXT,
DROP COLUMN "status",
ADD COLUMN "status" "LoginStatus" NOT NULL;

-- AlterTable
ALTER TABLE "media_assets" ALTER COLUMN "anime_id" SET NOT NULL,
ALTER COLUMN "size" SET DEFAULT 0,
ALTER COLUMN "duration" SET NOT NULL,
ALTER COLUMN "duration" SET DEFAULT 0,
ALTER COLUMN "duration" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "mfa_recovery_codes" DROP COLUMN "updated_at",
DROP COLUMN "used",
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
DROP COLUMN "used_at",
ADD COLUMN "used_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "notification_preferences" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "notifications" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "password_reset_tokens" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "deleted_at",
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "reports" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "reviews" ALTER COLUMN "rating" SET DATA TYPE INTEGER,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "roles" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "seo_meta" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "source_configs" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "source_sync_logs" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "studios" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "system_settings" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ticket_replies" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "tickets" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "user_roles" ALTER COLUMN "assigned_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "user_settings" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "last_seen_at",
DROP COLUMN "mfa_enabled",
DROP COLUMN "mfa_secret",
DROP COLUMN "permissions",
DROP COLUMN "presence_status",
DROP COLUMN "roles",
ALTER COLUMN "email_normalized" SET NOT NULL,
DROP COLUMN "status",
ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'active',
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "watch_progress" ADD COLUMN "watch_count" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "watchlist_items" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "watchlists" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "workspace_members" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "workspaces" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "calendar_events";

-- DropTable
DROP TABLE "premieres";

-- DropTable
DROP TABLE "release_schedules";

-- DropTable
DROP TABLE "simulcasts";

-- DropTable
DROP TABLE "tags";

-- DropTable
DROP TABLE "watch_history";

-- CreateTable
CREATE TABLE "user_presence" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "PresenceStatus" NOT NULL DEFAULT 'offline',
    "last_seen_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_presence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mfa_secrets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "otpauth_url" TEXT,
    "qr_code_url" TEXT,
    "confirmed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mfa_secrets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_posts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "author_id" TEXT NOT NULL,
    "category_id" TEXT,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forum_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_reactions" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "ReactionType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" TEXT NOT NULL,
    "from_anime_id" TEXT NOT NULL,
    "to_anime_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "description" TEXT,
    "vote_count" INTEGER NOT NULL DEFAULT 0,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watch_sessions" (
    "id" TEXT NOT NULL,
    "progress_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3),
    "progress_end" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "watch_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_entries" (
    "id" TEXT NOT NULL,
    "anime_id" TEXT NOT NULL,
    "episode_id" TEXT,
    "entry_type" "ScheduleEntryType" NOT NULL,
    "air_day" TEXT,
    "air_time" TEXT,
    "air_timezone" TEXT,
    "region" TEXT NOT NULL DEFAULT 'global',
    "season" INTEGER,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3),
    "all_day" BOOLEAN NOT NULL DEFAULT false,
    "platform" TEXT,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'scheduled',
    "color" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_presence_user_id_key" ON "user_presence"("user_id");

-- CreateIndex
CREATE INDEX "password_history_user_id_idx" ON "password_history"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "mfa_secrets_user_id_key" ON "mfa_secrets"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "forum_posts_slug_key" ON "forum_posts"("slug");

-- CreateIndex
CREATE INDEX "forum_posts_category_id_idx" ON "forum_posts"("category_id");

-- CreateIndex
CREATE INDEX "forum_posts_published_at_idx" ON "forum_posts"("published_at");

-- CreateIndex
CREATE UNIQUE INDEX "post_reactions_post_id_user_id_type_key" ON "post_reactions"("post_id", "user_id", "type");

-- CreateIndex
CREATE INDEX "recommendations_from_anime_id_idx" ON "recommendations"("from_anime_id");

-- CreateIndex
CREATE INDEX "recommendations_to_anime_id_idx" ON "recommendations"("to_anime_id");

-- CreateIndex
CREATE INDEX "watch_sessions_progress_id_idx" ON "watch_sessions"("progress_id");

-- CreateIndex
CREATE INDEX "schedule_entries_anime_id_idx" ON "schedule_entries"("anime_id");

-- CreateIndex
CREATE INDEX "schedule_entries_episode_id_idx" ON "schedule_entries"("episode_id");

-- CreateIndex
CREATE INDEX "schedule_entries_start_at_idx" ON "schedule_entries"("start_at");

-- CreateIndex
CREATE INDEX "schedule_entries_entry_type_idx" ON "schedule_entries"("entry_type");

-- CreateIndex
CREATE INDEX "schedule_entries_status_idx" ON "schedule_entries"("status");

-- CreateIndex
CREATE INDEX "anime_status_release_year_idx" ON "anime"("status", "release_year");

-- CreateIndex
CREATE INDEX "anime_contentType_idx" ON "anime"("contentType");

-- CreateIndex
CREATE INDEX "comments_post_id_idx" ON "comments"("post_id");

-- CreateIndex
CREATE UNIQUE INDEX "mfa_recovery_codes_user_id_code_hash_key" ON "mfa_recovery_codes"("user_id", "code_hash");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");
