# 🚀 GitHub.gg Quick Start Guide

Get up and running with GitHub.gg in just a few commands!

## Prerequisites

- Docker and Docker Compose installed
- Git installed
- Linux/macOS/WSL environment

## Quick Setup

### 1. Install Dependencies
```bash
./ins.sh
```
This script will:
- Install Bun (if not already installed)
- Install project dependencies
- Create `.env.local` with your GitHub App credentials

### 2. Start Database & Run Migrations
```bash
./inst.sh
```
This script will:
- Start PostgreSQL database with Docker
- Wait for database to be ready
- Run database migrations
- Test the connection

### 3. Start Development Server
```bash
bun dev
```

Your app will be available at: http://localhost:3000

## Database Access

Connect to your database using:
```bash
psql -h localhost -p 5432 -U github_gg_user -d github_gg
```
Password: `github_gg_password`

## Useful Commands

```bash
# Database management
bun run db:studio    # Open Drizzle Studio
bun run db:stop      # Stop database
bun run db:reset     # Reset database (⚠️ destructive)

# Development
bun dev              # Start dev server
bun build            # Build for production
bun test             # Run tests
```

## Troubleshooting

### Database Connection Issues
- Make sure Docker is running
- Check if port 5432 is available: `sudo lsof -i :5432`
- View database logs: `docker logs github-gg-db`

### Port Already in Use
If port 3000 is busy, start on a different port:
```bash
bun dev -- -p 3001
```

### Environment Issues
- Make sure `.env.local` exists and has correct values
- Restart your terminal after running `ins.sh` to get Bun in PATH

## GitHub App Configuration

Your GitHub App is already configured with:
- **App ID**: 1484403
- **Client ID**: Iv23li9PqHMExi84gaq1
- **Webhook URL**: https://webhook-gateway.pixeliumperfecto.workers.dev/api/webhooks/github

Make sure you have the private key file `zeeeepa.2025-06-30.private-key.pem` in the project root.

## Next Steps

1. Visit http://localhost:3000
2. Sign in with GitHub
3. Start analyzing repositories!

For more detailed information, see the main [README.md](./README.md).

