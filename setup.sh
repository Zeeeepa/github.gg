#!/bin/bash

# 🚀 Master Setup Script for github.gg
# This script sets up the entire github.gg application with GitHub App and Cloudflare Worker integration

set -e # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Helper functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${PURPLE}[STEP]${NC} $1"; }

# Check if command exists
command_exists() { command -v "$1" >/dev/null 2>&1; }

# Print banner
print_banner() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    🚀 GitHub.gg Setup                       ║"
    echo "║              Complete Integration Setup Script               ║"
    echo "║                                                              ║"
    echo "║  This script will set up:                                   ║"
    echo "║  • Environment configuration                                 ║"
    echo "║  • PostgreSQL database                                      ║"
    echo "║  • Cloudflare Worker deployment                             ║"
    echo "║  • GitHub App integration                                   ║"
    echo "║  • Development server                                       ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_step "Checking prerequisites..."
    
    local missing_deps=()
    
    if ! command_exists bun; then
        missing_deps+=("bun")
    fi
    
    if ! command_exists docker; then
        missing_deps+=("docker")
    fi
    
    if ! command_exists git; then
        missing_deps+=("git")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        log_info "Please install the missing dependencies and run this script again."
        exit 1
    fi
    
    log_success "All prerequisites are installed"
}

# Setup environment
setup_environment() {
    log_step "Setting up environment configuration..."
    
    if [ ! -f ".env.local.example" ]; then
        log_error ".env.local.example not found. This should have been created by the fixes."
        exit 1
    fi
    
    if [ ! -f ".env.local" ]; then
        log_info "Creating .env.local from example..."
        cp .env.local.example .env.local
        log_warning "Please edit .env.local with your actual credentials before continuing."
        log_info "Required changes:"
        log_info "1. Add your GitHub private key content"
        log_info "2. Set a secure BETTER_AUTH_SECRET"
        log_info "3. Set GITHUB_WEBHOOK_SECRET"
        log_info "4. Optionally add GEMINI_API_KEY for AI analysis"
        
        read -p "Press Enter after you've updated .env.local..."
    fi
    
    # Validate critical environment variables
    if ! grep -q "BEGIN RSA PRIVATE KEY" .env.local; then
        log_warning "GitHub private key not found in .env.local"
        log_info "Please add the content from zeeeepa.2025-06-30.private-key.pem"
    fi
    
    log_success "Environment configuration ready"
}

# Setup database
setup_database() {
    log_step "Setting up PostgreSQL database..."
    
    if [ -f "scripts/setup-db.sh" ]; then
        log_info "Running database setup script..."
        ./scripts/setup-db.sh
    else
        log_warning "Database setup script not found, running manual setup..."
        bun run setup
    fi
    
    log_success "Database setup completed"
}

# Deploy Cloudflare Worker
deploy_worker() {
    log_step "Deploying Cloudflare Worker..."
    
    if [ -f "scripts/deploy-worker.sh" ]; then
        log_info "Running Cloudflare Worker deployment..."
        log_warning "This step requires Cloudflare authentication."
        log_info "You may need to run 'wrangler login' if not already authenticated."
        
        read -p "Do you want to deploy the Cloudflare Worker now? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            ./scripts/deploy-worker.sh
        else
            log_info "Skipping Cloudflare Worker deployment."
            log_info "You can deploy it later with: ./scripts/deploy-worker.sh"
        fi
    else
        log_warning "Cloudflare Worker deployment script not found"
        log_info "You can deploy manually from the cloudflare-worker directory"
    fi
}

# Install dependencies
install_dependencies() {
    log_step "Installing dependencies..."
    
    if [ -f "bun.lockb" ]; then
        log_info "Installing with bun..."
        bun install
    elif [ -f "package-lock.json" ]; then
        log_info "Installing with npm..."
        npm install
    elif [ -f "yarn.lock" ]; then
        log_info "Installing with yarn..."
        yarn install
    else
        log_info "Installing with bun (default)..."
        bun install
    fi
    
    log_success "Dependencies installed"
}

# Build application
build_application() {
    log_step "Building application..."
    
    log_info "Running production build to verify everything works..."
    bun run build
    
    log_success "Application built successfully"
}

# GitHub App installation guide
github_app_guide() {
    log_step "GitHub App Installation Guide"
    
    echo -e "${YELLOW}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                   GitHub App Installation                    ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    log_info "To complete the setup, you need to install the GitHub App:"
    log_info "1. Visit: https://github.com/settings/apps"
    log_info "2. Find your 'zeeeepa' app"
    log_info "3. Click 'Install App'"
    log_info "4. Choose your personal account or organization"
    log_info "5. Select repositories to analyze"
    log_info ""
    log_info "After installation, visit: http://localhost:3001/install"
    log_info "This will link the installation to your user account."
}

# Start development server
start_development() {
    log_step "Starting development server..."
    
    log_success "🎉 Setup completed successfully!"
    log_info ""
    log_info "Your github.gg application is ready!"
    log_info ""
    log_info "📍 Application URL: http://localhost:3001"
    log_info "🗄️  Database Studio: http://localhost:4983 (run 'bun run db:studio')"
    log_info "🔗 Webhook Gateway: https://webhook-gateway.pixeliumperfecto.workers.dev"
    log_info ""
    log_info "Next steps:"
    log_info "1. Install the GitHub App (see instructions above)"
    log_info "2. Start the development server: bun run dev"
    log_info "3. Visit http://localhost:3001 to test the application"
    log_info ""
    
    read -p "Do you want to start the development server now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Starting development server..."
        bun run dev
    else
        log_info "You can start the development server later with: bun run dev"
    fi
}

# Error handling
handle_error() {
    log_error "Setup failed at step: $1"
    log_info "Check the error messages above for details."
    log_info "You can also check the troubleshooting guide: docs/troubleshooting.md"
    exit 1
}

# Main execution
main() {
    print_banner
    
    # Run setup steps
    check_prerequisites || handle_error "Prerequisites check"
    install_dependencies || handle_error "Dependencies installation"
    setup_environment || handle_error "Environment setup"
    setup_database || handle_error "Database setup"
    build_application || handle_error "Application build"
    deploy_worker || handle_error "Cloudflare Worker deployment"
    
    # Show final instructions
    github_app_guide
    start_development
}

# Handle script interruption
trap 'log_error "Setup interrupted"; exit 1' INT TERM

# Run main function
main "$@"

