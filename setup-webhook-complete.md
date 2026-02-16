# 📡 إعداد Webhook لاستقبال الرسائل

## المشكلة:
لما العميل يرد على WhatsApp، الرسالة **مش بتظهر** في الـ chat.

## السبب:
الـ **webhook** مش متسجل في Meta، فـ Meta مش بتبعت الرسائل الواردة للـ server بتاعك.

---

## ✅ الحل الكامل:

### الخطوة 1: شغّل الـ Webhook Server

تأكد إن الـ server شغال:

```bash
npm run server
# أو
node server/webhook-server.js
```

المفروض تشوف:
```
🚀 WhatsApp Webhook Server is running!
📍 Local: http://localhost:3001
📍 Webhook: http://localhost:3001/webhook/whatsapp
```

---

### الخطوة 2: شغّل ngrok

ngrok بيعمل URL عام للـ server المحلي بتاعك.

#### لو معندكش ngrok:

1. **نزّله من:** https://ngrok.com/download
2. **فك الضغط**
3. **(اختياري) سجّل حساب** وفعّل authtoken:
   ```bash
   ngrok config add-authtoken YOUR_TOKEN
   ```

#### شغّل ngrok:

```bash
ngrok http 3001
```

**هيظهرلك:**
```
ngrok

Session Status                online
Account                       your-email (Plan: Free)
Forwarding                    https://1234-abcd-5678.ngrok-free.app -> http://localhost:3001

Connections                   ttl     opn     rt1
                              0       0       0.00
```

**انسخ الـ URL:** `https://1234-abcd-5678.ngrok-free.app`

⚠️ **مهم:** الـ URL ده بيتغير كل مرة تشغل ngrok (في Free plan)

---

### الخطوة 3: اختبر الـ Webhook

```bash
curl "https://your-ngrok-url.ngrok-free.app/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=whatsapp_crm_2024&hub.challenge=test123"
```

**المفروض يرجع:** `test123`

---

### الخطوة 4: سجّل الـ Webhook في Meta

1. **افتح:** https://developers.facebook.com/apps
2. **اختار الـ App** بتاعك
3. **من القائمة:** WhatsApp → **Configuration**
4. **في قسم "Webhook":**

   **Callback URL:**
   ```
   https://your-ngrok-url.ngrok-free.app/webhook/whatsapp
   ```
   ⚠️ استبدل `your-ngrok-url` بالـ URL من ngrok
   ⚠️ لازم يكون `https://` (مش `http://`)
   ⚠️ لازم ينتهي بـ `/webhook/whatsapp`

   **Verify Token:**
   ```
   whatsapp_crm_2024
   ```

5. **اضغط:** "Verify and Save"

6. **لو نجح التسجيل:**
   - هتشوف ✅ بجانب الـ URL
   - في الـ server logs هتشوف:
     ```
     🔐 Webhook verification request
     ✅ Webhook verified successfully!
     ```

---

### الخطوة 5: Subscribe to Messages

بعد ما الـ webhook يتسجل:

1. **في نفس الصفحة** (Configuration)
2. **لاقي:** "Webhook fields"
3. **اضغط:** "Subscribe" بجانب **messages**
4. **تأكد إن:** messages ✅ subscribed

---

## 🧪 اختبار:

### 1. ابعت رسالة من WhatsApp:

- افتح WhatsApp على موبايلك
- ابعت رسالة للـ WhatsApp Business number بتاعك
- شوف الـ server logs

**المفروض تشوف:**
```
📨 Received WhatsApp webhook
📱 Message from: 201234567890
💬 Message: مرحباً!
✅ Contact created/updated
✅ Message saved
```

### 2. شوف الرسالة في الـ App:

- افتح: http://localhost:5177
- المفروض تشوف الـ contact
- اضغط عليه
- المفروض تشوف الرسالة!

---

## ⚠️ مشاكل شائعة:

### 1. ngrok بيقول "ERR_NGROK_108"
**الحل:** محتاج authtoken
```bash
ngrok config add-authtoken YOUR_TOKEN
```

### 2. Meta بتقول "URL not reachable"
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

### 3. Meta بتقول "Invalid verify token"
**الحل:** تأكد إنك كاتب: `whatsapp_crm_2024` بالظبط (case-sensitive)

### 4. الرسائل مش بتوصل
**الأسباب:**
- مش subscribed لـ messages
- الـ webhook URL اتغير (ngrok free بيغير الـ URL)

**الحل:**
- تأكد من subscription
- لو الـ ngrok URL اتغير، حدّث الـ URL في Meta

---

## 💡 للـ Production:

### مشكلة ngrok Free:
الـ URL بيتغير كل مرة، فلازم تحدّث الـ webhook في Meta كل مرة.

### الحلول:

#### 1. ngrok Paid ($8/month)
- URL ثابت
- مفيش warning page
- أسرع

#### 2. Deploy على سيرفر:
- **Railway** (مجاني)
- **Heroku** (مجاني)
- **DigitalOcean** ($5/month)
- **AWS/Azure** (pay as you go)

#### 3. استخدم domain حقيقي:
- اشتري domain
- اعمل SSL certificate
- point للـ server بتاعك

---

## 📊 الخلاصة:

### قبل الـ Webhook:
```
✅ إرسال رسائل → WhatsApp
❌ استقبال رسائل من WhatsApp
```

### بعد الـ Webhook:
```
✅ إرسال رسائل → WhatsApp
✅ استقبال رسائل من WhatsApp
✅ الرسائل بتظهر في الـ chat فوراً
✅ Real-time updates
```

---

## 🚀 الخطوات السريعة:

```bash
# 1. شغّل الـ server
npm run server

# 2. في terminal تاني، شغّل ngrok
ngrok http 3001

# 3. انسخ الـ URL
# مثال: https://1234-abcd.ngrok-free.app

# 4. روح Meta Developer Console
# WhatsApp → Configuration → Webhook

# 5. حط:
# Callback URL: https://1234-abcd.ngrok-free.app/webhook/whatsapp
# Verify Token: whatsapp_crm_2024

# 6. اضغط Verify and Save

# 7. Subscribe to: messages

# 8. ابعت رسالة test من WhatsApp

# 9. شوف الرسالة في الـ App! 🎉
```

---

**محتاج مساعدة في أي خطوة؟** قولي وأنا هساعدك! 😊
