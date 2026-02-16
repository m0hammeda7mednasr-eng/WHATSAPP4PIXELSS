@echo off
echo ========================================
echo Starting WhatsApp CRM System
echo ========================================
echo.

echo [1/2] Starting Webhook Server...
start "Webhook Server" cmd /k "npm run server"
timeout /t 3 /nobreak > nul

echo [2/2] Starting React App...
start "React App" cmd /k "npm run dev"
timeout /t 3 /nobreak > nul

echo.
echo ========================================
echo System Started!
echo ========================================
echo.
echo Webhook Server: http://localhost:3001
echo React App: http://localhost:5173
echo.
echo Next Steps:
echo 1. Run ngrok: ngrok http 3001
echo 2. Copy the ngrok URL
echo 3. Register in Meta Developer Console
echo.
echo Press any key to exit...
pause > nul
