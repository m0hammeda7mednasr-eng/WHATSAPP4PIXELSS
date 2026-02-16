# 🛍️ دليل Shopify الكامل - من الصفر للنهاية

## ✅ تم إضافة كل حاجة!

### 1. واجهة Shopify في Settings
- ✅ تاب "Shopify Integration" لربط المتجر
- ✅ تاب "Shopify Orders" لعرض الطلبات
- ✅ اختبار الاتصال
- ✅ عرض حالة الاتصال

---

## 🚀 الخطوات بالترتيب:

### الخطوة 1: تجهيز قاعدة البيانات

**افتح Supabase SQL Editor:**
```
https://supabase.com/dashboard → Your Project → SQL Editor
```

**انسخ والصق كل المحتوى من:**
```
database-shopify-integration.sql
```

**اضغط Run** ✅

---

### الخطوة 2: تشغيل المشروع

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**افتح المتصفح:**
```
http://localhost:5173
```

---

### الخطوة 3: ربط Shopify

#### 3.1 الحصول على Shopify Credentials

**افتح Shopify Admin:**
```
https://admin.shopify.com/store/YOUR-STORE
```

**اذهب إلى:**
```
Settings → Apps and sales channels → Develop apps
```

**أنشئ Custom App:**
1. اضغط "Create an app"
2. اسم الـ App: "WhatsApp CRM"
3. اضغط "Create app"

**اطلب الصلاحيات:**
1. اضغط "Configure Admin API scopes"
2. اختار:
   - ✅ read_orders
   - ✅ write_orders
3. اضغط "Save"

**احصل على Access Token:**
1. اضغط "Install app"
2. اضغط "Install"
3. انسخ "Admin API access token"
4. ⚠️ احفظه في مكان آمن (مش هيظهر تاني!)

#### 3.2 ربط Shopify في CRM

**في المتصفح:**
1. افتح Settings (⚙️ أعلى اليسار)
2. اضغط تاب "Shopify Integration"
3. املأ البيانات:
   - **Shop URL:** your-store.myshopify.com
   - **Access Token:** shpat_xxxxxxxxxxxxx
4. اضغط "ربط Shopify"

**لو نجح:**
- ✅ هيظهر "متصل بنجاح"
- ✅ هيظهر اسم المتجر
- ✅ هتقدر تختبر الاتصال

---

### الخطوة 4: ربط n8n

#### 4.1 إنشاء Workflow في n8n

**Trigger: Shopify Order Created**
```
Node: Shopify Trigger
Event: Order Created
```

**Action: HTTP Request**
```
Method: POST
URL: http://localhost:3001/api/shopify/send-order-confirmation

Headers:
Content-Type: application/json

Body:
{
  "phone_number": "{{ $json.customer.phone }}",
  "order_id": "{{ $json.id }}",
  "order_number": "{{ $json.name }}",
  "customer_name": "{{ $json.customer.first_name }} {{ $json.customer.last_name }}",
  "total": "{{ $json.total_price }} {{ $json.currency }}",
  "brand_id": "YOUR-BRAND-ID-HERE",
  "items": {{ $json.line_items }}
}
```

**احصل على Brand ID:**
```bash
node get-brand-info.js
```

---

### الخطوة 5: التجربة

#### 5.1 إرسال طلب تجريبي

**عدّل ملف التجربة:**
```javascript
// test-shopify-order-confirmation.js
const payload = {
  phone_number: '201066184859', // رقمك
  order_id: 'test_' + Date.now(),
  order_number: '#TEST-123',
  customer_name: 'أحمد محمد',
  total: '500 جنيه',
  brand_id: 'YOUR-BRAND-ID', // من get-brand-info.js
  items: [
    { name: 'تيشيرت', quantity: 2 }
  ]
};
```

**شغّل التجربة:**
```bash
node test-shopify-order-confirmation.js
```

#### 5.2 ماذا يحدث؟

1. ✅ رسالة WhatsApp تُرسل للعميل
2. ✅ الرسالة فيها زرارين: "تأكيد ✅" و "إلغاء ❌"
3. ✅ الطلب يُحفظ في قاعدة البيانات
4. ✅ يظهر في تاب "Shopify Orders"

#### 5.3 اختبار الأزرار

**افتح WhatsApp على الرقم:**
1. هتلاقي الرسالة مع الزرارين
2. اضغط على "تأكيد ✅"
3. هتوصلك رسالة تأكيد
4. الطلب يتحدث في Shopify تلقائياً
5. الحالة تتغير في "Shopify Orders"

---

## 📊 عرض الطلبات

**في Settings → Shopify Orders:**
- ✅ كل الطلبات المرسلة
- ✅ حالة كل طلب (في الانتظار / مؤكد / ملغي)
- ✅ تفاصيل العميل
- ✅ وقت التأكيد/الإلغاء
- ✅ Real-time updates

**الفلاتر:**
- الكل
- في الانتظار
- مؤكدة
- ملغاة

---

## 🔍 التحقق من النتائج

### في Supabase:

**1. الاتصالات:**
```sql
SELECT * FROM shopify_connections;
```

