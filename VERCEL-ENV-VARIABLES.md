# 🔐 Vercel Environment Variables - Ready to Add

## After Build Succeeds, Add These Variables

Once your Vercel build shows **"Deployment Ready"**, follow these steps:

### Step 1: Go to Settings
1. Open your Vercel project dashboard
2. Click **Settings** tab
3. Click **Environment Variables** in the left menu

### Step 2: Add These Variables

Copy and paste each variable exactly:

#### Variable 1: VITE_SUPABASE_URL
```
VITE_SUPABASE_URL
```
**Value:**
```
https://rmpgofswkpjxionzythf.supabase.co
```

#### Variable 2: VITE_SUPABASE_ANON_KEY
```
VITE_SUPABASE_ANON_KEY
```
**Value:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM
```

#### Variable 3: VITE_API_URL
```
VITE_API_URL
```
**Value (temporary):**
```
http://localhost:3001
```
**Note:** We'll update this after deploying to Railway

### Step 3: Select Environment
For each variable, select:
- ✅ **Production**
- ✅ **Preview**
- ✅ **Development**

### Step 4: Save and Redeploy
1. Click **Save** after adding all variables
2. Go to **Deployments** tab
3. Find the latest deployment
4. Click the **3 dots** (⋯) menu
5. Click **Redeploy**
6. Confirm the redeployment

### Step 5: Wait for New Deployment
The app will rebuild with the environment variables and should work!

---

## Quick Copy-Paste Format

If Vercel allows bulk import, use this format:

```env
VITE_SUPABASE_URL=https://rmpgofswkpjxionzythf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM
VITE_API_URL=http://localhost:3001
```

---

## ⚠️ Important Notes

1. **Don't share these values publicly** - they're sensitive
2. **VITE_API_URL is temporary** - We'll update it after Railway deployment
3. **Redeploy is required** - Variables only take effect after redeployment
4. **Keep this file safe** - You might need these values again

---

## What's Next After This?

1. ✅ Vercel frontend deployed with environment variables
2. 🚀 Deploy backend to Railway
3. 🔄 Update VITE_API_URL in Vercel with Railway URL
4. 📱 Update WhatsApp webhook in Meta Developer Console
5. ✅ Test the complete system!
