# 🚀 دليل التشغيل الكامل - بدون n8n

## نظرة عامة

النظام دلوقتي **مستقل تماماً** ومش محتاج n8n! كل حاجة شغالة من جوا الـ app نفسه.

## المكونات

1. **React App** - الواجهة (Port 5173)
2. **Webhook Server** - استقبال وإرسال رسائل WhatsApp (Port 3001)
3. **Supabase** - Database

---

## 📋 الخطوات

### 1. تثبيت الـ Dependencies

```bash
npm install
```

### 2. إعداد ملف `.env`

انسخ من `.env.example`:

```bash
copy .env.example .env
```

املأ البيانات:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
WEBHOOK_VERIFY_TOKEN=whatsapp_crm_2024
WEBHOOK_PORT=3001
```

### 3. إعداد Database

شغّل الـ SQL في Supabase SQL Editor:

```bash
# للـ Multi-tenant setup
database-multi-tenant-setup.sql
```

تأكد إن عندك:
- ✅ جدول `brands` (فيه `phone_number_id` و `whatsapp_token`)
- ✅ جدول `contacts`
- ✅ جدول `messages`
- ✅ جدول `user_settings`

### 4. إضافة Brand

في Supabase، أضف brand جديد:

```sql
INSERT INTO brands (name, phone_number_id, whatsapp_token, user_id)
VALUES (
  'اسم البراند',
  '123456789012345',  -- من Meta Business
  'EAAxxxxxxxxxxxxx',  -- WhatsApp Access Token
  'user-uuid-here'
);
```

**مهم:** الـ `phone_number_id` لازم يكون نفسه اللي في Meta Business!

### 5. تشغيل الـ App

```bash
npm start
```

ده هيشغل:
- ✅ React App على `http://localhost:5173`
- ✅ Webhook Server على `http://localhost:3001`

### 6. Expose الـ Webhook (للإنترنت)

علشان WhatsApp يوصل للـ webhook، استخدم ngrok:

```bash
# نزّل ngrok من https://ngrok.com
ngrok http 3001
```

هيديك URL زي: `https://abc123.ngrok-free.app`

### 7. تسجيل الـ Webhook في Meta

1. روح [Meta Developer Console](https://developers.facebook.com/)
2. اختار الـ App بتاعك
3. WhatsApp > Configuration
4. Callback URL: `https://abc123.ngrok-free.app/webhook/whatsapp`
5. Verify Token: `whatsapp_crm_2024`
6. اضغط "Verify and Save"
7. Subscribe to: `messages`

---

## 🎯 كيف يشتغل النظام

### استقبال رسالة (Inbound)

```
WhatsApp → Meta → Webhook Server → Supabase → React App
```

1. عميل يبعت رسالة على WhatsApp
2. Meta تبعت webhook لـ `http://your-server/webhook/whatsapp`
3. الـ server يحفظ الرسالة في Supabase
4. React App يستقبل الرسالة real-time

### إرسال رسالة (Outbound)

```
React App → Webhook Server → WhatsApp API → Supabase
```

1. تكتب رسالة في الـ app
2. الـ app يبعت لـ `/api/send-message`
3. الـ server يبعت لـ WhatsApp API
4. الـ server يحفظ الرسالة في Supabase

---

## 📁 ملفات مهمة

| ملف | وظيفته |
|-----|---------|
| `server/webhook-server.js` | الـ webhook server الرئيسي |
| `src/components/ChatWindow.jsx` | إرسال الرسائل |
| `src/components/Settings.jsx` | إعدادات WhatsApp |
| `database-multi-tenant-setup.sql` | Database schema |

---

## 🔧 الإعدادات في الـ App

1. افتح Settings من الـ sidebar
2. في قسم "WhatsApp Configuration":
   - **Webhook URL**: انسخه وسجّله في Meta
   - **Verify Token**: انسخه وسجّله في Meta

---

## ✅ اختبار النظام

### 1. اختبر الـ Server

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

### 2. اختبر استقبال رسالة

ابعت رسالة من WhatsApp للرقم اللي سجلته. المفروض:
- ✅ تظهر في الـ console logs
- ✅ تتحفظ في Supabase
- ✅ تظهر في الـ app

### 3. اختبر إرسال رسالة

من الـ app، ابعت رسالة. المفروض:
- ✅ تتبعت على WhatsApp
- ✅ تتحفظ في Supabase
- ✅ تظهر في الـ chat

---

## 🐛 حل المشاكل

### المشكلة: Webhook مش بيوصل

**الحل:**
```bash
# تأكد إن الـ server شغال
curl http://localhost:3001/health

# تأكد إن ngrok شغال
curl https://your-ngrok-url.ngrok-free.app/health
```

### المشكلة: Brand not found

**الحل:**
- تأكد إن عندك brand في الـ database
- تأكد إن الـ `phone_number_id` صح
- شوف الـ logs في console

### المشكلة: Failed to send message

**الحل:**
- تأكد إن الـ `whatsapp_token` صح في الـ brands table
- تأكد إن الـ token مش expired
- شوف الـ Meta Developer Console للـ errors

### المشكلة: Server مش بيشتغل

**الحل:**
```bash
# تأكد إن الـ dependencies مثبتة
npm install

# شغّل الـ server لوحده
npm run server

# شوف الـ logs
```

---

## 🚀 Production Deployment

### Option 1: Railway

1. Push الكود على GitHub
2. Connect Railway to GitHub
3. Deploy
4. أضف الـ Environment Variables
5. سجّل الـ URL في Meta

### Option 2: Heroku

```bash
heroku create your-app-name
git push heroku main
heroku config:set VITE_SUPABASE_URL=...
heroku config:set VITE_SUPABASE_ANON_KEY=...
```

### Option 3: VPS (DigitalOcean, AWS, etc.)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Clone & Setup
git clone your-repo
cd your-repo
npm install

# Start with PM2
pm2 start server/webhook-server.js --name whatsapp-webhook
pm2 start npm --name react-app -- run dev
pm2 save
pm2 startup
```

---

## 📊 Monitoring

### Logs

```bash
# Server logs
tail -f server/logs.txt

# PM2 logs (if using PM2)
pm2 logs whatsapp-webhook
```

### Database

شوف الـ messages في Supabase Dashboard:
```sql
SELECT * FROM messages ORDER BY created_at DESC LIMIT 50;
```

---

## 🎉 الخلاصة

دلوقتي عندك:
- ✅ نظام كامل بدون n8n
- ✅ استقبال رسائل WhatsApp
- ✅ إرسال رسائل WhatsApp
- ✅ Multi-tenant support
- ✅ Real-time updates
- ✅ كل حاجة في مكان واحد

**مفيش حاجة خارجية محتاجها غير:**
- Supabase (Database)
- Meta WhatsApp API
- ngrok (للتطوير) أو Domain (للـ production)
