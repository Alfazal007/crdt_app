/*
  Warnings:

  - The primary key for the `Access` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Document` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Document` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `documentId` on the `Access` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Access" DROP CONSTRAINT "Access_documentId_fkey";

-- AlterTable
ALTER TABLE "Access" DROP CONSTRAINT "Access_pkey",
DROP COLUMN "documentId",
ADD COLUMN     "documentId" INTEGER NOT NULL,
ADD CONSTRAINT "Access_pkey" PRIMARY KEY ("creatorId", "documentId");

-- AlterTable
ALTER TABLE "Document" DROP CONSTRAINT "Document_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Document_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "Access_creatorId_documentId_idx" ON "Access"("creatorId", "documentId");

-- CreateIndex
CREATE INDEX "Document_id_idx" ON "Document"("id");

-- AddForeignKey
ALTER TABLE "Access" ADD CONSTRAINT "Access_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
