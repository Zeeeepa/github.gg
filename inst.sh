#!/bin/bash

# 🚀 Enhanced GitHub.gg Installation Script
# Optimized for Bun runtime with comprehensive setup automation
# This script handles database setup, environment configuration, and development server startup

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/lantos1618/github.gg.git"
BRANCH_NAME="rewrite-github-app"
PROJECT_DIR="github.gg"
REQUIRED_PORT=3001

# Helper functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${PURPLE}[STEP]${NC} $1"; }
log_debug() { echo -e "${CYAN}[DEBUG]${NC} $1"; }

# Print banner
print_banner() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    🚀 GitHub.gg Setup                       ║"
    echo "║              Enhanced Installation Script                    ║"
    echo "║                                                              ║"
    echo "║  • Bun Runtime Optimized                                    ║"
    echo "║  • PostgreSQL Database Setup                                ║"
    echo "║  • GitHub App Integration                                    ║"
    echo "║  • Cloudflare Worker Support                                 ║"
    echo "║  • Port 3001 Configuration                                   ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1  # Port is in use
    else
        return 0  # Port is available
    fi
}

# Kill process on port
kill_port() {
    local port=$1
    log_warning "Port $port is in use. Attempting to free it..."
    
    local pid=$(lsof -ti:$port)
    if [ -n "$pid" ]; then
        kill -9 $pid 2>/dev/null || true
        sleep 2
        if check_port $port; then
            log_success "Port $port is now available"
        else
            log_error "Failed to free port $port"
            return 1
        fi
    fi
}

# Check prerequisites
check_prerequisites() {
    log_step "Checking prerequisites..."
    
    # Check Git
    if ! command_exists git; then
        log_error "Git is not installed. Please install Git first."
        echo "  Ubuntu/Debian: sudo apt-get install git"
        echo "  macOS: brew install git"
        echo "  Windows: https://git-scm.com/download/win"
        exit 1
    fi
    log_success "Git is available"
    
    # Check Bun (priority over Node.js)
    if ! command_exists bun; then
        log_warning "Bun is not installed. Installing Bun..."
        if command_exists curl; then
            curl -fsSL https://bun.sh/install | bash
            # Source the shell profile to make bun available
            export PATH="$HOME/.bun/bin:$PATH"
            if command_exists bun; then
                log_success "Bun installed successfully"
            else
                log_error "Bun installation failed. Please install manually: https://bun.sh"
                exit 1
            fi
        else
            log_error "curl is required to install Bun. Please install curl first."
            exit 1
        fi
    else
        log_success "Bun is available ($(bun --version))"
    fi
    
    # Check Docker
    if ! command_exists docker; then
        log_error "Docker is not installed. Please install Docker first."
        echo "  Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    log_success "Docker is available and running"
    
    # Check Docker Compose
    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        log_error "Docker Compose is not available. Please install Docker Compose."
        exit 1
    fi
    log_success "Docker Compose is available"
    
    # Check port availability
    if ! check_port $REQUIRED_PORT; then
        log_warning "Port $REQUIRED_PORT is in use"
        read -p "Do you want to kill the process using port $REQUIRED_PORT? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            kill_port $REQUIRED_PORT
        else
            log_error "Port $REQUIRED_PORT is required for GitHub.gg. Please free the port and try again."
            exit 1
        fi
    fi
    log_success "Port $REQUIRED_PORT is available"
}

# Clone repository and checkout branch
clone_and_checkout() {
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
    
    # Fetch all branches
    log_info "Fetching all branches..."
    git fetch origin
    
    # Check if branch exists and checkout
    if git ls-remote --heads origin | grep -q "refs/heads/$BRANCH_NAME"; then
        log_info "Checking out branch: $BRANCH_NAME"
        git checkout "$BRANCH_NAME"
    else
        log_error "Branch '$BRANCH_NAME' not found in remote repository"
        log_info "Available branches:"
        git ls-remote --heads origin
        exit 1
    fi
    
    log_success "Repository setup completed"
}

# Setup environment configuration
setup_environment() {
    log_step "Setting up environment configuration..."
    
    # Check if .env.local already exists
    if [ -f ".env.local" ]; then
        log_warning ".env.local already exists"
        read -p "Do you want to overwrite it? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Keeping existing .env.local file"
            return 0
        fi
    fi
    
    # Create .env.local from template if it exists
    if [ -f ".env.local.example" ]; then
        log_info "Creating .env.local from template..."
        cp .env.local.example .env.local
        
        # Generate a random secret for BETTER_AUTH_SECRET
        if command_exists openssl; then
            local auth_secret=$(openssl rand -base64 32)
            sed -i.bak "s/your_random_secret_key_here/$auth_secret/g" .env.local
            rm -f .env.local.bak
            log_success "Generated BETTER_AUTH_SECRET"
        fi
        
        # Generate a random webhook secret
        if command_exists openssl; then
            local webhook_secret=$(openssl rand -base64 24)
            sed -i.bak "s/your_secure_webhook_secret_here/$webhook_secret/g" .env.local
            rm -f .env.local.bak
            log_success "Generated GITHUB_WEBHOOK_SECRET"
        fi
        
        log_success "Environment file created"
        log_warning "Please edit .env.local with your actual GitHub App credentials:"
        echo "  - GITHUB_PRIVATE_KEY (from your zeeeepa.2025-06-30.private-key.pem file)"
        echo "  - GITHUB_PUBLIC_API_KEY (create a GitHub Personal Access Token)"
        echo "  - GEMINI_API_KEY (get from Google AI Studio)"
        echo "  - NEXT_PUBLIC_POSTHOG_KEY (optional, for analytics)"
    else
        log_error ".env.local.example not found. Cannot create environment configuration."
        return 1
    fi
}

