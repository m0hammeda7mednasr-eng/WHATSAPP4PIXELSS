# 🎯 الدليل الكامل - من الصفر للنهاية

## 📋 المحتويات

1. [التحضيرات](#التحضيرات)
2. [تنزيل ngrok](#تنزيل-ngrok)
3. [تشغيل النظام](#تشغيل-النظام)
4. [التسجيل في Meta](#التسجيل-في-meta)
5. [الاختبار](#الاختبار)

---

## 1️⃣ التحضيرات

### ✅ تأكد إن عندك:

- [x] Node.js مثبت
- [x] npm مثبت
- [x] الـ dependencies مثبتة (`npm install`)
- [x] ملف `.env` معمول ومملوء
- [x] Database setup مشغول في Supabase
- [x] Brand مضاف في الـ database

### اختبر:

```bash
# تأكد إن Node.js شغال
node --version

# تأكد إن npm شغال
npm --version

# تأكد إن الـ dependencies مثبتة
npm list express
```

---

## 2️⃣ تنزيل ngrok

### الطريقة السريعة:

1. **شغّل الملف:**
   ```bash
   download-ngrok.bat
   ```
   ده هيفتحلك صفحة التنزيل

2. **أو روح يدوياً:**
   - افتح: https://ngrok.com/download
   - اختار **Windows (64-bit)**
   - نزّل الملف

3. **فك الضغط:**
   - فك الضغط في `C:\ngrok`
   - أو أي مكان سهل تفتكره

4. **اختبر:**
   ```bash
   cd C:\ngrok
   ngrok version
   ```

### (اختياري) سجّل حساب:

1. روح: https://dashboard.ngrok.com/signup
2. سجّل بالـ email
3. انسخ الـ **Authtoken**
4. فعّله:
   ```bash
   cd C:\ngrok
   ngrok config add-authtoken YOUR_TOKEN_HERE
   ```

---

## 3️⃣ تشغيل النظام

### Terminal 1: Webhook Server

```bash
npm run server
```

**المفروض تشوف:**
```
🚀 WhatsApp Webhook Server is running!
📍 Local: http://localhost:3001
📍 Webhook: http://localhost:3001/webhook/whatsapp
```

### Terminal 2: React App (اختياري)

```bash
npm run dev
```

**المفروض تشوف:**
```
VITE ready in 500 ms
➜  Local:   http://localhost:5173/
```

### Terminal 3: ngrok

```bash
cd C:\ngrok
ngrok http 3001
```

**المفروض تشوف:**
```
Forwarding    https://1234-abcd.ngrok-free.app -> http://localhost:3001
```

**انسخ الـ URL:** `https://1234-abcd.ngrok-free.app`

---

## 4️⃣ التسجيل في Meta

### الخطوة 1: اختبر الـ URL

قبل ما تسجل في Meta، اختبر:

```bash
curl "https://1234-abcd.ngrok-free.app/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=whatsapp_crm_2024&hub.challenge=test"
```

**المفروض يرجع:** `test`

### الخطوة 2: روح Meta Developer Console

1. افتح: https://developers.facebook.com/
2. اختار الـ App بتاعك
3. من الـ sidebar: **WhatsApp** > **Configuration**

### الخطوة 3: املأ البيانات

في قسم **Webhook**:

- **Callback URL**: `https://1234-abcd.ngrok-free.app/webhook/whatsapp`
  - ⚠️ استبدل `1234-abcd` بالـ URL بتاعك من ngrok
  - ⚠️ لازم يكون `https://` مش `http://`
  - ⚠️ لازم ينتهي بـ `/webhook/whatsapp`

- **Verify Token**: `whatsapp_crm_2024`
  - ⚠️ لازم يكون بالظبط كده (case-sensitive)

### الخطوة 4: Verify

اضغط **"Verify and Save"**

**المفروض تشوف:** ✅ Success

### الخطوة 5: Subscribe to Messages

في نفس الصفحة:

1. **Webhook fields**
2. اضغط **Subscribe**
3. اختار: **messages**

---

## 5️⃣ الاختبار

### اختبار 1: استقبال رسالة

1. ابعت رسالة من WhatsApp للرقم اللي سجلته
2. شوف الـ logs في Terminal 1 (webhook server)
3. المفروض تشوف:
   ```
   📨 Received WhatsApp webhook
   📱 Message from: +1234567890
   ✅ Brand found: Brand Name
   ✅ Contact created/updated
   ✅ Message saved
   ```

4. افتح React App (`http://localhost:5173`)
5. المفروض تشوف الرسالة

### اختبار 2: إرسال رسالة

1. افتح React App
2. اختار contact
3. اكتب رسالة وابعتها
4. المفروض توصل على WhatsApp

### اختبار 3: Real-time Updates

1. ابعت رسالة من WhatsApp
2. شوف الـ React App
3. المفروض الرسالة تظهر فوراً (بدون refresh)

---

## 📊 مراقبة النظام

### ngrok Web Interface

افتح في المتصفح:
```
http://127.0.0.1:4040
```

هتشوف:
- كل الـ requests اللي جاية من Meta
- الـ response بتاعك
- أي errors

### Server Logs

في Terminal 1، هتشوف كل حاجة:
- Webhook requests
- Database operations
- Errors

### Supabase Dashboard

روح Supabase Dashboard وشوف:
- جدول `contacts` - الـ contacts الجديدة
- جدول `messages` - الرسائل
- جدول `brands` - الـ brands

---

## 🐛 حل المشاكل

### المشكلة: Meta بتقول "URL not reachable"

**الحلول:**

1. **تأكد إن ngrok شغال:**
   ```bash
   # في terminal ngrok، المفروض تشوف:
   Forwarding    https://xxxx.ngrok-free.app -> http://localhost:3001
   ```

2. **تأكد إن الـ webhook server شغال:**
   ```bash
   curl http://localhost:3001/health
   ```

3. **اختبر الـ ngrok URL:**
   ```bash
   curl "https://your-ngrok-url.ngrok-free.app/health"
   ```

4. **تأكد إن الـ URL صح في Meta:**
   - لازم يكون `https://`
   - لازم ينتهي بـ `/webhook/whatsapp`

### المشكلة: "Brand not found"

**الحل:**

```sql
-- في Supabase SQL Editor
-- شوف الـ brands
SELECT * FROM brands;

-- تأكد إن الـ phone_number_id صح
-- لازم يكون نفسه اللي في Meta Business Manager
```

### المشكلة: "Failed to send message"

**الحلول:**

1. **تأكد إن الـ whatsapp_token صح:**
   ```sql
   -- حدّث الـ token
   UPDATE brands 
   SET whatsapp_token = 'EAA-new-token-here'
   WHERE id = 'brand-uuid';
   ```

2. **تأكد إن عندك permissions في Meta:**
   - روح Meta Developer Console
   - App Roles > Add Testers
   - أضف رقمك

3. **تأكد إن الرقم verified:**
   - Meta Business Manager
   - WhatsApp Accounts
   - تأكد إن الرقم مسجل

### المشكلة: ngrok بيقول "ERR_NGROK_108"

**الحل:**
```bash
# سجّل على https://dashboard.ngrok.com/signup
# انسخ الـ authtoken
ngrok config add-authtoken YOUR_TOKEN
```

### المشكلة: Port 3001 already in use

**الحل:**
```bash
# شوف مين شغال على port 3001
netstat -ano | findstr :3001

# اقفل الـ process
taskkill /F /PID <process-id>

# شغّل الـ server تاني
npm run server
```

---

## 📁 الملفات المهمة

| ملف | وظيفته |
|-----|---------|
| `server/webhook-server.js` | الـ webhook server |
| `src/components/ChatWindow.jsx` | إرسال/استقبال رسائل |
| `src/components/Settings.jsx` | الإعدادات |
| `.env` | الإعدادات السرية |
| `database-multi-tenant-setup.sql` | Database schema |

---

## 🎯 Checklist النهائي

قبل ما تقول "خلصت":

- [ ] الـ webhook server شغال
- [ ] ngrok شغال
- [ ] الـ URL مسجل في Meta
- [ ] Subscribe to messages
- [ ] Brand مضاف في database
- [ ] whatsapp_token صحيح
- [ ] phone_number_id صحيح
- [ ] اختبرت استقبال رسالة
- [ ] اختبرت إرسال رسالة
- [ ] Real-time updates شغالة

---

## 🚀 للـ Production

لما تكون جاهز للـ production:

### Option 1: ngrok Paid ($8/month)

- URL ثابت (مش بيتغير)
- مفيش limits
- Custom domain

### Option 2: Deploy على سيرفر

**Railway (مجاني):**
1. Push الكود على GitHub
2. Connect Railway to GitHub
3. Deploy
4. أضف Environment Variables
5. سجّل الـ URL في Meta

**Heroku (مجاني):**
```bash
heroku create your-app-name
git push heroku main
heroku config:set VITE_SUPABASE_URL=...
```

**DigitalOcean ($5/month):**
- VPS + Domain + HTTPS
- أفضل للـ production الحقيقي

---

## 📞 محتاج مساعدة؟

شوف الملفات دي:
- `FIX-META-WEBHOOK.md` - حل مشاكل Meta
- `install-ngrok.md` - دليل ngrok
- `QUICK-START-ARABIC.md` - دليل سريع
- `SETUP-WITHOUT-N8N.md` - دليل تقني

---

**🎉 بالتوفيق!**

النظام دلوقتي جاهز تماماً. كل اللي عليك:
1. نزّل ngrok
2. شغّله
3. سجّل في Meta
4. ابدأ تستخدم النظام!
