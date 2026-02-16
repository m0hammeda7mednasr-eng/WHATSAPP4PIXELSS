// 🧪 Test Webhook Handler Fixed - اختبار الـ handler المصلح
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rmpgofswkpjxionzythf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Copy the fixed handleButtonClickAction function
async function handleButtonClickAction(buttonId, wa_id, brand) {
  try {
    console.log('🔘 Processing button click:', { buttonId, wa_id, brand_id: brand.id });

    // Parse button ID (format: confirm_ORDER_ID or cancel_ORDER_ID)
    const [action, ...orderIdParts] = buttonId.split('_');
    const orderId = orderIdParts.join('_');

    if (!['confirm', 'cancel'].includes(action)) {
      console.log('⚠️  Unknown button action:', action);
      return { success: false, error: 'Unknown action' };
    }

    // Get Shopify connection
    const { data: shopifyConn, error: connError } = await supabase
      .from('shopify_connections')
      .select('*')
      .eq('brand_id', brand.id)
      .eq('is_active', true)
      .single();

    if (connError || !shopifyConn) {
      console.error('❌ Shopify not connected');
      return { success: false, error: 'Shopify not connected' };
    }

    console.log('✅ Shopify connection found:', shopifyConn.shop_url);

    // Get order from database using shopify_order_id
    const { data: order, error: orderError } = await supabase
      .from('shopify_orders')
      .select('*')
      .eq('shopify_order_id', orderId)
      .eq('brand_id', brand.id)
      .single();

    if (orderError || !order) {
      console.error('❌ Order not found in database:', orderId);
      console.error('❌ Error:', orderError);
      return { success: false, error: 'Order not found' };
    }

    console.log('✅ Order found:', order.shopify_order_number);

    // Update Shopify based on action
    let confirmationMessage;

    if (action === 'confirm') {
      console.log('✅ Confirming and fulfilling order...');

      // Add confirmed tag to Shopify
      try {
        const tagResponse = await fetch(
          `https://${shopifyConn.shop_url}/admin/api/2024-01/orders/${order.shopify_order_id}.json`,
          {
            method: 'PUT',
            headers: {
              'X-Shopify-Access-Token': shopifyConn.access_token,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              order: {
                id: order.shopify_order_id,
                tags: 'whatsapp-confirmed',
                note: `تم التأكيد عبر WhatsApp في ${new Date().toLocaleString('ar-EG')}`
              }
            })
          }
        );

        if (tagResponse.ok) {
          console.log('✅ Confirmed tag added');
        } else {
          console.log('⚠️  Failed to add tag');
        }
      } catch (tagError) {
        console.error('⚠️  Tag error:', tagError);
      }

      // Fulfill order in Shopify using NEW API
      let orderFulfilled = false;
      
      try {
        console.log('📦 Creating fulfillment for order:', order.shopify_order_id);
        
        // Get fulfillment orders
        const fulfillmentOrdersResponse = await fetch(
          `https://${shopifyConn.shop_url}/admin/api/2024-01/orders/${order.shopify_order_id}/fulfillment_orders.json`,
          {
            method: 'GET',
            headers: {
              'X-Shopify-Access-Token': shopifyConn.access_token,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('📥 Fulfillment Orders response status:', fulfillmentOrdersResponse.status);

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

            console.log('🚀 NEW API fulfillment response status:', newFulfillmentResponse.status);

            if (newFulfillmentResponse.ok) {
              const newFulfillmentData = await newFulfillmentResponse.json();
              console.log('🎉 NEW API FULFILLMENT SUCCESS!');
              console.log('✅ Fulfillment ID:', newFulfillmentData.fulfillment?.id);
              orderFulfilled = true;
            } else {
              const newError = await newFulfillmentResponse.json();
              console.error('❌ NEW API fulfillment failed:', newError);
              
              // Try simple fulfillment as fallback
              console.log('🔄 Trying simple fulfillment as fallback...');
              
              const simpleFulfillmentPayload = {
                fulfillment: {
                  notify_customer: false,
                  tracking_number: `WA-${Date.now()}`
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

              console.log('📦 Simple fulfillment response status:', simpleFulfillmentResponse.status);

              if (simpleFulfillmentResponse.ok) {
                const simpleFulfillmentData = await simpleFulfillmentResponse.json();
                console.log('✅ SIMPLE FULFILLMENT SUCCESS (fallback)!');
                console.log('✅ Fulfillment ID:', simpleFulfillmentData.fulfillment?.id);
                orderFulfilled = true;
              } else {
                const simpleError = await simpleFulfillmentResponse.json();
                console.error('❌ Simple fulfillment also failed:', simpleError);
              }
            }
          } else {
            console.error('❌ No fulfillment orders found');
          }
        } else {
          const fulfillmentOrdersError = await fulfillmentOrdersResponse.json();
          console.error('❌ Failed to get fulfillment orders:', fulfillmentOrdersError);
        }
      } catch (fulfillError) {
        console.error('⚠️  Failed to fulfill order:', fulfillError.message);
      }

      // Update database based on fulfillment result
      const finalOrderStatus = orderFulfilled ? 'fulfilled' : 'confirmed';
      
      await supabase
        .from('shopify_orders')
        .update({
          confirmation_status: 'confirmed',
          order_status: finalOrderStatus,
          confirmed_at: new Date().toISOString()
        })
        .eq('id', order.id);
        
      console.log('✅ Order status updated to:', finalOrderStatus);

      // Set confirmation message based on fulfillment result
      if (orderFulfilled) {
        confirmationMessage = `✅ تم تأكيد وشحن طلبك بنجاح!

📦 رقم الطلب: #${order.shopify_order_number}

تم تجهيز طلبك للشحن وسيصلك قريباً إن شاء الله 🚚

شكراً لثقتك في ${brand.name} 🙏`;
      } else {
        confirmationMessage = `✅ تم تأكيد طلبك بنجاح!

📦 رقم الطلب: #${order.shopify_order_number}

سيتم تجهيز طلبك وشحنه قريباً 📦

شكراً لثقتك في ${brand.name} 🙏`;
      }
    }

    console.log('✅ Button click processed successfully');

    return {
      success: true,
      action,
      order_id: orderId,
      message: confirmationMessage,
      fulfilled: action === 'confirm' ? orderFulfilled : false
    };

  } catch (error) {
    console.error('❌ Error handling button click:', error);
    return { success: false, error: error.message };
  }
}

async function testWebhookHandlerFixed() {
  console.log('🧪 TESTING WEBHOOK HANDLER FIXED');
  console.log('=================================');

  try {
    // Get a pending order to test with
    const { data: orders } = await supabase
      .from('shopify_orders')
      .select('*')
      .eq('confirmation_status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1);

    if (!orders || orders.length === 0) {
      console.log('⚠️  No pending orders found for testing');
      return;
    }

    const testOrder = orders[0];
    console.log(`🎯 Testing with Order #${testOrder.shopify_order_number}`);
    console.log('   - Shopify Order ID:', testOrder.shopify_order_id);

    // Get brand
    const { data: brand } = await supabase
      .from('brands')
      .select('*')
      .eq('id', testOrder.brand_id)
      .single();

    console.log('✅ Brand:', brand.name);

    // Test button click
    const buttonId = `confirm_${testOrder.shopify_order_id}`;
    const wa_id = testOrder.customer_phone || '201234567890';

    console.log('\n🔘 Testing button click with fixed handler...');
    console.log('   - Button ID:', buttonId);
    console.log('   - WA ID:', wa_id);

    const result = await handleButtonClickAction(buttonId, wa_id, brand);

    console.log('\n📊 Result:', result);

    if (result.success) {
      console.log('\n🎉 SUCCESS! Fixed handler works!');
      
      if (result.fulfilled) {
        console.log('✅ Order was FULFILLED successfully!');
        console.log('🎯 لما تضغط "تأكيد" من الواتساب هيعمل fulfillment فوراً!');
      } else {
        console.log('⚠️  Order confirmed but not fulfilled - check Shopify permissions');
      }
      
      // Check final order status
      const { data: finalOrder } = await supabase
        .from('shopify_orders')
        .select('*')
        .eq('id', testOrder.id)
        .single();
      
      console.log('\n📊 Final Order Status:');
      console.log('   - Confirmation Status:', finalOrder.confirmation_status);
      console.log('   - Order Status:', finalOrder.order_status);
      
    } else {
      console.log('\n❌ Handler failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Run the test
testWebhookHandlerFixed().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});