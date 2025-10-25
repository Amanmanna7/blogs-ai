-- CreateTable
CREATE TABLE "public"."AssessmentFeedback" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "raw_response" JSONB NOT NULL,
    "overall_summary" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "AssessmentFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentFeedback_assessment_id_key" ON "public"."AssessmentFeedback"("assessment_id");

-- AddForeignKey
ALTER TABLE "public"."AssessmentFeedback" ADD CONSTRAINT "AssessmentFeedback_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
