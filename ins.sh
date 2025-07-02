#!/bin/bash

# GitHub.gg Installation Script
# This script installs all dependencies and sets up the development environment

set -e

echo "🚀 GitHub.gg Installation Script"
echo "================================="

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "📦 Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
    
    # Add bun to PATH for current session
    export PATH="$HOME/.bun/bin:$PATH"
    
    # Add to bashrc if not already there
    if ! grep -q "/.bun/bin" ~/.bashrc; then
        echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.bashrc
    fi
    
    echo "✅ Bun installed successfully!"
else
    echo "✅ Bun is already installed"
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "🐳 Docker not found. Please install Docker first:"
    echo "   Ubuntu/Debian: sudo apt-get install docker.io docker-compose"
    echo "   macOS: Install Docker Desktop"
    echo "   Windows: Install Docker Desktop"
    exit 1
else
    echo "✅ Docker is available"
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "🐳 Docker Compose not found. Please install docker-compose"
    exit 1
else
    echo "✅ Docker Compose is available"
fi

# Install dependencies
echo "📦 Installing project dependencies..."
bun install

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "⚙️  Creating .env.local file..."
    cat > .env.local << 'EOF'
# Database Configuration
DATABASE_URL="postgresql://github_gg_user:github_gg_password@localhost:5432/github_gg"

# Better Auth Configuration
BETTER_AUTH_SECRET="your-super-secret-key-change-this-in-production"

# GitHub OAuth Configuration
GITHUB_CLIENT_ID="Iv23li9PqHMExi84gaq1"
GITHUB_CLIENT_SECRET="d1fbd80a53d530773b3361f23efab3732c436a7b"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: GitHub API Key for unauthenticated requests
# GITHUB_PUBLIC_API_KEY=""

# Optional: Google Gemini API Key for AI analysis
# GEMINI_API_KEY=""
EOF
    echo "✅ Created .env.local with default configuration"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🎉 Installation completed successfully!"
echo ""
echo "Next steps:"
echo "1. Run './inst.sh' to start the database and run migrations"
echo "2. Run 'bun dev' to start the development server"
echo ""
echo "📝 Don't forget to:"
echo "   - Update your GitHub OAuth credentials in .env.local if needed"
echo "   - Add your API keys for additional features"

