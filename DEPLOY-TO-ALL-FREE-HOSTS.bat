@echo off
title Deploy to All Free Hosting Platforms
color 0A

echo.
echo 🚀 DEPLOY TO ALL FREE HOSTING PLATFORMS
echo =======================================
echo رفع المشروع على جميع المواقع المجانية
echo.

echo 🎯 Available Free Hosting Options:
echo =================================
echo 1. 🏆 Netlify (RECOMMENDED - with Functions)
echo 2. 🥈 Vercel (Fastest)
echo 3. 🥉 GitHub Pages (Simple)
echo 4. 🌟 Render (Powerful)
echo 5. 🔥 Firebase (Google)
echo 6. ⚡ Surge.sh (Quick)
echo 7. 🚀 Deploy to ALL
echo.

set /p choice="Choose deployment option (1-7): "

if "%choice%"=="1" goto netlify
if "%choice%"=="2" goto vercel
if "%choice%"=="3" goto github
if "%choice%"=="4" goto render
if "%choice%"=="5" goto firebase
if "%choice%"=="6" goto surge
if "%choice%"=="7" goto all
goto invalid

:netlify
echo.
echo 🏆 DEPLOYING TO NETLIFY
echo =======================
echo.
echo ✅ Netlify is the BEST choice for this project!
echo ✅ Supports Functions (needed for webhook)
echo ✅ Free forever
echo ✅ Easy to use
echo.
call DEPLOY-NETLIFY-NOW.bat
goto end

:vercel
echo.
echo 🥈 DEPLOYING TO VERCEL
echo ======================
echo.
echo ✅ Vercel is the FASTEST hosting platform!
echo ⚠️  May need webhook adjustments
echo.

REM Check if vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing Vercel CLI...
    npm install -g vercel
)

echo 🚀 Deploying to Vercel...
vercel --prod

echo.
echo ✅ VERCEL DEPLOYMENT COMPLETE!
echo =============================
echo 🔗 Your site is now live on Vercel
echo 📝 Update Meta webhook URL to your Vercel domain
echo.
goto end

:github
echo.
echo 🥉 DEPLOYING TO GITHUB PAGES
echo ============================
echo.
echo ⚠️  GitHub Pages only supports static sites
echo ⚠️  No Functions support (webhook won't work)
echo ⚠️  Good for frontend demo only
echo.

REM Create gh-pages branch and deploy
git checkout -b gh-pages 2>nul
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages

echo.
echo ✅ GITHUB PAGES DEPLOYMENT COMPLETE!
echo ===================================
echo 🔗 Your site will be available at:
echo https://YOUR-USERNAME.github.io/YOUR-REPO-NAME
echo.
echo 📝 Enable GitHub Pages in repository settings:
echo 1. Go to repository Settings
echo 2. Scroll to Pages section
echo 3. Select 'gh-pages' branch
echo 4. Click Save
echo.
goto end

:render
echo.
echo 🌟 DEPLOYING TO RENDER
echo ======================
echo.
echo ✅ Render supports static sites for free
echo ⚠️  Functions require paid plan
echo.
echo 📝 Manual steps for Render:
echo 1. Go to https://render.com
echo 2. Connect your GitHub account
echo 3. Select your repository
echo 4. Choose 'Static Site'
echo 5. Build command: npm run build
echo 6. Publish directory: dist
echo 7. Click 'Create Static Site'
echo.
goto end

:firebase
echo.
echo 🔥 DEPLOYING TO FIREBASE
echo ========================
echo.

REM Check if firebase CLI is installed
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing Firebase CLI...
    npm install -g firebase-tools
)

echo 🔐 Login to Firebase...
firebase login

echo 🚀 Initializing Firebase project...
firebase init hosting

echo 📦 Building project...
npm run build

echo 🚀 Deploying to Firebase...
firebase deploy

echo.
echo ✅ FIREBASE DEPLOYMENT COMPLETE!
echo ===============================
echo 🔗 Your site is now live on Firebase
echo.
goto end

:surge
echo.
echo ⚡ DEPLOYING TO SURGE.SH
echo =======================
echo.

REM Check if surge CLI is installed
surge --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing Surge CLI...
    npm install -g surge
)

echo 📦 Building project...
npm run build

echo 🚀 Deploying to Surge...
cd dist 2>nul || cd . 
surge

echo.
echo ✅ SURGE DEPLOYMENT COMPLETE!
echo ============================
echo 🔗 Your site is now live on Surge
echo.
goto end

:all
echo.
echo 🚀 DEPLOYING TO ALL PLATFORMS
echo =============================
echo.
echo ⚠️  This will deploy to multiple platforms
echo ⚠️  Make sure you have all CLIs installed
echo.
set /p confirm="Continue? (y/n): "
if /i not "%confirm%"=="y" goto end

echo.
echo 1️⃣ Deploying to Netlify...
call DEPLOY-NETLIFY-NOW.bat

echo.
echo 2️⃣ Deploying to Vercel...
vercel --prod

echo.
echo 3️⃣ Deploying to GitHub Pages...
git checkout -b gh-pages 2>nul
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages

echo.
echo 4️⃣ Deploying to Firebase...
firebase deploy

echo.
echo 5️⃣ Deploying to Surge...
surge

echo.
echo 🎉 ALL DEPLOYMENTS COMPLETE!
echo ===========================
echo ✅ Your project is now live on multiple platforms
echo.
goto end

:invalid
echo.
echo ❌ Invalid choice. Please select 1-7.
echo.
pause
goto start

:end
echo.
echo 🎉 DEPLOYMENT SUMMARY
echo ====================
echo.
echo 🏆 RECOMMENDED: Use Netlify for production
echo   - Supports Functions (webhook works)
echo   - Free forever
echo   - Easy to manage
echo.
echo 🥈 ALTERNATIVE: Use Vercel for speed
echo   - Fastest hosting
echo   - May need webhook tweaks
echo.
echo 🥉 DEMO: Use GitHub Pages for showcasing
echo   - Simple static site
echo   - No backend functionality
echo.
echo 📝 NEXT STEPS:
echo =============
echo 1. Choose your primary hosting platform
echo 2. Update Meta webhook URL
echo 3. Set environment variables
echo 4. Test the complete system
echo.
echo 🔗 USEFUL LINKS:
echo ===============
echo Netlify: https://netlify.com
echo Vercel: https://vercel.com
echo GitHub Pages: https://pages.github.com
echo Render: https://render.com
echo Firebase: https://firebase.google.com
echo Surge: https://surge.sh
echo.
pause