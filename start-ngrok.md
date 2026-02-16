# 🌐 تشغيل ngrok للـ Webhook

## الخطوات

### 1. نزّل ngrok

روح على: https://ngrok.com/download

أو استخدم:
```bash
# Windows (Chocolatey)
choco install ngrok

# أو نزّله يدوياً من الموقع
```

### 2. سجّل حساب (اختياري لكن مهم)

- روح https://dashboard.ngrok.com/signup
- سجّل حساب مجاني
- انسخ الـ authtoken

### 3. فعّل الـ authtoken

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### 4. شغّل ngrok

```bash
ngrok http 3001
```

### 5. انسخ الـ URL

هيظهرلك حاجة زي كده:

```
ngrok

Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3001

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**انسخ الـ URL:** `https://abc123.ngrok-free.app`

### 6. سجّل في Meta

الآن روح Meta Developer Console وحط:

- **Callback URL**: `https://abc123.ngrok-free.app/webhook/whatsapp`
- **Verify Token**: `whatsapp_crm_2024`

### 7. اضغط "Verify and Save"

Meta هتبعت request للـ webhook بتاعك وتتأكد إنه شغال.

---

## ⚠️ ملاحظات مهمة

### ngrok Free Plan

- الـ URL بيتغير كل مرة تشغل ngrok
- لازم تحدّث الـ URL في Meta كل مرة
- في limit على عدد الـ requests

### ngrok Paid Plan ($8/month)

- URL ثابت (مش بيتغير)
- مفيش limits
- أفضل للـ production

### البدائل

إذا مش عايز تستخدم ngrok:

1. **LocalTunnel** (مجاني)
```bash
npm install -g localtunnel
lt --port 3001
```

2. **Cloudflare Tunnel** (مجاني)
```bash
cloudflared tunnel --url http://localhost:3001
```

3. **Deploy على سيرفر حقيقي** (Railway, Heroku, etc.)

---

## 🧪 اختبار

بعد ما تشغل ngrok:

```bash
# اختبر الـ health endpoint
curl https://your-ngrok-url.ngrok-free.app/health

# اختبر الـ webhook verification
curl "https://your-ngrok-url.ngrok-free.app/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=whatsapp_crm_2024&hub.challenge=test123"
```

المفروض يرجع: `test123`

---

## 📊 مراقبة الـ Requests

ngrok بيوفر web interface على:
http://127.0.0.1:4040

من هناك تقدر تشوف:
- كل الـ requests اللي جاية
- الـ response بتاعك
- الـ errors

---

## 🚀 للـ Production

لما تكون جاهز للـ production:

1. **Deploy الـ server على:**
   - Railway (مجاني)
   - Heroku (مجاني)
   - DigitalOcean ($5/month)
   - AWS/GCP

2. **استخدم domain حقيقي:**
   - اشتري domain من Namecheap/GoDaddy
   - وصّله بالـ server
   - استخدم HTTPS (Let's Encrypt مجاني)

3. **سجّل الـ domain في Meta**
   - مش هتحتاج ngrok تاني
   - الـ URL هيكون ثابت
