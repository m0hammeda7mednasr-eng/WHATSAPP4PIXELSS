# 🔧 حل نهائي لـ Shopify OAuth

## 🎯 المشكلة:
```
The redirect_uri is not whitelisted
```

## ✅ الحل (5 دقائق):

---

### الخطوة 1: افتح Shopify App

1. اذهب إلى: **Shopify Admin**
2. من القائمة: **Settings**
3. اختر: **Apps and sales channels**
4. اضغط: **Develop apps** (في الأعلى اليمين)

---

### الخطوة 2: اختر أو أنشئ App

**إذا لم يكن لديك App:**
1. اضغط **"Create an app"**
2. اسم التطبيق: **WhatsApp CRM**
3. اضغط **"Create app"**

**إذا كان لديك App:**
1. اضغط على اسم التطبيق

---

### الخطوة 3: اذهب إلى Configuration

1. اضغط على تبويب **"Configuration"**
2. ستجد قسم اسمه **"App URL"**

---

### الخطوة 4: أضف URLs (مهم جداً!)

#### في قسم "App URL":
```
https://wahtsapp2.vercel.app
```

#### في قسم "Allowed redirection URL(s)":
```
https://wahtsapp2.vercel.app/api/shopify/oauth/callback
```

⚠️ **انتبه:**
- يجب أن يكون `https://` وليس `http://`
- لا تضع `/` في النهاية
- انسخ والصق بالضبط كما هو
- تأكد من عدم وجود مسافات

---

### الخطوة 5: Configure Permissions

1. في نفس صفحة Configuration
2. اضغط **"Configure Admin API scopes"**
3. ابحث واختر:
   - ✅ `read_orders`
   - ✅ `write_orders`
4. اضغط **"Save"** في الأسفل

---

### الخطوة 6: احفظ كل شيء

1. اضغط **"Save"** في أسفل الصفحة
2. انتظر رسالة التأكيد

---

### الخطوة 7: احصل على Credentials

1. اذهب إلى تبويب **"API credentials"**
2. ستجد:
   - **Client ID** (API Key)
   - **Client secret** (API Secret Key)
3. انسخهم

---

### الخطوة 8: اربط في موقعك

1. افتح: https://wahtsapp2.vercel.app
2. اذهب إلى: **Settings → Shopify Integration**
3. اختر: **OAuth (Advanced)**
4. املأ:
   - **Shop Subdomain**: `your-store` (بدون .myshopify.com)
   - **Client ID**: الصق من Shopify
   - **Client Secret**: الصق من Shopify
5. اضغط: **"Connect with OAuth"**

---

### الخطوة 9: أكمل OAuth في Shopify

1. سيتم تحويلك إلى Shopify
2. ستظهر صفحة تطلب منك تثبيت التطبيق
3. اضغط **"Install app"**
4. سيتم تحويلك مرة أخرى للموقع
5. يجب أن ترى: ✅ **"Connected"**

---

## 📋 Checklist للتأكد:

قبل أن تضغط Connect، تأكد من:

### في Shopify App → Configuration:
- [ ] App URL = `https://wahtsapp2.vercel.app`
- [ ] Allowed redirection URL(s) = `https://wahtsapp2.vercel.app/api/shopify/oauth/callback`
- [ ] تم الضغط على "Save"

### في Shopify App → Configuration → Admin API scopes:
- [ ] `read_orders` محدد
- [ ] `write_orders` محدد
- [ ] تم الضغط على "Save"

### في موقعك:
- [ ] Shop Subdomain صحيح (بدون .myshopify.com)
- [ ] Client ID منسوخ بالكامل
- [ ] Client Secret منسوخ بالكامل
- [ ] OAuth (Advanced) محدد

---

## 🔍 كيف تتأكد من الـ URLs:

### طريقة سهلة:
1. افتح موقعك: https://wahtsapp2.vercel.app
2. اذهب إلى Settings → Shopify Integration
3. انسخ الـ URL من المربع الأزرق في الأعلى
4. الصقه في Shopify بالضبط

---

## ⚠️ أخطاء شائعة:

### ❌ خطأ 1: URL خطأ
```
❌ http://wahtsapp2.vercel.app/api/shopify/oauth/callback
✅ https://wahtsapp2.vercel.app/api/shopify/oauth/callback
```

### ❌ خطأ 2: نسيان Save
بعد إضافة URLs، يجب الضغط على "Save"

### ❌ خطأ 3: Permissions غير محددة
يجب تحديد `read_orders` و `write_orders`

### ❌ خطأ 4: Shop Subdomain خطأ
```
❌ my-store.myshopify.com
✅ my-store
```

---

## 🎯 بعد النجاح:

عند نجاح الربط سترى:
- ✅ Badge أخضر "Connected"
- ✅ اسم متجرك
- ✅ تاريخ الربط
- ✅ زر "Test Connection" يعمل

---

## 📸 Screenshots مطلوبة (إذا لم ينجح):

خذ screenshot من:
1. Shopify → App → Configuration (كل الصفحة)
2. Shopify → App → API credentials
3. موقعك → Settings → Shopify Integration
4. رسالة الخطأ بالضبط

وأرسلهم لي

---

## 💡 نصيحة:

إذا استمرت المشكلة:
1. احذف التطبيق من Shopify
2. أنشئ تطبيق جديد
3. اتبع الخطوات من البداية
4. تأكد من كل خطوة

---

**الحالة:** جاهز للاستخدام بعد إضافة URLs
**الوقت المتوقع:** 5 دقائق
**الصعوبة:** متوسطة
