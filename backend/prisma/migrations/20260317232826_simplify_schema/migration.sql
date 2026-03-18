/*
  Warnings:

  - The values [ORG_REQUEST_SUBMITTED,ORG_REQUEST_APPROVED,ORG_REQUEST_REJECTED] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - The values [ORG_ADMIN] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `organization_id` on the `events` table. All the data in the column will be lost.
  - You are about to drop the `organization_members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `organization_requests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `organizations` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `organizer_id` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('BOOKING_CONFIRMED', 'BOOKING_CANCELLED', 'EVENT_PUBLISHED', 'EVENT_CANCELLED', 'GENERAL');
ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('USER', 'SUPER_ADMIN');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "organization_members" DROP CONSTRAINT "organization_members_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "organization_members" DROP CONSTRAINT "organization_members_user_id_fkey";

-- DropForeignKey
ALTER TABLE "organization_requests" DROP CONSTRAINT "organization_requests_requested_by_id_fkey";

-- DropForeignKey
ALTER TABLE "organization_requests" DROP CONSTRAINT "organization_requests_reviewed_by_id_fkey";

-- DropForeignKey
ALTER TABLE "organizations" DROP CONSTRAINT "organizations_request_id_fkey";

-- DropIndex
DROP INDEX "events_organization_id_idx";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "organization_id",
ADD COLUMN     "organizer_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_organizer" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "organization_members";

-- DropTable
DROP TABLE "organization_requests";

-- DropTable
DROP TABLE "organizations";

-- DropEnum
DROP TYPE "OrgMemberRole";

-- DropEnum
DROP TYPE "OrgRequestStatus";

-- CreateIndex
CREATE INDEX "event_chat_messages_user_id_idx" ON "event_chat_messages"("user_id");

-- CreateIndex
CREATE INDEX "events_organizer_id_idx" ON "events"("organizer_id");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_chat_messages" ADD CONSTRAINT "event_chat_messages_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_chat_messages" ADD CONSTRAINT "event_chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
