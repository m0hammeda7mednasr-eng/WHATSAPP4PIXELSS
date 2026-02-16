// 🧪 Test Simple Fulfillment - اختبار الـ fulfillment المبسط
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rmpgofswkpjxionzythf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testSimpleFulfillment() {
  console.log('🧪 TESTING SIMPLE FULFILLMENT');
  console.log('==============================');

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

    const orderId = testOrder.shopify_order_id;

    // Test the simplified fulfillment process
    console.log('\n🔘 Simulating "تأكيد" button click...');
    console.log('📦 Creating fulfillment using NEW API...');
    
    // Get fulfillment orders
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
        
        // Create fulfillment using NEW API
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
              company: "WhatsApp CRM",
              number: `WA-${Date.now()}`
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
          
          // Add confirmed tag
          console.log('\n🏷️  Adding confirmed tag...');
          
          const tagResponse = await fetch(
            `https://${shopifyConn.shop_url}/admin/api/2024-01/orders/${orderId}.json`,
            {
              method: 'PUT',
              headers: {
                'X-Shopify-Access-Token': shopifyConn.access_token,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                order: {
                  id: orderId,
                  tags: 'whatsapp-confirmed',
                  note: `تم التأكيد والشحن عبر WhatsApp في ${new Date().toLocaleString('ar-EG')}`
                }
              })
            }
          );

          if (tagResponse.ok) {
            console.log('✅ Confirmed tag added');
          }
          
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
          
          console.log('\n🎉 SUCCESS! Order confirmed and fulfilled!');
          console.log('✅ لما تضغط "تأكيد" دلوقتي هيعمل fulfillment فوراً!');
          
        } else {
          const newError = await newFulfillmentResponse.json();
          console.error('❌ NEW API failed:', newError);
          
          // Try simple fulfillment as fallback
          console.log('\n🔄 Trying simple fulfillment as fallback...');
          
          const simpleFulfillmentPayload = {
            fulfillment: {
              notify_customer: false,
              tracking_number: `WA-${Date.now()}`
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
            console.log('✅ SIMPLE FULFILLMENT SUCCESS!');
            console.log('✅ Fulfillment ID:', simpleFulfillmentData.fulfillment?.id);
            
            console.log('\n🎉 SUCCESS! Fulfillment working with fallback method!');
            console.log('✅ لما تضغط "تأكيد" دلوقتي هيعمل fulfillment!');
            
          } else {
            const simpleError = await simpleFulfillmentResponse.json();
            console.error('❌ Simple fulfillment also failed:', simpleError);
            console.log('\n❌ Both methods failed - check Shopify permissions');
          }
        }
      } else {
        console.error('❌ No fulfillment orders found');
      }
    } else {
      const fulfillmentOrdersError = await fulfillmentOrdersResponse.json();
      console.error('❌ Failed to get fulfillment orders:', fulfillmentOrdersError);
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Run the test
testSimpleFulfillment().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});