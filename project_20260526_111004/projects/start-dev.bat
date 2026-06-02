@echo off
chcp 65001 >nul
title CIM 2.0 开发服务器 :5000

echo ========================================
echo   CIM 2.0 风控审批系统
echo ========================================
echo.

cd /d "%~dp0"

:: 清除旧 lock，确保端口 5000 不被占用
if exist ".next\dev\lock" (
    echo [清理] 清除上次残留的 lock 文件...
    del /f /q ".next\dev\lock" 2>nul
    rmdir /s /q ".next\dev" 2>nul
)

echo [启动] http://localhost:5000
echo [提示] 关闭本窗口即可停止服务器
echo.

start "" http://localhost:5000

npx next dev --port 5000

pause
