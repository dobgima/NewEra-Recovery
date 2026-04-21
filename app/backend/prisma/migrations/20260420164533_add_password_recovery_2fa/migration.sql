-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordResetExpiresAt" TIMESTAMP(3),
ADD COLUMN     "passwordResetToken" TEXT,
ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorMethod" TEXT DEFAULT 'email',
ADD COLUMN     "twoFactorSecret" TEXT;

-- CreateTable
CREATE TABLE "TwoFactorSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TwoFactorSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TwoFactorSession_token_key" ON "TwoFactorSession"("token");

-- CreateIndex
CREATE INDEX "TwoFactorSession_userId_idx" ON "TwoFactorSession"("userId");

-- CreateIndex
CREATE INDEX "TwoFactorSession_token_idx" ON "TwoFactorSession"("token");

-- CreateIndex
CREATE INDEX "TwoFactorSession_expiresAt_idx" ON "TwoFactorSession"("expiresAt");

-- AddForeignKey
ALTER TABLE "TwoFactorSession" ADD CONSTRAINT "TwoFactorSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
