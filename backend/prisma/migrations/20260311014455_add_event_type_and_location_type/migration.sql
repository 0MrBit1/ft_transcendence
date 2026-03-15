-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('ONLINE', 'PHYSICAL');

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "location_type" "LocationType" NOT NULL DEFAULT 'PHYSICAL',
ADD COLUMN     "type" "EventType" NOT NULL DEFAULT 'PUBLIC',
ALTER COLUMN "capacity" DROP NOT NULL,
ALTER COLUMN "remaining_capacity" DROP NOT NULL;
