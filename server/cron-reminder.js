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
