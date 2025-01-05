-- DropIndex
DROP INDEX "Subscription_name_key";

-- CreateTable
CREATE TABLE "activity" (
    "id" TEXT NOT NULL,
    "upload" INTEGER NOT NULL,
    "download" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "activity_userId_key" ON "activity"("userId");
