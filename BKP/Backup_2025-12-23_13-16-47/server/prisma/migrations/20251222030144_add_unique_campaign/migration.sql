/*
  Warnings:

  - A unique constraint covering the columns `[integrationId,externalId]` on the table `Campaign` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Campaign_integrationId_externalId_key" ON "Campaign"("integrationId", "externalId");
