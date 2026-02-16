@echo off
title WhatsApp CRM - Simple Fix
echo 🔧 SIMPLE FIX FOR WHATSAPP CRM
echo ===============================

echo.
echo 📋 What we're going to do:
echo ==========================
echo 1. Test what's broken
echo 2. Fix deployment issues  
echo 3. Deploy to Vercel
echo 4. Test everything

echo.
echo Press any key to start...
pause >nul

echo.
echo 📋 Step 1: Testing what's broken...
echo ===================================
node test-what-is-broken.js

echo.
echo 📋 Step 2: Quick fix deployment...
echo ==================================
call quick-fix-deployment.bat

echo.
echo 📋 Step 3: Final test...
echo ========================
node test-what-is-broken.js

echo.
echo ✅ SIMPLE FIX COMPLETED!
echo ========================

echo.
echo 🌐 Your URLs:
echo =============
echo Frontend: https://wahtsapp.vercel.app
echo Webhook: https://wahtsapp.vercel.app/api/webhook

echo.
echo 🔧 If still not working:
echo ========================
echo 1. Check Vercel dashboard
echo 2. Update Meta webhook URL
echo 3. Test with WhatsApp messages

pause