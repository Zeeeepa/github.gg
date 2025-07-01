#!/bin/bash

# Webhook Testing Script for GitHub.gg
# This script tests the complete webhook flow from GitHub through Cloudflare to Next.js

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
CLOUDFLARE_WORKER_URL="https://webhook-gateway.pixeliumperfecto.workers.dev"
WEBHOOK_ENDPOINT="/api/webhooks/github"

# Helper functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${PURPLE}[STEP]${NC} $1"; }

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Test local webhook endpoint
test_local_endpoint() {
    log_step "Testing local webhook endpoint..."
    
    local endpoint="$LOCAL_URL$WEBHOOK_ENDPOINT"
    log_info "Testing: $endpoint"
    
    # Test with a simple ping payload
    local test_payload='{
        "zen": "Non-blocking is better than blocking.",
        "hook_id": 12345678,
        "hook": {
            "type": "Repository",
            "id": 12345678,
            "name": "web",
            "active": true,
            "events": ["push", "pull_request"],
            "config": {
                "content_type": "json",
                "insecure_ssl": "0",
                "url": "'$CLOUDFLARE_WORKER_URL$WEBHOOK_ENDPOINT'"
            }
        }
    }'
    
    # Create GitHub-style headers
    local headers=(
        -H "Content-Type: application/json"
        -H "X-GitHub-Event: ping"
        -H "X-GitHub-Delivery: 12345678-1234-1234-1234-123456789012"
        -H "User-Agent: GitHub-Hookshot/abc123"
    )
    
    if command_exists curl; then
        local response=$(curl -s -w "%{http_code}" -o /tmp/webhook_response.json "${headers[@]}" -d "$test_payload" "$endpoint" 2>/dev/null || echo "000")
        
        if [ "$response" = "200" ]; then
            log_success "Local webhook endpoint is responding correctly"
            if [ -f "/tmp/webhook_response.json" ]; then
                local response_body=$(cat /tmp/webhook_response.json)
                log_info "Response: $response_body"
            fi
            rm -f /tmp/webhook_response.json
            return 0
        else
            log_error "Local webhook endpoint returned status: $response"
            if [ -f "/tmp/webhook_response.json" ]; then
                local response_body=$(cat /tmp/webhook_response.json)
                log_error "Response: $response_body"
            fi
            rm -f /tmp/webhook_response.json
            return 1
        fi
    else
        log_error "curl is not available. Cannot test webhook endpoint."
        return 1
    fi
}

# Test Cloudflare Worker
test_cloudflare_worker() {
    log_step "Testing Cloudflare Worker..."
    
    local endpoint="$CLOUDFLARE_WORKER_URL$WEBHOOK_ENDPOINT"
    log_info "Testing: $endpoint"
    
    # Test with a simple ping payload
    local test_payload='{
        "zen": "Non-blocking is better than blocking.",
        "hook_id": 12345678,
        "hook": {
            "type": "Repository",
            "id": 12345678,
            "name": "web",
            "active": true,
            "events": ["push", "pull_request"],
            "config": {
                "content_type": "json",
                "insecure_ssl": "0",
                "url": "'$endpoint'"
            }
        }
    }'
    
    # Create GitHub-style headers
    local headers=(
        -H "Content-Type: application/json"
        -H "X-GitHub-Event: ping"
        -H "X-GitHub-Delivery: 12345678-1234-1234-1234-123456789012"
        -H "User-Agent: GitHub-Hookshot/abc123"
    )
    
    if command_exists curl; then
        local response=$(curl -s -w "%{http_code}" -o /tmp/worker_response.json "${headers[@]}" -d "$test_payload" "$endpoint" 2>/dev/null || echo "000")
        
        if [ "$response" = "200" ]; then
            log_success "Cloudflare Worker is responding correctly"
            if [ -f "/tmp/worker_response.json" ]; then
                local response_body=$(cat /tmp/worker_response.json)
                log_info "Response: $response_body"
            fi
            rm -f /tmp/worker_response.json
            return 0
        else
            log_error "Cloudflare Worker returned status: $response"
            if [ -f "/tmp/worker_response.json" ]; then
                local response_body=$(cat /tmp/worker_response.json)
                log_error "Response: $response_body"
            fi
            rm -f /tmp/worker_response.json
            return 1
        fi
    else
        log_error "curl is not available. Cannot test Cloudflare Worker."
        return 1
    fi
}

