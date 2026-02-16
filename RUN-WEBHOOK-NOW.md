# 🚀 شغل الـ Webhook دلوقتي!

## 🎯 الطريقة الأسرع

### 1️⃣ شغل الـ webhook محلياً

```bash
npm install
npm start
```

### 2️⃣ اختبر إنه شغال

```bash
npm test
```

### 3️⃣ استخدم ngrok عشان Meta يوصله

```bash
# Install ngrok
npm install -g ngrok

# Run ngrok
ngrok http 3000
```

### 4️⃣ حط الـ URL في Meta

هيطلع لك URL زي:
```
https://abc123.ngrok.io
```

استخدم:
- **Callback URL:** `https://abc123.ngrok.io/webhook`
- **Verify Token:** `whatsapp_crm_2024`

## 🎉 خلاص!

الـ webhook هيشتغل فوراً!

---

## 🔄 البديل - Deploy على Vercel

```bash
git add .
git commit -m "Simple webhook"
git push origin main
```

ثم اروح https://vercel.com واعمل deploy

---

## 🎯 النتيجة

لما يشتغل هتشوف:
```
🎉 SUCCESS! Webhook is working!
📋 Use this in Meta:
   URL: https://abc123.ngrok.io/webhook
   Token: whatsapp_crm_2024
```

**خلاص كده! مش محتاج تعقيد أكتر من كده** ✅