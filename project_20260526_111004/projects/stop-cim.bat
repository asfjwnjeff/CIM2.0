@echo off
cd /d "%~dp0"

set BASH=
if exist "D:\Git\usr\bin\bash.exe" set BASH=D:\Git\usr\bin\bash.exe
if exist "C:\Program Files\Git\usr\bin\bash.exe" set BASH=C:\Program Files\Git\usr\bin\bash.exe
if exist "C:\Program Files\Git\bin\bash.exe" set BASH=C:\Program Files\Git\bin\bash.exe

if "%BASH%"=="" (
    echo ERROR: bash.exe not found!
    pause
    exit /b 1
)

echo Stopping CIM 2.0 server...
"%BASH%" scripts/stop-dev.sh
echo Done.
timeout /t 2 >nul
exit
