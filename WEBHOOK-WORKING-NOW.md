# 🚀 الـ Webhook الشغال دلوقتي!

## 🎯 المشكلة

الـ Netlify webhook بيعطي 503 error - مش شغال خالص!

## ✅ الحل السريع

هنستخدم الـ webhook اللي كان شغال قبل كده:

### 📋 الـ URLs اللي تجربها:

1. **الـ webhook الأساسي (Vercel):**
   ```
   https://your-app.vercel.app/api/webhook
   ```

2. **لو عندك domain:**
   ```
   https://yourdomain.com/api/webhook
   ```

3. **الـ webhook البديل:**
   ```
   https://your-app.vercel.app/api/webhook-working
   ```

## 🧪 اختبار سريع

```bash
# اختبر كل الـ webhooks الممكنة
node test-working-webhook.js
```

## 🔑 بيانات الـ Webhook

**Verify Token:** `whatsapp_crm_2024`

## 📱 في Meta Business Manager

1. اروح على **WhatsApp Business Account**
2. **Configuration** → **Webhooks**
3. حط الـ URL اللي شغال
4. حط الـ verify token: `whatsapp_crm_2024`
5. اختار **messages** و **message_status**

## 🎉 لما يشتغل

هتشوف في الـ test:
```
✅ WEBHOOK VERIFICATION SUCCESS!
✅ Challenge returned correctly
```

## 🚨 لو مش شغال

1. **جرب URL تاني** من القائمة فوق
2. **تأكد من الـ deployment** على Vercel
3. **شوف الـ environment variables** موجودة

---

## 🎯 الخلاصة

**مش محتاجين Netlify!** 

الـ webhook الأساسي على Vercel أو أي platform تاني هيشتغل عادي.

**المهم:** نلاقي URL شغال ونحطه في Meta ✅