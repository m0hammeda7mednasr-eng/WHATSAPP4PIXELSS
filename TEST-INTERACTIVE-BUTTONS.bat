@echo off
echo ========================================
echo   Test Interactive Buttons System
echo ========================================
echo.
echo This will test the complete flow:
echo 1. Create test order
echo 2. Send message with buttons
echo 3. Simulate button click
echo.
echo Press any key to start test...
pause >nul

cd /d %~dp0
node test-interactive-buttons.js

echo.
echo ========================================
echo   Test completed!
echo ========================================
echo.
pause
