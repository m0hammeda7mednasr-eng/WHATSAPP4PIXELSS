# 🚂 دليل رفع Backend على Railway

## الخطوات بالتفصيل:

### 1️⃣ جهز الملفات للرفع

أول حاجة، اجري الأمر ده عشان تجيب الـ Environment Variables:

```bash
node get-env-for-railway.js
```

هيطلعلك حاجة زي كده:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**انسخهم في ورقة جنبك** 📝

---

### 2️⃣ روح على Railway

1. افتح: https://railway.app
2. اعمل Sign up (أو Login لو عندك حساب)
3. اضغط **"New Project"**
4. اختار **"Deploy from GitHub repo"**

---

### 3️⃣ وصّل GitHub

1. اضغط **"Configure GitHub App"**
2. اختار الـ repository بتاعك (wahtsapp)
3. اضغط **"Install & Authorize"**

---

### 4️⃣ اختار الـ Repo

1. هيظهرلك قائمة بالـ repos
2. اختار **wahtsapp**
3. اضغط **"Deploy Now"**

---

### 5️⃣ ضبط الإعدادات

بعد ما يبدأ الـ deployment:

#### أ) غيّر الـ Start Command:
1. اضغط على الـ **Service** (اللي اسمه wahtsapp)
2. روح **Settings** → **Deploy**
3. في **Start Command** حط:
   ```
   node server/webhook-server.js
   ```
4. اضغط **Save**

#### ب) ضيف الـ Environment Variables:
1. روح **Variables** tab
2. اضغط **"New Variable"**
3. ضيف المتغيرات دي واحدة واحدة:

```
VITE_SUPABASE_URL
القيمة: https://xxxxx.supabase.co (اللي نسختها من الخطوة 1)

VITE_SUPABASE_ANON_KEY
القيمة: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (اللي نسختها من الخطوة 1)

WEBHOOK_VERIFY_TOKEN
القيمة: whatsapp_crm_2024

WEBHOOK_PORT
القيمة: 3001
```

4. اضغط **"Add"** لكل واحدة

---

### 6️⃣ Redeploy

بعد ما تضيف الـ Variables:
1. روح **Deployments** tab
2. اضغط على آخر deployment
3. اضغط **"Redeploy"** (أو استنى يعمل redeploy تلقائي)

---

### 7️⃣ جيب الـ URL

1. روح **Settings** → **Networking**
2. اضغط **"Generate Domain"**
3. هيديك URL زي: `https://wahtsapp-production.up.railway.app`
4. **انسخ الـ URL ده** 📋

---

### 8️⃣ اختبر الـ Backend

افتح الـ URL في المتصفح وضيف `/health`:
```
https://wahtsapp-production.up.railway.app/health
```

لو شغال، هيطلعلك:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "supabase": "connected"
}
```

✅ **Backend شغال!**

---

### 9️⃣ استخدم الـ URL في n8n

دلوقتي في n8n، استخدم:
```
POST https://wahtsapp-production.up.railway.app/api/external-message

Body:
{
  "phone_number": "201066184859",
  "message": "مرحباً من Railway! 🚂"
}
```

---

### 🔟 سجّل الـ Webhook في Meta

1. روح Meta Developer Console
2. WhatsApp → Configuration → Webhook
3. **Callback URL:** 
   ```
   https://wahtsapp-production.up.railway.app/webhook/whatsapp
   ```
4. **Verify Token:** `whatsapp_crm_2024`
5. اضغط **"Verify and Save"**
6. Subscribe to: **messages** ✅

---

## ✅ خلصت!

دلوقتي:
- ✅ Backend شغال على Railway
- ✅ n8n يقدر يبعت رسائل
- ✅ WhatsApp يقدر يبعتلك رسائل
- ✅ كل حاجة هتظهر في الشات

---

## 🔧 لو حصلت مشكلة:

### المشكلة: "Application failed to respond"
**الحل:** تأكد إن الـ Start Command صح: `node server/webhook-server.js`

### المشكلة: "supabaseUrl is required"
**الحل:** تأكد إنك ضفت الـ Environment Variables صح

### المشكلة: الـ deployment بيفشل
**الحل:** شوف الـ **Logs** في Railway وابعتهالي

---

## 💰 التكلفة:

Railway بيديك:
- ✅ **$5 مجاني** كل شهر
- ✅ كفاية لـ backend صغير
- ✅ لو خلصوا، ممكن تضيف كارت (بس مش هتدفع غير لو استخدمت أكتر من $5)

---

## 📱 للمتابعة:

افتح Railway Dashboard وشوف:
- **Metrics:** استخدام الـ CPU والـ Memory
- **Logs:** الرسائل اللي بتيجي وتروح
- **Deployments:** تاريخ الـ deployments

---

**جاهز؟ ابدأ من الخطوة 1! 🚀**
