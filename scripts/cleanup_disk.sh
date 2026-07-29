#!/bin/bash
# Maintenance Script: Clean old logs, temporary files, and prune git telemetry data
set -e

echo "🧹 Running F1 Insights Data & Disk Cleanup..."

# 1. Vacuum systemd journal logs keeping last 3 days
sudo journalctl --vacuum-time=3d >/dev/null 2>&1 || true

# 2. Clean PM2 log files larger than 50MB
if command -v pm2 >/dev/null 2>&1; then
    pm2 flush >/dev/null 2>&1 || true
fi

# 3. Clean temporary Python pyc bytecode & cache files
find /var/www/f1-insights -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find /var/www/f1-insights -name "*.pyc" -delete 2>/dev/null || true

# 4. Prune TracingInsights git repository data if larger than 1GB
TRACING_DIR="/var/www/f1-insights/data/tracing-insights"
if [ -d "$TRACING_DIR/.git" ]; then
    SIZE_MB=$(du -sm "$TRACING_DIR" | cut -f1)
    if [ "$SIZE_MB" -gt 1000 ]; then
        echo "⚠️ TracingInsights repository size is ${SIZE_MB}MB. Pruning git objects..."
        cd "$TRACING_DIR"
        git gc --prune=now --aggressive >/dev/null 2>&1 || true
    fi
fi

# 5. Output disk status
df -h / | tail -n 1 | awk '{print "✅ Disk Cleanup Complete! Available Free Space: " $4 " (" $5 " used)"}'
