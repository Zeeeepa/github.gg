#!/bin/bash

# GitHub.gg Single Deploy Script for Ubuntu WSL2
# This script sets up and deploys the GitHub.gg repository visualization tool

set -e  # Exit on any error

echo "🚀 Starting GitHub.gg deployment on Ubuntu WSL2..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on WSL2
check_wsl2() {
    if grep -qi microsoft /proc/version; then
        print_success "Running on WSL2"
    else
        print_warning "This script is optimized for WSL2, but will continue anyway"
    fi
}

# Update system packages
update_system() {
    print_status "Updating system packages..."
    sudo apt update && sudo apt upgrade -y
    print_success "System packages updated"
}

# Install Node.js and npm
install_nodejs() {
    print_status "Installing Node.js and npm..."
    
    # Check if Node.js is already installed
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js is already installed: $NODE_VERSION"
        
        # Check if version is 18 or higher
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$MAJOR_VERSION" -ge 18 ]; then
            print_success "Node.js version is compatible"
            return
        else
            print_warning "Node.js version is too old, updating..."
        fi
    fi
    
    # Install Node.js 20.x
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # Verify installation
    node --version
    npm --version
    print_success "Node.js and npm installed successfully"
}

# Install Bun (faster package manager)
install_bun() {
    print_status "Installing Bun package manager..."
    
    if command -v bun &> /dev/null; then
        print_success "Bun is already installed"
        return
    fi
    
    curl -fsSL https://bun.sh/install | bash
    
    # Add bun to PATH for current session
    export PATH="$HOME/.bun/bin:$PATH"
    
    # Add to shell profile
    echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.bashrc
    
    print_success "Bun installed successfully"
}

# Install Git if not present
install_git() {
    if ! command -v git &> /dev/null; then
        print_status "Installing Git..."
        sudo apt install -y git
        print_success "Git installed successfully"
    else
        print_success "Git is already installed"
    fi
}

# Clone the repository
clone_repository() {
    print_status "Cloning GitHub.gg repository..."
    
    if [ -d "github.gg" ]; then
        print_warning "Repository directory already exists, pulling latest changes..."
        cd github.gg
        git pull origin main
        cd ..
    else
        git clone https://github.com/Zeeeepa/github.gg.git
    fi
    
    print_success "Repository cloned/updated successfully"
}

# Install project dependencies
install_dependencies() {
    print_status "Installing project dependencies..."
    cd github.gg
    
    # Use bun if available, otherwise use npm
    if command -v bun &> /dev/null; then
        print_status "Using Bun to install dependencies..."
        bun install
    else
        print_status "Using npm to install dependencies..."
        npm install
    fi
    
    print_success "Dependencies installed successfully"
}

# Setup environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    if [ ! -f ".env.local" ]; then
        cat > .env.local << EOF
# GitHub OAuth Configuration (Required for private repos)
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# Public GitHub Token (Optional - for higher rate limits on public repos)
PUBLIC_GITHUB_TOKEN=your_github_token_here

# Site URL (Update this to your domain in production)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Socket API Key (Optional - for security analysis)
SOCKET_API_KEY=your_socket_api_key_here
EOF
        print_warning "Created .env.local file with placeholder values"
        print_warning "Please update the environment variables in .env.local before running the application"
    else
        print_success "Environment file already exists"
    fi
}

# Build the application
build_application() {
    print_status "Building the application..."
    
    if command -v bun &> /dev/null; then
        bun run build
    else
        npm run build
    fi
    
    print_success "Application built successfully"
}

