# 🛍️ Shopify Integration - Quick Start

## 🔴 Current Problem
You see "Not Connected" in Settings → Shopify Integration because database tables don't exist yet.

---

## ✅ Solution (3 Steps)

### Step 1: Create Database Tables

1. Open Supabase SQL Editor:
   ```
   https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/sql/new
   ```

2. Copy ALL content from file: `COMPLETE-SHOPIFY-SETUP.sql`

3. Paste in SQL Editor and click "Run" (or Ctrl+Enter)

4. Verify:
   ```bash
   node test-shopify-setup.js
   ```
   
   Should see: `🎉 SUCCESS! All tests passed!`

---

### Step 2: Setup Shopify App

1. Go to Shopify Admin → Settings → Apps → Develop apps

2. Create new app: "WhatsApp CRM"

3. Configuration → App URL:
   ```
   https://wahtsapp2.vercel.app/api/shopify/oauth/callback
   ```

4. Configure Admin API scopes:
   - ✅ read_orders
   - ✅ write_orders

5. API credentials → Copy:
   - Client ID
   - Client Secret

---

### Step 3: Connect

1. Open: https://wahtsapp2.vercel.app

2. Go to: Settings → Shopify Integration

3. Fill in:
   - Shop Subdomain: `your-store` (without .myshopify.com)
   - Client ID: [paste from Shopify]
   - Client Secret: [paste from Shopify]
   - ✅ Use OAuth (Recommended)

4. Click: "Connect with OAuth"

5. You'll be redirected to Shopify → Click "Install app"

6. You'll be redirected back → Should see ✅ "Connected"

---

## ✅ Success Indicators

After connecting, you should see:
- ✅ Green badge "Connected"
- ✅ Your store name
- ✅ Connection date
- ✅ "Test Connection" button works
- ✅ In Profile tab: "Shopify Connected: your-store.myshopify.com"

---

## 🎯 How to Use

### Send Order Confirmation

```javascript
POST https://wahtsapp2.vercel.app/api/shopify/send-order-confirmation

{
  "brandId": "your-brand-id",
  "orderId": "5678901234",
  "orderNumber": "#1234",
  "customerPhone": "201234567890",
  "customerName": "Ahmed Mohamed",
  "totalPrice": "500.00",
  "currency": "EGP",
  "items": [
    {
      "name": "Product 1",
      "quantity": 2,
      "price": "250.00"
    }
  ]
}
```

### Customer Receives

```
🛍️ New Order #1234

Hello Ahmed Mohamed!

Your order has been received:
• Product 1 × 2 - 250.00 EGP

💰 Total: 500.00 EGP

[Button: ✅ Confirm Order]
[Button: ❌ Cancel Order]
```

### When Customer Clicks

- ✅ Confirm → Shopify order updated automatically
- ❌ Cancel → Shopify order cancelled automatically

---

## 🔧 Troubleshooting

### "Not Connected" after running SQL
```bash
node check-tables.js
```
Should see ✅ next to each table. If ❌, run SQL again.

### "Invalid credentials"
- Check Client ID and Client Secret are correct
- Make sure Shop Subdomain is without .myshopify.com
- No extra spaces

### OAuth redirect failed
Make sure App URL in Shopify is exactly:
```
https://wahtsapp2.vercel.app/api/shopify/oauth/callback
```

### Data disappears after refresh
Database tables not created. Run SQL and verify with:
```bash
node test-shopify-setup.js
```

---

## 📚 Documentation

- **Arabic Guide (Detailed):** `SHOPIFY-SETUP-ARABIC.md`
- **Arabic Guide (Quick):** `ابدأ-هنا-شوبفاي.md`
- **Summary (Arabic):** `الخلاصة-شوبفاي.md`
- **Vercel Setup:** `VERCEL-SHOPIFY-ENV.md`

---

## 📞 Support

If you face any issues:

1. Run tests:
   ```bash
   node test-shopify-setup.js
   node check-tables.js
   ```

2. Check browser console (F12 → Console)

3. Take screenshots and share with error description

---

**Status:** ✅ Ready to use
**Last Updated:** Now
