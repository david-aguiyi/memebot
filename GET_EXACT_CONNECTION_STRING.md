# Get Exact Supabase Connection String

The connection is failing. Let's get the exact connection string from Supabase.

## Steps:

1. **Go to your Supabase project**: https://hwzcxcyfizrvgkaghmjx.supabase.co
2. **Click Settings** (gear icon) → **Database**
3. **Scroll to "Connection string"** section
4. **Click the "URI" tab** (not Session mode or Transaction mode)
5. **You'll see something like:**
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
   OR
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

6. **Copy the ENTIRE connection string** (it should already have your password in it)

7. **Paste it here** - I'll update your .env file

## Important Notes:

- Make sure you're copying from the **URI** tab
- The connection string should already include your password
- If it shows `[YOUR-PASSWORD]`, you need to replace it with: `DavidoAgu%40200` (URL-encoded)
- Or use the "Reset database password" option to get a new password without special characters

## Alternative: Use Connection Pooler

Supabase also provides a connection pooler which might work better. Try:
- **Settings** → **Database** → **Connection string**
- Look for **"Connection pooling"** section
- Copy that connection string instead

Share the exact connection string you see, and I'll update everything!

