# 🚀 WhatsApp CRM - Complete System

## نظام CRM متكامل لإدارة محادثات WhatsApp مع تكامل Shopify

---

## ✨ المميزات

### 💬 WhatsApp Integration
- ✅ إرسال واستقبال الرسائل
- ✅ دعم الوسائط (صور، فيديو، مستندات، صوت)
- ✅ حالة الرسائل (sent, delivered, read)
- ✅ Multi-tenant (عدة براندات)

### 🛒 Shopify Integration
- ✅ تكامل مباشر مع Shopify (بدون n8n)
- ✅ إرسال تأكيد الطلب تلقائياً
- ✅ Interactive Buttons (تأكيد/إلغاء)
- ✅ Template Messages معتمدة من Meta
- ✅ تحديث حالة الطلب في Shopify
- ✅ Abandoned Cart Reminders

### 🎨 Template Customization
- ✅ كل براند يقدر يخصص رسائله
- ✅ اختيار Template Name و Language
- ✅ تخصيص Emoji البراند
- ✅ رسائل مخصصة للتأكيد والإلغاء
- ✅ معاينة مباشرة للرسائل

### 📊 Dashboard Features
- ✅ قائمة المحادثات مع آخر رسالة
- ✅ عرض تفاصيل الأوردر في الشات
- ✅ إدارة عدة براندات
- ✅ Settings شاملة
- ✅ Shopify Orders Management

---

## 🏗️ التقنيات المستخدمة

### Frontend
- React + Vite
- Tailwind CSS
- Lucide Icons
- Supabase Client

### Backend
- Vercel Serverless Functions
- Supabase (PostgreSQL)
- WhatsApp Business API
- Shopify API

### APIs
- `/api/send-message` - إرسال رسائل WhatsApp
- `/api/external-message` - إرسال من خارج النظام
- `/api/webhook` - استقبال رسائل WhatsApp
- `/api/shopify/webhook-handler` - استقبال Shopify webhooks
- `/api/shopify/handle-button-click` - معالجة button clicks
- `/api/shopify/oauth/callback` - Shopify OAuth

---

## 📋 المتطلبات

### 1. Meta Developer Account
- WhatsApp Business App
- Phone Number ID
- Access Token
- Webhook Configuration

### 2. Shopify Store
- Admin API Access
- Webhook Configuration
- (Optional) OAuth App

### 3. Supabase Project
- Database Tables
- RLS Policies
- Storage Bucket (optional)

### 4. Vercel Account
- Project Deployment
- Environment Variables

---

## 🚀 التثبيت والإعداد

### الخطوة 1: Clone Repository

```bash
git clone https://github.com/m0hammedahmed/wahtsapp.git
cd wahtsapp
npm install
```

### الخطوة 2: Environment Variables

أنشئ ملف `.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
WEBHOOK_VERIFY_TOKEN=whatsapp_crm_2024
```

### الخطوة 3: Database Setup

شغل SQL في Supabase:

```sql
-- من ملف: COMPLETE-SHOPIFY-SETUP.sql
-- يحتوي على كل الجداول والـ RLS policies
```

### الخطوة 4: Deploy to Vercel

```bash
vercel --prod
```

أو:
- Push to GitHub
- Connect to Vercel
- Auto-deploy

---

## ⚙️ الإعداد

### 1. WhatsApp Configuration

**في Meta Developer Console:**
1. WhatsApp → Configuration
2. Webhook:
   - URL: `https://your-domain.vercel.app/api/webhook`
   - Verify Token: `whatsapp_crm_2024`
3. Subscribe to: `messages`

**في الـ CRM:**
1. Settings → Profile & WhatsApp
2. أضف:
   - WhatsApp Access Token
   - Phone Number ID
3. Save

### 2. Shopify Configuration

**في Shopify Admin:**
1. Settings → Notifications → Webhooks
2. Create webhook:
   - Event: Order creation
   - URL: `https://your-domain.vercel.app/api/shopify/webhook-handler`
   - Format: JSON

**في الـ CRM:**
1. Settings → Shopify Integration
2. اختر:
   - Manual Token (أسهل)
   - أو OAuth (أكثر أماناً)
3. أدخل Shop URL و Access Token
4. Save

### 3. Template Messages

**في Meta Business Manager:**
1. Message Templates
2. Create Template:
   - Name: `moon2` (أو أي اسم)
   - Category: TRANSACTIONAL
   - Language: English/Arabic
   - Add Variables: {{1}} to {{7}}
   - Add Quick Reply Buttons
3. Submit للموافقة

**في الـ CRM:**
1. Settings → Message Templates
2. أدخل:
   - Template Name: `moon2`
   - Language: `en`
   - Enable Template
3. Save

---

## 📱 الاستخدام

### إرسال رسالة

1. اختر Contact من القائمة
2. اكتب الرسالة
3. (اختياري) أرفق ملف
4. اضغط Send

