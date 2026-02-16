# 🔧 حل مشكلة Redirect URL - خطوة بخطوة

## 🎯 المشكلة:
```
Oauth error invalid_request: The redirect_uri is not whitelisted
```

## ✅ السبب:
Shopify لا يعرف الـ Redirect URL لأنك لم تضيفه في إعدادات التطبيق!

---

## 📝 الحل (5 دقائق):

### الخطوة 1: افتح Shopify Admin

اذهب إلى متجرك في Shopify وسجل دخول

---

### الخطوة 2: اذهب إلى Apps Settings

```
من القائمة الجانبية (في الأسفل):
Settings
```

---

### الخطوة 3: Apps and Sales Channels

```
في صفحة Settings:
Apps and sales channels
```

---

### الخطوة 4: Develop Apps

```
في الأعلى اليمين:
اضغط "Develop apps"
```

⚠️ إذا لم تجد "Develop apps":
- اضغط "Allow custom app development"
- ثم ارجع واضغط "Develop apps"

---

### الخطوة 5: اختر أو أنشئ App

**إذا لم يكن لديك App:**
1. اضغط "Create an app"
2. اسم التطبيق: `WhatsApp CRM`
3. اضغط "Create app"

**إذا كان لديك App:**
1. اضغط على اسم التطبيق

---

### الخطوة 6: Configuration Tab

اضغط على تبويب **"Configuration"**

---

### الخطوة 7: أضف Redirect URL (الأهم!)

ابحث عن قسم اسمه:
```
Allowed redirection URL(s)
```

اضغط **"Add URL"** أو **"Edit"**

ثم أضف هذا الـ URL **بالضبط**:

```
https://wahtsapp2.vercel.app/api/shopify/oauth/callback
```

⚠️ **انتبه جداً:**
- انسخه والصقه بالضبط
- لا تغير أي حرف
- لا مسافات قبل أو بعد
- `https://` وليس `http://`
- لا `/` في النهاية

---

### الخطوة 8: Configure Permissions

في نفس صفحة Configuration:

1. اضغط **"Configure Admin API scopes"**
2. ابحث واختر:
   - ✅ `read_orders`
   - ✅ `write_orders`
3. اضغط **"Save"**

---

### الخطوة 9: احفظ كل شيء

اضغط **"Save"** في أسفل الصفحة

---

### الخطوة 10: Install App

في أعلى الصفحة، اضغط **"Install app"**

⚠️ هذه الخطوة مهمة جداً!

---

### الخطوة 11: احصل على Credentials

1. اذهب إلى تبويب **"API credentials"**
2. انسخ:
   - **Client ID**
   - **Client secret** (اضغط "Reveal" أولاً)

---

### الخطوة 12: جرب الآن

1. افتح: https://wahtsapp2.vercel.app
2. اذهب إلى: Settings → Shopify Integration
3. اختر: OAuth (Advanced)
4. املأ:
   - Shop Subdomain: `your-store`
   - Client ID: [الصق]
   - Client Secret: [الصق]
5. اضغط: "Connect with OAuth"

---

## ✅ يجب أن يعمل الآن!

بعد الضغط على Connect:
1. سيتم تحويلك إلى Shopify
2. اضغط "Install app"
3. سيتم تحويلك مرة أخرى للموقع
4. يجب أن ترى: ✅ "Connected"

---

## 🔍 كيف تتأكد أن الـ URL مضاف بشكل صحيح:

في Shopify App → Configuration → Allowed redirection URL(s):

يجب أن ترى:
```
✅ https://wahtsapp2.vercel.app/api/shopify/oauth/callback
```

---

## ❌ أخطاء شائعة:

### خطأ 1: URL خطأ
```
❌ http://wahtsapp2.vercel.app/api/shopify/oauth/callback
❌ https://wahtsapp2.vercel.app/api/shopify/oauth/callback/
❌ https://wahtsapp2.vercel.app/shopify/oauth/callback
✅ https://wahtsapp2.vercel.app/api/shopify/oauth/callback
```

### خطأ 2: نسيان Save
بعد إضافة الـ URL، يجب الضغط على "Save"

### خطأ 3: نسيان Install app
يجب الضغط على "Install app" في الأعلى

### خطأ 4: Permissions غير محددة
يجب تحديد `read_orders` و `write_orders`

---

## 📸 Screenshots (إذا احتجت):

خذ screenshot من:
1. Shopify → Configuration → Allowed redirection URL(s)
2. يجب أن يظهر الـ URL بالضبط

---

## 💡 نصيحة:

إذا استمرت المشكلة:
1. احذف التطبيق من Shopify
2. أنشئ تطبيق جديد
3. اتبع الخطوات من البداية
4. تأكد من كل خطوة

---

**الحالة:** يجب أن يعمل بعد إضافة الـ URL
**الوقت المتوقع:** 5 دقائق
**الصعوبة:** سهلة (إذا اتبعت الخطوات بالضبط)
