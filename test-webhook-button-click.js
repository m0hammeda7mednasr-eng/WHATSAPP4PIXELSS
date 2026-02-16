// 🧪 Test Webhook Button Click - اختبار ضغط البوتون من الواتساب
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rmpgofswkpjxionzythf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testWebhookButtonClick() {
  console.log('🧪 TESTING WEBHOOK BUTTON CLICK');
  console.log('================================');

  try {
    // Get the latest order
    const { data: orders } = await supabase
      .from('shopify_orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (!orders || orders.length === 0) {
      console.log('⚠️  No orders found');
      return;
    }

    const testOrder = orders[0];
    console.log(`🎯 Testing with Order #${testOrder.shopify_order_number}`);
    console.log('   - Shopify Order ID:', testOrder.shopify_order_id);
    console.log('   - Database ID:', testOrder.id);

    // Get brand
    const { data: brand } = await supabase
      .from('brands')
      .select('*')
      .eq('id', testOrder.brand_id)
      .single();

    console.log('✅ Brand:', brand.name);
    console.log('   - Phone Number ID:', brand.phone_number_id);

    // Simulate webhook button click payload
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

    console.log('\n🔘 Simulating webhook button click...');
    console.log('   - Button ID:', `confirm_${testOrder.shopify_order_id}`);
    console.log('   - Customer Phone:', testOrder.customer_phone);

    // Send webhook to our endpoint
    const webhookUrl = 'http://localhost:3000/api/webhook';
    
    console.log('\n📤 Sending webhook to:', webhookUrl);
    
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
      console.log('✅ Webhook processed successfully:', responseData);
      
      // Wait a moment for processing
      console.log('\n⏳ Waiting 3 seconds for processing...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
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
        console.log('\n🎉 SUCCESS! Button click triggered fulfillment!');
        console.log('✅ لما تضغط "تأكيد" من الواتساب دلوقتي هيعمل fulfillment!');
      } else if (updatedOrder.confirmation_status === 'confirmed') {
        console.log('\n✅ Order confirmed but not fulfilled');
        console.log('⚠️  Check fulfillment logs for issues');
      } else {
        console.log('\n❌ Order status not updated - check webhook processing');
      }
      
    } else {
      const errorData = await response.text();
      console.error('❌ Webhook failed:', errorData);
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Run the test
testWebhookButtonClick().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});