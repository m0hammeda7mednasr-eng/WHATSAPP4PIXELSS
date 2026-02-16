// 🔍 Debug Button vs Manual Fulfillment - مقارنة الـ button مع الـ manual fulfillment
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rmpgofswkpjxionzythf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function debugButtonVsManualFulfillment() {
  console.log('🔍 Debug: Button vs Manual Fulfillment');
  console.log('=====================================');

  try {
    // 1. Get recent button clicks
    console.log('\n📋 1. Checking recent button clicks...');
    
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
        console.log(`      Contact ID: ${msg.contact_id}, Brand ID: ${msg.brand_id}`);
      });

      // Get the latest button click
      const latestClick = recentMessages[0];
      console.log(`\n🎯 Latest button click: ${latestClick.body}`);

      // Extract button ID from message body
      let buttonId = null;
      if (latestClick.body.includes('[Button:')) {
        // This means it's a button click but we need to find the actual button ID
        console.log('⚠️  Button click detected but need to find button ID');
        
        // Check if there are any recent orders for this contact
        const { data: contactOrders } = await supabase
          .from('shopify_orders')
          .select('*')
          .eq('brand_id', latestClick.brand_id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (contactOrders && contactOrders.length > 0) {
          console.log('\n📦 Recent orders for this contact:');
          contactOrders.forEach((order, index) => {
            console.log(`   ${index + 1}. Order #${order.shopify_order_number}`);
            console.log(`      Status: ${order.confirmation_status}/${order.order_status}`);
            console.log(`      Shopify ID: ${order.shopify_order_id}`);
            console.log(`      Updated: ${order.updated_at}`);
          });

          // Use the most recent order for testing
          const testOrder = contactOrders[0];
          buttonId = `confirm_${testOrder.shopify_order_id}`;
          console.log(`\n🎯 Assuming button ID: ${buttonId}`);

          // 2. Compare what happens with button vs manual
          console.log('\n📋 2. Comparing Button vs Manual Fulfillment...');
          
          // Get brand and Shopify connection
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

          // 3. Test what the button handler does vs what manual fulfillment does
          console.log('\n📋 3. Testing Button Handler Logic...');
          
          // Simulate button click processing
          console.log('🔘 Simulating button click processing...');
          
          // Parse button ID (same as in webhook)
          const [action, ...orderIdParts] = buttonId.split('_');
          const orderId = orderIdParts.join('_');
          
          console.log(`   Action: ${action}`);
          console.log(`   Order ID: ${orderId}`);
          console.log(`   Expected Shopify Order ID: ${testOrder.shopify_order_id}`);
          
          if (orderId !== testOrder.shopify_order_id) {
            console.log('❌ ORDER ID MISMATCH!');
            console.log(`   Button Order ID: ${orderId}`);
            console.log(`   Database Order ID: ${testOrder.shopify_order_id}`);
            console.log('🔍 This might be the issue!');
          } else {
            console.log('✅ Order ID matches');
          }

          // 4. Test Shopify API calls step by step
          console.log('\n📋 4. Testing Shopify API calls...');
          
          // Test 1: Get order details from Shopify
          console.log('🔍 Step 1: Getting order from Shopify...');
          try {
            const orderResponse = await fetch(
              `https://${shopifyConn.shop_url}/admin/api/2024-01/orders/${testOrder.shopify_order_id}.json`,
              {
                headers: {
                  'X-Shopify-Access-Token': shopifyConn.access_token,
                  'Content-Type': 'application/json'
                }
              }
            );

            if (orderResponse.ok) {
              const orderData = await orderResponse.json();
              const order = orderData.order;
              
              console.log('✅ Order found in Shopify:');
              console.log(`   Name: ${order.name}`);
              console.log(`   Financial Status: ${order.financial_status}`);
              console.log(`   Fulfillment Status: ${order.fulfillment_status}`);
              console.log(`   Tags: ${order.tags || 'none'}`);
              console.log(`   Total: ${order.total_price} ${order.currency}`);
              
              // Check if order can be fulfilled
              if (order.fulfillment_status === 'fulfilled') {
                console.log('⚠️  Order is already fulfilled!');
                console.log('🔍 This might be why button clicks don\'t work');
              } else if (order.financial_status !== 'paid' && order.financial_status !== 'authorized') {
                console.log('⚠️  Order is not paid yet!');
                console.log(`   Financial Status: ${order.financial_status}`);
                console.log('🔍 Need to mark as paid first');
              } else {
                console.log('✅ Order can be fulfilled');
              }
              
            } else {
              const error = await orderResponse.json();
              console.error('❌ Failed to get order from Shopify:', error);
            }
          } catch (error) {
            console.error('❌ Error getting order:', error.message);
          }

          // Test 2: Get fulfillment orders
          console.log('\n🔍 Step 2: Getting fulfillment orders...');
          try {
            const fulfillmentOrdersResponse = await fetch(
              `https://${shopifyConn.shop_url}/admin/api/2024-01/orders/${testOrder.shopify_order_id}/fulfillment_orders.json`,
              {
                headers: {
                  'X-Shopify-Access-Token': shopifyConn.access_token,
                  'Content-Type': 'application/json'
                }
              }
            );

            if (fulfillmentOrdersResponse.ok) {
              const fulfillmentOrdersData = await fulfillmentOrdersResponse.json();
              const fulfillmentOrders = fulfillmentOrdersData.fulfillment_orders || [];
              
              console.log(`✅ Found ${fulfillmentOrders.length} fulfillment orders:`);
              fulfillmentOrders.forEach((fo, index) => {
                console.log(`   ${index + 1}. ID: ${fo.id}, Status: ${fo.status}`);
                console.log(`      Line Items: ${fo.line_items?.length || 0}`);
              });
              
              const availableFO = fulfillmentOrders.find(fo => fo.status === 'open' || fo.status === 'in_progress');
              if (availableFO) {
                console.log(`✅ Available fulfillment order: ${availableFO.id} (${availableFO.status})`);
              } else {
                console.log('❌ No available fulfillment orders!');
                console.log('🔍 All fulfillment orders might be closed or fulfilled');
              }
              
            } else {
              const error = await fulfillmentOrdersResponse.json();
              console.error('❌ Failed to get fulfillment orders:', error);
            }
          } catch (error) {
            console.error('❌ Error getting fulfillment orders:', error.message);
          }

          // 5. Compare with what works manually
          console.log('\n📋 5. What Works When You Do It Manually...');
          console.log('===========================================');
          
          console.log('🤔 When you manually fulfill orders, you probably:');
          console.log('1. Go to Shopify admin');
          console.log('2. Find the order');
          console.log('3. Click "Fulfill items"');
          console.log('4. Shopify handles all the prerequisites');
          console.log('');
          console.log('🔍 But when button clicks happen:');
          console.log('1. Webhook receives button click');
          console.log('2. Tries to fulfill via API');
          console.log('3. API might have different requirements');
          console.log('4. Missing prerequisites cause failure');

          // 6. Provide specific diagnosis
          console.log('\n📋 6. DIAGNOSIS AND SOLUTION:');
          console.log('=============================');
          
          console.log('\n🔍 Most Likely Issues:');
          console.log('1. Order already fulfilled (check fulfillment_status)');
          console.log('2. Order not marked as paid (check financial_status)');
          console.log('3. No available fulfillment orders (all closed)');
          console.log('4. Button ID format mismatch');
          console.log('5. Webhook not processing button clicks correctly');
          
          console.log('\n🔧 Solutions to Try:');
          console.log('1. Mark order as PAID before fulfillment');
          console.log('2. Check order status before attempting fulfillment');
          console.log('3. Use different fulfillment API endpoints');
          console.log('4. Add better error handling and logging');
          console.log('5. Test with fresh orders (not previously processed)');

        } else {
          console.log('❌ No recent orders found for this contact');
        }
      }
    } else {
      console.log('❌ No recent button clicks found');
      console.log('🔍 Try clicking a button first, then run this script');
    }

    // 7. Provide action plan
    console.log('\n📋 7. ACTION PLAN:');
    console.log('==================');
    
    console.log('\n🎯 Immediate Steps:');
    console.log('1. Create a fresh test order in Shopify');
    console.log('2. Send order confirmation with buttons');
    console.log('3. Click the button and monitor webhook logs');
    console.log('4. Compare the API calls with manual fulfillment');
    
    console.log('\n🔧 Code Changes Needed:');
    console.log('1. Add order status checks before fulfillment');
    console.log('2. Mark orders as PAID for COD orders');
    console.log('3. Better error handling for fulfillment failures');
    console.log('4. Log all API responses for debugging');

  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

// Run the debug
debugButtonVsManualFulfillment().then(() => {
  console.log('\n🏁 Debug completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});