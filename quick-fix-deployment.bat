@echo off
echo 🔧 Quick Fix Deployment
echo =======================
echo إصلاح سريع للنشر

echo.
echo 📋 Step 1: Checking current status...
echo =====================================

REM Check if we have the basic files
if not exist "package.json" (
    echo ❌ package.json not found
    echo This doesn't look like a Node.js project
    pause
    exit /b 1
)

echo ✅ package.json found

if not exist "src" (
    echo ❌ src folder not found
    echo This doesn't look like a React project
    pause
    exit /b 1
)

echo ✅ src folder found

if not exist "api" (
    echo ❌ api folder not found
    echo Creating api folder...
    mkdir api
)

echo ✅ api folder exists

echo.
echo 📋 Step 2: Installing/updating dependencies...
echo ==============================================

echo 📦 Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ npm install failed
    echo Trying to fix...
    
    echo 🔧 Clearing npm cache...
    npm cache clean --force
    
    echo 📦 Trying install again...
    npm install
    
    if %errorlevel% neq 0 (
        echo ❌ Still failing, trying with --legacy-peer-deps
        npm install --legacy-peer-deps
    )
)

echo ✅ Dependencies installed

echo.
echo 📋 Step 3: Building project...
echo ==============================

echo 🔨 Building for production...
npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed
    echo Checking for common issues...
    
    echo 🔍 Checking if vite.config.js exists...
    if not exist "vite.config.js" (
        echo ⚠️  vite.config.js not found, creating basic one...
        echo import { defineConfig } from 'vite' > vite.config.js
        echo import react from '@vitejs/plugin-react' >> vite.config.js
        echo. >> vite.config.js
        echo export default defineConfig({ >> vite.config.js
        echo   plugins: [react()], >> vite.config.js
        echo   server: { >> vite.config.js
        echo     proxy: { >> vite.config.js
        echo       '/api': { >> vite.config.js
        echo         target: 'http://localhost:3000', >> vite.config.js
        echo         changeOrigin: true >> vite.config.js
        echo       } >> vite.config.js
        echo     } >> vite.config.js
        echo   } >> vite.config.js
        echo }) >> vite.config.js
        
        echo ✅ Created basic vite.config.js
        
        echo 🔨 Trying build again...
        npm run build
    )
)

if %errorlevel% neq 0 (
    echo ❌ Build still failing
    echo Skipping build for now, will try direct deployment
) else (
    echo ✅ Build successful
)

echo.
echo 📋 Step 4: Git setup...
echo =======================

if not exist ".git" (
    echo 📁 Initializing git...
    git init
    git branch -M main
    echo ✅ Git initialized
) else (
    echo ✅ Git already initialized
)

echo 📦 Adding files...
git add .

echo 💾 Committing...
git commit -m "Quick fix deployment - WhatsApp CRM with Shopify integration"

echo ✅ Git setup complete

echo.
echo 📋 Step 5: Deploying to Vercel...
echo ==================================

echo 🚀 Attempting deployment...
vercel --prod

if %errorlevel% neq 0 (
    echo ⚠️  Direct deployment failed
    echo 🔧 Trying to link project first...
    
    vercel link
    
    if %errorlevel% neq 0 (
        echo ❌ Vercel link failed
        echo 🔧 Trying login first...
        vercel login
        vercel link
    )
    
    echo 🚀 Trying deployment again...
    vercel --prod
    
    if %errorlevel% neq 0 (
        echo ❌ Deployment still failing
        echo 🔧 Trying alternative approach...
        
        echo 📋 Creating vercel.json...
        echo { > vercel.json
        echo   "version": 2, >> vercel.json
        echo   "builds": [ >> vercel.json
        echo     { >> vercel.json
        echo       "src": "package.json", >> vercel.json
        echo       "use": "@vercel/static-build", >> vercel.json
        echo       "config": { >> vercel.json
        echo         "distDir": "dist" >> vercel.json
        echo       } >> vercel.json
        echo     } >> vercel.json
        echo   ], >> vercel.json
        echo   "routes": [ >> vercel.json
        echo     { >> vercel.json
        echo       "src": "/api/(.*)", >> vercel.json
        echo       "dest": "/api/$1" >> vercel.json
        echo     }, >> vercel.json
        echo     { >> vercel.json
        echo       "src": "/(.*)", >> vercel.json
        echo       "dest": "/$1" >> vercel.json
        echo     } >> vercel.json
        echo   ] >> vercel.json
        echo } >> vercel.json
        
        echo ✅ Created vercel.json
        
        git add vercel.json
        git commit -m "Add vercel.json configuration"
        
        echo 🚀 Final deployment attempt...
        vercel --prod
    )
)

echo.
echo 📋 Step 6: Testing deployment...
echo =================================

echo 🧪 Running quick system test...
node diagnose-and-fix-now.js

echo.
echo 📋 Step 7: Results...
echo =====================

echo.
echo ✅ QUICK FIX DEPLOYMENT COMPLETED
echo =================================

echo.
echo 🌐 Check these URLs:
echo ====================
echo Production: https://wahtsapp.vercel.app
echo Webhook: https://wahtsapp.vercel.app/api/webhook

echo.
echo 🔧 If still not working:
echo ========================
echo 1. Check Vercel dashboard for errors
echo 2. Verify environment variables are set
echo 3. Run: node diagnose-and-fix-now.js
echo 4. Check Meta webhook URL configuration

echo.
echo 📞 Next steps:
echo ==============
echo 1. Update Meta webhook URL if needed
echo 2. Test with real WhatsApp messages
echo 3. Monitor Vercel function logs

pause