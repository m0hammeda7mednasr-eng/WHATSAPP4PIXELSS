# 🚀 دليل التشغيل المحلي - Local Development Guide

## ✅ المشروع يعمل الآن على localhost!

تم تشغيل نظام WhatsApp CRM بنجاح على الخادم المحلي.

## 🔗 الروابط المتاحة

### 🌐 الواجهة الأمامية:
```
http://localhost:3000
```

### 🔗 Webhook للاختبار:
```
http://localhost:3000/api/webhook
```

### 🧪 API للاختبار:
```
http://localhost:3000/api/test
```

## 🎯 كيفية الاستخدام

### 1. تشغيل الخادم:
```bash
# الطريقة الأولى
node run-local-server.js

# الطريقة الثانية
npm start

# الطريقة الثالثة
START-LOCAL.bat
```

### 2. اختبار النظام:
```bash
node test-local-server.js
```

### 3. إيقاف الخادم:
```
اضغط Ctrl+C في نافذة الخادم
```

## 🔧 إعدادات Webhook للاختبار المحلي

### Meta Business Manager:
- **Callback URL:** `http://localhost:3000/api/webhook`
- **Verify Token:** `whatsapp_crm_2024`
- **Subscribe to:** `messages`

⚠️ **ملاحظة:** هذا للاختبار المحلي فقط. للإنتاج استخدم Netlify.

## 📱 الميزات المتاحة

### ✅ ما يعمل الآن:
- 🌐 خدمة الملفات الثابتة
- 🔗 التحقق من Webhook
- 📨 معالجة الرسائل
- 🔘 معالجة النقر على الأزرار
- 🔄 CORS مُفعل
- ❌ معالجة الأخطاء
- 📊 Supabase متصل

### 📋 اختبار الرسائل:
```javascript
// رسالة نصية
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "value": {
        "metadata": { "phone_number_id": "test_phone_id" },
        "messages": [{
          "id": "test_message_123",
          "from": "201234567890",
          "timestamp": "1644444444",
          "type": "text",
          "text": { "body": "مرحبا!" }
        }]
      }
    }]
  }]
}
```

### 🔘 اختبار الأزرار:
```javascript
// نقر على زر
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "value": {
        "metadata": { "phone_number_id": "test_phone_id" },
        "messages": [{
          "id": "test_button_123",
          "from": "201234567890",
          "timestamp": "1644444444",
          "type": "interactive",
          "interactive": {
            "type": "button_reply",
            "button_reply": {
              "id": "confirm_order_123",
              "title": "تأكيد الطلب"
            }
          }
        }]
      }
    }]
  }]
}
```

## 🧪 اختبار سريع

### 1. اختبار الصفحة الرئيسية:
```bash
curl http://localhost:3000
```

### 2. اختبار API:
```bash
curl http://localhost:3000/api/test
```

### 3. اختبار Webhook:
```bash
curl "http://localhost:3000/api/webhook?hub.mode=subscribe&hub.verify_token=whatsapp_crm_2024&hub.challenge=test123"
```

### 4. اختبار رسالة:
```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"object":"whatsapp_business_account","entry":[{"changes":[{"value":{"metadata":{"phone_number_id":"test"},"messages":[{"id":"test","from":"201234567890","timestamp":"1644444444","type":"text","text":{"body":"مرحبا"}}]}}]}]}'
```

## 📊 مراقبة السجلات

الخادم يعرض سجلات مفصلة لجميع الطلبات:
- 📥 طلبات Webhook
- 💬 الرسائل المستلمة
- 🔘 النقر على الأزرار
- ✅ العمليات الناجحة
- ❌ الأخطاء

## 🔄 التطوير والتحديث

### تحديث الكود:
1. احفظ التغييرات
2. أعد تشغيل الخادم (Ctrl+C ثم node run-local-server.js)
3. اختبر التغييرات

### إضافة ميزات جديدة:
1. عدل `run-local-server.js`
2. أضف endpoints جديدة
3. اختبر باستخدام `test-local-server.js`

## 🚀 الانتقال للإنتاج

عندما تكون جاهزاً للنشر:

### 1. Netlify Deployment:
```bash
DEPLOY-NETLIFY-NOW.bat
```

### 2. تحديث Meta Webhook:
- غير URL من localhost إلى Netlify
- `https://your-site.netlify.app/.netlify/functions/webhook`

## 🎉 النظام جاهز!

✅ الخادم المحلي يعمل بشكل مثالي
✅ جميع endpoints تعمل
✅ Webhook جاهز للاختبار
✅ قاعدة البيانات متصلة
✅ جاهز لتكامل WhatsApp

**استمتع بالتطوير! 🚀**