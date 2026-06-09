@echo off
chcp 65001 >nul
title CIM 2.0 开发服务器

cd /d "%~dp0"

echo ================================
echo   CIM 2.0 开发服务器
echo ================================
echo.
echo 正在后台启动服务器...

bash scripts/start-dev.sh

echo.
echo 正在打开浏览器...
start http://localhost:5000

echo.
echo 服务器已在后台运行!
echo 访问地址: http://localhost:5000
echo 停止服务器: 双击 stop-cim.bat 或在项目目录运行 pnpm stop-dev
echo.
echo 可以关闭此窗口，服务器不会停止。
echo ================================

timeout /t 3 >nul
exit
