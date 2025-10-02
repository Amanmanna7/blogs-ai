-- CreateEnum
CREATE TYPE "public"."QuestionLevel" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'ADVANCE');

-- CreateEnum
CREATE TYPE "public"."QuestionType" AS ENUM ('TRUE_FALSE', 'MCQ_SINGLE', 'MCQ_MULTIPLE', 'FILL_BLANK', 'MIXED');

-- CreateEnum
CREATE TYPE "public"."AssessmentStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."QuestionStatus" AS ENUM ('DRAFT', 'LIVE', 'INACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "public"."Question" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "options" JSONB,
    "correctAnswers" JSONB,
    "explanation" TEXT,
    "level" "public"."QuestionLevel" NOT NULL,
    "type" "public"."QuestionType" NOT NULL,
    "status" "public"."QuestionStatus" NOT NULL DEFAULT 'LIVE',
    "blog_id" TEXT,
    "chapter_topic_id" TEXT,
    "course_id" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Assessment" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "level" "public"."QuestionLevel" NOT NULL,
    "allowedTypes" "public"."QuestionType"[],
    "totalQuestions" INTEGER NOT NULL,
    "status" "public"."AssessmentStatus" NOT NULL DEFAULT 'DRAFT',
    "blog_id" TEXT,
    "chapter_topic_id" TEXT,
    "course_id" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AssessmentQuestion" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "userAnswer" JSONB,
    "isCorrect" BOOLEAN,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "AssessmentQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserPreference" (
    "id" TEXT NOT NULL,
    "level" "public"."QuestionLevel" NOT NULL,
    "allowedTypes" "public"."QuestionType"[],
    "totalQuestions" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Question_blog_id_idx" ON "public"."Question"("blog_id");

-- CreateIndex
CREATE INDEX "Question_chapter_topic_id_idx" ON "public"."Question"("chapter_topic_id");

-- CreateIndex
CREATE INDEX "Question_course_id_idx" ON "public"."Question"("course_id");

-- CreateIndex
CREATE INDEX "Question_level_idx" ON "public"."Question"("level");

-- CreateIndex
CREATE INDEX "Question_type_idx" ON "public"."Question"("type");

-- CreateIndex
CREATE INDEX "Question_status_idx" ON "public"."Question"("status");

-- CreateIndex
CREATE INDEX "Assessment_user_id_idx" ON "public"."Assessment"("user_id");

-- CreateIndex
CREATE INDEX "Assessment_blog_id_idx" ON "public"."Assessment"("blog_id");

-- CreateIndex
CREATE INDEX "Assessment_chapter_topic_id_idx" ON "public"."Assessment"("chapter_topic_id");

-- CreateIndex
CREATE INDEX "Assessment_course_id_idx" ON "public"."Assessment"("course_id");

-- CreateIndex
CREATE INDEX "Assessment_status_idx" ON "public"."Assessment"("status");

-- CreateIndex
CREATE INDEX "AssessmentQuestion_assessment_id_idx" ON "public"."AssessmentQuestion"("assessment_id");

-- CreateIndex
CREATE INDEX "AssessmentQuestion_question_id_idx" ON "public"."AssessmentQuestion"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentQuestion_assessment_id_question_id_key" ON "public"."AssessmentQuestion"("assessment_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentQuestion_assessment_id_sequence_key" ON "public"."AssessmentQuestion"("assessment_id", "sequence");

-- CreateIndex
CREATE INDEX "UserPreference_user_id_idx" ON "public"."UserPreference"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_user_id_key" ON "public"."UserPreference"("user_id");

-- AddForeignKey
ALTER TABLE "public"."Question" ADD CONSTRAINT "Question_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "public"."Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Question" ADD CONSTRAINT "Question_chapter_topic_id_fkey" FOREIGN KEY ("chapter_topic_id") REFERENCES "public"."ChapterTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Question" ADD CONSTRAINT "Question_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assessment" ADD CONSTRAINT "Assessment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assessment" ADD CONSTRAINT "Assessment_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "public"."Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assessment" ADD CONSTRAINT "Assessment_chapter_topic_id_fkey" FOREIGN KEY ("chapter_topic_id") REFERENCES "public"."ChapterTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assessment" ADD CONSTRAINT "Assessment_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssessmentQuestion" ADD CONSTRAINT "AssessmentQuestion_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssessmentQuestion" ADD CONSTRAINT "AssessmentQuestion_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserPreference" ADD CONSTRAINT "UserPreference_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
