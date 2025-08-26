#!/bin/bash

# setup-ssl-simple.sh - Setup SSL cho promt.oshioxi.me

echo "🔒 Setting up SSL for promt.oshioxi.me"

DOMAIN="promt.oshioxi.me"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Install Certbot
print_status "Installing Certbot..."
sudo apt update
sudo apt install -y certbot

# Stop nginx temporarily
print_status "Stopping nginx..."
docker-compose -f docker-compose.production.yml stop nginx

# Get SSL certificate
print_status "Getting SSL certificate for $DOMAIN..."
sudo certbot certonly --standalone \
    --preferred-challenges http \
    --email oshioxi.daotoan@gmail.com \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN

if [ $? -eq 0 ]; then
    print_status "✅ SSL certificate obtained successfully"
    
    # Copy certificates
    sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ./ssl/
    sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ./ssl/
    sudo chown $USER:$USER ./ssl/*
    
    # Start nginx with SSL
    print_status "Starting nginx with SSL..."
    docker-compose -f docker-compose.production.yml up -d nginx
    
    # Setup auto-renewal
    print_status "Setting up auto-renewal..."
    (crontab -l 2>/dev/null; echo "0 3 1 * * /usr/bin/certbot renew --quiet && docker-compose -f /opt/promt-app/docker-compose.production.yml restart nginx") | crontab -
    
    print_status "✅ SSL setup completed!"
    echo "Website: https://$DOMAIN"
else
    print_error "Failed to obtain SSL certificate"
    print_error "Make sure domain $DOMAIN points to this server"
    docker-compose -f docker-compose.production.yml up -d nginx
fi