# Setup systemd service for production
setup_systemd_service() {
    print_status "Setting up systemd service for production deployment..."
    
    # Get current user and working directory
    CURRENT_USER=$(whoami)
    WORKING_DIR=$(pwd)
    
    # Create systemd service file
    sudo tee /etc/systemd/system/github-gg.service > /dev/null << EOF
[Unit]
Description=GitHub.gg Repository Visualization Tool
After=network.target

[Service]
Type=simple
User=$CURRENT_USER
WorkingDirectory=$WORKING_DIR
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    # Create a simple server.js file for production
    cat > server.js << EOF
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  }).listen(port, (err) => {
    if (err) throw err
    console.log(\`> Ready on http://\${hostname}:\${port}\`)
  })
})
EOF
    
    # Reload systemd and enable service
    sudo systemctl daemon-reload
    sudo systemctl enable github-gg.service
    
    print_success "Systemd service created and enabled"
}

# Setup nginx reverse proxy
setup_nginx() {
    print_status "Setting up Nginx reverse proxy..."
    
    # Install nginx if not present
    if ! command -v nginx &> /dev/null; then
        sudo apt install -y nginx
    fi
    
    # Create nginx configuration
    sudo tee /etc/nginx/sites-available/github-gg << EOF
server {
    listen 80;
    server_name localhost;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    
    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/github-gg /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test nginx configuration
    sudo nginx -t
    
    # Restart nginx
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    
    print_success "Nginx configured and started"
}

# Install PM2 for process management (alternative to systemd)
install_pm2() {
    print_status "Installing PM2 for process management..."
    
    if ! command -v pm2 &> /dev/null; then
        npm install -g pm2
    fi
    
    # Create PM2 ecosystem file
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'github-gg',
    script: 'npm',
    args: 'start',
    cwd: '$(pwd)',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF
    
    # Create logs directory
    mkdir -p logs
    
    print_success "PM2 installed and configured"
}

# Start the application
start_application() {
    print_status "Starting the application..."
    
    # Ask user for deployment type
    echo "Choose deployment method:"
    echo "1) Development mode (npm run dev)"
    echo "2) Production with PM2"
    echo "3) Production with systemd"
    read -p "Enter your choice (1-3): " choice
    
    case $choice in
        1)
            print_status "Starting in development mode..."
            if command -v bun &> /dev/null; then
                bun run dev
            else
                npm run dev
            fi
            ;;
        2)
            print_status "Starting with PM2..."
            pm2 start ecosystem.config.js
            pm2 save
            pm2 startup
            print_success "Application started with PM2"
            print_status "Use 'pm2 status' to check status"
            print_status "Use 'pm2 logs github-gg' to view logs"
            ;;
        3)
            print_status "Starting with systemd..."
            sudo systemctl start github-gg.service
            sudo systemctl status github-gg.service
            print_success "Application started with systemd"
            print_status "Use 'sudo systemctl status github-gg' to check status"
            print_status "Use 'sudo journalctl -u github-gg -f' to view logs"
            ;;
        *)
            print_error "Invalid choice. Starting in development mode..."
            npm run dev
            ;;
    esac
}

# Display final instructions
show_final_instructions() {
    print_success "🎉 GitHub.gg deployment completed!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Update environment variables in .env.local:"
    echo "   - Set up GitHub OAuth app at https://github.com/settings/applications/new"
    echo "   - Add your GitHub Client ID and Secret"
    echo "   - Optionally add a GitHub Personal Access Token for higher rate limits"
    echo ""
    echo "2. Access your application:"
    echo "   - Local: http://localhost:3000"
    echo "   - With Nginx: http://your-server-ip"
    echo ""
    echo "3. GitHub OAuth Setup:"
    echo "   - Authorization callback URL: http://your-domain/api/auth/callback"
    echo "   - Homepage URL: http://your-domain"
    echo ""
    echo "4. Optional: Set up SSL with Let's Encrypt for production"
    echo ""
    echo "📚 Features:"
    echo "   - Repository structure visualization with Mermaid diagrams"
    echo "   - Code analysis and metrics"
    echo "   - Security vulnerability scanning (with Socket API)"
    echo "   - File content viewing and syntax highlighting"
    echo "   - GitHub integration for public and private repositories"
    echo ""
    echo "🔧 Management Commands:"
    echo "   - PM2: pm2 status, pm2 restart github-gg, pm2 logs github-gg"
    echo "   - Systemd: sudo systemctl status github-gg, sudo systemctl restart github-gg"
    echo "   - Nginx: sudo systemctl status nginx, sudo nginx -t"
}

# Main deployment function
main() {
    echo "🚀 GitHub.gg Deployment Script for Ubuntu WSL2"
    echo "=============================================="
    
    check_wsl2
    update_system
    install_git
    install_nodejs
    install_bun
    clone_repository
    install_dependencies
    setup_environment
    build_application
    
    # Ask if user wants production setup
    read -p "Do you want to set up production deployment? (y/N): " setup_prod
    if [[ $setup_prod =~ ^[Yy]$ ]]; then
        install_pm2
        setup_nginx
        setup_systemd_service
    fi
    
    start_application
    show_final_instructions
}

# Run main function
main "$@"

