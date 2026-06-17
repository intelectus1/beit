-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable: add column nullable first, backfill existing rows as ACCEPTED, then enforce NOT NULL
ALTER TABLE "Enrollment" ADD COLUMN "status" "EnrollmentStatus";
UPDATE "Enrollment" SET "status" = 'ACCEPTED';
ALTER TABLE "Enrollment" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "Enrollment" ALTER COLUMN "status" SET DEFAULT 'PENDING';
