/*
  Warnings:

  - You are about to drop the column `questionText` on the `NodePayload` table. All the data in the column will be lost.
  - You are about to drop the column `videoUrl` on the `NodePayload` table. All the data in the column will be lost.
  - You are about to drop the column `payloadId` on the `QuizOption` table. All the data in the column will be lost.
  - Added the required column `questionId` to the `QuizOption` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "QuizOption" DROP CONSTRAINT "QuizOption_payloadId_fkey";

-- AlterTable
ALTER TABLE "NodePayload" DROP COLUMN "questionText",
DROP COLUMN "videoUrl",
ADD COLUMN     "mediaType" TEXT,
ADD COLUMN     "mediaUrl" TEXT;

-- AlterTable
ALTER TABLE "QuizOption" DROP COLUMN "payloadId",
ADD COLUMN     "questionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserProgress" ADD COLUMN     "score" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" TEXT NOT NULL,
    "payloadId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_payloadId_fkey" FOREIGN KEY ("payloadId") REFERENCES "NodePayload"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizOption" ADD CONSTRAINT "QuizOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
