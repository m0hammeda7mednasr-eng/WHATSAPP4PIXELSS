# 🔧 إصلاح مشاكل Vercel Deployment

## المشاكل الشائعة والحلول

---

## 1️⃣ Module not found errors

### المشكلة:
```
Module not found: Can't resolve './ChatWindow'
```

### الحل:
تأكد من أسماء الملفات بالحروف الصحيحة (Case-sensitive)

**الملفات يجب أن تكون:**
- `ChatWindow.jsx` (ليس `chatWindow.jsx`)
- `ChatList.jsx` (ليس `chatList.jsx`)
- `Settings.jsx` (ليس `settings.jsx`)

---

## 2️⃣ Environment Variables مفقودة

### المشكلة:
```
Supabase client error
API URL undefined
```

### الحل:

1. **افتح Vercel Dashboard**:
   ```
   https://vercel.com/dashboard
   ```

2. **اختار المشروع** (wahtsapp)

3. **Settings → Environment Variables**

4. **أضف المتغيرات دي:**

```
VITE_SUPABASE_URL
Value: https://rmpgofswkpjxionzythf.supabase.co

VITE_SUPABASE_ANON_KEY
Value: [انسخ من ملف .env المحلي]

VITE_API_URL
Value: [URL الـ Backend من Railway]
```

5. **Redeploy**:
   - Deployments → Latest → Redeploy

---

## 3️⃣ Build fails

### المشكلة:
```
npm ERR! code ELIFECYCLE
Build failed
```

### الحل:

**تأكد من Build Settings:**

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node Version: 18.x
```

---

## 4️⃣ API calls fail (CORS)

### المشكلة:
```
CORS policy: No 'Access-Control-Allow-Origin' header
```

### الحل:

**في `server/webhook-server.js`:**

```javascript
import cors from 'cors';

app.use(cors({
  origin: [
    'https://wahtsapp-xxx.vercel.app', // غير xxx بالـ URL بتاعك
    'http://localhost:5177'
  ],
  credentials: true
}));
```

**ثم:**
```bash
git add .
git commit -m "Fix CORS for Vercel"
git push
```

---

## 5️⃣ Routing issues (404 on refresh)

### المشكلة:
لما تعمل refresh على أي صفحة، بيظهر 404

### الحل:

**تأكد من وجود `vercel.json`:**

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**الملف موجود بالفعل ✅**

---

## 6️⃣ Deployment stuck

### المشكلة:
الـ deployment واقف على "Building..."

### الحل:

1. **Cancel deployment**
2. **Check logs** للأخطاء
3. **Redeploy**

---

## 🔍 فحص الأخطاء

### 1. شوف Build Logs

```
Vercel Dashboard → Deployments → Latest → View Function Logs
```

### 2. شوف Runtime Logs

```
Vercel Dashboard → Deployments → Latest → Runtime Logs
```

### 3. Test locally

```bash
npm run build
npm run preview
```

لو اشتغل محلياً، المشكلة في Environment Variables

---

## ✅ Checklist للنشر الناجح

### قبل Deploy:

- [ ] `package.json` فيه `"type": "module"`
- [ ] `vite.config.js` موجود
- [ ] `.gitignore` يحتوي على `node_modules/` و `dist/`
- [ ] `vercel.json` موجود

### Environment Variables:

- [ ] `VITE_SUPABASE_URL` مضبوط
- [ ] `VITE_SUPABASE_ANON_KEY` مضبوط
- [ ] `VITE_API_URL` مضبوط (بعد رفع Backend)

### Build Settings:

- [ ] Framework: Vite
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Node Version: 18.x

---

## 🚀 إعادة النشر

بعد أي تعديل:

```bash
git add .
git commit -m "Fix deployment issue"
git push
```

Vercel هيعمل auto-deploy تلقائياً!

---

## 📞 لو لسه مش شغال

### 1. Delete and Redeploy

```
Vercel Dashboard → Settings → Delete Project
ثم ارجع اعمل Import من GitHub تاني
```

### 2. Check Vercel Status

```
https://www.vercel-status.com
```

### 3. Contact Support

```
https://vercel.com/support
```

---

## 💡 نصائح

### 1. استخدم Preview Deployments

كل branch بيعمل preview deployment تلقائياً

### 2. شوف الـ Logs دايماً

الـ logs بتقولك المشكلة بالظبط

### 3. Test محلياً الأول

```bash
npm run build
npm run preview
```

---

## 🎯 الخلاصة

**أشهر المشاكل:**
1. Environment Variables مفقودة ← أضفها في Settings
2. Build Command خطأ ← `npm run build`
3. CORS issues ← ضبط الـ Backend
4. Case sensitivity ← أسماء الملفات صحيحة

**بعد الإصلاح:**
```bash
git push
```

Vercel هيعمل redeploy تلقائياً! 🚀
