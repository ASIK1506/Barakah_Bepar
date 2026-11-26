@echo off
cd /d "%~dp0"
set ELECTRON_RUN_AS_NODE=
echo ============================================
echo  Barakah Bepaar - Electron Desktop App
echo  Demo Retail Management Software [GST]
echo ============================================
echo.
echo Building web assets with Vite...
call npm run build
echo.
echo Starting Electron desktop app...
call node electron/launch.cjs %*
