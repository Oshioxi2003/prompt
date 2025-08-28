#!/usr/bin/env bash
# Deploy lần đầu hoặc redeploy toàn bộ stack
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd -P)"
ROOT_DIR="${ROOT_DIR:-$(cd "$SCRIPT_DIR/.." && pwd -P)}"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT_DIR/docker-compose.production.yml}"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env.production}"

dc() {
  if docker compose version >/dev/null 2>&1; then
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" "$@"
  else
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" "$@"
  fi
}

need() { command -v "$1" >/dev/null 2>&1 || { echo "❌ Thiếu lệnh: $1"; exit 1; }; }

echo "🔎 Kiểm tra yêu cầu..."
need docker
if ! docker compose version >/dev/null 2>&1 && ! command -v docker-compose >/dev/null 2>&1; then
  echo "❌ Chưa có docker compose"; exit 1
fi
[[ -f "$COMPOSE_FILE" ]] || { echo "❌ Không thấy $COMPOSE_FILE"; exit 1; }
[[ -f "$ENV_FILE" ]] || { echo "❌ Không thấy $ENV_FILE"; exit 1; }

set -a; . "$ENV_FILE"; set +a

echo "🧰 Tạo network/volumes (nếu chưa có) & build:"
dc build --pull

echo "🚀 Khởi động stack:"
dc up -d

echo "⏳ Chờ DB healthy (tối đa ~90s):"
for i in {1..30}; do
  state="$(dc ps --format json 2>/dev/null | jq -r '.[] | select(.Service=="db") | .State' || true)"
  [[ "$state" == "running" || "$state" == "healthy" ]] && break
  sleep 3
done || true

echo "🧪 Smoke test nội bộ:"
curl -sI http://127.0.0.1:8000 | head -n1 || true
curl -sI http://127.0.0.1:8080 | head -n1 || true

echo "🌐 Nhắc lại cấu hình Cloudflare Tunnel (nếu chưa tạo record):"
echo "  cloudflared tunnel route dns oshioxi-tunnel ${PUBLIC_HOST:-app.oshioxi.me}"
echo "  cloudflared tunnel route dns oshioxi-tunnel ${WEB_HOST:-web.oshioxi.me}"

echo "✅ Done. Chạy scripts/status-check.sh để kiểm nhanh."
