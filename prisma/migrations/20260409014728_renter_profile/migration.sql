-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "renterProfileId" TEXT;

-- CreateTable
CREATE TABLE "RenterProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "RenterName" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RenterProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RenterProfile_userId_key" ON "RenterProfile"("userId");

-- AddForeignKey
ALTER TABLE "RenterProfile" ADD CONSTRAINT "RenterProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_renterProfileId_fkey" FOREIGN KEY ("renterProfileId") REFERENCES "RenterProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
