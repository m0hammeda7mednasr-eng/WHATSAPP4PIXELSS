@echo off
echo ========================================
echo   SHOPIFY INTEGRATION - COMPLETE TEST
echo ========================================
echo.

echo [1/3] Testing Database and Connections...
echo.
node test-shopify-complete.js

echo.
echo ========================================
echo   TEST COMPLETED
echo ========================================
echo.
echo Press any key to exit...
pause > nul
