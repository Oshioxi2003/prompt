# 🚀 Ubuntu Deployment Guide for Prompt Library

Hướng dẫn deploy ứng dụng Prompt Library lên Ubuntu server với domain `app.oshioxi.me` (frontend) và `adminapp.oshioxi.me` (backend).

## 📋 Prerequisites

- Ubuntu 20.04 LTS hoặc mới hơn
- Server với ít nhất 2GB RAM và 20GB storage
- Domain đã được cấu hình DNS trỏ về server
- Cloudflare account (cho SSL và CDN)

## 🛠️ Quick Deployment

### 1. Chuẩn bị Server

```bash
# SSH vào server
ssh user@your-server-ip

# Clone repository
git clone https://github.com/your-repo/prompt-library.git
cd prompt-library

# Cấp quyền thực thi cho script
chmod +x deploy-ubuntu.sh
chmod +x setup-ssl-cloudflare.sh
```

### 2. Chạy Deployment Script

```bash
# Chạy script deployment
./deploy-ubuntu.sh
```

Script này sẽ:
- Cài đặt Docker và Docker Compose
- Cài đặt Nginx
- Cấu hình firewall
- Build và chạy containers
- Tạo systemd service cho auto-start

### 3. Cấu hình Environment Variables

```bash
# Chỉnh sửa file .env
nano /opt/prompt-library/.env
```

Cập nhật các giá trị sau:
- `SECRET_KEY`: Tạo key mới cho Django
- `DB_PASSWORD`: Mật khẩu database an toàn
- `EMAIL_*`: Cấu hình email
- `*_API_KEY`: API keys cho các dịch vụ AI
- `*_CLIENT_*`: OAuth credentials

### 4. Setup SSL với Cloudflare

```bash
# Chạy script SSL setup
sudo ./setup-ssl-cloudflare.sh
```

Sau đó:
1. Lấy Cloudflare API token từ dashboard
2. Chỉnh sửa `/etc/letsencrypt/cloudflare.ini`
3. Chạy lại certbot command để lấy certificates

## 🔧 Manual Configuration

### DNS Configuration

Cấu hình DNS records trong Cloudflare:

```
Type: A
Name: app
Value: YOUR_SERVER_IP
Proxy: Enabled

Type: A  
Name: adminapp
Value: YOUR_SERVER_IP
Proxy: Enabled
```

### Cloudflare Settings

1. **SSL/TLS Mode**: Full (strict)
2. **Always Use HTTPS**: Enabled
3. **Minify**: Enabled cho CSS, JS, HTML
4. **Brotli**: Enabled
5. **Security Level**: Medium

### Firewall Configuration

```bash
# Mở các ports cần thiết
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 📊 Monitoring & Maintenance

### Health Checks

```bash
# Kiểm tra trạng thái services
./monitor.sh

# Xem logs
docker-compose logs -f

# Kiểm tra resources
docker stats
```

### Backup

```bash
# Tạo backup
./backup.sh

# Backup sẽ được lưu tại: /opt/backups/prompt-library/
```

### Updates

```bash
# Update application
./update.sh
```

## 🔍 Troubleshooting

### Common Issues

1. **Port 80/443 already in use**
   ```bash
   sudo netstat -tulpn | grep :80
   sudo systemctl stop apache2  # nếu có
   ```

2. **Docker permission denied**
   ```bash
   sudo usermod -aG docker $USER
   # Logout và login lại
   ```

3. **SSL certificate issues**
   ```bash
   sudo certbot certificates
   sudo certbot renew --dry-run
   ```

4. **Database connection failed**
   ```bash
   docker-compose logs db
   docker-compose exec db mysql -u root -p
   ```

### Log Locations

- **Application logs**: `/opt/prompt-library/logs/`
- **Nginx logs**: `/var/log/nginx/`
- **Docker logs**: `docker-compose logs [service]`
- **System logs**: `journalctl -u prompt-library.service`

## 🚀 Performance Optimization

### Nginx Optimization

```nginx
# Thêm vào /etc/nginx/nginx.conf
worker_processes auto;
worker_connections 1024;
keepalive_timeout 65;
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### Database Optimization

```sql
-- MySQL optimization
SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB
SET GLOBAL max_connections = 200;
```

### Docker Optimization

```yaml
# Thêm vào docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

## 🔒 Security Checklist

- [ ] Firewall enabled (UFW)
- [ ] SSH key authentication only
- [ ] SSL certificates installed
- [ ] Strong database passwords
- [ ] Regular security updates
- [ ] Backup strategy implemented
- [ ] Monitoring enabled
- [ ] Rate limiting configured

## 📞 Support

Nếu gặp vấn đề:

1. Kiểm tra logs: `./monitor.sh`
2. Restart services: `docker-compose restart`
3. Check system resources: `htop`, `df -h`
4. Verify DNS: `nslookup app.oshioxi.me`

## 🔄 CI/CD Integration

Để tự động deploy khi có update:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.4
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.KEY }}
          script: |
            cd /opt/prompt-library
            git pull origin main
            ./update.sh
```

---

**Lưu ý**: Đảm bảo backup dữ liệu trước khi deploy và test kỹ trên staging environment trước khi deploy production.
