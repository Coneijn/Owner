-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "calendarLink" TEXT,
ADD COLUMN     "sellerImage" TEXT,
ADD COLUMN     "sellerName" TEXT,
ADD COLUMN     "showSeller" BOOLEAN NOT NULL DEFAULT false;