# Setup database
setup_database() {
    log_step "Setting up PostgreSQL database..."
    
    # Check if database setup script exists
    if [ -f "scripts/db-setup.sh" ]; then
        log_info "Running database setup script..."
        chmod +x scripts/db-setup.sh
        ./scripts/db-setup.sh setup
    else
        log_info "Database setup script not found. Using manual setup..."
        
        # Start PostgreSQL with Docker Compose
        log_info "Starting PostgreSQL database..."
        docker-compose up -d postgres
        
        # Wait for database to be ready
        log_info "Waiting for database to be ready..."
        local wait_time=0
        local max_wait=60
        
        while [ $wait_time -lt $max_wait ]; do
            if docker exec github-gg-db pg_isready -U github_gg_user -d github_gg >/dev/null 2>&1; then
                log_success "Database is ready!"
                break
            fi
            echo -n "."
            sleep 2
            wait_time=$((wait_time + 2))
        done
        
        if [ $wait_time -ge $max_wait ]; then
            log_error "Database failed to start within $max_wait seconds"
            return 1
        fi
        
        # Run database migrations
        log_info "Running database migrations..."
        bun run db:push
    fi
    
    log_success "Database setup completed"
}

# Install dependencies
install_dependencies() {
    log_step "Installing dependencies with Bun..."
    
    # Install dependencies
    log_info "Installing project dependencies..."
    bun install
    
    # Verify installation
    if [ -f "bun.lockb" ]; then
        log_success "Dependencies installed successfully"
    else
        log_error "Dependency installation may have failed"
        return 1
    fi
}

# Validate setup
validate_setup() {
    log_step "Validating setup..."
    
    # Check environment file
    if [ -f ".env.local" ]; then
        log_success "Environment configuration exists"
    else
        log_error "Environment configuration missing"
        return 1
    fi
    
    # Check database connection
    if docker exec github-gg-db pg_isready -U github_gg_user -d github_gg >/dev/null 2>&1; then
        log_success "Database is accessible"
    else
        log_error "Database is not accessible"
        return 1
    fi
    
    # Check if dependencies are installed
    if [ -d "node_modules" ] && [ -f "bun.lockb" ]; then
        log_success "Dependencies are installed"
    else
        log_error "Dependencies are not properly installed"
        return 1
    fi
    
    # Check port availability
    if check_port $REQUIRED_PORT; then
        log_success "Port $REQUIRED_PORT is available"
    else
        log_warning "Port $REQUIRED_PORT is in use"
    fi
}

# Start development server
start_dev_server() {
    log_step "Starting development server..."
    
    log_info "GitHub.gg will be available at: http://localhost:$REQUIRED_PORT"
    log_info "Database admin: http://localhost:5432 (github_gg_user/github_gg_password)"
    
    # Check if we should run health checks
    if [ -f "scripts/db-health-check.sh" ]; then
        log_info "Running database health check..."
        chmod +x scripts/db-health-check.sh
        ./scripts/db-health-check.sh quick
    fi
    
    log_success "🎉 Setup completed! Starting development server..."
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                     🎉 Setup Complete!                      ║${NC}"
    echo -e "${GREEN}║                                                              ║${NC}"
    echo -e "${GREEN}║  GitHub.gg is starting on: http://localhost:$REQUIRED_PORT                ║${NC}"
    echo -e "${GREEN}║                                                              ║${NC}"
    echo -e "${GREEN}║  Next steps:                                                 ║${NC}"
    echo -e "${GREEN}║  1. Edit .env.local with your GitHub App credentials        ║${NC}"
    echo -e "${GREEN}║  2. Install your GitHub App on your repositories            ║${NC}"
    echo -e "${GREEN}║  3. Test the webhook integration                             ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Start the development server
    bun run dev
}

# Show help
show_help() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  install    - Complete installation (default)"
    echo "  db-setup   - Setup database only"
    echo "  db-reset   - Reset database"
    echo "  validate   - Validate current setup"
    echo "  start      - Start development server"
    echo "  help       - Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  SKIP_DB_SETUP=1    - Skip database setup"
    echo "  SKIP_DEPS=1        - Skip dependency installation"
    echo "  FORCE_REINSTALL=1  - Force reinstallation"
}

# Handle cleanup on script interruption
cleanup() {
    log_warning "Script interrupted. Cleaning up..."
    # Kill any background processes if needed
    exit 1
}

# Main execution
main() {
    # Handle script interruption
    trap cleanup INT TERM
    
    local command="${1:-install}"
    
    case "$command" in
        "install")
            print_banner
            check_prerequisites
            clone_and_checkout
            setup_environment
            
            if [ "$SKIP_DB_SETUP" != "1" ]; then
                setup_database
            fi
            
            if [ "$SKIP_DEPS" != "1" ]; then
                install_dependencies
            fi
            
            validate_setup
            start_dev_server
            ;;
        "db-setup")
            log_info "Setting up database only..."
            setup_database
            ;;
        "db-reset")
            log_info "Resetting database..."
            if [ -f "scripts/db-setup.sh" ]; then
                ./scripts/db-setup.sh reset
            else
                docker-compose down -v
                docker-compose up -d postgres
                sleep 5
                bun run db:push
            fi
            ;;
        "validate")
            log_info "Validating setup..."
            validate_setup
            ;;
        "start")
            log_info "Starting development server..."
            start_dev_server
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            log_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"

