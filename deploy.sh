#!/bin/bash

# deploy.sh - Script triển khai ứng dụng lên Ubuntu server

echo "🚀 Bắt đầu triển khai ứng dụng Prompt Library..."

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
if [ "$EUID" -eq 0 ]; then
    print_error "Vui lòng không chạy script này với quyền root"
    exit 1
fi

# Update system
print_status "Cập nhật hệ thống..."
sudo apt update && sudo apt upgrade -y

# Install Docker
if ! command -v docker &> /dev/null; then
    print_status "Cài đặt Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    print_warning "Vui lòng logout và login lại để áp dụng quyền Docker"
else
    print_status "Docker đã được cài đặt"
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_status "Cài đặt Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    print_status "Docker Compose đã được cài đặt"
fi

# Create application directory
APP_DIR="/opt/prompt-library"
print_status "Tạo thư mục ứng dụng tại $APP_DIR..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Copy application files (assume files are in current directory)
print_status "Sao chép files ứng dụng..."
cp -r . $APP_DIR/
cd $APP_DIR

# Create environment file
if [ ! -f .env ]; then
    print_status "Tạo file môi trường .env..."
    cat > .env << EOL
# Production Environment Variables
DEBUG=False
SECRET_KEY=$(openssl rand -base64 32)
DATABASE_URL=mysql://promptuser:promptpass123@db:3306/prompt_library
FRONTEND_URL=http://$(curl -s ifconfig.me)
REDIS_URL=redis://redis:6379/0

# Email Settings (configure these)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com

# SSO Providers (configure these)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# AI API Keys (configure these)
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
CLAUDE_API_KEY=your-claude-api-key
EOL
    print_warning "Vui lòng cập nhật file .env với thông tin thực tế của bạn"
fi

# Create SSL directory
sudo mkdir -p ssl

# Install UFW firewall
print_status "Cấu hình firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# Build and start containers
print_status "Build và khởi động containers..."
docker-compose down --remove-orphans
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be ready
print_status "Đợi services khởi động..."
sleep 30

# Check if services are running
print_status "Kiểm tra trạng thái services..."
docker-compose ps

# Create superuser (interactive)
print_status "Tạo tài khoản admin Django..."
docker-compose exec web python backend/manage.py createsuperuser

# Show final instructions
print_status "🎉 Triển khai hoàn tất!"
echo
echo "📋 Thông tin quan trọng:"
echo "  - Website: http://$(curl -s ifconfig.me)"
echo "  - Admin: http://$(curl -s ifconfig.me)/admin"
echo "  - Logs: docker-compose logs -f"
echo "  - Stop: docker-compose down"
echo "  - Restart: docker-compose restart"
echo
echo "🔧 Cần làm thêm:"
echo "  1. Cập nhật file .env với thông tin thực tế"
echo "  2. Cấu hình SSL certificates cho HTTPS"
echo "  3. Thiết lập backup database"
echo "  4. Cấu hình domain name"
echo
print_warning "Nhớ cập nhật mật khẩu database trong production!"
