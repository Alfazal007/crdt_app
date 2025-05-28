/*
  Warnings:

  - A unique constraint covering the columns `[nameOfDocument]` on the table `Document` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nameOfDocument` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "nameOfDocument" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Document_nameOfDocument_key" ON "Document"("nameOfDocument");
