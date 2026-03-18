-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('LOAN', 'LEASE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'LATE', 'PARTIAL');

-- AlterTable
ALTER TABLE "SellerProfile" ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "BuyerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuyerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "buyerProfileId" TEXT NOT NULL,
    "type" "ContractType" NOT NULL DEFAULT 'LOAN',
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "downPayment" DECIMAL(12,2) NOT NULL,
    "principalAmount" DECIMAL(12,2) NOT NULL,
    "interestRate" DECIMAL(5,2),
    "termInYears" INTEGER,
    "startDate" TIMESTAMP(3) NOT NULL,
    "monthlyTaxes" DECIMAL(10,2),
    "monthlyInsurance" DECIMAL(10,2),
    "monthlyServFee" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "totalDue" DECIMAL(10,2) NOT NULL,
    "principal" DECIMAL(10,2) NOT NULL,
    "interest" DECIMAL(10,2) NOT NULL,
    "taxes" DECIMAL(10,2),
    "insurance" DECIMAL(10,2),
    "serviceFee" DECIMAL(10,2),
    "lateFee" DECIMAL(10,2) DEFAULT 0,
    "remainingBalance" DECIMAL(12,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BuyerProfile_userId_key" ON "BuyerProfile"("userId");

-- AddForeignKey
ALTER TABLE "BuyerProfile" ADD CONSTRAINT "BuyerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_buyerProfileId_fkey" FOREIGN KEY ("buyerProfileId") REFERENCES "BuyerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
