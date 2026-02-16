# 🔗 دليل ربط WhatsApp Webhook

## 📋 الخطوات المطلوبة:

### 1️⃣ تشغيل ngrok (لعمل URL عام)

لأن localhost مش متاح من الإنترنت، محتاج تستخدم ngrok:

```bash
# حمّل ngrok من: https://ngrok.com/download
# بعد التحميل، شغّل:
ngrok http 3001
```

هيديك URL زي: `https://xxxx-xx-xx-xx-xx.ngrok-free.app`

---

### 2️⃣ تسجيل الـ Webhook في Meta

1. **افتح Meta Developer Console:**
   👉 https://developers.facebook.com/apps

2. **اختر تطبيقك** (أو أنشئ واحد جديد)

3. **اذهب إلى: WhatsApp → Configuration**

4. **في قسم Webhook:**
   - **Callback URL**: `https://your-ngrok-url.ngrok-free.app/webhook/whatsapp`
   - **Verify Token**: `whatsapp_crm_2024`
   - اضغط **Verify and Save**

5. **Subscribe to webhook fields:**
   - ✅ messages
   - ✅ message_status (اختياري)

---

### 3️⃣ اختبار الـ Webhook

1. **ابعت رسالة من موبايلك** لرقم WhatsApp Business

2. **شوف الـ backend logs** في Terminal:
   ```
   📨 Received WhatsApp webhook
   📱 Message from: 201234567890
   💬 Message: مرحباً
   ✅ Message saved
   ```

3. **حدّث صفحة المتصفح** (F5) وهتشوف الرسالة ظهرت!

---

## 🔧 معلومات مهمة:

### Webhook URL:
```
https://your-ngrok-url.ngrok-free.app/webhook/whatsapp
```

### Verify Token:
```
whatsapp_crm_2024
```

### Phone Number ID:
- موجود في Meta Developer Console
- WhatsApp → API Setup → Phone Number ID
- حطه في Settings في البراند بتاعك

---

## 🐛 حل المشاكل:

### "Webhook verification failed"
- تأكد إن الـ Verify Token = `whatsapp_crm_2024`
- تأكد إن ngrok شغال
- تأكد إن الـ backend شغال على port 3001

### "Brand not found"
- تأكد إن الـ `phone_number_id` في database نفسه اللي في Meta
- شوف Settings → WhatsApp Brands → Phone Number ID

### "Webhook مش بيوصل"
- تأكد إن ngrok شغال: `curl https://your-ngrok-url.ngrok-free.app/health`
- شوف ngrok logs: في terminal ngrok
- تأكد إن الـ URL مسجل صح في Meta

---

## 📝 ملاحظات:

- ✅ ngrok URL بيتغير كل مرة تشغله (لو مش مشترك في النسخة المدفوعة)
- ✅ لازم تحدّث الـ URL في Meta كل مرة
- ✅ للـ production، استخدم domain ثابت (Railway, Heroku, VPS)

---

## 🚀 الخطوات التالية:

بعد ما الـ webhook يشتغل:
1. ✅ هتستقبل رسائل من العملاء تلقائياً
2. ✅ هتقدر ترد عليهم من الـ dashboard
3. ✅ كل الرسائل هتتحفظ في database

---

✅ **الـ webhook جاهز!** 🎉
