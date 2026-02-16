# 🚀 البدء السريع - دليل عربي كامل

## المشكلة اللي كانت عندك

كنت بتستخدم n8n وحصل error في الـ `user_settings` table. دلوقتي **شلنا n8n تماماً** وكل حاجة بقت جوا الـ app!

---

## ✅ الحل الجديد

### النظام دلوقتي:

```
WhatsApp ←→ Meta ←→ Your Server ←→ Supabase ←→ React App
```

**كل حاجة في مكان واحد!**

---

## 📋 الخطوات بالترتيب

### 1️⃣ تأكد إن الـ Dependencies مثبتة

```bash
npm install
```

### 2️⃣ اعمل ملف `.env`

انسخ من `.env.example`:

```bash
copy .env.example .env
```

افتح `.env` واملأ البيانات:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
WEBHOOK_VERIFY_TOKEN=whatsapp_crm_2024
WEBHOOK_PORT=3001
```

### 3️⃣ شغّل الـ Database Setup

روح Supabase SQL Editor وشغّل:

```sql
-- الملف: database-multi-tenant-setup.sql
```

ده هيعملك:
- ✅ جدول `brands`
- ✅ جدول `contacts`
- ✅ جدول `messages`
- ✅ جدول `user_settings`

### 4️⃣ أضف Brand

في Supabase SQL Editor:

```sql
-- أولاً: جيب الـ user_id بتاعك
SELECT id, email FROM auth.users;

-- ثانياً: أضف brand
INSERT INTO brands (name, phone_number_id, whatsapp_token, user_id)
VALUES (
  'اسم البراند بتاعك',
  '123456789012345',  -- من Meta Business Manager
  'EAAxxxxxxxxxx',     -- WhatsApp Access Token من Meta
  'user-uuid-من-الخطوة-الأولى'
);
```

**مهم جداً:** الـ `phone_number_id` لازم يكون نفسه اللي في Meta!

### 5️⃣ شغّل الـ System

**الطريقة الأولى (سهلة):**
```bash
start-all.bat
```

**الطريقة الثانية (يدوي):**
```bash
# Terminal 1: Webhook Server
npm run server

# Terminal 2: React App
npm run dev
```

### 6️⃣ شغّل ngrok

**نزّل ngrok:**
- روح https://ngrok.com/download
- نزّل وفك الضغط

**شغّله:**
```bash
ngrok http 3001
```

**انسخ الـ URL:**
```
Forwarding: https://abc123.ngrok-free.app -> http://localhost:3001
```

### 7️⃣ سجّل الـ Webhook في Meta

1. روح [Meta Developer Console](https://developers.facebook.com/)
2. اختار الـ App بتاعك
3. WhatsApp > Configuration
4. في قسم Webhook:
   - **Callback URL**: `https://abc123.ngrok-free.app/webhook/whatsapp`
   - **Verify Token**: `whatsapp_crm_2024`
5. اضغط **"Verify and Save"**
6. Subscribe to: **messages**

---

## 🎯 اختبار النظام

### اختبار 1: الـ Server شغال؟

```bash
curl http://localhost:3001/health
```

المفروض يرجع:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "supabase": "connected"
}
```

### اختبار 2: ngrok شغال؟

```bash
curl https://your-ngrok-url.ngrok-free.app/health
```

### اختبار 3: استقبال رسالة

1. ابعت رسالة من WhatsApp للرقم اللي سجلته
2. شوف الـ console logs في الـ webhook server
3. المفروض تشوف:
   ```
   📨 Received WhatsApp webhook
   📱 Message from: +1234567890
   ✅ Brand found: Brand Name
   ✅ Contact created/updated
   ✅ Message saved
   ```
4. افتح الـ React App وشوف الرسالة

### اختبار 4: إرسال رسالة

1. افتح الـ React App
2. اختار contact
3. اكتب رسالة وابعتها
4. المفروض توصل على WhatsApp

---

## 🔧 الإعدادات في الـ App

### من Settings:

1. **WhatsApp Configuration**
   - Webhook URL: انسخه وسجّله في Meta
   - Verify Token: انسخه وسجّله في Meta

2. **Profile**
   - غير اسمك
   - غير الـ password

3. **Notifications**
   - فعّل/عطّل الإشعارات

---

## 📊 فهم النظام

### استقبال رسالة (Inbound):

```
1. عميل يبعت رسالة على WhatsApp
   ↓
