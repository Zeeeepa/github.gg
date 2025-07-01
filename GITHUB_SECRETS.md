# 🔐 GitHub Repository Secrets Configuration

This document lists all the environment variables you need to add as **GitHub Repository Secrets** for the CI/CD workflow to work properly.

## 📋 Required GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

### 🗄️ Database Configuration

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `DATABASE_URL` | `postgresql://username:password@host:port/database` | PostgreSQL connection string for production |

**Example for production:**
```
postgresql://postgres:your_password@your-db-host:5432/github_gg
```

### 🔐 Authentication Secrets

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `BETTER_AUTH_SECRET` | `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6` | 32+ character random string for session encryption |

**Generate a secure secret:**
```bash
openssl rand -hex 32
```

### 🐙 GitHub App Configuration

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `GITHUB_CLIENT_ID` | `Iv23li9PqHMExi84gaq1` | Your GitHub App Client ID |
| `GITHUB_CLIENT_SECRET` | `d1fbd80a53d530773b3361f23efab3732c436a7b` | Your GitHub App Client Secret |
| `GITHUB_APP_ID` | `1484403` | Your GitHub App ID |
| `GITHUB_APP_NAME` | `zeeeepa` | Your GitHub App Name |
| `NEXT_PUBLIC_GITHUB_APP_NAME` | `zeeeepa` | Public GitHub App Name (same as above) |
| `NEXT_PUBLIC_GITHUB_APP_ID` | `1484403` | Public GitHub App ID (same as above) |
| `GITHUB_WEBHOOK_SECRET` | `webhook-secret-zeeeepa-2025-secure-random-key` | Webhook secret for GitHub App |

### 🔑 GitHub Private Key

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `GITHUB_PRIVATE_KEY` | `-----BEGIN RSA PRIVATE KEY-----\n[content]\n-----END RSA PRIVATE KEY-----` | Content from `zeeeepa.2025-06-30.private-key.pem` |

**⚠️ Important:** Copy the **entire content** of your `zeeeepa.2025-06-30.private-key.pem` file, including the header and footer lines.

### 🌐 Application URLs

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3001` | Application URL (update for production) |

### ☁️ Cloudflare Configuration

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `CLOUDFLARE_ACCOUNT_ID` | `2b2a1d3effa7f7fe4fe2a8c4e48681e3` | Your Cloudflare Account ID |
| `CLOUDFLARE_WORKER_NAME` | `webhook-gateway` | Your Cloudflare Worker Name |
| `CLOUDFLARE_WORKER_URL` | `https://webhook-gateway.pixeliumperfecto.workers.dev` | Your Cloudflare Worker URL |

## 🚀 Quick Setup Commands

### 1. Copy All Secrets at Once

Create a file `secrets.txt` with this format and add each one manually:

```bash
DATABASE_URL=postgresql://postgres:your_password@your-db-host:5432/github_gg
BETTER_AUTH_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
GITHUB_CLIENT_ID=Iv23li9PqHMExi84gaq1
GITHUB_CLIENT_SECRET=d1fbd80a53d530773b3361f23efab3732c436a7b
GITHUB_APP_ID=1484403
GITHUB_APP_NAME=zeeeepa
NEXT_PUBLIC_GITHUB_APP_NAME=zeeeepa
NEXT_PUBLIC_GITHUB_APP_ID=1484403
GITHUB_WEBHOOK_SECRET=webhook-secret-zeeeepa-2025-secure-random-key
NEXT_PUBLIC_APP_URL=http://localhost:3001
CLOUDFLARE_ACCOUNT_ID=2b2a1d3effa7f7fe4fe2a8c4e48681e3
CLOUDFLARE_WORKER_NAME=webhook-gateway
CLOUDFLARE_WORKER_URL=https://webhook-gateway.pixeliumperfecto.workers.dev
```

### 2. Add GitHub Private Key

Copy the content from your `zeeeepa.2025-06-30.private-key.pem` file:

```bash
cat zeeeepa.2025-06-30.private-key.pem
```

Then add it as `GITHUB_PRIVATE_KEY` secret.

## ✅ Verification

After adding all secrets, the GitHub Actions workflow will:

1. **✅ Validate Environment** - Check all required secrets are present
2. **✅ Build Application** - Compile Next.js with your configuration
3. **✅ Test Database** - Verify PostgreSQL connection
4. **✅ Test GitHub App** - Validate GitHub App configuration
5. **✅ Security Check** - Audit dependencies and check for secrets in code
6. **✅ Deployment Ready** - Confirm everything is ready for production

## 🔒 Security Notes

- **Never commit secrets to code** - Always use environment variables
- **Rotate secrets regularly** - Especially the `BETTER_AUTH_SECRET`
- **Use different secrets for production** - Don't reuse development secrets
- **Monitor secret usage** - Check GitHub Actions logs for any issues

## 🆘 Troubleshooting

### Missing Secrets Error
If you see "Missing required environment variables" in GitHub Actions:
1. Check the secret name matches exactly (case-sensitive)
2. Ensure the secret value is not empty
3. Verify you added it to the correct repository

### Private Key Format Error
If GitHub App authentication fails:
1. Ensure you copied the entire `.pem` file content
2. Include the `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----` lines
3. Check for any extra spaces or line breaks

### Database Connection Error
If database tests fail:
1. Verify your `DATABASE_URL` format
2. Ensure the database server is accessible
3. Check username/password credentials

## 📞 Support

If you encounter issues:
1. Check the GitHub Actions logs for specific error messages
2. Verify all secrets are added correctly
3. Test locally with the same environment variables
4. Review the workflow file for any configuration issues
