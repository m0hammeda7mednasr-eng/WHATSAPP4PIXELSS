# 🔑 إصلاح Token منتهي الصلاحية

## المشكلة
```
Error validating access token: Session has expired
```

الـ WhatsApp Token انتهت صلاحيته ومحتاج تجديد!

---

## ⚡ الحل السريع (5 دقائق)

### 1. احصل على Token جديد

**افتح Meta Developer Console:**
```
https://developers.facebook.com/apps
```

**الخطوات:**

1. **اختار تطبيقك** من القائمة

2. **اذهب إلى**: WhatsApp → API Setup (أو Getting Started)

3. **ابحث عن**: "Temporary access token" أو "Access Token"

4. **انسخ الـ Token** (يبدأ بـ `EAA...`)

---

### 2. حدّث الـ Token في النظام

**افتح الموقع:**
```
http://localhost:5177
```

**الخطوات:**

1. سجل دخول

2. اذهب إلى **Settings** (⚙️)

3. اختار البراند (مثلاً: "4 Pixels")

4. **الصق الـ Token الجديد** في خانة "WhatsApp Token"

5. اضغط **"Save"**

6. كرر نفس الخطوات لكل براند

---

## 🔄 أنواع الـ Tokens

### 1. Temporary Token (مؤقت)
- **المدة**: 24 ساعة
- **الاستخدام**: للتجربة والتطوير
- **المصدر**: Meta Developer Console → API Setup

### 2. System User Token (دائم)
- **المدة**: لا ينتهي (أو 60 يوم حسب الإعدادات)
- **الاستخدام**: للإنتاج
- **المصدر**: Business Settings → System Users

---

## 🎯 الحل الدائم: System User Token

### الخطوات التفصيلية:

#### 1. افتح Business Settings
```
https://business.facebook.com/settings
```

#### 2. أنشئ System User

1. اذهب إلى: **Users → System Users**

2. اضغط **"Add"**

3. املأ:
   - **Name**: WhatsApp CRM Bot
   - **Role**: Admin

4. اضغط **"Create System User"**

#### 3. احصل على Token

1. اضغط على System User اللي عملته

2. اضغط **"Generate New Token"**

3. اختار:
   - **App**: تطبيقك
   - **Permissions**: 
     - ✅ `whatsapp_business_messaging`
     - ✅ `whatsapp_business_management`

4. **Token Expiration**: 
   - اختار "Never" (لا ينتهي)
   - أو "60 days" (وجدده كل شهرين)

5. اضغط **"Generate Token"**

6. **انسخ الـ Token** (مش هيظهر تاني!)

#### 4. أضف الـ Token للنظام

1. افتح الموقع: http://localhost:5177

2. Settings → WhatsApp Brands

3. الصق الـ Token الجديد

4. Save

---

## 🧪 اختبار الـ Token

بعد ما تحدث الـ Token، اختبره:

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

## 📝 ملاحظات مهمة

### Temporary Token
- ✅ سهل الحصول عليه
- ❌ ينتهي بعد 24 ساعة
- 💡 مناسب للتطوير فقط

### System User Token
- ✅ لا ينتهي (أو 60 يوم)
- ✅ مناسب للإنتاج
- ⚠️  يحتاج Business Manager

---

## 🔒 الأمان

### احفظ الـ Token بأمان:
- ❌ لا تشاركه مع أحد
- ❌ لا تنشره على GitHub
- ✅ احفظه في `.env` فقط
- ✅ أضف `.env` في `.gitignore`

### لو الـ Token اتسرق:
1. افتح Meta Developer Console
2. اذهب إلى System Users
3. احذف الـ Token القديم
4. أنشئ token جديد

---

## 🚨 استكشاف الأخطاء

### "Invalid OAuth access token"
- الـ Token خطأ أو منتهي
- احصل على token جديد

### "Cannot parse access token"
- الـ Token مش كامل
- تأكد إنك نسخته كله

### "Permissions error"
- الـ Token مش عنده صلاحيات
- تأكد من permissions: `whatsapp_business_messaging`

---

## 📞 الدعم

### روابط مفيدة:

**Meta Developer Console:**
```
https://developers.facebook.com/apps
```

**Business Manager:**
```
https://business.facebook.com/settings
```

**WhatsApp Business API Docs:**
```
https://developers.facebook.com/docs/whatsapp/business-management-api/get-started
```

---

## ✅ Checklist

بعد تحديث الـ Token:

- [ ] نسخت Token جديد من Meta
- [ ] حدثت الـ Token في Settings
- [ ] حفظت التغييرات
- [ ] اختبرت بـ `node test-whatsapp-api.js`
- [ ] الرسائل بتتبعت بنجاح

---

## 🎯 الخلاصة

**المشكلة**: Token منتهي الصلاحية

**الحل السريع**: 
1. احصل على token جديد من Meta
2. حدثه في Settings
3. Save

**الحل الدائم**:
1. أنشئ System User Token
2. اختار "Never expire"
3. استخدمه في النظام

**بالتوفيق! 🚀**
