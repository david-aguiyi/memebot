# Docker Troubleshooting Guide

## Issue: "Docker Desktop is unable to start"

This usually means Docker Desktop isn't running or needs to be restarted.

## Quick Fix Steps:

### 1. Start Docker Desktop
- Open Docker Desktop application
- Wait for it to fully start (whale icon in system tray should be steady)
- Make sure it says "Docker Desktop is running"

### 2. If Docker Desktop Won't Start:

**Option A: Restart Docker Desktop**
- Right-click Docker Desktop icon in system tray
- Click "Restart"
- Wait for it to start

**Option B: Check WSL2 (Windows)**
- Docker Desktop requires WSL2 on Windows
- Open PowerShell as Administrator and run:
  ```powershell
  wsl --update
  wsl --set-default-version 2
  ```
- Restart your computer
- Try starting Docker Desktop again

**Option C: Reinstall Docker Desktop**
- Uninstall Docker Desktop
- Download fresh from: https://www.docker.com/products/docker-desktop/
- Install and restart computer

### 3. Verify Docker is Working

Once Docker Desktop is running, test it:
```powershell
docker --version
docker ps
```

Both commands should work without errors.

### 4. Then Try Database Setup Again

```powershell
docker compose up -d postgres redis
```

Wait 10-15 seconds, then:
```powershell
npm run db:migrate
npm run db:generate
npm run setup-admin 7290497391 admin admin
```

## Alternative: Use Cloud Database (No Docker Needed)

If Docker continues to have issues, you can use a free cloud database:

1. **Supabase** (Free tier): https://supabase.com
   - Create account
   - Create new project
   - Get connection string
   - Update `.env` with the connection string

2. **Railway** (Free tier): https://railway.app
   - Create account
   - Create PostgreSQL database
   - Get connection string
   - Update `.env`

3. **Neon** (Free tier): https://neon.tech
   - Create account
   - Create database
   - Get connection string
   - Update `.env`

Then update your `.env`:
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
```

And for Redis, you can use:
- **Upstash Redis** (Free tier): https://upstash.com
- Get connection URL and update `REDIS_URL` in `.env`

## Current Status

Your setup is ready, you just need Docker Desktop running!

Once Docker is working, the database setup will take less than a minute.


