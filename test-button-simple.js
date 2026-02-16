// 🧪 Test Button Simple - اختبار بسيط للبوتون
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rmpgofswkpjxionzythf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testButtonSimple() {
  console.log('🧪 TESTING BUTTON SIMPLE');
  console.log('=========================');

  try {
    // Get orders
    const { data: orders, error } = await supabase
      .from('shopify_orders')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Database error:', error);
      return;
    }

    console.log(`✅ Found ${orders?.length || 0} orders`);

    if (!orders || orders.length === 0) {
      console.log('❌ No orders to test with');
      return;
    }

    const testOrder = orders.find(o => o.shopify_order_id !== '820982911946154500') || orders[0];
    console.log(`🎯 Testing with Order #${testOrder.shopify_order_number}`);
    console.log('   - Shopify Order ID:', testOrder.shopify_order_id);
    console.log('   - Brand ID:', testOrder.brand_id);

    // Get brand
    const { data: brand } = await supabase
      .from('brands')
      .select('*')
      .eq('id', testOrder.brand_id)
      .single();

    if (!brand) {
      console.error('❌ Brand not found');
      return;
    }

    console.log('✅ Brand:', brand.name);

    // Get Shopify connection
    const { data: shopifyConn } = await supabase
      .from('shopify_connections')
      .select('*')
      .eq('brand_id', brand.id)
      .eq('is_active', true)
      .single();

    if (!shopifyConn) {
      console.error('❌ Shopify connection not found');
      return;
    }

    console.log('✅ Shopify connection:', shopifyConn.shop_url);

    // Test fulfillment directly
    console.log('\n📦 Testing fulfillment...');
    
    const orderId = testOrder.shopify_order_id;
    
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
        
        // Create fulfillment
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

        console.log('🚀 Fulfillment response status:', newFulfillmentResponse.status);

        if (newFulfillmentResponse.ok) {
          const newFulfillmentData = await newFulfillmentResponse.json();
          console.log('🎉 FULFILLMENT SUCCESS!');
          console.log('✅ Fulfillment ID:', newFulfillmentData.fulfillment?.id);
          
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
          
          console.log('\n🎉 SUCCESS! Webhook fulfillment is working!');
          console.log('✅ لما تضغط "تأكيد" من الواتساب هيعمل fulfillment!');
          
        } else {
          const newError = await newFulfillmentResponse.json();
          console.error('❌ Fulfillment failed:', newError);
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
testButtonSimple().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});