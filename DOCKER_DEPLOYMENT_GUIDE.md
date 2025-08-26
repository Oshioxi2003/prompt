# Docker Deployment Guide for Ubuntu

## Tổng quan
Dự án này sử dụng Docker để containerize ứng dụng Django + React, bao gồm:
- **Backend**: Django REST API
- **Frontend**: React (được build và serve qua Django)
- **Database**: MySQL 8.0
- **Cache**: Redis
- **Web Server**: Nginx

## Cấu trúc Files

```
├── Dockerfile              # Production image
├── Dockerfile.dev          # Development image  
├── docker-compose.yml      # Production setup
├── docker-compose.dev.yml  # Development setup
├── nginx.conf              # Nginx configuration
├── deploy.sh               # Auto deployment script
└── .env                    # Environment variables
```

## Yêu cầu hệ thống

- Ubuntu 20.04+ 
- RAM: 2GB+ (khuyến nghị 4GB)
- Disk: 10GB+ free space
- Docker và Docker Compose

## Triển khai nhanh

### 1. Sử dụng script tự động (Khuyến nghị)

```bash
# Clone hoặc upload code lên server
cd /path/to/your/project

# Cấp quyền thực thi
chmod +x deploy.sh

# Chạy script
./deploy.sh
```

### 2. Triển khai thủ công

#### Bước 1: Cài đặt Docker

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout và login lại để áp dụng quyền Docker
```

#### Bước 2: Cấu hình môi trường

```bash
# Tạo file .env từ example
cp backend/env.example .env

# Chỉnh sửa .env với thông tin production
nano .env
```

**Ví dụ .env cho production:**

```bash
DEBUG=False
SECRET_KEY=your-super-secret-key-here
DATABASE_URL=mysql://promptuser:promptpass123@db:3306/prompt_library
FRONTEND_URL=http://your-domain.com
REDIS_URL=redis://redis:6379/0

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# SSO (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### Bước 3: Build và chạy

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps
```

#### Bước 4: Setup database và admin

```bash
# Run migrations
docker-compose exec web python backend/manage.py migrate

# Create superuser
docker-compose exec web python backend/manage.py createsuperuser

# Collect static files
docker-compose exec web python backend/manage.py collectstatic --noinput
```

## Development Setup

Để chạy môi trường development:

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Access:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Database: localhost:3306
```

## Quản lý Production

### Các lệnh thường dùng

```bash
# Xem logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop all
docker-compose down

# Update application
git pull
docker-compose build --no-cache
docker-compose up -d

# Backup database
docker-compose exec db mysqldump -u root -p prompt_library > backup.sql

# Access container shell
docker-compose exec web bash
```

### Monitoring

```bash
# Check resource usage
docker stats

# View container logs
docker-compose logs web
docker-compose logs db
docker-compose logs nginx
```

## Cấu hình SSL/HTTPS

### 1. Sử dụng Let's Encrypt

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Update nginx.conf

Uncomment và cấu hình SSL block trong `nginx.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # Rest of configuration...
}
```

## Backup và Restore

### Database Backup

```bash
# Create backup
docker-compose exec db mysqldump -u root -p prompt_library > backup_$(date +%Y%m%d).sql

# Restore backup
docker-compose exec -T db mysql -u root -p prompt_library < backup.sql
```

### Media Files Backup

```bash
# Backup media files
tar -czf media_backup_$(date +%Y%m%d).tar.gz backend/media/

# Restore media files
tar -xzf media_backup.tar.gz
```

## Troubleshooting

### Kiểm tra logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs web
docker-compose logs db
docker-compose logs nginx
```

### Common Issues

1. **Port conflicts**: Thay đổi ports trong docker-compose.yml
2. **Permission issues**: Chạy `sudo chown -R $USER:$USER .`
3. **Database connection**: Kiểm tra DATABASE_URL trong .env
4. **Static files**: Chạy `docker-compose exec web python backend/manage.py collectstatic`

### Performance Tuning

1. **Increase worker processes** trong nginx.conf
2. **Configure MySQL** my.cnf for production
3. **Add Redis caching** cho Django
4. **Use CDN** cho static files

## Security Checklist

- [ ] Thay đổi default passwords
- [ ] Cấu hình firewall (UFW)
- [ ] Setup SSL certificates
- [ ] Regular security updates
- [ ] Database backups
- [ ] Monitor logs
- [ ] Use secrets management

## Scaling

Để scale ứng dụng:

1. **Horizontal scaling**: Thêm multiple web containers
2. **Load balancer**: Sử dụng nginx upstream
3. **Database replication**: Master-slave setup
4. **Cache layer**: Redis cluster
5. **CDN**: Cho static files

---

## Support

Nếu gặp vấn đề, kiểm tra:
1. Docker logs: `docker-compose logs`
2. System resources: `htop`, `df -h`
3. Network connectivity: `ping`, `telnet`
4. Service status: `docker-compose ps`
