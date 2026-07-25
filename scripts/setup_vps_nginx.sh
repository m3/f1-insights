#!/usr/bin/env bash
# Production Nginx, Certbot & Systemd Setup Script for m3-vps
# Run on m3-vps as root or sudoer
set -e

DOMAIN="f1.sports.superchargedbym3.com"
PROJECT_PATH="/var/www/f1-insights"
EMAIL="mathias@m3systems.se"

echo "🏎️ Setting up F1 Insights production infrastructure on m3-vps..."

# 1. Verify project directory exists
if [ ! -d "$PROJECT_PATH" ]; then
    echo "Creating project root directory at $PROJECT_PATH..."
    mkdir -p "$PROJECT_PATH"
fi

# 2. Deploy Base Nginx Configuration
echo "🌐 Installing Nginx virtual host for $DOMAIN..."
cp "$PROJECT_PATH/docs/nginx-f1-insights.conf" "/etc/nginx/sites-available/$DOMAIN.conf"
ln -sf "/etc/nginx/sites-available/$DOMAIN.conf" "/etc/nginx/sites-enabled/$DOMAIN.conf"

# Test Nginx syntax
nginx -t
systemctl reload nginx

# 3. Provision Certbot SSL Certificate & Upgrade to HTTPS
echo "🔒 Provisioning SSL certificate via Certbot for $DOMAIN..."
if command -v certbot &> /dev/null; then
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect || echo "Certbot notice: If DNS record for $DOMAIN is not yet pointing to this VPS IP, run 'sudo certbot --nginx -d $DOMAIN' after updating DNS."
else
    echo "Certbot not found. Install via 'sudo apt-get install -y certbot python3-certbot-nginx'."
fi

# Reload Nginx
systemctl reload nginx

# 4. Install Systemd Service Unit
if [ -f "$PROJECT_PATH/docs/systemd-f1-insights.service" ]; then
    echo "⚙️ Registering systemd service m3-f1-insights.service..."
    cp "$PROJECT_PATH/docs/systemd-f1-insights.service" "/etc/systemd/system/m3-f1-insights.service"
    systemctl daemon-reload
    systemctl enable m3-f1-insights.service
fi

echo "✅ Production infrastructure setup completed!"
echo "Run 'sudo systemctl start m3-f1-insights.service' or 'pm2 start ecosystem.config.js' to launch."
