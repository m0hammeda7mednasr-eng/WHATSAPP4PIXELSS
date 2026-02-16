@echo off
REM Script to deploy all changes to Netlify (Windows)
REM Run this: ارفع-الان.cmd

echo 🚀 Starting deployment...
echo.

REM 1. Add all files
echo 📦 Adding files...
git add .

REM 2. Commit
echo 💾 Committing changes...
git commit -m "Add 4 fulfillment methods (REST + GraphQL) for automatic order fulfillment"

REM 3. Push to GitHub
echo 🌐 Pushing to GitHub...
git push origin main

echo.
echo ✅ Done! Netlify will deploy automatically.
echo.
echo 📋 Next steps:
echo    1. Wait 1-2 minutes for Netlify deployment
echo    2. Check Netlify Dashboard
echo    3. Create a NEW order in Shopify
echo    4. Click confirm button
echo    5. Check order status in Shopify
echo.
echo 🔗 Netlify Dashboard: https://app.netlify.com
pause
