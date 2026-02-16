# ⚙️ Vercel Environment Variables for Shopify

## 📝 Required Variables

You need to add these environment variables in Vercel Dashboard:

### 1. VITE_SUPABASE_URL
```
https://rmpgofswkpjxionzythf.supabase.co
```

### 2. VITE_SUPABASE_ANON_KEY
```
Your Supabase anon key
```

### 3. VITE_APP_URL
```
https://wahtsapp2.vercel.app
```

This is used for OAuth redirects after Shopify authentication.

---

## 🚀 How to Add in Vercel

### Method 1: Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Select your project: `wahtsapp2`
3. Go to: Settings → Environment Variables
4. Add each variable:
   - Name: `VITE_APP_URL`
   - Value: `https://wahtsapp2.vercel.app`
   - Environment: Production, Preview, Development (select all)
5. Click "Save"
6. Redeploy your app

### Method 2: Vercel CLI

```bash
vercel env add VITE_APP_URL
# Enter: https://wahtsapp2.vercel.app
# Select: Production, Preview, Development

vercel --prod
```

---

## ✅ Verify

After adding and redeploying:

1. Open: https://wahtsapp2.vercel.app
2. Go to: Settings → Shopify Integration
3. The OAuth Redirect URL should show:
   ```
   https://wahtsapp2.vercel.app/api/shopify/oauth/callback
   ```
4. Try connecting with Shopify
5. After OAuth, you should be redirected back to your app

---

## 🔍 Check Current Variables

```bash
vercel env ls
```

Should show:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_APP_URL

---

## ⚠️ Important Notes

1. **VITE_APP_URL** must match your Vercel deployment URL
2. If you change the domain, update this variable
3. After adding variables, you MUST redeploy
4. Variables starting with `VITE_` are exposed to the browser
5. Never commit `.env` file to git

---

## 🐛 Troubleshooting

### OAuth redirects to localhost
**Problem:** VITE_APP_URL not set or wrong

**Solution:**
1. Check Vercel env variables
2. Make sure VITE_APP_URL = `https://wahtsapp2.vercel.app`
3. Redeploy

### "Cannot read environment variable"
**Problem:** Variable not available in serverless function

**Solution:**
1. Make sure variable is added in Vercel
2. Redeploy the app
3. Check: `vercel env ls`

---

## 📚 Related Files

- `.env.example` - Template for local development
- `api/shopify/oauth/callback.js` - Uses VITE_APP_URL
- `src/components/ShopifyOAuth.jsx` - Frontend OAuth flow

---

**Last Updated:** Now
**Status:** ✅ Ready to use
