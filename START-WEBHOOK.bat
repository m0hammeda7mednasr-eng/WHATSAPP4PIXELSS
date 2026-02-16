@echo off
echo ========================================
echo Starting Webhook Setup
echo ========================================
echo.

echo Step 1: Checking if webhook server is running...
curl -s http://localhost:3001/health > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Webhook server is not running!
    echo.
    echo Please start it first:
    echo   npm run server
    echo.
    pause
    exit /b 1
)
echo [OK] Webhook server is running
echo.

echo Step 2: Starting ngrok...
echo.
echo ========================================
echo IMPORTANT: Copy the ngrok URL
echo ========================================
echo.
echo After ngrok starts, you will see:
echo   Forwarding  https://xxxx-xxxx.ngrok-free.app
echo.
echo Copy that URL and use it in Meta Developer Console
echo.
echo Webhook URL format:
echo   https://your-ngrok-url.ngrok-free.app/webhook/whatsapp
echo.
echo Verify Token:
echo   whatsapp_crm_2024
echo.
echo ========================================
echo.
pause

ngrok http 3001
