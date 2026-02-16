# ✅ Vercel Deployment Checklist

## Before Deployment

### 1. Environment Variables (CRITICAL!)
Go to Vercel Dashboard → Settings → Environment Variables

Add these for **Production**, **Preview**, and **Development**:

```env
# Supabase
VITE_SUPABASE_URL=https://rmpgofswkpjxionzythf.supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]

# WhatsApp Webhook
WEBHOOK_VERIFY_TOKEN=whatsapp_crm_2024

# Optional: Shopify (if using OAuth)
SHOPIFY_CLIENT_ID=[your-client-id]
SHOPIFY_CLIENT_SECRET=[your-client-secret]
```

### 2. Verify Files Exist
- ✅ `api/webhook.js` - WhatsApp webhook
- ✅ `api/send-message.js` - Send messages
- ✅ `api/external-message.js` - External API
- ✅ `api/shopify/oauth/callback.js` - Shopify OAuth
- ✅ `api/shopify/send-order-confirmation.js` - Order confirmations
- ✅ `api/shopify/handle-button-click.js` - Button clicks
- ✅ `vercel.json` - Vercel configuration

---

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Fix webhook and Shopify integration"
git push origin main
```

### 2. Deploy on Vercel
- Vercel will auto-deploy from GitHub
- Or manually: Deployments → Redeploy

### 3. Wait for Deployment
- Check deployment logs
- Look for errors
- Verify build succeeded

---

## After Deployment

### 1. Test Webhook Endpoint
```bash
node test-webhook-verification.js
```

Expected output:
```
✅ SUCCESS! Webhook verification works correctly!
```

### 2. Configure Meta WhatsApp Webhook
1. Go to: https://developers.facebook.com
2. Select your app
3. WhatsApp → Configuration → Webhook
4. Enter:
   - **Callback URL**: `https://wahtsapp2.vercel.app/api/webhook`
   - **Verify Token**: `whatsapp_crm_2024`
5. Click **Verify and Save**
6. Subscribe to:
   - ✅ messages
   - ✅ message_status

### 3. Configure Shopify (Choose One)

#### Option A: Manual Token (Recommended - Easier!)
1. Shopify Admin → Settings → Apps → Develop apps
2. Create app or select existing
3. Configuration → Admin API scopes
4. Select: `read_orders`, `write_orders`
5. Save → Install app
6. API credentials → Reveal token once
7. Copy token (starts with `shpat_`)
8. In your app: Settings → Shopify Integration → Manual Token
9. Paste token and connect

#### Option B: OAuth (Advanced - Requires Setup)
1. Shopify Admin → Settings → Apps → Develop apps
2. Select your app → Configuration
3. Add Allowed redirection URL:
   ```
   https://wahtsapp2.vercel.app/api/shopify/oauth/callback
   ```
4. Configure Admin API scopes: `read_orders`, `write_orders`
5. Save → Install app
6. API credentials → Copy Client ID and Client Secret
7. In your app: Settings → Shopify Integration → OAuth
8. Enter credentials and connect

---

## Verification Tests

### Test 1: Webhook Verification
```bash
node test-webhook-verification.js
```
✅ Should return: "SUCCESS! Webhook verification works correctly!"

### Test 2: Complete System
```bash
node test-complete-system.js
```
✅ Should show all components working

### Test 3: Shopify Connection
```bash
node check-shopify-connection.js
```
✅ Should show connection status

---

## Common Issues & Solutions

### Issue 1: Webhook Validation Failed
**Symptom:** Meta says "couldn't be validated"

**Solution:**
1. Check Environment Variables in Vercel
2. Verify `WEBHOOK_VERIFY_TOKEN=whatsapp_crm_2024`
3. Redeploy
4. Try webhook verification again

### Issue 2: Shopify OAuth Redirect Error
**Symptom:** "redirect_uri is not whitelisted"

**Solution:**
1. Use Manual Token instead (easier!)
2. OR add redirect URL in Shopify App Settings:
   - Configuration → Allowed redirection URL(s)
   - Add: `https://wahtsapp2.vercel.app/api/shopify/oauth/callback`

### Issue 3: Shopify Unauthorized Access
**Symptom:** "Unauthorized Access" error

**Solution:**
1. Make sure app is installed in Shopify
2. Check API scopes: `read_orders`, `write_orders`
3. Try Manual Token instead of OAuth

### Issue 4: Frontend Shows localhost URLs
**Symptom:** API calls go to localhost:3001

**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Check `src/config.js` - should use relative URLs
4. Redeploy if needed

---

## Environment Variables Reference

### Required (Must Have)
```env
VITE_SUPABASE_URL=https://rmpgofswkpjxionzythf.supabase.co
VITE_SUPABASE_ANON_KEY=[your-key]
WEBHOOK_VERIFY_TOKEN=whatsapp_crm_2024
```

### Optional (For OAuth)
```env
SHOPIFY_CLIENT_ID=[your-client-id]
SHOPIFY_CLIENT_SECRET=[your-client-secret]
```

### NOT Needed (Remove if Present)
```env
VITE_BACKEND_URL  ❌ Remove this!
```

---

## Final Checklist

Before going live:
- [ ] All environment variables set in Vercel
- [ ] Deployment successful (no errors)
- [ ] Webhook verification test passes
- [ ] Meta webhook configured and verified
- [ ] Shopify connected (Manual Token or OAuth)
- [ ] Test message sent successfully
- [ ] Test order confirmation works
- [ ] Frontend loads without errors
- [ ] No localhost URLs in production

---

## Support Files

- `حل-المشاكل-النهائي.md` - Complete troubleshooting guide (Arabic)
- `الوضع-الحالي.md` - Current status summary (Arabic)
- `test-webhook-verification.js` - Test webhook endpoint
- `test-complete-system.js` - Test entire system
- `check-shopify-connection.js` - Check Shopify status

---

## Quick Commands

```bash
# Test webhook
node test-webhook-verification.js

# Test system
node test-complete-system.js

# Check Shopify
node check-shopify-connection.js

# Check tables
node check-tables.js
```

---

**Remember:** Manual Token is easier than OAuth for Shopify! Use it unless you specifically need OAuth.
