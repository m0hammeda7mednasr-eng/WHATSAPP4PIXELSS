# 🎯 حل OAuth النهائي - خطوة بخطوة

## ⚠️ قبل أي شيء:

تأكد من أن لديك:
- ✅ متجر Shopify نشط
- ✅ صلاحيات Admin في Shopify
- ✅ الموقع يعمل على: https://wahtsapp2.vercel.app

---

## 📝 الخطوات بالتفصيل الممل:

### الخطوة 1: افتح Shopify Admin

1. اذهب إلى متجرك في Shopify
2. سجل دخول كـ Admin

---

### الخطوة 2: اذهب إلى Apps Settings

```
من القائمة الجانبية:
Settings (في الأسفل)
```

---

### الخطوة 3: اذهب إلى Develop Apps

```
في صفحة Settings:
Apps and sales channels
→ اضغط "Develop apps" (في الأعلى اليمين)
```

إذا لم تجد "Develop apps":
- قد تحتاج تفعيل Custom app development
- اضغط "Allow custom app development"

---

### الخطوة 4: أنشئ App جديد

1. اضغط **"Create an app"**
2. اسم التطبيق: **WhatsApp CRM**
3. اضغط **"Create app"**

---

### الخطوة 5: Configuration Tab

1. اضغط على تبويب **"Configuration"**
2. ستجد عدة أقسام

---

### الخطوة 6: App URL (مهم جداً!)

في قسم **"App URL"**:

```
https://wahtsapp2.vercel.app
```

⚠️ انتبه:
- بالضبط كما هو
- لا تضع `/` في النهاية
- `https://` وليس `http://`

---

### الخطوة 7: Allowed redirection URL(s) (الأهم!)

في قسم **"Allowed redirection URL(s)"**:

اضغط **"Add URL"** ثم أضف:

```
https://wahtsapp2.vercel.app/api/shopify/oauth/callback
```

⚠️ انتبه جداً:
- يجب أن يكون بالضبط كما هو
- لا مسافات
- لا `/` في النهاية
- `https://` وليس `http://`
- `/api/shopify/oauth/callback` بالضبط

---

### الخطوة 8: Configure Admin API Scopes

1. في نفس صفحة Configuration
2. اضغط **"Configure Admin API scopes"**
3. ستفتح قائمة طويلة من الـ Permissions

---

### الخطوة 9: اختر Permissions

ابحث واختر:
- ✅ **read_orders** (Orders → Read)
- ✅ **write_orders** (Orders → Write)

فقط هذين الاثنين!

---

### الخطوة 10: احفظ Configuration

1. اضغط **"Save"** في أسفل الصفحة
2. انتظر رسالة التأكيد

---

### الخطوة 11: Install App (مهم!)

1. في أعلى الصفحة، اضغط **"Install app"**
2. ستظهر رسالة تأكيد
3. اضغط **"Install"**

⚠️ هذه الخطوة مهمة جداً! بدونها لن يعمل OAuth

---

### الخطوة 12: احصل على Credentials

1. اذهب إلى تبويب **"API credentials"**
2. ستجد:
   - **Client ID** (أو API Key)
   - **Client secret** (أو API Secret Key)
3. انسخ كل واحد في مكان آمن

⚠️ Client secret يظهر مرة واحدة فقط!

---

### الخطوة 13: اذهب إلى موقعك

1. افتح: https://wahtsapp2.vercel.app
2. سجل دخول
3. اذهب إلى: **Settings** (أيقونة الترس)
4. اختر تبويب: **Shopify Integration**

---

### الخطوة 14: اختر OAuth

1. اختر: **OAuth (Advanced)** (الخيار الثاني)
2. لا تختر Manual Token

---

### الخطوة 15: املأ البيانات

**Shop Subdomain:**
```
إذا كان متجرك: my-awesome-store.myshopify.com
اكتب فقط: my-awesome-store
```

**Client ID:**
```
الصق من Shopify (من API credentials)
```

**Client Secret:**
```
الصق من Shopify (من API credentials)
```

---

### الخطوة 16: اضغط Connect

1. اضغط زر **"Connect with OAuth"**
2. سيتم تحويلك إلى Shopify

---

### الخطوة 17: في Shopify

1. ستظهر صفحة تطلب منك تثبيت التطبيق
2. اضغط **"Install app"** أو **"Install unlisted app"**
3. سيتم تحويلك مرة أخرى للموقع

---

### الخطوة 18: تحقق من النجاح

يجب أن ترى:
- ✅ Badge أخضر **"Connected"**
- ✅ اسم متجرك
- ✅ تاريخ الربط
- ✅ زر **"Test Connection"**

---

## 🔍 Troubleshooting:

### المشكلة: "redirect_uri is not whitelisted"

**السبب:** لم تضف الـ URL في Shopify بشكل صحيح

**الحل:**
1. ارجع لـ Shopify App → Configuration
2. تأكد من أن **Allowed redirection URL(s)** يحتوي على:
   ```
   https://wahtsapp2.vercel.app/api/shopify/oauth/callback
   ```
3. تأكد من عدم وجود مسافات أو أخطاء إملائية
4. اضغط Save
5. جرب مرة أخرى

---

### المشكلة: "Invalid client credentials"

**السبب:** Client ID أو Client Secret خطأ

**الحل:**
1. ارجع لـ Shopify App → API credentials
2. انسخ Client ID مرة أخرى
3. إذا فقدت Client Secret، اضغط "Regenerate"
4. انسخ الجديد
5. جرب مرة أخرى

---

### المشكلة: "App not installed"

**السبب:** لم تضغط "Install app" في Shopify

**الحل:**
1. ارجع لـ Shopify App
2. اضغط "Install app" في الأعلى
3. جرب مرة أخرى

---

### المشكلة: يحولني لـ Shopify لكن يرجع بخطأ

**السبب:** Permissions غير صحيحة

**الحل:**
1. Shopify App → Configuration
2. Configure Admin API scopes
3. تأكد من تحديد: read_orders, write_orders
4. Save
5. جرب مرة أخرى

---

## ✅ Checklist النهائي:

قبل أن تضغط Connect، تأكد من:

### في Shopify:
- [ ] App تم إنشاؤه
- [ ] App URL = `https://wahtsapp2.vercel.app`
- [ ] Allowed redirection URL(s) = `https://wahtsapp2.vercel.app/api/shopify/oauth/callback`
- [ ] Admin API scopes: read_orders, write_orders
- [ ] تم الضغط على Save
- [ ] تم الضغط على Install app
- [ ] تم نسخ Client ID
- [ ] تم نسخ Client Secret

### في موقعك:
- [ ] OAuth (Advanced) محدد
- [ ] Shop Subdomain صحيح (بدون .myshopify.com)
- [ ] Client ID منسوخ بالكامل
- [ ] Client Secret منسوخ بالكامل

---

## 🎯 إذا لم ينجح بعد كل هذا:

أرسل لي screenshots من:
1. Shopify App → Configuration (كل الصفحة)
2. Shopify App → API credentials (اخفي الـ secrets)
3. موقعك → Settings → Shopify Integration
4. رسالة الخطأ بالضبط

---

**الحالة:** يجب أن يعمل 100% بعد هذه الخطوات
**الوقت المتوقع:** 10 دقائق
**الصعوبة:** متوسطة (لكن الشرح مفصل)
