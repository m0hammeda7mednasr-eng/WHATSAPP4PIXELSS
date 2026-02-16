@echo off
chcp 65001 > nul
cls

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║         🔄 FORCE RESTART - KILL OLD SERVER 🔄                 ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo.
echo ⚠️  هذا السكريبت سيوقف كل عمليات Node.js ويشغل سيرفر جديد
echo.
pause

echo.
echo [الخطوة 1] إيقاف كل عمليات Node.js القديمة...
echo.

taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✅ تم إيقاف عمليات Node.js القديمة
) else (
    echo ℹ️  لم يتم العثور على عمليات Node.js قيد التشغيل
)

echo.
echo ⏳ انتظار 2 ثانية...
timeout /t 2 /nobreak > nul

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo [الخطوة 2] مسح الـ cache...
echo.

cd server
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache 2>nul
    echo ✅ تم مسح الـ cache
) else (
    echo ℹ️  لا يوجد cache
)
cd ..

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo [الخطوة 3] تشغيل السيرفر الجديد...
echo.

cd server
start "🖥️ Backend Server - FRESH START" cmd /k "echo. && echo ╔═══════════════════════════════════════════════════════════════╗ && echo ║           BACKEND SERVER - FRESH START                        ║ && echo ║           All old code cleared!                               ║ && echo ╚═══════════════════════════════════════════════════════════════╝ && echo. && echo 📍 Server: http://localhost:3001 && echo 📍 Webhook: http://localhost:3001/api/shopify/webhook && echo. && echo 💡 راقب الـ logs - لازم تشوف الكود الجديد: && echo    ✅ Connection found && echo    ✅ Brand found && echo    ✅ Order saved && echo. && node webhook-server-simple.js"
cd ..

echo ✅ السيرفر الجديد بدأ في نافذة منفصلة
echo.
echo ⏳ انتظار 5 ثواني للسيرفر يبدأ...
timeout /t 5 /nobreak > nul

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo [الخطوة 4] اختبار السيرفر الجديد...
echo.

node test-webhook-direct.js

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                    ✅ RESTART COMPLETE                         ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo 💡 دلوقتي:
echo    1. السيرفر شغال في النافذة التانية
echo    2. راجع نتيجة الاختبار أعلاه
echo    3. لازم تشوف: "✅ SUCCESS! Webhook processed successfully"
echo.
echo 🔍 لو لسه نفس المشكلة:
echo    - شوف الـ server logs في النافذة التانية
echo    - لازم تشوف الكود الجديد (مش "Exact match not found")
echo    - لازم تشوف "✅ Brand found"
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
pause
