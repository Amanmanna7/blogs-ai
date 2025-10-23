/*
  Warnings:

  - You are about to drop the column `payment_details` on the `UserPlan` table. All the data in the column will be lost.
  - You are about to drop the column `payment_id` on the `UserPlan` table. All the data in the column will be lost.
  - Added the required column `order_id` to the `UserPlan` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED');

-- AlterTable
ALTER TABLE "public"."UserPlan" DROP COLUMN "payment_details",
DROP COLUMN "payment_id",
ADD COLUMN     "order_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."UserPlanPayment" (
    "id" TEXT NOT NULL,
    "user_plan_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_details" JSONB,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "UserPlanPayment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."UserPlanPayment" ADD CONSTRAINT "UserPlanPayment_user_plan_id_fkey" FOREIGN KEY ("user_plan_id") REFERENCES "public"."UserPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
