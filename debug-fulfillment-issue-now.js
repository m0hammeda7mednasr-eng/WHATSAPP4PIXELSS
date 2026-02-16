// 🔍 Debug Fulfillment Issue - لما بعمل تأكيد مش بيعمل فلفل
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://rmpgofswkpjxionzythf.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function debugFulfillmentIssue() {
  console.log('🔍 DEBUGGING FULFILLMENT ISSUE');
  console.log('================================');

  try {
    // 1. Check recent orders
    console.log('\n📋 1. Checking recent orders...');
    const { data: orders, error: ordersError } = await supabase
      .from('shopify_orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (ordersError) {
      console.error('❌ Orders query error:', ordersError);
      return;
    }

    if (!orders || orders.length === 0) {
      console.log('⚠️  No orders found');
      return;
    }

    console.log(`✅ Found ${orders.length} recent orders:`);
    orders.forEach(order => {
      console.log(`   - Order #${order.shopify_order_number}: ${order.confirmation_status} / ${order.order_status}`);
    });

    // 2. Get the most recent order for testing
    const testOrder = orders[0];
    console.log(`\n🎯 Testing with Order #${testOrder.shopify_order_number}`);
    console.log('   - ID:', testOrder.shopify_order_id);
    console.log('   - Status:', testOrder.order_status);
    console.log('   - Confirmation:', testOrder.confirmation_status);

    // 3. Get brand and Shopify connection
    console.log('\n🔍 2. Getting brand and Shopify connection...');
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('*')
      .eq('id', testOrder.brand_id)
      .single();

    if (brandError || !brand) {
      console.error('❌ Brand not found:', brandError);
      return;
    }

    console.log('✅ Brand found:', brand.name);

    const { data: shopifyConn, error: connError } = await supabase
      .from('shopify_connections')
      .select('*')
      .eq('brand_id', brand.id)
      .eq('is_active', true)
      .single();

    if (connError || !shopifyConn) {
      console.error('❌ Shopify connection not found:', connError);
      return;
    }

    console.log('✅ Shopify connection found:', shopifyConn.shop_url);

    // 4. Test Shopify API connection
    console.log('\n🔍 3. Testing Shopify API connection...');
    const orderResponse = await fetch(
      `https://${shopifyConn.shop_url}/admin/api/2024-01/orders/${testOrder.shopify_order_id}.json`,
      {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': shopifyConn.access_token,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('📡 Shopify API Response Status:', orderResponse.status);

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      console.error('❌ Shopify API Error:', errorData);
      return;
    }

    const orderData = await orderResponse.json();
    const order = orderData.order;

    console.log('✅ Order Details from Shopify:');
    console.log('   - Name:', order.name);
    console.log('   - Financial Status:', order.financial_status);
    console.log('   - Fulfillment Status:', order.fulfillment_status || 'unfulfilled');
    console.log('   - Tags:', order.tags || 'none');
    console.log('   - Total Price:', order.total_price);

    // 5. Test Transaction API (Mark as Paid)
    console.log('\n💰 4. Testing Transaction API (Mark as Paid)...');
    
    const transactionPayload = {
      transaction: {
        kind: 'capture',
        status: 'success',
        amount: order.total_price || '100.00',
        currency: order.currency || 'EGP',
        gateway: 'manual',
        source_name: 'whatsapp_crm_debug'
      }
    };

    console.log('📤 Transaction Payload:', JSON.stringify(transactionPayload, null, 2));

    const transactionResponse = await fetch(
      `https://${shopifyConn.shop_url}/admin/api/2024-01/orders/${testOrder.shopify_order_id}/transactions.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': shopifyConn.access_token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transactionPayload)
      }
    );

    console.log('💰 Transaction Response Status:', transactionResponse.status);

    if (transactionResponse.ok) {
      const transactionData = await transactionResponse.json();
      console.log('✅ Transaction Success!');
      console.log('   - Transaction ID:', transactionData.transaction?.id);
      console.log('   - Status:', transactionData.transaction?.status);
      
      // Wait for Shopify to process
      console.log('⏳ Waiting 3 seconds for Shopify to process...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    } else {
      const transactionError = await transactionResponse.json();
      console.error('❌ Transaction Failed:', transactionError);
      console.log('⚠️  Will try fulfillment anyway...');
    }

    // 6. Test Simple Fulfillment API
    console.log('\n📦 5. Testing Simple Fulfillment API...');
    
    const simpleFulfillmentPayload = {
      fulfillment: {
        notify_customer: false,
        tracking_number: `DEBUG-${Date.now()}`
      }
    };

    console.log('📤 Simple Fulfillment Payload:', JSON.stringify(simpleFulfillmentPayload, null, 2));

    const simpleFulfillmentResponse = await fetch(
      `https://${shopifyConn.shop_url}/admin/api/2024-01/orders/${testOrder.shopify_order_id}/fulfillments.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': shopifyConn.access_token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(simpleFulfillmentPayload)
      }
    );

    console.log('📦 Simple Fulfillment Response Status:', simpleFulfillmentResponse.status);

    if (simpleFulfillmentResponse.ok) {
      const simpleFulfillmentData = await simpleFulfillmentResponse.json();
      console.log('🎉 SIMPLE FULFILLMENT SUCCESS!');
      console.log('   - Fulfillment ID:', simpleFulfillmentData.fulfillment?.id);
      console.log('   - Status:', simpleFulfillmentData.fulfillment?.status);
      console.log('   - Tracking Number:', simpleFulfillmentData.fulfillment?.tracking_number);
      
      console.log('\n✅ PROBLEM SOLVED! Simple API works fine.');
      return;
    } else {
      const simpleFulfillmentError = await simpleFulfillmentResponse.json();
      console.error('❌ Simple Fulfillment Failed:', simpleFulfillmentError);
      
      // Try NEW Fulfillment Orders API
      console.log('\n🔄 6. Trying NEW Fulfillment Orders API...');
      
      // Get fulfillment orders first
      const fulfillmentOrdersResponse = await fetch(
        `https://${shopifyConn.shop_url}/admin/api/2024-01/orders/${testOrder.shopify_order_id}/fulfillment_orders.json`,
        {
          method: 'GET',
          headers: {
            'X-Shopify-Access-Token': shopifyConn.access_token,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('📥 Fulfillment Orders Response Status:', fulfillmentOrdersResponse.status);

      if (fulfillmentOrdersResponse.ok) {
        const fulfillmentOrdersData = await fulfillmentOrdersResponse.json();
        console.log('📦 Fulfillment Orders Data:', JSON.stringify(fulfillmentOrdersData, null, 2));
        
        if (fulfillmentOrdersData.fulfillment_orders && fulfillmentOrdersData.fulfillment_orders.length > 0) {
          const fulfillmentOrderId = fulfillmentOrdersData.fulfillment_orders[0].id;
          console.log('✅ Found Fulfillment Order ID:', fulfillmentOrderId);
          
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
                company: "WhatsApp CRM Debug",
                number: `DEBUG-${Date.now()}`
              }
            }
          };

          console.log('📤 NEW API Payload:', JSON.stringify(newFulfillmentPayload, null, 2));

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

          console.log('🚀 NEW API Response Status:', newFulfillmentResponse.status);

          if (newFulfillmentResponse.ok) {
            const newFulfillmentData = await newFulfillmentResponse.json();
            console.log('🎉 NEW API FULFILLMENT SUCCESS!');
            console.log('   - Fulfillment ID:', newFulfillmentData.fulfillment?.id);
            console.log('   - Status:', newFulfillmentData.fulfillment?.status);
            
            console.log('\n✅ PROBLEM SOLVED! NEW API works fine.');
          } else {
            const newFulfillmentError = await newFulfillmentResponse.json();
            console.error('❌ NEW API Fulfillment Failed:', newFulfillmentError);
            
            console.log('\n🔍 DIAGNOSIS COMPLETE:');
            console.log('================================');
            console.log('❌ Both Simple API and NEW API failed');
            console.log('❌ This indicates a configuration or permission issue');
            console.log('\n🔧 POSSIBLE SOLUTIONS:');
            console.log('1. Check Shopify App permissions (needs fulfillment access)');
            console.log('2. Verify order is not already fulfilled');
            console.log('3. Check if order has inventory issues');
            console.log('4. Verify access token is valid and has correct scopes');
          }
        } else {
          console.error('❌ No fulfillment orders found');
        }
      } else {
        const fulfillmentOrdersError = await fulfillmentOrdersResponse.json();
        console.error('❌ Failed to get fulfillment orders:', fulfillmentOrdersError);
      }
    }

  } catch (error) {
    console.error('❌ Debug error:', error);
    console.error('❌ Stack:', error.stack);
  }
}

// Run the debug
debugFulfillmentIssue().then(() => {
  console.log('\n🏁 Debug completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});