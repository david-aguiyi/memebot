# How to Get Your Supabase Database Password

## Quick Steps:

1. **Go to your Supabase project**: https://hwzcxcyfizrvgkaghmjx.supabase.co
2. **Click Settings** (gear icon) in the left sidebar
3. **Click "Database"** in the settings menu
4. **Scroll down to "Connection string"** section
5. **Click the "URI" tab**
6. **You'll see a connection string like:**
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.hwzcxcyfizrvgkaghmjx.supabase.co:5432/postgres
   ```
7. **Copy the password** (the part between `postgres:` and `@`)

## Alternative: Reset Password

If you forgot your password:

1. Go to **Settings** → **Database**
2. Scroll to **Database password** section
3. Click **"Reset database password"**
4. Copy the new password
5. Update your `.env` file

## Once You Have the Password:

Share it with me and I'll update your `.env` file, or update it yourself:

In your `.env` file, replace `[YOUR-PASSWORD]` in this line:
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.hwzcxcyfizrvgkaghmjx.supabase.co:5432/postgres?sslmode=require
```

Then we can run the migrations!

