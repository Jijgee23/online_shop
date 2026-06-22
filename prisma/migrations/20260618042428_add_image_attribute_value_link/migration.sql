-- CreateTable
CREATE TABLE "ProductImageLink" (
    "id" SERIAL NOT NULL,
    "imageId" INTEGER NOT NULL,
    "attributeValueId" INTEGER NOT NULL,

    CONSTRAINT "ProductImageLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductImageLink_attributeValueId_idx" ON "ProductImageLink"("attributeValueId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductImageLink_imageId_attributeValueId_key" ON "ProductImageLink"("imageId", "attributeValueId");

-- AddForeignKey
ALTER TABLE "ProductImageLink" ADD CONSTRAINT "ProductImageLink_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "ProductImage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImageLink" ADD CONSTRAINT "ProductImageLink_attributeValueId_fkey" FOREIGN KEY ("attributeValueId") REFERENCES "ProductAttributeValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
