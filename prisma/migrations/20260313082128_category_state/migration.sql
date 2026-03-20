/*
  Warnings:

  - Added the required column `state` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CategoryState" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "state" "CategoryState" NOT NULL;
