# 🎯 الدليل الشامل الكامل - WhatsApp CRM System

## 📋 جدول المحتويات
1. [نظرة عامة](#نظرة-عامة)
2. [Database Setup](#database-setup)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Setup](#frontend-setup)
5. [Testing](#testing)
6. [Deployment](#deployment)

---

## 🌟 نظرة عامة

### النظام الكامل:
```
Order من Shopify
    ↓
رسالة بأزرار (✅ تأكيد / ❌ إلغاء)
    ↓
يضغط زر → رسالة تأكيد/إلغاء
    ↓
لو ماردش ساعة → رسالة تذكير
```

### المميزات:
- ✅ رسائل بأزرار تفاعلية
- ✅ كل brand يخصص رسائله
- ✅ تتبع كامل للطلبات
- ✅ تذكير تلقائي بعد ساعة
- ✅ توفير في التكلفة

---

## 📊 Database Setup

### الخطوة 1: شغل SQL في Supabase

**افتح:**
```
https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/sql/new
```

**انسخ والصق:**

```sql
-- ═══════════════════════════════════════════════════════════════
-- COMPLETE DATABASE SETUP - WhatsApp CRM
-- ═══════════════════════════════════════════════════════════════

-- 1. Add message columns to brands
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS brand_emoji TEXT DEFAULT '🏢',
ADD COLUMN IF NOT EXISTS existing_customer_message TEXT,
ADD COLUMN IF NOT EXISTS confirmation_message TEXT,
ADD COLUMN IF NOT EXISTS cancellation_message TEXT,
ADD COLUMN IF NOT EXISTS reminder_message TEXT;

UPDATE brands SET brand_emoji = '🏢' WHERE brand_emoji IS NULL;

-- 2. Add tracking columns to orders
ALTER TABLE shopify_orders
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS customer_response TEXT,
ADD COLUMN IF NOT EXISTS response_at TIMESTAMPTZ;

-- 3. Add indexes
CREATE INDEX IF NOT EXISTS idx_orders_reminder 
ON shopify_orders(confirmation_status, reminder_sent, created_at) 
WHERE confirmation_status = 'pending' AND reminder_sent = false;

-- 4. Success
DO $$
BEGIN
  RAISE NOTICE '✅ DATABASE SETUP COMPLETED!';
END $$;
```

---

## 💻 Backend Implementation

### ملف: `server/webhook-server-simple.js`

#### التعديلات المطلوبة:

**1. إضافة دالة إرسال Interactive Message:**

```javascript
// Add this function after handleOrderCreate
async function sendInteractiveMessage(brand, phone, messageText, orderId) {
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
        recipient_type: 'individual',
        to: phone,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: {
            text: messageText
          },
          action: {
            buttons: [
              {
                type: 'reply',
                reply: {
                  id: `confirm_${orderId}`,
                  title: '✅ تأكيد'
                }
              },
              {
                type: 'reply',
                reply: {
                  id: `cancel_${orderId}`,
                  title: '❌ إلغاء'
                }
              }
            ]
          }
        }
      })
    }
  );
  
  return response.json();
}
```

**2. تعديل handleOrderCreate لاستخدام Interactive Message:**

ابحث عن السطر:
```javascript
console.log('📤 Sending WhatsApp message...');
```

واستبدل كل الكود بعده بـ:

```javascript
console.log('📤 Sending WhatsApp message...');
console.log('📋 Message type: interactive with buttons');

// Send interactive message with buttons
const whatsappData = await sendInteractiveMessage(
  brand,
  phone,
  messageText,
  savedOrder.id
);

if (whatsappData.error) {
  console.error('❌ WhatsApp API error:', whatsappData);
  return;
}

const wa_message_id = whatsappData.messages?.[0]?.id;
console.log('✅ WhatsApp message sent:', wa_message_id);

// Save message to database
await supabase
  .from('messages')
  .insert({
    contact_id: contact.id,
    brand_id: brand.id,
    order_id: savedOrder.id,
    direction: 'outbound',
    message_type: 'interactive',
    body: messageText,
    wa_message_id: wa_message_id,
    status: 'sent',
    created_at: new Date().toISOString()
  });

console.log('✅ Order processing completed successfully!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
```

**3. إضافة معالجة ضغطات الأزرار:**

ابحث عن:
```javascript
if (messages.type === 'text') {
```

وأضف قبله:

```javascript
// Handle button clicks
if (messages.type === 'interactive') {
  const buttonReply = messages.interactive?.button_reply;
  const buttonId = buttonReply?.id;
  
  console.log('🔘 Button clicked:', buttonReply?.title);
  console.log('🆔 Button ID:', buttonId);
  
  if (buttonId) {
    // Extract action and order ID from button ID
    const [action, orderId] = buttonId.split('_');
    
    if (action === 'confirm') {
      await handleOrderConfirmation(orderId, contact, brand);
    } else if (action === 'cancel') {
      await handleOrderCancellation(orderId, contact, brand);
    }
  }
  
  return res.status(200).json({ success: true });
}
```

**4. إضافة دوال المعالجة:**

أضف في نهاية الملف قبل `app.listen`:

```javascript
// ============================================
// Order Confirmation Handler
// ============================================
async function handleOrderConfirmation(orderId, contact, brand) {
  console.log('✅ Processing order confirmation for order:', orderId);
  
  try {
    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('shopify_orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (orderError || !order) {
      console.error('❌ Order not found:', orderId);
      return;
    }
    
    // Update order status
    await supabase
      .from('shopify_orders')
      .update({
        confirmation_status: 'confirmed',
        customer_response: 'confirmed',
        response_at: new Date().toISOString()
      })
      .eq('id', orderId);
    
    console.log('✅ Order status updated to confirmed');
    
    // Get confirmation message
    let messageText = brand.confirmation_message || `✅ *تم تأكيد طلبك بنجاح!*

شكراً {customer_name}! 🎉

🧾 رقم الطلب: #{order_number}

نحن الآن نجهز طلبك بعناية، وسيتم التواصل معك قريباً لترتيب موعد التوصيل 🚚

شكراً لثقتك في {brand_name} 💙`;
    
    // Replace variables
    messageText = messageText
      .replace(/{customer_name}/g, contact.name)
      .replace(/{order_number}/g, order.shopify_order_number)
      .replace(/{brand_name}/g, brand.name);
    
    // Send confirmation message
    await sendTextMessage(brand, contact.wa_id, messageText);
    
    console.log('✅ Confirmation message sent');
    
  } catch (error) {
    console.error('❌ Error in handleOrderConfirmation:', error);
  }
}

// ============================================
// Order Cancellation Handler
// ============================================
async function handleOrderCancellation(orderId, contact, brand) {
  console.log('❌ Processing order cancellation for order:', orderId);
  
  try {
    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('shopify_orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (orderError || !order) {
      console.error('❌ Order not found:', orderId);
      return;
    }
    
    // Update order status
    await supabase
      .from('shopify_orders')
      .update({
        confirmation_status: 'cancelled',
        customer_response: 'cancelled',
        response_at: new Date().toISOString()
      })
      .eq('id', orderId);
    
    console.log('✅ Order status updated to cancelled');
    
    // Get cancellation message
    let messageText = brand.cancellation_message || `❌ *تم إلغاء طلبك*

{customer_name}، تم إلغاء طلب رقم #{order_number} بنجاح.

نأسف لعدم إتمام الطلب. يمكنك الطلب مرة أخرى في أي وقت.

نتمنى خدمتك قريباً 💙`;
    
    // Replace variables
    messageText = messageText
      .replace(/{customer_name}/g, contact.name)
      .replace(/{order_number}/g, order.shopify_order_number)
      .replace(/{brand_name}/g, brand.name);
    
    // Send cancellation message
    await sendTextMessage(brand, contact.wa_id, messageText);
    
    console.log('✅ Cancellation message sent');
    
  } catch (error) {
    console.error('❌ Error in handleOrderCancellation:', error);
  }
}

// ============================================
// Send Text Message Helper
// ============================================
async function sendTextMessage(brand, phone, text) {
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

## ⏰ Cron Job - رسالة التذكير

### ملف جديد: `server/cron-reminder.js`

```javascript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rmpgofswkpjxionzythf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('⏰ Reminder Cron Job Started');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function sendReminders() {
  console.log('⏰ Checking for orders needing reminders...');
  console.log('Time:', new Date().toLocaleString('ar-EG'));
  
  // Get orders older than 1 hour with no response
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  
  const { data: orders, error } = await supabase
    .from('shopify_orders')
    .select(`
      *,
      contacts (id, name, wa_id),
      brands (id, name, phone_number_id, whatsapp_token, reminder_message)
    `)
    .eq('confirmation_status', 'pending')
    .eq('reminder_sent', false)
    .lt('created_at', oneHourAgo);
  
  if (error) {
    console.error('❌ Error fetching orders:', error);
    return;
  }
  
  console.log(`📋 Found ${orders?.length || 0} orders needing reminders\n`);
  
  if (!orders || orders.length === 0) {
    return;
  }
  
  for (const order of orders) {
    try {
      console.log(`📤 Sending reminder for order #${order.shopify_order_number}`);
      
      // Get reminder message
      let messageText = order.brands.reminder_message || `👋 مرحباً {customer_name}

لسه مستنيين ردك على طلب رقم #{order_number} 🛍️

عشان نبدأ نجهز طلبك، محتاجين تأكيدك.

📥 *هل نعتمد الطلب ونبدأ التجهيز؟*

رد بـ "تأكيد" أو "إلغاء"`;
      
      // Replace variables
      messageText = messageText
        .replace(/{customer_name}/g, order.contacts.name)
        .replace(/{order_number}/g, order.shopify_order_number)
        .replace(/{brand_name}/g, order.brands.name);
      
      // Send reminder
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${order.brands.phone_number_id}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${order.brands.whatsapp_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: order.contacts.wa_id,
            type: 'text',
            text: { body: messageText }
          })
        }
      );
      
      const data = await response.json();
      
      if (data.error) {
        console.error(`❌ Error sending reminder:`, data.error);
        continue;
      }
      
      // Mark reminder as sent
      await supabase
        .from('shopify_orders')
        .update({
          reminder_sent: true,
          reminder_sent_at: new Date().toISOString()
        })
        .eq('id', order.id);
      
      console.log(`✅ Reminder sent for order #${order.shopify_order_number}\n`);
      
    } catch (error) {
      console.error(`❌ Error processing order ${order.id}:`, error);
    }
  }
  
  console.log('✅ Reminder check completed');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run every 5 minutes
setInterval(sendReminders, 5 * 60 * 1000);

// Run immediately on start
sendReminders();
```

---

## 🎨 Frontend Setup

### الملفات جاهزة:
- ✅ `src/components/TemplateSettings.jsx`
- ✅ `src/components/MessageTemplates.jsx`
- ✅ `src/context/BrandContext.jsx`

---

## 🧪 Testing

### Test 1: Order جديد
```bash
1. اعمل order في Shopify
2. لازم تيجي رسالة بأزرار (✅ تأكيد / ❌ إلغاء)
3. اضغط تأكيد → لازم تيجي رسالة تأكيد
```

### Test 2: إلغاء
```bash
1. اعمل order تاني
2. اضغط إلغاء → لازم تيجي رسالة إلغاء
```

### Test 3: تذكير
```bash
1. اعمل order
2. ماتردش
3. بعد ساعة → لازم تيجي رسالة تذكير
```

---

## 🚀 Deployment

### الخطوات:

**1. Database:**
```bash
# شغل SQL في Supabase
COMPLETE-DATABASE-SETUP.sql
```

**2. Backend:**
```bash
# Terminal 1: Main Server
cd wahtsapp-main/server
node webhook-server-simple.js

# Terminal 2: Cron Job
cd wahtsapp-main/server
node cron-reminder.js

# Terminal 3: ngrok
cd wahtsapp-main
ngrok http 3001
```

**3. Frontend:**
```bash
# Terminal 4: Frontend
cd wahtsapp-main
npm run dev
```

**4. Configure:**
```
1. افتح: http://localhost:5173
2. Settings → Template Settings
3. عدل الرسائل
4. احفظ
```

---

## 📊 الملخص النهائي

### ✅ ما تم:
- Database: 4 رسائل + 4 tracking columns
- Backend: Interactive messages + Button handling
- Cron: Reminder system
- Frontend: Template settings page

### 🎯 النتيجة:
- رسائل بأزرار تفاعلية
- تتبع كامل للطلبات
- تذكير تلقائي
- نظام احترافي متكامل

---

**النظام جاهز 100%! 🎉**
