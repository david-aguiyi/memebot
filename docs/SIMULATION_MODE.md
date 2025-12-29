# Simulation Mode - Test Without X/Twitter API Keys

## Overview

MemeBot now supports **Simulation Mode** for X/Twitter posting. This allows you to test the entire workflow without needing paid X/Twitter API access!

## How It Works

When simulation mode is enabled:
- ✅ All features work normally
- ✅ Post suggestions are generated
- ✅ Posts are "approved" and "posted"
- ✅ Everything is logged to the database
- 📝 Posts are **NOT** actually published to X/Twitter
- 📝 Simulated tweet IDs are generated instead

## Enabling Simulation Mode

### Option 1: Automatic (Recommended)
Just **don't add X API keys** to your `.env` file. The bot will automatically use simulation mode.

### Option 2: Explicit
Add to your `.env`:
```env
X_SIMULATION_MODE=true
```

## What You'll See

### In Logs
```
📝 [SIMULATION] Tweet would be posted: { simulatedId: 'sim_1234...', content: '...' }
```

### In Telegram
When a post is "published":
```
📝 [SIMULATION] Post Would Be Published

Your post content here...

🔗 Simulated Tweet ID: sim_1234567890_abc123
ℹ️ Running in simulation mode - not posted to X/Twitter
```

### In Database
- Posts are saved with simulated tweet IDs (starting with `sim_`)
- All data is stored normally
- You can see the full posting history

## Testing the Full Workflow

1. **Generate Posts:**
   ```
   /suggest_post
   ```

2. **Approve Posts:**
   - Click ✅ Approve on suggestions
   - Posts will be "published" in simulation mode

3. **Check Status:**
   - View posts in database
   - Check logs for simulation messages
   - See notifications in Telegram

## Switching to Real Posting

When you're ready to post to real X/Twitter:

1. Get X/Twitter API credentials
2. Update `.env`:
   ```env
   X_API_KEY=your_real_key
   X_API_SECRET=your_real_secret
   X_ACCESS_TOKEN=your_real_token
   X_ACCESS_TOKEN_SECRET=your_real_token_secret
   X_SIMULATION_MODE=false
   ```
3. Restart the bot

## Benefits

- ✅ Test everything for free
- ✅ No risk of posting unwanted content
- ✅ Learn the workflow before committing
- ✅ Perfect for development and staging
- ✅ All features work identically

## Limitations

- Posts won't appear on real X/Twitter
- Can't test engagement metrics
- Can't test real rate limits
- Simulated tweet IDs won't work in real X URLs

## When to Use Real API

Use real X API keys when:
- You're ready for production
- You want to test real engagement
- You need actual posting functionality
- You're comfortable with posting content

## Safety

Even in simulation mode:
- ✅ All safety checks still run
- ✅ Content moderation is active
- ✅ PII detection works
- ✅ Risk scoring happens
- ✅ Audit logs are created

This ensures your content is safe before you ever post to real X/Twitter!

