-- 1. Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Tables

-- User Table
CREATE TABLE "User" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "role" TEXT DEFAULT 'USER',
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" TIMESTAMP(3),
    "status" TEXT DEFAULT 'ACTIVE',
    "apiKey" TEXT UNIQUE
);

-- Settings Table
CREATE TABLE "Settings" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL UNIQUE,
    "usageLimits" TEXT,
    "trafficAlerts" TEXT,
    "notifications" TEXT,
    "dashboardView" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Lead Table
CREATE TABLE "Lead" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "status" TEXT DEFAULT 'NEW',
    "source" TEXT,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Lead_userId_idx" ON "Lead"("userId");
CREATE INDEX "Lead_email_idx" ON "Lead"("email");

-- Interaction Table
CREATE TABLE "Interaction" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "leadId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "notes" TEXT,
    "date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    CONSTRAINT "Interaction_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Integration Table
CREATE TABLE "Integration" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "platform" TEXT NOT NULL,
    "accessToken" TEXT,
    "encryptedKey" TEXT,
    "iv" TEXT,
    "refreshToken" TEXT,
    "status" TEXT DEFAULT 'DISCONNECTED',
    "lastSync" TIMESTAMP(3),
    "errorLog" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Integration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- OnboardingStatus Table
CREATE TABLE "OnboardingStatus" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL UNIQUE,
    "stripe" TEXT DEFAULT 'PENDING',
    "openai" TEXT DEFAULT 'PENDING',
    "googleAds" TEXT DEFAULT 'PENDING',
    "completed" BOOLEAN DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OnboardingStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Campaign Table
CREATE TABLE "Campaign" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "integrationId" UUID NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Campaign_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Campaign_integrationId_externalId_key" ON "Campaign"("integrationId", "externalId");

-- DailyMetric Table
CREATE TABLE "DailyMetric" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "campaignId" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "spend" DOUBLE PRECISION NOT NULL,
    "leads" INTEGER NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL,
    "impressions" INTEGER NOT NULL,
    "clicks" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailyMetric_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "DailyMetric_campaignId_date_key" ON "DailyMetric"("campaignId", "date");

-- Api Table
CREATE TABLE "Api" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "endpoint" TEXT NOT NULL UNIQUE,
    "method" TEXT NOT NULL,
    "description" TEXT,
    "rateLimit" INTEGER DEFAULT 100,
    "status" TEXT DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- TrafficMetric Table
CREATE TABLE "TrafficMetric" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "apiId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "timestamp" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "status" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "size" INTEGER NOT NULL,
    "ip" TEXT NOT NULL,
    CONSTRAINT "TrafficMetric_apiId_fkey" FOREIGN KEY ("apiId") REFERENCES "Api"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TrafficMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "TrafficMetric_apiId_idx" ON "TrafficMetric"("apiId");
CREATE INDEX "TrafficMetric_userId_idx" ON "TrafficMetric"("userId");
CREATE INDEX "TrafficMetric_timestamp_idx" ON "TrafficMetric"("timestamp");
CREATE INDEX "TrafficMetric_status_idx" ON "TrafficMetric"("status");

-- Tokens Tables
CREATE TABLE "RefreshToken" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "token" TEXT NOT NULL UNIQUE,
    "userId" UUID NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "revoked" BOOLEAN DEFAULT false,
    CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "PasswordResetToken" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "token" TEXT NOT NULL UNIQUE,
    "userId" UUID NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "EmailVerificationToken" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "token" TEXT NOT NULL UNIQUE,
    "userId" UUID NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 3. Populate Sample Data

-- Insert Test User (Password: password123)
-- Note: Hash should be generated by your backend bcrypt, this is a placeholder
INSERT INTO "User" ("id", "email", "password", "name", "role", "status", "apiKey")
VALUES (
    gen_random_uuid(), 
    'test@hexa.com', 
    '$2a$10$w.2Z0pQLu9.7.1.1.1.1.1.1.1.1.1.1.1.1.1', 
    'Test User', 
    'ADMIN', 
    'ACTIVE', 
    'mock-api-key-123'
) ON CONFLICT ("email") DO NOTHING;

-- Insert Sample Integration for the Test User
WITH user_row AS (SELECT id FROM "User" WHERE email = 'test@hexa.com' LIMIT 1)
INSERT INTO "Integration" ("userId", "platform", "status", "lastSync")
SELECT id, 'FACEBOOK', 'CONNECTED', NOW() FROM user_row;
