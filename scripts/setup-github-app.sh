#!/bin/bash

# GitHub App Setup Script for GitHub.gg
# This script helps configure and validate GitHub App integration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
GITHUB_APP_NAME="zeeeepa"
GITHUB_APP_ID="1484403"
GITHUB_CLIENT_ID="Iv23li9PqHMExi84gaq1"
PRIVATE_KEY_FILE="zeeeepa.2025-06-30.private-key.pem"

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
    echo "║                🔧 GitHub App Setup Helper                   ║"
    echo "║                                                              ║"
    echo "║  App Name: $GITHUB_APP_NAME                                        ║"
    echo "║  App ID: $GITHUB_APP_ID                                      ║"
    echo "║  Client ID: $GITHUB_CLIENT_ID                    ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Check if private key file exists
check_private_key() {
    log_step "Checking GitHub App private key..."
    
    if [ -f "$PRIVATE_KEY_FILE" ]; then
        log_success "Private key file found: $PRIVATE_KEY_FILE"
        
        # Validate the private key format
        if grep -q "BEGIN RSA PRIVATE KEY" "$PRIVATE_KEY_FILE" && grep -q "END RSA PRIVATE KEY" "$PRIVATE_KEY_FILE"; then
            log_success "Private key format is valid"
        else
            log_error "Private key format appears invalid"
            return 1
        fi
    else
        log_error "Private key file not found: $PRIVATE_KEY_FILE"
        log_info "Please ensure the private key file is in the current directory"
        return 1
    fi
}

# Setup private key in environment
setup_private_key() {
    log_step "Setting up private key in environment..."
    
    if [ ! -f "$PRIVATE_KEY_FILE" ]; then
        log_error "Private key file not found. Run 'check' command first."
        return 1
    fi
    
    if [ ! -f ".env.local" ]; then
        log_error ".env.local file not found. Please run the main installation script first."
        return 1
    fi
    
    # Read the private key and escape it for sed
    local private_key_content=$(cat "$PRIVATE_KEY_FILE" | sed ':a;N;$!ba;s/\n/\\n/g')
    
    # Update the .env.local file
    if grep -q "GITHUB_PRIVATE_KEY=" .env.local; then
        # Replace existing key
        sed -i.bak "s|GITHUB_PRIVATE_KEY=.*|GITHUB_PRIVATE_KEY=\"$private_key_content\"|" .env.local
        rm -f .env.local.bak
        log_success "Updated GITHUB_PRIVATE_KEY in .env.local"
    else
        # Add new key
        echo "GITHUB_PRIVATE_KEY=\"$private_key_content\"" >> .env.local
        log_success "Added GITHUB_PRIVATE_KEY to .env.local"
    fi
}

# Validate GitHub App configuration
validate_config() {
    log_step "Validating GitHub App configuration..."
    
    # Check .env.local file
    if [ ! -f ".env.local" ]; then
        log_error ".env.local file not found"
        return 1
    fi
    
    # Check required environment variables
    local required_vars=("GITHUB_APP_ID" "GITHUB_APP_NAME" "GITHUB_CLIENT_ID" "GITHUB_CLIENT_SECRET" "GITHUB_PRIVATE_KEY")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" .env.local || grep -q "^${var}=.*your_.*" .env.local; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -eq 0 ]; then
        log_success "All required environment variables are configured"
    else
        log_error "Missing or incomplete environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        return 1
    fi
}

# Test GitHub App authentication
test_authentication() {
    log_step "Testing GitHub App authentication..."
    
    # Check if bun is available
    if ! command -v bun >/dev/null 2>&1; then
        log_error "Bun is not available. Please install Bun first."
        return 1
    fi
    
    # Create a simple test script
    cat > test_github_app.js << 'EOF'
import { App } from '@octokit/app';
import { readFileSync } from 'fs';

// Load environment variables
const env = process.env;

try {
  const app = new App({
    appId: env.GITHUB_APP_ID,
    privateKey: env.GITHUB_PRIVATE_KEY,
  });

  // Test app authentication
  const { data } = await app.octokit.request('GET /app');
  console.log('✅ GitHub App authentication successful!');
  console.log(`App Name: ${data.name}`);
  console.log(`App ID: ${data.id}`);
  console.log(`Owner: ${data.owner.login}`);
  
  // Test installation listing
  const installations = await app.octokit.request('GET /app/installations');
  console.log(`📦 Found ${installations.data.length} installation(s)`);
  
  if (installations.data.length > 0) {
    installations.data.forEach((installation, index) => {
      console.log(`  ${index + 1}. ${installation.account.login} (ID: ${installation.id})`);
    });
  }
  
} catch (error) {
  console.error('❌ GitHub App authentication failed:', error.message);
  process.exit(1);
}
EOF
    
    # Run the test
    if bun --env-file=.env.local test_github_app.js; then
        log_success "GitHub App authentication test passed"
    else
        log_error "GitHub App authentication test failed"
        return 1
    fi
    
    # Clean up test file
    rm -f test_github_app.js
}

