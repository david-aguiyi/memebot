# Database Setup Options

## Option 1: Install Docker (Recommended - Easiest)

1. **Install Docker Desktop:**
   - Download from: https://www.docker.com/products/docker-desktop/
   - Install and start Docker Desktop

2. **Start databases:**
   ```bash
   docker compose up -d postgres redis
   ```

3. **Wait 5-10 seconds, then run migrations:**
   ```bash
   npm run db:migrate
   npm run db:generate
   ```

4. **Add yourself as admin:**
   ```bash
   npm run setup-admin 7290497391 admin admin
   ```

## Option 2: Install PostgreSQL & Redis Locally

1. **Install PostgreSQL:**
   - Download from: https://www.postgresql.org/download/windows/
   - During installation, set password for `postgres` user
   - Create database: `createdb memebot`

2. **Install Redis:**
   - Download from: https://github.com/microsoftarchive/redis/releases
   - Or use WSL: `wsl --install` then `sudo apt-get install redis`

3. **Update `.env` with your local credentials:**
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/memebot?schema=public
   REDIS_URL=redis://localhost:6379
   ```

4. **Run migrations:**
   ```bash
   npm run db:migrate
   npm run db:generate
   ```

5. **Add yourself as admin:**
   ```bash
   npm run setup-admin 7290497391 admin admin
   ```

## Option 3: Auto-Create Admin (Easiest if DB is set up)

If your database is already set up, you can skip the admin setup script:

1. **Start the bot:**
   ```bash
   npm run dev
   ```

2. **Send `/start` to your bot on Telegram**
   - The bot will automatically create your admin record!

## Your Telegram User ID

Your user ID is already configured: **7290497391**

Once the database is set up, you can either:
- Use the script: `npm run setup-admin 7290497391 admin admin`
- Or just send `/start` to the bot (it will auto-create you as admin)

## Quick Check

To verify your database is working:
```bash
npm run db:studio
```
This opens Prisma Studio where you can see your database tables.



