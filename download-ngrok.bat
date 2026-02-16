@echo off
echo ========================================
echo Opening ngrok download page...
echo ========================================
echo.

echo Opening browser...
start https://ngrok.com/download

echo.
echo ========================================
echo Instructions:
echo ========================================
echo.
echo 1. Download ngrok for Windows (64-bit)
echo 2. Extract the ZIP file to C:\ngrok
echo 3. Open CMD or PowerShell
echo 4. Run: cd C:\ngrok
echo 5. Run: ngrok http 3001
echo.
echo For detailed instructions, see: install-ngrok.md
echo.
pause
