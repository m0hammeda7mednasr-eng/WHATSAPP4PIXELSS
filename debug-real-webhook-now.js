// 🔍 Debug Real Webhook - تشخيص الـ webhook الحقيقي
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rmpgofswkpjxionzythf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function debugRealWebhook() {
  console.log('🔍 DEBUGGING REAL WEBHOOK ISSUE');
  console.log('================================');

  try {
    // 1. Check recent button click messages
    console.log('\n📋 1. Checking recent button click messages...');
    
    const { data: recentMessages } = await supabase
      .from('messages')
      .select('*')
      .eq('direction', 'inbound')
      .eq('message_type', 'interactive')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentMessages && recentMessages.length > 0) {
      console.log(`✅ Found ${recentMessages.length} recent button clicks:`);
      recentMessages.forEach((msg, index) => {
        console.log(`   ${index + 1}. ${msg.body} - ${msg.created_at}`);
        console.log(`      Contact ID: ${msg.contact_id}`);
        console.log(`      Brand ID: ${msg.brand_id}`);
      });

      // Get the most recent button click
      const latestClick = recentMessages[0];
      console.log(`\n🎯 Analyzing latest button click: ${latestClick.body}`);

      // Check if there's a corresponding order update
      const clickTime = new Date(latestClick.created_at);
      const fiveMinutesAfter = new Date(clickTime.getTime() + 5 * 60 * 1000);

      console.log(`⏰ Button clicked at: ${clickTime.toLocaleString()}`);
      console.log(`⏰ Checking for updates until: ${fiveMinutesAfter.toLocaleString()}`);

      // Check for order updates after the button click
      const { data: orderUpdates } = await supabase
        .from('shopify_orders')
        .select('*')
        .eq('brand_id', latestClick.brand_id)
        .gte('updated_at', latestClick.created_at)
        .order('updated_at', { ascending: false });

      if (orderUpdates && orderUpdates.length > 0) {
        console.log(`✅ Found ${orderUpdates.length} order updates after button click:`);
        orderUpdates.forEach(order => {
          console.log(`   - Order #${order.shopify_order_number}: ${order.confirmation_status}/${order.order_status}`);
          console.log(`     Updated at: ${order.updated_at}`);
        });
      } else {
        console.log('❌ No order updates found after button click');
        console.log('🔍 This suggests the webhook is not processing button clicks');
      }

    } else {
      console.log('⚠️  No recent button click messages found');
    }

    // 2. Check webhook endpoint status
    console.log('\n📋 2. Testing webhook endpoint...');
    
    const webhookUrls = [
      'https://wahtsapp.vercel.app/api/webhook',
      'https://wahtsapp-git-main-m0hammedahmed.vercel.app/api/webhook',
      'https://wahtsapp-m0hammedahmed.vercel.app/api/webhook'
    ];

    for (const url of webhookUrls) {
      try {
        console.log(`🌐 Testing: ${url}`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log(`   Status: ${response.status}`);
        
        if (response.status === 200) {
          console.log('   ✅ Endpoint is accessible');
        } else if (response.status === 405) {
          console.log('   ✅ Endpoint exists (Method Not Allowed for GET)');
        } else {
          console.log('   ❌ Endpoint issue');
        }
      } catch (fetchError) {
        console.log(`   ❌ Failed to reach: ${fetchError.message}`);
      }
    }

    // 3. Check Meta webhook configuration
    console.log('\n📋 3. Checking Meta webhook configuration...');
    
    const { data: brands } = await supabase
      .from('brands')
      .select('*')
      .limit(1);

    if (brands && brands.length > 0) {
      const brand = brands[0];
      console.log(`✅ Brand: ${brand.name}`);
      console.log(`   Phone Number ID: ${brand.phone_number_id}`);
      console.log(`   WhatsApp Token exists: ${!!brand.whatsapp_token}`);
      
      // Check if webhook is configured in Meta
      console.log('\n🔍 Meta Webhook Configuration Check:');
      console.log('   1. Go to Meta Business Manager');
      console.log('   2. WhatsApp Business Account Settings');
      console.log('   3. Configuration > Webhook');
      console.log('   4. Verify webhook URL is set to: https://wahtsapp.vercel.app/api/webhook');
      console.log('   5. Verify webhook fields include: messages');
      console.log('   6. Check webhook is subscribed to your phone number');
    }

    // 4. Test webhook with simulated payload
    console.log('\n📋 4. Testing webhook with simulated button click...');
    
    if (brands && brands.length > 0) {
      const brand = brands[0];
      
      // Get a recent order to test with
      const { data: testOrders } = await supabase
        .from('shopify_orders')
        .select('*')
        .eq('brand_id', brand.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (testOrders && testOrders.length > 0) {
        const testOrder = testOrders[0];
        
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
                        id: `msg_debug_${Date.now()}`,
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

        console.log('📤 Sending simulated button click...');
        console.log(`   Button ID: confirm_${testOrder.shopify_order_id}`);
        console.log(`   Order: #${testOrder.shopify_order_number}`);

        try {
          const webhookResponse = await fetch('https://wahtsapp.vercel.app/api/webhook', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(simulatedPayload)
          });

          console.log(`📥 Webhook response: ${webhookResponse.status}`);

          if (webhookResponse.ok) {
            const responseData = await webhookResponse.json();
            console.log('✅ Webhook processed successfully');
            
            // Wait and check if order was updated
            console.log('⏳ Waiting 5 seconds to check order update...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            const { data: updatedOrder } = await supabase
              .from('shopify_orders')
              .select('*')
              .eq('id', testOrder.id)
              .single();
            
            console.log('\n📊 Order Status After Simulated Click:');
            console.log(`   Before: ${testOrder.confirmation_status}/${testOrder.order_status}`);
            console.log(`   After:  ${updatedOrder.confirmation_status}/${updatedOrder.order_status}`);
            
            if (updatedOrder.order_status !== testOrder.order_status) {
              console.log('✅ Order was updated - webhook is working!');
              console.log('🔍 Issue might be with Meta webhook configuration');
            } else {
              console.log('❌ Order was not updated - webhook processing issue');
            }
            
          } else {
            const errorText = await webhookResponse.text();
            console.error('❌ Webhook failed:', errorText);
          }
          
        } catch (webhookError) {
          console.error('❌ Webhook request failed:', webhookError.message);
        }
      }
    }

    // 5. Provide diagnosis and solutions
    console.log('\n📋 5. DIAGNOSIS AND SOLUTIONS:');
    console.log('===============================');
    
    console.log('\n🔍 Possible Issues:');
    console.log('1. Meta webhook not configured correctly');
    console.log('2. Webhook URL not pointing to the right endpoint');
    console.log('3. Webhook verification token mismatch');
    console.log('4. Button ID format not matching expected pattern');
    console.log('5. Order lookup failing in database');
    
    console.log('\n🔧 Solutions to try:');
    console.log('1. Check Meta Business Manager webhook settings');
    console.log('2. Verify webhook URL: https://wahtsapp.vercel.app/api/webhook');
    console.log('3. Check webhook verification token in environment variables');
    console.log('4. Test with a fresh order and button click');
    console.log('5. Check Vercel deployment logs for errors');

  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

// Run the debug
debugRealWebhook().then(() => {
  console.log('\n🏁 Debug completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});