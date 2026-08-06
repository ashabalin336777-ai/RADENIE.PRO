#!/usr/bin/env bash
# Полный фикс входа в админку на VPS (по плану root-cause).
# Запуск на сервере:
#   cd /opt/RADENIE.PRO && bash scripts/vps-fix-login.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PUBLIC_URL="${PUBLIC_URL:-http://radenie.pro}"
RESET_TOKEN="${ADMIN_RESET_TOKEN:-radenie-temp-reset-2024}"

upsert_env() {
  local key="$1"
  local value="$2"
  if grep -qE "^${key}=" .env 2>/dev/null; then
    sed -i "s|^${key}=.*|${key}=${value}|" .env
  else
    echo "${key}=${value}" >> .env
  fi
}

echo "=== 1) Диагностика ==="
git log -1 --oneline || true
docker compose images 2>/dev/null | grep -E 'frontend|backend|NAME' || true

if [[ ! -f .env ]]; then
  echo "Нет .env — копирую из .env.example"
  cp .env.example .env
fi

echo "=== 2) Выравнивание .env ==="
upsert_env NEXTAUTH_URL "$PUBLIC_URL"
upsert_env PUBLIC_PORT "80"
upsert_env ALLOW_ADMIN_RESET "1"
upsert_env ADMIN_RESET_TOKEN "$RESET_TOKEN"

# Убедиться, что секреты не пустые
if ! grep -qE '^NEXTAUTH_SECRET=.+' .env || grep -qE '^NEXTAUTH_SECRET=change-me' .env; then
  if grep -qE '^SESSION_SECRET=.+' .env; then
    SESSION_VAL="$(grep -E '^SESSION_SECRET=' .env | head -1 | cut -d= -f2-)"
    upsert_env NEXTAUTH_SECRET "$SESSION_VAL"
  else
    GEN="$(openssl rand -hex 24 2>/dev/null || head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n')"
    upsert_env SESSION_SECRET "$GEN"
    upsert_env NEXTAUTH_SECRET "$GEN"
  fi
fi

grep -E '^(NEXTAUTH_URL|PUBLIC_PORT|ALLOW_ADMIN_RESET)=' .env

echo "=== 3) Swap 4G (Docker build Next на 2GB RAM без swap падает) ==="
if ! swapon --show 2>/dev/null | grep -q .; then
  if [[ ! -f /swapfile ]]; then
    echo "Создаю 4G swap..."
    fallocate -l 4G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=4096
    chmod 600 /swapfile
    mkswap /swapfile
    grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  fi
  swapon /swapfile || true
fi
# Если swap меньше 3G — расширим
SWAP_MB="$(free -m | awk '/Swap:/ {print $2}')"
if [[ "${SWAP_MB:-0}" -lt 3000 ]]; then
  echo "Swap мало (${SWAP_MB}MB) — добавляю /swapfile2 (2G)..."
  if [[ ! -f /swapfile2 ]]; then
    fallocate -l 2G /swapfile2 || dd if=/dev/zero of=/swapfile2 bs=1M count=2048
    chmod 600 /swapfile2
    mkswap /swapfile2
  fi
  swapon /swapfile2 || true
fi
free -h | head -3 || true

echo "=== 4) Сброс пароля admin через SQL (без Next) ==="
if [[ ! -f scripts/reset-admin.sql ]]; then
  echo "ERROR: scripts/reset-admin.sql не найден — сделайте git pull"
  exit 1
fi

docker compose up -d postgres
# дождаться healthy
for i in $(seq 1 30); do
  if docker compose exec -T postgres pg_isready -U radenie -d radenie_pro >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

docker compose exec -T postgres psql -U radenie -d radenie_pro < scripts/reset-admin.sql

echo "=== 5) Backend (лёгкий reset API) + nginx ==="
docker compose build backend
docker compose up -d --force-recreate backend nginx

echo "Проверка health:"
curl -sS --max-time 10 http://127.0.0.1/api/health || true
echo

echo "Сброс через backend /api/reset-admin:"
RESET_RESP="$(curl -sS --max-time 15 -X POST http://127.0.0.1/api/reset-admin \
  -H 'Content-Type: application/json' \
  -H "x-reset-token: ${RESET_TOKEN}" || true)"
echo "$RESET_RESP"

echo "=== 6) Frontend (может занять несколько минут на 2GB) ==="
# Освобождаем RAM перед тяжёлой сборкой
docker compose stop frontend 2>/dev/null || true
docker system prune -f >/dev/null 2>&1 || true
export DOCKER_BUILDKIT=1
docker compose build --progress=plain frontend 2>&1 | tee /tmp/build-frontend.log
docker compose up -d --force-recreate frontend nginx

echo "=== 7) Финальная проверка ==="
docker compose ps
echo
echo "NEXTAUTH внутри frontend:"
docker compose exec -T frontend sh -c 'echo NEXTAUTH_URL=$NEXTAUTH_URL' || true

echo
echo "Готово."
echo "  URL:   ${PUBLIC_URL}/login"
echo "  Login: admin@radenie.pro"
echo "  Pass:  Radene2024!"
echo
echo "После успешного входа выключите аварийный сброс:"
echo "  sed -i 's/^ALLOW_ADMIN_RESET=.*/ALLOW_ADMIN_RESET=0/' .env"
echo "  docker compose up -d --force-recreate backend frontend"
