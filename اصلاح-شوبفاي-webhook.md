# 🔧 إصلاح Shopify Webhook

## المشكلة

عملت test order في Shopify بس الرسالة **مش بتوصل على WhatsApp أصلاً**

---

## السبب

Shopify مش بيبعت Webhook للسيستم!

محتاج تضيف Webhook في Shopify Settings.

---

## ✅ الحل (خطوة بخطوة)

### الخطوة 1: افتح Shopify Admin

1. اذهب لمتجرك على Shopify
2. من القائمة الجانبية: **Settings** ⚙️

---

### الخطوة 2: اذهب لـ Notifications

1. في Settings، اختار **Notifications**
2. scroll لتحت لحد ما تلاقي **Webhooks**
3. اضغط **Create webhook**

---

### الخطوة 3: أضف Order Creation Webhook

**Webhook 1: Order creation**

```
Event: Order creation
Format: JSON
URL: https://wahtsapp2.vercel.app/api/shopify/webhook-handler
Webhook API version: 2024-01 (أو أحدث)
```

اضغط **Save** ✅

---

### الخطوة 4: أضف Order Updated Webhook (اختياري)

**Webhook 2: Order updated**

```
Event: Order updated
Format: JSON
URL: https://wahtsapp2.vercel.app/api/shopify/webhook-handler
Webhook API version: 2024-01
```

اضغط **Save** ✅

---

### الخطوة 5: أضف Order Cancelled Webhook (اختياري)

**Webhook 3: Order cancelled**

```
Event: Order cancelled
Format: JSON
URL: https://wahtsapp2.vercel.app/api/shopify/webhook-handler
Webhook API version: 2024-01
```

اضغط **Save** ✅

---

## 🎯 الطريقة البديلة (لو مش لاقي Webhooks)

### استخدم Shopify App

لو بتستخدم Shopify App (OAuth):

1. افتح: **Apps** في Shopify Admin
2. اختار الـ App بتاعك
3. اذهب لـ **App setup**
4. في **Event subscriptions**، أضف:
   - `orders/create`
   - `orders/updated`
   - `orders/cancelled`
5. Webhook URL: `https://wahtsapp2.vercel.app/api/shopify/webhook-handler`

---

## 🧪 اختبار الـ Webhook

### الطريقة 1: Test من Shopify

1. في Shopify Webhooks
2. اختار الـ webhook اللي عملته
3. اضغط **Send test notification**
4. شوف لو في response

---

### الطريقة 2: اعمل Order حقيقي

1. اعمل test order في Shopify
2. ضع رقم واتساب صحيح في Phone
3. اضغط **Create order**
4. استنى 10-30 ثانية
5. شوف WhatsApp - المفروض الرسالة توصل!

---

## 🔍 تحقق من الـ Webhook Logs

### في Shopify:

1. Settings → Notifications → Webhooks
2. اختار الـ webhook
3. شوف **Recent deliveries**
4. لو في ❌ Failed → شوف الـ error

### في Vercel:

1. افتح: https://vercel.com/dashboard
2. اختار المشروع `wahtsapp2`
3. اذهب لـ **Logs**
4. ابحث عن: `shopify webhook`
5. شوف لو في errors

---

## ⚠️ ملاحظات مهمة

### 1. رقم الواتساب

لازم يكون رقم صحيح بالصيغة الدولية:
```
✅ صح: +201234567890
✅ صح: 201234567890
❌ غلط: 01234567890 (بدون كود الدولة)
```

### 2. Shopify Connection

تأكد إن Shopify متوصل بالبراند:
1. افتح الـ CRM
2. Settings → Shopify Integration
3. شوف لو في "Connected" ✅

### 3. WhatsApp Token

تأكد إن الـ Token شغال:
1. Settings → Profile & WhatsApp
2. شوف Token Status
3. لو expired، حدثه

---

## 🆘 لو لسه مش شغال

### تحقق من:

1. **Webhook URL صحيح؟**
   ```
   https://wahtsapp2.vercel.app/api/shopify/webhook-handler
   ```

2. **Shopify Shop URL صحيح في الداتابيز؟**
   - افتح Supabase
   - جدول `shopify_connections`
   - تأكد من `shop_url`

3. **Brand Phone ID موجود؟**
   - جدول `brands`
   - تأكد من `phone_number_id`

4. **WhatsApp Token شغال؟**
   - جرب تبعت رسالة من الـ CRM
   - لو اشتغلت، يبقى Token صح

---

## 📋 Webhook URL الصحيح

```
https://wahtsapp2.vercel.app/api/shopify/webhook-handler
```

**مش:**
- ~~https://wahtsapp2.vercel.app/api/webhook~~ (ده للـ WhatsApp)
- ~~https://wahtsapp2.vercel.app/api/shopify/send-order-confirmation~~ (ده internal)

---

## ✅ بعد ما تضيف الـ Webhook

1. اعمل test order جديد
2. ضع رقم واتساب صحيح
3. استنى 10-30 ثانية
4. الرسالة المفروض توصل على WhatsApp! 🎉
5. العميل يضغط "تأكيد"
6. كل حاجة تظهر في الـ CRM

---

**🚀 جرب دلوقتي!**
