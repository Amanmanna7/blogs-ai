-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('USER', 'ADMIN', 'MODERATOR', 'EDITOR', 'AUTHOR');

-- CreateEnum
CREATE TYPE "public"."BlogStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."SubjectType" AS ENUM ('ACADEMIC', 'TECHNICAL', 'CREATIVE', 'BUSINESS', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."MediaType" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'OTHER');

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
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChapterTopic" (
    "id" TEXT NOT NULL,
    "course_id" TEXT,
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

-- AddForeignKey
ALTER TABLE "public"."BlogContent" ADD CONSTRAINT "BlogContent_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Blog" ADD CONSTRAINT "Blog_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChapterTopic" ADD CONSTRAINT "ChapterTopic_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
