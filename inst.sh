#!/bin/bash

# 🚀 GitHub.gg Simple Installation Script
# This script sets up GitHub.gg with your GitHub App and Cloudflare Worker configuration

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/lantos1618/github.gg.git"
BRANCH_NAME="rewrite-github-app"
PROJECT_DIR="github.gg"

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
    echo "║                    🚀 GitHub.gg Setup                       ║"
    echo "║                                                              ║"
    echo "║  Simple installation with npm workflow                      ║"
    echo "║  • npm install                                               ║"
    echo "║  • npm run setup                                             ║"
    echo "║  • npm run dev                                               ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    log_step "Checking prerequisites..."
    
    # Check Git
    if ! command_exists git; then
        log_error "Git is not installed. Please install Git first."
        exit 1
    fi
    log_success "Git is available"
    
    # Check Bun
    if ! command_exists bun; then
        log_warning "Bun is not installed. Installing Bun..."
        curl -fsSL https://bun.sh/install | bash
        export PATH="$HOME/.bun/bin:$PATH"
        if ! command_exists bun; then
            log_error "Bun installation failed. Please install manually: https://bun.sh"
            exit 1
        fi
    fi
    log_success "Bun is available"
    
    # Check Docker
    if ! command_exists docker; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    log_success "Docker is available and running"
}

# Clone repository
clone_repository() {
    log_step "Setting up repository..."
    
    # Remove existing directory if it exists
    if [ -d "$PROJECT_DIR" ]; then
        log_warning "Directory $PROJECT_DIR already exists. Removing..."
        rm -rf "$PROJECT_DIR"
    fi
    
    # Clone the repository
    log_info "Cloning $REPO_URL..."
    git clone "$REPO_URL" "$PROJECT_DIR"
    
    # Navigate to project directory
    cd "$PROJECT_DIR"
    
    # Checkout the correct branch
    log_info "Checking out branch: $BRANCH_NAME"
    git checkout "$BRANCH_NAME"
    
    log_success "Repository setup completed"
}

# Setup environment
setup_environment() {
    log_step "Setting up environment configuration..."
    
    # Create .env.local from template
    if [ -f ".env.local.example" ]; then
        if [ ! -f ".env.local" ]; then
            log_info "Creating .env.local from template..."
            cp .env.local.example .env.local
            log_success "Environment file created"
            log_warning "Please edit .env.local with your actual GitHub App credentials"
        else
            log_info ".env.local already exists"
        fi
    else
        log_error ".env.local.example not found"
        return 1
    fi
}

# Show next steps
show_next_steps() {
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                     🎉 Setup Complete!                      ║${NC}"
    echo -e "${GREEN}║                                                              ║${NC}"
    echo -e "${GREEN}║  Next steps:                                                 ║${NC}"
    echo -e "${GREEN}║                                                              ║${NC}"
    echo -e "${GREEN}║  1. npm install          # Install dependencies             ║${NC}"
    echo -e "${GREEN}║  2. Edit .env.local      # Add your GitHub App credentials  ║${NC}"
    echo -e "${GREEN}║  3. npm run setup        # Setup database                   ║${NC}"
    echo -e "${GREEN}║  4. npm run dev          # Start development server         ║${NC}"
    echo -e "${GREEN}║                                                              ║${NC}"
    echo -e "${GREEN}║  Your GitHub App configuration:                             ║${NC}"
    echo -e "${GREEN}║  • App Name: zeeeepa                                        ║${NC}"
    echo -e "${GREEN}║  • App ID: 1484403                                          ║${NC}"
    echo -e "${GREEN}║  • Homepage: http://localhost:3001                          ║${NC}"
    echo -e "${GREEN}║  • Webhook: webhook-gateway.pixeliumperfecto.workers.dev    ║${NC}"
    echo -e "${GREEN}║                                                              ║${NC}"
    echo -e "${GREEN}║  Install GitHub App: https://github.com/apps/zeeeepa        ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Main execution
main() {
    print_banner
    check_prerequisites
    clone_repository
    setup_environment
    show_next_steps
}

# Run main function
main "$@"

