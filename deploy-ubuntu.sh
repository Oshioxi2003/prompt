#!/bin/bash

# Ubuntu Deployment Script for Prompt Library
# Usage: ./deploy-ubuntu.sh

set -e

echo "🚀 Starting Ubuntu deployment for Prompt Library..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
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
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    software-properties-common \
    nginx \
    certbot \
    python3-certbot-nginx \
    ufw \
    git

# Install Docker
print_status "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io
    sudo usermod -aG docker $USER
    print_warning "Docker installed. You may need to log out and back in for group changes to take effect."
else
    print_status "Docker is already installed"
fi

# Install Docker Compose
print_status "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    print_status "Docker Compose is already installed"
fi

# Create application directory
APP_DIR="/opt/prompt-library"
print_status "Creating application directory at $APP_DIR..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Copy application files
print_status "Copying application files..."
cp -r . $APP_DIR/
cd $APP_DIR

# Create necessary directories
mkdir -p mysql/init
mkdir -p logs

# Set up environment file
if [ ! -f .env ]; then
    print_status "Creating .env file from template..."
    cp env.production .env
    print_warning "Please edit .env file with your actual configuration values"
fi

# Configure firewall
print_status "Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Create Nginx configuration for domain routing
print_status "Creating Nginx configuration..."
sudo tee /etc/nginx/sites-available/prompt-library << EOF
# Frontend - app.oshioxi.me
server {
    listen 80;
    server_name app.oshioxi.me;
    
    location / {
        proxy_pass http://127.0.0.1:80;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# Backend - adminapp.oshioxi.me
server {
    listen 80;
    server_name adminapp.oshioxi.me;
    
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/prompt-library /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Build and start containers
print_status "Building and starting Docker containers..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Check service status
print_status "Checking service status..."
docker-compose ps

# Create systemd service for auto-start
print_status "Creating systemd service for auto-start..."
sudo tee /etc/systemd/system/prompt-library.service << EOF
[Unit]
Description=Prompt Library Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable prompt-library.service

# Create backup script
print_status "Creating backup script..."
tee backup.sh << EOF
#!/bin/bash
# Backup script for Prompt Library

BACKUP_DIR="/opt/backups/prompt-library"
DATE=\$(date +%Y%m%d_%H%M%S)

mkdir -p \$BACKUP_DIR

# Backup database
docker-compose exec -T db mysqldump -u root -p\${MYSQL_ROOT_PASSWORD} \${DB_NAME} > \$BACKUP_DIR/db_\$DATE.sql

# Backup media files
tar -czf \$BACKUP_DIR/media_\$DATE.tar.gz -C /opt/prompt-library/media .

# Keep only last 7 days of backups
find \$BACKUP_DIR -name "*.sql" -mtime +7 -delete
find \$BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: \$BACKUP_DIR"
EOF

chmod +x backup.sh

# Create update script
print_status "Creating update script..."
tee update.sh << EOF
#!/bin/bash
# Update script for Prompt Library

cd $APP_DIR

# Pull latest changes
git pull origin main

# Backup before update
./backup.sh

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

echo "Update completed!"
EOF

chmod +x update.sh

# Create monitoring script
print_status "Creating monitoring script..."
tee monitor.sh << EOF
#!/bin/bash
# Monitoring script for Prompt Library

echo "=== Prompt Library Status ==="
echo "Docker containers:"
docker-compose ps

echo ""
echo "=== System Resources ==="
echo "Disk usage:"
df -h

echo ""
echo "=== Application Logs ==="
echo "Backend logs (last 10 lines):"
docker-compose logs --tail=10 backend

echo ""
echo "=== Health Checks ==="
echo "Frontend health:"
curl -s http://localhost/health || echo "Frontend not responding"

echo "Backend health:"
curl -s http://localhost:8080/health || echo "Backend not responding"
EOF

chmod +x monitor.sh

print_status "Deployment completed successfully!"
echo ""
print_warning "Next steps:"
echo "1. Edit .env file with your actual configuration values"
echo "2. Set up SSL certificates with Certbot:"
echo "   sudo certbot --nginx -d app.oshioxi.me -d adminapp.oshioxi.me"
echo "3. Configure your domain DNS to point to this server"
echo "4. Test the application:"
echo "   - Frontend: http://app.oshioxi.me"
echo "   - Backend: http://adminapp.oshioxi.me"
echo ""
echo "Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Restart: docker-compose restart"
echo "  - Update: ./update.sh"
echo "  - Backup: ./backup.sh"
echo "  - Monitor: ./monitor.sh"