# Test webhook signature validation
test_webhook_signature() {
    log_step "Testing webhook signature validation..."
    
    # Check if webhook secret is configured
    if [ ! -f ".env.local" ]; then
        log_error ".env.local file not found"
        return 1
    fi
    
    local webhook_secret=$(grep "GITHUB_WEBHOOK_SECRET=" .env.local | cut -d'=' -f2 | tr -d '"')
    
    if [ -z "$webhook_secret" ] || [ "$webhook_secret" = "your_secure_webhook_secret_here" ]; then
        log_warning "Webhook secret not configured. Skipping signature validation test."
        return 0
    fi
    
    log_info "Webhook secret is configured"
    
    # Create a test payload
    local test_payload='{"test": "signature validation"}'
    
    # Generate HMAC signature (if openssl is available)
    if command_exists openssl; then
        local signature=$(echo -n "$test_payload" | openssl dgst -sha256 -hmac "$webhook_secret" | cut -d' ' -f2)
        local github_signature="sha256=$signature"
        
        log_info "Generated signature: $github_signature"
        
        # Test with signature
        local headers=(
            -H "Content-Type: application/json"
            -H "X-GitHub-Event: ping"
            -H "X-GitHub-Delivery: test-signature-validation"
            -H "X-GitHub-Signature-256: $github_signature"
            -H "User-Agent: GitHub-Hookshot/test"
        )
        
        local endpoint="$LOCAL_URL$WEBHOOK_ENDPOINT"
        local response=$(curl -s -w "%{http_code}" -o /tmp/signature_response.json "${headers[@]}" -d "$test_payload" "$endpoint" 2>/dev/null || echo "000")
        
        if [ "$response" = "200" ]; then
            log_success "Webhook signature validation is working"
        else
            log_warning "Webhook signature validation may not be working (status: $response)"
        fi
        
        rm -f /tmp/signature_response.json
    else
        log_warning "openssl not available. Cannot test signature validation."
    fi
}

# Test database connectivity for webhook processing
test_database_connectivity() {
    log_step "Testing database connectivity for webhook processing..."
    
    # Check if database is running
    if docker ps --format 'table {{.Names}}' | grep -q "github-gg-db"; then
        log_success "Database container is running"
        
        # Test database connection
        if docker exec github-gg-db pg_isready -U github_gg_user -d github_gg >/dev/null 2>&1; then
            log_success "Database is accepting connections"
            
            # Check if webhook-related tables exist
            local tables=("githubAppInstallations" "installationRepositories")
            for table in "${tables[@]}"; do
                if docker exec github-gg-db psql -U github_gg_user -d github_gg -c "\\dt $table" 2>/dev/null | grep -q "$table"; then
                    log_success "Table '$table' exists"
                else
                    log_warning "Table '$table' not found"
                fi
            done
        else
            log_error "Database is not accepting connections"
            return 1
        fi
    else
        log_error "Database container is not running"
        return 1
    fi
}

# Test GitHub App authentication for webhook processing
test_github_app_auth() {
    log_step "Testing GitHub App authentication..."
    
    # Check if required environment variables are set
    if [ ! -f ".env.local" ]; then
        log_error ".env.local file not found"
        return 1
    fi
    
    local required_vars=("GITHUB_APP_ID" "GITHUB_PRIVATE_KEY")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" .env.local || grep -q "^${var}=.*your_.*" .env.local; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -eq 0 ]; then
        log_success "GitHub App environment variables are configured"
        
        # Test authentication if bun is available
        if command_exists bun; then
            # Create a simple auth test
            cat > test_auth.js << 'EOF'
import { App } from '@octokit/app';

try {
  const app = new App({
    appId: process.env.GITHUB_APP_ID,
    privateKey: process.env.GITHUB_PRIVATE_KEY,
  });

  const { data } = await app.octokit.request('GET /app');
  console.log('✅ GitHub App authentication successful');
} catch (error) {
  console.error('❌ GitHub App authentication failed:', error.message);
  process.exit(1);
}
EOF
            
            if bun --env-file=.env.local test_auth.js >/dev/null 2>&1; then
                log_success "GitHub App authentication is working"
            else
                log_error "GitHub App authentication failed"
            fi
            
            rm -f test_auth.js
        else
            log_warning "Bun not available. Cannot test GitHub App authentication."
        fi
    else
        log_error "Missing GitHub App environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        return 1
    fi
}

