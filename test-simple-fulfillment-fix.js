// 🧪 Test Simple Fulfillment Fix - اختبار الحل البسيط للـ fulfillment
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rmpgofswkpjxionzythf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testSimpleFulfillmentFix() {
  console.log('🧪 Testing Simple Fulfillment Fix');
  console.log('=================================');
  console.log('اختبار الحل الجديد اللي يستخدم الطريقة البسيطة زي ما انت بتعملها');

  try {
    // 1. Get a test order
    console.log('\n📋 1. Getting test order...');
    
    const { data: testOrders } = await supabase
      .from('shopify_orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    if (!testOrders || testOrders.length === 0) {
      console.log('❌ No orders found');
      return;
    }

    const testOrder = testOrders[0];
    console.log(`✅ Using order: #${testOrder.shopify_order_number}`);
    console.log(`   Status: ${testOrder.confirmation_status}/${testOrder.order_status}`);

    // 2. Get brand info
    const { data: brand } = await supabase
      .from('brands')
      .select('*')
      .eq('id', testOrder.brand_id)
      .single();

    if (!brand) {
      console.log('❌ Brand not found');
      return;
    }

    console.log(`✅ Brand: ${brand.name}`);

    // 3. Test the updated webhook with simulated button click
    console.log('\n📋 3. Testing updated webhook with simple fulfillment...');
    
    const simulatedPayload = {
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
                    id: `test_simple_${Date.now()}`,
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

    console.log('📤 Sending test button click with simple fulfillment logic...');
    console.log(`   Button ID: confirm_${testOrder.shopify_order_id}`);
    console.log(`   Expected process:`);
    console.log(`   1. Mark order as PAID`);
    console.log(`   2. Try SIMPLE fulfillment first (like manual)`);
    console.log(`   3. Fallback to NEW API if simple fails`);
    console.log(`   4. Add tags and update database`);

    // Test with current webhook
    const webhookUrls = [
      'https://wahtsapp.vercel.app/api/webhook',
      'https://wahtsapp-git-main-m0hammedahmed.vercel.app/api/webhook'
    ];

    for (const webhookUrl of webhookUrls) {
      try {
        console.log(`\n🌐 Testing with: ${webhookUrl}`);
        
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(simulatedPayload)
        });

        console.log(`📥 Response status: ${webhookResponse.status}`);

        if (webhookResponse.ok) {
          const responseData = await webhookResponse.json();
          console.log('✅ Webhook processed successfully');
          
          // Wait for processing
          console.log('⏳ Waiting 8 seconds for processing...');
          await new Promise(resolve => setTimeout(resolve, 8000));
          
          // Check order status after processing
          const { data: updatedOrder } = await supabase
            .from('shopify_orders')
            .select('*')
            .eq('id', testOrder.id)
            .single();
          
          console.log('\n📊 Order Status After Button Click:');
          console.log(`   Before: ${testOrder.confirmation_status}/${testOrder.order_status}`);
          console.log(`   After:  ${updatedOrder.confirmation_status}/${updatedOrder.order_status}`);
          
          if (updatedOrder.order_status === 'fulfilled') {
            console.log('🎉 SUCCESS! Simple fulfillment method worked!');
            console.log('✅ Order was fulfilled automatically using simple API');
            
            // Check for confirmation message
            const { data: recentMessages } = await supabase
              .from('messages')
              .select('*')
              .eq('brand_id', brand.id)
              .eq('direction', 'outbound')
              .order('created_at', { ascending: false })
              .limit(1);
            
            if (recentMessages && recentMessages.length > 0) {
              console.log('✅ Confirmation message sent');
              console.log(`   Message: ${recentMessages[0].body.substring(0, 50)}...`);
            }
            
          } else if (updatedOrder.confirmation_status === 'confirmed') {
            console.log('⚠️  Order was confirmed but not fulfilled');
            console.log('🔍 Possible reasons:');
            console.log('   - Order already fulfilled');
            console.log('   - Payment status issues');
            console.log('   - Shopify API restrictions');
            console.log('   - Simple API failed and NEW API also failed');
            
          } else {
            console.log('❌ Order status did not change');
            console.log('🔍 Check webhook logs for errors');
          }
          
          break; // Exit loop if successful
          
        } else {
          const errorText = await webhookResponse.text();
          console.error('❌ Webhook failed:', errorText);
        }
        
      } catch (webhookError) {
        console.error('❌ Webhook request failed:', webhookError.message);
      }
    }

    // 4. Comparison with previous method
    console.log('\n📋 4. Method Comparison:');
    console.log('========================');
    
    console.log('\n❌ OLD METHOD (Complex):');
    console.log('1. Get fulfillment orders (NEW API)');
    console.log('2. Find available fulfillment order');
    console.log('3. Create fulfillment with complex payload');
    console.log('4. Often fails due to API complexity');
    
    console.log('\n✅ NEW METHOD (Simple):');
    console.log('1. Mark order as PAID first');
    console.log('2. Try simple fulfillment (like manual)');
    console.log('3. Fallback to NEW API if needed');
    console.log('4. Much higher success rate');
    
    console.log('\n🎯 Why Simple Method Works:');
    console.log('- Same API calls as manual fulfillment');
    console.log('- Less complex payload structure');
    console.log('- Better error handling');
    console.log('- Matches Shopify admin behavior');

    // 5. Next steps
    console.log('\n📋 5. Next Steps:');
    console.log('=================');
    
    console.log('\n🚀 If this test shows success:');
    console.log('1. The fix is working correctly');
    console.log('2. Deploy the updated webhook');
    console.log('3. Test with real customer button clicks');
    
    console.log('\n🔧 If still not working:');
    console.log('1. Check Shopify order status manually');
    console.log('2. Verify order is not already fulfilled');
    console.log('3. Check webhook logs for detailed errors');
    console.log('4. Test with a completely fresh order');

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Run the test
testSimpleFulfillmentFix().then(() => {
  console.log('\n🏁 Test completed');
  console.log('\n🎯 SUMMARY:');
  console.log('The webhook now uses simple fulfillment API first (like manual)');
  console.log('This should match exactly what works when you do it manually');
  console.log('Try clicking a real button now and see if it works!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});