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

# 2. Deploy Nginx Configuration
echo "🌐 Installing Nginx virtual host for $DOMAIN..."
cp "$PROJECT_PATH/docs/nginx-f1-insights.conf" "/etc/nginx/sites-available/$DOMAIN.conf"
ln -sf "/etc/nginx/sites-available/$DOMAIN.conf" "/etc/nginx/sites-enabled/$DOMAIN.conf"

# Test Nginx syntax
nginx -t

# 3. Provision Certbot SSL Certificate
echo "🔒 Provisioning SSL certificate via Certbot for $DOMAIN..."
if ! certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect; then
    echo "Warning: Certbot SSL setup failed or domain DNS not yet pointing to this VPS IP. Retrying reload..."
fi

# Reload Nginx
systemctl reload nginx

# 4. Install Systemd Service Unit
echo "⚙️ Registering systemd service m3-f1-insights.service..."
cp "$PROJECT_PATH/docs/systemd-f1-insights.service" "/etc/systemd/system/m3-f1-insights.service"
systemctl daemon-reload
systemctl enable m3-f1-insights.service

echo "✅ Production infrastructure setup completed!"
echo "Run 'sudo systemctl start m3-f1-insights.service' to launch."
