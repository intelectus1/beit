-- AlterEnum: Add SUPER_ADMIN value to Role
ALTER TYPE "Role" ADD VALUE 'SUPER_ADMIN';

-- CreateEnum: UserStatus for teacher approval flow
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'PENDING_APPROVAL', 'REJECTED');

-- AlterTable: Add teamsLink to Course
ALTER TABLE "Course" ADD COLUMN "teamsLink" TEXT;

-- AlterTable: Add status to User (all existing users default to ACTIVE)
ALTER TABLE "User" ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';
