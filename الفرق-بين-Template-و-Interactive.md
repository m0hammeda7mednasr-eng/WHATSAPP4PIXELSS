# 📊 الفرق بين Template Messages و Interactive Messages

## 🎯 نظرة عامة

### Template Messages (من Meta)
رسائل معتمدة مسبقاً من Meta، تسمح لك ببدء المحادثة مع العميل.

### Interactive Messages
رسائل عادية مع أزرار، لكن تحتاج العميل يبدأ المحادثة أولاً.

---

## 📋 جدول المقارنة الشامل

| الميزة | Template Message | Interactive Message |
|--------|-----------------|-------------------|
| **الموافقة من Meta** | ✅ يحتاج موافقة | ❌ لا يحتاج |
| **وقت الموافقة** | 24-48 ساعة | فوري |
| **البدء بالمحادثة** | ✅ يمكنك البدء | ❌ العميل يبدأ |
| **التكلفة** | 🆓 مجاني | 💰 يُحسب كرسالة |
| **التعديل** | صعب (موافقة جديدة) | سهل (فوري) |
| **عدد الأزرار** | حتى 3 أزرار | حتى 3 أزرار |
| **نوع الـ Webhook** | `button` | `interactive` |
| **الـ Payload Path** | `messages.button.payload` | `messages.interactive.button_reply.id` |

---

## 🔧 التفاصيل التقنية

### 1. Template Message Structure

#### إرسال الرسالة:
```javascript
{
  messaging_product: 'whatsapp',
  to: '201234567890',
  type: 'template',
  template: {
    name: 'moon2',
    language: { code: 'en' },
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: 'أحمد محمد' },
          { type: 'text', text: '1234' },
          { type: 'text', text: 'منتج 1, منتج 2' },
          { type: 'text', text: '500 EGP' }
        ]
      },
      {
        type: 'button',
        sub_type: 'quick_reply',
        index: 0,
        parameters: [
          { type: 'payload', payload: 'confirm_1234' }
        ]
      },
      {
        type: 'button',
        sub_type: 'quick_reply',
        index: 1,
        parameters: [
          { type: 'payload', payload: 'cancel_1234' }
        ]
      }
    ]
  }
}
```

#### استقبال الرد (Webhook):
```javascript
{
  messages: [
    {
      type: 'button',
      button: {
        payload: 'confirm_1234',
        text: 'تأكيد الطلب ✅'
      }
    }
  ]
}
```

---

### 2. Interactive Message Structure

#### إرسال الرسالة:
```javascript
{
  messaging_product: 'whatsapp',
  to: '201234567890',
  type: 'interactive',
  interactive: {
    type: 'button',
    body: {
      text: 'مرحباً أحمد محمد 👋\n\nتم استلام طلبك رقم #1234...'
    },
    action: {
      buttons: [
        {
          type: 'reply',
          reply: {
            id: 'confirm_1234',
            title: 'تأكيد الطلب ✅'
          }
        },
        {
          type: 'reply',
          reply: {
            id: 'cancel_1234',
            title: 'إلغاء الطلب ❌'
          }
        }
      ]
    }
  }
}
```

#### استقبال الرد (Webhook):
```javascript
{
  messages: [
    {
      type: 'interactive',
      interactive: {
        type: 'button_reply',
        button_reply: {
          id: 'confirm_1234',
          title: 'تأكيد الطلب ✅'
        }
      }
    }
  ]
}
```

---

## 🎨 كيفية إنشاء Template في Meta

### الخطوات:
1. **ادخل على Meta Business Manager**
   - https://business.facebook.com/

2. **اختر WhatsApp Manager**
   - من القائمة الجانبية

3. **اضغط على Message Templates**
   - Create Template

4. **املأ البيانات:**
   - **Name**: `moon2` (أو أي اسم تختاره)
   - **Category**: `UTILITY` (للطلبات)
   - **Language**: `English` أو `Arabic`

5. **أضف الـ Body:**
```
مرحباً {{1}} 👋

تم استلام طلبك بنجاح! 🎉

📦 رقم الطلب: {{2}}
💰 الإجمالي: {{4}}

📋 المنتجات:
{{3}}

برجاء تأكيد الطلب للمتابعة في عملية الشحن.
```

6. **أضف الأزرار:**
   - Button 1: `تأكيد الطلب ✅` (Quick Reply)
   - Button 2: `إلغاء الطلب ❌` (Quick Reply)

7. **اضغط Submit**
   - انتظر الموافقة (24-48 ساعة)

---

## ⚙️ الإعدادات في النظام

### في Settings → Template Settings:

#### لاستخدام Template:
```
✅ Use Template Message: مفعّل
📝 Template Name: moon2
🌍 Template Language: en
```

#### لاستخدام Interactive:
```
❌ Use Template Message: معطّل
```

---

## 🔄 كيف يعمل النظام

### عند إرسال رسالة طلب:

```javascript
// في api/shopify/send-order-confirmation.js

if (brand.use_template && brand.template_name) {
  // ✅ استخدم Template Message
  messageType = 'template';
  // ... إرسال template
} else {
  // ✅ استخدم Interactive Message
  messageType = 'interactive';
  // ... إرسال interactive
}
```

### عند استقبال رد من العميل:

```javascript
// في api/webhook/whatsapp.js

if (message_type === 'button') {
  // ✅ رد من Template Message
  const buttonPayload = messages.button?.payload;
  await handleButtonClick(buttonPayload, wa_id, phone_number_id);
  
} else if (message_type === 'interactive') {
  // ✅ رد من Interactive Message
  const buttonId = messages.interactive?.button_reply?.id;
  await handleButtonClick(buttonId, wa_id, phone_number_id);
}
```

---

## 💡 متى تستخدم أيهما؟

### استخدم Template Messages إذا:
- ✅ تريد إرسال رسائل تلقائية للعملاء الجدد
- ✅ تريد توفير التكاليف (مجاني)
- ✅ عندك وقت للانتظار للموافقة
- ✅ الرسالة ثابتة ومش محتاجة تعديل كتير

### استخدم Interactive Messages إذا:
- ✅ العميل بدأ المحادثة معاك
- ✅ محتاج تعديل الرسائل بسرعة
- ✅ مش عايز تنتظر موافقة Meta
- ✅ محتاج مرونة في التعديل

---

## 🧪 اختبار النظام

### 1. اختبار Template:
```bash
# في Settings → Template Settings
✅ Use Template: مفعّل
📝 Template Name: moon2
🌍 Language: en

# اعمل طلب من Shopify
# هيتبعت Template Message
```

### 2. اختبار Interactive:
```bash
# في Settings → Template Settings
❌ Use Template: معطّل

# اعمل طلب من Shopify
# هيتبعت Interactive Message
```

---

## 🎉 النتيجة

الآن النظام يدعم الاثنين:
- ✅ Template Messages (معتمدة من Meta)
- ✅ Interactive Messages (عادية)

ويمكنك التبديل بينهم من الإعدادات بكل سهولة!

---

## 📞 الدعم

إذا واجهت مشكلة:
1. تأكد من اسم الـ Template صحيح
2. تأكد من اللغة مطابقة
3. تأكد من الـ Template معتمد في Meta
4. شوف الـ Logs في Vercel

---
تم التحديث: ${new Date().toLocaleString('ar-EG')}
