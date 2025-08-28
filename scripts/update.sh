#!/usr/bin/env bash
# Cập nhật images/code & khởi động lại dịch vụ an toàn
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

if [[ ! -f "$COMPOSE_FILE" || ! -f "$ENV_FILE" ]]; then
  echo "❌ Thiếu $COMPOSE_FILE hoặc $ENV_FILE"; exit 1
fi

set -a; . "$ENV_FILE"; set +a

echo "🔄 Build images (pull base, no-cache cho sạch):"
dc build --pull --no-cache

echo "🚀 Up containers:"
dc up -d

echo "🧼 Prune images treo (tùy chọn):"
docker image prune -f >/dev/null || true

echo "🪵 Logs khởi động (api):"
dc logs --tail=50 api || true

echo "✅ Done. Gợi ý kiểm tra: scripts/status-check.sh"