# Show installation instructions
show_installation_instructions() {
    log_step "GitHub App Installation Instructions"
    
    echo ""
    echo "To install your GitHub App on repositories:"
    echo ""
    echo "1. 🌐 Visit the installation URL:"
    echo "   https://github.com/apps/$GITHUB_APP_NAME/installations/new"
    echo ""
    echo "2. 📋 Select repositories to install the app on:"
    echo "   - Choose 'All repositories' for full access"
    echo "   - Or select specific repositories"
    echo ""
    echo "3. ✅ Click 'Install' to complete the installation"
    echo ""
    echo "4. 🔗 After installation, the app will redirect to:"
    echo "   http://localhost:3001/install/callback"
    echo ""
    echo "5. 🔐 Sign in with GitHub OAuth to link the installation"
    echo ""
    echo "Alternative installation methods:"
    echo "- From repository: Go to Settings → Integrations → GitHub Apps"
    echo "- From organization: Go to Settings → GitHub Apps → Install App"
    echo ""
}

# Show webhook configuration
show_webhook_config() {
    log_step "Webhook Configuration"
    
    echo ""
    echo "Your GitHub App webhook configuration:"
    echo ""
    echo "📡 Webhook URL: https://webhook-gateway.pixeliumperfecto.workers.dev/api/webhooks/github"
    echo "🔐 Webhook Secret: (configured in .env.local)"
    echo ""
    echo "Webhook Events (should be enabled in GitHub App settings):"
    echo "  ✅ Installation"
    echo "  ✅ Installation repositories"
    echo "  ✅ Push"
    echo "  ✅ Pull request"
    echo ""
    echo "To verify webhook configuration:"
    echo "1. Go to https://github.com/settings/apps/$GITHUB_APP_NAME"
    echo "2. Check 'Webhook' section"
    echo "3. Ensure URL and events are configured correctly"
    echo ""
}

# Show current status
show_status() {
    log_step "GitHub App Status"
    
    echo ""
    echo "Configuration Status:"
    
    # Check private key
    if [ -f "$PRIVATE_KEY_FILE" ]; then
        echo "  ✅ Private key file: $PRIVATE_KEY_FILE"
    else
        echo "  ❌ Private key file: $PRIVATE_KEY_FILE (missing)"
    fi
    
    # Check .env.local
    if [ -f ".env.local" ]; then
        echo "  ✅ Environment file: .env.local"
        
        # Check specific variables
        if grep -q "GITHUB_APP_ID=$GITHUB_APP_ID" .env.local; then
            echo "  ✅ GitHub App ID: $GITHUB_APP_ID"
        else
            echo "  ❌ GitHub App ID: not configured correctly"
        fi
        
        if grep -q "GITHUB_APP_NAME=$GITHUB_APP_NAME" .env.local; then
            echo "  ✅ GitHub App Name: $GITHUB_APP_NAME"
        else
            echo "  ❌ GitHub App Name: not configured correctly"
        fi
        
        if grep -q "GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID" .env.local; then
            echo "  ✅ GitHub Client ID: $GITHUB_CLIENT_ID"
        else
            echo "  ❌ GitHub Client ID: not configured correctly"
        fi
        
        if grep -q "BEGIN RSA PRIVATE KEY" .env.local; then
            echo "  ✅ Private key: configured"
        else
            echo "  ❌ Private key: not configured"
        fi
    else
        echo "  ❌ Environment file: .env.local (missing)"
    fi
    
    echo ""
}

# Main function
main() {
    case "${1:-status}" in
        "setup")
            print_banner
            check_private_key
            setup_private_key
            validate_config
            log_success "GitHub App setup completed!"
            ;;
        "check"|"validate")
            print_banner
            check_private_key
            validate_config
            ;;
        "test")
            print_banner
            test_authentication
            ;;
        "install")
            show_installation_instructions
            ;;
        "webhook")
            show_webhook_config
            ;;
        "status")
            show_status
            ;;
        "help")
            echo "Usage: $0 {setup|check|test|install|webhook|status}"
            echo ""
            echo "Commands:"
            echo "  setup    - Complete GitHub App setup"
            echo "  check    - Validate private key and configuration"
            echo "  test     - Test GitHub App authentication"
            echo "  install  - Show installation instructions"
            echo "  webhook  - Show webhook configuration"
            echo "  status   - Show current configuration status"
            echo "  help     - Show this help message"
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

