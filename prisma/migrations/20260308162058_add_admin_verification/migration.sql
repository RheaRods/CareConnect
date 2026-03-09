/*
  Warnings:

  - You are about to drop the column `verifiedBy` on the `Caretaker` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Caretaker" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "bio" TEXT,
    "hourlyRate" REAL NOT NULL DEFAULT 0,
    "availability" TEXT NOT NULL DEFAULT 'flexible',
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "documents" TEXT,
    "certifications" TEXT,
    "verifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Caretaker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Caretaker" ("availability", "bio", "certifications", "createdAt", "documents", "hourlyRate", "id", "updatedAt", "userId", "verificationStatus", "verifiedAt") SELECT "availability", "bio", "certifications", "createdAt", "documents", "hourlyRate", "id", "updatedAt", "userId", "verificationStatus", "verifiedAt" FROM "Caretaker";
DROP TABLE "Caretaker";
ALTER TABLE "new_Caretaker" RENAME TO "Caretaker";
CREATE UNIQUE INDEX "Caretaker_userId_key" ON "Caretaker"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
