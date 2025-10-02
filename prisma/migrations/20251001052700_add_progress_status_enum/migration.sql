/*
  Warnings:

  - The `status` column on the `BlogProgress` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `ChapterProgress` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `CourseProgress` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."ProgressStatus" AS ENUM ('NOT_STARTED', 'STARTED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED', 'ABANDONED');

-- AlterTable
ALTER TABLE "public"."BlogProgress" ADD COLUMN     "last_accessed_at" TIMESTAMPTZ,
ADD COLUMN     "started_at" TIMESTAMPTZ,
DROP COLUMN "status",
ADD COLUMN     "status" "public"."ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED';

-- AlterTable
ALTER TABLE "public"."ChapterProgress" ADD COLUMN     "last_accessed_at" TIMESTAMPTZ,
ADD COLUMN     "started_at" TIMESTAMPTZ,
DROP COLUMN "status",
ADD COLUMN     "status" "public"."ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED';

-- AlterTable
ALTER TABLE "public"."CourseProgress" ADD COLUMN     "last_accessed_at" TIMESTAMPTZ,
ADD COLUMN     "started_at" TIMESTAMPTZ,
DROP COLUMN "status",
ADD COLUMN     "status" "public"."ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED';

-- CreateIndex
CREATE INDEX "BlogProgress_status_idx" ON "public"."BlogProgress"("status");

-- CreateIndex
CREATE INDEX "ChapterProgress_status_idx" ON "public"."ChapterProgress"("status");

-- CreateIndex
CREATE INDEX "CourseProgress_status_idx" ON "public"."CourseProgress"("status");
