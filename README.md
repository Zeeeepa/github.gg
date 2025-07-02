# GitHub.gg

A modern GitHub repository analyzer built with Next.js, Better Auth, and Octokit, powered by Bun.

## Features

* 🔒 Secure authentication with GitHub OAuth
* 📊 Repository analysis and statistics
* 🚀 Fast and responsive UI
* ⚡ Optimized for performance with Bun
* 🏗️ TypeScript first-class support
* 🧪 Built-in testing with Bun
* 🗄️ PostgreSQL database with Docker

## Quick Start

### Prerequisites

* Bun (recommended) or Node.js 18+
* Docker (for local database)
* GitHub OAuth App credentials

### 1. Clone and Install

```bash
git clone https://github.com/lantos1618/github.gg.git
cd github.gg
bun install
```

### 2. Set Up Environment

Copy the example environment file and configure your GitHub OAuth credentials:

```bash
cp .env.local.example .env.local
```

#### 2.1 Generate Session Encryption Secret

Generate a secure random string for session encryption and add it to your `.env.local` file:

```bash
# Generate a secure random string (32 characters)
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Or using Bun
bun -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the generated string and use it as the value for `BETTER_AUTH_SECRET` in your `.env.local` file.

#### 2.2 Validate Database Configuration

Verify that your PostgreSQL database and user exist with the correct credentials:

```bash
# Test database connection (will prompt for password)
psql -h localhost -p 5432 -U postgres -d github_gg -c "SELECT version();"

# If database doesn't exist, create it
psql -h localhost -p 5432 -U postgres -c "CREATE DATABASE github_gg;"

# If user doesn't exist or password is incorrect, create/update user
psql -h localhost -p 5432 -U postgres -c "CREATE USER postgres WITH PASSWORD 'password';"
# Or update existing user password
psql -h localhost -p 5432 -U postgres -c "ALTER USER postgres PASSWORD 'password';"

# Grant necessary privileges to the user
psql -h localhost -p 5432 -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE github_gg TO postgres;"

# Verify connection with full DATABASE_URL
psql postgresql://postgres:password@localhost:5432/github_gg -c "SELECT current_database(), current_user;"
```

**Note**: If you're using Docker (recommended for local development), the database and user will be created automatically when you run `bun run db:start`.

Update the following variables in `.env.local`:
- `GITHUB_CLIENT_ID`: Your GitHub OAuth App Client ID
- `GITHUB_CLIENT_SECRET`: Your GitHub OAuth App Client Secret
- `BETTER_AUTH_SECRET`: A secure random string for session encryption (use the generated string from above)
- `DATABASE_URL`: PostgreSQL connection string (default: `postgresql://postgres:password@localhost:5432/github_gg`)

### 3. Start Database (Local Development)

```bash
# Start PostgreSQL with Docker
bun run db:start

# Run database migrations
bun run db:push
```

### 4. Start Development Server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Management

### Local Development
```bash
# Start database
bun run db:start

# Stop database
bun run db:stop

# Reset database (⚠️ Destructive - drops all data)
bun run db:reset

# View database in Drizzle Studio
bun run db:studio

# Generate new migration
bun run db:generate

# Apply migrations
bun run db:push
```

### Production Deployment (Vercel)

For production deployments:
1. Set `DATABASE_URL` in your Vercel environment variables
2. Add `bun run db:push` to your build command or as a post-deploy hook
3. No Docker needed - Vercel handles the database connection

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `BETTER_AUTH_SECRET` | Secret for session encryption | Yes |
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID | Yes |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret | Yes |
| `NEXT_PUBLIC_APP_URL` | Your app's public URL | Yes |
| `GITHUB_PUBLIC_API_KEY` | GitHub API key for unauthenticated requests | No |
| `GEMINI_API_KEY` | Google Gemini API key for AI analysis | No |

## Development vs Production

### Local Development
- Uses Docker Compose for PostgreSQL
- Loads environment from `.env.local`
- Run `bun run db:push` to apply migrations

### Production (Vercel)
- Uses production PostgreSQL (e.g., Vercel Postgres, Supabase, etc.)
- Environment variables set in Vercel dashboard
- Migrations run during build or deployment

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Project Link: [https://github.com/lantos1618/github.gg](https://github.com/lantos1618/github.gg)
