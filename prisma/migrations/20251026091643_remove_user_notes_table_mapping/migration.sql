/*
  Warnings:

  - You are about to drop the `user_notes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."user_notes" DROP CONSTRAINT "user_notes_user_id_fkey";

-- DropTable
DROP TABLE "public"."user_notes";

-- CreateTable
CREATE TABLE "public"."UserNote" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "note_title" TEXT NOT NULL,
    "note_content" TEXT NOT NULL,
    "status" "public"."NoteStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_opened_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "UserNote_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."UserNote" ADD CONSTRAINT "UserNote_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
