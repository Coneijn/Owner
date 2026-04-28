/*
  Warnings:

  - The values [LEASE] on the enum `ContractType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `renterProfileId` on the `Property` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ContractType_new" AS ENUM ('LOAN');
ALTER TABLE "Contract" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Contract" ALTER COLUMN "type" TYPE "ContractType_new" USING ("type"::text::"ContractType_new");
ALTER TYPE "ContractType" RENAME TO "ContractType_old";
ALTER TYPE "ContractType_new" RENAME TO "ContractType";
DROP TYPE "ContractType_old";
ALTER TABLE "Contract" ALTER COLUMN "type" SET DEFAULT 'LOAN';
COMMIT;

-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_renterProfileId_fkey";

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "renterProfileId";

-- CreateTable
CREATE TABLE "LeaseAgreement" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "renterProfileId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "monthlyRent" DECIMAL(10,2) NOT NULL,
    "securityDeposit" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaseAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalPayment" (
    "id" TEXT NOT NULL,
    "leaseId" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "totalDue" DECIMAL(10,2) NOT NULL,
    "serviceFee" DECIMAL(10,2),
    "lateFee" DECIMAL(10,2) DEFAULT 0,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "stripePaymentIntentID" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RentalPayment_stripePaymentIntentID_key" ON "RentalPayment"("stripePaymentIntentID");

-- AddForeignKey
ALTER TABLE "LeaseAgreement" ADD CONSTRAINT "LeaseAgreement_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaseAgreement" ADD CONSTRAINT "LeaseAgreement_renterProfileId_fkey" FOREIGN KEY ("renterProfileId") REFERENCES "RenterProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalPayment" ADD CONSTRAINT "RentalPayment_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "LeaseAgreement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
