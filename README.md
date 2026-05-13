# Telegram AI Bot (Vercel)

AI-powered Telegram bot deployed on Vercel using webhooks.

## Features

- `/ask <question>` - Get AI-generated responses
- `/start` - Welcome message
- `/help` - Get support
- `/admin` - Contact admin
- `/live` - View members count

## Setup

### 1. Create a Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` and follow instructions
3. Copy the bot token

### 2. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Aman262626/Api-source-)

### 3. Set Environment Variable

In Vercel Dashboard → Your Project → Settings → Environment Variables:

| Variable | Description |
|----------|-------------|
| `BOT_TOKEN` | Your Telegram bot token from BotFather |

### 4. Activate Webhook

After deploying, visit this URL **once** in your browser:

```
https://YOUR_VERCEL_URL/api/setwebhook
```

This registers your Vercel URL with Telegram so the bot receives messages.

### 5. Done!

Your bot is now live. Send `/start` to your bot on Telegram.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/webhook` | POST | Receives Telegram updates (webhook) |
| `/api/setwebhook` | GET | Registers webhook with Telegram |

## How It Works

- Telegram sends messages to `/api/webhook` via webhook
- The serverless function processes the message and sends a response
- AI responses come from the Gemini API
- No server needed — runs entirely on Vercel serverless functions

## License

MIT
