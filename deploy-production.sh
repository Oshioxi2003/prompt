#!/bin/bash

# deploy-production.sh - Deploy script cho promt.oshioxi.me

echo "🚀 Deploying promt.oshioxi.me"

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

# Check prerequisites
if [ "$EUID" -eq 0 ]; then
    print_error "Không chạy script này với quyền root"
    exit 1
fi

# Install Docker if needed
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

if ! command -v docker-compose &> /dev/null; then
    print_status "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Setup directories
print_status "Setting up directories..."
sudo mkdir -p /opt/promt-app
sudo chown $USER:$USER /opt/promt-app
cp -r . /opt/promt-app/
cd /opt/promt-app

# Create SSL directory
mkdir -p ssl logs

# Configure firewall
print_status "Configuring firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# Build and start
print_status "Building and starting services..."
docker-compose -f docker-compose.production.yml down --remove-orphans
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d

# Wait for services
sleep 30

# Check status
print_status "Checking services..."
docker-compose -f docker-compose.production.yml ps

print_status "✅ Deployment completed!"
echo
echo "📋 Next steps:"
echo "  1. Setup SSL: ./setup-ssl-simple.sh"
echo "  2. Check logs: docker-compose -f docker-compose.production.yml logs -f"
echo "  3. Website: https://promt.oshioxi.me"
echo "  4. Admin: https://promt.oshioxi.me/admin"
