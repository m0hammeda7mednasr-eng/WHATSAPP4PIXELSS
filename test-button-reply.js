// Test Button Reply - Send confirmation message
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testButtonReply() {
  console.log('🧪 Testing Button Reply System...\n');

  try {
    // 1. Get brand info
    console.log('📋 Step 1: Getting brand info...');
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('*')
      .eq('name', '4 Pixels')
      .single();

    if (brandError || !brand) {
      console.error('❌ Brand not found:', brandError);
      return;
    }

    console.log('✅ Brand found:', brand.name);
    console.log('   Phone Number ID:', brand.phone_number_id);
    console.log('   Token:', brand.whatsapp_token ? '✅ Exists' : '❌ Missing');
    console.log('');

    // 2. Check if token is valid
    console.log('📋 Step 2: Testing WhatsApp Token...');
    const testUrl = `https://graph.facebook.com/v18.0/${brand.phone_number_id}`;
    const testResponse = await fetch(testUrl, {
      headers: {
        'Authorization': `Bearer ${brand.whatsapp_token}`
      }
    });

    if (!testResponse.ok) {
      const error = await testResponse.json();
      console.error('❌ Token is invalid or expired!');
      console.error('   Error:', error.error?.message);
      console.log('\n🔧 Fix: Update token in CRM Settings');
      return;
    }

    console.log('✅ Token is valid');
    console.log('');

    // 3. Get latest order
    console.log('📋 Step 3: Getting latest order...');
    const { data: order, error: orderError } = await supabase
      .from('shopify_orders')
      .select('*')
      .eq('brand_id', brand.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (orderError || !order) {
      console.error('❌ No orders found');
      return;
    }

    console.log('✅ Order found:');
    console.log('   Order ID:', order.id);
    console.log('   Order Number:', order.shopify_order_number);
    console.log('   Customer Phone:', order.customer_phone);
    console.log('   Status:', order.confirmation_status);
    console.log('');

    // 4. Test sending confirmation message
    console.log('📋 Step 4: Testing confirmation message...');
    
    const confirmationMessage = `✅ تم تأكيد طلبك بنجاح!

رقم الطلب: ${order.shopify_order_number || order.shopify_order_id}

سيتم التواصل معك قريباً لترتيب الشحن. شكراً لك! 🎉`;

    console.log('📤 Sending message to:', order.customer_phone);
    console.log('📝 Message:', confirmationMessage.substring(0, 50) + '...');
    console.log('');

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
          to: order.customer_phone,
          type: 'text',
          text: { body: confirmationMessage }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Failed to send message!');
      console.error('   Status:', response.status);
      console.error('   Error:', data.error?.message || JSON.stringify(data));
      console.log('');
      
      // Check common issues
      if (data.error?.code === 131047) {
        console.log('⚠️  Issue: Re-engagement message');
        console.log('   The customer needs to send a message first');
        console.log('   Or wait 24 hours after last message');
      } else if (data.error?.code === 190) {
        console.log('⚠️  Issue: Token expired');
        console.log('   Update token in CRM Settings');
      } else if (data.error?.code === 100) {
        console.log('⚠️  Issue: Invalid phone number');
        console.log('   Check customer_phone format');
      }
      
      return;
    }

    console.log('✅ Message sent successfully!');
    console.log('   Message ID:', data.messages[0].id);
    console.log('');

    // 5. Save to database
    console.log('📋 Step 5: Saving to database...');
    
    const { data: contact } = await supabase
      .from('contacts')
      .select('id')
      .eq('brand_id', brand.id)
      .eq('wa_id', order.customer_phone)
      .single();

    if (contact) {
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          contact_id: contact.id,
          brand_id: brand.id,
          direction: 'outbound',
          message_type: 'text',
          body: confirmationMessage,
          wa_message_id: data.messages[0].id,
          status: 'sent'
        });

      if (msgError) {
        console.error('❌ Failed to save message:', msgError);
      } else {
        console.log('✅ Message saved to database');
      }
    } else {
      console.log('⚠️  Contact not found, message not saved');
    }

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ TEST COMPLETED SUCCESSFULLY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('Check WhatsApp to confirm message was received.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  }
}

testButtonReply().catch(console.error);
