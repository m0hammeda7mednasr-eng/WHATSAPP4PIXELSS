# ✅ استخدام Template "moon2"

## الوضع الحالي

✅ عملت Template في Meta اسمه "moon2"
✅ الـ Template معتمد (Active)
✅ فيه 7 متغيرات (Variables)
✅ فيه Quick Reply Buttons

---

## 🔧 الخطوات للتفعيل

### الخطوة 1: حدث WhatsApp Token

**مهم جداً!** Token انتهى الساعة 6:00 PM

1. افتح: https://developers.facebook.com/apps
2. اختار App بتاعك
3. WhatsApp → API Setup
4. انسخ **Temporary access token**
5. افتح الـ CRM: https://wahtsapp2.vercel.app
6. Settings → Profile & WhatsApp
7. Edit البراند "4 Pixels"
8. الصق Token الجديد
9. Save ✅

---

### الخطوة 2: فعل الـ Template في الـ CRM

1. افتح الـ CRM: https://wahtsapp2.vercel.app
2. Settings → **Message Templates** 💬
3. املأ الإعدادات:

```
✅ استخدام Template Message: مفعل (ON)
Template Name: moon2
Language: English (en)
Brand Emoji: 🌙
Welcome Message: أهلاً بك في 4 Pixels
Confirmation Message: تم تأكيد طلبك بنجاح!
Cancellation Message: تم إلغاء طلبك.
```

4. اضغط **حفظ الإعدادات** 💾

---

### الخطوة 3: شغل SQL في Supabase (لو مش مشغله)

1. افتح: https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/editor

2. انسخ والصق:

```sql
ALTER TABLE messages ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES shopify_orders(id);
CREATE INDEX IF NOT EXISTS idx_messages_order_id ON messages(order_id);

ALTER TABLE brands ADD COLUMN IF NOT EXISTS template_name TEXT DEFAULT 'moon2';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS template_language TEXT DEFAULT 'en';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS use_template BOOLEAN DEFAULT true;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS brand_emoji TEXT DEFAULT '🌙';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS welcome_message TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS confirmation_message TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS cancellation_message TEXT;
```

3. اضغط **RUN** ✅

---

### الخطوة 4: استنى Vercel Deployment

Vercel بيعمل deploy تلقائي (2-3 دقايق)

تحقق من: https://vercel.com/dashboard

---

### الخطوة 5: اعمل Test Order

1. اعمل test order في Shopify
2. ضع رقم واتساب صحيح
3. استنى 10-30 ثانية
4. شوف WhatsApp - الرسالة هتوصل من الـ Template! ✅
5. اضغط "تأكيد الطلب"
6. هترجعلك رسالة تأكيد ✅

---

## 📋 الـ Template Variables

الـ Template "moon2" فيه 7 متغيرات:

```
{{1}} = رقم الطلب (Order Number)
{{2}} = القطع (Products List)
{{3}} = المجموع الفرعي (Subtotal)
{{4}} = مصاريف الشحن (Shipping Cost)
{{5}} = الإجمالي (Total)
{{6}} = اسم المستلم (Customer Name)
{{7}} = العنوان (Address)
```

السيستم بيملأ المتغيرات دي تلقائي من بيانات الأوردر.

---

## 🎯 الفرق بين Template و Interactive

### Template Message (moon2):
```
✅ معتمد من Meta
✅ يقدر يبعت للعميل أول مرة
✅ الـ buttons بتشتغل
✅ مناسب للـ production
✅ بيستخدم Quick Reply Buttons
```

### Interactive Message (Fallback):
```
⚠️ محتاج العميل يبدأ المحادثة الأول
✅ مش محتاج موافقة
✅ بيشتغل فوراً
✅ مناسب للـ testing
```

---

## 🔄 الـ Flow الكامل

```
1. Order في Shopify
   ↓
2. Shopify Webhook → السيستم
   ↓
3. السيستم يقرأ Template Settings من database
   ↓
4. يحاول يبعت Template "moon2"
   ↓
5. لو Template شغال → يبعته ✅
   لو Template فشل → يبعت Interactive Message
   ↓
6. الرسالة توصل للعميل مع buttons
   ↓
7. العميل يضغط "تأكيد الطلب"
   ↓
8. WhatsApp Webhook → السيستم
   ↓
9. السيستم يبعت رسالة تأكيد
   ↓
10. يحدث Order status في Shopify
    ↓
11. كل حاجة تظهر في الـ CRM ✅
```

---

## 📱 مثال على الرسالة

```
🧾 رقم الطلب: #1004
🧣 القطع: 
▫️ Teddy Sofa Love Seat - Off white 2 (عدد: 1)

💰 المجموع: 19500 EGP
🚚 الشحن: 118 EGP
💵 الإجمالي: 22348 EGP

👤 المستلم: Mohammed Ahmed
🏠 العنوان: Cairo, Maadi

📩 هل نعتمد الطلب؟

[تأكيد الطلب] [إلغاء الطلب]
```

---

## ⚠️ ملاحظات مهمة

### 1. Template Name
- لازم يكون **بالظبط** زي ما في Meta
- Case-sensitive (moon2 ≠ Moon2)
- مفيش مسافات

### 2. Template Language
- لازم يطابق اللغة في Meta
- moon2 = English (en)
- لو غيرت اللغة، غير في الـ CRM كمان

### 3. Quick Reply Buttons
- الـ Template بيستخدم Quick Reply Buttons
- مش Interactive Buttons
- بيشتغلوا نفس الطريقة

### 4. Fallback
- لو الـ Template فشل، السيستم بيستخدم Interactive Message تلقائي
- مش هتخسر أي رسالة

---

## 🆘 لو حصلت مشكلة

### المشكلة: Template مش بيبعت

**الحل:**
1. تأكد إن Template Name صح: `moon2`
2. تأكد إن Language صح: `en`
3. تأكد إن Token محدث
4. شوف Vercel Logs للأخطاء

### المشكلة: Buttons مش شغالة

**الحل:**
1. تأكد إن WhatsApp Webhook متوصل
2. Callback URL: `https://wahtsapp2.vercel.app/api/webhook`
3. Verify Token: `whatsapp_crm_2024`
4. Subscribe to: messages

---

## ✅ الخلاصة

**التحديثات:**
- ✅ السيستم بيستخدم Template "moon2"
- ✅ بيملأ الـ 7 متغيرات تلقائي
- ✅ لو Template فشل، بيستخدم Interactive Message
- ✅ الـ buttons بتشتغل
- ✅ كل حاجة بتتحفظ في الـ CRM

**المطلوب منك:**
1. حدث WhatsApp Token
2. فعل Template في Settings
3. شغل SQL في Supabase
4. استنى Vercel deployment
5. اعمل test order
6. كل حاجة هتشتغل! 🎉

---

**🚀 جاهز للتجربة!**
