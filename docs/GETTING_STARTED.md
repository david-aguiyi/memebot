# Getting Started with MemeBot

## Prerequisites

Before you begin, make sure you have:
- Node.js 20+ installed
- Docker and Docker Compose installed (for local development)
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)
- API keys for:
  - Telegram Bot Token (from @BotFather)
  - X/Twitter API credentials
  - OpenAI API key

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your API keys:
   ```env
   # Get from @BotFather on Telegram
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

   # Get from https://developer.twitter.com/
   X_API_KEY=your_x_api_key_here
   X_API_SECRET=your_x_api_secret_here
   X_ACCESS_TOKEN=your_x_access_token_here
   X_ACCESS_TOKEN_SECRET=your_x_access_token_secret_here

   # Get from https://platform.openai.com/
   OPENAI_API_KEY=your_openai_api_key_here

   # Database (use Docker Compose defaults or your own)
   DATABASE_URL=postgresql://memebot:memebot@localhost:5432/memebot?schema=public
   REDIS_URL=redis://localhost:6379
   ```

## Step 3: Set Up Database

### Option A: Using Docker Compose (Recommended)

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Wait a few seconds for databases to be ready, then run migrations
npm run db:migrate
npm run db:generate
```

### Option B: Using Local Databases

1. Make sure PostgreSQL and Redis are running locally
2. Create the database:
   ```sql
   CREATE DATABASE memebot;
   ```
3. Run migrations:
   ```bash
   npm run db:migrate
   npm run db:generate
   ```

## Step 4: Add Yourself as Admin

You need to add your Telegram user ID as an admin. You can do this via:

1. **Using Prisma Studio** (easiest):
   ```bash
   npm run db:studio
   ```
   - Open the `admins` table
   - Add a new record with your Telegram user ID (you can get it by messaging @userinfobot on Telegram)
   - Set `role` to `admin` or `super_admin`
   - Set `isActive` to `true`

2. **Using SQL directly**:
   ```sql
   INSERT INTO admins (telegram_user_id, username, role, is_active)
   VALUES (YOUR_TELEGRAM_USER_ID, 'your_username', 'admin', true);
   ```

3. **Using the bot** (after it's running):
   - Start the bot
   - Send `/start` to the bot
   - The bot will automatically create your admin record

## Step 5: Create Your First Project

You can create a project via:

1. **REST API**:
   ```bash
   curl -X POST http://localhost:3000/api/projects \
     -H "Content-Type: application/json" \
     -d '{
       "name": "My First Project",
       "baseDescription": "A fun and engaging social media persona"
     }'
   ```

2. **Telegram Bot** (after setup):
   - Use `/projects` to see projects
   - Projects can be created via API for now

## Step 6: Start the Application

### Option A: Using Docker Compose (Recommended)

```bash
# Start all services (app, postgres, redis)
docker-compose up

# Or in detached mode
docker-compose up -d
```

### Option B: Local Development

```bash
# Make sure PostgreSQL and Redis are running
npm run dev
```

The bot will start in long polling mode (development) or webhook mode (production).

## Step 7: Test the Bot

1. Open Telegram and find your bot
2. Send `/start` to initialize
3. Try these commands:
   - `/help` - See all commands
   - `/projects` - List projects
   - `/context_add This is my first context layer` - Add context
   - `/context_view` - View context
   - `/suggest_post` - Generate post suggestions

## Step 8: Enable Autonomous Posting (Optional)

1. Enable posting for a project:
   ```bash
   curl -X PATCH http://localhost:3000/api/projects/PROJECT_ID/posting \
     -H "Content-Type: application/json" \
     -d '{"enabled": true}'
   ```

2. Or use Telegram:
   ```
   /posting_on
   ```

## Troubleshooting

### Bot Not Responding
- Check that `TELEGRAM_BOT_TOKEN` is correct
- Verify the bot is running: `docker-compose ps` or check logs
- Check logs: `docker-compose logs app` or `npm run dev` output

### Database Connection Errors
- Ensure PostgreSQL is running: `docker-compose ps postgres`
- Check `DATABASE_URL` in `.env`
- Verify database exists: `psql -U memebot -d memebot`

### Redis Connection Errors
- Ensure Redis is running: `docker-compose ps redis`
- Check `REDIS_URL` in `.env`
- Test connection: `redis-cli ping`

### OpenAI API Errors
- Verify `OPENAI_API_KEY` is correct
- Check your OpenAI account has credits
- Verify API key permissions

### X/Twitter API Errors
- Verify all X API credentials are correct
- Check API key permissions (need write access for posting)
- Verify OAuth tokens are valid

## Next Steps

1. **Add More Context Layers**: Build up your project's persona
2. **Generate Posts**: Use `/suggest_post` to create content
3. **Approve and Post**: Review suggestions and approve for posting
4. **Monitor**: Check logs and notifications for posting status

## Production Deployment

See `docs/EXECUTION_PLAN.md` Phase 6 for deployment strategies.

For production:
1. Set `NODE_ENV=production`
2. Configure webhook URL for Telegram
3. Use managed databases (PostgreSQL, Redis)
4. Set up monitoring and alerting
5. Configure secrets management

## Need Help?

- Check the documentation in `/docs`
- Review the execution plan: `docs/EXECUTION_PLAN.md`
- Check implementation summary: `docs/IMPLEMENTATION_SUMMARY.md`


