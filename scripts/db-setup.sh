#!/bin/bash

# Database Setup Script for GitHub.gg
# This script handles PostgreSQL setup, health checks, and migrations

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_CONTAINER_NAME="github-gg-db"
DB_NAME="github_gg"
DB_USER="github_gg_user"
DB_PASSWORD="github_gg_password"
DB_PORT="5432"
MAX_WAIT_TIME=60

# Helper functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if Docker is running
check_docker() {
    log_info "Checking Docker availability..."
    
    if ! command -v docker >/dev/null 2>&1; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    log_success "Docker is available and running"
}

# Check if Bun is available
check_bun() {
    log_info "Checking Bun availability..."
    
    if ! command -v bun >/dev/null 2>&1; then
        log_error "Bun is not installed. Please install Bun first."
        log_info "Install Bun: curl -fsSL https://bun.sh/install | bash"
        exit 1
    fi
    
    log_success "Bun is available"
}

# Start PostgreSQL container
start_database() {
    log_info "Starting PostgreSQL database..."
    
    # Check if container already exists
    if docker ps -a --format 'table {{.Names}}' | grep -q "^${DB_CONTAINER_NAME}$"; then
        log_info "Database container already exists. Checking status..."
        
        if docker ps --format 'table {{.Names}}' | grep -q "^${DB_CONTAINER_NAME}$"; then
            log_success "Database container is already running"
            return 0
        else
            log_info "Starting existing database container..."
            docker start "$DB_CONTAINER_NAME"
        fi
    else
        log_info "Creating new database container..."
        docker-compose up -d postgres
    fi
    
    log_success "Database container started"
}

# Wait for database to be ready
wait_for_database() {
    log_info "Waiting for database to be ready..."
    
    local wait_time=0
    while [ $wait_time -lt $MAX_WAIT_TIME ]; do
        if docker exec "$DB_CONTAINER_NAME" pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
            log_success "Database is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        wait_time=$((wait_time + 2))
    done
    
    log_error "Database failed to start within ${MAX_WAIT_TIME} seconds"
    return 1
}

# Test database connection
test_connection() {
    log_info "Testing database connection..."
    
    local connection_string="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}"
    
    if docker exec "$DB_CONTAINER_NAME" psql "$connection_string" -c "SELECT 1;" >/dev/null 2>&1; then
        log_success "Database connection successful"
        return 0
    else
        log_error "Database connection failed"
        return 1
    fi
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    # Check if .env.local exists
    if [ ! -f ".env.local" ]; then
        log_warning ".env.local not found. Creating from template..."
        if [ -f ".env.local.example" ]; then
            cp .env.local.example .env.local
            log_warning "Please edit .env.local with your actual configuration"
        else
            log_error ".env.local.example not found. Cannot create .env.local"
            return 1
        fi
    fi
    
    # Generate migrations if needed
    log_info "Generating database migrations..."
    if ! bun run db:generate; then
        log_warning "Migration generation failed or no changes detected"
    fi
    
    # Push migrations to database
    log_info "Applying database migrations..."
    if bun run db:push; then
        log_success "Database migrations applied successfully"
    else
        log_error "Database migration failed"
        return 1
    fi
}

# Verify database schema
verify_schema() {
    log_info "Verifying database schema..."
    
    local connection_string="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}"
    
    # Check if main tables exist
    local tables=("user" "account" "session" "verification" "githubAppInstallations" "installationRepositories")
    
    for table in "${tables[@]}"; do
        if docker exec "$DB_CONTAINER_NAME" psql "$connection_string" -c "\\dt $table" | grep -q "$table"; then
            log_success "Table '$table' exists"
        else
            log_warning "Table '$table' not found"
        fi
    done
}

# Show database status
show_status() {
    log_info "Database Status:"
    echo "  Container: $DB_CONTAINER_NAME"
    echo "  Database: $DB_NAME"
    echo "  User: $DB_USER"
    echo "  Port: $DB_PORT"
    echo "  Connection: postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}"
    
    if docker ps --format 'table {{.Names}}\t{{.Status}}' | grep -q "$DB_CONTAINER_NAME"; then
        local status=$(docker ps --format 'table {{.Names}}\t{{.Status}}' | grep "$DB_CONTAINER_NAME" | awk '{print $2, $3, $4}')
        log_success "Status: $status"
    else
        log_warning "Container is not running"
    fi
}

# Reset database (destructive operation)
reset_database() {
    log_warning "This will destroy all data in the database!"
    read -p "Are you sure you want to reset the database? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Resetting database..."
        docker-compose down -v
        docker-compose up -d postgres
        sleep 5
        wait_for_database
        run_migrations
        log_success "Database reset completed"
    else
        log_info "Database reset cancelled"
    fi
}

# Main function
main() {
    case "${1:-setup}" in
        "setup")
            log_info "🚀 Setting up GitHub.gg database..."
            check_docker
            check_bun
            start_database
            wait_for_database
            test_connection
            run_migrations
            verify_schema
            show_status
            log_success "🎉 Database setup completed!"
            ;;
        "start")
            log_info "Starting database..."
            check_docker
            start_database
            wait_for_database
            show_status
            ;;
        "stop")
            log_info "Stopping database..."
            docker-compose down
            log_success "Database stopped"
            ;;
        "status")
            show_status
            ;;
        "reset")
            reset_database
            ;;
        "migrate")
            log_info "Running migrations..."
            check_bun
            run_migrations
            ;;
        "test")
            log_info "Testing database connection..."
            test_connection
            ;;
        *)
            echo "Usage: $0 {setup|start|stop|status|reset|migrate|test}"
            echo ""
            echo "Commands:"
            echo "  setup   - Complete database setup (default)"
            echo "  start   - Start database container"
            echo "  stop    - Stop database container"
            echo "  status  - Show database status"
            echo "  reset   - Reset database (destructive)"
            echo "  migrate - Run database migrations"
            echo "  test    - Test database connection"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"

