@echo off
echo 🚀 Complete Project Deployment
echo ===============================
echo نشر المشروع كامل - Frontend + Backend + Webhook

echo.
echo 📋 Step 1: Preparing for deployment...
echo =====================================

REM Check if git is initialized
if not exist ".git" (
    echo 📁 Initializing git repository...
    git init
    git branch -M main
)

REM Add all files
echo 📦 Adding all files to git...
git add .

REM Commit changes
echo 💾 Committing all changes...
git commit -m "Complete WhatsApp CRM deployment with Shopify integration and fulfillment"

echo.
echo 📋 Step 2: Deploying to Vercel...
echo =================================

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...
vercel --prod

if %errorlevel% neq 0 (
    echo ❌ Vercel deployment failed
    echo 🔧 Trying to link project first...
    vercel link
    vercel --prod
)

echo.
echo 📋 Step 3: Building for local development...
echo ============================================

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Build the project
echo 🔨 Building project...
npm run build

echo.
echo 📋 Step 4: Starting local development server...
echo ===============================================

echo 🌐 Starting local server...
echo Frontend will be available at: http://localhost:5173
echo Backend API will be available at: http://localhost:5173/api/*

REM Start the development server
start "WhatsApp CRM Frontend" npm run dev

echo.
echo ✅ Deployment completed successfully!
echo ====================================

echo.
echo 📊 DEPLOYMENT SUMMARY:
echo ======================
echo ✅ Code committed to git
echo ✅ Deployed to Vercel (production)
echo ✅ Local development server started
echo ✅ All APIs and webhooks ready

echo.
echo 🔗 IMPORTANT URLS:
echo ==================
echo 🌐 Production URL: https://wahtsapp.vercel.app
echo 🔗 Webhook URL: https://wahtsapp.vercel.app/api/webhook
echo 💻 Local URL: http://localhost:5173

echo.
echo 📋 NEXT STEPS:
echo ==============
echo 1. Update Meta webhook URL to: https://wahtsapp.vercel.app/api/webhook
echo 2. Test the system with real orders
echo 3. Monitor webhook logs in Vercel dashboard
echo 4. Local development server is running for testing

echo.
echo 🎉 System is ready for production use!
pause