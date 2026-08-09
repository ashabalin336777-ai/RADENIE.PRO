#!/usr/bin/env bash
# Включение HTTPS на VPS после размещения сертификатов в nginx/certs/
set -euo pipefail
cd "$(cd "$(dirname "$0")/.." && pwd)"

CRT="nginx/certs/radenie.pro.crt"
KEY="nginx/certs/radenie.pro.key"

if [[ ! -f "$CRT" || ! -f "$KEY" ]]; then
  echo "Нет файлов сертификата:"
  echo "  $CRT"
  echo "  $KEY"
  echo "Скопируйте CRT и Private Key с Timeweb в эти пути, затем снова запустите скрипт."
  exit 1
fi

chmod 644 "$CRT"
chmod 600 "$KEY"

# NEXTAUTH на https
if grep -qE '^NEXTAUTH_URL=' .env 2>/dev/null; then
  sed -i 's|^NEXTAUTH_URL=.*|NEXTAUTH_URL=https://radenie.pro|' .env
else
  echo 'NEXTAUTH_URL=https://radenie.pro' >> .env
fi

echo "NEXTAUTH_URL=$(grep NEXTAUTH_URL .env)"

# Проверка конфига nginx
docker compose run --rm --no-deps nginx nginx -t

docker compose up -d --force-recreate nginx frontend

echo
echo "Готово. Проверьте:"
echo "  curl -I https://radenie.pro"
echo "  https://radenie.pro/login"
