@echo off
chcp 65001 > nul
cls

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║           🚀 START EVERYTHING - COMPLETE SYSTEM 🚀            ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo.

echo 📋 النظام الكامل:
echo.
echo    ✅ Orders من Shopify بتتسجل في الـ database
echo    ✅ عميل جديد → يبعتله Template (moon2)
echo    ✅ عميل موجود → يبعتله رسالة عادية (مجاني)
echo    ✅ ngrok شغال للـ webhooks
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

echo 🎯 هنشغل:
echo.
echo    1. السيرفر (webhook-server-simple.js)
echo    2. ngrok (port 3001)
echo    3. Frontend (Vite)
echo.

pause

echo.
echo 🚀 Starting...
echo.

REM Start server in new window
start "WhatsApp CRM Server" cmd /k "cd /d %~dp0server && node webhook-server-simple.js"

timeout /t 3 /nobreak > nul

REM Start ngrok in new window
start "ngrok" cmd /k "cd /d %~dp0 && ngrok http 3001"

timeout /t 3 /nobreak > nul

REM Start frontend in new window
start "Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ✅ كل حاجة شغالة!
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📍 URLs:
echo.
echo    • Frontend: http://localhost:5173
echo    • Server: http://localhost:3001
echo    • ngrok: شوف الـ terminal بتاعه
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📝 الخطوات الجاية:
echo.
echo    1. انسخ ngrok URL من الـ terminal
echo    2. سجله في Shopify Webhooks
echo    3. اعمل order تجريبي
echo    4. شوف النتيجة!
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

pause
