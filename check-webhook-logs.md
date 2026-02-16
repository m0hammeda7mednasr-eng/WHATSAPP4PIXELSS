# 🔍 فحص Webhook Logs

## الخطوات

### 1. افتح Vercel Logs

https://vercel.com/dashboard

1. اختار المشروع `wahtsapp2`
2. اضغط على **Logs** من القائمة
3. Filter: اختار **All Functions**

### 2. ابحث عن Webhook Calls

في الـ search box، ابحث عن:
- `webhook`
- `interactive`
- `button clicked`

### 3. شوف آخر Webhook Request

لازم تشوف حاجة زي:
```
📥 Webhook received: {...}
📨 Processing message type: interactive
🔘 Button clicked: confirm_123
```

### 4. لو مفيش Logs

ده معناه إن WhatsApp مش بيبعت webhook أصلاً!

**السبب المحتمل:**
- Webhook URL غلط في Meta
- مش Subscribe to `messages`
- Webhook مش verified

---

## الحل السريع

### تحقق من Meta Webhook:

1. https://developers.facebook.com/apps
2. WhatsApp → Configuration
3. Webhook:
   - URL: `https://wahtsapp2.vercel.app/api/webhook`
   - Token: `whatsapp_crm_2024`
4. Subscribe to: **messages** ✅
5. Test webhook → لازم يطلع Success

---

## ابعتلي المعلومات دي:

1. آخر 10 سطور من Vercel Logs
2. Screenshot من Meta Webhook Configuration
3. هل Webhook Test بيطلع Success؟
