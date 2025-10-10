#!/bin/bash

# Gamma Gallery Migration Environment Setup
# Description: Set up Python environment and install dependencies
# Author: omniumai357
# Date: 2025-10-09

echo "🚀 Setting up Gamma Gallery Migration Environment"
echo "=================================================="

# Check if Python 3.8+ is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo "✅ Python version: $PYTHON_VERSION"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "📚 Installing Python dependencies..."
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️ Creating .env file template..."
    cat > .env << EOF
# Supabase Configuration
SUPABASE_URL=https://auyjsmtnfnnapjdrzhea.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Gamma API Configuration
GAMMA_API_KEY=your_gamma_api_key_here

# Optional: Email service for notifications
EMAIL_SERVICE_URL=https://api.resend.com/emails
EMAIL_API_KEY=your_email_api_key_here
EOF
    echo "📝 Please edit .env file with your actual API keys"
fi

# Make migration script executable
chmod +x migrate-to-supabase.py

echo ""
echo "✅ Environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your API keys"
echo "2. Run: python migrate-to-supabase.py"
echo "3. Monitor progress in migration-log.json"
echo ""
echo "🔑 Required API keys:"
echo "   - SUPABASE_SERVICE_ROLE_KEY (from Supabase dashboard)"
echo "   - GAMMA_API_KEY (from Gamma dashboard)"
echo ""
echo "💡 To activate environment in future:"
echo "   source venv/bin/activate"
