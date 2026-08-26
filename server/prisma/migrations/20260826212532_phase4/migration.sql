-- CreateEnum
CREATE TYPE "PartyType" AS ENUM ('Customer', 'Supplier');

-- CreateTable
CREATE TABLE "Party" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PartyType" NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "state" TEXT NOT NULL,
    "gstin" TEXT,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Party_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Party_gstin_key" ON "Party"("gstin");
