-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "sellerType" TEXT DEFAULT 'OWNER',
ADD COLUMN     "seoDescriptionEn" TEXT,
ADD COLUMN     "seoDescriptionEs" TEXT,
ADD COLUMN     "seoTitleEn" TEXT,
ADD COLUMN     "seoTitleEs" TEXT,
ADD COLUMN     "videoUrl" TEXT DEFAULT '';

-- CreateTable
CREATE TABLE "PropertyImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "title" TEXT,
    "caption" TEXT,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "PropertyImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PropertyImage" ADD CONSTRAINT "PropertyImage_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
