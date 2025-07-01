# 🛠️ Troubleshooting Guide

Common issues and solutions for github.gg setup and development.

## 🔧 Environment Issues

### "Environment validation failed"

**Problem:** Environment variables are missing or invalid.

**Solution:**
1. Check that `.env.local` exists and has all required variables
2. Verify the format matches `.env.local.example`
3. Ensure no trailing spaces or quotes issues

```bash
# Check environment loading
bun -e "console.log(process.env.GITHUB_APP_ID)"
```

### "Port 3001 already in use"

**Problem:** Another process is using port 3001.

**Solution:**
```bash
# Find what's using the port
lsof -i :3001

# Kill the process (replace PID)
kill -9 <PID>

# Or use a different port temporarily
bun run dev -- --port 3002
```

## 🗄️ Database Issues

### "Database connection failed"

**Problem:** PostgreSQL is not running or connection details are wrong.

**Solution:**
1. Check if PostgreSQL container is running:
```bash
docker ps | grep postgres
```

2. Start PostgreSQL if not running:
```bash
bun run db:start
```

3. Verify connection string in `.env.local`

### "Table does not exist"

**Problem:** Database migrations haven't been run.

**Solution:**
```bash
# Run migrations
bun run db:push

# Or reset database completely
bun run db:reset
```

### "Permission denied for database"

**Problem:** Database user doesn't have proper permissions.

**Solution:**
```bash
# Connect to PostgreSQL and fix permissions
docker exec -it $(docker-compose ps -q postgres) psql -U postgres
GRANT ALL PRIVILEGES ON DATABASE github_gg TO postgres;
```

## 🔐 Authentication Issues

### "GitHub OAuth callback error"

**Problem:** OAuth callback URL mismatch.

**Solution:**
1. Check GitHub App settings match your local URL
2. Ensure callback URL is: `http://localhost:3001/api/auth/callback/github`
3. Verify `NEXT_PUBLIC_APP_URL` in `.env.local`

### "Invalid GitHub App private key"

**Problem:** Private key format is incorrect.

**Solution:**
1. Copy the entire content from `zeeeepa.2025-06-30.private-key.pem`
2. Include the header and footer lines
3. Maintain proper line breaks:

```bash
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
...your key content...
-----END RSA PRIVATE KEY-----"
```

### "GitHub App installation not found"

**Problem:** App isn't installed on your account/repositories.

**Solution:**
1. Visit: https://github.com/settings/installations
2. Find your "zeeeepa" app
3. Configure repository access
4. Or reinstall via: http://localhost:3001/install

## 🌐 Webhook Issues

### "Webhook delivery failed"

**Problem:** Cloudflare Worker can't reach your local development server.

**Solution:**
1. Use ngrok for local development:
```bash
# Install ngrok
npm install -g ngrok

# Expose local port
ngrok http 3001

# Update worker environment with ngrok URL
```

2. Or update Cloudflare Worker to use your local IP:
```bash
# Find your local IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Update worker LOCAL_URL to use your IP
```

### "Webhook signature verification failed"

**Problem:** Webhook secret mismatch.

**Solution:**
1. Ensure same secret in all places:
   - `.env.local` (`GITHUB_WEBHOOK_SECRET`)
   - GitHub App webhook settings
   - Cloudflare Worker secret

2. Update Cloudflare Worker secret:
```bash
cd cloudflare-worker
wrangler secret put GITHUB_WEBHOOK_SECRET --env development
```

### "Worker deployment failed"

**Problem:** Cloudflare authentication or configuration issues.

**Solution:**
1. Authenticate with Cloudflare:
```bash
wrangler login
```

2. Check account ID in `wrangler.toml` matches your account

3. Verify worker name is available

## 🤖 AI Analysis Issues

### "Gemini API error"

**Problem:** AI analysis fails or returns errors.

**Solution:**
1. Verify `GEMINI_API_KEY` is set correctly
2. Check API quota and billing
3. Test API key:
```bash
curl -H "Authorization: Bearer $GEMINI_API_KEY" \
  https://generativelanguage.googleapis.com/v1/models
```

### "Analysis takes too long"

**Problem:** Repository analysis times out.

**Solution:**
1. Large repositories may take time - this is normal
2. Check browser network tab for actual request status
3. Consider implementing pagination for very large repos

## 🏗️ Build Issues

### "Build fails with database connection error"

**Problem:** Build tries to connect to database at build time.

**Solution:**
This should be fixed, but if it occurs:
1. Ensure `export const dynamic = 'force-dynamic'` is in problematic pages
2. Check that database calls are wrapped in try-catch during build

### "Module not found" errors

**Problem:** Import paths are incorrect.

**Solution:**
1. Check TypeScript path mapping in `tsconfig.json`
2. Verify file exists at the import path
3. Restart TypeScript server in your editor

## 🔄 Development Issues

### "Hot reload not working"

**Problem:** Changes don't reflect in browser.

**Solution:**
1. Check if using `--turbopack` flag (should be in package.json)
2. Clear browser cache
3. Restart development server
4. Check for TypeScript errors in terminal

### "Session not persisting"

**Problem:** User gets logged out on page refresh.

**Solution:**
1. Check browser cookies are enabled
2. Verify `BETTER_AUTH_SECRET` is set
3. Check browser developer tools for cookie issues

## 📊 Performance Issues

### "Slow repository loading"

**Problem:** Repository pages load slowly.

**Solution:**
1. Check GitHub API rate limits
2. Verify caching is working (check database for cached data)
3. Consider using GitHub App token instead of OAuth token

### "High memory usage"

**Problem:** Application uses too much memory.

**Solution:**
1. Check for memory leaks in browser dev tools
2. Limit concurrent API requests
3. Implement proper cleanup in React components

## 🆘 Getting Help

### Debug Information

When reporting issues, include:

```bash
# System information
node --version
bun --version
docker --version

# Environment check
bun -e "console.log('NODE_ENV:', process.env.NODE_ENV)"
bun -e "console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)"

# Database status
docker ps | grep postgres

# Application logs
bun run dev 2>&1 | head -50
```

### Log Files

Check these locations for detailed error information:
- Browser developer console
- Terminal where `bun run dev` is running
- Docker container logs: `docker logs $(docker-compose ps -q postgres)`

### Common Commands

```bash
# Reset everything
bun run db:reset
rm -rf .next
bun install
bun run dev

# Check database
bun run db:studio

# Test environment
bun -e "import('./src/lib/env.ts').then(m => console.log('✅ Environment valid'))"

# Test GitHub API
bun -e "
import { GitHubService } from './src/lib/github/service.ts';
const service = await GitHubService.createForRepo('octocat', 'Hello-World');
console.log(await service.getRepository());
"
```

### Still Need Help?

1. Check the [GitHub Issues](https://github.com/lantos1618/github.gg/issues)
2. Create a new issue with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Debug information from above
   - Environment details

