-- AlterTable
ALTER TABLE "MaintenanceLog" ADD COLUMN "files" TEXT;

-- AlterTable
ALTER TABLE "Member" ADD COLUMN "photo" TEXT;

-- AlterTable
ALTER TABLE "MemberFee" ADD COLUMN "receipt" TEXT;

-- AlterTable
ALTER TABLE "MemberSocialFee" ADD COLUMN "receipt" TEXT;

-- CreateTable
CREATE TABLE "UploadedFile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "originalName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "module" TEXT NOT NULL,
    "refId" INTEGER,
    "url" TEXT NOT NULL,
    "uploadedById" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UploadedFile_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
