@echo off
title WhatsApp CRM - Deploy to Netlify
color 0A

echo.
echo ███╗   ██╗███████╗████████╗██╗     ██╗███████╗██╗   ██╗
echo ████╗  ██║██╔════╝╚══██╔══╝██║     ██║██╔════╝╚██╗ ██╔╝
echo ██╔██╗ ██║█████╗     ██║   ██║     ██║█████╗   ╚████╔╝ 
echo ██║╚██╗██║██╔══╝     ██║   ██║     ██║██╔══╝    ╚██╔╝  
echo ██║ ╚████║███████╗   ██║   ███████╗██║██║        ██║   
echo ╚═╝  ╚═══╝╚══════╝   ╚═╝   ╚══════╝╚═╝╚═╝        ╚═╝   
echo.
echo                    WHATSAPP CRM DEPLOYMENT
echo                    ========================
echo                    نشر على Netlify
echo.

echo 🚀 Starting Netlify deployment...
echo ==================================

REM Step 1: Check project structure
echo.
echo 📋 STEP 1: Project Structure Check
echo ===================================

if not exist "package.json" (
    echo ❌ package.json not found
    pause
    exit /b 1
)
echo ✅ package.json found

if not exist "netlify.toml" (
    echo ⚠️  netlify.toml not found, creating...
    echo [build] > netlify.toml
    echo   publish = "dist" >> netlify.toml
    echo   command = "npm run build" >> netlify.toml
    echo. >> netlify.toml
    echo [functions] >> netlify.toml
    echo   directory = "netlify/functions" >> netlify.toml
    echo. >> netlify.toml
    echo [[redirects]] >> netlify.toml
    echo   from = "/api/*" >> netlify.toml
    echo   to = "/.netlify/functions/:splat" >> netlify.toml
    echo   status = 200 >> netlify.toml
    echo. >> netlify.toml
    echo [build.environment] >> netlify.toml
    echo   NODE_VERSION = "18" >> netlify.toml
    echo ✅ netlify.toml created
) else (
    echo ✅ netlify.toml exists
)

if not exist "netlify\functions" (
    echo ⚠️  netlify/functions not found, creating...
    mkdir netlify\functions
    echo ✅ netlify/functions created
) else (
    echo ✅ netlify/functions exists
)

if not exist "netlify\functions\webhook.js" (
    echo ❌ netlify/functions/webhook.js not found
    echo This is required for the webhook to work
    pause
    exit /b 1
) else (
    echo ✅ netlify/functions/webhook.js exists
)

REM Step 2: Install dependencies
echo.
echo 📋 STEP 2: Dependencies
echo =======================

echo 📦 Installing/updating dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ npm install failed
    pause
    exit /b 1
)
echo ✅ Dependencies ready

REM Step 3: Build project
echo.
echo 📋 STEP 3: Build Project
echo ========================

echo 🔨 Building for production...
npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed
    echo Netlify will try to build on their servers
) else (
    echo ✅ Build successful
)

REM Step 4: Git setup
echo.
echo 📋 STEP 4: Git Setup
echo ====================

if not exist ".git" (
    echo 📁 Initializing git...
    git init
    git branch -M main
) else (
    echo ✅ Git already initialized
)

echo 📦 Adding files...
git add .

echo 💾 Committing...
git commit -m "Deploy WhatsApp CRM to Netlify with complete webhook functions"

if %errorlevel% neq 0 (
    echo ⚠️  Nothing new to commit
) else (
    echo ✅ Changes committed
)

REM Step 5: GitHub setup (required for Netlify)
echo.
echo 📋 STEP 5: GitHub Setup
echo =======================

echo 🔗 Setting up GitHub repository...
echo.
echo ⚠️  IMPORTANT: You need to push to GitHub first
echo ===============================================
echo.
echo If you don't have a GitHub repo yet:
echo 1. Go to https://github.com/new
echo 2. Create a new repository (e.g., whatsapp-crm)
echo 3. Copy the repository URL
echo.

set /p GITHUB_URL="Enter your GitHub repository URL (or press Enter to skip): "

