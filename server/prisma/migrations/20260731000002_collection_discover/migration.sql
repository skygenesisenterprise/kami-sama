-- Collection discover sections
-- Idempotent: GORM AutoMigrate may already have created these columns in dev.

ALTER TABLE "collections" ADD COLUMN IF NOT EXISTS "discover_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "collections" ADD COLUMN IF NOT EXISTS "discover_order" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "collections" ADD COLUMN IF NOT EXISTS "discover_title" TEXT;
ALTER TABLE "collections" ADD COLUMN IF NOT EXISTS "discover_subtitle" TEXT;
ALTER TABLE "collections" ADD COLUMN IF NOT EXISTS "discover_cta" TEXT;
ALTER TABLE "collections" ADD COLUMN IF NOT EXISTS "discover_href" TEXT;

CREATE INDEX IF NOT EXISTS "collections_discover_enabled_idx" ON "collections"("discover_enabled");
CREATE INDEX IF NOT EXISTS "collections_discover_order_idx" ON "collections"("discover_order");
