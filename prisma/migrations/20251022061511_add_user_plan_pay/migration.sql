-- CreateEnum
CREATE TYPE "public"."PlanFeatureStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- AlterTable
ALTER TABLE "public"."PlanFeature" ADD COLUMN     "status" "public"."PlanFeatureStatus" NOT NULL DEFAULT 'ACTIVE';
