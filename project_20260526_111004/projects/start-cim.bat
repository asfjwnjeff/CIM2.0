@echo off
cd /d "%~dp0"

echo ================================
echo   CIM 2.0 Dev Server
echo ================================

echo Stopping old server...
D:\Git\usr\bin\bash.exe scripts/stop-dev.sh 2>nul

echo Starting server...
start /min "" D:\Git\usr\bin\bash.exe scripts/start-dev.sh

echo Waiting for server...
timeout /t 6 /nobreak >nul
start http://localhost:5000

echo Done! http://localhost:5000
echo You can close this window.
echo To stop: double-click stop-cim.bat
timeout /t 2 >nul
exit
