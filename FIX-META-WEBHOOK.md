# 🔧 حل مشكلة Meta Webhook Verification

## المشكلة

Meta بتقول: **"The callback URL or verify token couldn't be validated"**

## السبب

Meta مش قادرة توصل لـ `http://localhost:3001` لأنه على جهازك المحلي!

---

## ✅ الحل الصحيح

### الخطوة 1: شغّل ngrok

**لو معندكش ngrok:**

1. نزّله من: https://ngrok.com/download
2. فك الضغط
3. (اختياري) سجّل حساب وفعّل الـ authtoken:
   ```bash
   ngrok config add-authtoken YOUR_TOKEN
   ```

**شغّل ngrok:**

```bash
ngrok http 3001
```

### الخطوة 2: انسخ الـ URL

بعد ما تشغل ngrok، هيظهرلك:

```
ngrok

Session Status                online
Account                       your-email (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       50ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://1234-abcd-5678.ngrok-free.app -> http://localhost:3001

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**انسخ الـ URL:** `https://1234-abcd-5678.ngrok-free.app`

### الخطوة 3: اختبر الـ URL

```bash
curl "https://1234-abcd-5678.ngrok-free.app/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=whatsapp_crm_2024&hub.challenge=test123"
```

المفروض يرجع: `test123`

### الخطوة 4: سجّل في Meta

الآن روح Meta Developer Console:

1. **Callback URL**: `https://1234-abcd-5678.ngrok-free.app/webhook/whatsapp`
   - ⚠️ **مهم:** استبدل `1234-abcd-5678` بالـ URL بتاعك!
   - ⚠️ **مهم:** لازم يكون `https://` مش `http://`
   - ⚠️ **مهم:** لازم ينتهي بـ `/webhook/whatsapp`

2. **Verify Token**: `whatsapp_crm_2024`
   - ⚠️ **مهم:** لازم يكون بالظبط كده (case-sensitive)

3. اضغط **"Verify and Save"**

---

## 🧪 اختبار

### اختبار 1: Local

```bash
curl "http://localhost:3001/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=whatsapp_crm_2024&hub.challenge=test123"
```

**النتيجة المتوقعة:** `test123`

### اختبار 2: ngrok

```bash
curl "https://your-ngrok-url.ngrok-free.app/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=whatsapp_crm_2024&hub.challenge=test123"
```

**النتيجة المتوقعة:** `test123`

### اختبار 3: Meta

بعد ما تسجل في Meta، اضغط "Verify and Save"

**النتيجة المتوقعة:** ✅ Success

---

## 🐛 لو لسه مش شغال

### المشكلة 1: ngrok بيقول "ERR_NGROK_108"

**السبب:** مفيش authtoken

**الحل:**
```bash
# سجّل على https://dashboard.ngrok.com/signup
# انسخ الـ authtoken
ngrok config add-authtoken YOUR_TOKEN
```

### المشكلة 2: ngrok بيقول "connection refused"

**السبب:** الـ webhook server مش شغال

**الحل:**
```bash
# تأكد إن الـ server شغال
curl http://localhost:3001/health

# لو مش شغال، شغّله
npm run server
```

### المشكلة 3: Meta بتقول "Invalid verify token"

**السبب:** الـ token غلط

**الحل:**
- تأكد إنك كاتب: `whatsapp_crm_2024`
- مفيش مسافات قبل أو بعد
- case-sensitive (حروف كبيرة وصغيرة مهمة)

### المشكلة 4: Meta بتقول "URL not reachable"

**الأسباب المحتملة:**

1. **ngrok مش شغال:**
   ```bash
   # شغّله تاني
   ngrok http 3001
   ```

2. **الـ URL غلط:**
   - تأكد إنك حاطط الـ URL الصح من ngrok
   - لازم يكون `https://` مش `http://`
   - لازم ينتهي بـ `/webhook/whatsapp`

3. **Firewall بيبلوك ngrok:**
   - جرّب تقفل الـ antivirus مؤقتاً
   - أو استخدم VPN

### المشكلة 5: ngrok بيقول "ngrok-free.app" warning

**السبب:** Free plan بيعرض warning page

**الحل:**
- اضغط "Visit Site" في الـ warning page
- أو upgrade لـ paid plan ($8/month)
- أو استخدم بديل زي localtunnel

---

## 🔍 Debug Mode

### شوف الـ ngrok logs

ngrok بيوفر web interface على:
```
http://127.0.0.1:4040
```

من هناك تقدر تشوف:
- كل الـ requests اللي جاية من Meta
- الـ response بتاعك
- أي errors

### شوف الـ server logs

في الـ terminal اللي شغال فيه `npm run server`، هتشوف:

```
🔐 Webhook verification request
Mode: subscribe
Token: whatsapp_crm_2024
✅ Webhook verified successfully!
```

---

## 📝 Checklist

قبل ما تسجل في Meta، تأكد من:

- [ ] الـ webhook server شغال (`npm run server`)
- [ ] ngrok شغال (`ngrok http 3001`)
- [ ] الـ local test شغال (curl localhost)
- [ ] الـ ngrok test شغال (curl ngrok-url)
- [ ] الـ URL صحيح (https + /webhook/whatsapp)
- [ ] الـ token صحيح (whatsapp_crm_2024)

---

## 🎯 الخطوات بالترتيب

```bash
# 1. شغّل الـ webhook server
npm run server

# 2. في terminal تاني، شغّل ngrok
ngrok http 3001

# 3. انسخ الـ ngrok URL
# مثال: https://1234-abcd.ngrok-free.app

# 4. اختبر
curl "https://1234-abcd.ngrok-free.app/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=whatsapp_crm_2024&hub.challenge=test"

# 5. لو رجع "test"، روح Meta وسجّل:
# Callback URL: https://1234-abcd.ngrok-free.app/webhook/whatsapp
# Verify Token: whatsapp_crm_2024
```

---

## 🚀 بعد النجاح

بعد ما Meta تقبل الـ webhook:

1. **Subscribe to messages:**
   - في نفس الصفحة
   - Webhook fields > Subscribe to: `messages`

2. **اختبر استقبال رسالة:**
   - ابعت رسالة من WhatsApp
   - شوف الـ logs في الـ server
   - شوف الرسالة في الـ app

3. **اختبر إرسال رسالة:**
   - افتح الـ React app
   - ابعت رسالة
   - تأكد إنها وصلت على WhatsApp

---

## 💡 نصيحة للـ Production

ngrok Free بيغير الـ URL كل مرة. للـ production:

1. **استخدم ngrok Paid** ($8/month) - URL ثابت
2. **أو Deploy على سيرفر:**
   - Railway (مجاني)
   - Heroku (مجاني)
   - DigitalOcean ($5/month)
3. **استخدم domain حقيقي** مع HTTPS

---

**🎉 بالتوفيق!**
