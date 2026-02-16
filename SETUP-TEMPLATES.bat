@echo off
chcp 65001 > nul
cls

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║           📋 MESSAGE TEMPLATES SETUP - QUICK GUIDE 📋         ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo.

echo 🎯 الهدف:
echo    • إرسال Template للعملاء الجدد (توفير تكلفة)
echo    • إرسال Template للعملاء الحاليين (استخدام conversation موجود)
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

echo 📝 الخطوات:
echo.
echo 1️⃣  شغل SQL في Supabase:
echo    • افتح: https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/sql/new
echo    • انسخ محتوى: setup-message-templates.sql
echo    • اضغط RUN
echo.

echo 2️⃣  سجل Templates في Meta:
echo    • افتح: https://business.facebook.com/wa/manage/message-templates/
echo    • سجل Template "moon2" للعملاء الجدد
echo    • سجل Template "order_update_existing" للعملاء الحاليين
echo    • انتظر الموافقة (Approved)
echo.

echo 3️⃣  سجل Templates في الموقع:
echo    • افتح: http://localhost:5173
echo    • Settings → Message Templates
echo    • أضف الـ Templates
echo.

echo 4️⃣  أعد تشغيل السيرفر:
echo    • أقفل السيرفر (Ctrl+C)
echo    • شغله تاني
echo.

echo 5️⃣  اختبر:
echo    • اعمل order برقم جديد → لازم يبعت moon2
echo    • اعمل order برقم موجود → لازم يبعت order_update_existing
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

echo 📖 للتفاصيل الكاملة، افتح:
echo    TEMPLATES-SETUP-GUIDE.md
echo.

pause

echo.
echo 🚀 فتح الملفات المطلوبة...
echo.

REM Open SQL file
start notepad setup-message-templates.sql

REM Open guide
start TEMPLATES-SETUP-GUIDE.md

REM Open Supabase SQL Editor
start https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/sql/new

REM Open Meta Templates
start https://business.facebook.com/wa/manage/message-templates/

echo.
echo ✅ تم فتح الملفات!
echo.
pause
