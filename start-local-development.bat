@echo off
echo 🖥️  Starting Local Development Environment
echo =========================================
echo تشغيل بيئة التطوير المحلية

echo.
echo 📋 Checking system requirements...
echo ==================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js is installed
node --version

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not available
    pause
    exit /b 1
)

echo ✅ npm is available
npm --version

echo.
echo 📋 Installing dependencies...
echo =============================

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing project dependencies...
    npm install
    
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    
    echo ✅ Dependencies installed successfully
) else (
    echo ✅ Dependencies already installed
)

echo.
echo 📋 Starting development servers...
echo ==================================

echo 🌐 Starting Vite development server...
echo Frontend: http://localhost:5173
echo API: http://localhost:5173/api/*

REM Start the development server
start "WhatsApp CRM - Frontend" cmd /k "npm run dev"

REM Wait a moment for the server to start
timeout /t 3 /nobreak >nul

echo.
echo 📋 Opening browser...
echo =====================

REM Open browser after a short delay
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo.
echo ✅ Local development environment started!
echo ========================================

echo.
echo 📊 DEVELOPMENT ENVIRONMENT:
echo ===========================
echo 🌐 Frontend: http://localhost:5173
echo 🔗 API Base: http://localhost:5173/api
echo 📡 Webhook: http://localhost:5173/api/webhook
echo 💾 Database: Supabase (remote)

echo.
echo 🛠️  DEVELOPMENT FEATURES:
echo =========================
echo ✅ Hot reload enabled
echo ✅ API proxy configured
echo ✅ CORS handled automatically
echo ✅ Environment variables loaded

echo.
echo 📋 USEFUL COMMANDS:
echo ===================
echo npm run dev     - Start development server
echo npm run build   - Build for production
echo npm run preview - Preview production build
echo vercel --prod   - Deploy to production

echo.
echo 🎯 Ready for development!
echo Browser should open automatically at http://localhost:5173

pause