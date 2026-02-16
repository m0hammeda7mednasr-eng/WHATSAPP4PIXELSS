@echo off
echo Checking Shopify connection...
echo.
cd /d "%~dp0"
node check-shopify-connection.js
echo.
pause
