/*
  Warnings:

  - A unique constraint covering the columns `[userId,assetId,threatId]` on the table `submissions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "submissions_userId_assetId_threatId_key" ON "submissions"("userId", "assetId", "threatId");
