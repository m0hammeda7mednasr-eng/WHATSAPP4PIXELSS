#!/bin/bash

# 🚀 Deploy WhatsApp CRM to Netlify
echo "🚀 Deploying WhatsApp CRM to Netlify..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
    git branch -M main
fi

# Add all files
echo "📦 Adding files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy WhatsApp CRM with Netlify functions and order fulfillment"

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Please add your GitHub repository URL:"
    echo "git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git"
    echo ""
    echo "Then run: git push -u origin main"
else
    # Push to GitHub
    echo "🚀 Pushing to GitHub..."
    git push -u origin main
    
    echo ""
    echo "✅ Code pushed to GitHub successfully!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Go to netlify.com"
    echo "2. Click 'Add new site' → 'Import an existing project'"
    echo "3. Connect your GitHub repository"
    echo "4. Deploy will start automatically"
    echo "5. Add environment variables in Netlify dashboard"
    echo "6. Update Meta webhook URL to your new Netlify URL"
    echo ""
    echo "🔗 Your webhook URL will be:"
    echo "https://YOUR-SITE-NAME.netlify.app/.netlify/functions/webhook"
fi

echo ""
echo "🎉 Deployment preparation complete!"