# Quick Start Guide

## ✅ Your API Keys Are Configured!

Your `.env` file has been created with:
- ✅ Telegram Bot Token
- ✅ OpenAI API Key
- ⚠️ X/Twitter API keys still needed (for posting to X)

## Next Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Databases (Docker)
```bash
docker-compose up -d postgres redis
```

Wait 5-10 seconds for databases to initialize.

### 3. Set Up Database
```bash
npm run db:migrate
npm run db:generate
```

### 4. Add Yourself as Admin

**Option A: Using the script**
```bash
# First, get your Telegram User ID:
# 1. Message @userinfobot on Telegram
# 2. Copy your user ID (it's a number)
# 3. Run:
npm run setup-admin YOUR_USER_ID your_username admin
```

**Option B: Using Prisma Studio**
```bash
npm run db:studio
```
- Open browser to http://localhost:5555
- Go to `admins` table
- Add new record with your Telegram user ID

**Option C: Let the bot create it**
- Start the bot first
- Send `/start` to your bot
- It will auto-create your admin record

### 5. Start the Bot
```bash
npm run dev
```

You should see:
```
🚀 MemeBot server started on port 3000
📝 Environment: development
✅ Redis connected
Telegram bot started (long polling)
```

### 6. Test the Bot
1. Open Telegram
2. Find your bot (search for the bot name you gave @BotFather)
3. Send `/start`
4. Send `/help` to see all commands

## Create Your First Project

You need at least one project before using most features:

**Via REST API:**
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"My First Project\", \"baseDescription\": \"A fun social media persona\"}"
```

**Or manually in database:**
```bash
npm run db:studio
```
- Go to `projects` table
- Add new project

## Try It Out!

1. **Add Context:**
   ```
   /context_add This is my brand voice - fun, engaging, and authentic
   ```

2. **Approve Context:**
   ```
   /context_approve 1
   ```

3. **Generate Posts:**
   ```
   /suggest_post
   ```

4. **View Context:**
   ```
   /context_view
   ```

## ⚠️ X/Twitter API Setup (Optional)

To enable posting to X/Twitter, you need:

1. Go to https://developer.twitter.com/
2. Create a developer account
3. Create an app
4. Get your API keys and tokens
5. Update `.env` with:
   - `X_API_KEY`
   - `X_API_SECRET`
   - `X_ACCESS_TOKEN`
   - `X_ACCESS_TOKEN_SECRET`

Without X API keys, you can still:
- ✅ Generate post suggestions
- ✅ Manage context
- ✅ Test the bot
- ❌ Post to X/Twitter (will fail)

## Troubleshooting

**Bot not responding?**
- Check bot token is correct
- Make sure bot is running (check terminal)
- Verify you're messaging the right bot

**Database errors?**
- Make sure PostgreSQL is running: `docker-compose ps postgres`
- Check DATABASE_URL in `.env`

**Redis errors?**
- Make sure Redis is running: `docker-compose ps redis`
- Check REDIS_URL in `.env`

## Need Help?

- Full guide: `docs/GETTING_STARTED.md`
- All documentation: `docs/` folder
- Execution plan: `docs/EXECUTION_PLAN.md`

