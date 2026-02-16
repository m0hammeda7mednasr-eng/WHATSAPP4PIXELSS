@echo off
echo ========================================
echo    Upload to GitHub - Quick Guide
echo ========================================
echo.

echo [Step 1] Check Git installation...
git --version >nul 2>&1
if errorlevel 1 (
    echo Git is not installed!
    echo.
    echo Please install Git from: https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)
echo Git is installed!
echo.

echo [Step 2] Initialize Git repository...
git init
echo.

echo [Step 3] Add all files...
git add .
echo.

echo [Step 4] Create first commit...
git commit -m "Initial commit - WhatsApp CRM System"
echo.

echo ========================================
echo    Next Steps:
echo ========================================
echo.
echo 1. Create a new repository on GitHub:
echo    https://github.com/new
echo.
echo 2. Repository name: whatsapp-crm
echo    Visibility: Private
echo.
echo 3. Copy the repository URL
echo.
echo 4. Run these commands:
echo.
echo    git remote add origin https://github.com/USERNAME/whatsapp-crm.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo ========================================
echo.
pause
