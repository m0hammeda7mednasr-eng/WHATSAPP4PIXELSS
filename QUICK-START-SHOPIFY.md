# 🚀 Quick Start - Shopify Integration

## الخطوات السريعة:

### 1️⃣ تجهيز الداتابيز
افتح Supabase SQL Editor وشغّل:
```sql
-- انسخ محتوى الملف ده كله والصقه في SQL Editor
wahtsapp-main/setup-shopify-tables.sql
```

### 2️⃣ تشغيل الباك إند
```bash
cd wahtsapp-main/server
node webhook-server-simple.js
```
لازم يكون شغال طول الوقت!

### 3️⃣ تشغيل ngrok
```bash
cd wahtsapp-main
ngrok http 3001
```
احفظ الـ URL (مثال: https://abc123.ngrok-free.app)

### 4️⃣ إنشاء Shopify App
1. اذهب إلى: https://partners.shopify.com
2. Apps → Create app → Custom app
3. في App setup:
   - **App URL**: `https://YOUR_NGROK_URL.ngrok-free.app`
   - **Redirect URL**: `https://YOUR_NGROK_URL.ngrok-free.app/api/shopify/oauth/callback`
4. في API access scopes، فعّل:
   - read_orders
   - write_orders
   - read_products
   - read_customers
   - write_fulfillments
5. احفظ **Client ID** و **Client Secret**

### 5️⃣ بناء OAuth URL
1. افتح ملف `build-shopify-url.js`
2. عدّل البيانات:
```javascript
const config = {
  ngrokUrl: 'https://YOUR_NGROK_URL.ngrok-free.app',
  shopUrl: 'your-store.myshopify.com',
  brandId: 'b4b61ff6-121a-4452-9b16-974af203d3bd',  // من get-brand-info.js
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET'
};
```
3. شغّل:
```bash
node build-shopify-url.js
```
4. انسخ الـ URL وافتحه في المتصفح

### 6️⃣ تكوين Webhooks
في Shopify Admin → Settings → Notifications → Webhooks:

**Order creation:**
- URL: `https://YOUR_NGROK_URL.ngrok-free.app/api/shopify/webhook`
- Format: JSON

### 7️⃣ اختبار
1. اعمل طلب تجريبي في Shopify
2. تأكد من وجود رقم موبايل
3. يجب أن تصل رسالة واتساب للعميل!

---

## 📋 البيانات المتاحة:

### Brands:
```
1. 4 Pixels
   ID: d8062ea0-cea1-4ece-a1b7-f64d57b54f4b

2. Lamsa
   ID: cbbbc92b-2187-4137-ab15-a4a4a7af49ff

3. 4 Pixels
   ID: b4b61ff6-121a-4452-9b16-974af203d3bd
```

### ngrok URL الحالي:
```
https://nonsaturated-dennis-noncosmically.ngrok-free.dev
```

---

## ✅ Checklist:

- [ ] تشغيل SQL في Supabase
- [ ] Backend شغال (port 3001)
- [ ] ngrok شغال
- [ ] Shopify App تم إنشاؤه
- [ ] OAuth URL تم بناؤه
- [ ] تم الربط بنجاح
- [ ] Webhooks تم تكوينها
- [ ] اختبار طلب تجريبي

---

## 🆘 مساعدة سريعة:

**لعرض البراندات:**
```bash
node get-brand-info.js
```

**لبناء OAuth URL:**
```bash
node build-shopify-url.js
```

**لاختبار الباك إند:**
```bash
curl http://localhost:3001/health
```
