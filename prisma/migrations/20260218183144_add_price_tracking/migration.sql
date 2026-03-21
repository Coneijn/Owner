-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "lastPriceChangeAt" TIMESTAMP(3),
ADD COLUMN     "previousPrice" DECIMAL(10,2);
