-- AlterTable
ALTER TABLE "CheckIn" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "RiskScore" ALTER COLUMN "crisisEscalation" DROP DEFAULT,
ALTER COLUMN "encouragement" DROP DEFAULT,
ALTER COLUMN "recommendedAction" DROP DEFAULT;
