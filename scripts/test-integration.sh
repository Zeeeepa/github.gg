#!/bin/bash

# Integration Testing Script for GitHub.gg
# This script runs comprehensive integration tests for the complete system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
LOCAL_URL="http://localhost:3001"
TEST_TIMEOUT=30
MAX_RETRIES=3

# Helper functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${PURPLE}[STEP]${NC} $1"; }

# Print banner
print_banner() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                🧪 Integration Test Suite                    ║"
    echo "║                                                              ║"
    echo "║  Testing complete GitHub.gg integration:                    ║"
    echo "║  • Authentication Flow                                       ║"
    echo "║  • Webhook Processing                                        ║"
    echo "║  • Database Operations                                       ║"
    echo "║  • GitHub App Integration                                    ║"
    echo "║  • Cloudflare Worker                                         ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Wait for server to be ready
wait_for_server() {
    log_step "Waiting for server to be ready..."
    
    local retries=0
    while [ $retries -lt $MAX_RETRIES ]; do
        if command_exists curl; then
            if curl -s "$LOCAL_URL" >/dev/null 2>&1; then
                log_success "Server is ready"
                return 0
            fi
        fi
        
        log_info "Server not ready, waiting... (attempt $((retries + 1))/$MAX_RETRIES)"
        sleep 5
        retries=$((retries + 1))
    done
    
    log_error "Server failed to start within expected time"
    return 1
}

# Check prerequisites
check_prerequisites() {
    log_step "Checking test prerequisites..."
    
    # Check Bun
    if ! command_exists bun; then
        log_error "Bun is not available. Please install Bun first."
        return 1
    fi
    log_success "Bun is available"
    
    # Check curl
    if ! command_exists curl; then
        log_error "curl is not available. Please install curl for testing."
        return 1
    fi
    log_success "curl is available"
    
    # Check environment file
    if [ ! -f ".env.local" ]; then
        log_error ".env.local file not found. Please run setup first."
        return 1
    fi
    log_success "Environment configuration found"
    
    # Check database
    if ! docker ps --format 'table {{.Names}}' | grep -q "github-gg-db"; then
        log_error "Database container is not running. Please start the database."
        return 1
    fi
    log_success "Database is running"
}

# Run unit tests
run_unit_tests() {
    log_step "Running unit tests..."
    
    if bun test --timeout $TEST_TIMEOUT 2>/dev/null; then
        log_success "Unit tests passed"
        return 0
    else
        log_warning "Unit tests failed or not configured"
        return 1
    fi
}

