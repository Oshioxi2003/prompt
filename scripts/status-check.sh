#!/usr/bin/env bash
# Kiểm tra nhanh: tình trạng containers + HTTP status các host
set -euo pipefail

# --- Paths ---
SCRIPT_DIR="$(cd -- "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd -P)"
ROOT_DIR="${ROOT_DIR:-$(cd "$SCRIPT_DIR/.." && pwd -P)}"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT_DIR/docker-compose.production.yml}"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env.production}"

# --- Compose helper (plugin hoặc binary cũ) ---
dc() {
  if docker compose version >/dev/null 2>&1; then
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" "$@"
  else
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" "$@"
  fi
}

# --- Load env (để có PUBLIC_HOST/WEB_HOST) ---
if [[ -f "$ENV_FILE" ]]; then
  set -a; . "$ENV_FILE"; set +a
else
  echo "❌ Không tìm thấy $ENV_FILE"; exit 1
fi

PUBLIC_HOST="${PUBLIC_HOST:-app.oshioxi.me}"
WEB_HOST="${WEB_HOST:-web.oshioxi.me}"
HEALTH_PATH="${HEALTH_PATH:-/healthz}"   # có thể đổi; nếu 404 sẽ fallback "/"

echo "📦 Containers:"
dc ps

echo
echo "🌐 HTTP checks (qua Cloudflare):"
check_url () {
  local url="$1"
  if curl -fsS -o /dev/null -w "%{http_code}" "https://$url$HEALTH_PATH" 2>/dev/null | grep -qE '200|204'; then
    echo "✅ https://$url$HEALTH_PATH -> 200/204"
  else
    code="$(curl -s -o /dev/null -w "%{http_code}" "https://$url" || true)"
    echo "ℹ️  https://$url -> HTTP $code"
  fi
}

check_url "$PUBLIC_HOST"
check_url "$WEB_HOST"

echo
echo "🧩 Cloudflare Tunnel:"
if systemctl is-active --quiet cloudflared 2>/dev/null; then
  echo "✅ cloudflared: active"
else
  echo "⚠️  cloudflared: inactive (nếu đang chạy foreground thì OK)"
fi

# Hiển thị 10 dòng log cuối của api/web (nếu có)
echo
echo "🪵 Logs (đuôi 20 dòng):"
dc logs --tail=20 api || true
dc logs --tail=20 web || true
