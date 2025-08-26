#!/bin/bash

# update.sh - Script cập nhật ứng dụng

echo "🔄 Cập nhật ứng dụng Prompt Library..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Backup current state
print_status "Tạo backup trước khi cập nhật..."
docker-compose exec db mysqldump -u root -p prompt_library > backup_before_update_$(date +%Y%m%d_%H%M%S).sql

# Pull latest code
print_status "Pull code mới nhất..."
git pull origin main

# Stop services
print_status "Dừng services..."
docker-compose down

# Rebuild images
print_status "Rebuild images..."
docker-compose build --no-cache

# Start services
print_status "Khởi động services..."
docker-compose up -d

# Run migrations
print_status "Chạy database migrations..."
sleep 10
docker-compose exec web python backend/manage.py migrate

# Collect static files
print_status "Collect static files..."
docker-compose exec web python backend/manage.py collectstatic --noinput

# Restart services to ensure everything is fresh
print_status "Restart services..."
docker-compose restart

print_status "✅ Cập nhật hoàn tất!"
docker-compose ps
