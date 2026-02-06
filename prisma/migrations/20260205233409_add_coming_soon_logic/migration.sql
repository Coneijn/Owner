-- AlterEnum
ALTER TYPE "PropertyStatus" ADD VALUE 'COMING_SOON';

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "availableDate" TIMESTAMP(3),
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "lockboxCode" TEXT,
ADD COLUMN     "longitude" DOUBLE PRECISION;
