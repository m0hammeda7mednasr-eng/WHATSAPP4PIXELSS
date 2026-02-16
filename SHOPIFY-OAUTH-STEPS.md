# 🔐 Shopify OAuth Setup - خطوات سريعة

## ✅ الوضع الحالي:

- ✅ Backend شغال على: `http://localhost:3001`
- ✅ ngrok شغال على: `https://nonsaturated-dennis-noncosmically.ngrok-free.dev`
- ✅ Frontend شغال على: `http://localhost:5173`

---

## 📋 الخطوات المطلوبة:

### 1️⃣ إنشاء Shopify App (إذا لم يتم بعد)

1. اذهب إلى: https://partners.shopify.com
2. اضغط **Apps** → **Create app**
3. اختر **Custom app**
4. أدخل اسم الـ App: `WhatsApp CRM`
5. اضغط **Create app**

---

### 2️⃣ تكوين OAuth Redirect URL

في صفحة الـ App:

1. اذهب إلى **Configuration** أو **App setup**
2. في **App URL**، ضع:
   ```
   https://nonsaturated-dennis-noncosmically.ngrok-free.dev
   ```

3. في **Allowed redirection URL(s)**، ضع:
   ```
   https://nonsaturated-dennis-noncosmically.ngrok-free.dev/api/shopify/oauth/callback
   ```

4. اضغط **Save**

---

### 3️⃣ تكوين API Scopes (الصلاحيات)

1. في نفس الصفحة، اذهب إلى **Configuration**
2. اضغط **Configure Admin API scopes**
3. فعّل الصلاحيات التالية:
   - ✅ `read_orders` - قراءة الطلبات
   - ✅ `write_orders` - تعديل الطلبات
   - ✅ `read_products` - قراءة المنتجات
   - ✅ `read_customers` - قراءة العملاء
   - ✅ `write_fulfillments` - إنشاء شحنات

4. اضغط **Save**

---

### 4️⃣ الحصول على Client ID و Client Secret

1. اذهب إلى **API credentials** tab
2. انسخ:
   - **Client ID** (API key)
   - **Client secret** (API secret key)

---

### 5️⃣ ربط المتجر من الفرونت إند

1. افتح الفرونت إند: http://localhost:5173
2. اذهب إلى **Settings** → **Shopify Integration**
3. اختر **OAuth (Advanced)**
4. أدخل:
   - **Shop Subdomain**: اسم المتجر (مثال: `my-store`)
   - **Client ID**: من الخطوة 4
   - **Client Secret**: من الخطوة 4
5. اضغط **Connect with OAuth**
6. سيتم توليد OAuth URL
7. انسخ الـ URL وافتحه في تاب جديد
8. اعمل **Install** للـ App في Shopify
9. سيتم الـ redirect تلقائياً للفرونت إند مع رسالة نجاح

---

## 🎯 الـ URLs المهمة:

### Redirect URL للـ Shopify App:
```
https://nonsaturated-dennis-noncosmically.ngrok-free.dev/api/shopify/oauth/callback
```

### App URL:
```
https://nonsaturated-dennis-noncosmically.ngrok-free.dev
```

---

## ⚠️ ملاحظات مهمة:

1. **ngrok URL يتغير**: كل مرة تشغل ngrok، الـ URL بيتغير. لو حصل:
   - حدث الـ URLs في Shopify App settings
   - حدث الـ URL في `.env` file
   - حدث الـ URL في `ShopifyOAuth.jsx`

2. **الباك إند لازم يكون شغال**: تأكد إن `webhook-server-simple.js` شغال

3. **ngrok لازم يكون شغال**: تأكد إن ngrok شغال طول الوقت

---

## 🔍 استكشاف الأخطاء:

### "redirect_uri is not whitelisted"
- تأكد إن الـ redirect URL موجود في Shopify App settings
- تأكد إن الـ URL صحيح بالضبط (بدون / في الآخر)

### "Connection refused"
- تأكد إن الباك إند شغال على port 3001
- تأكد إن ngrok شغال

### "Invalid client credentials"
- تأكد إن Client ID و Client Secret صحيحين
- تأكد إنك نسختهم بشكل صحيح

---

## ✅ Checklist:

- [ ] Shopify App تم إنشاؤه
- [ ] Redirect URL تم إضافته في Shopify
- [ ] API Scopes تم تفعيلها
- [ ] Client ID و Client Secret تم نسخهم
- [ ] Backend شغال (port 3001)
- [ ] ngrok شغال
- [ ] Frontend شغال (port 5173)
- [ ] تم محاولة الربط من الفرونت إند

---

## 🆘 مساعدة:

إذا واجهت أي مشكلة، تحقق من:
1. Backend logs في terminal
2. ngrok logs في terminal
3. Browser console للأخطاء
4. Shopify App settings

---

**جاهز للربط! 🚀**
