-- AlterTable
ALTER TABLE "RecoveryPreference" ADD COLUMN     "notificationPrefs" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "reminderPrefs" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'light';

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "timezone" TEXT;
