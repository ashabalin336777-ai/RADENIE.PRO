#!/usr/bin/env bash
# Обёртка: полный фикс логина (см. vps-fix-login.sh)
exec bash "$(cd "$(dirname "$0")" && pwd)/vps-fix-login.sh" "$@"
