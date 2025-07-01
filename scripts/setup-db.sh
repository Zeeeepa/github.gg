#!/bin/bash

# 🗄️ Database Setup Script for github.gg
# This script initializes PostgreSQL database and runs all necessary migrations

set -e # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if command exists
command_exists() { command -v "$1" >/dev/null 2>&1; }

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command_exists docker; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists bun; then
        log_error "Bun is not installed. Please install Bun first."
        exit 1
    fi
    
    if [ ! -f ".env.local" ]; then
        log_error ".env.local file not found. Please create it from .env.local.example"
        exit 1
    fi
    
    log_success "Prerequisites check completed"
}

# Start PostgreSQL with Docker
start_postgres() {
    log_info "Starting PostgreSQL with Docker..."
    
    # Check if postgres container is already running
    if docker ps | grep -q "postgres"; then
        log_warning "PostgreSQL container is already running"
    else
        log_info "Starting PostgreSQL container..."
        docker-compose up -d postgres
        
        # Wait for PostgreSQL to be ready
        log_info "Waiting for PostgreSQL to be ready..."
        sleep 10
        
        # Test connection
        max_attempts=30
        attempt=1
        while [ $attempt -le $max_attempts ]; do
            if docker exec $(docker-compose ps -q postgres) pg_isready -U postgres >/dev/null 2>&1; then
                log_success "PostgreSQL is ready!"
                break
            fi
            
            if [ $attempt -eq $max_attempts ]; then
                log_error "PostgreSQL failed to start after $max_attempts attempts"
                exit 1
            fi
            
            log_info "Attempt $attempt/$max_attempts: Waiting for PostgreSQL..."
            sleep 2
            ((attempt++))
        done
    fi
}

# Create database if it doesn't exist
create_database() {
    log_info "Creating database if it doesn't exist..."
    
    # Extract database name from DATABASE_URL
    DB_NAME=$(grep "DATABASE_URL" .env.local | cut -d'/' -f4 | cut -d'"' -f1)
    
    if [ -z "$DB_NAME" ]; then
        log_error "Could not extract database name from DATABASE_URL"
        exit 1
    fi
    
    log_info "Database name: $DB_NAME"
    
    # Create database if it doesn't exist
    docker exec $(docker-compose ps -q postgres) psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
    docker exec $(docker-compose ps -q postgres) psql -U postgres -c "CREATE DATABASE $DB_NAME"
    
    log_success "Database '$DB_NAME' is ready"
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    # Generate migration files if needed
    log_info "Generating migration files..."
    bun --env-file=.env.local drizzle-kit generate
    
    # Push schema to database
    log_info "Pushing schema to database..."
    bun --env-file=.env.local drizzle-kit push
    
    log_success "Database migrations completed"
}

# Verify database setup
verify_setup() {
    log_info "Verifying database setup..."
    
    # Test database connection
    if bun --env-file=.env.local -e "
        import { db } from './src/db/index.ts';
        import { sql } from 'drizzle-orm';
        try {
            await db.execute(sql\`SELECT 1\`);
            console.log('✅ Database connection successful');
        } catch (error) {
            console.error('❌ Database connection failed:', error);
            process.exit(1);
        }
    "; then
        log_success "Database connection verified"
    else
        log_error "Database connection verification failed"
        exit 1
    fi
    
    # Check if tables exist
    log_info "Checking database tables..."
    docker exec $(docker-compose ps -q postgres) psql -U postgres -d $(grep "DATABASE_URL" .env.local | cut -d'/' -f4 | cut -d'"' -f1) -c "\dt" | grep -E "(user|account|session|verification_token|github_app_installations|installation_repositories)" && \
    log_success "All required tables exist" || \
    log_warning "Some tables may be missing - this is normal for a fresh setup"
}

# Main execution
main() {
    log_info "🚀 Starting database setup for github.gg"
    
    # Check prerequisites
    check_prerequisites
    
    # Start PostgreSQL
    start_postgres
    
    # Create database
    create_database
    
    # Run migrations
    run_migrations
    
    # Verify setup
    verify_setup
    
    log_success "🎉 Database setup completed successfully!"
    log_info "You can now run 'bun run dev' to start the development server"
    log_info "Use 'bun run db:studio' to open Drizzle Studio for database management"
}

# Handle script interruption
trap 'log_error "Script interrupted"; exit 1' INT TERM

# Run main function
main "$@"

