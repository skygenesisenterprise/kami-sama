-- CreateEnum
CREATE TYPE "PublicationState" AS ENUM ('Draft', 'Review', 'Approved', 'Scheduled', 'Published', 'Archived');

-- CreateEnum
CREATE TYPE "CollectionType" AS ENUM ('editorial', 'genre', 'seasonal', 'thematic', 'franchise', 'ranking', 'custom');

-- CreateEnum
CREATE TYPE "CollectionVisibility" AS ENUM ('public', 'unlisted', 'private');

-- CreateEnum
CREATE TYPE "MetadataStatus" AS ENUM ('synced', 'stale', 'error', 'missing');

-- Drop temporary tables created by GORM AutoMigrate before the Prisma
-- migration existed. They are empty, so this is safe and idempotent.
DROP TABLE IF EXISTS "collection_entries";
DROP TABLE IF EXISTS "collection_sources";
DROP TABLE IF EXISTS "collections";

-- CreateTable
CREATE TABLE "collections" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "CollectionType" NOT NULL DEFAULT 'editorial',
    "status" "PublicationState" NOT NULL DEFAULT 'Draft',
    "visibility" "CollectionVisibility" NOT NULL DEFAULT 'private',
    "poster_url" TEXT,
    "banner_url" TEXT,
    "metadata_status" "MetadataStatus" NOT NULL DEFAULT 'missing',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "updated_by_id" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_entries" (
    "id" TEXT NOT NULL,
    "collection_id" TEXT NOT NULL,
    "anime_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_sources" (
    "id" TEXT NOT NULL,
    "collection_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "external_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "last_synced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_sources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "collections_slug_key" ON "collections"("slug");

-- CreateIndex
CREATE INDEX "collections_status_idx" ON "collections"("status");

-- CreateIndex
CREATE INDEX "collections_type_idx" ON "collections"("type");

-- CreateIndex
CREATE INDEX "collections_visibility_idx" ON "collections"("visibility");

-- CreateIndex
CREATE INDEX "collections_updated_by_id_idx" ON "collections"("updated_by_id");

-- CreateIndex
CREATE INDEX "collection_entries_anime_id_idx" ON "collection_entries"("anime_id");

-- CreateIndex
CREATE INDEX "collection_entries_collection_id_position_idx" ON "collection_entries"("collection_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "collection_entries_collection_id_anime_id_key" ON "collection_entries"("collection_id", "anime_id");

-- CreateIndex
CREATE INDEX "collection_sources_provider_idx" ON "collection_sources"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "collection_sources_collection_id_provider_key" ON "collection_sources"("collection_id", "provider");
