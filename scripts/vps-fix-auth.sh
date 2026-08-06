#!/usr/bin/env bash
# Быстрый фикс auth на VPS после git pull
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  echo "Нет .env — скопируйте из .env.example"
  exit 1
fi

# Принудительно выставить публичный URL (не localhost)
if grep -qE '^NEXTAUTH_URL=.*localhost' .env || ! grep -qE '^NEXTAUTH_URL=' .env; then
  sed -i 's|^NEXTAUTH_URL=.*|NEXTAUTH_URL=http://radenie.pro|' .env || true
  if ! grep -qE '^NEXTAUTH_URL=' .env; then
    echo 'NEXTAUTH_URL=http://radenie.pro' >> .env
  fi
  echo "Updated NEXTAUTH_URL=http://radenie.pro"
fi

if ! grep -qE '^PUBLIC_PORT=' .env; then
  echo 'PUBLIC_PORT=80' >> .env
fi
sed -i 's|^PUBLIC_PORT=.*|PUBLIC_PORT=80|' .env

grep -E '^(NEXTAUTH_URL|PUBLIC_PORT)=' .env

docker compose up -d --build frontend nginx
docker compose exec -T postgres psql -U radenie -d radenie_pro <<'SQL'
UPDATE "User"
SET password = '$2a$12$0JSBZwudMGryWDmiiCSHje9AEXQXbwEXH9b6qnZhg4MnYt.9o877e',
    role = 'ADMIN'
WHERE email = 'admin@radenie.pro';
SELECT email, role, left(password, 10) AS hash_start FROM "User" WHERE email = 'admin@radenie.pro';
SQL

echo "Готово. Войдите: http://radenie.pro/login  admin@radenie.pro / Radene2024!"
