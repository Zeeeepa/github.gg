# 🚀 GitHub.gg Deployment Guide

Complete guide for deploying GitHub.gg with Cloudflare Worker and GitHub App integration.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [GitHub App Configuration](#github-app-configuration)
- [Cloudflare Worker Setup](#cloudflare-worker-setup)
- [Database Configuration](#database-configuration)
- [Environment Configuration](#environment-configuration)
- [Production Deployment](#production-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### System Requirements
- **Node.js**: 18+ (or Bun runtime)
- **Docker**: For PostgreSQL database
- **Git**: For repository management
- **curl**: For testing webhooks

### Accounts & Services
- **GitHub Account**: For OAuth and GitHub App
- **Cloudflare Account**: For webhook gateway
- **Database Hosting**: PostgreSQL (local or cloud)

## 🏠 Local Development Setup

### 1. Quick Start with Installation Script

```bash
# Clone and setup in one command
curl -fsSL https://raw.githubusercontent.com/your-org/github.gg/main/inst.sh | bash
```

### 2. Manual Setup

```bash
# Clone repository
git clone https://github.com/lantos1618/github.gg.git
cd github.gg
git checkout rewrite-github-app

# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Setup database
./scripts/db-setup.sh setup

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with your configuration

# Start development server
bun run dev
```

The application will be available at `http://localhost:3001`.

## 🔐 GitHub App Configuration

### 1. Create GitHub App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New GitHub App"
3. Fill in the details:

```
App Name: your-app-name
Homepage URL: http://localhost:3001
Callback URL: http://localhost:3001/api/auth/callback/github
Webhook URL: https://your-worker.workers.dev/api/webhooks/github
```

### 2. Configure Permissions

**Repository Permissions:**
- Contents: Read
- Metadata: Read
- Pull requests: Write
- Issues: Write

**Account Permissions:**
- Email addresses: Read

**Events:**
- Installation
- Installation repositories
- Push
- Pull request

### 3. Generate Private Key

1. In your GitHub App settings, click "Generate a private key"
2. Download the `.pem` file
3. Save it as `your-app-name.pem` in your project root

### 4. Setup GitHub App

```bash
# Use the setup script
./scripts/setup-github-app.sh setup

# Or manually configure
./scripts/setup-github-app.sh check
./scripts/setup-github-app.sh test
```

## ☁️ Cloudflare Worker Setup

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
# or
bun install -g wrangler
```

### 2. Authenticate with Cloudflare

```bash
wrangler auth login
```

### 3. Configure Worker

```bash
cd cloudflare-worker

# Update wrangler.toml with your configuration
# Set your account ID and worker name

# Deploy to development
wrangler deploy --env development

# Deploy to production
wrangler deploy --env production
```

### 4. Set Environment Variables

```bash
# Set target URL for webhook forwarding
wrangler secret put TARGET_URL --env production
# Enter: https://your-domain.com

# Optional: Set webhook secret
wrangler secret put WEBHOOK_SECRET --env production
```

### 5. Test Worker

```bash
# Test webhook forwarding
./scripts/test-webhooks.sh worker
```

## 🗄️ Database Configuration

### Local Development (Docker)

```bash
# Start PostgreSQL
./scripts/db-setup.sh start

# Run migrations
bun run db:push

# Check health
./scripts/db-health-check.sh
```

### Production Database

#### Option 1: Managed PostgreSQL (Recommended)

**Providers:**
- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [Supabase](https://supabase.com/) - PostgreSQL with extras
- [Railway](https://railway.app/) - Simple deployment
- [PlanetScale](https://planetscale.com/) - MySQL alternative

**Setup:**
1. Create database instance
2. Get connection string
3. Update `DATABASE_URL` in environment
4. Run migrations: `bun run db:push`

#### Option 2: Self-Hosted PostgreSQL

```bash
# Docker Compose for production
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: github_gg
      POSTGRES_USER: github_gg_user
      POSTGRES_PASSWORD: your_secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres_data:
```

## ⚙️ Environment Configuration

### Required Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# GitHub OAuth
GITHUB_CLIENT_ID="your_oauth_client_id"
GITHUB_CLIENT_SECRET="your_oauth_client_secret"

# GitHub App
GITHUB_APP_ID="your_app_id"
GITHUB_APP_NAME="your_app_name"
NEXT_PUBLIC_GITHUB_APP_NAME="your_app_name"
NEXT_PUBLIC_GITHUB_APP_ID="your_app_id"
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
GITHUB_WEBHOOK_SECRET="your_webhook_secret"

# GitHub API
GITHUB_PUBLIC_API_KEY="your_personal_access_token"

# AI Analysis
GEMINI_API_KEY="your_gemini_api_key"

# Authentication
BETTER_AUTH_SECRET="your_random_secret_key"

# Application
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY="your_posthog_key"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

### Environment Setup Script

```bash
# Generate secure secrets
./scripts/setup-github-app.sh setup

# Validate configuration
./scripts/test-integration.sh environment
```

## 🌐 Production Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# or use CLI:
vercel env add DATABASE_URL
vercel env add GITHUB_CLIENT_ID
# ... (add all required variables)
```

### Option 2: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up

# Set environment variables
railway variables set DATABASE_URL=your_database_url
# ... (add all required variables)
```

### Option 3: Docker Deployment

```dockerfile
# Dockerfile
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Build application
RUN bun run build

# Expose port
EXPOSE 3001

# Start application
CMD ["bun", "start"]
```

```bash
# Build and run
docker build -t github-gg .
docker run -p 3001:3001 --env-file .env.local github-gg
```

### Option 4: VPS Deployment

```bash
# On your VPS
git clone https://github.com/your-org/github.gg.git
cd github.gg

# Install dependencies
curl -fsSL https://bun.sh/install | bash
bun install

# Setup environment
cp .env.local.example .env.local
# Edit with production values

# Build application
bun run build

# Setup process manager (PM2)
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 📊 Monitoring & Maintenance

### Health Checks

```bash
# Comprehensive health check
./scripts/test-integration.sh all

# Quick health check
./scripts/test-integration.sh quick

# Database health
./scripts/db-health-check.sh

# Webhook testing
./scripts/test-webhooks.sh
```

### Monitoring Setup

#### Application Monitoring

```javascript
// Add to your monitoring service
const healthCheck = {
  database: await testDatabaseConnection(),
  github: await testGitHubAppAuth(),
  webhooks: await testWebhookEndpoint(),
  cloudflare: await testCloudflareWorker(),
};
```

#### Log Monitoring

```bash
# Production logs
pm2 logs github-gg

# Docker logs
docker logs github-gg-container

# Vercel logs
vercel logs
```

### Backup Strategy

```bash
# Database backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Environment backup
cp .env.local .env.local.backup

# Code backup
git push origin main
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Port 3001 Already in Use

```bash
# Find process using port
lsof -ti:3001

# Kill process
kill -9 $(lsof -ti:3001)

# Or use different port
bun run dev -- --port 3002
```

#### 2. Database Connection Failed

```bash
# Check database status
./scripts/db-health-check.sh

# Reset database
./scripts/db-setup.sh reset

# Check connection string
echo $DATABASE_URL
```

#### 3. GitHub App Authentication Failed

```bash
# Test GitHub App
./scripts/setup-github-app.sh test

# Check private key format
./scripts/setup-github-app.sh check

# Validate environment
./scripts/test-integration.sh github-app
```

#### 4. Webhook Not Receiving Events

```bash
# Test webhook endpoint
./scripts/test-webhooks.sh local

# Test Cloudflare Worker
./scripts/test-webhooks.sh worker

# Check GitHub App webhook configuration
./scripts/setup-github-app.sh webhook
```

#### 5. Environment Variables Not Loading

```bash
# Check .env.local exists
ls -la .env.local

# Validate environment
./scripts/test-integration.sh environment

# Check for syntax errors
cat .env.local | grep -E '^[A-Z_]+=.*$'
```

### Debug Mode

```bash
# Enable debug logging
export DEBUG=github-gg:*

# Run with verbose output
bun run dev --verbose

# Check logs
tail -f logs/application.log
```

### Performance Issues

```bash
# Check database performance
./scripts/db-health-check.sh

# Monitor resource usage
top -p $(pgrep -f "bun.*dev")

# Check webhook response times
./scripts/test-webhooks.sh
```

## 📞 Support

### Getting Help

1. **Check Logs**: Always check application and database logs first
2. **Run Tests**: Use the integration test suite to identify issues
3. **Documentation**: Review this guide and inline code comments
4. **GitHub Issues**: Create an issue with logs and configuration details

### Useful Commands

```bash
# Complete system check
./scripts/test-integration.sh all

# Reset everything
./scripts/db-setup.sh reset
rm -f .env.local
cp .env.local.example .env.local

# Fresh installation
rm -rf node_modules bun.lockb
bun install
```

### Configuration Validation

```bash
# Validate all configuration
./scripts/test-integration.sh all > validation-report.txt

# Check specific components
./scripts/test-integration.sh api
./scripts/test-integration.sh webhooks
./scripts/test-integration.sh database
```

---

## 🎉 Success Checklist

- [ ] ✅ Local development server running on port 3001
- [ ] ✅ Database connected and migrations applied
- [ ] ✅ GitHub App created and configured
- [ ] ✅ Cloudflare Worker deployed and forwarding webhooks
- [ ] ✅ Environment variables configured
- [ ] ✅ Integration tests passing
- [ ] ✅ GitHub App installed on test repository
- [ ] ✅ Webhook events being received and processed
- [ ] ✅ OAuth authentication working
- [ ] ✅ Installation linking functional

**Your GitHub.gg deployment is complete! 🚀**

