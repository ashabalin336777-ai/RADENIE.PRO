@echo off
cd /d "%~dp0"
echo [RADENIE] Installing dependencies...
call npm.cmd install
if errorlevel 1 goto :error

echo [RADENIE] Sync environment...
call npm.cmd run sync-env
if errorlevel 1 goto :error

echo [RADENIE] Generating Prisma client...
call npm.cmd run db:generate
if errorlevel 1 goto :error

echo [RADENIE] Applying database schema...
call npm.cmd run db:push
if errorlevel 1 goto :error

echo [RADENIE] Seeding database...
call npm.cmd run db:seed
if errorlevel 1 goto :error

echo.
echo Done! Run:  .\dev.cmd
goto :end

:error
echo.
echo Setup failed. Check errors above.
pause
exit /b 1

:end
pause
