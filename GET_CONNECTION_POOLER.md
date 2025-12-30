# Get Connection Pooler String

Since direct connection (port 5432) isn't working, let's use the connection pooler (port 6543).

## Steps:

1. **Go to Supabase**: https://hwzcxcyfizrvgkaghmjx.supabase.co
2. **Settings** → **Database**
3. **Scroll to "Connection pooling"** section
4. **Copy the connection string** (it will have port 6543)
5. **It should look like:**
   ```
   postgresql://postgres.hwzcxcyfizrvgkaghmjx:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
6. **Replace [PASSWORD] with your password** (DavidoAgu%40200 - URL encoded)

## Or Try This:

The pooler connection string format is usually:
```
postgresql://postgres.hwzcxcyfizrvgkaghmjx:DavidoAgu%40200@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require
```

But we need the exact region. Can you:
1. Go to Settings → Database → Connection pooling
2. Copy the exact connection string shown there
3. Share it with me

The pooler usually works better for external connections!

