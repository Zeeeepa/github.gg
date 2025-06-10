# Quick Setup Guide for GitHub.gg on Ubuntu WSL2

## One-Command Deployment

```bash
curl -fsSL https://raw.githubusercontent.com/Zeeeepa/github.gg/main/deploy-ubuntu-wsl2.sh | bash
```

## Manual Setup

1. **Clone and run the deployment script:**
```bash
git clone https://github.com/Zeeeepa/github.gg.git
cd github.gg
chmod +x deploy-ubuntu-wsl2.sh
./deploy-ubuntu-wsl2.sh
```

2. **Configure GitHub OAuth (Required for private repos):**
   - Go to https://github.com/settings/applications/new
   - Create a new OAuth App with:
     - Application name: `GitHub.gg Local`
     - Homepage URL: `http://localhost:3000`
     - Authorization callback URL: `http://localhost:3000/api/auth/callback`
   - Copy Client ID and Client Secret to `.env.local`

3. **Optional: Add GitHub Personal Access Token:**
   - Go to https://github.com/settings/tokens
   - Generate a token with `repo` and `read:user` scopes
   - Add to `.env.local` as `PUBLIC_GITHUB_TOKEN`

## Environment Variables

Create `.env.local` file:

```env
# GitHub OAuth (Required for private repos)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# GitHub Token (Optional - for higher rate limits)
PUBLIC_GITHUB_TOKEN=ghp_your_token_here

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Socket API (Optional - for security analysis)
SOCKET_API_KEY=your_socket_api_key
```

## Quick Start Commands

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start

# With PM2 (recommended for production)
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Access the Application

- **Local Development**: http://localhost:3000
- **Production**: http://your-server-ip (with Nginx)

## Features

✅ **Repository Visualization**: Interactive Mermaid diagrams  
✅ **Code Analysis**: File structure and language detection  
✅ **Security Scanning**: Vulnerability analysis with Socket API  
✅ **GitHub Integration**: Support for public and private repos  
✅ **Multiple Diagram Types**: Flowcharts, class diagrams, mind maps  
✅ **Responsive Design**: Works on desktop and mobile  

## Troubleshooting

### Common Issues

1. **Node.js version**: Requires Node.js 18+
2. **GitHub rate limits**: Add a personal access token
3. **Private repos**: Set up GitHub OAuth
4. **Port conflicts**: Change port in environment variables

### Logs

```bash
# PM2 logs
pm2 logs github-gg

# Systemd logs
sudo journalctl -u github-gg -f

# Development logs
npm run dev
```

## Production Deployment

The script includes options for:
- **PM2**: Process management
- **Nginx**: Reverse proxy
- **Systemd**: Service management
- **SSL**: Let's Encrypt integration (manual setup required)

For production, consider:
1. Setting up a domain name
2. Configuring SSL certificates
3. Setting up monitoring
4. Configuring backups
5. Setting up log rotation

