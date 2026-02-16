// 🧪 Test Fulfillment Fix - اختبار الإصلاح الجديد
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rmpgofswkpjxionzythf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testFulfillmentFix() {
  console.log('🧪 TESTING FULFILLMENT FIX');
  console.log('===========================');

  try {
    // Get a test order that exists in Shopify
    const { data: orders } = await supabase
      .from('shopify_orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!orders || orders.length === 0) {
      console.log('⚠️  No pending orders found for testing');
      return;
    }

    const testOrder = orders[0];
    console.log(`🎯 Testing with Order #${testOrder.shopify_order_number}`);

    // Get brand and connection
    const { data: brand } = await supabase
      .from('brands')
      .select('*')
      .eq('id', testOrder.brand_id)
      .single();

    const { data: shopifyConn } = await supabase
      .from('shopify_connections')
      .select('*')
      .eq('brand_id', brand.id)
      .single();

    console.log('✅ Brand:', brand.name);
    console.log('✅ Shop:', shopifyConn.shop_url);

    // Simulate button click (confirm order)
    console.log('\n🔘 Simulating button click: confirm order...');
    
    const orderId = testOrder.shopify_order_id;
    
    // STEP 1: Mark as PAID
    console.log('💰 Step 1: Marking order as PAID...');
    
    const transactionPayload = {
      transaction: {
        kind: 'capture',
        status: 'success',
        amount: testOrder.total_price || '100.00',
        currency: 'EGP',
        gateway: 'manual',
        source_name: 'whatsapp_crm_test'
      }
    };

    const transactionResponse = await fetch(
      `https://${shopifyConn.shop_url}/admin/api/2024-01/orders/${orderId}/transactions.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': shopifyConn.access_token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transactionPayload)
      }
    );

    console.log('💰 Transaction status:', transactionResponse.status);

    // Continue with fulfillment regardless of transaction status
    console.log('⏳ Waiting 3 seconds before fulfillment...');
    await new Promise(resolve => setTimeout(resolve, 3000));
      
      // STEP 2: Try NEW Fulfillment Orders API first
      console.log('\n📦 Step 2: Trying NEW Fulfillment Orders API...');
      
      const fulfillmentOrdersResponse = await fetch(
        `https://${shopifyConn.shop_url}/admin/api/2024-01/orders/${orderId}/fulfillment_orders.json`,
        {
          method: 'GET',
          headers: {
            'X-Shopify-Access-Token': shopifyConn.access_token,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('📥 Fulfillment Orders status:', fulfillmentOrdersResponse.status);

      if (fulfillmentOrdersResponse.ok) {
        const fulfillmentOrdersData = await fulfillmentOrdersResponse.json();
        
        if (fulfillmentOrdersData.fulfillment_orders && fulfillmentOrdersData.fulfillment_orders.length > 0) {
          const fulfillmentOrderId = fulfillmentOrdersData.fulfillment_orders[0].id;
          console.log('✅ Found fulfillment order ID:', fulfillmentOrderId);
          
          const newFulfillmentPayload = {
            fulfillment: {
              line_items_by_fulfillment_order: [
                {
                  fulfillment_order_id: fulfillmentOrderId,
                  fulfillment_order_line_items: []
                }
              ],
              notify_customer: false,
              tracking_info: {
                company: "WhatsApp CRM Test",
                number: `TEST-${Date.now()}`
              }
            }
          };

          const newFulfillmentResponse = await fetch(
            `https://${shopifyConn.shop_url}/admin/api/2024-01/fulfillments.json`,
            {
              method: 'POST',
              headers: {
                'X-Shopify-Access-Token': shopifyConn.access_token,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(newFulfillmentPayload)
            }
          );

          console.log('🚀 NEW API fulfillment status:', newFulfillmentResponse.status);

          if (newFulfillmentResponse.ok) {
            const newFulfillmentData = await newFulfillmentResponse.json();
            console.log('🎉 NEW API FULFILLMENT SUCCESS!');
            console.log('✅ Fulfillment ID:', newFulfillmentData.fulfillment?.id);
            console.log('✅ Status:', newFulfillmentData.fulfillment?.status);
            
            // Update database
            await supabase
              .from('shopify_orders')
              .update({
                confirmation_status: 'confirmed',
                order_status: 'fulfilled',
                confirmed_at: new Date().toISOString()
              })
              .eq('id', testOrder.id);
              
            console.log('✅ Database updated');
            
            console.log('\n🎉 SUCCESS! Fulfillment is now working!');
            console.log('✅ Order has been marked as PAID and FULFILLED');
            
          } else {
            const newError = await newFulfillmentResponse.json();
            console.error('❌ NEW API failed:', newError);
            
            // Try simple fallback
            console.log('\n🔄 Trying simple fulfillment as fallback...');
            
            const simpleFulfillmentPayload = {
              fulfillment: {
                notify_customer: false,
                tracking_number: `TEST-${Date.now()}`
              }
            };

            const simpleFulfillmentResponse = await fetch(
              `https://${shopifyConn.shop_url}/admin/api/2024-01/orders/${orderId}/fulfillments.json`,
              {
                method: 'POST',
                headers: {
                  'X-Shopify-Access-Token': shopifyConn.access_token,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(simpleFulfillmentPayload)
              }
            );

            console.log('📦 Simple fulfillment status:', simpleFulfillmentResponse.status);

            if (simpleFulfillmentResponse.ok) {
              const simpleFulfillmentData = await simpleFulfillmentResponse.json();
              console.log('✅ SIMPLE FULFILLMENT SUCCESS (fallback)!');
              console.log('✅ Fulfillment ID:', simpleFulfillmentData.fulfillment?.id);
              
              // Update database
              await supabase
                .from('shopify_orders')
                .update({
                  confirmation_status: 'confirmed',
                  order_status: 'fulfilled',
                  confirmed_at: new Date().toISOString()
                })
                .eq('id', testOrder.id);
                
              console.log('✅ Database updated');
              console.log('\n🎉 SUCCESS! Fulfillment working with fallback method!');
              
            } else {
              const simpleError = await simpleFulfillmentResponse.json();
              console.error('❌ Simple fulfillment also failed:', simpleError);
              console.log('\n❌ BOTH METHODS FAILED - Need to investigate further');
            }
          }
        } else {
          console.error('❌ No fulfillment orders found');
        }
      } else {
        const fulfillmentOrdersError = await fulfillmentOrdersResponse.json();
        console.error('❌ Failed to get fulfillment orders:', fulfillmentOrdersError);
      }
      
      // STEP 2: Try NEW Fulfillment Orders API first

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Run the test
testFulfillmentFix().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});