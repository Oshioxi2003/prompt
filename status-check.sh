#!/bin/bash

# status-check.sh - Check system status

echo "🔍 System Status for promt.oshioxi.me"
echo "====================================="

# Check Docker containers
echo "📦 Docker Containers:"
docker-compose -f docker-compose.production.yml ps

echo ""

# Check website
echo "🌐 Website Status:"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://promt.oshioxi.me)
echo "HTTPS Status: $HTTP_STATUS"

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Website is UP"
else
    echo "❌ Website is DOWN"
fi

echo ""

# Check disk space
echo "💽 Disk Usage:"
df -h /

echo ""

# Check memory
echo "🧠 Memory Usage:"
free -h

echo ""

# Check logs (last 10 lines)
echo "📋 Recent Logs:"
docker-compose -f docker-compose.production.yml logs --tail=10

echo ""
echo "🔗 Quick Links:"
echo "  - Website: https://promt.oshioxi.me"
echo "  - Admin: https://promt.oshioxi.me/admin"
echo "  - Logs: docker-compose -f docker-compose.production.yml logs -f"
