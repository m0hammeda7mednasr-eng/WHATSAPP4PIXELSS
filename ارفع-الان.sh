#!/bin/bash

# Script to deploy all changes to Netlify
# Run this: bash ارفع-الان.sh

echo "🚀 Starting deployment..."
echo ""

# 1. Add all files
echo "📦 Adding files..."
git add .

# 2. Commit
echo "💾 Committing changes..."
git commit -m "Fix Shopify Fulfillment GraphQL API - Complete Implementation

✅ Fixed fulfillment order ID retrieval
✅ Added proper GraphQL query to get fulfillment order
✅ Support custom tracking number and URL
✅ Improved error handling and logging
✅ Ready for production testing

Changes:
- Get fulfillment order ID correctly from Shopify
- Use proper GraphQL mutation structure
- Add optional tracking info support
- Better error messages for debugging"

# 3. Push to GitHub
echo "🌐 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Done! Changes pushed to GitHub."
echo ""
echo "📋 What was updated:"
echo "   ✅ Fixed Shopify Fulfillment GraphQL API"
echo "   ✅ Proper fulfillment order ID retrieval"
echo "   ✅ Support for tracking number & URL"
echo ""
echo "🚀 Deployment:"
echo "   • Vercel: Auto-deploys from GitHub (1-2 min)"
echo "   • Netlify: Auto-deploys from GitHub (1-2 min)"
echo ""
echo "🧪 Testing Steps:"
echo "   1. Wait for deployment to complete"
echo "   2. Create test order in Shopify"
echo "   3. Click 'Confirm Order' button in WhatsApp"
echo "   4. Check order status changes to 'Fulfilled'"
echo ""
echo "🔗 Check deployment:"
echo "   Vercel: https://vercel.com/dashboard"
echo "   Netlify: https://app.netlify.com"
