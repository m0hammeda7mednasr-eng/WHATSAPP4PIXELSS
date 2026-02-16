// 🧪 Test Fulfill Only (No Payment) - اختبار الـ fulfillment بس بدون payment
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rmpgofswkpjxionzythf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testFulfillOnlyNoPayment() {
  console.log('🧪 Testing Fulfill Only (No Payment)');
  console.log('====================================');
  console.log('اختبار الـ fulfillment بس بدون mark as paid');

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

    // 3. Test the simplified webhook (fulfill + tags only)
    console.log('\n📋 3. Testing simplified webhook (fulfill + tags only)...');
    
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
                    id: `test_fulfill_only_${Date.now()}`,
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

    console.log('📤 Sending test button click with simplified logic...');
    console.log(`   Button ID: confirm_${testOrder.shopify_order_id}`);
    console.log(`   Expected process:`);
    console.log(`   1. Try SIMPLE fulfillment (like manual)`);
    console.log(`   2. Add tags (confirmed + fulfilled)`);
    console.log(`   3. Update database`);
    console.log(`   4. Send confirmation message`);
    console.log(`   ❌ NO payment marking`);

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
            console.log('🎉 SUCCESS! Fulfill-only method worked!');
            console.log('✅ Order was fulfilled without payment marking');
            
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
            console.log('   - Order needs to be paid first');
            console.log('   - Shopify API restrictions');
            console.log('   - Simple API failed');
            
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

    // 4. Show the simplified process
    console.log('\n📋 4. Simplified Process (No Payment):');
    console.log('=====================================');
    
    console.log('\n✅ NEW SIMPLIFIED PROCESS:');
    console.log('1. Customer clicks "تأكيد" button');
    console.log('2. Webhook receives button click');
    console.log('3. Try simple fulfillment (like manual)');
    console.log('4. Add confirmed/fulfilled tags');
    console.log('5. Update order status in database');
    console.log('6. Send confirmation message to customer');
    console.log('❌ NO payment marking');
    
    console.log('\n🎯 Benefits:');
    console.log('- Simpler process');
    console.log('- Less API calls');
    console.log('- Fewer potential errors');
    console.log('- Matches manual fulfillment exactly');

    // 5. What to expect
    console.log('\n📋 5. What to Expect:');
    console.log('=====================');
    
    console.log('\n✅ If order can be fulfilled:');
    console.log('- Order status → "fulfilled"');
    console.log('- Tags → "whatsapp-confirmed,whatsapp-fulfilled"');
    console.log('- Customer gets success message');
    
    console.log('\n⚠️  If order cannot be fulfilled:');
    console.log('- Order status → "confirmed" (not fulfilled)');
    console.log('- Tags → "whatsapp-confirmed" only');
    console.log('- Customer gets basic confirmation message');
    
    console.log('\n🔍 Common reasons fulfillment might fail:');
    console.log('- Order already fulfilled');
    console.log('- Order requires payment first');
    console.log('- Inventory issues');
    console.log('- Shopify settings restrictions');

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Run the test
testFulfillOnlyNoPayment().then(() => {
  console.log('\n🏁 Test completed');
  console.log('\n🎯 SUMMARY:');
  console.log('The webhook now does ONLY:');
  console.log('1. Simple fulfillment (like manual)');
  console.log('2. Add tags');
  console.log('3. Update database');
  console.log('4. Send message');
  console.log('');
  console.log('NO payment marking - just fulfill + tags!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});