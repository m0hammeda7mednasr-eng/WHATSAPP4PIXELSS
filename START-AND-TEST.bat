@echo off
chcp 65001 > nul
cls

echo ╔════════════════════════════════════════════════════════════╗
echo ║        SHOPIFY INTEGRATION - START AND TEST                ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo This script will:
echo   1. Start the backend server
echo   2. Wait 5 seconds
echo   3. Run all tests
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

echo [STEP 1] Starting Backend Server...
echo.
cd server
start "Backend Server" cmd /k "node webhook-server-simple.js"
cd ..

echo ✅ Server started in new window
echo.
echo ⏳ Waiting 5 seconds for server to initialize...
timeout /t 5 /nobreak > nul
echo.

echo [STEP 2] Running Tests...
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

node test-shopify-complete.js

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo [STEP 3] Testing Webhook with Sample Order...
echo.
node test-webhook-direct.js

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    TESTS COMPLETED                         ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📊 Check the results above
echo 🖥️  Server is still running in the other window
echo.
echo 💡 To stop the server:
echo    - Go to the "Backend Server" window
echo    - Press Ctrl+C
echo.
echo Press any key to exit this window...
pause > nul
