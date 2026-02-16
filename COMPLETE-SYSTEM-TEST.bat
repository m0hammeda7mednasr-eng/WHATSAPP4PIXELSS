@echo off
chcp 65001 > nul
cls

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║           🧪 COMPLETE SYSTEM TEST - FULL CHECK 🧪             ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo.

echo 🎯 هنختبر:
echo.
echo    ✅ 1. Database Connection
echo    ✅ 2. Brands Table
echo    ✅ 3. Templates Table
echo    ✅ 4. Shopify Connection
echo    ✅ 5. Orders System
echo    ✅ 6. Template System (New vs Existing Customer)
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

pause

echo.
echo 🚀 Starting Complete System Test...
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

node complete-system-test.js

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📊 Test Results Summary
echo.
echo    Check the output above for detailed results
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

pause
