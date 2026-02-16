# 🔧 حل مشكلة: The redirect_uri is not whitelisted

## 🔴 المشكلة:
```
Oauth error invalid_request: The redirect_uri is not whitelisted
```

---

## ✅ الحل الصحيح (خطوة بخطوة):

### الخطوة 1: افتح Shopify App

1. اذهب إلى Shopify Admin
2. من القائمة الجانبية: **Settings**
3. اختر: **Apps and sales channels**
4. اضغط: **Develop apps** (في الأعلى)
5. اختر التطبيق الذي أنشأته

---

### الخطوة 2: اذهب إلى Configuration

1. اضغط على تبويب **"Configuration"**
2. ستجد قسم اسمه **"App URL"**

---

### الخطوة 3: أضف الـ URLs الصحيحة

في قسم **"App URL"**، أضف:
```
https://wahtsapp2.vercel.app
```

في قسم **"Allowed redirection URL(s)"**، أضف:
```
https://wahtsapp2.vercel.app/api/shopify/oauth/callback
```

⚠️ **مهم جداً:**
- لا تضع `/` في النهاية
- تأكد من `https://` وليس `http://`
- تأكد من عدم وجود مسافات

---

### الخطوة 4: احفظ التغييرات

اضغط زر **"Save"** في الأسفل

---

## 🎯 الطريقة البديلة (إذا لم تنجح الأولى):

### استخدم Manual Token بدلاً من OAuth:

1. في Shopify App → **API credentials**
2. اضغط **"Install app"** (إذا لم يكن مثبتاً)
3. بعد التثبيت، ستجد **"Admin API access token"**
4. انسخ الـ Token (يبدأ بـ `shpat_`)

5. في موقعك:
   - اذهب إلى Settings → Shopify Integration
   - أطفئ ✅ "Use OAuth"
   - املأ:
     - Shop Subdomain: `your-store`
     - Admin API Access Token: الصق الـ Token
   - اضغط "Connect Shopify"

---

## 📋 Checklist للتأكد:

في Shopify App Configuration:

- [ ] App URL = `https://wahtsapp2.vercel.app`
- [ ] Allowed redirection URL(s) = `https://wahtsapp2.vercel.app/api/shopify/oauth/callback`
- [ ] Admin API scopes تحتوي على:
  - [ ] `read_orders`
  - [ ] `write_orders`
- [ ] تم الضغط على "Save"

---

## 🔍 كيف تتأكد من الـ URL الصحيح:

1. افتح موقعك: https://wahtsapp2.vercel.app
2. اذهب إلى Settings → Shopify Integration
3. انسخ الـ URL من المربع الأزرق في الأعلى
4. الصقه في Shopify بالضبط كما هو

---

## ⚠️ أخطاء شائعة:

### ❌ خطأ 1: وضع URL خطأ
```
❌ http://wahtsapp2.vercel.app/api/shopify/oauth/callback
✅ https://wahtsapp2.vercel.app/api/shopify/oauth/callback
```

### ❌ خطأ 2: نسيان حفظ التغييرات
بعد إضافة الـ URL، يجب الضغط على "Save"

### ❌ خطأ 3: وضع الـ URL في مكان خطأ
يجب وضعه في **"Allowed redirection URL(s)"** وليس في مكان آخر

---

## 🎯 الحل السريع (Manual Token):

إذا OAuth لا يعمل، استخدم Manual Token:

### في Shopify:
1. App → Configuration → Install app
2. بعد التثبيت → API credentials
3. انسخ "Admin API access token"

### في موقعك:
1. Settings → Shopify Integration
2. أطفئ "Use OAuth"
3. الصق الـ Token
4. Connect

---

## 📸 لقطات الشاشة المطلوبة:

إذا لم ينجح، خذ screenshot من:
1. Shopify App → Configuration (كل الصفحة)
2. Shopify App → API credentials
3. موقعك → Settings → Shopify Integration (الـ URL في المربع الأزرق)

وأرسلهم لي لأساعدك

---

## 🚀 بعد الحل:

عند نجاح الربط سترى:
- ✅ Badge أخضر "Connected"
- ✅ اسم المتجر
- ✅ زر "Test Connection" يعمل

---

**الحالة:** جاهز للاستخدام بعد إضافة الـ URL
**آخر تحديث:** الآن
