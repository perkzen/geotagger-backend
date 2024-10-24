/*
  Warnings:

  - Added the required column `address` to the `guess` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "guess" ADD COLUMN     "address" TEXT NOT NULL;
