-- MemeBot Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE IF NOT EXISTS "projects" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" VARCHAR(255) NOT NULL,
    "baseDescription" TEXT NOT NULL,
    "personaConfig" JSONB,
    "postingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "projects_name_idx" ON "projects"("name");
CREATE INDEX IF NOT EXISTS "projects_postingEnabled_idx" ON "projects"("postingEnabled");

-- Context Layers table
CREATE TABLE IF NOT EXISTS "context_layers" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "projectId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "approvedBy" BIGINT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "context_layers_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "context_layers_projectId_version_key" ON "context_layers"("projectId", "version");
CREATE INDEX IF NOT EXISTS "context_layers_status_idx" ON "context_layers"("status");
CREATE INDEX IF NOT EXISTS "context_layers_createdAt_idx" ON "context_layers"("createdAt");

-- Post Suggestions table
CREATE TABLE IF NOT EXISTS "post_suggestions" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "projectId" TEXT NOT NULL,
    "contextVersion" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "variants" JSONB,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "approvedBy" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    CONSTRAINT "post_suggestions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_suggestions_projectId_contextVersion_fkey" FOREIGN KEY ("projectId", "contextVersion") REFERENCES "context_layers"("projectId", "version") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "post_suggestions_projectId_status_idx" ON "post_suggestions"("projectId", "status");
CREATE INDEX IF NOT EXISTS "post_suggestions_createdAt_idx" ON "post_suggestions"("createdAt");

-- Posts table
CREATE TABLE IF NOT EXISTS "posts" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "projectId" TEXT NOT NULL,
    "contextVersion" INTEGER NOT NULL,
    "suggestionId" TEXT,
    "xTweetId" VARCHAR(50) UNIQUE,
    "content" TEXT NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'posted',
    "postedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "posts_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "posts_projectId_contextVersion_fkey" FOREIGN KEY ("projectId", "contextVersion") REFERENCES "context_layers"("projectId", "version") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "posts_suggestionId_fkey" FOREIGN KEY ("suggestionId") REFERENCES "post_suggestions"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "posts_projectId_postedAt_idx" ON "posts"("projectId", "postedAt");
CREATE INDEX IF NOT EXISTS "posts_status_idx" ON "posts"("status");
CREATE UNIQUE INDEX IF NOT EXISTS "posts_xTweetId_key" ON "posts"("xTweetId");

-- Admins table
CREATE TABLE IF NOT EXISTS "admins" (
    "telegramUserId" BIGINT NOT NULL PRIMARY KEY,
    "username" VARCHAR(255),
    "role" VARCHAR(50) NOT NULL DEFAULT 'admin',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "admins_role_idx" ON "admins"("role");
CREATE INDEX IF NOT EXISTS "admins_isActive_idx" ON "admins"("isActive");

-- Audit Logs table
CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "adminId" BIGINT NOT NULL,
    "actionType" VARCHAR(100) NOT NULL,
    "actionData" JSONB,
    "resourceType" VARCHAR(50),
    "resourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("telegramUserId") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "audit_logs_adminId_createdAt_idx" ON "audit_logs"("adminId", "createdAt");
CREATE INDEX IF NOT EXISTS "audit_logs_resourceType_resourceId_idx" ON "audit_logs"("resourceType", "resourceId");
CREATE INDEX IF NOT EXISTS "audit_logs_actionType_idx" ON "audit_logs"("actionType");
CREATE INDEX IF NOT EXISTS "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- Insert your admin account
INSERT INTO "admins" ("telegramUserId", "username", "role", "isActive")
VALUES (7290497391, 'admin', 'admin', true)
ON CONFLICT ("telegramUserId") 
DO UPDATE SET 
    "username" = EXCLUDED."username",
    "role" = EXCLUDED."role",
    "isActive" = true;

-- Success message
SELECT 'Database schema created successfully! Admin account added.' as message;


