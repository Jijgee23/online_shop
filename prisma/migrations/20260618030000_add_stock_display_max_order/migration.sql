-- AlterTable
ALTER TABLE "StoreSettings" ADD COLUMN     "maxOrderValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "showStock" BOOLEAN NOT NULL DEFAULT true;
