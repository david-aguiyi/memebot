# Fix Database Connection - Use Connection Pooler

The bot is running but can't connect to the database. We need to use Supabase's **connection pooler** (port 6543) instead of direct connection (port 5432).

## Current Status:
✅ Bot is running
✅ Telegram bot started
✅ X API in simulation mode
❌ Database connection failing (port 5432 blocked)

## Solution: Get Connection Pooler String

### Step 1: Get Pooler Connection String

1. Go to: https://hwzcxcyfizrvgkaghmjx.supabase.co
2. Click **Settings** → **Database**
3. Scroll to **"Connection pooling"** section
4. You'll see connection strings - copy the one that says **"Session mode"** or **"Transaction mode"**
5. It will look like:
   ```
   postgresql://postgres.hwzcxcyfizrvgkaghmjx:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

### Step 2: Update .env

Replace the DATABASE_URL in your `.env` file with the pooler connection string.

**Important**: Replace `[PASSWORD]` with your password, but URL-encode the `@` symbol:
- Password: `DavidoAgu@200`
- URL-encoded: `DavidoAgu%40200`

So it should be:
```
DATABASE_URL=postgresql://postgres.hwzcxcyfizrvgkaghmjx:DavidoAgu%40200@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require
```

### Step 3: Restart Bot

After updating `.env`:
1. Stop the bot (Ctrl+C in the terminal)
2. Run: `npm run dev`
3. Check if database connects

## Quick Test

The pooler connection string should have:
- Port **6543** (not 5432)
- Hostname like `aws-0-[region].pooler.supabase.com`
- Format: `postgres.hwzcxcyfizrvgkaghmjx` (with project ref)

**Share the connection pooler string you see, and I'll update your .env file!**


