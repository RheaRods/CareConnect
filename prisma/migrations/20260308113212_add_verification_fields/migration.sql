-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Caretaker" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "bio" TEXT,
    "hourlyRate" REAL NOT NULL,
    "availability" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "documents" TEXT,
    "certifications" TEXT,
    "verifiedAt" DATETIME,
    "verifiedBy" INTEGER,
    CONSTRAINT "Caretaker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Caretaker" ("availability", "bio", "createdAt", "hourlyRate", "id", "updatedAt", "userId") SELECT "availability", "bio", "createdAt", "hourlyRate", "id", "updatedAt", "userId" FROM "Caretaker";
DROP TABLE "Caretaker";
ALTER TABLE "new_Caretaker" RENAME TO "Caretaker";
CREATE UNIQUE INDEX "Caretaker_userId_key" ON "Caretaker"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
