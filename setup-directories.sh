#!/bin/bash

# Setup Directories Script for Prompt App
# Usage: ./setup-directories.sh

set -e

echo "📁 Setting up directories for Prompt App..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Create main application directory
APP_DIR="/opt/apps/prompt"
print_status "Creating main application directory: $APP_DIR"
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Create backup directory
BACKUP_DIR="/opt/backups/prompt"
print_status "Creating backup directory: $BACKUP_DIR"
sudo mkdir -p $BACKUP_DIR
sudo chown $USER:$USER $BACKUP_DIR

# Create logs directory
LOGS_DIR="/opt/apps/prompt/logs"
print_status "Creating logs directory: $LOGS_DIR"
mkdir -p $LOGS_DIR

# Create MySQL init directory
MYSQL_INIT_DIR="/opt/apps/prompt/mysql/init"
print_status "Creating MySQL init directory: $MYSQL_INIT_DIR"
mkdir -p $MYSQL_INIT_DIR

# Create media directory
MEDIA_DIR="/opt/apps/prompt/media"
print_status "Creating media directory: $MEDIA_DIR"
mkdir -p $MEDIA_DIR

# Create static files directory
STATIC_DIR="/opt/apps/prompt/staticfiles"
print_status "Creating static files directory: $STATIC_DIR"
mkdir -p $STATIC_DIR

# Set proper permissions
print_status "Setting proper permissions..."
chmod 755 $APP_DIR
chmod 755 $BACKUP_DIR
chmod 755 $LOGS_DIR
chmod 755 $MYSQL_INIT_DIR
chmod 755 $MEDIA_DIR
chmod 755 $STATIC_DIR

print_status "Directory setup completed!"
echo ""
echo "Created directories:"
echo "  - Application: $APP_DIR"
echo "  - Backups: $BACKUP_DIR"
echo "  - Logs: $LOGS_DIR"
echo "  - MySQL Init: $MYSQL_INIT_DIR"
echo "  - Media: $MEDIA_DIR"
echo "  - Static Files: $STATIC_DIR"
echo ""
print_warning "Next step: Run ./deploy-ubuntu.sh to deploy the application"
