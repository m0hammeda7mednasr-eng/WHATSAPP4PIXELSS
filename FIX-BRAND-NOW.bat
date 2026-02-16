@echo off
chcp 65001 > nul
cls

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║                  🔧 FIX BRAND EMOJI COLUMN 🔧                 ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo.

echo ❌ المشكلة: Could not find 'brand_emoji' column
echo.
echo ✅ الحل: إضافة العمود الناقص
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

echo 📝 الخطوات:
echo.
echo    1. افتح Supabase SQL Editor
echo    2. انسخ محتوى: fix-brand-emoji.sql
echo    3. اضغط RUN
echo    4. أعد تحميل الموقع
echo.

pause

echo.
echo 🚀 فتح الملفات...
echo.

REM Open SQL file
start notepad fix-brand-emoji.sql

REM Open Supabase SQL Editor
start https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/sql/new

echo.
echo ✅ تم فتح الملفات!
echo.
echo 📋 بعد ما تشغل الـ SQL:
echo    • أعد تحميل الموقع (F5)
echo    • المشكلة هتتحل
echo.

pause