**2. الطلبات:**
```sql
SELECT * FROM shopify_orders ORDER BY created_at DESC;
```

**3. الرسائل:**
```sql
SELECT * FROM messages WHERE message_type = 'interactive' ORDER BY created_at DESC;
```

### في Shopify:

**افتح الطلب في Shopify:**
1. Orders → اختار الطلب
2. هتلاقي Tag: "whatsapp-confirmed"
3. هتلاقي Note: "تم التأكيد عبر WhatsApp في [timestamp]"

---

## 🎯 الـ Flow الكامل

```
1. عميل يطلب من Shopify
         ↓
2. Shopify يبعت webhook لـ n8n
         ↓
3. n8n يبعت طلب لـ API
         ↓
4. API يبعت رسالة WhatsApp مع أزرار
         ↓
5. العميل يضغط زرار
         ↓
6. WhatsApp يبعت webhook للـ Backend
         ↓
7. Backend يكتشف الزرار
         ↓
8. Backend يحدث Shopify (confirm/cancel)
         ↓
9. Backend يبعت رسالة تأكيد
         ↓
10. Backend يحدث قاعدة البيانات
         ↓
11. الحالة تتحدث في الواجهة (real-time)
```

---

## 🐛 حل المشاكل

### مشكلة: "Brand not found"
**الحل:**
```bash
node get-brand-info.js
# انسخ الـ brand_id واستخدمه
```

### مشكلة: "Shopify not connected"
**الحل:**
1. افتح Settings → Shopify Integration
2. تأكد من الاتصال
3. اضغط "اختبار الاتصال"

### مشكلة: "Invalid credentials"
**الحل:**
1. تأكد من Shop URL صحيح (your-store.myshopify.com)
2. تأكد من Token يبدأ بـ shpat_
3. تأكد من الصلاحيات (read_orders, write_orders)

### مشكلة: الأزرار مش شغالة
**الحل:**
1. تأكد من الـ webhook server شغال
2. تأكد من الـ webhook مسجل في Meta
3. شوف الـ logs:
```sql
SELECT * FROM shopify_webhook_logs ORDER BY created_at DESC;
```

---

## 📱 رسائل WhatsApp

### رسالة الطلب:
```
مرحباً أحمد 👋

تم استلام طلبك بنجاح! 🎉

📦 رقم الطلب: #1234
💰 الإجمالي: 500 جنيه

📋 المنتجات:
• تيشيرت (2x)

برجاء تأكيد الطلب للمتابعة في عملية الشحن.

[تأكيد الطلب ✅]  [إلغاء الطلب ❌]
```

### رسالة التأكيد:
```
✅ تم تأكيد طلبك بنجاح!

رقم الطلب: #1234

سيتم التواصل معك قريباً لترتيب الشحن. شكراً لك! 🎉
```

### رسالة الإلغاء:
```
❌ تم إلغاء طلبك.

رقم الطلب: #1234

نأسف لعدم إتمام الطلب. يمكنك الطلب مرة أخرى في أي وقت.
```

---

## 🎨 الواجهة

### Settings → Shopify Integration:
- ✅ حالة الاتصال
- ✅ معلومات المتجر
- ✅ اختبار الاتصال
- ✅ فصل الاتصال
- ✅ دليل الاستخدام

### Settings → Shopify Orders:
- ✅ قائمة الطلبات
- ✅ فلاتر (الكل / في الانتظار / مؤكدة / ملغاة)
- ✅ تفاصيل كل طلب
- ✅ رابط لفتح الطلب في Shopify
- ✅ Real-time updates

---

## 🚀 Deploy للإنتاج

### 1. Deploy Frontend (Vercel):
```bash
npm run build
# Deploy to Vercel
```

### 2. Deploy Backend (Vercel Serverless):
- الـ APIs موجودة في `/api` folder
- Vercel هيشغلها تلقائياً

### 3. Update n8n URL:
```
https://your-domain.vercel.app/api/shopify/send-order-confirmation
```

### 4. Update Meta Webhook:
```
https://your-domain.vercel.app/webhook/whatsapp
```

---

## ✅ Checklist

- [ ] قاعدة البيانات جاهزة
- [ ] Backend شغال
- [ ] Frontend شغال
- [ ] Shopify متصل
- [ ] n8n workflow جاهز
- [ ] WhatsApp webhook مسجل
- [ ] جربت إرسال طلب
- [ ] الرسالة وصلت مع الأزرار
- [ ] جربت الضغط على زرار
- [ ] Shopify اتحدث
- [ ] الحالة ظهرت في الواجهة

---

## 🎉 كل حاجة جاهزة!

الآن عندك:
- ✅ واجهة كاملة لربط Shopify
- ✅ عرض الطلبات مع الحالات
- ✅ اختبار الاتصال
- ✅ Real-time updates
- ✅ رسائل WhatsApp مع أزرار تفاعلية
- ✅ تحديث Shopify تلقائياً
- ✅ تتبع كل حاجة في قاعدة البيانات

**جرب دلوقتي! 🚀**
