-- CreateEnum
CREATE TYPE "public"."SessionStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'DELETED');

-- AlterTable
ALTER TABLE "public"."ChatSession" ADD COLUMN     "session_name" TEXT,
ADD COLUMN     "status" "public"."SessionStatus" NOT NULL DEFAULT 'ACTIVE';
