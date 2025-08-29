#!/bin/bash

# Health Check Script for Prompt Library
# Usage: ./health-check.sh

set -e

echo "🏥 Health Check for Prompt Library"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check Docker
echo ""
echo "🐳 Docker Services:"
if command -v docker &> /dev/null; then
    if docker info &> /dev/null; then
        print_status 0 "Docker is running"
        
        # Check containers
        if [ -f docker-compose.yml ]; then
            echo "   Checking containers..."
            docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
        fi
    else
        print_status 1 "Docker is not running"
    fi
else
    print_status 1 "Docker is not installed"
fi

# Check Nginx
echo ""
echo "🌐 Nginx:"
if systemctl is-active --quiet nginx; then
    print_status 0 "Nginx is running"
    
    # Test Nginx configuration
    if sudo nginx -t &> /dev/null; then
        print_status 0 "Nginx configuration is valid"
    else
        print_status 1 "Nginx configuration has errors"
    fi
else
    print_status 1 "Nginx is not running"
fi

# Check ports
echo ""
echo "🔌 Port Status:"
ports=("80" "443" "8000" "8080" "3306" "6379")
for port in "${ports[@]}"; do
    if netstat -tuln | grep ":$port " &> /dev/null; then
        print_status 0 "Port $port is open"
    else
        print_status 1 "Port $port is closed"
    fi
done

# Check SSL certificates
echo ""
echo "🔒 SSL Certificates:"
if command -v certbot &> /dev/null; then
    if sudo certbot certificates &> /dev/null; then
        print_status 0 "SSL certificates are installed"
        
        # Check certificate expiry
        domains=("app.oshioxi.me" "adminapp.oshioxi.me")
        for domain in "${domains[@]}"; do
            expiry=$(sudo certbot certificates | grep -A 2 "$domain" | grep "VALID" | awk '{print $2}')
            if [ ! -z "$expiry" ]; then
                echo "   $domain: Valid until $expiry"
            else
                print_warning "$domain: Certificate not found"
            fi
        done
    else
        print_status 1 "SSL certificates are not installed"
    fi
else
    print_warning "Certbot is not installed"
fi

# Check application health
echo ""
echo "🏥 Application Health:"
if curl -s http://localhost/health &> /dev/null; then
    print_status 0 "Frontend is responding"
else
    print_status 1 "Frontend is not responding"
fi

if curl -s http://localhost:8080/health &> /dev/null; then
    print_status 0 "Backend is responding"
else
    print_status 1 "Backend is not responding"
fi

# Check database
echo ""
echo "🗄️  Database:"
if [ -f docker-compose.yml ]; then
    if docker-compose exec -T db mysqladmin ping -h localhost &> /dev/null; then
        print_status 0 "MySQL is running"
    else
        print_status 1 "MySQL is not responding"
    fi
else
    print_warning "Docker Compose not found, skipping database check"
fi

# Check Redis
echo ""
echo "📦 Redis:"
if [ -f docker-compose.yml ]; then
    if docker-compose exec -T redis redis-cli ping &> /dev/null; then
        print_status 0 "Redis is running"
    else
        print_status 1 "Redis is not responding"
    fi
else
    print_warning "Docker Compose not found, skipping Redis check"
fi

# Check disk space
echo ""
echo "💾 Disk Space:"
df_output=$(df -h / | tail -1)
usage_percent=$(echo $df_output | awk '{print $5}' | sed 's/%//')
if [ $usage_percent -lt 80 ]; then
    print_status 0 "Disk space is OK ($usage_percent% used)"
else
    print_warning "Disk space is getting low ($usage_percent% used)"
fi

# Check memory
echo ""
echo "🧠 Memory Usage:"
memory_info=$(free -m | grep Mem)
total_mem=$(echo $memory_info | awk '{print $2}')
used_mem=$(echo $memory_info | awk '{print $3}')
mem_percent=$((used_mem * 100 / total_mem))

if [ $mem_percent -lt 80 ]; then
    print_status 0 "Memory usage is OK ($mem_percent% used)"
else
    print_warning "Memory usage is high ($mem_percent% used)"
fi

# Check logs for errors
echo ""
echo "📋 Recent Errors (last 10 lines):"
if [ -f docker-compose.yml ]; then
    echo "Docker logs:"
    docker-compose logs --tail=10 | grep -i error || echo "   No recent errors found"
else
    echo "   Docker Compose not found, skipping log check"
fi

echo ""
echo "🏁 Health check completed!"
echo ""
echo "For detailed logs, run:"
echo "  docker-compose logs -f [service_name]"
echo "  sudo journalctl -u nginx -f"
echo "  sudo journalctl -u prompt-library.service -f"
