#!/usr/bin/env bash
# Backup DB (MySQL) + media + file cấu hình
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd -P)"
ROOT_DIR="${ROOT_DIR:-$(cd "$SCRIPT_DIR/.." && pwd -P)}"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT_DIR/docker-compose.production.yml}"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env.production}"

BACKUP_ROOT="${BACKUP_ROOT:-/opt/promt-backups}"
TS="$(date +%Y%m%d_%H%M%S)"
DEST="$BACKUP_ROOT/$TS"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

mkdir -p "$DEST"

dc() {
  if docker compose version >/dev/null 2>&1; then
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" "$@"
  else
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" "$@"
  fi
}

if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ Không tìm thấy $ENV_FILE"; exit 1
fi
set -a; . "$ENV_FILE"; set +a

echo "💾 Dump MySQL -> $DEST/db.sql.gz"
dc exec -T db sh -lc 'mysqldump -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' \
  | gzip > "$DEST/db.sql.gz"

echo "🖼  Backup media -> $DEST/media.tar.gz"
API_CID="$(dc ps -q api)"
if [[ -z "$API_CID" ]]; then
  echo "❌ Không tìm thấy container api đang chạy"; exit 1
fi
# docker cp stream ra tar, rồi gzip
docker cp "$API_CID:/app/media" - | gzip > "$DEST/media.tar.gz"

echo "⚙️  Sao lưu cấu hình -> $DEST/"
cp "$COMPOSE_FILE" "$DEST/docker-compose.production.yml"
cp "$ENV_FILE" "$DEST/.env.production"

echo "🧹 Xoá backup cũ (> ${RETENTION_DAYS} ngày)"
find "$BACKUP_ROOT" -maxdepth 1 -type d -name "20*" -mtime +"$RETENTION_DAYS" -exec rm -rf {} \; || true

echo "✅ Hoàn tất: $DEST"
echo
echo "🔁 Khôi phục (tham khảo):"
cat <<'RESTORE'
# 1) Khôi phục DB:
#    zcat /opt/promt-backups/<TS>/db.sql.gz | docker compose exec -T db sh -lc 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"'

# 2) Khôi phục media:
#    gunzip -c /opt/promt-backups/<TS>/media.tar.gz | docker cp - $(docker compose ps -q api):/app/
RESTORE
