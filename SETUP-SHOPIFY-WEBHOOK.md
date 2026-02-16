# 🌐 إعداد Shopify Webhook - دليل سريع

## 🎯 الخطوات (5 دقائق):

### 1️⃣ شغل ngrok

**افتح terminal جديد:**
```cmd
cd wahtsapp-main
START-NGROK.bat
```

**أو:**
```cmd
ngrok http 3001
```

**هتحصل على URL زي:**
```
Forwarding: https://abc-123-xyz.ngrok-free.app -> http://localhost:3001
```

**انسخ الـ URL (https://...)** ✅

---

### 2️⃣ سجل الـ Webhook في Shopify

**روح Shopify Admin:**
```
https://admin.shopify.com/store/YOUR_STORE/settings/notifications
```

**أو:**
1. Shopify Admin
2. Settings (أسفل اليسار)
3. Notifications
4. انزل تحت لـ "Webhooks"
5. اضغط "Create webhook"

**املا البيانات:**
```
Event: Order creation
Format: JSON
URL: https://YOUR-NGROK-URL.ngrok-free.app/api/shopify/webhook
API version: 2024-01 (أو أحدث)
```

**مثال:**
```
https://abc-123-xyz.ngrok-free.app/api/shopify/webhook
```

**احفظ!** ✅

---

### 3️⃣ اختبر الـ Webhook

**في Shopify:**
1. بعد ما تحفظ الـ webhook
2. اضغط "Send test notification"
3. شوف الـ server logs
4. لازم تشوف: "📥 Shopify Webhook received"

---

### 4️⃣ اعمل Order حقيقي

**في Shopify Admin:**
1. Orders → Create order
2. املا بيانات العميل:
   - Name: أي اسم
   - Phone: **01066184859** (مهم!)
   - Address: أي عنوان
3. أضف منتج
4. اضغط "Create order"

**راقب النتائج:**
- ✅ Server logs: "✅ Order saved to database"
- ✅ الموقع: Orders page (order جديد)
- ✅ WhatsApp: رسالة للعميل

---

## 🔍 استكشاف الأخطاء:

### ❌ "Webhook delivery failed"
**السبب:** ngrok مش شغال أو الـ URL غلط  
**الحل:** تأكد إن ngrok شغال والـ URL صحيح

### ❌ "Connection refused"
**السبب:** السيرفر مش شغال  
**الحل:** شغل السيرفر: `node webhook-server-simple.js`

### ❌ "Shop not connected"
**السبب:** الـ shop name مش متطابق  
**الحل:** تأكد إن الـ connection في الـ database صحيح

---

## 📊 علامات النجاح:

### في ngrok terminal:
```
POST /api/shopify/webhook    200 OK
```

### في server terminal:
```
📥 Shopify Webhook received
✅ Connection found
✅ Brand found
✅ Order saved to database
✅ WhatsApp message sent
```

### في الموقع:
```
Orders page → order جديد ظاهر
```

---

## 💡 نصائح:

1. **ngrok لازم يفضل شغال** طول ما عايز تستقبل orders
2. **لو أقفلت ngrok وشغلته تاني**، الـ URL هيتغير - لازم تحدث الـ webhook في Shopify
3. **ngrok المجاني** بيدي URL جديد كل مرة - لو عايز URL ثابت، استخدم ngrok مدفوع
4. **السيرفر لازم يفضل شغال** مع ngrok

---

## 🚀 Quick Start:

```cmd
# Terminal 1: السيرفر
cd wahtsapp-main\server
node webhook-server-simple.js

# Terminal 2: ngrok
cd wahtsapp-main
ngrok http 3001

# Browser: Shopify
Settings → Notifications → Webhooks → Create webhook
URL: https://YOUR-NGROK-URL.ngrok-free.app/api/shopify/webhook

# Test: اعمل order
Orders → Create order
```

---

**ابدأ بـ `START-NGROK.bat` وانسخ الـ URL!** 🚀
