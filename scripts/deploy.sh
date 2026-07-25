#!/usr/bin/env bash
# Automated Production Deployment Script for F1 Insights on VPS
set -e

echo "🏎️ Starting F1 Insights Production Deployment..."

# 1. Pull latest code from main branch
echo "📥 Pulling latest updates from Git..."
git pull origin main

# 2. Virtual Environment check & Python dependencies update
if [ ! -d ".venv" ]; then
    echo "🐍 Creating virtual environment (.venv)..."
    python3 -m venv .venv
fi

echo "🐍 Installing/updating Python backend dependencies in .venv..."
.venv/bin/pip install -r backend/requirements.txt -q

# 3. Build React Frontend bundle
echo "📦 Building React portal production assets..."
cd portal
npm install --silent
npm run build
cd ..

# 4. Initialize / Sync database cache
echo "💾 Initializing database cache & fetching race telemetry..."
.venv/bin/python data_pipeline/main.py

# 5. Restart PM2 services
echo "🔄 Restarting PM2 process manager..."
pm2 restart ecosystem.config.js --update-env || pm2 start ecosystem.config.js
pm2 save

echo "✅ Production Deployment Completed Successfully!"
