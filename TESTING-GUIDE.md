# 🧪 دليل اختبار Shopify Integration

## 📋 الملفات المتاحة

### 1. `START-AND-TEST.bat` ⭐ (الأفضل)
**يشغل السيرفر ويختبر كل حاجة تلقائياً**

```cmd
START-AND-TEST.bat
```

**ماذا يفعل:**
- ✅ يشغل الـ backend server في نافذة منفصلة
- ✅ ينتظر 5 ثواني للسيرفر يبدأ
- ✅ يختبر الـ database والـ connections
- ✅ يختبر الـ webhook بإرسال order تجريبي
- ✅ يعرض نتائج مفصلة

---

### 2. `RUN-ALL-TESTS.bat`
**يختبر كل حاجة (لكن السيرفر لازم يكون شغال)**

```cmd
RUN-ALL-TESTS.bat
```

**قبل ما تشغله:**
```cmd
cd server
node webhook-server-simple.js
```

---

### 3. `test-shopify-complete.js`
**اختبار شامل للـ database والـ configuration**

```cmd
node test-shopify-complete.js
```

**يختبر:**
- ✅ جداول الـ database
- ✅ الـ Shopify connections
- ✅ تفاصيل الـ brand
- ✅ الـ contacts
- ✅ الـ orders
- ✅ الـ webhook endpoint
- ✅ الـ Foreign Keys

---

### 4. `test-webhook-direct.js`
**يرسل order تجريبي للـ webhook**

```cmd
node test-webhook-direct.js
```

**متطلبات:**
- السيرفر لازم يكون شغال على port 3001

---

## 🚀 الطريقة الموصى بها

### الخطوة 1: شغل الاختبار الشامل
```cmd
START-AND-TEST.bat
```

### الخطوة 2: راجع النتائج

#### ✅ إذا كانت النتائج كلها خضراء:
- الـ database شغال ✅
- الـ connection موجود ✅
- الـ webhook يستقبل ✅
- كل حاجة تمام! 🎉

#### ⚠️ إذا ظهرت مشاكل:

**مشكلة: "No Shopify connection found"**
```
الحل: روح Settings → Shopify Integration وعمل Connect
```

**مشكلة: "WhatsApp token not configured"**
```
الحل: روح Settings → أضف WhatsApp Token
```

**مشكلة: "Cannot connect to webhook"**
```
الحل: تأكد إن السيرفر شغال:
cd server
node webhook-server-simple.js
```

**مشكلة: "Error saving order"**
```
الحل: شغل الـ SQL في Supabase:
افتح: FINAL-FIX-SHOPIFY.sql
انسخ كل المحتوى
الصقه في Supabase SQL Editor
اضغط Run
```

---

## 📊 فهم النتائج

### TEST 1: Database Tables
```
✅ brands: 3 records          ← عدد الـ brands
✅ contacts: 6 records        ← عدد الـ contacts
✅ messages: 29 records       ← عدد الرسائل
✅ shopify_connections: 1     ← الـ connection موجود
✅ shopify_orders: 0          ← لسه مفيش orders
```

### TEST 2: Shopify Connections
```
✅ Found 1 active connection(s):
   📍 Shop: qpcich-gi.myshopify.com
   🔑 Brand ID: d8062ea0-...
   📅 Connected: 2/16/2026
   🔐 Has Token: Yes
```

### TEST 3: Brand Details
```
✅ Brand Details:
   📛 Name: 4 Pixels
   📱 Phone Number ID: 123456789
   🔑 WhatsApp Token: EAAxxxxxxx...
   🛍️  Shopify Store: qpcich-gi.myshopify.com
   ✅ Shopify Connected: Yes
```

### TEST 6: Webhook Test
```
✅ SUCCESS! Webhook processed successfully

💡 Next Steps:
   1. Check server logs
   2. Check database for new order
   3. Check if WhatsApp sent
   4. Check Orders page in frontend
```

---

## 🔧 استكشاف الأخطاء

### الخطأ: 406 Not Acceptable
**السبب:** استخدام `.single()` مع أكثر من record

**الحل:** تم إصلاحه في الكود الجديد ✅

---

### الخطأ: 400 Bad Request (FK constraint)
**السبب:** مفيش Foreign Key بين `shopify_orders` و `contacts`

**الحل:**
```sql
-- شغل ده في Supabase SQL Editor
ALTER TABLE shopify_orders 
ADD COLUMN IF NOT EXISTS contact_id UUID;

ALTER TABLE shopify_orders
ADD CONSTRAINT shopify_orders_contact_id_fkey
FOREIGN KEY (contact_id) REFERENCES contacts(id);
```

---

### الخطأ: Orders not saving
**الأسباب المحتملة:**
1. ❌ الـ SQL مش متشغل
2. ❌ الـ contact مش بيتعمل
3. ❌ الـ phone number format غلط

**الحل:**
```cmd
# شغل الاختبار وشوف الـ logs
node test-webhook-direct.js

# راجع الـ server logs في النافذة التانية
# هتلاقي رسائل زي:
# 🔍 Looking for contact with wa_id: 201066184859
# ✅ Contact found: xxx
# 💾 Saving order to database...
# ✅ Order saved: xxx
```

---

## 📱 اختبار حقيقي من Shopify

### الخطوة 1: تأكد إن كل حاجة شغالة
```cmd
START-AND-TEST.bat
```

### الخطوة 2: شغل ngrok
```cmd
ngrok http 3001
```

### الخطوة 3: سجل الـ webhook في Shopify
```
URL: https://your-ngrok-url.ngrok-free.dev/api/shopify/webhook
Topic: orders/create
Format: JSON
```

### الخطوة 4: اعمل order تجريبي
1. روح Shopify Admin
2. اعمل order جديد
3. حط رقم تليفون صحيح
4. اضغط Create Order

### الخطوة 5: راجع النتائج
- ✅ شوف الـ server logs
- ✅ شوف الـ database (shopify_orders)
- ✅ شوف الـ frontend (Orders page)
- ✅ شوف WhatsApp (لو الـ token صحيح)

---

## 🎯 الخلاصة

### ✅ كل حاجة شغالة لما:
1. الاختبارات كلها خضراء ✅
2. الـ webhook بيستقبل ✅
3. الـ orders بتتحفظ في الـ database ✅
4. الرسائل بتروح WhatsApp ✅
5. الـ Orders بتظهر في الـ frontend ✅

### 🔧 لو في مشكلة:
1. شغل `START-AND-TEST.bat`
2. راجع النتائج
3. اتبع التعليمات اللي هتظهر
4. لو محتاج مساعدة، ابعت الـ logs كاملة

---

## 📞 الدعم

لو عندك مشكلة:
1. شغل الاختبارات
2. خد screenshot من النتائج
3. خد screenshot من الـ server logs
4. ابعتهم عشان نساعدك

---

**آخر تحديث:** 2026-02-16
**الإصدار:** 2.0
