#!/bin/bash

# backup-simple.sh - Simple backup script

BACKUP_DIR="/opt/promt-backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

echo "💾 Creating backup..."

# Backup media files
tar -czf $BACKUP_DIR/media_$DATE.tar.gz -C /opt/promt-app backend/media

# Backup database (if using external DB, create manual dump)
echo "Database backup instructions:"
echo "Run on DB server: mysqldump -u prompt_user -p prompt > $BACKUP_DIR/db_$DATE.sql"

# Keep only last 7 backups
find $BACKUP_DIR -name "media_*.tar.gz" -mtime +7 -delete

echo "✅ Backup completed: $BACKUP_DIR"
echo "Media: $BACKUP_DIR/media_$DATE.tar.gz"

# Add to crontab (weekly backup)
(crontab -l 2>/dev/null; echo "0 2 * * 0 /opt/promt-app/backup-simple.sh") | crontab -
