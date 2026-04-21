/*
  Warnings:

  - You are about to drop the column `completedAt` on the `CheckIn` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CheckIn" DROP CONSTRAINT "CheckIn_userId_fkey";

-- AlterTable
ALTER TABLE "CheckIn" DROP COLUMN "completedAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "RiskScore" ADD COLUMN     "crisisEscalation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "encouragement" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "factors" TEXT[],
ADD COLUMN     "recommendedAction" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE INDEX "CheckIn_userId_createdAt_idx" ON "CheckIn"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