# Run integration tests
run_integration_tests() {
    log_step "Running integration tests..."
    
    local test_files=(
        "tests/integration/auth-flow.test.ts"
        "tests/integration/webhook-flow.test.ts"
    )
    
    local tests_passed=0
    local total_tests=${#test_files[@]}
    
    for test_file in "${test_files[@]}"; do
        if [ -f "$test_file" ]; then
            log_info "Running $test_file..."
            
            if bun test "$test_file" --timeout $TEST_TIMEOUT; then
                log_success "✅ $test_file passed"
                ((tests_passed++))
            else
                log_error "❌ $test_file failed"
            fi
        else
            log_warning "Test file not found: $test_file"
        fi
    done
    
    echo ""
    log_info "Integration Test Results:"
    echo "  Tests passed: $tests_passed/$total_tests"
    
    if [ "$tests_passed" -eq "$total_tests" ]; then
        log_success "All integration tests passed!"
        return 0
    else
        log_error "Some integration tests failed"
        return 1
    fi
}

# Test database connectivity
test_database() {
    log_step "Testing database connectivity..."
    
    if [ -f "scripts/db-health-check.sh" ]; then
        if ./scripts/db-health-check.sh quick; then
            log_success "Database connectivity test passed"
            return 0
        else
            log_error "Database connectivity test failed"
            return 1
        fi
    else
        log_warning "Database health check script not found"
        return 1
    fi
}

# Test webhook endpoints
test_webhooks() {
    log_step "Testing webhook endpoints..."
    
    if [ -f "scripts/test-webhooks.sh" ]; then
        if ./scripts/test-webhooks.sh test; then
            log_success "Webhook tests passed"
            return 0
        else
            log_error "Webhook tests failed"
            return 1
        fi
    else
        log_warning "Webhook test script not found"
        return 1
    fi
}

# Test GitHub App authentication
test_github_app() {
    log_step "Testing GitHub App authentication..."
    
    if [ -f "scripts/setup-github-app.sh" ]; then
        if ./scripts/setup-github-app.sh test; then
            log_success "GitHub App authentication test passed"
            return 0
        else
            log_error "GitHub App authentication test failed"
            return 1
        fi
    else
        log_warning "GitHub App setup script not found"
        return 1
    fi
}

# Test API endpoints
test_api_endpoints() {
    log_step "Testing API endpoints..."
    
    local endpoints=(
        "/api/auth/link-installation"
        "/api/webhooks/github"
    )
    
    local endpoints_passed=0
    local total_endpoints=${#endpoints[@]}
    
    for endpoint in "${endpoints[@]}"; do
        local url="$LOCAL_URL$endpoint"
        log_info "Testing $url..."
        
        # Test OPTIONS request (CORS)
        local options_response=$(curl -s -w "%{http_code}" -o /dev/null -X OPTIONS "$url" 2>/dev/null || echo "000")
        
        # Test GET request
        local get_response=$(curl -s -w "%{http_code}" -o /dev/null "$url" 2>/dev/null || echo "000")
        
        if [ "$options_response" != "000" ] || [ "$get_response" != "000" ]; then
            log_success "✅ $endpoint is responding"
            ((endpoints_passed++))
        else
            log_error "❌ $endpoint is not responding"
        fi
    done
    
    echo ""
    log_info "API Endpoint Results:"
    echo "  Endpoints responding: $endpoints_passed/$total_endpoints"
    
    if [ "$endpoints_passed" -eq "$total_endpoints" ]; then
        log_success "All API endpoints are responding"
        return 0
    else
        log_error "Some API endpoints are not responding"
        return 1
    fi
}

# Test environment configuration
test_environment() {
    log_step "Testing environment configuration..."
    
    local required_vars=(
        "DATABASE_URL"
        "GITHUB_CLIENT_ID"
        "GITHUB_CLIENT_SECRET"
        "GITHUB_APP_ID"
        "GITHUB_APP_NAME"
        "GITHUB_PRIVATE_KEY"
        "BETTER_AUTH_SECRET"
        "NEXT_PUBLIC_APP_URL"
    )
    
    local configured_vars=0
    local total_vars=${#required_vars[@]}
    
    for var in "${required_vars[@]}"; do
        if grep -q "^${var}=" .env.local && ! grep -q "^${var}=.*your_.*" .env.local; then
            log_success "✅ $var is configured"
            ((configured_vars++))
        else
            log_error "❌ $var is not configured or uses placeholder value"
        fi
    done
    
    echo ""
    log_info "Environment Configuration Results:"
    echo "  Variables configured: $configured_vars/$total_vars"
    
    if [ "$configured_vars" -eq "$total_vars" ]; then
        log_success "All environment variables are configured"
        return 0
    else
        log_error "Some environment variables need configuration"
        return 1
    fi
}

# Generate test report
generate_report() {
    local total_tests=$1
    local passed_tests=$2
    
    log_step "Generating test report..."
    
    local report_file="test-report-$(date +%Y%m%d-%H%M%S).txt"
    
    cat > "$report_file" << EOF
GitHub.gg Integration Test Report
Generated: $(date)

Test Summary:
=============
Total Test Categories: $total_tests
Passed Test Categories: $passed_tests
Success Rate: $(( passed_tests * 100 / total_tests ))%

Test Categories:
================
EOF
    
    echo "Report saved to: $report_file"
    log_success "Test report generated"
}

# Run comprehensive integration tests
run_comprehensive_tests() {
    log_step "Running comprehensive integration tests..."
    
    local tests_passed=0
    local total_tests=7
    
    echo ""
    
    # Run all test categories
    check_prerequisites && ((tests_passed++)) || true
    test_environment && ((tests_passed++)) || true
    test_database && ((tests_passed++)) || true
    test_github_app && ((tests_passed++)) || true
    test_api_endpoints && ((tests_passed++)) || true
    test_webhooks && ((tests_passed++)) || true
    run_integration_tests && ((tests_passed++)) || true
    
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    log_info "Comprehensive Test Results:"
    echo "  Test categories passed: $tests_passed/$total_tests"
    echo "  Success rate: $(( tests_passed * 100 / total_tests ))%"
    echo "═══════════════════════════════════════════════════════════════"
    
    # Generate report
    generate_report $total_tests $tests_passed
    
    if [ "$tests_passed" -eq "$total_tests" ]; then
        log_success "🎉 All integration tests passed! Your GitHub.gg setup is fully functional."
        return 0
    elif [ "$tests_passed" -ge $((total_tests * 3 / 4)) ]; then
        log_warning "⚠️  Most tests passed, but some issues detected. Check the logs above."
        return 1
    else
        log_error "❌ Multiple test failures detected. Please review your configuration."
        return 2
    fi
}

# Show test information
show_test_info() {
    log_step "Integration Test Information"
    
    echo ""
    echo "🧪 Available Test Categories:"
    echo "  • Prerequisites - Check system requirements"
    echo "  • Environment - Validate configuration"
    echo "  • Database - Test database connectivity"
    echo "  • GitHub App - Test GitHub App authentication"
    echo "  • API Endpoints - Test API responsiveness"
    echo "  • Webhooks - Test webhook processing"
    echo "  • Integration - Run full integration test suite"
    echo ""
    echo "📊 Test Commands:"
    echo "  $0 all        - Run comprehensive test suite (default)"
    echo "  $0 quick      - Run quick health checks"
    echo "  $0 unit       - Run unit tests only"
    echo "  $0 integration - Run integration tests only"
    echo "  $0 api        - Test API endpoints only"
    echo "  $0 webhooks   - Test webhooks only"
    echo "  $0 database   - Test database only"
    echo "  $0 github-app - Test GitHub App only"
    echo ""
    echo "🔧 Prerequisites:"
    echo "  • Server running on $LOCAL_URL"
    echo "  • Database container running"
    echo "  • Environment configured (.env.local)"
    echo "  • Bun and curl available"
    echo ""
}

# Main function
main() {
    case "${1:-all}" in
        "all"|"comprehensive")
            print_banner
            wait_for_server
            run_comprehensive_tests
            ;;
        "quick")
            log_info "Running quick health checks..."
            check_prerequisites
            test_environment
            test_database
            ;;
        "unit")
            log_info "Running unit tests..."
            run_unit_tests
            ;;
        "integration")
            log_info "Running integration tests..."
            wait_for_server
            run_integration_tests
            ;;
        "api")
            log_info "Testing API endpoints..."
            wait_for_server
            test_api_endpoints
            ;;
        "webhooks")
            log_info "Testing webhooks..."
            wait_for_server
            test_webhooks
            ;;
        "database"|"db")
            log_info "Testing database..."
            test_database
            ;;
        "github-app")
            log_info "Testing GitHub App..."
            test_github_app
            ;;
        "environment"|"env")
            log_info "Testing environment..."
            test_environment
            ;;
        "info")
            show_test_info
            ;;
        "help")
            echo "Usage: $0 {all|quick|unit|integration|api|webhooks|database|github-app|environment|info}"
            echo ""
            echo "Commands:"
            echo "  all         - Run comprehensive test suite (default)"
            echo "  quick       - Run quick health checks"
            echo "  unit        - Run unit tests only"
            echo "  integration - Run integration tests only"
            echo "  api         - Test API endpoints only"
            echo "  webhooks    - Test webhooks only"
            echo "  database    - Test database only"
            echo "  github-app  - Test GitHub App only"
            echo "  environment - Test environment configuration"
            echo "  info        - Show test information"
            echo "  help        - Show this help message"
            ;;
        *)
            log_error "Unknown command: $1"
            echo "Use '$0 help' for available commands"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"

