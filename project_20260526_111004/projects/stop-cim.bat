@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 正在停止 CIM 2.0 开发服务器...
bash scripts/stop-dev.sh
echo.
echo 服务器已停止。
timeout /t 2 >nul
exit
