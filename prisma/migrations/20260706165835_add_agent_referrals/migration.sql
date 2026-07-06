-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('PENDING', 'WON', 'LOST');

-- AlterTable
ALTER TABLE "AgentProfile" ADD COLUMN     "balance" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "AgentReferral" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientPhone" TEXT,
    "clientEmail" TEXT,
    "expectedDeposit" DECIMAL(10,2),
    "expectedCommission" DECIMAL(10,2),
    "balanceOwed" DECIMAL(10,2),
    "status" "ReferralStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentReferral_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentReferral_propertyId_clientEmail_clientPhone_idx" ON "AgentReferral"("propertyId", "clientEmail", "clientPhone");

-- AddForeignKey
ALTER TABLE "AgentReferral" ADD CONSTRAINT "AgentReferral_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AgentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentReferral" ADD CONSTRAINT "AgentReferral_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
