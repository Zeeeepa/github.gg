# 🚀 GitHub.gg Deployment Guide

Simple deployment guide using the npm workflow.

## 🏠 Local Development

### Quick Setup
```bash
# 1. Clone and setup
./inst.sh

# 2. Install dependencies
npm install

# 3. Configure environment
# Edit .env.local with your GitHub App credentials

# 4. Setup database
npm run setup

# 5. Start development
npm run dev
```

Visit: http://localhost:3001

## 📋 NPM Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run setup` | Setup PostgreSQL database and run migrations |
| `npm run dev` | Start development server on port 3001 |
| `npm run build` | Build application for production |
| `npm run start` | Start production server |
| `npm run stop` | Stop all Docker containers |

## 🔐 Environment Setup

### 1. Copy Template
```bash
cp .env.local.example .env.local
```

### 2. Add Your Credentials
Edit `.env.local` with your actual values:

```bash
# GitHub App (your provided values)
GITHUB_CLIENT_SECRET="d1fbd80a53d530773b3361f23efab3732c436a7b"
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n[paste your private key content]\n-----END RSA PRIVATE KEY-----"
GITHUB_WEBHOOK_SECRET="[generate a secure secret]"

# GitHub API
GITHUB_PUBLIC_API_KEY="[your personal access token]"

# AI Analysis
GEMINI_API_KEY="[your gemini api key]"

# Authentication
BETTER_AUTH_SECRET="[generate a secure secret]"
```

### 3. Generate Secrets
```bash
# Generate webhook secret
openssl rand -base64 32

# Generate auth secret
openssl rand -base64 32
```

## 🔧 GitHub App Configuration

Your GitHub App is already configured:
- **App Name**: zeeeepa
- **App ID**: 1484403
- **Homepage**: http://localhost:3001
- **Webhook**: https://webhook-gateway.pixeliumperfecto.workers.dev/api/webhooks/github

### Install on Your Repositories
Visit: https://github.com/apps/zeeeepa/installations/new

## ☁️ Cloudflare Worker

### Deploy Worker
```bash
cd cloudflare-worker

# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler auth login

# Deploy
wrangler deploy --env production
```

### Set Environment Variables
```bash
# Set target URL for production
wrangler secret put TARGET_URL --env production
# Enter: https://your-domain.com
```

## 🌐 Production Deployment

### Option 1: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in dashboard
```

### Option 2: Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway up
```

### Option 3: Docker
```dockerfile
FROM oven/bun:1 as base
WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

EXPOSE 3001
CMD ["bun", "start"]
```

## 🗄️ Database Options

### Local (Default)
Uses Docker Compose PostgreSQL:
```bash
npm run setup  # Starts container and runs migrations
npm run stop   # Stops container
```

### Production
Update `DATABASE_URL` in environment:
- **Neon**: Serverless PostgreSQL
- **Supabase**: PostgreSQL with extras  
- **Railway**: Simple deployment
- **PlanetScale**: MySQL alternative

## 🔧 Troubleshooting

### Common Issues

**Port 3001 in use:**
```bash
npm run stop
# Or: lsof -ti:3001 | xargs kill -9
```

**Database connection failed:**
```bash
npm run stop
npm run setup
```

**Environment variables not loading:**
```bash
# Check file exists
ls -la .env.local

# Validate format
cat .env.local | grep -E '^[A-Z_]+=.*$'
```

**GitHub App authentication failed:**
```bash
# Check private key format in .env.local
# Ensure newlines are \n not actual newlines
```

### Debug Mode
```bash
# Enable debug logging
export DEBUG=github-gg:*
npm run dev
```

## ✅ Verification Checklist

- [ ] `npm install` completed successfully
- [ ] `.env.local` configured with your credentials
- [ ] `npm run setup` completed without errors
- [ ] `npm run dev` starts server on port 3001
- [ ] GitHub App installed on your repositories
- [ ] Cloudflare Worker deployed and forwarding webhooks
- [ ] Can sign in with GitHub OAuth
- [ ] Installation linking works in UI

## 🎯 Next Steps

1. **Merge the PR** to get these enhancements
2. **Run the setup** using the npm commands
3. **Configure your credentials** in .env.local
4. **Install the GitHub App** on your repositories
5. **Deploy the Cloudflare Worker** for webhooks
6. **Start developing** with `npm run dev`

---

**Simple, effective, and ready to go! 🚀**

