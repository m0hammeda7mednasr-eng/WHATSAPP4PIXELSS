# 🔑 الحصول على Token دائم (لا ينتهي)

## المشكلة الحالية

**Temporary Token** بينتهي كل 24 ساعة ❌

**محتاج**: System User Token (دائم) ✅

---

## ✅ الحل: System User Token

### الخطوة 1: افتح Business Settings

```
https://business.facebook.com/settings
```

أو:
1. افتح: https://business.facebook.com
2. اضغط على **Settings** (⚙️) في أعلى اليسار

---

### الخطوة 2: أنشئ System User

1. من القائمة الجانبية: **Users → System Users**

2. اضغط **"Add"** (أو "+ Add System User")

3. املأ البيانات:
   ```
   Name: WhatsApp CRM Bot
   Role: Admin
   ```

4. اضغط **"Create System User"**

---

### الخطوة 3: احصل على Token

1. **اضغط على System User** اللي عملته (WhatsApp CRM Bot)

2. اضغط **"Generate New Token"**

3. **اختار التطبيق**:
   - App: [اختار تطبيق WhatsApp بتاعك]

4. **اختار Permissions** (مهم جداً!):
   - ✅ `whatsapp_business_messaging`
   - ✅ `whatsapp_business_management`
   - ✅ `business_management` (اختياري)

5. **Token Expiration**:
   - اختار **"Never"** (لا ينتهي أبداً) ✅
   - أو **"60 days"** (وجدده كل شهرين)

6. اضغط **"Generate Token"**

7. **انسخ الـ Token فوراً!** (مش هيظهر تاني)
   ```
   EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

### الخطوة 4: حدّث الـ Token في النظام

1. **افتح الموقع**: http://localhost:5177

2. **اذهب إلى Settings** (⚙️)

3. **اختار البراند** (مثلاً: Lamsa أو 4 Pixels)

4. **الصق الـ Token الجديد** في خانة "WhatsApp Token"

5. **اضغط "Save"**

---

### الخطوة 5: اختبر الـ Token

```bash
node test-whatsapp-api.js
```

**يجب أن ترى:**
```
✅ Token format is valid
✅ Phone Number ID format is valid
✅ Message sent successfully!
```

---

## 🎯 الفرق بين الـ Tokens

### Temporary Token (مؤقت)
- ⏰ **المدة**: 24 ساعة فقط
- 📍 **المصدر**: Meta Developer Console → API Setup
- 💡 **الاستخدام**: للتجربة والتطوير
- ❌ **العيب**: لازم تجدده كل يوم

### System User Token (دائم)
- ⏰ **المدة**: لا ينتهي (أو 60 يوم)
- 📍 **المصدر**: Business Manager → System Users
- 💡 **الاستخدام**: للإنتاج والاستخدام الفعلي
- ✅ **الميزة**: مش محتاج تجدده

---

## 🔒 الأمان

### احفظ الـ Token بأمان:

1. **لا تشاركه مع أحد** ❌
2. **لا تنشره على GitHub** ❌
3. **احفظه في `.env` فقط** ✅
4. **تأكد من `.gitignore`** ✅

### لو الـ Token اتسرق:

1. افتح Business Settings
2. System Users
3. اضغط على الـ User
4. **Revoke Token** (احذف الـ Token القديم)
5. أنشئ token جديد

---

## 📝 ملاحظات مهمة

### 1. Business Manager مطلوب

لو مش عندك Business Manager:
- افتح: https://business.facebook.com
- أنشئ Business Account
- أضف تطبيق WhatsApp للـ Business

### 2. Permissions مهمة جداً

لازم تختار:
- ✅ `whatsapp_business_messaging` (للإرسال)
- ✅ `whatsapp_business_management` (للإدارة)

بدونها الـ Token مش هيشتغل!

### 3. Token Expiration

**للإنتاج**: اختار "Never" (الأفضل)

**للأمان الزيادة**: اختار "60 days" وجدده كل شهرين

---

## 🚨 استكشاف الأخطاء

### "You don't have permission to create system users"

**الحل**:
- تأكد إنك Admin في الـ Business Account
- أو اطلب من Admin يعملك System User

### "App not found"

**الحل**:
- تأكد إن التطبيق مضاف للـ Business Account
- Business Settings → Apps → Add App

### "Invalid permissions"

**الحل**:
- تأكد من اختيار:
  - `whatsapp_business_messaging`
  - `whatsapp_business_management`

---

## ✅ Checklist

- [ ] فتحت Business Settings
- [ ] دخلت على System Users
- [ ] أنشأت System User جديد
- [ ] اخترت التطبيق الصحيح
- [ ] اخترت Permissions الصحيحة
- [ ] اخترت "Never" للـ Expiration
- [ ] نسخت الـ Token
- [ ] حدثت الـ Token في Settings
- [ ] اختبرت بـ `node test-whatsapp-api.js`
- [ ] الرسائل بتتبعت بنجاح! 🎉

---

## 🎯 الخلاصة

**للحصول على Token دائم:**

1. افتح: https://business.facebook.com/settings
2. System Users → Add
3. Generate Token
4. Permissions: `whatsapp_business_messaging`
5. Expiration: **Never**
6. Copy Token
7. حدثه في Settings

**الوقت**: 5 دقائق

**الفائدة**: مش محتاج تجدد الـ Token كل يوم! 🚀

---

## 📞 محتاج مساعدة؟

شوف:
- `FIX-EXPIRED-TOKEN.md` - دليل تجديد Token
- `test-whatsapp-api.js` - اختبار Token

**بالتوفيق! 🎉**
