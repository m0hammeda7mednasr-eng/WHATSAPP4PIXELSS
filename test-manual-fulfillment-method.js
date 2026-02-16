// 🧪 Test Manual Fulfillment Method - محاكاة الطريقة اللي بتشتغل معاك
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rmpgofswkpjxionzythf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testManualFulfillmentMethod() {
  console.log('🧪 Testing Manual Fulfillment Method');
  console.log('====================================');
  console.log('محاكاة الطريقة اللي بتشتغل معاك لما تعمل fulfill بنفسك');

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
    console.log(`   Shopify ID: ${testOrder.shopify_order_id}`);

    // 2. Get brand and Shopify connection
    const { data: brand } = await supabase
      .from('brands')
      .select('*')
      .eq('id', testOrder.brand_id)
      .single();

    const { data: shopifyConn } = await supabase
      .from('shopify_connections')
      .select('*')
      .eq('brand_id', testOrder.brand_id)
      .eq('is_active', true)
      .single();

    if (!brand || !shopifyConn) {
      console.log('❌ Missing brand or Shopify connection');
      return;
    }

    console.log(`✅ Brand: ${brand.name}`);
    console.log(`✅ Shopify: ${shopifyConn.shop_url}`);

    // 3. Method 1: The way that works for you (manual style)
    console.log('\n📋 3. Method 1: Manual Style Fulfillment (The Working Way)');
    console.log('=========================================================');
    
    await testManualStyleFulfillment(shopifyConn, testOrder);

    // 4. Method 2: Current button handler way
    console.log('\n📋 4. Method 2: Current Button Handler Way (The Broken Way)');
    console.log('===========================================================');
    
    await testButtonHandlerWay(shopifyConn, testOrder);

    // 5. Method 3: Fixed button handler way
    console.log('\n📋 5. Method 3: Fixed Button Handler Way (The Solution)');
    console.log('=======================================================');
    
    await testFixedButtonHandlerWay(shopifyConn, testOrder);

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Method 1: Manual style (what works)
async function testManualStyleFulfillment(shopifyConn, order) {
  try {
    console.log('🔧 Testing manual style fulfillment...');
    
    // Step 1: Get order details first (like you do manually)
    console.log('📋 Step 1: Getting order details...');
    const orderResponse = await fetch(
      `https://${shopifyConn.shop_url}/admin/api/2024-01/orders/${order.shopify_order_id}.json`,
      {
        headers: {
          'X-Shopify-Access-Token': shopifyConn.access_token,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!orderResponse.ok) {
      console.log('❌ Failed to get order details');
      return;
    }

    const orderData = await orderResponse.json();
    const shopifyOrder = orderData.order;
    
    console.log(`✅ Order details:`);
    console.log(`   Name: ${shopifyOrder.name}`);
    console.log(`   Financial Status: ${shopifyOrder.financial_status}`);
    console.log(`   Fulfillment Status: ${shopifyOrder.fulfillment_status}`);
    console.log(`   Line Items: ${shopifyOrder.line_items?.length || 0}`);

    // Step 2: Check if order can be fulfilled
    if (shopifyOrder.fulfillment_status === 'fulfilled') {
      console.log('⚠️  Order already fulfilled - skipping');
      return;
    }

    // Step 3: Use the simple fulfillment method (like Shopify admin does)
    console.log('📦 Step 2: Creating simple fulfillment...');
    
    const fulfillmentPayload = {
      fulfillment: {
        notify_customer: false,
        tracking_number: `MANUAL-${Date.now()}`,
        tracking_company: 'Manual Fulfillment'
      }
    };

    const fulfillmentResponse = await fetch(
      `https://${shopifyConn.shop_url}/admin/api/2024-01/orders/${order.shopify_order_id}/fulfillments.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': shopifyConn.access_token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fulfillmentPayload)
      }
    );

    console.log(`📥 Fulfillment response: ${fulfillmentResponse.status}`);

    if (fulfillmentResponse.ok) {
      const fulfillmentData = await fulfillmentResponse.json();
      console.log('✅ MANUAL STYLE FULFILLMENT SUCCESS!');
      console.log(`   Fulfillment ID: ${fulfillmentData.fulfillment?.id}`);
      console.log(`   Status: ${fulfillmentData.fulfillment?.status}`);
    } else {
      const error = await fulfillmentResponse.json();
      console.error('❌ Manual style failed:', error);
    }

  } catch (error) {
    console.error('❌ Manual style error:', error.message);
  }
}

// Method 2: Current button handler way (broken)
async function testButtonHandlerWay(shopifyConn, order) {
  try {
    console.log('🔘 Testing current button handler way...');
    
    // This is what the current button handler does
    console.log('📋 Step 1: Getting fulfillment orders (NEW API)...');
    
    const fulfillmentOrdersResponse = await fetch(
      `https://${shopifyConn.shop_url}/admin/api/2024-01/orders/${order.shopify_order_id}/fulfillment_orders.json`,
      {
        headers: {
          'X-Shopify-Access-Token': shopifyConn.access_token,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`📥 Fulfillment orders response: ${fulfillmentOrdersResponse.status}`);

    if (fulfillmentOrdersResponse.ok) {
      const fulfillmentOrdersData = await fulfillmentOrdersResponse.json();
      const fulfillmentOrders = fulfillmentOrdersData.fulfillment_orders || [];
      
      console.log(`✅ Found ${fulfillmentOrders.length} fulfillment orders:`);
      fulfillmentOrders.forEach((fo, index) => {
        console.log(`   ${index + 1}. ID: ${fo.id}, Status: ${fo.status}`);
      });

      if (fulfillmentOrders.length > 0) {
        const fulfillmentOrderId = fulfillmentOrders[0].id;
        
        console.log('📦 Step 2: Creating fulfillment with NEW API...');
        
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
              company: "Button Handler",
              number: `BTN-${Date.now()}`
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

        console.log(`📥 NEW API fulfillment response: ${newFulfillmentResponse.status}`);

        if (newFulfillmentResponse.ok) {
          const fulfillmentData = await newFulfillmentResponse.json();
          console.log('✅ BUTTON HANDLER WAY SUCCESS!');
          console.log(`   Fulfillment ID: ${fulfillmentData.fulfillment?.id}`);
        } else {
          const error = await newFulfillmentResponse.json();
          console.error('❌ Button handler way failed:', error);
          console.log('🔍 This is probably why buttons don\'t work!');
        }
      } else {
        console.log('❌ No fulfillment orders found');
      }
    } else {
      const error = await fulfillmentOrdersResponse.json();
      console.error('❌ Failed to get fulfillment orders:', error);
    }

  } catch (error) {
    console.error('❌ Button handler error:', error.message);
  }
}

// Method 3: Fixed button handler way (solution)
async function testFixedButtonHandlerWay(shopifyConn, order) {
  try {
    console.log('🔧 Testing fixed button handler way...');
    
    // Step 1: Mark as paid first (for COD orders)
    console.log('💳 Step 1: Marking order as PAID...');
    
    const transactionPayload = {
      transaction: {
        kind: 'capture',
        status: 'success',
        amount: order.total_price || '0.00',
        currency: 'EGP',
        gateway: 'WhatsApp CRM',
        source_name: 'whatsapp_confirmation'
      }
    };

    const transactionResponse = await fetch(
      `https://${shopifyConn.shop_url}/admin/api/2024-01/orders/${order.shopify_order_id}/transactions.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': shopifyConn.access_token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transactionPayload)
      }
    );

    if (transactionResponse.ok) {
      console.log('✅ Order marked as PAID');
    } else {
      console.log('⚠️  Failed to mark as paid (continuing anyway)');
    }

    // Step 2: Try simple fulfillment first (like manual)
    console.log('📦 Step 2: Trying simple fulfillment...');
    
    const simpleFulfillmentPayload = {
      fulfillment: {
        notify_customer: false,
        tracking_number: `FIXED-${Date.now()}`
      }
    };

    const simpleFulfillmentResponse = await fetch(
      `https://${shopifyConn.shop_url}/admin/api/2024-01/orders/${order.shopify_order_id}/fulfillments.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': shopifyConn.access_token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(simpleFulfillmentPayload)
      }
    );

    console.log(`📥 Simple fulfillment response: ${simpleFulfillmentResponse.status}`);

    if (simpleFulfillmentResponse.ok) {
      const fulfillmentData = await simpleFulfillmentResponse.json();
      console.log('✅ FIXED BUTTON HANDLER SUCCESS!');
      console.log(`   Fulfillment ID: ${fulfillmentData.fulfillment?.id}`);
      console.log('🎉 This method should work for button clicks!');
    } else {
      const error = await simpleFulfillmentResponse.json();
      console.error('❌ Fixed method also failed:', error);
      
      // Fallback to NEW API
      console.log('🔄 Trying NEW API as fallback...');
      await testButtonHandlerWay(shopifyConn, order);
    }

  } catch (error) {
    console.error('❌ Fixed method error:', error.message);
  }
}

// Run the test
testManualFulfillmentMethod().then(() => {
  console.log('\n🏁 Test completed');
  console.log('\n📋 SUMMARY:');
  console.log('===========');
  console.log('Method 1 (Manual Style): Uses simple fulfillment API');
  console.log('Method 2 (Button Handler): Uses complex NEW API');
  console.log('Method 3 (Fixed): Mark as PAID + simple fulfillment');
  console.log('');
  console.log('🎯 The solution is to use Method 3 in the button handler!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});