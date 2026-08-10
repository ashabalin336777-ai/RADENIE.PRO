# Save frontend image and transfer to VPS (when GHCR / remote build is unavailable).
# Run on Windows (PowerShell), from repo root:
#   powershell -File scripts/export-frontend-image.ps1

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

Write-Host "Building frontend image..."
docker compose build frontend

$out = Join-Path (Get-Location) "radenie-frontend.tar"
Write-Host "Saving to $out (this may take a few minutes)..."
docker save -o $out radeniepro-frontend:latest

if (-not (Test-Path $out) -or (Get-Item $out).Length -lt 1MB) {
  throw "Export failed: $out is missing or too small"
}

$sizeMb = [math]::Round((Get-Item $out).Length / 1MB, 1)
Write-Host ""
Write-Host "Done: $out ($sizeMb MB)"
Write-Host "Next on Windows:"
Write-Host '  scp .\radenie-frontend.tar root@YOUR_IP:/opt/RADENIE.PRO/'
Write-Host ""
Write-Host "On VPS:"
Write-Host '  cd /opt/RADENIE.PRO'
Write-Host '  docker load -i radenie-frontend.tar'
Write-Host '  # .env: FRONTEND_IMAGE=radeniepro-frontend:latest'
Write-Host '  docker compose up -d --force-recreate --no-build frontend'
