#!/bin/bash

# ZAI Python SDK Service Setup Script

set -e

echo "🚀 Setting up ZAI Python SDK Service..."

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "📋 Installing requirements..."
pip install -r requirements.txt

# Clone and install web-ui-python-sdk
if [ ! -d "web-ui-python-sdk" ]; then
    echo "📥 Cloning web-ui-python-sdk..."
    git clone https://github.com/zeeeepa/web-ui-python-sdk.git
fi

echo "🔧 Installing web-ui-python-sdk..."
cd web-ui-python-sdk
pip install -r requirements.txt
cd ..

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# ZAI Python SDK Configuration
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development
ZAI_VERBOSE=true
ZAI_TIMEOUT=180

# Add your Z.AI credentials here if needed
# ZAI_API_KEY=your_api_key_here
EOF
fi

echo "✅ Setup complete!"
echo ""
echo "To start the service:"
echo "  source venv/bin/activate"
echo "  python zai_service.py"
echo ""
echo "Or use uvicorn directly:"
echo "  uvicorn zai_service:app --host 0.0.0.0 --port 8000 --reload"