-- CreateEnum
CREATE TYPE "public"."ChatSender" AS ENUM ('USER', 'AI');

-- CreateTable
CREATE TABLE "public"."ChatSession" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "blog_id" TEXT,
    "course_id" TEXT,
    "chapter_topic_id" TEXT,
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
