@echo off
chcp 65001
cd /d "%~dp0admin"
echo 正在启动B端管理后台...
echo.
call npm run dev
