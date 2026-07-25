#!/usr/bin/env bash
# One-Command VPS Server Setup Script for F1 Insights
set -e

echo "🛠️ Setting up F1 Insights on VPS Server..."

# 1. Check Node.js and Python 3
echo "🔍 Checking runtime environments..."
node -v
python3 --version

# 2. Global PM2 Check
if ! command -v pm2 &> /dev/null; then
    echo "📦 PM2 not found. Installing globally via npm..."
    npm install -g pm2
fi

# 3. Create log and data directories
mkdir -p logs backend/data

# 4. Install backend requirements
python3 -m pip install -r backend/requirements.txt

# 5. Build frontend
cd portal
npm install
npm run build
cd ..

# 6. Run initial data pipeline fill
python3 data_pipeline/main.py

# 7. Start PM2 ecosystem
pm2 start ecosystem.config.js
pm2 save

echo "🎉 VPS Setup Completed! Services are running under PM2."
echo "Use 'pm2 status' and 'pm2 logs' to monitor."
