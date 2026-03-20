-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'NEW', 'INACTIVE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';
