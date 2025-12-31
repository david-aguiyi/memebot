# Supabase Table Editor Setup - Step by Step

## Overview
We'll create 6 tables using Supabase's visual Table Editor. This is easier than SQL!

## Table Order (Important!)
Create tables in this order because of foreign key relationships:
1. `projects` (no dependencies)
2. `admins` (no dependencies) 
3. `context_layers` (needs projects)
4. `post_suggestions` (needs projects and context_layers)
5. `posts` (needs projects, context_layers, and post_suggestions)
6. `audit_logs` (needs admins)

---

## Step 1: Create `projects` Table

1. Go to Supabase dashboard → **Table Editor**
2. Click **"New table"** button
3. **Table name**: `projects`
4. **Add columns** (click "Add column" for each):

   | Column Name | Type | Default | Nullable | Primary Key |
   |------------|------|---------|----------|-------------|
   | `id` | `text` | `gen_random_uuid()::text` | ❌ No | ✅ Yes |
   | `name` | `varchar` (255) | - | ❌ No | ❌ No |
   | `baseDescription` | `text` | - | ❌ No | ❌ No |
   | `personaConfig` | `jsonb` | - | ✅ Yes | ❌ No |
   | `postingEnabled` | `bool` | `false` | ❌ No | ❌ No |
   | `createdAt` | `timestamptz` | `now()` | ❌ No | ❌ No |
   | `updatedAt` | `timestamptz` | `now()` | ❌ No | ❌ No |

5. Click **"Save"** button

---

## Step 2: Create `admins` Table

1. Click **"New table"**
2. **Table name**: `admins`
3. **Add columns**:

   | Column Name | Type | Default | Nullable | Primary Key |
   |------------|------|---------|----------|-------------|
   | `telegramUserId` | `int8` (bigint) | - | ❌ No | ✅ Yes |
   | `username` | `varchar` (255) | - | ✅ Yes | ❌ No |
   | `role` | `varchar` (50) | `'admin'` | ❌ No | ❌ No |
   | `isActive` | `bool` | `true` | ❌ No | ❌ No |
   | `createdAt` | `timestamptz` | `now()` | ❌ No | ❌ No |

4. Click **"Save"**
5. **Add your admin account**:
   - Click **"Insert row"** button
   - Fill in:
     - `telegramUserId`: `7290497391`
     - `username`: `admin`
     - `role`: `admin`
     - `isActive`: `true` (checkbox)
   - Click **"Save"**

---

## Step 3: Create `context_layers` Table

1. Click **"New table"**
2. **Table name**: `context_layers`
3. **Add columns**:

   | Column Name | Type | Default | Nullable | Primary Key |
   |------------|------|---------|----------|-------------|
   | `id` | `text` | `gen_random_uuid()::text` | ❌ No | ✅ Yes |
   | `projectId` | `text` | - | ❌ No | ❌ No |
   | `version` | `int4` | - | ❌ No | ❌ No |
   | `content` | `text` | - | ❌ No | ❌ No |
   | `metadata` | `jsonb` | - | ✅ Yes | ❌ No |
   | `status` | `varchar` (50) | `'pending'` | ❌ No | ❌ No |
   | `approvedBy` | `int8` | - | ✅ Yes | ❌ No |
   | `approvedAt` | `timestamptz` | - | ✅ Yes | ❌ No |
   | `createdAt` | `timestamptz` | `now()` | ❌ No | ❌ No |

4. **Add Foreign Key**:
   - Find `projectId` column
   - Click on it → **"Add foreign key"** or look for Foreign Key section
   - Reference table: `projects`
   - Reference column: `id`
   - On delete: `Cascade`

5. **Add Unique Constraint**:
   - Go to table settings or constraints section
   - Add unique constraint on: `projectId` + `version` together

6. Click **"Save"**

---

## Step 4: Create `post_suggestions` Table

