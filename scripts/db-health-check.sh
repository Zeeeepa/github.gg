#!/bin/bash

# Database Health Check Script for GitHub.gg
# This script performs comprehensive health checks on the PostgreSQL database

set -e

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

# Helper functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if container is running
check_container() {
    log_info "Checking database container status..."
    
    if docker ps --format 'table {{.Names}}' | grep -q "^${DB_CONTAINER_NAME}$"; then
        log_success "Database container is running"
        return 0
    else
        log_error "Database container is not running"
        return 1
    fi
}

# Check database connectivity
check_connectivity() {
    log_info "Checking database connectivity..."
    
    if docker exec "$DB_CONTAINER_NAME" pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
        log_success "Database is accepting connections"
        return 0
    else
        log_error "Database is not accepting connections"
        return 1
    fi
}

# Check database version
check_version() {
    log_info "Checking PostgreSQL version..."
    
    local version=$(docker exec "$DB_CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT version();" 2>/dev/null | head -1 | xargs)
    
    if [ -n "$version" ]; then
        log_success "PostgreSQL version: $version"
        return 0
    else
        log_error "Could not retrieve PostgreSQL version"
        return 1
    fi
}

# Check database size
check_database_size() {
    log_info "Checking database size..."
    
    local size=$(docker exec "$DB_CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));" 2>/dev/null | xargs)
    
    if [ -n "$size" ]; then
        log_success "Database size: $size"
        return 0
    else
        log_error "Could not retrieve database size"
        return 1
    fi
}

# Check table existence and row counts
check_tables() {
    log_info "Checking database tables..."
    
    local connection_string="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}"
    local tables=("user" "account" "session" "verification" "githubAppInstallations" "installationRepositories")
    
    for table in "${tables[@]}"; do
        if docker exec "$DB_CONTAINER_NAME" psql "$connection_string" -c "\\dt $table" 2>/dev/null | grep -q "$table"; then
            local count=$(docker exec "$DB_CONTAINER_NAME" psql "$connection_string" -t -c "SELECT COUNT(*) FROM \"$table\";" 2>/dev/null | xargs)
            if [ -n "$count" ]; then
                log_success "Table '$table': $count rows"
            else
                log_warning "Table '$table': exists but could not count rows"
            fi
        else
            log_warning "Table '$table': not found"
        fi
    done
}

# Check database connections
check_connections() {
    log_info "Checking active database connections..."
    
    local connections=$(docker exec "$DB_CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT count(*) FROM pg_stat_activity WHERE datname = '$DB_NAME';" 2>/dev/null | xargs)
    
    if [ -n "$connections" ]; then
        log_success "Active connections: $connections"
        return 0
    else
        log_error "Could not retrieve connection count"
        return 1
    fi
}

# Check database performance metrics
check_performance() {
    log_info "Checking database performance metrics..."
    
    # Check for long-running queries
    local long_queries=$(docker exec "$DB_CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active' AND now() - query_start > interval '1 minute';" 2>/dev/null | xargs)
    
    if [ -n "$long_queries" ]; then
        if [ "$long_queries" -eq 0 ]; then
            log_success "No long-running queries detected"
        else
            log_warning "Long-running queries: $long_queries"
        fi
    fi
    
    # Check cache hit ratio
    local cache_hit_ratio=$(docker exec "$DB_CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT round(sum(blks_hit)*100/sum(blks_hit+blks_read), 2) AS cache_hit_ratio FROM pg_stat_database WHERE datname = '$DB_NAME';" 2>/dev/null | xargs)
    
    if [ -n "$cache_hit_ratio" ] && [ "$cache_hit_ratio" != "" ]; then
        log_success "Cache hit ratio: ${cache_hit_ratio}%"
    fi
}

# Check disk usage
check_disk_usage() {
    log_info "Checking container disk usage..."
    
    local disk_usage=$(docker exec "$DB_CONTAINER_NAME" df -h /var/lib/postgresql/data 2>/dev/null | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [ -n "$disk_usage" ]; then
        if [ "$disk_usage" -lt 80 ]; then
            log_success "Disk usage: ${disk_usage}%"
        elif [ "$disk_usage" -lt 90 ]; then
            log_warning "Disk usage: ${disk_usage}% (getting high)"
        else
            log_error "Disk usage: ${disk_usage}% (critically high)"
        fi
    fi
}

# Check environment configuration
check_environment() {
    log_info "Checking environment configuration..."
    
    if [ -f ".env.local" ]; then
        log_success ".env.local file exists"
        
        # Check if DATABASE_URL is set correctly
        if grep -q "DATABASE_URL.*postgresql.*${DB_USER}.*${DB_NAME}" .env.local; then
            log_success "DATABASE_URL is configured correctly"
        else
            log_warning "DATABASE_URL may not be configured correctly"
        fi
    else
        log_warning ".env.local file not found"
    fi
}

# Run comprehensive health check
run_health_check() {
    log_info "🏥 Running comprehensive database health check..."
    echo ""
    
    local checks_passed=0
    local total_checks=8
    
    # Run all checks
    check_container && ((checks_passed++)) || true
    check_connectivity && ((checks_passed++)) || true
    check_version && ((checks_passed++)) || true
    check_database_size && ((checks_passed++)) || true
    check_tables && ((checks_passed++)) || true
    check_connections && ((checks_passed++)) || true
    check_performance && ((checks_passed++)) || true
    check_disk_usage && ((checks_passed++)) || true
    
    echo ""
    log_info "Health Check Summary:"
    echo "  Checks passed: $checks_passed/$total_checks"
    
    if [ "$checks_passed" -eq "$total_checks" ]; then
        log_success "🎉 All health checks passed! Database is healthy."
        return 0
    elif [ "$checks_passed" -ge $((total_checks * 3 / 4)) ]; then
        log_warning "⚠️  Most health checks passed, but some issues detected."
        return 1
    else
        log_error "❌ Multiple health check failures detected. Database may have issues."
        return 2
    fi
}

# Show detailed database information
show_detailed_info() {
    log_info "📊 Detailed Database Information:"
    echo ""
    
    check_container
    check_connectivity
    check_version
    check_database_size
    check_tables
    check_connections
    check_performance
    check_disk_usage
    check_environment
}

# Main function
main() {
    case "${1:-health}" in
        "health"|"check")
            run_health_check
            ;;
        "info"|"detailed")
            show_detailed_info
            ;;
        "quick")
            log_info "🚀 Quick health check..."
            check_container && check_connectivity && log_success "Database is running and accessible"
            ;;
        *)
            echo "Usage: $0 {health|info|quick}"
            echo ""
            echo "Commands:"
            echo "  health  - Run comprehensive health check (default)"
            echo "  info    - Show detailed database information"
            echo "  quick   - Quick connectivity check"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"

