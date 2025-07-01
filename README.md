# 🚀 GitHub.gg - Enhanced GitHub Repository Intelligence

GitHub.gg provides AI-powered repository analysis and management with seamless GitHub App integration and Cloudflare Worker webhook handling.

## ⚡ Quick Start

### 1. Installation
```bash
# Clone and setup (handles everything automatically)
./inst.sh
```

### 2. Environment Configuration
```bash
# Copy and edit environment file
cp .env.local.example .env.local
# Edit with your GitHub App credentials and private key
```

### 3. Database Setup
```bash
# Run comprehensive database setup
./scripts/setup-db.sh
```

### 4. Deploy Cloudflare Worker
```bash
# Deploy webhook gateway to Cloudflare
./scripts/deploy-worker.sh
```

### 5. Install GitHub App
1. Visit: https://github.com/settings/apps
2. Install your "zeeeepa" app on your account
3. Select repositories to analyze

### 6. Start Development
```bash
# Start development server on port 3001
bun run dev
```

Visit: http://localhost:3001

## 📚 Documentation

- **[Complete Setup Guide](./docs/setup-guide.md)** - Detailed setup instructions
- **[Troubleshooting Guide](./docs/troubleshooting.md)** - Common issues and solutions
- **[TODOs and Roadmap](./todos.md)** - Development roadmap and planned features

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `bun install` | Install dependencies |
| `./scripts/setup-db.sh` | Setup database and run migrations |
| `./scripts/deploy-worker.sh` | Deploy Cloudflare webhook worker |
| `bun run dev` | Start development server (port 3001) |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run db:studio` | Open database management UI |
| `bun run db:reset` | Reset database completely |

## 🔧 GitHub App Configuration

Your GitHub App is pre-configured with these settings:

- **App Name**: zeeeepa
- **App ID**: 1484403
- **Client ID**: Iv23li9PqHMExi84gaq1
- **Homepage**: http://localhost:3001
- **Callback URL**: http://localhost:3001/api/auth/callback/github
- **Webhook URL**: https://webhook-gateway.pixeliumperfecto.workers.dev/api/webhooks/github

### Install GitHub App
Visit: https://github.com/apps/zeeeepa/installations/new

## ☁️ Cloudflare Worker

The webhook gateway is configured at:
- **Worker URL**: https://webhook-gateway.pixeliumperfecto.workers.dev
- **Account ID**: 2b2a1d3effa7f7fe4fe2a8c4e48681e3

### Deploy Worker
```bash
cd cloudflare-worker
wrangler deploy --env production
```

## 🗄️ Database

Uses PostgreSQL with Docker Compose:
- **Host**: localhost:5432
- **Database**: github_gg
- **User**: github_gg_user
- **Password**: github_gg_password

## 🔐 Environment Variables

Required in `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://github_gg_user:github_gg_password@localhost:5432/github_gg"

# GitHub OAuth
GITHUB_CLIENT_ID="Iv23li9PqHMExi84gaq1"
GITHUB_CLIENT_SECRET="your_client_secret"

# GitHub App
GITHUB_APP_ID="1484403"
GITHUB_APP_NAME="zeeeepa"
NEXT_PUBLIC_GITHUB_APP_NAME="zeeeepa"
NEXT_PUBLIC_GITHUB_APP_ID="1484403"
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
GITHUB_WEBHOOK_SECRET="your_webhook_secret"

# GitHub API
GITHUB_PUBLIC_API_KEY="your_personal_access_token"

# AI Analysis
GEMINI_API_KEY="your_gemini_api_key"

# Authentication
BETTER_AUTH_SECRET="your_random_secret_key"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3001"
```

## 🚀 Production Deployment

### Vercel (Recommended)
```bash
vercel deploy
# Set environment variables in Vercel dashboard
```

### Railway
```bash
railway up
# Set environment variables in Railway dashboard
```

## 🔄 Workflow

1. **Development**: `npm run dev` - Start development server
2. **Database**: `npm run setup` - Setup/reset database
3. **Production**: `npm run build && npm run start`
4. **Cleanup**: `npm run stop` - Stop all services

## 🎯 Features

- **Hybrid Authentication**: OAuth + GitHub App integration
- **Real-time Webhooks**: Cloudflare Worker → Next.js
- **AI Analysis**: Gemini-powered code insights
- **Database**: PostgreSQL with Drizzle ORM
- **UI**: Modern React with Tailwind CSS
- **Runtime**: Optimized for Bun

## 🔧 Troubleshooting

### Port 3001 in use
```bash
npm run stop
# Or kill process: lsof -ti:3001 | xargs kill -9
```

### Database issues
```bash
npm run stop
npm run setup
```

### Environment issues
```bash
# Check .env.local exists and has correct values
cat .env.local
```

---

**Ready to analyze repositories with AI! 🤖**
