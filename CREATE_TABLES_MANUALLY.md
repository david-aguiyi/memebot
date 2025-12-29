# Create Tables Manually in Supabase Table Editor

If SQL Editor isn't working, let's create tables using the visual Table Editor. It's actually easier!

## Step 1: Create Projects Table

1. Go to Supabase dashboard → **Table Editor**
2. Click **"New table"**
3. Name: `projects`
4. Add columns:
   - `id` - Text, Primary Key, Default: `gen_random_uuid()`
   - `name` - Text (Varchar 255), Not Null
   - `baseDescription` - Text, Not Null
   - `personaConfig` - JSONB
   - `postingEnabled` - Boolean, Default: false
   - `createdAt` - Timestamp, Default: now()
   - `updatedAt` - Timestamp, Default: now()
5. Click **"Save"**

## Step 2: Create Context Layers Table

1. Click **"New table"**
2. Name: `context_layers`
3. Add columns:
   - `id` - Text, Primary Key, Default: `gen_random_uuid()`
   - `projectId` - Text, Foreign Key → `projects.id` (Cascade delete)
   - `version` - Integer, Not Null
   - `content` - Text, Not Null
   - `metadata` - JSONB
   - `status` - Text (Varchar 50), Default: 'pending'
   - `approvedBy` - Bigint
   - `approvedAt` - Timestamp
   - `createdAt` - Timestamp, Default: now()
4. Add unique constraint: `projectId` + `version` together
5. Click **"Save"**

## Step 3: Create Post Suggestions Table

1. Click **"New table"**
2. Name: `post_suggestions`
3. Add columns:
   - `id` - Text, Primary Key, Default: `gen_random_uuid()`
   - `projectId` - Text, Foreign Key → `projects.id` (Cascade delete)
   - `contextVersion` - Integer, Not Null
   - `content` - Text, Not Null
   - `variants` - JSONB
   - `status` - Text (Varchar 50), Default: 'pending'
   - `approvedBy` - Bigint
   - `createdAt` - Timestamp, Default: now()
   - `approvedAt` - Timestamp
4. Click **"Save"**

## Step 4: Create Posts Table

1. Click **"New table"**
2. Name: `posts`
3. Add columns:
   - `id` - Text, Primary Key, Default: `gen_random_uuid()`
   - `projectId` - Text, Foreign Key → `projects.id` (Cascade delete)
   - `contextVersion` - Integer, Not Null
   - `suggestionId` - Text, Foreign Key → `post_suggestions.id` (Set null on delete)
   - `xTweetId` - Text (Varchar 50), Unique
   - `content` - Text, Not Null
   - `status` - Text (Varchar 50), Default: 'posted'
   - `postedAt` - Timestamp
   - `createdAt` - Timestamp, Default: now()
4. Click **"Save"**

## Step 5: Create Admins Table

1. Click **"New table"**
2. Name: `admins`
3. Add columns:
   - `telegramUserId` - Bigint, Primary Key
   - `username` - Text (Varchar 255)
   - `role` - Text (Varchar 50), Default: 'admin'
   - `isActive` - Boolean, Default: true
   - `createdAt` - Timestamp, Default: now()
4. Click **"Save"**
5. **Add your admin**: Click "Insert row", add:
   - `telegramUserId`: 7290497391
   - `username`: admin
   - `role`: admin
   - `isActive`: true

## Step 6: Create Audit Logs Table

1. Click **"New table"**
2. Name: `audit_logs`
3. Add columns:
   - `id` - Text, Primary Key, Default: `gen_random_uuid()`
   - `adminId` - Bigint, Foreign Key → `admins.telegramUserId`
   - `actionType` - Text (Varchar 100), Not Null
   - `actionData` - JSONB
   - `resourceType` - Text (Varchar 50)
   - `resourceId` - Text
   - `createdAt` - Timestamp, Default: now()
4. Click **"Save"**

## After Creating Tables:

Once all tables are created, we can:
1. Skip Prisma migrations (tables already exist)
2. Generate Prisma client
3. Start the bot!

This method is visual and easier than SQL. Let me know when you've created the tables!

