-- CreateEnum
CREATE TYPE "public"."NoteStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED', 'DELETED');

-- AlterTable
ALTER TABLE "public"."user_notes" ADD COLUMN     "status" "public"."NoteStatus" NOT NULL DEFAULT 'ACTIVE';
