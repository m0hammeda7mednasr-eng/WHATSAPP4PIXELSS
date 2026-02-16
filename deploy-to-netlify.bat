@echo off
echo 🚀 Deploying WhatsApp CRM to Netlify...

REM Check if git is initialized
if not exist ".git" (
    echo 📁 Initializing git repository...
    git init
    git branch -M main
)

REM Add all files
echo 📦 Adding files to git...
git add .

REM Commit changes
echo 💾 Committing changes...
git commit -m "Deploy WhatsApp CRM with Netlify functions and order fulfillment"

REM Check if remote exists and push
echo 🚀 Pushing to GitHub...
git push -u origin main

if %errorlevel% neq 0 (
    echo 🔗 Please add your GitHub repository URL first:
    echo git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
    echo Then run this script again
) else (
    echo.
    echo ✅ Code pushed to GitHub successfully!
    echo.
    echo 📋 Next Steps:
    echo 1. Go to netlify.com
    echo 2. Click 'Add new site' → 'Import an existing project'
    echo 3. Connect your GitHub repository
    echo 4. Deploy will start automatically
    echo 5. Add environment variables in Netlify dashboard
    echo 6. Update Meta webhook URL to your new Netlify URL
    echo.
    echo 🔗 Your webhook URL will be:
    echo https://YOUR-SITE-NAME.netlify.app/.netlify/functions/webhook
)

echo.
echo 🎉 Deployment preparation complete!
pause