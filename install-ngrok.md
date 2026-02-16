# 📥 تنزيل وتشغيل ngrok - خطوة بخطوة

## الطريقة 1: تنزيل يدوي (الأسهل)

### الخطوة 1: نزّل ngrok

1. افتح المتصفح وروح على: **https://ngrok.com/download**
2. اختار **Windows (64-bit)**
3. اضغط **Download**
4. هينزل ملف: `ngrok-v3-stable-windows-amd64.zip`

### الخطوة 2: فك الضغط

1. روح على مجلد Downloads
2. كليك يمين على `ngrok-v3-stable-windows-amd64.zip`
3. اختار **Extract All**
4. فك الضغط في مجلد سهل (مثلاً: `C:\ngrok`)

### الخطوة 3: شغّل ngrok

افتح Command Prompt (CMD) أو PowerShell:

```bash
# روح للمجلد اللي فيه ngrok
cd C:\ngrok

# شغّل ngrok
ngrok http 3001
```

---

## الطريقة 2: باستخدام Chocolatey (لو عندك)

```bash
choco install ngrok
```

---

## الطريقة 3: باستخدام Scoop (لو عندك)

```bash
scoop install ngrok
```

---

## 🔐 تسجيل حساب (اختياري لكن مهم)

### ليه محتاج تسجل؟

- بدون تسجيل: الـ session بتنتهي بعد 2 ساعة
- مع تسجيل: unlimited sessions + features أكتر

### خطوات التسجيل:

1. روح https://dashboard.ngrok.com/signup
2. سجّل بالـ email أو Google
3. بعد التسجيل، هتلاقي **Your Authtoken**
4. انسخ الـ token

### فعّل الـ Authtoken:

```bash
# في CMD أو PowerShell
cd C:\ngrok
ngrok config add-authtoken YOUR_TOKEN_HERE
```

---

## ▶️ تشغيل ngrok

### الأمر الأساسي:

```bash
ngrok http 3001
```

### هيظهرلك:

```
ngrok

Session Status                online
Account                       your-email@example.com (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       50ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://1234-abcd-5678.ngrok-free.app -> http://localhost:3001

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

### انسخ الـ URL:

```
https://1234-abcd-5678.ngrok-free.app
```

---

## ✅ اختبار

### في terminal جديد:

```bash
curl "https://1234-abcd-5678.ngrok-free.app/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=whatsapp_crm_2024&hub.challenge=test"
```

**المفروض يرجع:** `test`

---

## 🌐 Web Interface

ngrok بيوفر web interface على:

```
http://127.0.0.1:4040
```

افتحه في المتصفح علشان تشوف:
- كل الـ requests اللي جاية
- الـ response بتاعك
- أي errors

---

## 📝 سجّل في Meta

الآن روح Meta Developer Console:

1. **Callback URL**: `https://1234-abcd-5678.ngrok-free.app/webhook/whatsapp`
   - استبدل `1234-abcd-5678` بالـ URL بتاعك!

2. **Verify Token**: `whatsapp_crm_2024`

3. اضغط **"Verify and Save"**

---

## 🛑 إيقاف ngrok

لما تخلص:
- اضغط `Ctrl + C` في الـ terminal

---

## 💡 نصائح

### للتطوير:
- خلّي ngrok شغال طول ما بتشتغل
- لو قفلته، الـ URL هيتغير
- لازم تحدّث الـ URL في Meta كل مرة

### للـ Production:
- استخدم ngrok Paid ($8/month) - URL ثابت
- أو Deploy على سيرفر حقيقي (Railway, Heroku)

---

## 🐛 مشاكل شائعة

### "command not found: ngrok"

**الحل:**
```bash
# تأكد إنك في المجلد الصح
cd C:\ngrok

# أو أضف ngrok للـ PATH
# System Properties > Environment Variables > Path > Add: C:\ngrok
```

### "ERR_NGROK_108"

**الحل:**
```bash
# سجّل وفعّل الـ authtoken
ngrok config add-authtoken YOUR_TOKEN
```

### "connection refused"

**الحل:**
```bash
# تأكد إن الـ webhook server شغال
curl http://localhost:3001/health
```

---

## 📦 ملفات مساعدة

بعد ما تنزل ngrok، استخدم:

```bash
# اختبر الـ webhook
test-webhook.bat

# شغّل كل حاجة
start-all.bat
```

---

**🎉 بالتوفيق!**
