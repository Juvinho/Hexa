-- CreateTable
CREATE TABLE "Api" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "description" TEXT,
    "rateLimit" INTEGER NOT NULL DEFAULT 100,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TrafficMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "apiId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "size" INTEGER NOT NULL,
    "ip" TEXT NOT NULL,
    CONSTRAINT "TrafficMetric_apiId_fkey" FOREIGN KEY ("apiId") REFERENCES "Api" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TrafficMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "usageLimits" TEXT,
    "trafficAlerts" TEXT,
    "notifications" TEXT,
    "dashboardView" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "emailVerified" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastLogin" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "apiKey" TEXT
);
INSERT INTO "new_User" ("createdAt", "email", "emailVerified", "id", "name", "password", "role", "updatedAt") SELECT "createdAt", "email", "emailVerified", "id", "name", "password", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_apiKey_key" ON "User"("apiKey");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Api_endpoint_key" ON "Api"("endpoint");

-- CreateIndex
CREATE INDEX "TrafficMetric_apiId_idx" ON "TrafficMetric"("apiId");

-- CreateIndex
CREATE INDEX "TrafficMetric_userId_idx" ON "TrafficMetric"("userId");

-- CreateIndex
CREATE INDEX "TrafficMetric_timestamp_idx" ON "TrafficMetric"("timestamp");

-- CreateIndex
CREATE INDEX "TrafficMetric_status_idx" ON "TrafficMetric"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_userId_key" ON "Settings"("userId");
