// 🔍 Debug Button Handler - تشخيص مشكلة الزرار
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rmpgofswkpjxionzythf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function debugButtonHandler() {
  console.log('🔍 DEBUGGING BUTTON HANDLER');
  console.log('============================');

  try {
    // 1. Check recent messages for button clicks
    console.log('\n📋 1. Checking recent messages for button clicks...');
    
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('direction', 'inbound')
      .eq('message_type', 'interactive')
      .order('created_at', { ascending: false })
      .limit(10);

    if (messagesError) {
      console.error('❌ Messages query error:', messagesError);
      return;
    }

    console.log(`✅ Found ${messages?.length || 0} interactive messages`);
    
    if (messages && messages.length > 0) {
      messages.forEach(msg => {
        console.log(`   - Message: ${msg.body} (${msg.created_at})`);
      });
    }

    // 2. Check webhook logs
    console.log('\n📋 2. Checking webhook logs...');
    
    const { data: webhookLogs } = await supabase
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (webhookLogs && webhookLogs.length > 0) {
      console.log(`✅ Found ${webhookLogs.length} webhook logs`);
      webhookLogs.forEach(log => {
        console.log(`   - ${log.event_type}: ${log.status} (${log.created_at})`);
      });
    } else {
      console.log('⚠️  No webhook logs found');
    }

    // 3. Check recent orders and their status
    console.log('\n📋 3. Checking recent orders...');
    
    const { data: orders } = await supabase
      .from('shopify_orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (orders && orders.length > 0) {
      console.log(`✅ Found ${orders.length} recent orders:`);
      orders.forEach(order => {
        console.log(`   - Order #${order.shopify_order_number}: ${order.confirmation_status}/${order.order_status}`);
        console.log(`     Shopify ID: ${order.shopify_order_id}`);
        console.log(`     Brand ID: ${order.brand_id}`);
        console.log(`     Customer Phone: ${order.customer_phone}`);
        console.log('     ---');
      });

      // Test with the most recent order
      const testOrder = orders[0];
      console.log(`\n🎯 Testing with Order #${testOrder.shopify_order_number}`);

      // Get brand
      const { data: brand } = await supabase
        .from('brands')
        .select('*')
        .eq('id', testOrder.brand_id)
        .single();

      if (!brand) {
        console.error('❌ Brand not found for order');
        return;
      }

      console.log('✅ Brand found:', brand.name);
      console.log('   - Phone Number ID:', brand.phone_number_id);
      console.log('   - WhatsApp Token exists:', !!brand.whatsapp_token);

      // 4. Test webhook endpoint directly
      console.log('\n📋 4. Testing webhook endpoint...');
      
      // Simulate a button click webhook
      const webhookPayload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: 'entry_id',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '15550559999',
                    phone_number_id: brand.phone_number_id
                  },
                  messages: [
                    {
                      from: testOrder.customer_phone || '201234567890',
                      id: `msg_${Date.now()}`,
                      timestamp: Math.floor(Date.now() / 1000).toString(),
                      type: 'interactive',
                      interactive: {
                        type: 'button_reply',
                        button_reply: {
                          id: `confirm_${testOrder.shopify_order_id}`,
                          title: '✅ تأكيد'
                        }
                      }
                    }
                  ]
                },
                field: 'messages'
              }
            ]
          }
        ]
      };

      console.log('📤 Webhook payload:');
      console.log('   - Button ID:', `confirm_${testOrder.shopify_order_id}`);
      console.log('   - Customer Phone:', testOrder.customer_phone);
      console.log('   - Phone Number ID:', brand.phone_number_id);

      // Try to call the webhook function directly
      console.log('\n📋 5. Testing webhook function directly...');
      
      try {
        // Import and test the webhook handler
        const webhookUrl = process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}/api/webhook`
          : 'https://wahtsapp.vercel.app/api/webhook';
          
        console.log('🌐 Webhook URL:', webhookUrl);
        
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(webhookPayload)
        });

        console.log('📥 Webhook response status:', response.status);
        
        if (response.ok) {
          const responseData = await response.json();
          console.log('✅ Webhook response:', responseData);
          
          // Wait for processing
          console.log('\n⏳ Waiting 5 seconds for processing...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Check if order was updated
          const { data: updatedOrder } = await supabase
            .from('shopify_orders')
            .select('*')
            .eq('id', testOrder.id)
            .single();
          
          console.log('\n📊 Order Status After Button Click:');
          console.log('   - Confirmation Status:', updatedOrder.confirmation_status);
          console.log('   - Order Status:', updatedOrder.order_status);
          console.log('   - Confirmed At:', updatedOrder.confirmed_at);
          
          if (updatedOrder.order_status === 'fulfilled') {
            console.log('\n🎉 SUCCESS! Button click worked and order is fulfilled!');
          } else if (updatedOrder.confirmation_status === 'confirmed') {
            console.log('\n⚠️  Order confirmed but not fulfilled - check fulfillment logic');
          } else {
            console.log('\n❌ Order status not updated - webhook not processing button clicks');
          }
          
        } else {
          const errorText = await response.text();
          console.error('❌ Webhook failed:', response.status, errorText);
        }
        
      } catch (fetchError) {
        console.error('❌ Webhook request failed:', fetchError.message);
        
        // Try local testing instead
        console.log('\n🔄 Trying local webhook simulation...');
        
        // Simulate the webhook processing locally
        const buttonId = `confirm_${testOrder.shopify_order_id}`;
        const wa_id = testOrder.customer_phone || '201234567890';
        
        console.log('🔘 Simulating button click processing...');
        console.log('   - Button ID:', buttonId);
        console.log('   - WA ID:', wa_id);
        console.log('   - Brand:', brand.name);
        
        // Check if this matches the expected format
        const [action, ...orderIdParts] = buttonId.split('_');
        const orderId = orderIdParts.join('_');
        
        console.log('📋 Parsed button click:');
        console.log('   - Action:', action);
        console.log('   - Order ID:', orderId);
        console.log('   - Expected Order ID:', testOrder.shopify_order_id);
        console.log('   - IDs Match:', orderId === testOrder.shopify_order_id);
        
        if (action === 'confirm' && orderId === testOrder.shopify_order_id) {
          console.log('✅ Button click format is correct');
          console.log('⚠️  Issue might be in webhook processing or Shopify API calls');
        } else {
          console.log('❌ Button click format issue detected');
        }
      }

    } else {
      console.log('⚠️  No orders found to test with');
    }

  } catch (error) {
    console.error('❌ Debug error:', error);
    console.error('❌ Stack:', error.stack);
  }
}

// Run the debug
debugButtonHandler().then(() => {
  console.log('\n🏁 Debug completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});