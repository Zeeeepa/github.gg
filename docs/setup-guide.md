# 🚀 GitHub.gg Setup Guide

This guide will help you set up the github.gg application with your GitHub App and Cloudflare Worker configuration.

## 📋 Prerequisites

- **Node.js** (v18 or later)
- **Bun** (latest version)
- **Docker** (for PostgreSQL)
- **Git**
- **Cloudflare Account** (for webhook worker)
- **GitHub App** (already created)

## 🔧 Quick Setup

### 1. Clone and Setup Repository

```bash
# Your installation script handles this
./inst.sh
```

### 2. Configure Environment Variables

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit with your credentials
nano .env.local
```

**Required Configuration:**

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/github_gg"

# Better Auth
BETTER_AUTH_SECRET="your-32-character-secret-key-here"

# GitHub OAuth (same as your GitHub App)
GITHUB_CLIENT_ID="Iv23li9PqHMExi84gaq1"
GITHUB_CLIENT_SECRET="d1fbd80a53d530773b3361f23efab3732c436a7b"

# GitHub App
GITHUB_APP_ID="1484403"
GITHUB_APP_NAME="zeeeepa"
NEXT_PUBLIC_GITHUB_APP_NAME="zeeeepa"
NEXT_PUBLIC_GITHUB_APP_ID="1484403"
GITHUB_WEBHOOK_SECRET="your-webhook-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3001"

# GitHub Private Key (from zeeeepa.2025-06-30.private-key.pem)
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
YOUR_PRIVATE_KEY_CONTENT_HERE
-----END RSA PRIVATE KEY-----"

# Cloudflare
CLOUDFLARE_ACCOUNT_ID="2b2a1d3effa7f7fe4fe2a8c4e48681e3"
CLOUDFLARE_WORKER_URL="https://webhook-gateway.pixeliumperfecto.workers.dev"
```

### 3. Setup Database

```bash
# Run the database setup script
./scripts/setup-db.sh
```

This script will:
- Start PostgreSQL with Docker
- Create the database
- Run all migrations
- Verify the setup

### 4. Deploy Cloudflare Worker

```bash
# Deploy the webhook gateway
./scripts/deploy-worker.sh
```

This script will:
- Deploy the worker to Cloudflare
- Configure webhook secrets
- Test the deployment

### 5. Install GitHub App

1. Go to your GitHub App settings: https://github.com/settings/apps
2. Find your "zeeeepa" app
3. Click "Install App"
4. Choose your personal account
5. Select repositories (or all repositories)
6. Complete the installation

### 6. Start Development Server

```bash
# Start the application
bun run dev
```

The application will be available at: http://localhost:3001

## 🔍 Verification Steps

### 1. Check Database Connection

```bash
# Open Drizzle Studio
bun run db:studio
```

Visit http://localhost:4983 to view your database.

### 2. Test Authentication

1. Visit http://localhost:3001
2. Click "Sign In with GitHub"
3. Complete OAuth flow
4. You should be logged in

### 3. Test GitHub App Installation

1. Visit http://localhost:3001/install
2. If not already installed, install the app
3. Check that installation is linked to your account

### 4. Test Webhook Delivery

1. Make a commit to a repository where the app is installed
2. Check the application logs for webhook events
3. Verify events are stored in the database

## 🛠️ Configuration Details

### GitHub App Permissions

Your GitHub App should have these permissions:
- **Repository permissions:**
  - Contents: Read
  - Metadata: Read
  - Pull requests: Read & Write (for future features)
  - Issues: Read & Write (for future features)
- **Organization permissions:**
  - Members: Read (if installing on organizations)
- **User permissions:**
  - Email addresses: Read

### Webhook Events

Your GitHub App should subscribe to:
- `installation`
- `installation_repositories`
- `push`
- `pull_request`
- `issues`

### Port Configuration

The application is configured to run on port 3001 to match your GitHub App settings:
- Homepage URL: http://localhost:3001
- Callback URL: http://localhost:3001/api/auth/callback/github
- Webhook URL: https://webhook-gateway.pixeliumperfecto.workers.dev/api/webhooks/github

## 🔐 Security Notes

### Private Key Setup

1. Copy the content from `zeeeepa.2025-06-30.private-key.pem`
2. Paste it into the `GITHUB_PRIVATE_KEY` environment variable
3. Keep the `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----` lines
4. Ensure proper line breaks are maintained

### Webhook Secret

Generate a secure webhook secret:

```bash
# Generate a random secret
openssl rand -hex 32
```

Use this secret in both:
- Your `.env.local` file (`GITHUB_WEBHOOK_SECRET`)
- Your GitHub App webhook configuration
- Your Cloudflare Worker (deployed automatically)

## 🚀 Next Steps

Once everything is working:

1. **Test Repository Analysis**
   - Visit a repository page
   - Check that AI analysis works (requires `GEMINI_API_KEY`)

2. **Explore Features**
   - Browse public repositories
   - Analyze private repositories (with app installed)
   - Check webhook event processing

3. **Development**
   - Make changes to the code
   - Test the hot reload functionality
   - Use Drizzle Studio for database management

## 📚 Additional Resources

- [GitHub Apps Documentation](https://docs.github.com/en/developers/apps)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Next.js Documentation](https://nextjs.org/docs)

## 🆘 Troubleshooting

See [troubleshooting.md](./troubleshooting.md) for common issues and solutions.

