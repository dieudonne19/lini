-- AlterTable
ALTER TABLE "Family" ADD COLUMN     "recoveryCodeHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Family_recoveryCodeHash_key" ON "Family"("recoveryCodeHash");
