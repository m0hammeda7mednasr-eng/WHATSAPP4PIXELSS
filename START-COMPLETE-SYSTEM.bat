@echo off
echo ========================================
echo   WhatsApp CRM - Complete System
echo ========================================
echo.
echo Starting all services...
echo.

REM Start Backend Server
echo [1/3] Starting Backend Server...
start "Backend Server" cmd /k "cd /d %~dp0server && node webhook-server-simple.js"
timeout /t 2 /nobreak >nul

REM Start Cron Job
echo [2/3] Starting Reminder Cron Job...
start "Reminder Cron" cmd /k "cd /d %~dp0server && node cron-reminder.js"
timeout /t 2 /nobreak >nul

REM Start Frontend
echo [3/3] Starting Frontend...
start "Frontend" cmd /k "cd /d %~dp0 && npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   All services started!
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause >nul
