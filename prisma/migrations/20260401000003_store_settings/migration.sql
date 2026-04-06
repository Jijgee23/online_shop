CREATE TABLE "StoreSettings" (
    "id"        SERIAL NOT NULL,
    "storeName" TEXT NOT NULL DEFAULT 'IShop',
    "storeDesc" TEXT NOT NULL DEFAULT '',
    "phone"     TEXT NOT NULL DEFAULT '',
    "email"     TEXT NOT NULL DEFAULT '',
    "address"   TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("id")
);

-- Seed the single settings row
INSERT INTO "StoreSettings" ("storeName", "storeDesc", "phone", "email", "address", "updatedAt")
VALUES ('IShop', '', '', '', '', NOW());
