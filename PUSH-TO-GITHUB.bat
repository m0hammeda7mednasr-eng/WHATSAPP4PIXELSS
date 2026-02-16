@echo off
echo ========================================
echo   Push to GitHub
echo ========================================
echo.
echo This will push your project to GitHub
echo Repository: https://github.com/m0hammeda7mednasr-eng/wahtsapp-.git
echo.
echo IMPORTANT: Make sure you have:
echo 1. Git installed
echo 2. GitHub account configured
echo 3. .env file is NOT included (check .gitignore)
echo.
pause

cd /d %~dp0

echo.
echo [1/6] Initializing Git repository...
git init

echo.
echo [2/6] Adding all files...
git add .

echo.
echo [3/6] Creating first commit...
git commit -m "Initial commit: Complete WhatsApp CRM System with Interactive Buttons"

echo.
echo [4/6] Setting main branch...
git branch -M main

echo.
echo [5/6] Adding remote origin...
git remote add origin https://github.com/m0hammeda7mednasr-eng/wahtsapp-.git

echo.
echo [6/6] Pushing to GitHub...
git push -u origin main

echo.
echo ========================================
echo   Done!
echo ========================================
echo.
echo Your project is now on GitHub:
echo https://github.com/m0hammeda7mednasr-eng/wahtsapp-
echo.
pause
