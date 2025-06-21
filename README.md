# GitHub.gg

A modern GitHub repository analyzer built with Next.js, NextAuth.js, and Octokit, powered by Bun.

## Features

- 🔒 Secure authentication with GitHub OAuth
- 📊 Repository analysis and statistics
- 🚀 Fast and responsive UI
- ⚡ Optimized for performance with Bun
- 🏗️ TypeScript first-class support
- 🧪 Built-in testing with Bun

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- GitHub OAuth App credentials

### Quick Start with Bun

```bash
# Install Bun (if not installed)
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Start development server
bun dev
```

### Traditional Setup (Node.js)

If you prefer using Node.js:

```bash
# Install dependencies (React 19 compatibility)
npm run install:legacy
# or use the legacy flag directly
npm install --legacy-peer-deps

# Start development server
npm run dev
# or
yarn dev
```

> **Note**: This project uses React 19, which requires `--legacy-peer-deps` for some dependencies that haven't updated their peer dependency ranges yet. This is safe and the dependencies work correctly with React 19.

### Environment Setup

1. Create a `.env.local` file in the root directory:
   ```bash
   cp .env.local.example .env.local
   ```

2. Configure the environment variables:
   ```env
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   
   # GitHub OAuth (create at: https://github.com/settings/applications/new)
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   
   # Optional: GitHub Personal Access Token for higher API rate limits
   GITHUB_TOKEN=your-github-personal-access-token
   ```

3. Install dependencies (React 19 compatibility):
   ```bash
   npm run install:legacy
   ```

### Development

1. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing Authentication

To test the authentication flow:

1. Start the development server
2. Navigate to the login page or click the "Sign in with GitHub" button
3. Authorize the application with your GitHub account
4. You should be redirected back to the application

For automated testing, you can use the test script:

```bash
# (Test script removed; see project for available scripts)
```

## Production Deployment

### Vercel

1. Push your code to a GitHub repository
2. Import the repository on [Vercel](https://vercel.com/import)
3. Add the required environment variables in the Vercel dashboard
4. Deploy!

## API Reference

### Authentication

All API routes are protected and require authentication. Include the session token in your requests.

### Rate Limiting

- Unauthenticated: 10 requests per hour
- Authenticated: 100 requests per hour

## React 19 Compatibility

This project uses React 19 and has been updated to ensure compatibility:

### Updated Dependencies
- **react-day-picker**: Updated to v9.4.2 (React 19 support, date-fns now included)
- **react-spring**: Updated to v10.0.1 (React 19 compatibility)

### Known Compatibility Notes
- **framer-motion**: Currently requires `--legacy-peer-deps` as it hasn't officially added React 19 to peer dependencies yet, but works correctly
- **vaul**: Requires `--legacy-peer-deps` for React 19 compatibility

### Installation Commands
```bash
# For new installations
npm run install:legacy

# For resetting dependencies
npm run reset

# Manual installation with legacy flag
npm install --legacy-peer-deps
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter) - email@example.com

Project Link: [https://github.com/yourusername/github.gg](https://github.com/yourusername/github.gg)
