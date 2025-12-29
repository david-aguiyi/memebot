# Supabase Setup Guide - Step by Step

## Step 1: Create Supabase Account & Project

1. Go to https://supabase.com
2. Click **"Start your project"** or **"Sign up"**
3. Sign up with GitHub, Google, or email (free)
4. Click **"New Project"**
5. Fill in:
   - **Name**: memebot (or any name)
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free
6. Click **"Create new project"**
7. Wait 2-3 minutes for project to be created

## Step 2: Get Database Connection String

1. In your Supabase project dashboard, click **Settings** (gear icon) in the left sidebar
2. Click **Database** in the settings menu
3. Scroll down to **Connection string** section
4. Find **URI** tab
5. Copy the connection string (it looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
6. **Important**: Replace `[YOUR-PASSWORD]` with the password you created in Step 1

## Step 3: Get Redis (Upstash - Free)

1. Go to https://upstash.com
2. Click **"Sign Up"** (free)
3. Sign up with GitHub or email
4. Click **"Create Database"**
5. Choose:
   - **Name**: memebot-redis
   - **Type**: Regional
   - **Region**: Choose closest to you
   - **Tier**: Free
6. Click **"Create"**
7. Copy the **REST URL** (it looks like: `redis://default:xxx@xxx.upstash.io:6379`)

## Step 4: Update Your .env File

Update your `.env` file with:

```env
# Database - Replace with your Supabase connection string
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres?sslmode=require

# Redis - Replace with your Upstash connection string
REDIS_URL=redis://default:xxx@xxx.upstash.io:6379
```

**Important**: 
- Replace `YOUR_PASSWORD` with your actual Supabase database password
- Replace the entire connection strings with your actual ones from Supabase and Upstash

## Step 5: Run Database Migrations

Once your `.env` is updated, run:

```bash
npm run db:migrate
npm run db:generate
```

## Step 6: Add Yourself as Admin

```bash
npm run setup-admin 7290497391 admin admin
```

## Step 7: Start the Bot!

```bash
npm run dev
```

## Troubleshooting

### Connection Error?
- Make sure you replaced `[YOUR-PASSWORD]` in the connection string
- Check that your Supabase project is fully created (green status)
- Verify the connection string is correct

### Migration Errors?
- Make sure DATABASE_URL is correct
- Check that SSL mode is set: `?sslmode=require`
- Try the connection string from Supabase dashboard again

### Need Help?
- Supabase Docs: https://supabase.com/docs
- Check your Supabase project dashboard for connection details

## What You'll Have

✅ Free PostgreSQL database (500MB)  
✅ Free Redis cache (10K commands/day)  
✅ Accessible from anywhere  
✅ No Docker needed  
✅ Ready to use!

