@echo off
cd /d "%~dp0backend"
echo Starting Backend Server...
echo.
call npm run dev
pause