2. Meta تبعت webhook لـ server بتاعك
   ↓
3. Server يجيب الـ brand من phone_number_id
   ↓
4. Server يحفظ/يحدّث الـ contact
   ↓
5. Server يحفظ الرسالة في messages
   ↓
6. React App يستقبل الرسالة real-time
```

### إرسال رسالة (Outbound):

```
1. تكتب رسالة في الـ app
   ↓
2. App يبعت POST لـ /api/send-message
   ↓
3. Server يجيب بيانات الـ contact والـ brand
   ↓
4. Server يبعت الرسالة لـ WhatsApp API
   ↓
5. Server يحفظ الرسالة في database
   ↓
6. App يعرض الرسالة
```

---

## 🐛 حل المشاكل الشائعة

### ❌ "Brand not found"

**السبب:** الـ `phone_number_id` في الـ database مش نفسه اللي في Meta

**الحل:**
```sql
-- شوف الـ phone_number_id اللي جاي من Meta
-- (هتلاقيه في الـ console logs)

-- حدّث الـ brand
UPDATE brands 
SET phone_number_id = 'الرقم-الصح-من-Meta'
WHERE id = 'brand-uuid';
```

### ❌ "Failed to send message"

**الأسباب المحتملة:**

1. **Token expired:**
```sql
-- حدّث الـ token
UPDATE brands 
SET whatsapp_token = 'EAA-new-token-here'
WHERE id = 'brand-uuid';
```

2. **مفيش permissions:**
   - روح Meta Developer Console
   - تأكد إن عندك `whatsapp_business_messaging` permission

3. **الرقم مش verified:**
   - تأكد إن الرقم مسجل في Meta Business

### ❌ "Webhook مش بيوصل"

**الحل:**

1. **تأكد إن الـ server شغال:**
```bash
curl http://localhost:3001/health
```

2. **تأكد إن ngrok شغال:**
```bash
curl https://your-ngrok-url.ngrok-free.app/health
```

3. **تأكد إن الـ URL مسجل صح في Meta:**
   - لازم يكون: `https://xxx.ngrok-free.app/webhook/whatsapp`
   - مش: `http://localhost:3001/webhook/whatsapp`

4. **شوف الـ Meta logs:**
   - Meta Developer Console > Webhooks
   - شوف الـ errors

### ❌ "Server مش بيشتغل"

```bash
# تأكد إن مفيش حاجة شغالة على port 3001
netstat -ano | findstr :3001

# لو في حاجة، اقفلها
taskkill /F /PID <process-id>

# شغّل الـ server تاني
npm run server
```

---

## 📁 الملفات المهمة

| ملف | وظيفته |
|-----|---------|
| `server/webhook-server.js` | الـ webhook server الرئيسي |
| `src/components/ChatWindow.jsx` | إرسال واستقبال الرسائل |
| `src/components/Settings.jsx` | الإعدادات |
| `database-multi-tenant-setup.sql` | Database schema |
| `.env` | الإعدادات السرية |
| `start-all.bat` | تشغيل كل حاجة |

---

## 🎉 الخلاصة

دلوقتي عندك:
- ✅ نظام كامل **بدون n8n**
- ✅ استقبال رسائل WhatsApp
- ✅ إرسال رسائل WhatsApp
- ✅ Multi-tenant (أكثر من brand)
- ✅ Real-time updates
- ✅ كل حاجة في مكان واحد

**مفيش حاجة خارجية محتاجها غير:**
- Supabase (Database)
- Meta WhatsApp API
- ngrok (للتطوير) أو Domain (للـ production)

---

## 📞 محتاج مساعدة؟

شوف الملفات دي:
- `SETUP-WITHOUT-N8N.md` - دليل تفصيلي
- `start-ngrok.md` - دليل ngrok
- `README.md` - نظرة عامة

---

**🚀 يلا نبدأ!**

```bash
npm start
```
