# 🚀 Production Deployment - promt.oshioxi.me

Hệ thống deployment đã được tối ưu hóa cho production với domain `promt.oshioxi.me`.

## ⚡ Quick Deploy

```bash
# 1. Deploy ứng dụng
chmod +x deploy-production.sh
./deploy-production.sh

# 2. Setup SSL (sau khi domain đã trỏ về server)
chmod +x setup-ssl-simple.sh
./setup-ssl-simple.sh

# 3. Kiểm tra status
chmod +x status-check.sh
./status-check.sh
```

## 📁 Files Structure

```
├── Dockerfile.production       # Production Docker image
├── docker-compose.production.yml # Production compose
├── nginx.production.conf       # Nginx config cho promt.oshioxi.me
├── .env.production            # Production environment
├── deploy-production.sh       # Deploy script
├── setup-ssl-simple.sh       # SSL setup script  
├── backup-simple.sh          # Backup script
├── status-check.sh           # Health check script
└── update.sh                 # Update script
```

## 🔧 Configuration

### Database (External MySQL)
- **Host**: 172.31.3.33:3306
- **Database**: prompt
- **User**: prompt_user
- **Password**: 123456

### Domain
- **Main**: promt.oshioxi.me
- **SSL**: Auto-configured với Let's Encrypt

### Services
- **Web**: Django + React (port 8000)
- **Nginx**: Reverse proxy + SSL (port 80/443)

## 📋 Management Commands

```bash
# Check status
./status-check.sh

# View logs
docker-compose -f docker-compose.production.yml logs -f

# Restart services
docker-compose -f docker-compose.production.yml restart

# Update application
./update.sh

# Backup
./backup-simple.sh

# Stop services
docker-compose -f docker-compose.production.yml down

# Start services
docker-compose -f docker-compose.production.yml up -d
```

## 🔒 Security Features

- ✅ HTTPS với Let's Encrypt
- ✅ Security headers
- ✅ Non-root container user
- ✅ Firewall configuration
- ✅ Auto SSL renewal

## 📊 Monitoring

- **Website**: https://promt.oshioxi.me
- **Admin**: https://promt.oshioxi.me/admin
- **Status**: `./status-check.sh`
- **Logs**: Docker Compose logs

## 🔄 Updates

```bash
# Pull latest code
git pull

# Rebuild and restart
./update.sh
```

## 💾 Backup

- **Auto backup**: Weekly (Sundays 2 AM)
- **Manual backup**: `./backup-simple.sh`
- **Location**: `/opt/promt-backups`

## 🆘 Troubleshooting

```bash
# Check container status
docker-compose -f docker-compose.production.yml ps

# Check logs
docker-compose -f docker-compose.production.yml logs web
docker-compose -f docker-compose.production.yml logs nginx

# Restart specific service
docker-compose -f docker-compose.production.yml restart web

# Check system resources
./status-check.sh
```

## 📧 Support

- **Email**: oshioxi.daotoan@gmail.com
- **Domain**: promt.oshioxi.me
- **Server**: External database at 172.31.3.33
