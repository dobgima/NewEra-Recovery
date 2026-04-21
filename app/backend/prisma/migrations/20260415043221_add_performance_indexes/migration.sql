-- CreateIndex
CREATE INDEX "CrisisPlan_userId_idx" ON "CrisisPlan"("userId");

-- CreateIndex
CREATE INDEX "Milestone_userId_idx" ON "Milestone"("userId");

-- CreateIndex
CREATE INDEX "Milestone_achievedAt_idx" ON "Milestone"("achievedAt");

-- CreateIndex
CREATE INDEX "PeerSupportRequest_requesterId_idx" ON "PeerSupportRequest"("requesterId");

-- CreateIndex
CREATE INDEX "PeerSupportRequest_recipientId_idx" ON "PeerSupportRequest"("recipientId");

-- CreateIndex
CREATE INDEX "PeerSupportRequest_status_idx" ON "PeerSupportRequest"("status");

-- CreateIndex
CREATE INDEX "RecoveryPlan_userId_idx" ON "RecoveryPlan"("userId");

-- CreateIndex
CREATE INDEX "SupportContact_userId_idx" ON "SupportContact"("userId");

-- CreateIndex
CREATE INDEX "TreatmentProvider_zipCode_idx" ON "TreatmentProvider"("zipCode");

-- CreateIndex
CREATE INDEX "TreatmentProvider_latitude_longitude_idx" ON "TreatmentProvider"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
