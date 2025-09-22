#!/bin/bash

# 🌟 GitHub.gg Startup UI Script
# Single unified launch command for development startup

set -e

# Colors for beautiful output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Unicode symbols
CHECK="✅"
CROSS="❌" 
ROCKET="🚀"
GEAR="⚙️"
SPARKLES="✨"
FIRE="🔥"
LIGHTNING="⚡"
GLOBE="🌐"
SNAKE="🐍"
BUBBLE="💬"

# Animation delay
DELAY=0.1

# Print with animation
animate_text() {
    local text="$1"
    local color="$2"
    for (( i=0; i<${#text}; i++ )); do
        echo -n -e "${color}${text:$i:1}${NC}"
        sleep $DELAY
    done
    echo
}

# Print colored output instantly
print_fast() {
    echo -e "$1"
}

# Service status tracking
FRONTEND_READY=false
PYTHON_READY=false
SERVICES_STARTED=false

# Cleanup function
cleanup() {
    if [ "$SERVICES_STARTED" = true ]; then
        print_fast "\n${YELLOW}🛑 Shutting down services...${NC}"
        
        # Kill background processes
        jobs -p | xargs -r kill 2>/dev/null || true
        
        # Kill by PID files
        [ -f .frontend.pid ] && kill $(cat .frontend.pid) 2>/dev/null && rm -f .frontend.pid || true
        [ -f .python.pid ] && kill $(cat .python.pid) 2>/dev/null && rm -f .python.pid || true
        
        # Kill by process name
        pkill -f "next dev" 2>/dev/null || true
        pkill -f "zai_service" 2>/dev/null || true
        
        print_fast "${GREEN}${CHECK} Services stopped gracefully${NC}"
    fi
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM EXIT

# Animated header
show_header() {
    clear
    print_fast "${PURPLE}"
    print_fast "╔══════════════════════════════════════════════════════════════════════════════════════╗"
    print_fast "║                                                                                      ║"
    animate_text "║                           🌟 GITHUB.GG STARTUP UI 🌟                            ║" "${PURPLE}"
    print_fast "║                                                                                      ║"
    print_fast "║                      🚀 Web-UI-Python-SDK Integration (PR #5)                      ║"
    print_fast "║                                                                                      ║"
    print_fast "╚══════════════════════════════════════════════════════════════════════════════════════╝"
    print_fast "${NC}"
    echo
    sleep 0.5
}

# Check dependencies with beautiful output
check_dependencies() {
    print_fast "${CYAN}${GEAR} Checking system dependencies...${NC}\n"
    
    local all_good=true
    
    # Check Node.js
    print_fast -n "${BLUE}   Node.js: ${NC}"
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_fast "${GREEN}${CHECK} ${NODE_VERSION}${NC}"
    else
        print_fast "${RED}${CROSS} Not found${NC}"
        all_good=false
    fi
    
    # Check npm
    print_fast -n "${BLUE}   npm: ${NC}"
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_fast "${GREEN}${CHECK} v${NPM_VERSION}${NC}"
    else
        print_fast "${RED}${CROSS} Not found${NC}"
        all_good=false
    fi
    
    # Check Python
    print_fast -n "${BLUE}   Python: ${NC}"
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version | cut -d ' ' -f 2)
        print_fast "${GREEN}${CHECK} ${PYTHON_VERSION}${NC}"
    else
        print_fast "${YELLOW}⚠️ Not found (optional)${NC}"
    fi
    
    # Check if already installed
    print_fast -n "${BLUE}   Dependencies: ${NC}"
    if [ -d "node_modules" ]; then
        print_fast "${GREEN}${CHECK} Installed${NC}"
    else
        print_fast "${YELLOW}⚠️ Need to install${NC}"
        all_good=false
    fi
    
    echo
    if [ "$all_good" = true ]; then
        print_fast "${GREEN}${CHECK} All dependencies ready!${NC}"
    else
        print_fast "${YELLOW}⚠️ Some dependencies missing - will attempt to install${NC}"
    fi
    
    sleep 1
    return $all_good
}

# Install dependencies if needed
install_dependencies() {
    print_fast "${CYAN}${GEAR} Installing dependencies...${NC}\n"
    
    if [ ! -d "node_modules" ]; then
        print_fast "${BLUE}📦 Installing Node.js dependencies...${NC}"
        npm install --silent > /dev/null 2>&1 &
        
        # Show loading animation
        local pid=$!
        local spin='-\|/'
        local i=0
        while kill -0 $pid 2>/dev/null; do
            i=$(( (i+1) %4 ))
            printf "\r   ${YELLOW}${spin:$i:1} Installing packages...${NC}"
            sleep 0.2
        done
        wait $pid
        
        if [ $? -eq 0 ]; then
            print_fast "\r   ${GREEN}${CHECK} Dependencies installed successfully!${NC}"
        else
            print_fast "\r   ${RED}${CROSS} Installation failed${NC}"
            exit 1
        fi
    fi
    
    sleep 0.5
}

# Start Python service
start_python_service() {
    print_fast "${CYAN}${SNAKE} Starting Python AI Service...${NC}\n"
    
    if [ -d "python_backend" ]; then
        cd python_backend
        
        # Check if setup is needed
        if [ ! -d "venv" ]; then
            print_fast "${YELLOW}⚠️ Python backend not set up. Setting up now...${NC}"
            chmod +x setup.sh
            ./setup.sh > /dev/null 2>&1
        fi
        
        # Start the service
        print_fast "${BLUE}   ${SNAKE} Activating Python environment...${NC}"
        source venv/bin/activate
        
        print_fast "${BLUE}   ${FIRE} Starting ZAI service on port 8000...${NC}"
        python zai_service.py > ../python_service.log 2>&1 &
        
        PYTHON_PID=$!
        echo $PYTHON_PID > ../.python.pid
        
        cd ..
        
        # Wait and check if service started
        sleep 3
        if kill -0 $PYTHON_PID 2>/dev/null; then
            print_fast "${GREEN}   ${CHECK} Python AI service started successfully!${NC}"
            PYTHON_READY=true
        else
            print_fast "${YELLOW}   ⚠️ Python service failed to start (using mock mode)${NC}"
            PYTHON_READY=false
        fi
    else
        print_fast "${YELLOW}   ⚠️ Python backend directory not found (using mock mode)${NC}"
        PYTHON_READY=false
    fi
    
    echo
    sleep 0.5
}

# Start frontend service
start_frontend_service() {
    print_fast "${CYAN}${GLOBE} Starting Next.js Frontend...${NC}\n"
    
    print_fast "${BLUE}   ${LIGHTNING} Starting development server on port 3000...${NC}"
    npm run dev > frontend.log 2>&1 &
    
    FRONTEND_PID=$!
    echo $FRONTEND_PID > .frontend.pid
    
    # Wait for frontend to be ready
    print_fast "${BLUE}   ${GEAR} Waiting for server to be ready...${NC}"
    
    local attempts=0
    local max_attempts=30
    
    while [ $attempts -lt $max_attempts ]; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            FRONTEND_READY=true
            break
        fi
        
        printf "\r   ${YELLOW}⏳ Starting... (${attempts}/${max_attempts})${NC}"
        sleep 2
        attempts=$((attempts + 1))
    done
    
    if [ "$FRONTEND_READY" = true ]; then
        print_fast "\r   ${GREEN}${CHECK} Frontend server is ready!                    ${NC}"
    else
        print_fast "\r   ${YELLOW}⚠️ Frontend may still be starting...              ${NC}"
    fi
    
    echo
    sleep 0.5
}

# Show service status
show_services_status() {
    print_fast "${CYAN}${SPARKLES} Service Status Dashboard${NC}\n"
    
    print_fast "${WHITE}   ╔═══════════════════════════════════════════════════════════════╗${NC}"
    print_fast "${WHITE}   ║                        SERVICE STATUS                         ║${NC}"
    print_fast "${WHITE}   ╠═══════════════════════════════════════════════════════════════╣${NC}"
    
    # Frontend status
    if [ "$FRONTEND_READY" = true ]; then
        print_fast "${WHITE}   ║ ${GLOBE} Next.js Frontend    │ ${GREEN}${CHECK} Running${NC}      │ http://localhost:3000 ${WHITE}║${NC}"
    else
        print_fast "${WHITE}   ║ ${GLOBE} Next.js Frontend    │ ${YELLOW}⏳ Starting${NC}     │ http://localhost:3000 ${WHITE}║${NC}"
    fi
    
    # Python service status
    if [ "$PYTHON_READY" = true ]; then
        print_fast "${WHITE}   ║ ${SNAKE} Python AI Service  │ ${GREEN}${CHECK} Running${NC}      │ http://localhost:8000 ${WHITE}║${NC}"
    else
        print_fast "${WHITE}   ║ ${SNAKE} Python AI Service  │ ${YELLOW}⚠️ Mock Mode${NC}    │ Fallback enabled     ${WHITE}║${NC}"
    fi
    
    print_fast "${WHITE}   ╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo
    
    # Features status
    print_fast "${CYAN}${SPARKLES} Available Features${NC}\n"
    print_fast "${GREEN}   ${CHECK} Floating chat bubble (bottom-right corner)${NC}"
    print_fast "${GREEN}   ${CHECK} Repository analysis tools${NC}"
    print_fast "${GREEN}   ${CHECK} Lynlang code analysis${NC}"
    print_fast "${GREEN}   ${CHECK} Better-UI enhanced interface${NC}"
    
    if [ "$PYTHON_READY" = true ]; then
        print_fast "${GREEN}   ${CHECK} Real AI responses (GLM-4.5V + 0727-360B-API)${NC}"
        print_fast "${GREEN}   ${CHECK} Advanced repository analysis${NC}"
    else
        print_fast "${YELLOW}   ⚠️ Mock AI responses (install Python backend for real AI)${NC}"
        print_fast "${YELLOW}   ⚠️ Basic repository analysis (fallback mode)${NC}"
    fi
    echo
}

# Show usage instructions
show_instructions() {
    print_fast "${PURPLE}${SPARKLES} Ready to Use!${NC}\n"
    
    print_fast "${WHITE}   ╔═══════════════════════════════════════════════════════════════╗${NC}"
    print_fast "${WHITE}   ║                        HOW TO USE                             ║${NC}"
    print_fast "${WHITE}   ╠═══════════════════════════════════════════════════════════════╣${NC}"
    print_fast "${WHITE}   ║                                                               ║${NC}"
    print_fast "${WHITE}   ║ 1. ${BUBBLE} Open your browser: ${BLUE}http://localhost:3000${WHITE}              ║${NC}"
    print_fast "${WHITE}   ║                                                               ║${NC}"
    print_fast "${WHITE}   ║ 2. ${BUBBLE} Look for the chat bubble in the bottom-right corner     ║${NC}"
    print_fast "${WHITE}   ║                                                               ║${NC}"
    print_fast "${WHITE}   ║ 3. ${BUBBLE} Click the bubble to open the AI assistant               ║${NC}"
    print_fast "${WHITE}   ║                                                               ║${NC}"
    print_fast "${WHITE}   ║ 4. ${BUBBLE} Try these commands:                                     ║${NC}"
    print_fast "${WHITE}   ║    • ${CYAN}\"Analyze this repository structure\"${WHITE}                  ║${NC}"
    print_fast "${WHITE}   ║    • ${CYAN}\"Search for React components\"${WHITE}                       ║${NC}"
    print_fast "${WHITE}   ║    • ${CYAN}\"Review this code: [paste code]\"${WHITE}                    ║${NC}"
    print_fast "${WHITE}   ║    • ${CYAN}\"What languages are used in this project?\"${WHITE}          ║${NC}"
    print_fast "${WHITE}   ║                                                               ║${NC}"
    print_fast "${WHITE}   ╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo
    
    print_fast "${YELLOW}   💡 Tip: The chat bubble is responsive and works on mobile too!${NC}"
    print_fast "${YELLOW}   💡 All conversations are context-aware of your current repository${NC}"
    echo
}

# Monitor services
monitor_services() {
    print_fast "${CYAN}${GEAR} Monitoring services... ${NC}${YELLOW}(Press Ctrl+C to stop)${NC}\n"
    
    # Open browser automatically (if possible)
    if command -v open &> /dev/null; then
        sleep 2
        open http://localhost:3000 > /dev/null 2>&1 &
    elif command -v xdg-open &> /dev/null; then
        sleep 2
        xdg-open http://localhost:3000 > /dev/null 2>&1 &
    fi
    
    # Monitor loop
    while true; do
        # Check if services are still running
        if ! kill -0 $(cat .frontend.pid 2>/dev/null) 2>/dev/null; then
            print_fast "${RED}${CROSS} Frontend service stopped unexpectedly${NC}"
            break
        fi
        
        if [ "$PYTHON_READY" = true ] && ! kill -0 $(cat .python.pid 2>/dev/null) 2>/dev/null; then
            print_fast "${YELLOW}⚠️ Python service stopped, switching to mock mode${NC}"
            PYTHON_READY=false
        fi
        
        # Show periodic status (every 30 seconds)
        if [ $(($(date +%s) % 30)) -eq 0 ]; then
            print_fast "${CYAN}⏰ $(date '+%H:%M:%S') - Services running smoothly${NC}"
        fi
        
        sleep 5
    done
}

# Main execution
main() {
    show_header
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --no-python)
                SKIP_PYTHON=true
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --no-python    Skip Python service startup"
                echo "  --help, -h     Show this help message"
                exit 0
                ;;
            *)
                print_fast "${RED}Unknown option: $1${NC}"
                exit 1
                ;;
        esac
    done
    
    # Check and install dependencies
    if ! check_dependencies; then
        install_dependencies
    fi
    
    # Start services
    SERVICES_STARTED=true
    
    if [ "${SKIP_PYTHON:-false}" != true ]; then
        start_python_service
    fi
    
    start_frontend_service
    
    # Show status
    show_services_status
    show_instructions
    
    # Monitor services
    monitor_services
}

# Run main function
main "$@"