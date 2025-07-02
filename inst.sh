#!/bin/bash

# GitHub.gg Setup Script
# This script starts the database, runs migrations, and prepares the development environment

set -e

echo "🛠️  GitHub.gg Setup Script"
echo "=========================="

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found! Please run './ins.sh' first."
    exit 1
fi

# Check if bun is available
if ! command -v bun &> /dev/null; then
    echo "❌ Bun not found! Please run './ins.sh' first."
    exit 1
fi

# Start PostgreSQL database
echo "🐳 Starting PostgreSQL database..."
bun run db:start

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Check if database is responding
echo "🔍 Checking database connection..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if docker exec github-gg-db pg_isready -U github_gg_user -d github_gg > /dev/null 2>&1; then
        echo "✅ Database is ready!"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo "❌ Database failed to start after $max_attempts attempts"
        echo "🔧 Troubleshooting:"
        echo "   - Check if port 5432 is already in use: sudo lsof -i :5432"
        echo "   - Check Docker logs: docker logs github-gg-db"
        exit 1
    fi
    
    echo "   Attempt $attempt/$max_attempts - waiting..."
    sleep 2
    ((attempt++))
done

# Run database migrations
echo "📊 Running database migrations..."
bun run db:push

# Test database connection with correct credentials
echo "🔍 Testing database connection..."
if docker exec github-gg-db psql -U github_gg_user -d github_gg -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection successful!"
else
    echo "❌ Database connection failed"
    exit 1
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "🚀 Ready to start development:"
echo "   bun dev              # Start development server"
echo "   bun run db:studio    # Open database studio"
echo "   bun run db:stop      # Stop database when done"
echo ""
echo "📊 Database connection details:"
echo "   Host: localhost:5432"
echo "   Database: github_gg"
echo "   User: github_gg_user"
echo "   Password: github_gg_password"
echo ""
echo "🔗 Connect with psql:"
echo "   psql -h localhost -p 5432 -U github_gg_user -d github_gg"

