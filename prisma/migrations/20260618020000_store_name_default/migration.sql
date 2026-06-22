-- AlterTable: storeName-ийн анхдагч утгыг "IShop"-оос ерөнхий "Дэлгүүр" болгов
ALTER TABLE "StoreSettings" ALTER COLUMN "storeName" SET DEFAULT 'Дэлгүүр';

-- Хуучин анхдагч брэндийг хадгалсаар байгаа мөрийг шинэчлэх
UPDATE "StoreSettings" SET "storeName" = 'Дэлгүүр' WHERE "storeName" = 'IShop';
