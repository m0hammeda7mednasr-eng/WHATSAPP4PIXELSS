// 🧪 Test Fixed Button Fulfillment - اختبار الترتيب الجديد للـ fulfillment
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rmpgofswkpjxionzythf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testFixedButtonFulfillment() {
  console.log('🧪 Testing Fixed Button Fulfillment');
  console.log('===================================');

  try {
    // 1. Get a recent order to test with
    console.log('\n📋 1. Getting recent order for testing...');
    
    const { data: recentOrders } = await supabase
      .from('shopify_orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    if (!recentOrders || recentOrders.length === 0) {
      console.log('❌ No orders found for testing');
      return;
    }

    console.log(`✅ Found ${recentOrders.length} recent orders:`);
    recentOrders.forEach((order, index) => {
      console.log(`   ${index + 1}. Order #${order.shopify_order_number} - ${order.confirmation_status}/${order.order_status}`);
      console.log(`      Customer: ${order.customer_phone || 'N/A'}`);
      console.log(`      Total: ${order.total_price || 'N/A'}`);
    });

    // Use the first order for testing
    const testOrder = recentOrders[0];
    console.log(`\n🎯 Using order for test: #${testOrder.shopify_order_number}`);

    // 2. Get brand info
    console.log('\n📋 2. Getting brand information...');
    
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
    console.log(`   Phone Number ID: ${brand.phone_number_id}`);

    // 3. Test the new fulfillment process with simulated button click
    console.log('\n📋 3. Testing new fulfillment process...');
    
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
                    id: `test_fixed_${Date.now()}`,
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

    console.log('📤 Sending test button click with new fulfillment logic...');
    console.log(`   Button ID: confirm_${testOrder.shopify_order_id}`);
    console.log(`   Expected process:`);
    console.log(`   1. Mark order as PAID`);
    console.log(`   2. Create fulfillment`);
    console.log(`   3. Add tags`);
    console.log(`   4. Update database`);
    console.log(`   5. Send confirmation message`);

    // Test with current webhook (Vercel)
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
          console.log('⏳ Waiting 10 seconds for processing...');
          await new Promise(resolve => setTimeout(resolve, 10000));
          
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
            console.log('🎉 SUCCESS! Order was fulfilled automatically!');
            console.log('✅ The new fulfillment process is working correctly');
            
            // Check if there are recent messages
            const { data: recentMessages } = await supabase
              .from('messages')
              .select('*')
              .eq('brand_id', brand.id)
              .eq('direction', 'outbound')
              .order('created_at', { ascending: false })
              .limit(1);
            
            if (recentMessages && recentMessages.length > 0) {
              console.log('✅ Confirmation message sent:', recentMessages[0].body.substring(0, 50) + '...');
            }
            
          } else if (updatedOrder.confirmation_status === 'confirmed') {
            console.log('⚠️  Order was confirmed but not fulfilled');
            console.log('🔍 This might be due to:');
            console.log('   - Order already fulfilled');
            console.log('   - Payment status issues');
            console.log('   - Shopify API restrictions');
            
          } else {
            console.log('❌ Order status did not change');
            console.log('🔍 Possible issues:');
            console.log('   - Webhook not processing button clicks');
            console.log('   - Button ID format mismatch');
            console.log('   - Database connection issues');
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

    // 4. Show the expected vs actual flow
    console.log('\n📋 4. Expected vs Actual Flow Analysis:');
    console.log('=====================================');
    
    console.log('\n✅ EXPECTED FLOW (New Fixed Version):');
    console.log('1. Customer clicks "تأكيد" button');
    console.log('2. Webhook receives button click');
    console.log('3. Mark order as PAID (for COD orders)');
    console.log('4. Create fulfillment in Shopify');
    console.log('5. Add confirmed/fulfilled tags');
    console.log('6. Update order status in database');
    console.log('7. Send confirmation message to customer');
    
    console.log('\n🔍 WHAT TO CHECK:');
    console.log('- Order status should change to "fulfilled"');
    console.log('- Customer should receive confirmation message');
    console.log('- Shopify order should show as fulfilled');
    console.log('- Tags should be added to Shopify order');

    // 5. Provide debugging steps
    console.log('\n📋 5. If Still Not Working:');
    console.log('===========================');
    
    console.log('\n🔧 Debugging Steps:');
    console.log('1. Check Vercel function logs for errors');
    console.log('2. Verify Meta webhook is pointing to correct URL');
    console.log('3. Test with a fresh order (not previously confirmed)');
    console.log('4. Check Shopify order status manually');
    console.log('5. Verify WhatsApp token is valid');
    
    console.log('\n🚀 Deploy to Netlify:');
    console.log('The fixed version is ready in netlify/functions/webhook.js');
    console.log('Deploy to Netlify and update Meta webhook URL for best results');

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Run the test
testFixedButtonFulfillment().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});