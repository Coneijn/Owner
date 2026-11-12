/*
  Warnings:

  - A unique constraint covering the columns `[ghlContactId]` on the table `SellerProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AgreementType" AS ENUM ('FLAT_10K', 'PERCENT_5');

-- AlterEnum
ALTER TYPE "PropertyStatus" ADD VALUE 'PENDING_DOCUMENTATION';

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "estimatedInsurance" DOUBLE PRECISION,
ADD COLUMN     "estimatedMonthlyPayment" DOUBLE PRECISION,
ADD COLUMN     "estimatedTaxes" DOUBLE PRECISION,
ADD COLUMN     "isDraftComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "missingFields" TEXT[],
ADD COLUMN     "previouslySold" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "salePrice" DOUBLE PRECISION,
ADD COLUMN     "suggestedInterestRate" DOUBLE PRECISION DEFAULT 10.0,
ADD COLUMN     "suggestedPriceMax" DOUBLE PRECISION,
ADD COLUMN     "suggestedPriceMin" DOUBLE PRECISION,
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "SellerProfile" ADD COLUMN     "agreementSigned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "agreementSignedAt" TIMESTAMP(3),
ADD COLUMN     "agreementType" "AgreementType",
ADD COLUMN     "assistantDiscordSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "assistantEmail" TEXT,
ADD COLUMN     "assistantName" TEXT,
ADD COLUMN     "assistantPhone" TEXT,
ADD COLUMN     "discordInviteSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ghlContactId" TEXT,
ADD COLUMN     "ghlOpportunityId" TEXT,
ADD COLUMN     "hasAssistant" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "SellerProfile_ghlContactId_key" ON "SellerProfile"("ghlContactId");
