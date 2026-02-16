# 🔗 دليل ربط n8n Webhook مع WhatsApp

## 1. إنشاء Workflow في n8n

### الخطوات:
1. افتح n8n وانشئ workflow جديد
2. ضيف **Webhook** node:
   - Method: `POST`
   - Path: `/whatsapp-send` (أو أي اسم تحبه)
   - Response Mode: `Immediately`

3. ضيف **WhatsApp** node (أو HTTP Request للـ WhatsApp API):
   - اربطه بالـ Webhook node
   - استخدم البيانات من الـ webhook

### البيانات اللي هتوصل من الـ App:
```json
{
  "phone": "+1234567890",
  "text": "نص الرسالة",
  "media_url": "https://...supabase.co/storage/v1/object/public/whatsapp-media/...",
  "media_type": "image/jpeg"
}
```

## 2. نسخ Webhook URL

بعد ما تعمل الـ Webhook node:
1. اضغط على الـ Webhook node
2. انسخ الـ **Production URL** (مش Test URL)
3. هيكون شكله كده: `https://your-n8n-instance.com/webhook/whatsapp-send`

## 3. حط الـ URL في الـ App

افتح ملف `.env` وحط الـ URL:
```env
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/whatsapp-send
```

## 4. مثال n8n Workflow

### Node 1: Webhook (Trigger)
- Method: POST
- Path: /whatsapp-send

### Node 2: Function (معالجة البيانات)
```javascript
const phone = $json.phone;
const text = $json.text;
const mediaUrl = $json.media_url;
const mediaType = $json.media_type;

return {
  phone: phone,
  message: text,
  media: mediaUrl ? {
    url: mediaUrl,
    type: mediaType
  } : null
};
```

### Node 3: HTTP Request (إرسال لـ WhatsApp API)
- Method: POST
- URL: `https://api.whatsapp.com/send` (أو API بتاعك)
- Body:
```json
{
  "to": "{{$json.phone}}",
  "text": "{{$json.message}}",
  "media": "{{$json.media}}"
}
```

## 5. اختبار الـ Integration

1. شغل الـ workflow في n8n
2. افتح الـ app على http://localhost:5177/
3. ابعت رسالة أو صورة
4. شوف الـ webhook في n8n - المفروض يستقبل البيانات

---

## 📝 ملاحظات:
- لو مش عايز تستخدم n8n دلوقتي، سيب الـ `VITE_N8N_WEBHOOK_URL` فاضي
- الـ app هيشتغل عادي بس مش هيبعت على WhatsApp
- الرسايل هتتسجل في الـ database عادي
