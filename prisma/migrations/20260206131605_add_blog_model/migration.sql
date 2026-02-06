-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "titleEn" TEXT NOT NULL,
    "titleEs" TEXT NOT NULL,
    "contentEn" TEXT NOT NULL,
    "contentEs" TEXT NOT NULL,
    "mainImage" TEXT,
    "seoTitleEn" TEXT,
    "seoDescEn" TEXT,
    "seoTitleEs" TEXT,
    "seoDescEs" TEXT,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");
