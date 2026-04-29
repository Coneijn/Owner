/*
  Warnings:

  - You are about to drop the column `buyerProfileId` on the `Contract` table. All the data in the column will be lost.
  - You are about to drop the column `renterProfileId` on the `LeaseAgreement` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_buyerProfileId_fkey";

-- DropForeignKey
ALTER TABLE "LeaseAgreement" DROP CONSTRAINT "LeaseAgreement_renterProfileId_fkey";

-- AlterTable
ALTER TABLE "Contract" DROP COLUMN "buyerProfileId";

-- AlterTable
ALTER TABLE "LeaseAgreement" DROP COLUMN "renterProfileId";

-- CreateTable
CREATE TABLE "_BuyerProfileToContract" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_LeaseAgreementToRenterProfile" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BuyerProfileToContract_AB_unique" ON "_BuyerProfileToContract"("A", "B");

-- CreateIndex
CREATE INDEX "_BuyerProfileToContract_B_index" ON "_BuyerProfileToContract"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_LeaseAgreementToRenterProfile_AB_unique" ON "_LeaseAgreementToRenterProfile"("A", "B");

-- CreateIndex
CREATE INDEX "_LeaseAgreementToRenterProfile_B_index" ON "_LeaseAgreementToRenterProfile"("B");

-- AddForeignKey
ALTER TABLE "_BuyerProfileToContract" ADD CONSTRAINT "_BuyerProfileToContract_A_fkey" FOREIGN KEY ("A") REFERENCES "BuyerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BuyerProfileToContract" ADD CONSTRAINT "_BuyerProfileToContract_B_fkey" FOREIGN KEY ("B") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LeaseAgreementToRenterProfile" ADD CONSTRAINT "_LeaseAgreementToRenterProfile_A_fkey" FOREIGN KEY ("A") REFERENCES "LeaseAgreement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LeaseAgreementToRenterProfile" ADD CONSTRAINT "_LeaseAgreementToRenterProfile_B_fkey" FOREIGN KEY ("B") REFERENCES "RenterProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
