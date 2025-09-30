-- CreateTable
CREATE TABLE "public"."BlogProgress" (
    "id" TEXT NOT NULL,
    "blog_id" TEXT NOT NULL,
    "chapter_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'started',
    "completed_at" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "BlogProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChapterProgress" (
    "id" TEXT NOT NULL,
    "chapter_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'started',
    "completed_at" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "ChapterProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CourseProgress" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'started',
    "completed_at" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "CourseProgress_pkey" PRIMARY KEY ("id")
);

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
