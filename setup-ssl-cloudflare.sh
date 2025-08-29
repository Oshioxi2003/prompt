#!/bin/bash

# SSL Setup Script for Cloudflare
# Usage: ./setup-ssl-cloudflare.sh

set -e

echo "🔒 Setting up SSL certificates with Cloudflare..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root (use sudo)"
   exit 1
fi

# Install certbot if not installed
if ! command -v certbot &> /dev/null; then
    print_status "Installing Certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
fi

# Create Cloudflare configuration
print_status "Creating Cloudflare configuration..."
mkdir -p /etc/letsencrypt

# Create Cloudflare credentials file
cat > /etc/letsencrypt/cloudflare.ini << 'EOF'
# Cloudflare API credentials
# Replace with your actual Cloudflare API token
dns_cloudflare_api_token = your_cloudflare_api_token_here
EOF

chmod 600 /etc/letsencrypt/cloudflare.ini

print_warning "Please edit /etc/letsencrypt/cloudflare.ini and add your Cloudflare API token"

# Install Cloudflare DNS plugin for certbot
print_status "Installing Cloudflare DNS plugin..."
pip3 install certbot-dns-cloudflare

# Create SSL certificate using Cloudflare DNS challenge
print_status "Obtaining SSL certificates..."
certbot certonly \
    --dns-cloudflare \
    --dns-cloudflare-credentials /etc/letsencrypt/cloudflare.ini \
    --dns-cloudflare-propagation-seconds 60 \
    --email your-email@example.com \
    --agree-tos \
    --no-eff-email \
    -d app.oshioxi.me \
    -d adminapp.oshioxi.me

# Update Nginx configuration for SSL
print_status "Updating Nginx configuration for SSL..."
cat > /etc/nginx/sites-available/prompt-library-ssl << 'EOF'
# Frontend - app.oshioxi.me
server {
    listen 80;
    server_name app.oshioxi.me;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.oshioxi.me;
    
    ssl_certificate /etc/letsencrypt/live/app.oshioxi.me/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.oshioxi.me/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    location / {
        proxy_pass http://127.0.0.1:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend - adminapp.oshioxi.me
server {
    listen 80;
    server_name adminapp.oshioxi.me;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name adminapp.oshioxi.me;
    
    ssl_certificate /etc/letsencrypt/live/adminapp.oshioxi.me/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/adminapp.oshioxi.me/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable SSL configuration
ln -sf /etc/nginx/sites-available/prompt-library-ssl /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/prompt-library

# Test and reload Nginx
nginx -t
systemctl reload nginx

# Create auto-renewal script
print_status "Creating SSL auto-renewal script..."
cat > /etc/cron.d/ssl-renewal << 'EOF'
# SSL Certificate Auto-renewal
0 12 * * * root /usr/bin/certbot renew --quiet --deploy-hook "systemctl reload nginx"
EOF

# Create renewal hook
cat > /etc/letsencrypt/renewal-hooks/post/reload-nginx.sh << 'EOF'
#!/bin/bash
systemctl reload nginx
EOF

chmod +x /etc/letsencrypt/renewal-hooks/post/reload-nginx.sh

print_status "SSL setup completed successfully!"
echo ""
print_warning "Next steps:"
echo "1. Edit /etc/letsencrypt/cloudflare.ini and add your Cloudflare API token"
echo "2. Update the email address in the certbot command above"
echo "3. Run the certbot command manually to obtain certificates"
echo "4. Test your SSL setup:"
echo "   - https://app.oshioxi.me"
echo "   - https://adminapp.oshioxi.me"
echo ""
echo "SSL certificates will auto-renew every 60 days"
