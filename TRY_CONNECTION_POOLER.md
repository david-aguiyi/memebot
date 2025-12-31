# Try Connection Pooler Instead

Your VPN (ProtonVPN) might be blocking port 5432. Let's try the connection pooler which uses port 6543.

## Steps:

1. **Go to Supabase dashboard**: https://hwzcxcyfizrvgkaghmjx.supabase.co
2. **Settings** → **Database**
3. **Scroll to "Connection pooling"** section
4. **Copy the connection string** (it will have port 6543 and look different)
5. **Paste it here** - I'll update your .env

The connection pooler string usually looks like:
```
postgresql://postgres.hwzcxcyfizrvgkaghmjx:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require
```

## Alternative: Disable VPN Temporarily

If the pooler doesn't work, try:
1. Disconnect ProtonVPN temporarily
2. Run the migration again
3. Reconnect VPN after setup

## Or: Use Supabase SQL Editor

We can also create the tables manually using Supabase's SQL Editor if connection keeps failing.

Let me know which connection pooler string you get!


