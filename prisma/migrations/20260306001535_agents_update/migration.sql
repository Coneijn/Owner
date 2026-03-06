-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "buyerCredit" TEXT,
ADD COLUMN     "buyerFinancing" TEXT,
ADD COLUMN     "buyerIncome" TEXT,
ADD COLUMN     "buyerTags" TEXT[],
ADD COLUMN     "commissionAmt" DECIMAL(10,2),
ADD COLUMN     "commissionNote" TEXT,
ADD COLUMN     "commissionPct" DECIMAL(5,2),
ADD COLUMN     "condition" TEXT,
ADD COLUMN     "emoji" TEXT,
ADD COLUMN     "showingNotes" TEXT,
ADD COLUMN     "showingSteps" TEXT[];

-- CreateTable
CREATE TABLE "MarketingMaterial" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "script" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingMaterial_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MarketingMaterial" ADD CONSTRAINT "MarketingMaterial_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
