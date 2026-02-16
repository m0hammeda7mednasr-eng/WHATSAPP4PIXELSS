# 🌙 WhatsApp CRM System v2.0

> Production-ready WhatsApp CRM with Shopify integration, interactive messages, and automated order management.

[![CI](https://github.com/m0hammeda7mednasr-eng/WHATSAPP4PIXELSS/workflows/CI/badge.svg)](https://github.com/m0hammeda7mednasr-eng/WHATSAPP4PIXELSS/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

نظام CRM متكامل لإدارة طلبات Shopify عبر WhatsApp مع رسائل تفاعلية وأزرار تأكيد/إلغاء

## ✨ المميزات

- 📱 **رسائل تفاعلية بأزرار** - إرسال رسائل WhatsApp بأزرار (✅ تأكيد / ❌ إلغاء)
- 🎨 **تخصيص كامل** - كل brand يقدر يخصص رسائله الخاصة
- ⏰ **تذكير تلقائي** - إرسال تذكير بعد ساعة إذا لم يرد العميل
- 🔗 **تكامل Shopify** - ربط مباشر مع متجر Shopify
- 📊 **تتبع الطلبات** - متابعة حالة كل طلب (pending, confirmed, cancelled)
- 💬 **إدارة المحادثات** - واجهة سهلة لإدارة محادثات العملاء
- 🔐 **Multi-tenant** - دعم عدة brands في نفس النظام

## 🚀 التشغيل السريع

### المتطلبات

- Node.js >= 18.0.0
- npm >= 9.0.0
- حساب Supabase
- حساب WhatsApp Business API
- متجر Shopify (اختياري)

### التثبيت

```bash
# Clone المشروع
git clone https://github.com/m0hammeda7mednasr-eng/WHATSAPP4PIXELSS.git
cd WHATSAPP4PIXELSS/wahtsapp-main

# تثبيت Dependencies
npm install

# إعداد Environment Variables
cp .env.example .env
# عدل .env وضع بياناتك

# إعداد Database
# شغل ملف COMPLETE-DATABASE-SETUP.sql في Supabase SQL Editor

# تشغيل النظام الكامل
npm run dev:all
```

### الأوامر المتاحة

```bash
# تشغيل كل شيء (Frontend + Backend + Cron)
npm run dev:all

# Frontend فقط
npm run dev

# Backend فقط
npm run dev:server

# Cron Job فقط
npm run dev:cron

# Build للإنتاج
npm run build

# Tests
npm test
npm run test:coverage

# Linting & Formatting
npm run lint
npm run format
```

## 📋 كيف يعمل النظام

### Flow الكامل:

```
📦 Order من Shopify
    ↓
🔍 فحص: العميل موجود في Database؟
    ↓
📤 إرسال رسالة بأزرار (✅ تأكيد / ❌ إلغاء)
    ↓
┌─────────────────┬─────────────────┐
│  يضغط تأكيد    │   يضغط إلغاء   │
│       ↓         │       ↓         │
│  رسالة تأكيد   │  رسالة إلغاء   │
└─────────────────┴─────────────────┘
    ↓
⏰ لو ما رد بعد ساعة → رسالة تذكير
```

## 🎯 الاستخدام

### 1. تخصيص الرسائل

1. افتح: `http://localhost:5173`
2. اذهب إلى: **Settings → Template Settings**
3. عدل الرسائل الأربعة:
   - رسالة العملاء الموجودين
   - رسالة التأكيد
   - رسالة الإلغاء
   - رسالة التذكير
4. احفظ

### 2. المتغيرات المتاحة

| المتغير | الوصف | مثال |
|---------|-------|------|
| `{customer_name}` | اسم العميل | أحمد محمد |
| `{order_number}` | رقم الطلب | 1062 |
| `{products}` | قائمة المنتجات | Teddy Sofa Love Seat |
| `{subtotal}` | المجموع الفرعي | 19500.00 |
| `{shipping}` | مصاريف الشحن | 118.00 |
| `{total}` | الإجمالي | 22348.00 |
| `{address}` | عنوان التوصيل | القاهرة، مصر |
| `{brand_name}` | اسم البراند | 4 Pixels |

### 3. ربط Shopify

1. اذهب إلى: **Settings → Shopify Integration**
2. أدخل بيانات Shopify:
   - Shop URL
   - Client ID
   - Client Secret
3. اضغط Connect
4. أكمل OAuth flow

## 🧪 الاختبار

### Test سريع:
```bash
TEST-INTERACTIVE-BUTTONS.bat
```

### Test يدوي:
1. اعمل order في Shopify
2. شوف WhatsApp - لازم تيجي رسالة بأزرار
3. اضغط ✅ تأكيد أو ❌ إلغاء
4. لازم تيجي رسالة تأكيد/إلغاء

## 📁 هيكل المشروع

```
wahtsapp-main/
├── server/                    # Backend (Node.js + Express)
│   ├── config/               # Configuration & env validation
│   ├── controllers/          # Request handlers
│   ├── db/                   # Database client (Supabase)
│   ├── jobs/                 # Background jobs (cron)
│   ├── middleware/           # Express middleware
│   ├── routes/               # API routes
│   ├── services/             # Business logic (WhatsApp, Shopify)
│   ├── utils/                # Utilities (logger, errors, validation)
│   └── index.js              # Server entry point
│
├── src/                      # Frontend (React + Vite)
│   ├── components/           # React components
│   ├── config/               # Frontend configuration
│   ├── context/              # React context
│   └── lib/                  # Libraries
│
├── docs/                     # Documentation
│   ├── README.md            # Main documentation
│   ├── ARCHITECTURE.md      # System architecture
│   ├── API.md               # API reference
│   └── DEPLOYMENT.md        # Deployment guide
│
├── .github/                  # GitHub Actions
│   └── workflows/           # CI/CD pipelines
│
├── COMPLETE-DATABASE-SETUP.sql  # Database setup script
├── .env.example             # Environment variables template
├── package.json             # Dependencies & scripts
└── README.md                # This file
```

## 🔧 استكشاف الأخطاء

### الرسالة بدون أزرار
```bash
# تأكد من Backend شغال
npm run dev:server

# لازم تشوف في Console:
# "Server started successfully"
```

### الأزرار ما تشتغل
```bash
# تأكد من:
1. Webhook URL صحيح في Meta
2. Verify Token = قيمة WEBHOOK_VERIFY_TOKEN في .env
3. Server شغال ومتصل بالإنترنت
```

### التذكير ما يشتغل
```bash
# شغل Cron Job:
npm run dev:cron
```

### مشاكل Environment Variables
```bash
# Server سيفشل في البداية إذا كانت المتغيرات ناقصة
# راجع الرسائل في Console وأكمل المتغيرات المطلوبة
```

## 📚 الوثائق الكاملة

- [📖 Architecture](./docs/ARCHITECTURE.md) - معمارية النظام والتصميم
- [📡 API Reference](./docs/API.md) - توثيق كامل للـ API
- [🚀 Deployment](./docs/DEPLOYMENT.md) - دليل النشر على السيرفرات
- [🤝 Contributing](./CONTRIBUTING.md) - كيفية المساهمة في المشروع
- [📝 Changelog](./CHANGELOG.md) - سجل التغييرات

## 🛠️ التقنيات المستخدمة

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** Supabase (PostgreSQL)
- **WhatsApp:** WhatsApp Business API
- **E-commerce:** Shopify API

## 🔐 الأمان

- ✅ Environment variable validation (Zod)
- ✅ Rate limiting (100 req/15min)
- ✅ PII masking in logs
- ✅ Input validation & sanitization
- ✅ Webhook signature verification
- ✅ CORS configuration
- ✅ Error handling without data leaks
- ✅ Row Level Security (RLS) في Supabase
- ✅ OAuth 2.0 لـ Shopify
- ✅ `.gitignore` لحماية الملفات الحساسة

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 🚀 Deployment

المشروع جاهز للنشر على:
- Railway (موصى به)
- Render
- Heroku
- VPS (DigitalOcean, AWS, etc.)

راجع [دليل النشر الكامل](./docs/DEPLOYMENT.md) للتفاصيل.

## 🆕 What's New in v2.0

### Major Improvements
- ♻️ Complete code refactoring
- 🔐 Enhanced security (validation, rate limiting, PII masking)
- 📊 Structured logging with correlation IDs
- 🔄 Retry logic for external APIs
- 🧪 Testing infrastructure
- 📚 Comprehensive documentation
- 🚀 CI/CD pipeline
- 🏗️ Modular architecture

### Breaking Changes
- Server entry point changed to `server/index.js`
- Environment variables now validated on startup
- Hardcoded credentials removed

راجع [CHANGELOG.md](./CHANGELOG.md) للتفاصيل الكاملة.

## 📝 License

MIT License - استخدم المشروع بحرية

## 👨‍💻 المطور

Mohamed Ahmed Nasr

## 🤝 المساهمة

المساهمات مرحب بها! افتح Issue أو Pull Request

## 📞 الدعم

إذا واجهت أي مشكلة:
1. شوف [استكشاف الأخطاء](#-استكشاف-الأخطاء)
2. اقرأ [الوثائق](#-الوثائق)
3. افتح Issue على GitHub

---

**النظام جاهز للاستخدام! 🎉**
