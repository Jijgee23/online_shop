-- CreateTable
CREATE TABLE "District" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliverable" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "District_name_key" ON "District"("name");

-- Seed UB districts
INSERT INTO "District" ("name") VALUES
    ('Баянзүрх'),
    ('Баянгол'),
    ('Сонгинохайрхан'),
    ('Чингэлтэй'),
    ('Сүхбаатар'),
    ('Хан-Уул'),
    ('Налайх'),
    ('Багануур'),
    ('Багахангай')
ON CONFLICT ("name") DO NOTHING;

-- Add districtId as nullable first (to handle existing rows)
ALTER TABLE "Address" ADD COLUMN "districtId" INTEGER;

-- Map existing district string to District.id (fallback to first district)
UPDATE "Address" a
SET "districtId" = COALESCE(
    (SELECT d.id FROM "District" d WHERE d.name = a.district LIMIT 1),
    (SELECT id FROM "District" ORDER BY id LIMIT 1)
);

-- Make districtId NOT NULL
ALTER TABLE "Address" ALTER COLUMN "districtId" SET NOT NULL;

-- Drop old district text column
ALTER TABLE "Address" DROP COLUMN "district";

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_districtId_fkey"
    FOREIGN KEY ("districtId") REFERENCES "District"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
