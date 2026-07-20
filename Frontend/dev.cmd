@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo [RADENIE] Checking port 3000...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 " ^| findstr "LISTENING"') do (
  echo [RADENIE] Port 3000 busy — stopping process PID %%a
  taskkill /PID %%a /F >nul 2>&1
)

timeout /t 2 /nobreak >nul

echo [RADENIE] Starting dev server...
call npm.cmd run dev
if errorlevel 1 pause
