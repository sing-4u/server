-- DropIndex
DROP INDEX "User_isOpened_idx";

-- DropIndex
DROP INDEX "User_provider_providerId_idx";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "cover" TEXT,
ADD COLUMN     "isArtist" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "links" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "User_isArtist_isOpened_id_idx" ON "User"("isArtist" DESC, "isOpened" DESC, "id" DESC);
