@echo off
cd /d "%~dp0frontend"
echo Starting Frontend Server...
echo.
call npm run dev
pause
