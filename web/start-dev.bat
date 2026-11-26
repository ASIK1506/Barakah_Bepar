@echo off
cd /d "%~dp0"
set ELECTRON_RUN_AS_NODE=
echo ============================================
echo  Barakah Bepaar - Electron DEV MODE
echo  Uses Vite HMR at localhost:3000
echo ============================================
echo.
echo Starting Vite dev server in background...
start /b cmd /c "npm run dev"
echo Waiting 3 seconds for Vite...
timeout /t 3 /nobreak >nul
echo.
echo Starting Electron in dev mode...
call node electron/launch.cjs --dev
