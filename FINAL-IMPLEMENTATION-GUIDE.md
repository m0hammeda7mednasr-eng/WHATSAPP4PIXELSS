# 🎯 دليل التنفيذ النهائي - WhatsApp CRM

## ✅ النظام الكامل

### المميزات:
- ✅ كل عميل (brand) يقدر يخصص رسائله
- ✅ 4 أنواع رسائل قابلة للتخصيص
- ✅ متغيرات تتملى تلقائياً
- ✅ توفير في التكلفة
- ✅ نظام احترافي

---

## 📋 الخطوات الكاملة:

### 1️⃣ Database Setup

**شغل في Supabase SQL Editor:**
```
https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/sql/new
```

**انسخ والصق:**
```sql
-- File: SETUP-ALL-MESSAGES.sql

-- Add all message columns
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS brand_emoji TEXT DEFAULT '🏢',
ADD COLUMN IF NOT EXISTS existing_customer_message TEXT,
ADD COLUMN IF NOT EXISTS confirmation_message TEXT,
ADD COLUMN IF NOT EXISTS cancellation_message TEXT,
ADD COLUMN IF NOT EXISTS reminder_message TEXT;

-- Set default emoji
UPDATE brands 
SET brand_emoji = '🏢' 
WHERE brand_emoji IS NULL;

-- Add tracking columns to orders
ALTER TABLE shopify_orders
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS customer_response TEXT,
ADD COLUMN IF NOT EXISTS response_at TIMESTAMPTZ;
```

---

### 2️⃣ Backend - معالجة الرسائل

**الملف:** `server/webhook-server-simple.js`

**التعديلات المطلوبة:**

#### أ) معالجة الأزرار (Button Clicks):
```javascript
// في webhook handler
if (messages.type === 'button') {
  const buttonPayload = messages.button.payload;
  const buttonText = messages.button.text;
  
  console.log('🔘 Button clicked:', buttonText);
  
  // Find order by contact
  const { data: order } = await supabase
    .from('shopify_orders')
    .select('*')
    .eq('contact_id', contact.id)
    .eq('confirmation_status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (order) {
    if (buttonPayload === 'confirm_order') {
      await handleOrderConfirmation(order, contact, brand);
    } else if (buttonPayload === 'cancel_order') {
      await handleOrderCancellation(order, contact, brand);
    }
  }
}
```

#### ب) معالجة الردود النصية:
```javascript
// في webhook handler
if (messages.type === 'text') {
  const messageText = messages.text.body.toLowerCase().trim();
  
  // Check for confirmation/cancellation keywords
  if (messageText.includes('تأكيد') || messageText.includes('confirm')) {
    // Find pending order
    const { data: order } = await supabase
      .from('shopify_orders')
      .select('*')
      .eq('contact_id', contact.id)
      .eq('confirmation_status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (order) {
      await handleOrderConfirmation(order, contact, brand);
    }
  } else if (messageText.includes('إلغاء') || messageText.includes('cancel')) {
    // Find pending order
    const { data: order } = await supabase
      .from('shopify_orders')
      .select('*')
      .eq('contact_id', contact.id)
      .eq('confirmation_status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (order) {
      await handleOrderCancellation(order, contact, brand);
    }
  }
}
```

#### ج) دوال المعالجة:
```javascript
async function handleOrderConfirmation(order, contact, brand) {
  console.log('✅ Processing order confirmation');
  
  // Update order status
  await supabase
    .from('shopify_orders')
    .update({
      confirmation_status: 'confirmed',
      customer_response: 'confirmed',
      response_at: new Date().toISOString()
    })
    .eq('id', order.id);
  
  // Get confirmation message
  let messageText = brand.confirmation_message || `✅ تم تأكيد طلبك بنجاح!

شكراً {customer_name}! 🎉

🧾 رقم الطلب: #{order_number}

نحن الآن نجهز طلبك بعناية 🚚

شكراً لثقتك في {brand_name} 💙`;
  
  // Replace variables
  messageText = messageText
    .replace(/{customer_name}/g, contact.name)
    .replace(/{order_number}/g, order.shopify_order_number)
    .replace(/{brand_name}/g, brand.name);
  
  // Send message
  await sendWhatsAppMessage(brand, contact.wa_id, messageText);
  
  console.log('✅ Confirmation message sent');
}

async function handleOrderCancellation(order, contact, brand) {
  console.log('❌ Processing order cancellation');
  
  // Update order status
  await supabase
    .from('shopify_orders')
    .update({
      confirmation_status: 'cancelled',
      customer_response: 'cancelled',
      response_at: new Date().toISOString()
    })
    .eq('id', order.id);
  
  // Get cancellation message
  let messageText = brand.cancellation_message || `❌ تم إلغاء طلبك

{customer_name}، تم إلغاء طلب رقم #{order_number} بنجاح.

