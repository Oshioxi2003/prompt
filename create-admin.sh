#!/bin/bash

# Create Django Superuser Script
# Usage: ./create-admin.sh

echo "🔧 Creating Django superuser..."

# Check if running in Docker environment
if [ -f docker-compose.yml ]; then
    echo "Running in Docker environment..."
    
    # Create superuser using Docker Compose
    docker-compose exec backend python manage.py createsuperuser
    
else
    echo "Running in local environment..."
    
    # Check if virtual environment exists
    if [ -d "backend/venv" ]; then
        source backend/venv/bin/activate
    fi
    
    # Create superuser
    cd backend
    python manage.py createsuperuser
fi

echo "✅ Superuser creation completed!"
echo ""
echo "You can now access Django admin at:"
echo "  - Local: http://localhost:8000/admin/"
echo "  - Production: https://adminapp.oshioxi.me/admin/"
