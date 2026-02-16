@echo off
chcp 65001 > nul
cls

echo ╔════════════════════════════════════════════════════════════╗
echo ║     SHOPIFY INTEGRATION - COMPLETE TEST SUITE             ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo 📋 This will test:
echo    ✓ Database tables and connections
echo    ✓ Shopify connection status
echo    ✓ Brand configuration
echo    ✓ Contacts and orders
echo    ✓ Webhook endpoint
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

echo [TEST 1/2] Database and Configuration Test
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
node test-shopify-complete.js
echo.

echo.
echo [TEST 2/2] Webhook Direct Test
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo ⚠️  Make sure the server is running before this test!
echo    If not running, press Ctrl+C now and start it first.
echo.
pause
echo.
node test-webhook-direct.js
echo.

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    ALL TESTS COMPLETED                     ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📊 Review the results above
echo.
echo 💡 If webhook test failed:
echo    1. Make sure server is running: node webhook-server-simple.js
echo    2. Check server logs for errors
echo    3. Run the webhook test again
echo.
echo Press any key to exit...
pause > nul
