@echo off
chcp 65001 > nul
cls

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║              🔧 FIX ALL ISSUES AND TEST AGAIN 🔧              ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo.

echo 📊 Current Status: 10/12 tests passed (83%%)
echo.
echo ❌ Issues Found:
echo    • brand_emoji column missing
echo    • message_templates table missing
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

echo 🔧 Fix Steps:
echo.
echo    1. Open Supabase SQL Editor
echo    2. Copy content from: FIX-ALL-MISSING.sql
echo    3. Click RUN
echo    4. Run test again
echo.

pause

echo.
echo 🚀 Opening files...
echo.

REM Open SQL file
start notepad FIX-ALL-MISSING.sql

REM Open Supabase
start https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/sql/new

echo.
echo ✅ Files opened!
echo.
echo 📋 After running the SQL:
echo    Press any key to run the test again...
echo.

pause

echo.
echo 🧪 Running test again...
echo.

node complete-system-test.js

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 💡 If all tests pass (12/12):
echo    • System is ready!
echo    • Add your template in: http://localhost:5173
echo    • Settings → Message Templates → + Add Template
echo.

pause