1. Click **"New table"**
2. **Table name**: `post_suggestions`
3. **Add columns**:

   | Column Name | Type | Default | Nullable | Primary Key |
   |------------|------|---------|----------|-------------|
   | `id` | `text` | `gen_random_uuid()::text` | ❌ No | ✅ Yes |
   | `projectId` | `text` | - | ❌ No | ❌ No |
   | `contextVersion` | `int4` | - | ❌ No | ❌ No |
   | `content` | `text` | - | ❌ No | ❌ No |
   | `variants` | `jsonb` | - | ✅ Yes | ❌ No |
   | `status` | `varchar` (50) | `'pending'` | ❌ No | ❌ No |
   | `approvedBy` | `int8` | - | ✅ Yes | ❌ No |
   | `createdAt` | `timestamptz` | `now()` | ❌ No | ❌ No |
   | `approvedAt` | `timestamptz` | - | ✅ Yes | ❌ No |

4. **Add Foreign Keys**:
   - `projectId` → `projects.id` (Cascade delete)
   - For `contextVersion`, you may need to add a composite foreign key to `context_layers(projectId, version)` - if the UI doesn't support this easily, we can add it later via SQL

5. Click **"Save"**

---

## Step 5: Create `posts` Table

1. Click **"New table"**
2. **Table name**: `posts`
3. **Add columns**:

   | Column Name | Type | Default | Nullable | Primary Key |
   |------------|------|---------|----------|-------------|
   | `id` | `text` | `gen_random_uuid()::text` | ❌ No | ✅ Yes |
   | `projectId` | `text` | - | ❌ No | ❌ No |
   | `contextVersion` | `int4` | - | ❌ No | ❌ No |
   | `suggestionId` | `text` | - | ✅ Yes | ❌ No |
   | `xTweetId` | `varchar` (50) | - | ✅ Yes | ❌ No |
   | `content` | `text` | - | ❌ No | ❌ No |
   | `status` | `varchar` (50) | `'posted'` | ❌ No | ❌ No |
   | `postedAt` | `timestamptz` | - | ✅ Yes | ❌ No |
   | `createdAt` | `timestamptz` | `now()` | ❌ No | ❌ No |

4. **Add Foreign Keys**:
   - `projectId` → `projects.id` (Cascade delete)
   - `suggestionId` → `post_suggestions.id` (Set null on delete)

5. **Add Unique Constraint**:
   - Make `xTweetId` unique (if not already)

6. Click **"Save"**

---

## Step 6: Create `audit_logs` Table

1. Click **"New table"**
2. **Table name**: `audit_logs`
3. **Add columns**:

   | Column Name | Type | Default | Nullable | Primary Key |
   |------------|------|---------|----------|-------------|
   | `id` | `text` | `gen_random_uuid()::text` | ❌ No | ✅ Yes |
   | `adminId` | `int8` | - | ❌ No | ❌ No |
   | `actionType` | `varchar` (100) | - | ❌ No | ❌ No |
   | `actionData` | `jsonb` | - | ✅ Yes | ❌ No |
   | `resourceType` | `varchar` (50) | - | ✅ Yes | ❌ No |
   | `resourceId` | `text` | - | ✅ Yes | ❌ No |
   | `createdAt` | `timestamptz` | `now()` | ❌ No | ❌ No |

4. **Add Foreign Key**:
   - `adminId` → `admins.telegramUserId`

5. Click **"Save"**

---

## ✅ After Creating All Tables

Once all 6 tables are created:

1. **Verify** you can see all tables in Table Editor
2. **Check** that your admin account exists in `admins` table (telegramUserId: 7290497391)
3. **Let me know** and I'll:
   - Mark Prisma migrations as complete
   - Generate Prisma client
   - Test the connection
   - Start the bot!

## Tips:

- If you can't find "Add foreign key" option, you can add it later via SQL
- Default values: Type them exactly as shown (e.g., `'pending'` with quotes for text)
- For `gen_random_uuid()::text`, you might need to use just `uuid_generate_v4()::text` or Supabase's UI might have a UUID option
- If something doesn't work, create the table without that feature and we can add it via SQL later

**Start with Step 1 and let me know when you've created the first table!**


