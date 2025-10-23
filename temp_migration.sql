-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('USER', 'ADMIN', 'MODERATOR', 'EDITOR', 'AUTHOR');

-- CreateEnum
CREATE TYPE "public"."BlogStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."SubjectType" AS ENUM ('ACADEMIC', 'TECHNICAL', 'CREATIVE', 'BUSINESS', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."MediaType" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."CourseStatus" AS ENUM ('DRAFT', 'LIVE', 'ARCHIVED', 'COMING_SOON');

-- CreateEnum
CREATE TYPE "public"."ChatSender" AS ENUM ('USER', 'AI');

-- CreateEnum
CREATE TYPE "public"."SessionStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "public"."QuestionLevel" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'ADVANCE');

-- CreateEnum
CREATE TYPE "public"."QuestionType" AS ENUM ('TRUE_FALSE', 'MCQ_SINGLE', 'MCQ_MULTIPLE', 'FILL_BLANK', 'MIXED');

-- CreateEnum
CREATE TYPE "public"."AssessmentStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."QuestionStatus" AS ENUM ('DRAFT', 'LIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."ProgressStatus" AS ENUM ('NOT_STARTED', 'STARTED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "public"."PlanStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "public"."UserPlanStatus" AS ENUM ('ACTIVE', 'PENDING', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."PlanFeatureStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "clerk_user_id" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image_url" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlogContent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "text_content" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "created_by_id" TEXT NOT NULL,

    CONSTRAINT "BlogContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Blog" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tags" TEXT[],
    "reading_time" INTEGER NOT NULL DEFAULT 5,
    "published_at" TIMESTAMPTZ,
    "status" "public"."BlogStatus" NOT NULL DEFAULT 'DRAFT',
    "meta" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "author_id" TEXT NOT NULL,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlogMedia" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "media_type" "public"."MediaType" NOT NULL,
    "media_url" TEXT NOT NULL,
    "description" TEXT,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "BlogMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Course" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subject_type" "public"."SubjectType" NOT NULL,
    "status" "public"."CourseStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChapterTopic" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "sequence_number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "ChapterTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlogCategory" (
    "id" TEXT NOT NULL,
    "blog_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChapterTopicRelation" (
    "id" TEXT NOT NULL,
    "chapter_topic_id" TEXT NOT NULL,
    "blog_id" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChapterTopicRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlogSequence" (
    "id" TEXT NOT NULL,
    "blog_id" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "blog_content_id" TEXT,
    "blog_media_id" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChatSession" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_name" TEXT,
    "blog_id" TEXT,
    "course_id" TEXT,
    "chapter_topic_id" TEXT,
    "status" "public"."SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChatMessage" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sender" "public"."ChatSender" NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlogProgress" (
    "id" TEXT NOT NULL,
    "blog_id" TEXT NOT NULL,
    "chapter_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "public"."ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "completed_at" TIMESTAMPTZ,
    "started_at" TIMESTAMPTZ,
    "last_accessed_at" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "BlogProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChapterProgress" (
    "id" TEXT NOT NULL,
    "chapter_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "public"."ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "completed_at" TIMESTAMPTZ,
    "started_at" TIMESTAMPTZ,
    "last_accessed_at" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "ChapterProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CourseProgress" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "public"."ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "completed_at" TIMESTAMPTZ,
    "started_at" TIMESTAMPTZ,
    "last_accessed_at" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "CourseProgress_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "public"."Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price_per_month" INTEGER NOT NULL,
    "status" "public"."PlanStatus" NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlanFeature" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "feature_slug" TEXT NOT NULL,
    "status" "public"."PlanFeatureStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "PlanFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Discount" (
    "id" TEXT NOT NULL,
    "discount_code" TEXT NOT NULL,
    "discount_amount" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserPlan" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "public"."UserPlanStatus" NOT NULL,
    "discount_id" TEXT,
    "paid_amount" INTEGER NOT NULL,
    "payment_details" JSONB,
    "payment_id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "UserPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerk_user_id_key" ON "public"."User"("clerk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BlogContent_slug_key" ON "public"."BlogContent"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Blog_slug_key" ON "public"."Blog"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlogMedia_slug_key" ON "public"."BlogMedia"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "public"."Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ChapterTopic_course_id_sequence_number_key" ON "public"."ChapterTopic"("course_id", "sequence_number");

-- CreateIndex
CREATE UNIQUE INDEX "BlogCategory_blog_id_category_id_key" ON "public"."BlogCategory"("blog_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "ChapterTopicRelation_chapter_topic_id_blog_id_key" ON "public"."ChapterTopicRelation"("chapter_topic_id", "blog_id");

-- CreateIndex
CREATE UNIQUE INDEX "ChapterTopicRelation_chapter_topic_id_sequence_key" ON "public"."ChapterTopicRelation"("chapter_topic_id", "sequence");

-- CreateIndex
CREATE INDEX "BlogSequence_blog_id_blog_content_id_idx" ON "public"."BlogSequence"("blog_id", "blog_content_id");

-- CreateIndex
CREATE INDEX "BlogSequence_blog_id_blog_media_id_idx" ON "public"."BlogSequence"("blog_id", "blog_media_id");

-- CreateIndex
CREATE UNIQUE INDEX "BlogSequence_blog_id_sequence_key" ON "public"."BlogSequence"("blog_id", "sequence");

-- CreateIndex
CREATE INDEX "ChatSession_user_id_idx" ON "public"."ChatSession"("user_id");

-- CreateIndex
CREATE INDEX "ChatSession_blog_id_idx" ON "public"."ChatSession"("blog_id");

-- CreateIndex
CREATE INDEX "ChatSession_course_id_idx" ON "public"."ChatSession"("course_id");

-- CreateIndex
CREATE INDEX "ChatSession_chapter_topic_id_idx" ON "public"."ChatSession"("chapter_topic_id");

-- CreateIndex
CREATE INDEX "ChatMessage_session_id_idx" ON "public"."ChatMessage"("session_id");

-- CreateIndex
CREATE INDEX "ChatMessage_createdAt_idx" ON "public"."ChatMessage"("createdAt");

-- CreateIndex
CREATE INDEX "BlogProgress_chapter_id_idx" ON "public"."BlogProgress"("chapter_id");

-- CreateIndex
CREATE INDEX "BlogProgress_user_id_idx" ON "public"."BlogProgress"("user_id");

-- CreateIndex
CREATE INDEX "BlogProgress_status_idx" ON "public"."BlogProgress"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BlogProgress_user_id_blog_id_key" ON "public"."BlogProgress"("user_id", "blog_id");

-- CreateIndex
CREATE INDEX "ChapterProgress_user_id_idx" ON "public"."ChapterProgress"("user_id");

-- CreateIndex
CREATE INDEX "ChapterProgress_status_idx" ON "public"."ChapterProgress"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ChapterProgress_user_id_chapter_id_key" ON "public"."ChapterProgress"("user_id", "chapter_id");

-- CreateIndex
CREATE INDEX "CourseProgress_user_id_idx" ON "public"."CourseProgress"("user_id");

-- CreateIndex
CREATE INDEX "CourseProgress_status_idx" ON "public"."CourseProgress"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CourseProgress_user_id_course_id_key" ON "public"."CourseProgress"("user_id", "course_id");

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
ALTER TABLE "public"."BlogContent" ADD CONSTRAINT "BlogContent_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Blog" ADD CONSTRAINT "Blog_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChapterTopic" ADD CONSTRAINT "ChapterTopic_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogCategory" ADD CONSTRAINT "BlogCategory_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "public"."Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogCategory" ADD CONSTRAINT "BlogCategory_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChapterTopicRelation" ADD CONSTRAINT "ChapterTopicRelation_chapter_topic_id_fkey" FOREIGN KEY ("chapter_topic_id") REFERENCES "public"."ChapterTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChapterTopicRelation" ADD CONSTRAINT "ChapterTopicRelation_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "public"."Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogSequence" ADD CONSTRAINT "BlogSequence_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "public"."Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogSequence" ADD CONSTRAINT "BlogSequence_blog_content_id_fkey" FOREIGN KEY ("blog_content_id") REFERENCES "public"."BlogContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogSequence" ADD CONSTRAINT "BlogSequence_blog_media_id_fkey" FOREIGN KEY ("blog_media_id") REFERENCES "public"."BlogMedia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatSession" ADD CONSTRAINT "ChatSession_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatSession" ADD CONSTRAINT "ChatSession_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "public"."Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatSession" ADD CONSTRAINT "ChatSession_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatSession" ADD CONSTRAINT "ChatSession_chapter_topic_id_fkey" FOREIGN KEY ("chapter_topic_id") REFERENCES "public"."ChapterTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatMessage" ADD CONSTRAINT "ChatMessage_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogProgress" ADD CONSTRAINT "BlogProgress_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "public"."Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogProgress" ADD CONSTRAINT "BlogProgress_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "public"."ChapterTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogProgress" ADD CONSTRAINT "BlogProgress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogProgress" ADD CONSTRAINT "BlogProgress_chapter_id_user_id_fkey" FOREIGN KEY ("chapter_id", "user_id") REFERENCES "public"."ChapterProgress"("chapter_id", "user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChapterProgress" ADD CONSTRAINT "ChapterProgress_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "public"."ChapterTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChapterProgress" ADD CONSTRAINT "ChapterProgress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseProgress" ADD CONSTRAINT "CourseProgress_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseProgress" ADD CONSTRAINT "CourseProgress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "public"."PlanFeature" ADD CONSTRAINT "PlanFeature_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserPlan" ADD CONSTRAINT "UserPlan_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserPlan" ADD CONSTRAINT "UserPlan_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserPlan" ADD CONSTRAINT "UserPlan_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "public"."Discount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

