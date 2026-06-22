-- Add new array column, migrate existing single banner into it, then drop old column
ALTER TABLE "StoreSettings" ADD COLUMN "banners" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "StoreSettings" SET "banners" = ARRAY["banner"] WHERE "banner" <> '';

ALTER TABLE "StoreSettings" DROP COLUMN "banner";
