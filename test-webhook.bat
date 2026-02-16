@echo off
echo ========================================
echo Testing Webhook Endpoint
echo ========================================
echo.

echo [1] Testing local webhook...
curl "http://localhost:3001/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=whatsapp_crm_2024&hub.challenge=test123"
echo.
echo.

echo [2] Testing health endpoint...
curl http://localhost:3001/health
echo.
echo.

echo ========================================
echo Next Steps:
echo ========================================
echo.
echo 1. If tests passed, run: ngrok http 3001
echo 2. Copy the ngrok URL (https://xxxx.ngrok-free.app)
echo 3. Test ngrok: curl "https://your-url.ngrok-free.app/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=whatsapp_crm_2024&hub.challenge=test"
echo 4. Register in Meta Developer Console
echo.
pause
