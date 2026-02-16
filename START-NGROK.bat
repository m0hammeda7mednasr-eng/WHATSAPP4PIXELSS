@echo off
chcp 65001 > nul
cls

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║              🌐 START NGROK - SHOPIFY WEBHOOK 🌐              ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo.

echo 🚀 Starting ngrok on port 3001...
echo.
echo ⚠️  IMPORTANT: Keep this window open!
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

ngrok http 3001

pause
