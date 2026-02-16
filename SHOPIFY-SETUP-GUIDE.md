# 🛍️ دليل ربط Shopify مع WhatsApp CRM

## الخطوات المطلوبة:

### 1️⃣ تجهيز الداتابيز
قم بتشغيل السكريبت التالي في Supabase SQL Editor:
```bash
# افتح الملف ده ونفذه في Supabase
wahtsapp-main/setup-shopify-tables.sql
```

### 2️⃣ تشغيل الباك إند
```bash
cd wahtsapp-main/server
node webhook-server-simple.js
```

### 3️⃣ تشغيل ngrok (للـ webhooks)
```bash
cd wahtsapp-main
ngrok http 3001
```
احفظ الـ URL اللي هيطلع (مثال: https://xxxxx.ngrok-free.app)

---

## 🔧 إنشاء Shopify App

### الخطوة 1: إنشاء App في Shopify Partners
1. اذهب إلى: https://partners.shopify.com
2. اضغط على "Apps" → "Create app"
3. اختر "Custom app"
4. أدخل اسم الـ App (مثال: "WhatsApp CRM")

### الخطوة 2: تكوين OAuth
في صفحة الـ App، اذهب إلى "App setup":

**App URL:**
```
https://YOUR_NGROK_URL.ngrok-free.app
```

**Allowed redirection URL(s):**
```
https://YOUR_NGROK_URL.ngrok-free.app/api/shopify/oauth/callback
```

### الخطوة 3: الصلاحيات (Scopes)
في "Configuration" → "API access scopes"، فعّل:
- ✅ `read_orders` - قراءة الطلبات
- ✅ `write_orders` - تعديل الطلبات
- ✅ `read_products` - قراءة المنتجات
- ✅ `read_customers` - قراءة العملاء
- ✅ `write_fulfillments` - إنشاء شحنات

### الخطوة 4: احصل على البيانات
من صفحة "App credentials":
- **Client ID** (API key)
- **Client Secret**

---

## 🔗 ربط المتجر

### طريقة الربط:
افتح المتصفح واذهب إلى:
```
https://YOUR_NGROK_URL.ngrok-free.app/api/shopify/oauth/install?shop=YOUR_STORE.myshopify.com&brand_id=YOUR_BRAND_ID&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET
```

**مثال:**
```
https://abc123.ngrok-free.app/api/shopify/oauth/install?shop=mystore.myshopify.com&brand_id=b4b61ff6-121a-4452-9b16-974af203d3bd&client_id=abc123xyz&client_secret=shpss_xyz123
```

### البيانات المطلوبة:
- `shop`: عنوان المتجر (مثال: `mystore.myshopify.com`)
- `brand_id`: ID البراند من الداتابيز
- `client_id`: من Shopify App
- `client_secret`: من Shopify App

---

## 📡 تكوين Webhooks في Shopify

بعد الربط الناجح، اذهب إلى Shopify Admin:

**Settings → Notifications → Webhooks**

أضف الـ webhooks التالية:

### 1. Order creation
- **Event:** `Order creation`
- **Format:** `JSON`
- **URL:** `https://YOUR_NGROK_URL.ngrok-free.app/api/shopify/webhook`
- **API version:** `2024-01`

### 2. Order updated
- **Event:** `Order updated`
- **Format:** `JSON`
- **URL:** `https://YOUR_NGROK_URL.ngrok-free.app/api/shopify/webhook`

### 3. Order cancelled
- **Event:** `Order cancelled`
- **Format:** `JSON`
- **URL:** `https://YOUR_NGROK_URL.ngrok-free.app/api/shopify/webhook`

---

## ✅ اختبار الربط

### 1. تأكد من تشغيل كل شيء:
- ✅ Backend شغال على port 3001
- ✅ ngrok شغال ومربوط بـ port 3001
- ✅ Frontend شغال على port 5173

### 2. اعمل طلب تجريبي:
1. اذهب إلى متجر Shopify
2. اعمل طلب جديد (Order)
3. تأكد من وجود رقم موبايل في بيانات العميل

### 3. تحقق من النتائج:
- ✅ يجب أن يصل webhook للباك إند
- ✅ يجب أن يتم حفظ الطلب في جدول `shopify_orders`
- ✅ يجب أن يتم إرسال رسالة واتساب للعميل

---

## 🔍 استكشاف الأخطاء

### المشكلة: "Shop not connected"
- تأكد من تشغيل OAuth بنجاح
- تحقق من جدول `shopify_connections` في الداتابيز

### المشكلة: "No phone number"
- تأكد من إدخال رقم موبايل في بيانات العميل بالطلب

### المشكلة: Webhook لا يصل
- تأكد من أن ngrok شغال
- تأكد من تكوين Webhook URL صحيح في Shopify
- تحقق من logs الباك إند

---

## 📝 ملاحظات مهمة

1. **ngrok URL يتغير**: كل مرة تشغل ngrok، الـ URL بيتغير. لازم تحدث:
   - Shopify App URLs
   - Webhook URLs في Shopify Admin

2. **للإنتاج**: استخدم domain ثابت بدل ngrok

3. **الأمان**: لا تشارك `client_secret` أو `access_token` مع أحد

---

## 🎯 الخطوات التالية

بعد الربط الناجح:
- [ ] اختبر إرسال رسائل تأكيد الطلبات
- [ ] فعّل Auto-fulfillment
- [ ] أضف رسائل تذكير للسلة المتروكة
- [ ] خصص رسائل WhatsApp حسب البراند
