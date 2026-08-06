# Сохранить frontend-образ и перенести на VPS (когда GHCR/сборка на сервере недоступны)
# Запуск на Windows (PowerShell), из корня репозитория:
#   powershell -File scripts/export-frontend-image.ps1

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

Write-Host "Building frontend image..."
docker compose build frontend

$out = Join-Path (Get-Location) "radenie-frontend.tar"
Write-Host "Saving to $out (это займёт несколько минут)..."
docker save -o $out radeniepro-frontend:latest

Write-Host ""
Write-Host "Готово: $out"
Write-Host "Дальше на Windows:"
Write-Host "  scp radenie-frontend.tar root@ВАШ_IP:/opt/RADENIE.PRO/"
Write-Host ""
Write-Host "На VPS:"
Write-Host "  cd /opt/RADENIE.PRO"
Write-Host "  docker load -i radenie-frontend.tar"
Write-Host "  # в .env: FRONTEND_IMAGE=radeniepro-frontend:latest"
Write-Host "  docker compose up -d --force-recreate --no-build frontend nginx"
Write-Host "  docker compose exec -T postgres psql -U radenie -d radenie_pro < scripts/reset-admin.sql"
