-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "ReputationDomain" AS ENUM ('science', 'health', 'politics', 'technology', 'environment', 'economics', 'local_news', 'breaking_news', 'history', 'sports');

-- CreateEnum
CREATE TYPE "ReachTier" AS ENUM ('full', 'standard', 'reduced', 'sandboxed');

-- CreateEnum
CREATE TYPE "ExpertiseLevel" AS ENUM ('verified_expert', 'established', 'contributor', 'newcomer');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('fact_claim', 'opinion', 'satire', 'question', 'personal_experience');

-- CreateEnum
CREATE TYPE "MissionStage" AS ENUM ('identify', 'research', 'propose', 'act', 'measure');

-- CreateEnum
CREATE TYPE "Scope" AS ENUM ('street', 'neighborhood', 'city', 'national', 'global');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('pending', 'active', 'resolved', 'rejected');

-- CreateEnum
CREATE TYPE "ReputationEventType" AS ENUM ('verified_claim', 'debunked_claim', 'credible_reaction', 'helpful_note', 'source_link', 'successful_appeal', 'accurate_dispute', 'upheld_dispute', 'upheld_report', 'frivolous_report', 'misclassification', 'coordinated_flag');

-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('credible', 'dispute', 'trust');

-- CreateEnum
CREATE TYPE "SlowModeReason" AS ENUM ('low_reputation_source', 'coordinated_flag', 'misclassification', 'disputed_claim');

-- CreateEnum
CREATE TYPE "MissionParticipantRole" AS ENUM ('verifier', 'contributor', 'coordinator', 'mentor');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "email" TEXT,
    "phoneHash" TEXT,
    "deviceFingerprint" TEXT,
    "identityVerified" BOOLEAN NOT NULL DEFAULT false,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "location" geometry(Point, 4326),
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "lastStreakDate" TIMESTAMP(3),
    "streakFreezeCount" INTEGER NOT NULL DEFAULT 2,
    "dailyXpEarned" INTEGER NOT NULL DEFAULT 0,
    "dailyXpResetAt" TIMESTAMP(3),
    "probationUntil" TIMESTAMP(3),
    "coordinatedBehaviorFlag" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastPostAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReputationScore" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "domain" "ReputationDomain" NOT NULL,
    "foundationScore" DOUBLE PRECISION NOT NULL DEFAULT 15,
    "activeScore" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "hybridScore" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "totalFactClaims" INTEGER NOT NULL DEFAULT 0,
    "verifiedClaims" INTEGER NOT NULL DEFAULT 0,
    "debunkedClaims" INTEGER NOT NULL DEFAULT 0,
    "expertiseLevel" "ExpertiseLevel" NOT NULL DEFAULT 'newcomer',
    "reachTier" "ReachTier" NOT NULL DEFAULT 'sandboxed',
    "voteWeight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "isProbation" BOOLEAN NOT NULL DEFAULT false,
    "lastCalculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReputationScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyDelta" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "domain" "ReputationDomain" NOT NULL,
    "weekStart" DATE NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "verifiedClaims" INTEGER NOT NULL DEFAULT 0,
    "debunkedClaims" INTEGER NOT NULL DEFAULT 0,
    "credibleReactions" INTEGER NOT NULL DEFAULT 0,
    "disputesReceived" INTEGER NOT NULL DEFAULT 0,
    "upheldReports" INTEGER NOT NULL DEFAULT 0,
    "helpfulNotes" INTEGER NOT NULL DEFAULT 0,
    "sourceLinks" INTEGER NOT NULL DEFAULT 0,
    "frivolousReports" INTEGER NOT NULL DEFAULT 0,
    "misclassifications" INTEGER NOT NULL DEFAULT 0,
    "successfulAppeals" INTEGER NOT NULL DEFAULT 0,
    "accurateDisputes" INTEGER NOT NULL DEFAULT 0,
    "daysSinceLastPost" INTEGER NOT NULL DEFAULT 0,
    "positivePoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "negativePoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "inactivityPenalty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netDelta" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "recencyWeight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "weightedDelta" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyDelta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReputationEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reporterId" TEXT,
    "domain" "ReputationDomain" NOT NULL,
    "eventType" "ReputationEventType" NOT NULL,
    "points" DOUBLE PRECISION NOT NULL,
    "sourceContentId" TEXT,
    "reporterWeight" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReputationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "targetUserId" TEXT,
    "targetContentId" TEXT,
    "category" TEXT NOT NULL,
    "contentType" "ContentType",
    "status" "ReportStatus" NOT NULL DEFAULT 'pending',
    "effectiveWeight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "location" geometry(Point, 4326),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mission" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "scope" "Scope" NOT NULL DEFAULT 'street',
    "stage" "MissionStage" NOT NULL DEFAULT 'identify',
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "location" geometry(Point, 4326),
    "verifierCount" INTEGER NOT NULL DEFAULT 0,
    "confirmedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "primaryReportId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissionParticipant" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "MissionParticipantRole" NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MissionParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "r2Key" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reportId" TEXT,
    "postId" TEXT,
    "missionId" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "capturedAt" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "contentType" "ContentType" NOT NULL,
    "domain" "ReputationDomain",
    "body" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "location" geometry(Point, 4326),
    "isSlowed" BOOLEAN NOT NULL DEFAULT false,
    "slowReason" "SlowModeReason",
    "credibleCount" INTEGER NOT NULL DEFAULT 0,
    "disputeCount" INTEGER NOT NULL DEFAULT 0,
    "trustCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostReaction" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reaction" "ReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_handle_key" ON "User"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneHash_key" ON "User"("phoneHash");

