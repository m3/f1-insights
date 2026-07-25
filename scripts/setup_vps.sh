#!/usr/bin/env bash
# One-Command VPS Server Setup Script for F1 Insights
set -e

echo "🏎️ Setting up F1 Insights on VPS Server..."

# 1. Check runtime environments
echo "🔍 Checking runtime environments..."
node -v
python3 --version

# 2. Setup Python Virtual Environment (.venv) for PEP 668 compliance
if [ ! -d ".venv" ]; then
    echo "🐍 Creating virtual environment (.venv)..."
    python3 -m venv .venv || sudo apt-get update && sudo apt-get install -y python3-venv python3-full && python3 -m venv .venv
fi

# Ensure pip & setuptools are up to date inside .venv
.venv/bin/python -m pip install --upgrade pip -q

# 3. Global PM2 Check
if ! command -v pm2 &> /dev/null; then
    echo "📦 PM2 not found. Installing globally via npm..."
    sudo npm install -g pm2
fi

# 4. Create log and data directories
mkdir -p logs backend/data

# 5. Install backend & pipeline requirements in virtualenv
echo "📥 Installing backend & data pipeline Python dependencies in .venv..."
.venv/bin/pip install -r backend/requirements.txt -r data_pipeline/requirements.txt -q

# 6. Build frontend
echo "📦 Building React portal frontend..."
cd portal
npm install
npm run build
cd ..

# 7. Run initial data pipeline fill
echo "💾 Initializing database & fetching telemetry..."
.venv/bin/python data_pipeline/main.py

# 8. Start PM2 ecosystem
echo "🚀 Starting PM2 processes..."
pm2 start ecosystem.config.js
pm2 save

echo "🎉 VPS Setup Completed! Services are running under PM2."
echo "Use 'pm2 status' and 'pm2 logs' to monitor."
