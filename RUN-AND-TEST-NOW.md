# 🚀 تشغيل وتجربة المشروع - دليل سريع

## الخطوات بالترتيب:

### 1️⃣ تجهيز قاعدة البيانات (Supabase)

**افتح Supabase SQL Editor:**
1. روح على: https://supabase.com/dashboard
2. اختار المشروع بتاعك
3. اضغط على "SQL Editor" من القائمة الجانبية
4. اعمل New Query

**انسخ والصق الكود ده:**
```sql
-- نسخ كل المحتوى من ملف: database-shopify-integration.sql
```

افتح ملف `database-shopify-integration.sql` وانسخ كل المحتوى والصقه في SQL Editor واضغط Run.

✅ لو ظهرت "Success" يبقى تمام!

---

### 2️⃣ إضافة اتصال Shopify (مؤقت)

**في نفس SQL Editor، شغّل الكود ده:**

```sql
-- أولاً: جيب الـ brand_id بتاعك
SELECT id, name FROM brands;
```

هيظهرلك جدول فيه الـ brands. انسخ الـ `id` بتاع البراند اللي عاوز تستخدمه.

**بعدين شغّل:**
```sql
-- غيّر القيم دي بالبيانات بتاعتك
INSERT INTO shopify_connections (
  brand_id,
  shop_url,
  access_token,
  is_active
) VALUES (
  'حط-brand-id-هنا',
  'your-store.myshopify.com',
  'shpat_xxxxxxxxxxxxx',
  true
);
```

⚠️ **ملحوظة:** لو مش عندك Shopify token دلوقتي، ممكن تحط أي حاجة مؤقتة للتجربة.

---

### 3️⃣ تشغيل Backend (Webhook Server)

**افتح Terminal وشغّل:**
```bash
npm run server
```

أو:
```bash
node server/webhook-server.js
```

**المفروض تشوف:**
```
🚀 Starting WhatsApp Webhook Server...
📍 Supabase URL: ✅ Connected
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 WhatsApp Webhook Server is running!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Port: 3001
📍 Webhook: /webhook/whatsapp
📍 Health: /health
```

✅ لو شفت الرسالة دي، يبقى الـ Backend شغال!

**خلّي الـ Terminal ده مفتوح!**

---

### 4️⃣ تشغيل Frontend (React App)

**افتح Terminal تاني وشغّل:**
```bash
npm run dev
```

**المفروض تشوف:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

✅ افتح المتصفح على: http://localhost:5173

---

### 5️⃣ تجربة إرسال Order Confirmation

**افتح ملف `test-shopify-order-confirmation.js` وعدّل:**

```javascript
const payload = {
  phone_number: '201066184859', // ⚠️ حط رقمك هنا
  order_id: 'test_order_123',
  order_number: '#1234',
  customer_name: 'أحمد محمد',
  total: '500 جنيه',
  brand_id: 'حط-brand-id-هنا', // ⚠️ من الخطوة 2
  items: [
    { name: 'تيشيرت', quantity: 2 }
  ]
};
```

**بعدين شغّل:**
```bash
node test-shopify-order-confirmation.js
```

---

### 6️⃣ تجربة الأزرار (Buttons)

**لو كل حاجة تمام:**
1. ✅ هتوصلك رسالة على WhatsApp
2. ✅ الرسالة فيها زرارين: "تأكيد ✅" و "إلغاء ❌"
3. ✅ اضغط على أي زرار
4. ✅ هتوصلك رسالة تأكيد
5. ✅ الطلب هيتحدث في قاعدة البيانات

---

## 🔍 التحقق من النتائج

### في Supabase:

**1. شوف الطلبات:**
```sql
SELECT * FROM shopify_orders ORDER BY created_at DESC LIMIT 10;
```

**2. شوف الرسائل:**
```sql
SELECT * FROM messages WHERE message_type = 'interactive' ORDER BY created_at DESC LIMIT 10;
```

**3. شوف الـ Contacts:**
```sql
SELECT * FROM contacts ORDER BY last_message_at DESC LIMIT 10;
```

---

## 🐛 حل المشاكل

### مشكلة: "Brand not found"
**الحل:** تأكد إن الـ `brand_id` في ملف التجربة صحيح
```sql
SELECT id, name FROM brands;
```

### مشكلة: "Shopify not connected"
**الحل:** تأكد إنك عملت الخطوة 2 (إضافة shopify_connections)

### مشكلة: "WhatsApp token not configured"
**الحل:** 
1. روح Settings في الموقع
2. حط الـ WhatsApp Token
3. أو عدّله في قاعدة البيانات:
```sql
UPDATE brands 
SET whatsapp_token = 'your-token-here'
WHERE id = 'your-brand-id';
```

### مشكلة: الـ Backend مش شغال
**الحل:**
```bash
# تأكد إن الـ .env موجود وفيه:
VITE_SUPABASE_URL=https://rmpgofswkpjxionzythf.supabase.co
VITE_SUPABASE_ANON_KEY=your-key-here

# شغّل Backend تاني:
npm run server
```

---

## 📊 الـ Flow الكامل

```
1. n8n يبعت طلب → /api/shopify/send-order-confirmation
                    ↓
2. Backend يبعت رسالة WhatsApp مع أزرار
                    ↓
3. العميل يضغط على زرار
                    ↓
4. WhatsApp يبعت webhook → /webhook/whatsapp
                    ↓
5. Backend يكتشف الزرار ويشغّل handle-button-click
                    ↓
6. Backend يحدث Shopify (confirm/cancel)
                    ↓
7. Backend يبعت رسالة تأكيد للعميل
                    ↓
8. Backend يحفظ كل حاجة في قاعدة البيانات
```

---

## ✅ Checklist

- [ ] قاعدة البيانات جاهزة (Shopify tables)
- [ ] Shopify connection مضافة
- [ ] Backend شغال (port 3001)
- [ ] Frontend شغال (port 5173)
- [ ] WhatsApp Token مضبوط
- [ ] رقم الهاتف صحيح
- [ ] Brand ID صحيح
- [ ] Test script معدّل
- [ ] جربت إرسال رسالة
- [ ] الرسالة وصلت مع الأزرار
- [ ] جربت الضغط على زرار
- [ ] رسالة التأكيد وصلت

---

## 🎯 الخطوة الجاية

بعد ما تتأكد إن كل حاجة شغالة:

1. **Deploy على Vercel:**
   - Frontend: `npm run build` → Deploy to Vercel
   - Backend APIs: Already in `/api` folder (Vercel Serverless)

2. **ربط n8n:**
   - استخدم URL الحقيقي بدل localhost
   - `https://your-domain.vercel.app/api/shopify/send-order-confirmation`

3. **ربط Meta Webhook:**
   - Webhook URL: `https://your-domain.vercel.app/webhook/whatsapp`
   - Verify Token: `whatsapp_crm_2024`

---

## 💡 ملاحظات مهمة

1. **الـ Backend لازم يكون شغال** عشان تستقبل الـ webhooks من WhatsApp
2. **الـ Frontend مش ضروري** للتجربة، بس حلو عشان تشوف الرسائل
3. **لو عاوز تجرب بدون Shopify حقيقي**، ممكن تحط أي token مؤقت
4. **الأزرار بتشتغل بس مع WhatsApp Business API**، مش WhatsApp عادي

---

**جاهز للتجربة! 🚀**

لو حصلت أي مشكلة، قولي وهساعدك! 😊
