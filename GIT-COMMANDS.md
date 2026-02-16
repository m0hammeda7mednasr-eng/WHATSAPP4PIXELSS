# 📚 دليل Git Commands

## 🚀 الرفع الأول على GitHub

### الطريقة الأسهل - استخدم الملف الجاهز:
```bash
PUSH-TO-GITHUB.bat
```

---

### أو يدوياً:

#### 1. تهيئة Git
```bash
cd wahtsapp-main
git init
```

#### 2. إضافة كل الملفات
```bash
git add .
```

#### 3. عمل Commit
```bash
git commit -m "Initial commit: Complete WhatsApp CRM System"
```

#### 4. تحديد Branch الرئيسي
```bash
git branch -M main
```

#### 5. ربط Repository
```bash
git remote add origin https://github.com/m0hammeda7mednasr-eng/wahtsapp-.git
```

#### 6. رفع الملفات
```bash
git push -u origin main
```

---

## 🔄 التحديثات اللاحقة

### بعد تعديل الملفات:

```bash
# 1. إضافة التعديلات
git add .

# 2. عمل Commit
git commit -m "وصف التعديل"

# 3. رفع التحديث
git push
```

---

## 📋 Commands مفيدة

### عرض حالة الملفات
```bash
git status
```

### عرض التاريخ
```bash
git log
```

### عرض الـ Remote
```bash
git remote -v
```

### إلغاء تعديلات لم يتم commit
```bash
git checkout -- .
```

### إلغاء آخر commit (بدون حذف التعديلات)
```bash
git reset --soft HEAD~1
```

---

## ⚠️ ملاحظات مهمة

### ✅ ملفات محمية (لن يتم رفعها):
- `.env` - بيانات Supabase وWhatsApp
- `node_modules/` - المكتبات
- `.vscode/` - إعدادات IDE
- `ngrok.exe` - برنامج ngrok

### ✅ ملفات سيتم رفعها:
- `.env.example` - مثال بدون بيانات حساسة
- كل الكود المصدري
- الوثائق والأدلة
- ملفات SQL

---

## 🔐 الأمان

**تأكد دائماً قبل الرفع:**

```bash
# شوف الملفات اللي هتترفع
git status

# تأكد أن .env مش موجود
# لو موجود، أضفه لـ .gitignore
```

---

## 🆘 حل المشاكل

### المشكلة: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/m0hammeda7mednasr-eng/wahtsapp-.git
```

### المشكلة: "failed to push"
```bash
# جرب force push (احذر: يحذف التاريخ القديم)
git push -f origin main
```

### المشكلة: "Permission denied"
```bash
# تأكد من تسجيل الدخول في Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## 📞 المساعدة

إذا واجهت مشكلة:
1. شوف رسالة الخطأ
2. ابحث عنها في Google
3. أو افتح Issue على GitHub

---

**بالتوفيق! 🎉**
