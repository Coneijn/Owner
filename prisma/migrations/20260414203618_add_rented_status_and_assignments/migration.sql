-- AlterEnum
ALTER TYPE "PropertyStatus" ADD VALUE 'RENTED';

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "buyerProfileId" TEXT;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_buyerProfileId_fkey" FOREIGN KEY ("buyerProfileId") REFERENCES "BuyerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