### استقبال رسالة

- الرسائل تظهر تلقائياً
- Real-time updates
- حالة الرسالة (delivered/read)

### Shopify Order Flow

```
1. عميل يطلب من Shopify
   ↓
2. Shopify يبعت Webhook
   ↓
3. السيستم يبعت رسالة تأكيد
   ↓
4. العميل يضغط "تأكيد"
   ↓
5. السيستم يحدث Shopify
   ↓
6. كل حاجة تظهر في الـ CRM
```

---

## 🗂️ هيكل المشروع

```
wahtsapp/
├── api/                          # Vercel Serverless Functions
│   ├── send-message.js          # إرسال رسائل
│   ├── external-message.js      # API خارجي
│   ├── webhook.js               # WhatsApp webhook
│   └── shopify/
│       ├── webhook-handler.js   # Shopify webhooks
│       ├── handle-button-click.js
│       └── oauth/
│           └── callback.js
├── src/
│   ├── components/              # React Components
│   │   ├── ChatWindow.jsx
│   │   ├── ChatList.jsx
│   │   ├── SettingsComplete.jsx
│   │   ├── TemplateSettings.jsx
│   │   ├── ShopifyOAuth.jsx
│   │   ├── ShopifyOrders.jsx
│   │   └── OrderMessageCard.jsx
│   ├── context/
│   │   └── BrandContext.jsx
│   ├── lib/
│   │   └── supabaseClient.js
│   └── config.js
├── *.sql                        # Database Setup Files
├── *.md                         # Documentation (Arabic)
└── package.json
```

---

## 📚 الملفات المهمة

### Setup Guides
- `COMPLETE-SHOPIFY-SETUP.sql` - إعداد الداتابيز الكامل
- `استخدام-template-moon2.md` - دليل استخدام Templates
- `اصلاح-شوبفاي-webhook.md` - إعداد Shopify Webhooks
- `حدث-التوكن-الان.md` - تحديث WhatsApp Token

### Documentation
- `SHOPIFY-DIRECT-INTEGRATION.md` - شرح تكامل Shopify
- `النظام-الكامل-جاهز.md` - دليل النظام الكامل
- `تم-اصلاح-البوتونات.md` - حل مشاكل Buttons

---

## 🔧 الصيانة

### تحديث WhatsApp Token

**Temporary Token (ينتهي كل 24 ساعة):**
```bash
node quick-update-token.js
```

**Permanent Token (موصى به):**
1. Meta Business Manager
2. System Users
3. Generate Token (Never expires)
4. حدثه في الـ CRM

### مراقبة الأخطاء

**Vercel Logs:**
```
https://vercel.com/dashboard → Logs
```

**Supabase Logs:**
```
Supabase Dashboard → Logs
```

---

## 🆘 استكشاف الأخطاء

### الرسائل مش بتوصل

1. تحقق من WhatsApp Token
2. تحقق من Webhook Configuration
3. شوف Vercel Logs

### Shopify Orders مش بتظهر

1. تحقق من Shopify Webhook
2. تحقق من Shopify Connection في الـ CRM
3. شوف Database Tables

### Buttons مش شغالة

1. تأكد من WhatsApp Webhook
2. تأكد من Subscribe to `messages`
3. جرب Interactive Message بدل Template

---

## 📊 Database Schema

### Tables
- `brands` - البراندات
- `contacts` - جهات الاتصال
- `messages` - الرسائل
- `shopify_connections` - اتصالات Shopify
- `shopify_orders` - الطلبات
- `shopify_webhook_logs` - سجل Webhooks

### Key Columns
- `messages.order_id` - ربط الرسالة بالأوردر
- `brands.template_name` - اسم الـ Template
- `brands.use_template` - تفعيل/تعطيل Template

---

## 🔐 الأمان

- ✅ RLS Policies على كل الجداول
- ✅ Webhook Verification
- ✅ Environment Variables
- ✅ CORS Configuration
- ✅ Multi-tenant Isolation

---

## 🚀 Production Checklist

- [ ] WhatsApp Token محدث
- [ ] Webhook متوصل ومتحقق منه
- [ ] Shopify Webhook مضاف
- [ ] Database Tables موجودة
- [ ] RLS Policies مفعلة
- [ ] Template Messages معتمدة
- [ ] Environment Variables صحيحة
- [ ] Vercel Deployment ناجح

---

## 📞 الدعم

للمشاكل والاستفسارات:
- GitHub Issues
- Documentation Files (*.md)

---

## 📝 License

MIT License

---

## 🎉 Contributors

- Mohammed Ahmed (@m0hammedahmed)

---

**🚀 النظام جاهز للإنتاج!**

**Live Demo:** https://wahtsapp2.vercel.app

**GitHub:** https://github.com/m0hammedahmed/wahtsapp
