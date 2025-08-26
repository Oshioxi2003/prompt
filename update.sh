#!/bin/bash

# update.sh - Update promt.oshioxi.me

echo "🔄 Updating promt.oshioxi.me..."

GREEN='\033[0;32m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

# Pull latest code
print_status "Pulling latest code..."
git pull origin main

# Stop services
print_status "Stopping services..."
docker-compose -f docker-compose.production.yml down

# Rebuild images
print_status "Rebuilding images..."
docker-compose -f docker-compose.production.yml build --no-cache

# Start services
print_status "Starting services..."
docker-compose -f docker-compose.production.yml up -d

# Wait and check
sleep 15
print_status "Checking status..."
docker-compose -f docker-compose.production.yml ps

print_status "✅ Update completed!"
print_status "Website: https://promt.oshioxi.me"
