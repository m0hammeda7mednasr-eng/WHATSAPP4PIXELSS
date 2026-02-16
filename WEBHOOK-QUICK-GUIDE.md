# 🚀 دليل سريع: تفعيل استقبال الرسائل

## الوضع الحالي:
- ✅ **الإرسال شغال** - الرسائل بتروح على WhatsApp
- ❌ **الاستقبال مش شغال** - الرسائل الواردة مش بتظهر

## السبب:
الـ **webhook** مش متسجل في Meta، فـ Meta مش بتبعت الرسائل الواردة للـ server بتاعك.

---

## ✅ الحل (5 دقائق):

### الخطوة 1: شغّل ngrok

**لو معندكش ngrok:**
1. نزّله من: https://ngrok.com/download
2. فك الضغط في أي مكان
3. (اختياري) سجّل حساب وفعّل authtoken

**شغّل ngrok:**

```bash
ngrok http 3001
```

**أو شغّل الملف:**
```bash
START-WEBHOOK.bat
```

---

### الخطوة 2: انسخ الـ URL

بعد ما ngrok يشتغل، هتشوف:

```
ngrok

Session Status                online
Forwarding                    https://1234-abcd-5678.ngrok-free.app -> http://localhost:3001
```

**انسخ الـ URL:** `https://1234-abcd-5678.ngrok-free.app`

⚠️ **مهم:** الـ URL ده بيتغير كل مرة تشغل ngrok (في Free plan)

---

### الخطوة 3: سجّل في Meta

1. **افتح:** https://developers.facebook.com/apps

2. **اختار الـ App** بتاعك

3. **من القائمة:** WhatsApp → **Configuration**

4. **في قسم "Webhook":**

   **Callback URL:**
   ```
   https://1234-abcd-5678.ngrok-free.app/webhook/whatsapp
   ```
   ⚠️ استبدل `1234-abcd-5678` بالـ URL بتاعك من ngrok!
   ⚠️ لازم يكون `https://` (مش `http://`)
   ⚠️ لازم ينتهي بـ `/webhook/whatsapp`

   **Verify Token:**
   ```
   whatsapp_crm_2024
   ```
   ⚠️ لازم يكون بالظبط كده (case-sensitive)

5. **اضغط:** "Verify and Save"

6. **لو نجح:**
   - هتشوف ✅ بجانب الـ URL
   - في الـ server logs هتشوف:
     ```
     🔐 Webhook verification request
     ✅ Webhook verified successfully!
     ```

---

### الخطوة 4: Subscribe to Messages

**في نفس الصفحة** (Configuration):

1. **لاقي:** "Webhook fields"
2. **اضغط:** "Subscribe" بجانب **messages**
3. **تأكد إن:** messages ✅ subscribed

---

## 🧪 اختبار:

### 1. ابعت رسالة من WhatsApp:

- افتح WhatsApp على موبايلك
- ابعت رسالة للـ WhatsApp Business number بتاعك
- مثال: "مرحباً! هذا اختبار"

### 2. شوف الـ server logs:

**المفروض تشوف:**
```
📨 Received WhatsApp webhook
📱 Message from: 201234567890
💬 Message: مرحباً! هذا اختبار
✅ Contact created/updated
✅ Message saved
```

### 3. شوف الرسالة في الـ App:

- افتح: http://localhost:5177
- المفروض تشوف الـ contact في القائمة
- اضغط عليه
- المفروض تشوف الرسالة! 🎉

---

## ⚠️ مشاكل شائعة:

### 1. Meta بتقول "URL not reachable"

**الأسباب:**
- ngrok مش شغال
- الـ webhook server مش شغال
- الـ URL غلط

**الحل:**
```bash
# تأكد إن الـ server شغال
curl http://localhost:3001/health

# تأكد إن ngrok شغال
curl https://your-ngrok-url.ngrok-free.app/health
```

### 2. Meta بتقول "Invalid verify token"

**الحل:** تأكد إنك كاتب: `whatsapp_crm_2024` بالظبط (case-sensitive)

### 3. الرسائل مش بتوصل

**الأسباب:**
- مش subscribed لـ messages
- الـ webhook URL اتغير (ngrok free بيغير الـ URL)

**الحل:**
- تأكد من subscription
- لو الـ ngrok URL اتغير، حدّث الـ URL في Meta

### 4. ngrok بيقول "ERR_NGROK_108"

**الحل:** محتاج authtoken
```bash
ngrok config add-authtoken YOUR_TOKEN
```

---

## 📊 بعد الـ Setup:

### ✅ **Full Two-Way Communication:**

```
العميل (WhatsApp) ←→ Your App ←→ الموظف
```

| الحدث | النتيجة |
|-------|---------|
| العميل يبعت رسالة على WhatsApp | ✅ تظهر في الـ App فوراً |
| الموظف يرد من الـ App | ✅ تروح للعميل على WhatsApp |
| محادثة كاملة | ✅ زي WhatsApp Web بالظبط! |
| Real-time | ✅ بدون refresh |

---

## 🎯 الخطوات السريعة:

```bash
# 1. شغّل ngrok
ngrok http 3001

# 2. انسخ الـ URL
# مثال: https://1234-abcd.ngrok-free.app

# 3. روح Meta Developer Console
# WhatsApp → Configuration → Webhook

# 4. حط:
# Callback URL: https://1234-abcd.ngrok-free.app/webhook/whatsapp
# Verify Token: whatsapp_crm_2024

# 5. اضغط Verify and Save

# 6. Subscribe to: messages

# 7. ابعت رسالة test من WhatsApp

# 8. شوف الرسالة في الـ App! 🎉
```

---

## 💡 للـ Production:

### مشكلة ngrok Free:
الـ URL بيتغير كل مرة، فلازم تحدّث الـ webhook في Meta كل مرة.

### الحلول:

1. **ngrok Paid** ($8/month) - URL ثابت
2. **Deploy على سيرفر** (Railway, Heroku, DigitalOcean)
3. **استخدم domain حقيقي** مع SSL

---

**محتاج مساعدة؟** قولي وأنا هساعدك خطوة بخطوة! 🚀