-- CreateIndex
CREATE INDEX "ReputationScore_domain_idx" ON "ReputationScore"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "ReputationScore_userId_domain_key" ON "ReputationScore"("userId", "domain");

-- CreateIndex
CREATE INDEX "WeeklyDelta_weekStart_idx" ON "WeeklyDelta"("weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyDelta_userId_domain_weekStart_key" ON "WeeklyDelta"("userId", "domain", "weekStart");

-- CreateIndex
CREATE INDEX "ReputationEvent_userId_domain_createdAt_idx" ON "ReputationEvent"("userId", "domain", "createdAt");

-- CreateIndex
CREATE INDEX "ReputationEvent_userId_createdAt_idx" ON "ReputationEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ReputationEvent_eventType_idx" ON "ReputationEvent"("eventType");

-- CreateIndex
CREATE INDEX "Report_reporterId_idx" ON "Report"("reporterId");

-- CreateIndex
CREATE INDEX "Report_targetUserId_idx" ON "Report"("targetUserId");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Mission_primaryReportId_key" ON "Mission"("primaryReportId");

-- CreateIndex
CREATE INDEX "Mission_createdById_idx" ON "Mission"("createdById");

-- CreateIndex
CREATE INDEX "Mission_scope_stage_idx" ON "Mission"("scope", "stage");

-- CreateIndex
CREATE INDEX "MissionParticipant_missionId_idx" ON "MissionParticipant"("missionId");

-- CreateIndex
CREATE INDEX "MissionParticipant_userId_idx" ON "MissionParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MissionParticipant_missionId_userId_key" ON "MissionParticipant"("missionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Image_r2Key_key" ON "Image"("r2Key");

-- CreateIndex
CREATE INDEX "Image_userId_idx" ON "Image"("userId");

-- CreateIndex
CREATE INDEX "Image_reportId_idx" ON "Image"("reportId");

-- CreateIndex
CREATE INDEX "Image_postId_idx" ON "Image"("postId");

-- CreateIndex
CREATE INDEX "Image_missionId_idx" ON "Image"("missionId");

-- CreateIndex
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");

-- CreateIndex
CREATE INDEX "Post_domain_idx" ON "Post"("domain");

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");

-- CreateIndex
CREATE INDEX "PostReaction_postId_reaction_idx" ON "PostReaction"("postId", "reaction");

-- CreateIndex
CREATE INDEX "PostReaction_userId_idx" ON "PostReaction"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PostReaction_postId_userId_key" ON "PostReaction"("postId", "userId");

-- AddForeignKey
ALTER TABLE "ReputationScore" ADD CONSTRAINT "ReputationScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyDelta" ADD CONSTRAINT "WeeklyDelta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReputationEvent" ADD CONSTRAINT "ReputationEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReputationEvent" ADD CONSTRAINT "ReputationEvent_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_primaryReportId_fkey" FOREIGN KEY ("primaryReportId") REFERENCES "Report"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionParticipant" ADD CONSTRAINT "MissionParticipant_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionParticipant" ADD CONSTRAINT "MissionParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostReaction" ADD CONSTRAINT "PostReaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostReaction" ADD CONSTRAINT "PostReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
