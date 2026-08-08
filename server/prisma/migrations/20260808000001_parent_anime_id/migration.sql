-- Add parent_anime_id column to group multi-season anime under one parent.
-- When null: the entry is a parent (standalone or first season).
-- When set: the entry is a child (sequel/prequel) of another anime.

-- AlterTable
ALTER TABLE "anime" ADD COLUMN "parent_anime_id" TEXT;

-- CreateIndex
CREATE INDEX "anime_parent_anime_id_idx" ON "anime"("parent_anime_id");

-- AddForeignKey
ALTER TABLE "anime" ADD CONSTRAINT "anime_parent_anime_id_fkey" FOREIGN KEY ("parent_anime_id") REFERENCES "anime"("id") ON DELETE SET NULL ON UPDATE CASCADE;
