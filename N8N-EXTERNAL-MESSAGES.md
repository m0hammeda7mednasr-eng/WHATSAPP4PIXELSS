# 📨 إرسال رسائل من n8n والظهور في الشات

## المشكلة
لما تبعت رسالة من **n8n** أو أي automation خارجي، الرسالة بتروح على WhatsApp بس **مش بتظهر في الشات** لأنها مش محفوظة في الـ database.

## الحل ✅
استخدم الـ **External Message API** الجديد اللي بيبعت الرسالة **ويحفظها في الـ database** في نفس الوقت!

---

## 🔗 API Endpoint

### URL:
```
POST http://localhost:3001/api/external-message
```

### Headers:
```json
{
  "Content-Type": "application/json"
}
```

### Body (JSON):
```json
{
  "phone_number": "201012345678",
  "message": "مرحباً! هذه رسالة من n8n",
  "message_type": "text",
  "brand_id": "uuid-here",
  "media_url": "https://example.com/image.jpg"
}
}
```

---

## 📋 Parameters

### Required (مطلوب):
- **phone_number** (string): رقم العميل
  - مثال: `"201012345678"` أو `"+201012345678"` أو `"01012345678"`
  - الـ API هينظف الرقم تلقائياً

- **message** (string): نص الرسالة
  - مثال: `"مرحباً! كيف حالك؟"`

### Optional (اختياري):
- **message_type** (string): نوع الرسالة
  - القيم: `"text"`, `"image"`, `"audio"`, `"video"`, `"document"`
  - Default: `"text"`

- **brand_id** (string): معرف البراند
  - لو مش موجود، هيستخدم أول brand في الـ database

- **phone_number_id** (string): Phone Number ID من Meta
  - بديل لـ brand_id
  - لو مش موجود، هيستخدم أول brand

- **media_url** (string): رابط الميديا (للصور/فيديو/صوت/مستندات)
  - مطلوب لو message_type مش text

---

## 🎯 أمثلة للاستخدام

### 1️⃣ رسالة نصية بسيطة
```json
{
  "phone_number": "201012345678",
  "message": "مرحباً! هذه رسالة تلقائية من النظام"
}
```

### 2️⃣ رسالة مع brand محدد
```json
{
  "phone_number": "201012345678",
  "message": "عرض خاص لك اليوم!",
  "brand_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

### 3️⃣ إرسال صورة
```json
{
  "phone_number": "201012345678",
  "message": "شوف الصورة دي",
  "message_type": "image",
  "media_url": "https://example.com/image.jpg"
}
```

### 4️⃣ إرسال صوت
```json
{
  "phone_number": "201012345678",
  "message": "رسالة صوتية",
  "message_type": "audio",
  "media_url": "https://example.com/audio.mp3"
}
```

---

## 🔧 إعداد n8n

### الخطوات:

#### 1️⃣ أضف HTTP Request Node
في الـ workflow بتاعك، أضف **HTTP Request** node

#### 2️⃣ اضبط الإعدادات:
- **Method:** POST
- **URL:** `http://localhost:3001/api/external-message`
- **Authentication:** None
- **Body Content Type:** JSON

#### 3️⃣ أضف الـ Body:
```json
{
  "phone_number": "{{ $json.phone }}",
  "message": "{{ $json.message }}",
  "message_type": "text"
}
```

#### 4️⃣ اختبر الـ workflow
اضغط **Execute Node** وتأكد إن الرسالة:
- ✅ اتبعتت على WhatsApp
- ✅ ظهرت في الشات
- ✅ محفوظة في الـ database

---

## 📱 Response (الرد)

### Success Response:
```json
{
  "success": true,
  "message_id": "uuid-of-message",
  "wa_message_id": "wamid.xxx",
  "contact_id": "uuid-of-contact",
  "brand_id": "uuid-of-brand",
  "message": "Message sent and saved successfully"
}
```

### Error Response:
```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## 🚀 للـ Production (Railway)

لما ترفع الـ backend على Railway، غيّر الـ URL:

```
POST https://your-app.railway.app/api/external-message
```

---

## 🔍 Troubleshooting

### المشكلة: "Brand not found"
**الحل:** تأكد إن عندك brand في الـ database أو حدد `brand_id` في الـ request

### المشكلة: "WhatsApp token not configured"
**الحل:** روح Settings في الـ app وضيف الـ WhatsApp Token للـ brand

### المشكلة: "Failed to send message to WhatsApp"
**الحل:** 
- تأكد إن الـ Token صحيح وما انتهاش
- تأكد إن الـ Phone Number ID صحيح
- تأكد إن رقم العميل صحيح

### المشكلة: الرسالة اتبعتت بس مش ظاهرة في الشات
**الحل:** 
- تأكد إنك بتستخدم `/api/external-message` مش `/api/send-message`
- افتح الـ console في الـ backend وشوف الـ logs
- تأكد إن الـ Realtime شغال في Supabase

---

## 💡 نصائح

1. **احفظ الـ brand_id** في n8n عشان تستخدمه في كل الرسائل
2. **استخدم الـ response** عشان تتأكد إن الرسالة اتبعتت
3. **اعمل error handling** في n8n لو الرسالة فشلت
4. **اختبر محلياً** قبل ما ترفع على production

---

## 📊 مثال كامل لـ n8n Workflow

```json
{
  "nodes": [
    {
      "name": "Trigger",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300]
    },
    {
      "name": "Send WhatsApp",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 300],
      "parameters": {
        "method": "POST",
        "url": "http://localhost:3001/api/external-message",
        "jsonParameters": true,
        "options": {},
        "bodyParametersJson": "{\n  \"phone_number\": \"{{ $json.phone }}\",\n  \"message\": \"{{ $json.message }}\",\n  \"message_type\": \"text\"\n}"
      }
    }
  ],
  "connections": {
    "Trigger": {
      "main": [[{ "node": "Send WhatsApp", "type": "main", "index": 0 }]]
    }
  }
}
```

---

## ✅ الخلاصة

بعد استخدام الـ **External Message API**:
- ✅ الرسائل من n8n هتظهر في الشات
- ✅ الرسائل هتتحفظ في الـ database
- ✅ Real-time updates هتشتغل تلقائياً
- ✅ الـ contact هيتحدث تلقائياً

**جرب دلوقتي وشوف الفرق! 🚀**
