-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "authorBioEn" TEXT,
ADD COLUMN     "authorBioEs" TEXT,
ADD COLUMN     "authorImage" TEXT,
ADD COLUMN     "authorName" TEXT,
ADD COLUMN     "focusKeywordEn" TEXT,
ADD COLUMN     "focusKeywordEs" TEXT;

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "isForRent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "monthlyRent" DECIMAL(10,2),
ADD COLUMN     "securityDeposit" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "PostImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "postId" TEXT NOT NULL,

    CONSTRAINT "PostImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PostImage" ADD CONSTRAINT "PostImage_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
