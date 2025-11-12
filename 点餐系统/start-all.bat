@echo off
echo ====================================
echo   Coffee Ordering System Launcher
echo   咖啡店点餐系统启动器
echo ====================================
echo.

echo Starting Backend Server...
start "Backend - Port 3000" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Frontend - Port 5173" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 /nobreak > nul

echo.
echo ====================================
echo   System Started!
echo   系统已启动!
echo ====================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Opening browser...
timeout /t 2 /nobreak > nul
start http://localhost:5173

echo.
echo Press any key to exit this window...
echo (Backend and Frontend windows will remain open)
pause > nul
