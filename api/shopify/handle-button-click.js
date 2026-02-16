// Handle Button Clicks and Update Shopify
import { createClient } from '@supabase/supabase-js';
export const config = { runtime: "nodejs" };

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);




export async function handleButtonClick(buttonId, wa_id, phone_number_id) {
  try {
    console.log('🔘 Button clicked:', { buttonId, wa_id, phone_number_id });

    // Parse button ID (format: confirm_ORDER_ID or cancel_ORDER_ID)
    const [action, ...orderIdParts] = buttonId.split('_');
    const orderId = orderIdParts.join('_');

    console.log('📋 Parsed action:', action, 'Order ID:', orderId);

    if (!['confirm', 'cancel'].includes(action)) {
      console.log('⚠️  Unknown button action:', action);
      return { success: false, error: 'Unknown action' };
    }

    // 1. Get brand from phone_number_id
    console.log('🔍 Looking for brand with phone_number_id:', phone_number_id);
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('*')
      .eq('phone_number_id', phone_number_id)
      .single();

    if (brandError) {
      console.error('❌ Brand query error:', brandError);
      return { success: false, error: 'Brand query failed: ' + brandError.message };
    }

    if (!brand) {
      console.error('❌ Brand not found for phone_number_id:', phone_number_id);
      return { success: false, error: 'Brand not found' };
    }

    console.log('✅ Brand found:', brand.name, 'ID:', brand.id);

    // 2. Get Shopify connection
    console.log('🔍 Looking for Shopify connection for brand:', brand.id);
    const { data: shopifyConn, error: connError } = await supabase
      .from('shopify_connections')
      .select('*')
      .eq('brand_id', brand.id)
      .eq('is_active', true)
      .single();

    if (connError) {
      console.error('❌ Shopify connection query error:', connError);
      return { success: false, error: 'Shopify connection query failed: ' + connError.message };
    }

    if (!shopifyConn) {
      console.error('❌ Shopify not connected for brand:', brand.id);
      return {
        success: false,
        error: 'Shopify not connected for this brand',
        needsConnection: true
      };
    }

    console.log('✅ Shopify connected:', shopifyConn.shop_url);

    // 3. Get order from database
    console.log('🔍 Looking for order:', orderId, 'for brand:', brand.id);
    const { data: order, error: orderError } = await supabase
      .from('shopify_orders')
      .select('*')
      .eq('shopify_order_id', orderId)
      .eq('brand_id', brand.id)
      .single();

    if (orderError) {
      console.error('❌ Order query error:', orderError);
      return { success: false, error: 'Order query failed: ' + orderError.message };
    }

    if (!order) {
      console.error('❌ Order not found:', orderId);
      return { success: false, error: 'Order not found in database' };
    }

    console.log('✅ Order found:', order.shopify_order_number);

    // 4. Update Shopify based on action
    let shopifyResult;
    let confirmationMessage;

    if (action === 'confirm') {
      console.log('✅ Confirming and fulfilling order...');
      
      // STEP 1: Try fulfillment directly (NEW API first)
      console.log('📦 Step 1: Creating fulfillment using NEW API...');
      
      try {
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
              
              shopifyResult = { 
                success: true, 
                fulfilled: true,
                data: newFulfillmentData,
                method: 'new_api'
              };
            } else {
              const newError = await newFulfillmentResponse.json();
              console.error('❌ NEW API failed:', newError);
              
              // Try simple fulfillment as fallback
              console.log('🔄 Trying simple fulfillment as fallback...');
              
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

              console.log('📦 Simple fulfillment response status:', simpleFulfillmentResponse.status);

              if (simpleFulfillmentResponse.ok) {
                const simpleFulfillmentData = await simpleFulfillmentResponse.json();
                console.log('✅ SIMPLE FULFILLMENT SUCCESS!');
                console.log('✅ Fulfillment ID:', simpleFulfillmentData.fulfillment?.id);
                
                shopifyResult = { 
                  success: true, 
                  fulfilled: true,
                  data: simpleFulfillmentData,
                  method: 'simple_fallback'
                };
              } else {
                const simpleFulfillmentError = await simpleFulfillmentResponse.json();
                console.error('❌ Simple fulfillment also failed:', simpleFulfillmentError);
                shopifyResult = { success: true, fulfilled: false, error: 'Both fulfillment methods failed' };
              }
            }
          } else {
            console.error('❌ No fulfillment orders found');
            shopifyResult = { success: true, fulfilled: false, error: 'No fulfillment orders found' };
          }
        } else {
          const fulfillmentOrdersError = await fulfillmentOrdersResponse.json();
          console.error('❌ Failed to get fulfillment orders:', fulfillmentOrdersError);
          shopifyResult = { success: true, fulfilled: false, error: 'Failed to get fulfillment orders' };
        }

        // STEP 2: Add confirmed tag regardless of fulfillment result
        console.log('🏷️  Step 2: Adding confirmed tag...');
        
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
                note: `تم التأكيد عبر WhatsApp في ${new Date().toLocaleString('ar-EG')}`
              }
            })
          }
        );

        if (tagResponse.ok) {
          console.log('✅ Confirmed tag added');
        } else {
          console.log('⚠️  Failed to add tag, but continuing...');
        }

      } catch (fulfillmentError) {
        console.error('❌ Fulfillment process error:', fulfillmentError);
        shopifyResult = { success: true, fulfilled: false, error: fulfillmentError.message };
      }

      // Set confirmation message
      if (shopifyResult?.fulfilled) {
        confirmationMessage = `✅ تم تأكيد وشحن طلبك #${order.shopify_order_number}

📦 تم تجهيز طلبك للشحن
سيصلك قريباً إن شاء الله

شكراً لثقتك في ${brand.name || 'متجرنا'} 🙏`;
      } else {
        confirmationMessage = `✅ تم تأكيد طلبك #${order.shopify_order_number}

سيتم تجهيز طلبك وشحنه قريباً 📦

شكراً لثقتك في ${brand.name || 'متجرنا'} 🙏`;
      }

      // Update order status
      console.log('📝 Updating order status in database...');
      
      // Check if fulfillment was successful
      const wasFulfilled = shopifyResult?.fulfilled === true;
      const orderStatus = wasFulfilled ? 'fulfilled' : 
                         (shopifyResult?.paymentPending ? 'payment_pending' : 'confirmed');
      
      const { error: updateError } = await supabase
        .from('shopify_orders')
        .update({
          confirmation_status: 'confirmed',
          order_status: orderStatus,
          confirmed_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (updateError) {
        console.error('❌ Failed to update order status:', updateError);
      } else {
        console.log('✅ Order status updated to:', orderStatus);
      }

    } else if (action === 'cancel') {
      console.log('❌ Cancelling order...');
      // Just add cancelled tag (don't cancel the order in Shopify)
      shopifyResult = await addCancelledTagToOrder(
        shopifyConn.shop_url,
        shopifyConn.access_token,
        orderId
      );

      // Use custom cancellation message from brand settings
      const customMessage = brand.order_cancellation_message || brand.cancellation_message || 'تم إلغاء طلبك.';
      confirmationMessage = customMessage
        .replace(/{customer_name}/g, order.customer_name || 'عزيزي العميل')
        .replace(/#{order_number}/g, order.shopify_order_number || orderId)
        .replace(/{brand_name}/g, brand.name || 'متجرنا');

      // Update order status
      console.log('📝 Updating order status in database...');
      const { error: updateError } = await supabase
        .from('shopify_orders')
        .update({
          confirmation_status: 'cancelled',
          order_status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (updateError) {
        console.error('❌ Failed to update order status:', updateError);
      } else {
        console.log('✅ Order status updated');
      }
    }

    // 5. Send confirmation message to customer
    console.log('📤 Sending confirmation message...');
    const { data: contact } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', order.contact_id)
      .single();

    if (contact && brand.whatsapp_token) {
      await sendWhatsAppMessage(
        brand.phone_number_id,
        brand.whatsapp_token,
        wa_id,
        confirmationMessage
      );

      // Save confirmation message
      await supabase
        .from('messages')
        .insert({
          contact_id: contact.id,
          brand_id: brand.id,
          direction: 'outbound',
          message_type: 'text',
          body: confirmationMessage,
          status: 'sent'
        });

      console.log('✅ Confirmation message sent');
    } else {
      console.log('⚠️  No contact or WhatsApp token');
    }

    console.log('✅ Order updated successfully:', action);

    return {
      success: true,
      action,
      order_id: orderId,
      shopify_result: shopifyResult,
      message: confirmationMessage
    };

  } catch (error) {
    console.error('❌ Error handling button click:', error);
    console.error('❌ Error stack:', error.stack);
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

// Confirm and fulfill order in Shopify - SIMPLIFIED VERSION
async function confirmAndFulfillShopifyOrder(shopUrl, accessToken, orderId) {
  try {
    console.log('🔄 STARTING Fulfillment Process');
    console.log('🔄 Order ID:', orderId);
    console.log('🔄 Shop URL:', shopUrl);
    console.log('🔄 Token exists:', !!accessToken);

    // Step 1: Get order details
    console.log('📥 Step 1: Getting order details...');
    const orderResponse = await fetch(
      `https://${shopUrl}/admin/api/2024-01/orders/${orderId}.json`,
      {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('📥 Order API Response Status:', orderResponse.status);

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      console.error('❌ FAILED to get order:', errorData);
      throw new Error('Failed to get order: ' + JSON.stringify(errorData));
    }

    const orderData = await orderResponse.json();
    const order = orderData.order;
    
    console.log('✅ Order Details:');
    console.log('   - Name:', order.name);
    console.log('   - Financial Status:', order.financial_status);
    console.log('   - Fulfillment Status:', order.fulfillment_status || 'unfulfilled');
    console.log('   - Line Items:', order.line_items.length);
    console.log('   - Location ID:', order.location_id);

    // Step 2: Add Tag First
    console.log('🏷️  Step 2: Adding confirmed tag...');
    const currentTags = order.tags || '';
    const newTags = currentTags 
      ? `${currentTags}, whatsapp-confirmed`
      : 'whatsapp-confirmed';

    const tagResponse = await fetch(
      `https://${shopUrl}/admin/api/2024-01/orders/${orderId}.json`,
      {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          order: {
            id: orderId,
            tags: newTags,
            note: `تم التأكيد عبر WhatsApp في ${new Date().toLocaleString('ar-EG')}`
          }
        })
      }
    );

    console.log('🏷️  Tag API Response Status:', tagResponse.status);

    if (tagResponse.ok) {
      console.log('✅ Tag added successfully');
    } else {
      const tagError = await tagResponse.json();
      console.error('❌ Failed to add tag:', tagError);
    }

    // Step 3: Check if payment is complete
    const isPaid = ['paid', 'authorized', 'partially_paid'].includes(order.financial_status);
    console.log('💰 Payment Check - Status:', order.financial_status, 'Is Paid:', isPaid);

    if (!isPaid) {
      console.log('⚠️  PAYMENT PENDING - Skipping fulfillment');
      return { 
        success: true, 
        tagged: true, 
        fulfilled: false,
        paymentPending: true,
        message: 'Order confirmed but payment pending'
      };
    }

    // Step 4: Check if already fulfilled
    if (order.fulfillment_status === 'fulfilled' || order.fulfillment_status === 'partial') {
      console.log('⚠️  ALREADY FULFILLED - Skipping');
      return { 
        success: true, 
        tagged: true, 
        fulfilled: true,
        alreadyFulfilled: true
      };
    }

    // Step 5: Try NEW Fulfillment Orders API (like N8N)
    console.log('📦 Step 5: Using NEW Fulfillment Orders API (like N8N)...');
    
    // First: Get fulfillment orders
    console.log('📥 Getting fulfillment orders...');
    const fulfillmentOrdersResponse = await fetch(
      `https://${shopUrl}/admin/api/2024-01/orders/${orderId}/fulfillment_orders.json`,
      {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('📥 Fulfillment Orders API Response Status:', fulfillmentOrdersResponse.status);

    if (!fulfillmentOrdersResponse.ok) {
      const errorData = await fulfillmentOrdersResponse.json();
      console.error('❌ Failed to get fulfillment orders:', errorData);
      return { 
        success: true, 
        tagged: true, 
        fulfilled: false,
        error: 'Failed to get fulfillment orders',
        errorData: errorData
      };
    }

    const fulfillmentOrdersData = await fulfillmentOrdersResponse.json();
    console.log('📦 Fulfillment Orders Data:', JSON.stringify(fulfillmentOrdersData, null, 2));

    if (!fulfillmentOrdersData.fulfillment_orders || fulfillmentOrdersData.fulfillment_orders.length === 0) {
      console.error('❌ No fulfillment orders found');
      return { 
        success: true, 
        tagged: true, 
        fulfilled: false,
        error: 'No fulfillment orders found'
      };
    }

    const fulfillmentOrderId = fulfillmentOrdersData.fulfillment_orders[0].id;
    console.log('✅ Found fulfillment order ID:', fulfillmentOrderId);

    // Second: Create fulfillment using NEW API (exactly like N8N)
    console.log('📦 Creating fulfillment using NEW API...');
    
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

    console.log('📤 NEW API Payload:', JSON.stringify(newFulfillmentPayload, null, 2));

    const newFulfillmentResponse = await fetch(
      `https://${shopUrl}/admin/api/2024-01/fulfillments.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newFulfillmentPayload)
      }
    );

    console.log('📦 NEW Fulfillment API Response Status:', newFulfillmentResponse.status);

    const newFulfillmentData = await newFulfillmentResponse.json();
    console.log('📦 NEW Fulfillment API Response Data:', JSON.stringify(newFulfillmentData, null, 2));

    if (newFulfillmentResponse.ok && newFulfillmentData.fulfillment) {
      console.log('🎉 NEW API FULFILLMENT SUCCESS!');
      console.log('✅ Fulfillment ID:', newFulfillmentData.fulfillment.id);
      console.log('✅ Status:', newFulfillmentData.fulfillment.status);
      
      return { 
        success: true, 
        tagged: true, 
        fulfilled: true,
        data: newFulfillmentData,
        method: 'new_fulfillment_orders_api'
      };
    } else {
      console.error('❌ NEW API FULFILLMENT FAILED');
      console.error('❌ Status:', newFulfillmentResponse.status);
      console.error('❌ Error:', newFulfillmentData);
      
      // Fallback to old simple method
      console.log('📦 Fallback: Trying simple fulfillment...');
      
      const simpleFulfillmentPayload = {
        fulfillment: {
          notify_customer: false,
          tracking_number: `WA-${Date.now()}`
        }
      };

      const simpleFulfillmentResponse = await fetch(
        `https://${shopUrl}/admin/api/2024-01/orders/${orderId}/fulfillments.json`,
        {
          method: 'POST',
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(simpleFulfillmentPayload)
        }
      );

      const simpleFulfillmentData = await simpleFulfillmentResponse.json();
      console.log('📦 Simple Fallback Response:', JSON.stringify(simpleFulfillmentData, null, 2));

      if (simpleFulfillmentResponse.ok && simpleFulfillmentData.fulfillment) {
        console.log('✅ FALLBACK SUCCESS!');
        return { 
          success: true, 
          tagged: true, 
          fulfilled: true,
          data: simpleFulfillmentData,
          method: 'simple_fallback'
        };
      }
      
      return { 
        success: true, 
        tagged: true, 
        fulfilled: false,
        error: 'Both NEW API and fallback failed',
        newApiError: newFulfillmentData,
        fallbackError: simpleFulfillmentData
      };
    }

  } catch (error) {
    console.error('❌ CRITICAL ERROR in fulfillment:', error);
    console.error('❌ Error Stack:', error.stack);
    
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

// Add cancelled tag to order (don't cancel the order)
async function addCancelledTagToOrder(shopUrl, accessToken, orderId) {
  try {
    console.log('🏷️  Adding cancelled tag to order:', orderId);

    // Get current order to preserve existing tags
    const getResponse = await fetch(
      `https://${shopUrl}/admin/api/2024-01/orders/${orderId}.json`,
      {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!getResponse.ok) {
      throw new Error('Failed to get order');
    }

    const getData = await getResponse.json();
    const currentTags = getData.order.tags || '';
    
    // Add cancelled tag (keep existing tags)
    const newTags = currentTags 
      ? `${currentTags}, whatsapp-cancelled`
      : 'whatsapp-cancelled';

    // Update order with cancelled tag
    const response = await fetch(
      `https://${shopUrl}/admin/api/2024-01/orders/${orderId}.json`,
      {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          order: {
            id: orderId,
            tags: newTags,
            note: `تم الإلغاء عبر WhatsApp في ${new Date().toLocaleString('ar-EG')}`
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Shopify API error:', data);
      throw new Error(data.errors || 'Failed to add cancelled tag');
    }

    console.log('✅ Cancelled tag added successfully');
    return { success: true, data };

  } catch (error) {
    console.error('❌ Add cancelled tag error:', error);
    throw error;
  }
}

// Send WhatsApp message
async function sendWhatsAppMessage(phoneNumberId, token, to, message) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: message }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('WhatsApp send error:', data);
      throw new Error('Failed to send WhatsApp message');
    }

    return data;

  } catch (error) {
    console.error('❌ WhatsApp send error:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  return res.status(200).json({
    message: 'This endpoint is called internally by webhook handler'
  });
}
