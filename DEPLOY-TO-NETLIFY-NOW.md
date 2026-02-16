# 🚀 Deploy to Netlify - Complete Guide

## Current Status
✅ Netlify configuration created (`netlify.toml`)
✅ Webhook function created (`netlify/functions/webhook.js`)
✅ All fulfillment logic implemented
⏳ Need to deploy and update Meta webhook URL

## Step 1: Deploy to Netlify

### Option A: Connect GitHub Repository (Recommended)

1. **Push to GitHub first:**
```bash
git add .
git commit -m "Add Netlify deployment with webhook functions"
git push origin main
```

2. **Deploy on Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub account
   - Select your repository
   - Build settings will be auto-detected from `netlify.toml`
   - Click "Deploy site"

### Option B: Manual Deploy (Drag & Drop)

1. **Build the project:**
```bash
npm run build
```

2. **Create deployment package:**
   - Copy `dist/` folder contents
   - Copy `netlify/` folder
   - Copy `netlify.toml`
   - Zip everything together

3. **Deploy manually:**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the zip file

## Step 2: Configure Environment Variables

In Netlify dashboard → Site settings → Environment variables, add:

```
VITE_SUPABASE_URL=https://rmpgofswkpjxionzythf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM
WEBHOOK_VERIFY_TOKEN=whatsapp_crm_2024
```

## Step 3: Get Your Netlify Webhook URL

After deployment, your webhook URL will be:
```
https://YOUR-SITE-NAME.netlify.app/.netlify/functions/webhook
```

Example:
```
https://whatsapp-crm-dashboard.netlify.app/.netlify/functions/webhook
```

## Step 4: Update Meta Webhook URL

1. **Go to Meta Business Manager:**
   - [business.facebook.com](https://business.facebook.com)
   - Select your WhatsApp Business Account

2. **Update Webhook Settings:**
   - Go to WhatsApp → Configuration → Webhook
   - Update Callback URL to: `https://YOUR-SITE-NAME.netlify.app/.netlify/functions/webhook`
   - Verify Token: `whatsapp_crm_2024`
   - Subscribe to: `messages`

3. **Test Webhook:**
   - Click "Verify and Save"
   - Should show ✅ "Webhook verified successfully"

## Step 5: Test Real Button Clicks

1. **Create a test order in Shopify**
2. **Order confirmation message will be sent to WhatsApp**
3. **Click the "✅ تأكيد" button**
4. **Check if order gets fulfilled automatically**

## Troubleshooting

### If webhook verification fails:
- Check environment variables are set correctly
- Verify the webhook URL format
- Check Netlify function logs

### If button clicks don't work:
- Check Netlify function logs
- Verify Meta webhook is pointing to Netlify (not Vercel)
- Test with the debug script

### Check Netlify Function Logs:
- Netlify Dashboard → Functions → webhook → View logs
- Look for button click processing messages

## Why Netlify vs Vercel?

✅ **Netlify Advantages:**
- Better function routing (`/.netlify/functions/webhook`)
- More reliable webhook endpoints
- Better environment variable handling
- Clearer function logs

❌ **Vercel Issues:**
- Webhook endpoints returning 404
- Complex routing for API endpoints
- Environment variable conflicts

## Next Steps After Deployment

1. ✅ Deploy to Netlify
2. ✅ Update Meta webhook URL
3. ✅ Test real button clicks
4. ✅ Verify order fulfillment works
5. ✅ Monitor function logs for any issues

---

**The system is ready! Just need to deploy and update the webhook URL.** 🚀