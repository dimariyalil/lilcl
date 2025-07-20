# 🚀 Production Deployment Guide

## Quick Start

### 1. Environment Setup
Create `.env` file with:
```env
CLAUDE_API_KEY=your_claude_api_key_here
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
PORT=3000
NODE_ENV=production
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Production System
```bash
npm run prod
```

This will start:
- 🌐 API Gateway on port 3000
- 🤖 Telegram Bot with message logging

## 📱 Testing Telegram Bot

1. **Find your bot** in Telegram by username
2. **Send `/start`** to begin
3. **Available commands:**
   - `/help` - Show help
   - `/task` - Submit AI task
   - `/agents` - List agents
   - `/status <taskId>` - Check task
   - `/report` - Team report

## 🔧 API Endpoints

Base URL: `http://your-domain:3000`

- `GET /health` - Health check
- `GET /agents` - List all agents
- `POST /task` - Submit new task
- `GET /status/:taskId` - Task status
- `GET /reports/team` - Team report

## 🌍 Cloud Deployment Options

### Railway
1. Connect GitHub repo
2. Add environment variables
3. Deploy automatically

### Heroku
```bash
git push heroku main
```

### Render
1. Connect GitHub repo
2. Set build command: `npm install`
3. Set start command: `npm run prod`

### VPS/Server
```bash
# Install PM2 for process management
npm install -g pm2

# Start with PM2
pm2 start start_production.js --name "ai-agents"

# Save PM2 configuration
pm2 save
pm2 startup
```

## 🔍 Monitoring

- **Logs**: Console output shows all API and bot activity
- **Health**: `GET /health` endpoint
- **Status**: `GET /system/status` for detailed info

## 🔐 Security

- Environment variables secured
- API endpoints protected
- Rate limiting recommended for production
- HTTPS required for production

## 🐛 Troubleshooting

1. **Bot not responding**: Check TELEGRAM_BOT_TOKEN
2. **API errors**: Verify CLAUDE_API_KEY
3. **Port issues**: Change PORT in .env
4. **Memory issues**: Monitor with `pm2 monit`