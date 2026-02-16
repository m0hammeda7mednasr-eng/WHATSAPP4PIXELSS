# 📱 إزاي تربط WhatsApp الحقيقي

## المشكلة الحالية:
الرسائل بتتحفظ في الـ database بس **مش بتروح على WhatsApp** عشان مفيش token صحيح.

---

## ✅ الحل - خطوة بخطوة:

### الخطوة 1: جيب الـ Token من Meta

1. **افتح:** https://developers.facebook.com/apps
2. **اختار الـ App** بتاعك (أو اعمل app جديد)
3. **من القائمة الجانبية:** اضغط **WhatsApp** → **API Setup**
4. **هتلاقي:**
   - **Temporary Access Token** (صالح لـ 24 ساعة)
   - **Phone Number ID** (رقم طويل)
   - **Test Number** (رقم تجريبي)

5. **انسخ:**
   - الـ **Temporary Access Token**
   - الـ **Phone Number ID**

---

### الخطوة 2: حط الـ Token في Supabase

#### الطريقة الأولى: من Dashboard (الأسهل)

1. **افتح:** https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/editor
2. **اختار table:** `brands`
3. **لاقي الـ brand** بتاعك (مثلاً: "4 Pixels")
4. **اضغط Edit** على الـ row
5. **حدّث:**
   - `whatsapp_token`: الصق الـ token من Meta
   - `phone_number_id`: الصق الـ Phone Number ID من Meta
6. **اضغط Save**

#### الطريقة الثانية: من SQL Editor

```sql
UPDATE brands 
SET 
  whatsapp_token = 'EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',  -- الصق الـ token هنا
  phone_number_id = '123456789012345'  -- الصق الـ Phone Number ID هنا
WHERE name = '4 Pixels';  -- أو اسم الـ brand بتاعك
```

---

### الخطوة 3: جرب تبعت رسالة

1. **افتح الـ App:** http://localhost:5177
2. **اختار contact** (أو اعمل واحد جديد)
3. **اكتب رسالة** وابعتها
4. **شوف الـ server logs** - المفروض تشوف:
   ```
   📤 Sending to WhatsApp API...
   ✅ Message sent to WhatsApp: wamid.xxxxx
   ```

---

### الخطوة 4: استقبال رسائل من WhatsApp (اختياري)

عشان تستقبل رسائل من WhatsApp، محتاج:

#### 1. شغّل ngrok:
```bash
ngrok http 3001
```

انسخ الـ URL (مثلاً: `https://1234-abcd.ngrok-free.app`)

#### 2. سجّل الـ webhook في Meta:

1. **روح:** Meta Developer Console → WhatsApp → **Configuration**
2. **Callback URL:** `https://your-ngrok-url.ngrok-free.app/webhook/whatsapp`
3. **Verify Token:** `whatsapp_crm_2024`
4. **اضغط:** Verify and Save
5. **Subscribe to:** messages
6. **اضغط:** Subscribe

---

## 🧪 اختبار سريع:

### بدون WhatsApp (الوضع الحالي):
```
✅ الرسالة بتتحفظ في الـ database
✅ الرسالة بتظهر في الـ UI
❌ الرسالة مش بتروح على WhatsApp
```

### مع WhatsApp Token:
```
✅ الرسالة بتتحفظ في الـ database
✅ الرسالة بتظهر في الـ UI
✅ الرسالة بتروح على WhatsApp الحقيقي
```

### مع ngrok + webhook:
```
✅ كل اللي فوق
✅ استقبال رسائل من WhatsApp
✅ الرسائل الواردة بتظهر في الـ UI
```

---

## ⚠️ ملاحظات مهمة:

1. **Temporary Token** بيخلص بعد 24 ساعة
   - لازم تجدده كل يوم
   - أو تعمل **Permanent Token** (محتاج Business Verification)

2. **Test Numbers**
   - Meta بتديك 5 أرقام تجريبية
   - لازم تضيفهم في Dashboard قبل ما تبعتلهم

3. **Production**
   - محتاج Business Verification
   - محتاج Permanent Token
   - محتاج domain حقيقي (مش ngrok)

---

## 🎯 الخلاصة:

**دلوقتي:** النظام شغال كـ CRM محلي (بدون WhatsApp)

**بعد ما تحط Token:** هيبدأ يبعت رسائل حقيقية على WhatsApp! 🚀

**محتاج مساعدة؟** قولي وأنا هساعدك تجيب الـ token وتحطه! 😊
