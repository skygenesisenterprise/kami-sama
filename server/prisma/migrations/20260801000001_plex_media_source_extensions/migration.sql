-- Media source extensions for the Plex integration page:
-- mappings (Plex <-> Kami-Sama), capabilities and runtime logs.
-- Idempotent: GORM AutoMigrate may already have created these columns in dev.

-- CreateTable
CREATE TABLE "media_mappings" (
    "id" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "library_id" TEXT NOT NULL,
    "kami_id" TEXT NOT NULL,
    "kami_title" TEXT NOT NULL,
    "plex_rating_key" TEXT NOT NULL,
    "plex_title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tmdb_id" TEXT,
    "imdb_id" TEXT,
    "tvdb_id" TEXT,
    "anilist_id" TEXT,
    "match_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last_synced_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source_capabilities" (
    "id" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "supported" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "version" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "source_capabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source_logs" (
    "id" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "details" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "source_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_mappings_source_type_plex_rating_key_key" ON "media_mappings"("source_type", "plex_rating_key");

-- CreateIndex
CREATE INDEX "media_mappings_library_id_idx" ON "media_mappings"("library_id");

-- CreateIndex
CREATE INDEX "media_mappings_kami_id_idx" ON "media_mappings"("kami_id");

-- CreateIndex
CREATE UNIQUE INDEX "source_capabilities_source_type_key_key" ON "source_capabilities"("source_type", "key");

-- CreateIndex
CREATE INDEX "source_logs_source_type_timestamp_idx" ON "source_logs"("source_type", "timestamp");

-- CreateIndex
CREATE INDEX "source_logs_level_idx" ON "source_logs"("level");
