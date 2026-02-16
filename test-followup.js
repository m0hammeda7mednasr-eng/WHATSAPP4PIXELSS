// Test Follow-up Message System
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testFollowup() {
  console.log('🧪 Testing Follow-up Message System...\n');

  try {
    // 1. Check if column exists
    console.log('📋 Step 1: Checking database schema...');
    const { data: orders, error: schemaError } = await supabase
      .from('shopify_orders')
      .select('id, followup_sent_at')
      .limit(1);

    if (schemaError) {
      console.error('❌ Column followup_sent_at not found!');
      console.log('\n🔧 Fix: Run this SQL in Supabase:');
      console.log('   ALTER TABLE shopify_orders ADD COLUMN followup_sent_at TIMESTAMPTZ;');
      return;
    }

    console.log('✅ Database schema is correct\n');

    // 2. Get confirmed orders without follow-up
    console.log('📋 Step 2: Finding orders needing follow-up...');
    
    // For testing, get orders confirmed more than 5 minutes ago (not 1 hour)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data: pendingOrders, error: ordersError } = await supabase
      .from('shopify_orders')
      .select('*, brands(*), contacts(*)')
      .eq('confirmation_status', 'confirmed')
      .is('followup_sent_at', null)
      .lt('confirmed_at', fiveMinutesAgo)
      .limit(5);

    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError);
      return;
    }

    if (!pendingOrders || pendingOrders.length === 0) {
      console.log('⚠️  No orders found needing follow-up');
      console.log('   (Looking for orders confirmed more than 5 minutes ago)');
      console.log('\n💡 Tip: Confirm a test order and wait 5 minutes');
      return;
    }

    console.log(`✅ Found ${pendingOrders.length} order(s) needing follow-up\n`);

    // 3. Send follow-up for first order
    const order = pendingOrders[0];
    const brand = order.brands;
    const contact = order.contacts;

    console.log('📋 Step 3: Sending follow-up message...');
    console.log('   Order:', order.shopify_order_number);
    console.log('   Customer:', contact.name);
    console.log('   Phone:', contact.wa_id);
    console.log('');

    if (!brand.whatsapp_token) {
      console.error('❌ WhatsApp token not found for brand');
      return;
    }

    const followupMessage = `مرحباً ${contact.name || 'عزيزي العميل'} 👋

شكراً لتأكيدك طلب رقم #${order.shopify_order_number || order.shopify_order_id} 🎉

نحن الآن نجهز طلبك بعناية، وسيتم التواصل معك قريباً لترتيب موعد التوصيل 🚚

إذا كان لديك أي استفسار، لا تتردد في التواصل معنا.

شكراً لثقتك في ${brand.name} ${brand.brand_emoji || '💙'}`;

    console.log('📤 Sending message...');
    
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
          to: contact.wa_id,
          type: 'text',
          text: { body: followupMessage }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Failed to send message:', error.error?.message);
      return;
    }

    const data = await response.json();
    console.log('✅ Message sent successfully!');
    console.log('   Message ID:', data.messages[0].id);
    console.log('');

    // 4. Save to database
    console.log('📋 Step 4: Saving to database...');

    // Save message
    await supabase
      .from('messages')
      .insert({
        contact_id: contact.id,
        brand_id: brand.id,
        direction: 'outbound',
        message_type: 'text',
        body: followupMessage,
        wa_message_id: data.messages[0].id,
        status: 'sent'
      });

    // Mark follow-up as sent
    await supabase
      .from('shopify_orders')
      .update({ followup_sent_at: new Date().toISOString() })
      .eq('id', order.id);

    console.log('✅ Saved to database\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ TEST COMPLETED SUCCESSFULLY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('Check WhatsApp to confirm message was received.');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   - Orders needing follow-up: ${pendingOrders.length}`);
    console.log(`   - Follow-up sent for order: #${order.shopify_order_number}`);
    console.log(`   - Customer: ${contact.name}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  }
}

testFollowup().catch(console.error);
