/*
  Warnings:

  - A unique constraint covering the columns `[course_id,sequence_number]` on the table `ChapterTopic` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sequence_number` to the `ChapterTopic` table without a default value. This is not possible if the table is not empty.
  - Made the column `course_id` on table `ChapterTopic` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."CourseStatus" AS ENUM ('DRAFT', 'LIVE', 'ARCHIVED', 'COMING_SOON');

-- DropForeignKey
ALTER TABLE "public"."ChapterTopic" DROP CONSTRAINT "ChapterTopic_course_id_fkey";

-- AlterTable
ALTER TABLE "public"."ChapterTopic" ADD COLUMN     "sequence_number" INTEGER NOT NULL,
ALTER COLUMN "course_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Course" ADD COLUMN     "status" "public"."CourseStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE UNIQUE INDEX "ChapterTopic_course_id_sequence_number_key" ON "public"."ChapterTopic"("course_id", "sequence_number");

-- AddForeignKey
ALTER TABLE "public"."ChapterTopic" ADD CONSTRAINT "ChapterTopic_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