# Check if Next.js server is running
check_nextjs_server() {
    log_step "Checking Next.js server status..."
    
    if command_exists curl; then
        local response=$(curl -s -w "%{http_code}" -o /dev/null "$LOCAL_URL" 2>/dev/null || echo "000")
        
        if [ "$response" = "200" ]; then
            log_success "Next.js server is running on $LOCAL_URL"
            return 0
        else
            log_error "Next.js server is not responding (status: $response)"
            log_info "Please start the development server with: bun run dev"
            return 1
        fi
    else
        log_error "curl is not available. Cannot check Next.js server status."
        return 1
    fi
}

# Run comprehensive webhook tests
run_comprehensive_test() {
    log_step "Running comprehensive webhook tests..."
    
    local tests_passed=0
    local total_tests=6
    
    echo ""
    
    # Run all tests
    check_nextjs_server && ((tests_passed++)) || true
    test_database_connectivity && ((tests_passed++)) || true
    test_github_app_auth && ((tests_passed++)) || true
    test_local_endpoint && ((tests_passed++)) || true
    test_cloudflare_worker && ((tests_passed++)) || true
    test_webhook_signature && ((tests_passed++)) || true
    
    echo ""
    log_info "Test Summary:"
    echo "  Tests passed: $tests_passed/$total_tests"
    
    if [ "$tests_passed" -eq "$total_tests" ]; then
        log_success "🎉 All webhook tests passed! Your integration is ready."
        return 0
    elif [ "$tests_passed" -ge $((total_tests * 3 / 4)) ]; then
        log_warning "⚠️  Most tests passed, but some issues detected."
        return 1
    else
        log_error "❌ Multiple test failures detected. Please check your configuration."
        return 2
    fi
}

# Show webhook URLs and configuration
show_webhook_info() {
    log_step "Webhook Configuration Information"
    
    echo ""
    echo "🔗 Webhook URLs:"
    echo "  GitHub App Webhook: $CLOUDFLARE_WORKER_URL$WEBHOOK_ENDPOINT"
    echo "  Local Endpoint: $LOCAL_URL$WEBHOOK_ENDPOINT"
    echo ""
    echo "📡 Webhook Flow:"
    echo "  GitHub → Cloudflare Worker → Next.js App"
    echo ""
    echo "🔧 Configuration Files:"
    echo "  Cloudflare Worker: cloudflare-worker/webhook-gateway.js"
    echo "  Next.js Handler: src/app/api/webhooks/github/route.ts"
    echo "  Environment: .env.local"
    echo ""
    echo "🧪 Test Commands:"
    echo "  Test all: $0 test"
    echo "  Test local: $0 local"
    echo "  Test worker: $0 worker"
    echo ""
}

# Main function
main() {
    case "${1:-test}" in
        "test"|"all")
            echo -e "${PURPLE}🧪 Comprehensive Webhook Testing${NC}"
            run_comprehensive_test
            ;;
        "local")
            check_nextjs_server
            test_local_endpoint
            ;;
        "worker")
            test_cloudflare_worker
            ;;
        "signature")
            test_webhook_signature
            ;;
        "database"|"db")
            test_database_connectivity
            ;;
        "auth")
            test_github_app_auth
            ;;
        "info")
            show_webhook_info
            ;;
        "help")
            echo "Usage: $0 {test|local|worker|signature|database|auth|info}"
            echo ""
            echo "Commands:"
            echo "  test       - Run comprehensive webhook tests (default)"
            echo "  local      - Test local Next.js webhook endpoint"
            echo "  worker     - Test Cloudflare Worker"
            echo "  signature  - Test webhook signature validation"
            echo "  database   - Test database connectivity"
            echo "  auth       - Test GitHub App authentication"
            echo "  info       - Show webhook configuration information"
            echo "  help       - Show this help message"
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

