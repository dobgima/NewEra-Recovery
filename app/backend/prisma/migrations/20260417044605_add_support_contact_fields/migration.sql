/*
  Warnings:

  - Added the required column `updatedAt` to the `SupportContact` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SupportContact" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isPrimary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
