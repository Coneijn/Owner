/*
  Warnings:

  - A unique constraint covering the columns `[stripeCustomerID]` on the table `BuyerProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripePaymentIntentID]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "BuyerProfile" ADD COLUMN     "stripeCustomerID" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "stripePaymentIntentID" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "BuyerProfile_stripeCustomerID_key" ON "BuyerProfile"("stripeCustomerID");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripePaymentIntentID_key" ON "Payment"("stripePaymentIntentID");
