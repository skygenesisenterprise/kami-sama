-- MyAnimeList import support:
-- * the MAL importer (and the shared AnimeStatus contract) writes status
--   "complete", so the enum value is renamed from "completed" to stay valid.
--   Existing rows are migrated automatically by Postgres.
-- * a GIN index accelerates the metadata->>'mal_id' lookups the MAL importer
--   uses to match imported entries.

-- AlterEnum
ALTER TYPE "AnimeStatus" RENAME VALUE 'completed' TO 'complete';

-- CreateIndex
CREATE INDEX "anime_metadata_gin_idx" ON "anime" USING GIN ("metadata");