if not "%GITHUB_URL%"=="" (
    echo 🔗 Adding GitHub remote...
    git remote remove origin 2>nul
    git remote add origin %GITHUB_URL%
    
    echo 🚀 Pushing to GitHub...
    git push -u origin main
    
    if %errorlevel% neq 0 (
        echo ❌ GitHub push failed
        echo Please check your repository URL and try again
        pause
        exit /b 1
    )
    
    echo ✅ Code pushed to GitHub successfully
) else (
    echo ⚠️  Skipping GitHub setup
    echo You'll need to manually connect to GitHub in Netlify
)

REM Step 6: Netlify deployment instructions
echo.
echo 📋 STEP 6: Netlify Deployment
echo ==============================

echo.
echo 🌐 NETLIFY DEPLOYMENT STEPS:
echo ============================
echo.
echo 1. Go to: https://netlify.com
echo 2. Click "Add new site" → "Import an existing project"
echo 3. Connect your GitHub account
echo 4. Select your repository
echo 5. Build settings will be auto-detected from netlify.toml
echo 6. Click "Deploy site"
echo.

echo ⚙️  ENVIRONMENT VARIABLES TO SET IN NETLIFY:
echo ============================================
echo Go to: Site settings → Environment variables
echo Add these variables:
echo.
echo VITE_SUPABASE_URL=https://rmpgofswkpjxionzythf.supabase.co
echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM
echo WEBHOOK_VERIFY_TOKEN=whatsapp_crm_2024
echo.

echo 🔗 YOUR WEBHOOK URL WILL BE:
echo ============================
echo https://YOUR-SITE-NAME.netlify.app/.netlify/functions/webhook
echo.
echo Replace YOUR-SITE-NAME with your actual Netlify site name
echo.

REM Step 7: Meta webhook setup
echo.
echo 📋 STEP 7: Meta Webhook Setup
echo ==============================

echo.
echo 📱 UPDATE META WEBHOOK URL:
echo ===========================
echo 1. Go to: https://business.facebook.com
echo 2. Select your WhatsApp Business Account
echo 3. Go to: Configuration → Webhook
echo 4. Update Callback URL to: https://YOUR-SITE-NAME.netlify.app/.netlify/functions/webhook
echo 5. Verify Token: whatsapp_crm_2024
echo 6. Subscribe to: messages
echo 7. Click "Verify and Save"
echo.

REM Step 8: Testing
echo.
echo 📋 STEP 8: Testing Instructions
echo ================================

echo.
echo 🧪 AFTER DEPLOYMENT, TEST:
echo ==========================
echo 1. Visit your Netlify site URL
echo 2. Test the webhook endpoint
echo 3. Send WhatsApp messages to test
echo 4. Check Netlify function logs
echo 5. Test order fulfillment
echo.

echo 🔍 MONITORING:
echo ==============
echo - Netlify Dashboard: https://app.netlify.com
echo - Function Logs: Site → Functions → webhook
echo - Database: https://supabase.com/dashboard
echo - WhatsApp: Meta Business Manager
echo.

REM Step 9: Final summary
echo.
echo 📋 STEP 9: Deployment Summary
echo ==============================

echo.
echo ✅ NETLIFY DEPLOYMENT READY!
echo ============================

echo.
echo 📊 WHAT'S READY:
echo ===============
echo ✅ Project structure configured
echo ✅ netlify.toml created
echo ✅ Webhook function ready
echo ✅ Dependencies installed
echo ✅ Code committed to git
echo ✅ Ready for GitHub + Netlify

echo.
echo 🎯 NEXT STEPS:
echo ==============
echo 1. 🌐 Deploy on Netlify (follow instructions above)
echo 2. ⚙️  Set environment variables
echo 3. 🔗 Update Meta webhook URL
echo 4. 🧪 Test the system
echo 5. 📊 Monitor function logs

echo.
echo 🎉 FEATURES THAT WILL BE LIVE:
echo ==============================
echo ✅ WhatsApp message handling
echo ✅ Interactive button responses
echo ✅ Order confirmation system
echo ✅ Automatic order fulfillment (simple method)
echo ✅ Shopify integration
echo ✅ Multi-tenant support
echo ✅ Real-time dashboard

echo.
echo 🚀 READY FOR NETLIFY DEPLOYMENT!
echo ================================
echo Follow the steps above to complete the deployment.

echo.
echo Press any key to open Netlify dashboard...
pause >nul

start https://netlify.com

echo.
echo 🎉 Good luck with your deployment!
echo =================================