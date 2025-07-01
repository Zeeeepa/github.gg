#!/bin/bash

# 🚀 Cloudflare Worker Deployment Script for github.gg
# This script deploys the webhook gateway worker to Cloudflare

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
    
    if ! command_exists wrangler; then
        log_error "Wrangler CLI is not installed. Install with: npm install -g wrangler"
        exit 1
    fi
    
    if [ ! -f "cloudflare-worker/webhook-gateway.js" ]; then
        log_error "Webhook gateway worker file not found"
        exit 1
    fi
    
    if [ ! -f ".env.local" ]; then
        log_error ".env.local file not found. Please create it first."
        exit 1
    fi
    
    log_success "Prerequisites check completed"
}

# Authenticate with Cloudflare
authenticate_cloudflare() {
    log_info "Checking Cloudflare authentication..."
    
    # Check if already authenticated
    if wrangler whoami >/dev/null 2>&1; then
        log_success "Already authenticated with Cloudflare"
        return
    fi
    
    log_info "Please authenticate with Cloudflare..."
    log_info "You can either:"
    log_info "1. Run 'wrangler login' to authenticate via browser"
    log_info "2. Set CLOUDFLARE_API_TOKEN environment variable"
    log_info "3. Use the provided Global API Key"
    
    # Try to use the API key from .env.local if available
    if grep -q "CLOUDFLARE_GLOBAL_API_KEY" .env.local; then
        log_info "Found Cloudflare API key in .env.local"
        export CLOUDFLARE_API_KEY=$(grep "CLOUDFLARE_GLOBAL_API_KEY" .env.local | cut -d'=' -f2 | tr -d '"')
        export CLOUDFLARE_EMAIL="your-email@example.com" # User needs to set this
        log_warning "Please set CLOUDFLARE_EMAIL in your environment or .env.local file"
    else
        log_info "Running wrangler login..."
        wrangler login
    fi
}

# Deploy the worker
deploy_worker() {
    log_info "Deploying webhook gateway worker..."
    
    cd cloudflare-worker
    
    # Deploy to development environment first
    log_info "Deploying to development environment..."
    wrangler deploy --env development
    
    # Set webhook secret
    log_info "Setting webhook secret..."
    WEBHOOK_SECRET=$(grep "GITHUB_WEBHOOK_SECRET" ../.env.local | cut -d'=' -f2 | tr -d '"')
    if [ -n "$WEBHOOK_SECRET" ] && [ "$WEBHOOK_SECRET" != "your-webhook-secret-generate-random-string" ]; then
        echo "$WEBHOOK_SECRET" | wrangler secret put GITHUB_WEBHOOK_SECRET --env development
        log_success "Webhook secret configured"
    else
        log_warning "Webhook secret not found or not set. Please set it manually:"
        log_info "wrangler secret put GITHUB_WEBHOOK_SECRET --env development"
    fi
    
    cd ..
    
    log_success "Worker deployed successfully"
}

# Test the deployment
test_deployment() {
    log_info "Testing worker deployment..."
    
    WORKER_URL=$(grep "CLOUDFLARE_WORKER_URL" .env.local | cut -d'=' -f2 | tr -d '"')
    
    if [ -z "$WORKER_URL" ]; then
        log_error "CLOUDFLARE_WORKER_URL not found in .env.local"
        return 1
    fi
    
    # Test health endpoint
    log_info "Testing health endpoint: $WORKER_URL/health"
    
    if curl -s "$WORKER_URL/health" | grep -q "healthy"; then
        log_success "Worker health check passed"
    else
        log_warning "Worker health check failed - this may be normal if the worker is still deploying"
    fi
    
    log_info "Worker URL: $WORKER_URL"
    log_info "Health check: $WORKER_URL/health"
    log_info "Webhook endpoint: $WORKER_URL/api/webhooks/github"
}

# Update GitHub App webhook URL
update_github_webhook() {
    log_info "GitHub App webhook configuration:"
    log_info "Please update your GitHub App webhook URL to:"
    
    WORKER_URL=$(grep "CLOUDFLARE_WORKER_URL" .env.local | cut -d'=' -f2 | tr -d '"')
    echo -e "${GREEN}$WORKER_URL/api/webhooks/github${NC}"
    
    log_info "You can do this at: https://github.com/settings/apps"
    log_info "1. Go to your GitHub App settings"
    log_info "2. Update the Webhook URL"
    log_info "3. Ensure the webhook secret matches what you set in the worker"
}

# Main execution
main() {
    log_info "🚀 Starting Cloudflare Worker deployment for github.gg"
    
    # Check prerequisites
    check_prerequisites
    
    # Authenticate with Cloudflare
    authenticate_cloudflare
    
    # Deploy the worker
    deploy_worker
    
    # Test the deployment
    test_deployment
    
    # Show GitHub webhook configuration
    update_github_webhook
    
    log_success "🎉 Cloudflare Worker deployment completed!"
    log_info "Your webhook gateway is now ready to route GitHub webhooks"
}

# Handle script interruption
trap 'log_error "Script interrupted"; exit 1' INT TERM

# Run main function
main "$@"

