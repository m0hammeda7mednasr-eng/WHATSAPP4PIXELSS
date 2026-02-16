@echo off
echo ========================================
echo    WhatsApp CRM - Professional Start
echo ========================================
echo.

echo [1/3] Checking setup...
node setup-everything-now.js
if errorlevel 1 (
    echo.
    echo Setup check failed. Please fix the issues above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Starting All Services
echo ========================================
echo.

echo [2/3] Starting Webhook Server...
start "WhatsApp Webhook Server" cmd /k "node server/webhook-server.js"
timeout /t 3 /nobreak >nul

echo [3/3] Starting React App...
start "WhatsApp CRM App" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo    System Started Successfully!
echo ========================================
echo.
echo Webhook Server: http://localhost:3001
echo React App: http://localhost:5177
echo.
echo Press any key to open the app in browser...
pause >nul

start http://localhost:5177

echo.
echo System is running!
echo Close this window to stop all services.
echo.
pause
