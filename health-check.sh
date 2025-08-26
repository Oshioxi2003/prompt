#!/bin/bash

# health-check.sh - Kiểm tra sức khỏe ứng dụng

echo "🔍 Kiểm tra sức khỏe ứng dụng..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_ok() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker không chạy"
    exit 1
fi
print_ok "Docker đang chạy"

# Check if containers are running
CONTAINERS=(web db redis nginx)
for container in "${CONTAINERS[@]}"; do
    if docker-compose ps | grep -q "$container.*Up"; then
        print_ok "Container $container đang chạy"
    else
        print_error "Container $container không chạy"
    fi
done

# Check if web service is responding
if curl -f -s http://localhost >/dev/null; then
    print_ok "Web service responding"
else
    print_error "Web service không phản hồi"
fi

# Check database connection
if docker-compose exec -T db mysql -u promptuser -ppromptpass123 -e "SELECT 1;" >/dev/null 2>&1; then
    print_ok "Database kết nối OK"
else
    print_error "Database kết nối thất bại"
fi

# Check Redis connection
if docker-compose exec -T redis redis-cli ping | grep -q PONG; then
    print_ok "Redis kết nối OK"
else
    print_error "Redis kết nối thất bại"
fi

# Check disk space
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -lt 80 ]; then
    print_ok "Disk space OK ($DISK_USAGE% used)"
elif [ $DISK_USAGE -lt 90 ]; then
    print_warning "Disk space cảnh báo ($DISK_USAGE% used)"
else
    print_error "Disk space critical ($DISK_USAGE% used)"
fi

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
if [ $MEMORY_USAGE -lt 80 ]; then
    print_ok "Memory usage OK ($MEMORY_USAGE% used)"
elif [ $MEMORY_USAGE -lt 90 ]; then
    print_warning "Memory usage cảnh báo ($MEMORY_USAGE% used)"
else
    print_error "Memory usage critical ($MEMORY_USAGE% used)"
fi

# Show container stats
echo
echo "📊 Container Statistics:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

echo
echo "🔗 Service URLs:"
echo "  - Main site: http://$(curl -s ifconfig.me)"
echo "  - Admin: http://$(curl -s ifconfig.me)/admin"

echo
echo "📋 Quick commands:"
echo "  - Logs: docker-compose logs -f"
echo "  - Restart: docker-compose restart"
echo "  - Update: ./update.sh"