يمكنك الطلب مرة أخرى في أي وقت 💙`;
  
  // Replace variables
  messageText = messageText
    .replace(/{customer_name}/g, contact.name)
    .replace(/{order_number}/g, order.shopify_order_number)
    .replace(/{brand_name}/g, brand.name);
  
  // Send message
  await sendWhatsAppMessage(brand, contact.wa_id, messageText);
  
  console.log('✅ Cancellation message sent');
}

async function sendWhatsAppMessage(brand, phone, text) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${brand.phone_number_id}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${brand.whatsapp_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: { body: text }
      })
    }
  );
  
  return response.json();
}
```

---

### 3️⃣ Cron Job - رسالة التذكير

**ملف جديد:** `server/cron-reminder.js`

```javascript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rmpgofswkpjxionzythf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function sendReminders() {
  console.log('⏰ Checking for orders needing reminders...');
  
  // Get orders that need reminders (1 hour old, no response, no reminder sent)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  
  const { data: orders, error } = await supabase
    .from('shopify_orders')
    .select('*, contacts(*), brands(*)')
    .eq('confirmation_status', 'pending')
    .eq('reminder_sent', false)
    .lt('created_at', oneHourAgo);
  
  if (error) {
    console.error('❌ Error fetching orders:', error);
    return;
  }
  
  console.log(`📋 Found ${orders.length} orders needing reminders`);
  
  for (const order of orders) {
    try {
      // Get reminder message
      let messageText = order.brands.reminder_message || `👋 مرحباً {customer_name}

لسه مستنيين ردك على طلب رقم #{order_number} 🛍️

عشان نبدأ نجهز طلبك، محتاجين تأكيدك.

📥 رد بـ "تأكيد" أو "إلغاء"`;
      
      // Replace variables
      messageText = messageText
        .replace(/{customer_name}/g, order.contacts.name)
        .replace(/{order_number}/g, order.shopify_order_number)
        .replace(/{brand_name}/g, order.brands.name);
      
      // Send message
      await sendWhatsAppMessage(
        order.brands,
        order.contacts.wa_id,
        messageText
      );
      
      // Mark reminder as sent
      await supabase
        .from('shopify_orders')
        .update({
          reminder_sent: true,
          reminder_sent_at: new Date().toISOString()
        })
        .eq('id', order.id);
      
      console.log(`✅ Reminder sent for order #${order.shopify_order_number}`);
      
    } catch (error) {
      console.error(`❌ Error sending reminder for order ${order.id}:`, error);
    }
  }
  
  console.log('✅ Reminder check completed');
}

async function sendWhatsAppMessage(brand, phone, text) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${brand.phone_number_id}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${brand.whatsapp_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: { body: text }
      })
    }
  );
  
  return response.json();
}

// Run every 5 minutes
setInterval(sendReminders, 5 * 60 * 1000);

// Run immediately on start
sendReminders();

console.log('⏰ Reminder cron job started');
```

**تشغيل الـ Cron:**
```bash
# Terminal جديد
cd wahtsapp-main/server
node cron-reminder.js
```

---

### 4️⃣ Frontend - جاهز!

الصفحات جاهزة:
- ✅ `TemplateSettings.jsx` - تخصيص الرسائل
- ✅ `MessageTemplates.jsx` - Templates من Meta
- ✅ `ShopifyOrders.jsx` - عرض الطلبات

---

## 🎯 كيف يعمل النظام:

### للعملاء الجدد:
```
1. Order جديد → Template من Meta (moon2) بأزرار
2. يضغط "تأكيد" → رسالة تأكيد
3. يضغط "إلغاء" → رسالة إلغاء
4. مايردش ساعة → رسالة تذكير
```

### للعملاء الموجودين:
```
1. Order جديد → رسالة عادية (بدون أزرار)
2. يرد "تأكيد" → رسالة تأكيد
3. يرد "إلغاء" → رسالة إلغاء
4. مايردش ساعة → رسالة تذكير
```

---

## 📁 الملفات المطلوبة:

### Database:
- ✅ `SETUP-ALL-MESSAGES.sql`

### Backend:
- ⏳ تعديل `server/webhook-server-simple.js`
- ⏳ إنشاء `server/cron-reminder.js`

### Frontend:
- ✅ `src/components/TemplateSettings.jsx`
- ✅ `src/components/MessageTemplates.jsx`

---

## 🚀 خطوات التشغيل:

1. **Database:** شغل `SETUP-ALL-MESSAGES.sql`
2. **Backend:** عدل webhook handler
3. **Cron:** شغل `cron-reminder.js`
4. **Frontend:** أعد تحميل الموقع
5. **Test:** اعمل order تجريبي

---

## 💰 التوفير:

- عميل جديد: Template (~$0.005)
- عميل موجود: مجاني (في conversation)
- رسائل إضافية: مجاني (في conversation)
- **توفير متوقع: 60-80%**

---

**النظام احترافي ومتكامل! 🎯**
