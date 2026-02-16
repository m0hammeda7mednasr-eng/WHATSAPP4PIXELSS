@echo off
chcp 65001 > nul
cls

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║              🧪 TEST TEMPLATE SYSTEM - COMPLETE 🧪            ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo.

echo 🎯 الاختبارات:
echo.
echo    Test 1: عميل جديد → لازم يبعت Template (moon2)
echo    Test 2: عميل موجود → لازم يبعت رسالة عادية
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

echo ⚠️  تأكد إن:
echo    • السيرفر شغال (webhook-server-simple.js)
echo    • الـ Template "moon2" مسجل في الـ database
echo    • الـ Template "moon2" موافق عليه في Meta (Approved)
echo.

pause

echo.
echo 🚀 Running tests...
echo.

node test-template-system.js

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📊 النتائج المتوقعة:
echo.
echo ✅ Test 1 (عميل جديد):
echo    • Server logs: "NEW CUSTOMER - Fetching template"
echo    • Server logs: "Using template: moon2"
echo    • Message type: template
echo.
echo ✅ Test 2 (عميل موجود):
echo    • Server logs: "EXISTING CUSTOMER - Using regular text"
echo    • Message type: text
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

pause
