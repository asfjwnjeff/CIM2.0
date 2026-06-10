@echo off
cd /d "%~dp0"

echo ================================
echo   CIM 2.0 Dev Server
echo ================================
echo.

set BASH=
if exist "D:\Git\usr\bin\bash.exe" set BASH=D:\Git\usr\bin\bash.exe
if exist "C:\Program Files\Git\usr\bin\bash.exe" set BASH=C:\Program Files\Git\usr\bin\bash.exe
if exist "C:\Program Files\Git\bin\bash.exe" set BASH=C:\Program Files\Git\bin\bash.exe

if "%BASH%"=="" (
    echo ERROR: bash.exe not found!
    echo Please install Git for Windows.
    pause
    exit /b 1
)

echo Starting server in background...
"%BASH%" scripts/start-dev.sh

echo Opening browser...
start http://localhost:5000

echo.
echo Server is running at http://localhost:5000
echo You can close this window now.
echo To stop: double-click stop-cim.bat
echo ================================

timeout /t 3 >nul
exit
