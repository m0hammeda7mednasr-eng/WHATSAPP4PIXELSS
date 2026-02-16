# 🛍️ Shopify Integration - Complete Implementation Guide

## Overview
نظام متكامل لربط WhatsApp CRM مع Shopify، يسمح بإرسال رسائل تأكيد الطلبات مع أزرار تفاعلية، وتحديث حالة الطلب في Shopify تلقائياً.

---

## 🎯 Features

### 1. Multi-Tenant Support
- كل brand يقدر يربط متجر Shopify خاص بيه
- عزل كامل للبيانات بين الـ brands
- OAuth flow محترف (مش manual tokens)

### 2. Interactive Buttons
- إرسال رسائل تأكيد مع زرارين:
  - ✅ تأكيد الطلب
  - ❌ إلغاء الطلب
- رد تلقائي في الشات بعد الضغط
- تحديث فوري في Shopify

### 3. Shopify Actions
- **تأكيد الطلب:**
  - إضافة tag: `whatsapp-confirmed`
  - تحديث note: "تم التأكيد عبر WhatsApp"
  - حفظ timestamp
  
- **إلغاء الطلب:**
  - إلغاء الطلب في Shopify
  - السبب: `customer`
  - تحديث حالة الشات

### 4. Error Handling
- Token expired → إعادة OAuth
- Order not found → رسالة واضحة
- Network errors → retry mechanism
- Logging كامل للـ debugging

---

## 📊 Database Schema

### Tables Created:
1. **shopify_connections** - OAuth tokens & store info
2. **shopify_orders** - Order tracking & confirmation status
3. **shopify_webhook_logs** - Debugging logs

### RLS Policies:
- كل user يشوف بيانات brands بتاعته بس
- Security محكم

---

## 🔄 Flow Diagram

```
n8n → Send Order Confirmation
  ↓
WhatsApp API (with buttons)
  ↓
Customer clicks button
  ↓
WhatsApp Webhook → Our Backend
  ↓
Identify button clicked
  ↓
Update Shopify Order
  ↓
Send confirmation message
  ↓
Update CRM database
```

---

## 🚀 Implementation Steps

### Step 1: Database Setup
```bash
# Run in Supabase SQL Editor
psql < database-shopify-integration.sql
```

### Step 2: Create Shopify App
1. Go to: https://partners.shopify.com
2. Create new app
3. Set OAuth redirect: `https://your-domain.vercel.app/api/shopify/callback`
4. Get API Key & Secret

### Step 3: Environment Variables
```env
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_SCOPES=read_orders,write_orders
```

### Step 4: Deploy Backend
- Vercel Serverless Functions
- All APIs ready in `/api` folder

### Step 5: Frontend Integration
- Settings page with "Connect Shopify" button
- OAuth flow automatic
- Order logs display

---

## 📡 API Endpoints

### 1. Send Order Confirmation (from n8n)
```
POST /api/shopify/send-order-confirmation

Body:
{
  "phone_number": "201234567890",
  "order_id": "5678901234",
  "order_number": "#1234",
  "customer_name": "أحمد",
  "total": "500 EGP",
  "brand_id": "uuid"
}

Response:
{
  "success": true,
  "message_id": "wamid.xxx",
  "order_tracked": true
}
```

### 2. Webhook Handler (from WhatsApp)
```
POST /webhook/whatsapp

Handles:
- Button clicks (interactive messages)
- Updates Shopify automatically
- Sends confirmation to customer
```

### 3. Shopify OAuth
```
GET /api/shopify/auth?brand_id=uuid
→ Redirects to Shopify OAuth

GET /api/shopify/callback?code=xxx&state=brand_id
→ Saves token & completes connection
```

---

## 🧪 Testing

### Test 1: Send Order Confirmation
```bash
node test-shopify-order-confirmation.js
```

### Test 2: Simulate Button Click
```bash
node test-shopify-button-click.js
```

### Test 3: Shopify API Connection
```bash
node test-shopify-api.js
```

---

## 🔒 Security

### 1. Token Encryption
- Shopify tokens encrypted in database
- Never exposed in frontend

### 2. Webhook Verification
- HMAC signature validation
- Prevents fake webhooks

### 3. RLS Policies
- Row-level security in Supabase
- Users can't access other brands' data

---

## 📝 n8n Workflow Example

```json
{
  "nodes": [
    {
      "name": "Shopify Order Created",
      "type": "n8n-nodes-base.shopifyTrigger"
    },
    {
      "name": "Send WhatsApp Confirmation",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://your-domain.vercel.app/api/shopify/send-order-confirmation",
        "method": "POST",
        "body": {
          "phone_number": "={{ $json.customer.phone }}",
          "order_id": "={{ $json.id }}",
          "order_number": "={{ $json.order_number }}",
          "customer_name": "={{ $json.customer.first_name }}",
          "total": "={{ $json.total_price }} {{ $json.currency }}",
          "brand_id": "your-brand-uuid"
        }
      }
    }
  ]
}
```

---

## 🎨 Frontend Components

### 1. ShopifySettings.jsx
- Connect/Disconnect Shopify
- Show connection status
- Display store info

### 2. OrderLogs.jsx
- List all orders sent
- Show confirmation status
- Real-time updates

### 3. ShopifyOAuthCallback.jsx
- Handle OAuth redirect
- Save token
- Show success message

---

## 🐛 Troubleshooting

### Problem: "Token expired"
**Solution:** User needs to reconnect Shopify (OAuth again)

### Problem: "Order not found"
**Solution:** Check if order_id is correct in Shopify

### Problem: "Button not working"
**Solution:** 
1. Check WhatsApp webhook is configured
2. Verify phone_number_id matches
3. Check logs in shopify_webhook_logs table

---

## 📈 Monitoring

### Logs to Check:
1. **shopify_webhook_logs** - All incoming webhooks
2. **shopify_orders** - Order tracking & status
3. **messages** - WhatsApp messages sent/received

### Metrics:
- Confirmation rate (confirmed / total sent)
- Response time (webhook → Shopify update)
- Error rate

---

## 🔄 Future Enhancements

1. **Bulk Orders:** Send multiple confirmations at once
2. **Custom Messages:** Template system for different order types
3. **Analytics Dashboard:** Charts & insights
4. **Automated Reminders:** If customer doesn't respond in X hours
5. **Multi-language:** Support Arabic & English

---

## 📞 Support

For issues or questions:
1. Check logs in Supabase
2. Review error messages in console
3. Test with provided scripts

---

## ✅ Checklist

- [ ] Database schema created
- [ ] Shopify App created in Partners
- [ ] Environment variables set
- [ ] Backend APIs deployed
- [ ] Frontend components added
- [ ] OAuth flow tested
- [ ] Button interaction tested
- [ ] Shopify order update tested
- [ ] Error handling verified
- [ ] Documentation reviewed

---

**Ready to implement! 🚀**
