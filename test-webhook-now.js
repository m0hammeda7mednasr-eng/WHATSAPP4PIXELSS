// Test if webhook is receiving messages
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testWebhook() {
  console.log('🔍 Testing Webhook Setup...\n');

  // 1. Check brands
  const { data: brands } = await supabase
    .from('brands')
    .select('*');

  console.log('📱 Brands:');
  brands.forEach(brand => {
    console.log(`   - ${brand.name}`);
    console.log(`     Phone ID: ${brand.phone_number_id}`);
    console.log(`     Token: ${brand.whatsapp_token ? '✅ Set' : '❌ Missing'}`);
  });

  // 2. Check recent messages
  console.log('\n📨 Recent Messages (last 10):');
  const { data: messages } = await supabase
    .from('messages')
    .select('*, contacts(name, wa_id)')
    .order('created_at', { ascending: false })
    .limit(10);

  if (messages && messages.length > 0) {
    messages.forEach(msg => {
      const time = new Date(msg.created_at).toLocaleString('ar-EG');
      const direction = msg.direction === 'inbound' ? '📥' : '📤';
      console.log(`   ${direction} ${time}`);
      console.log(`      From: ${msg.contacts?.name || msg.contacts?.wa_id}`);
      console.log(`      Type: ${msg.message_type}`);
      console.log(`      Body: ${msg.body?.substring(0, 50)}...`);
      if (msg.order_id) {
        console.log(`      🛒 Order ID: ${msg.order_id}`);
      }
      console.log('');
    });
  } else {
    console.log('   ⚠️  No messages found in database');
  }

  // 3. Check contacts
  console.log('\n👥 Contacts:');
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .order('last_message_at', { ascending: false })
    .limit(5);

  if (contacts && contacts.length > 0) {
    contacts.forEach(contact => {
      console.log(`   - ${contact.name} (${contact.wa_id})`);
      console.log(`     Last message: ${new Date(contact.last_message_at).toLocaleString('ar-EG')}`);
    });
  } else {
    console.log('   ⚠️  No contacts found');
  }

  // 4. Check orders
  console.log('\n🛒 Recent Orders:');
  const { data: orders } = await supabase
    .from('shopify_orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (orders && orders.length > 0) {
    orders.forEach(order => {
      console.log(`   - Order #${order.shopify_order_number}`);
      console.log(`     Status: ${order.confirmation_status}`);
      console.log(`     Total: ${order.total_price} ${order.currency}`);
      console.log(`     Phone: ${order.customer_phone}`);
    });
  } else {
    console.log('   ⚠️  No orders found');
  }

  console.log('\n\n📋 Webhook URL:');
  console.log('   https://wahtsapp2.vercel.app/api/webhook');
  console.log('\n📋 Verify Token:');
  console.log('   whatsapp_crm_2024');

  console.log('\n\n✅ Test complete!');
}

testWebhook();
