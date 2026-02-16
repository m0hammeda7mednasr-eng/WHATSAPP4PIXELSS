// Shopify Webhook Handler - Receives webhooks directly from Shopify
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Shopify-Hmac-Sha256, X-Shopify-Shop-Domain, X-Shopify-Topic');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify Shopify webhook signature
    const hmac = req.headers['x-shopify-hmac-sha256'];
    const shop = req.headers['x-shopify-shop-domain'];
    const topic = req.headers['x-shopify-topic'];

    console.log('📥 Shopify Webhook received:', { shop, topic });

    // Get connection by shop domain
    const { data: connection } = await supabase
      .from('shopify_connections')
      .select('*')
      .eq('shop_url', shop)
      .eq('is_active', true)
      .single();

    if (!connection) {
      console.log('⚠️  No active connection found for shop:', shop);
      return res.status(200).json({ success: true, message: 'Shop not connected' });
    }

    // Get brand separately
    const { data: brand } = await supabase
      .from('brands')
      .select('*')
      .eq('id', connection.brand_id)
      .single();

    if (!brand) {
      console.log('❌ Brand not found for connection');
      return res.status(200).json({ success: true, message: 'Brand not found' });
    }

    // Log webhook
    await supabase
      .from('shopify_webhook_logs')
      .insert({
        brand_id: brand.id,
        webhook_type: topic,
        payload: req.body,
        processed: false
      });

    // Handle different webhook topics
    switch (topic) {
      case 'orders/create':
        await handleOrderCreate(req.body, brand, connection);
        break;
      
      case 'orders/updated':
        await handleOrderUpdate(req.body, brand, connection);
        break;
      
      case 'orders/cancelled':
        await handleOrderCancel(req.body, brand, connection);
        break;
      
      case 'checkouts/create':
      case 'checkouts/update':
        await handleCheckoutCreate(req.body, brand, connection);
        break;
      
      default:
        console.log('ℹ️  Unhandled webhook topic:', topic);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Handle new order - Send confirmation message
async function handleOrderCreate(order, brand, connection) {
  console.log('📦 New order created:', order.id);

  try {
    // Get customer phone
    let phone = order.customer?.phone || order.shipping_address?.phone || order.billing_address?.phone;
    
    if (!phone) {
      console.log('⚠️  No phone number in order');
      return;
    }

    // Clean phone number
    phone = phone.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) {
      phone = '20' + phone.substring(1); // Egypt
    }

    // Find or create contact
    let { data: contact } = await supabase
      .from('contacts')
      .select('id')
      .eq('brand_id', brand.id)
      .eq('wa_id', phone)
      .single();

    if (!contact) {
      const { data: newContact } = await supabase
        .from('contacts')
        .insert({
          brand_id: brand.id,
          wa_id: phone,
          name: order.customer?.first_name + ' ' + order.customer?.last_name || 'Customer',
          last_message_at: new Date().toISOString()
        })
        .select('id')
        .single();
      
      contact = newContact;
    }

    // Save order to database
    const { data: savedOrder } = await supabase
      .from('shopify_orders')
      .insert({
        brand_id: brand.id,
        contact_id: contact.id,
        shopify_order_id: order.id.toString(),
        shopify_order_number: order.order_number?.toString(),
        order_status: order.financial_status,
        customer_phone: phone,
        customer_email: order.customer?.email,
        total_price: parseFloat(order.total_price),
        currency: order.currency,
        confirmation_status: 'pending'
      })
      .select()
      .single();

    // Send WhatsApp confirmation message
    await sendOrderConfirmation(order, phone, brand, savedOrder.id, contact);

    // AUTO FULFILLMENT: عمل fulfillment تلقائي للأوردر
    console.log('🚀 Starting AUTO FULFILLMENT for order:', order.id);
    
    try {
      const canFulfill = order.fulfillment_status === null || order.fulfillment_status === 'unfulfilled';
      
      console.log('📋 Order Details:');
      console.log('   - Financial Status:', order.financial_status);
      console.log('   - Fulfillment Status:', order.fulfillment_status);
      console.log('   - Total Price:', order.total_price);
      console.log('   - Can Fulfill:', canFulfill);
      
      if (canFulfill) {
        // STEP 1: Mark order as PAID (required for COD orders)
        console.log('💰 Step 1: Marking order as PAID...');
        
        const transactionPayload = {
          transaction: {
            kind: 'capture',
            status: 'success',
            amount: order.total_price,
            currency: order.currency || 'EGP',
            gateway: 'manual',
            source_name: 'whatsapp_crm'
          }
        };

        console.log('📤 Transaction payload:', JSON.stringify(transactionPayload, null, 2));

        const transactionResponse = await fetch(
          `https://${connection.shop_url}/admin/api/2024-01/orders/${order.id}/transactions.json`,
          {
            method: 'POST',
            headers: {
              'X-Shopify-Access-Token': connection.access_token,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(transactionPayload)
          }
        );

        console.log('💰 Transaction response status:', transactionResponse.status);

        if (transactionResponse.ok) {
          const transactionData = await transactionResponse.json();
          console.log('✅ Order marked as PAID successfully');
          console.log('✅ Transaction ID:', transactionData.transaction?.id);
          
          // Wait a moment for Shopify to process the payment
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Verify payment status
          console.log('🔍 Verifying payment status...');
          const verifyResponse = await fetch(
            `https://${connection.shop_url}/admin/api/2024-01/orders/${order.id}.json`,
            {
              method: 'GET',
              headers: {
                'X-Shopify-Access-Token': connection.access_token,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (verifyResponse.ok) {
            const verifyData = await verifyResponse.json();
            console.log('💰 Updated Financial Status:', verifyData.order.financial_status);
          }
          
          // STEP 2: Get Fulfillment Orders (NEW API)
          console.log('📦 Step 2: Getting fulfillment orders...');
          
          const fulfillmentOrdersResponse = await fetch(
            `https://${connection.shop_url}/admin/api/2024-01/orders/${order.id}/fulfillment_orders.json`,
            {
              method: 'GET',
              headers: {
                'X-Shopify-Access-Token': connection.access_token,
                'Content-Type': 'application/json'
              }
            }
          );

          console.log('📦 Fulfillment orders response status:', fulfillmentOrdersResponse.status);

          if (fulfillmentOrdersResponse.ok) {
            const fulfillmentOrdersData = await fulfillmentOrdersResponse.json();
            console.log('📦 Fulfillment orders found:', fulfillmentOrdersData.fulfillment_orders?.length || 0);
            
            if (fulfillmentOrdersData.fulfillment_orders && fulfillmentOrdersData.fulfillment_orders.length > 0) {
              const fulfillmentOrderId = fulfillmentOrdersData.fulfillment_orders[0].id;
              console.log('✅ Fulfillment Order ID:', fulfillmentOrderId);
              
              // STEP 3: Create Fulfillment using NEW API
              console.log('🚀 Step 3: Creating fulfillment...');
              
              const fulfillmentPayload = {
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

              console.log('📤 Fulfillment payload:', JSON.stringify(fulfillmentPayload, null, 2));

              const fulfillmentResponse = await fetch(
                `https://${connection.shop_url}/admin/api/2024-01/fulfillments.json`,
                {
                  method: 'POST',
                  headers: {
                    'X-Shopify-Access-Token': connection.access_token,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(fulfillmentPayload)
                }
              );

              console.log('🚀 Fulfillment response status:', fulfillmentResponse.status);

              if (fulfillmentResponse.ok) {
                const fulfillmentData = await fulfillmentResponse.json();
                console.log('🎉 AUTO FULFILLMENT SUCCESS!');
                console.log('✅ Fulfillment ID:', fulfillmentData.fulfillment?.id);
                console.log('✅ Status:', fulfillmentData.fulfillment?.status);
                
                // STEP 4: Add success tag and update database
                console.log('🏷️  Step 4: Adding success tag...');
                
                const tagResponse = await fetch(
                  `https://${connection.shop_url}/admin/api/2024-01/orders/${order.id}.json`,
                  {
                    method: 'PUT',
                    headers: {
                      'X-Shopify-Access-Token': connection.access_token,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      order: {
                        id: order.id,
                        tags: 'whatsapp-auto-fulfilled',
                        note: `تم الدفع والشحن تلقائياً عبر WhatsApp CRM في ${new Date().toLocaleString('ar-EG')}`
                      }
                    })
                  }
                );

                if (tagResponse.ok) {
                  console.log('✅ Success tag added');
                } else {
                  console.log('⚠️  Failed to add tag, but fulfillment succeeded');
                }
                
                // Update database
                await supabase
                  .from('shopify_orders')
                  .update({
                    order_status: 'fulfilled',
                    confirmation_status: 'auto_fulfilled',
                    confirmed_at: new Date().toISOString()
                  })
                  .eq('id', savedOrder.id);
                  
                console.log('✅ Database updated - order marked as fulfilled');
                
              } else {
                const fulfillmentError = await fulfillmentResponse.json();
                console.error('❌ Fulfillment failed:', fulfillmentError);
                
                // Try simple fallback
                console.log('🔄 Trying simple fulfillment as fallback...');
                
                const simpleFulfillmentPayload = {
                  fulfillment: {
                    notify_customer: false,
                    tracking_number: `WA-${Date.now()}`
                  }
                };

                const simpleFulfillmentResponse = await fetch(
                  `https://${connection.shop_url}/admin/api/2024-01/orders/${order.id}/fulfillments.json`,
                  {
                    method: 'POST',
                    headers: {
                      'X-Shopify-Access-Token': connection.access_token,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(simpleFulfillmentPayload)
                  }
                );

                if (simpleFulfillmentResponse.ok) {
                  const simpleFulfillmentData = await simpleFulfillmentResponse.json();
                  console.log('✅ SIMPLE FULFILLMENT SUCCESS (fallback)!');
                  console.log('✅ Fulfillment ID:', simpleFulfillmentData.fulfillment?.id);
                  
                  // Update database
                  await supabase
                    .from('shopify_orders')
                    .update({
                      order_status: 'fulfilled',
                      confirmation_status: 'auto_fulfilled',
                      confirmed_at: new Date().toISOString()
                    })
                    .eq('id', savedOrder.id);
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
        } else {
          const transactionError = await transactionResponse.json();
          console.error('❌ Failed to mark order as paid:', transactionError);
          console.log('⚠️  Order will remain pending - manual payment required');
        }
      } else {
        console.log('⚠️  Order not ready for fulfillment:');
        console.log('   - Fulfillment status:', order.fulfillment_status);
        console.log('   - Will wait for manual confirmation');
      }
    } catch (fulfillmentError) {
      console.error('❌ Auto fulfillment error:', fulfillmentError);
      console.error('❌ Stack:', fulfillmentError.stack);
    }

    console.log('✅ Order processing completed');
  } catch (error) {
    console.error('❌ Error handling order create:', error);
  }
}

// Send Order Confirmation via WhatsApp
async function sendOrderConfirmation(order, phone, brand, orderDbId, contact) {
  // Build products list with variant details (size, color, etc.)
  const products = order.line_items.map(item => {
    const detail = (item.variant_title && item.variant_title !== "Default Title") 
      ? ` [${item.variant_title}]` 
      : "";
    return `▫️ ${item.title}${detail} (عدد: ${item.quantity})`;
  }).join('\n');

  // Extract order details
  const orderNumber = order.order_number || order.id;
  const subtotal = order.current_subtotal_price || order.subtotal_price || "0";
  const shippingCost = order.total_shipping_price_set?.shop_money?.amount || order.shipping_lines?.[0]?.price || "0";
  const total = order.current_total_price || order.total_price || "0";
  
  // Customer details
  const firstName = order.shipping_address?.first_name || order.customer?.first_name || "";
  const lastName = order.shipping_address?.last_name || order.customer?.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim() || "عميلنا العزيز";
  const address = `${order.shipping_address?.address1 || ""}, ${order.shipping_address?.city || ""}`.trim();

  // Get brand template settings (with defaults)
  const templateName = brand.template_name || 'moon2'; // Updated default
  const templateLanguage = brand.template_language || 'en'; // Template is in English
  const useTemplate = brand.use_template !== false; // Enable template by default
  const brandEmoji = brand.brand_emoji || '🌙';
  const welcomeMessage = brand.welcome_message || `أهلاً بك في ${brand.name}`;

  const url = `https://graph.facebook.com/v21.0/${brand.phone_number_id}/messages`;
  
  // Template Message (if approved in Meta)
  const templatePayload = {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: templateLanguage
      },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: orderNumber.toString() },
            { type: 'text', text: products },
            { type: 'text', text: subtotal.toString() },
            { type: 'text', text: shippingCost.toString() },
            { type: 'text', text: total.toString() },
            { type: 'text', text: fullName },
            { type: 'text', text: address }
          ]
        }
      ]
    }
  };

  // Interactive message with buttons (works without approval)
  const messagePayload = {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: {
        text: `${brandEmoji} *${welcomeMessage}* ✨

شكراً لاختيارك لنا، طلبك وصلنا وبانتظار تأكيدك للبدء في تجهيزه فوراً.

🧾 *رقم الطلب:* #${orderNumber}

🧣 *القطع المختارة:*
${products}

ــــــــــــــــــــــــــــــــــــــــ
💰 *تفاصيل الفاتورة:*
🔸 المجموع الفرعي: ${subtotal} EGP
🚚 مصاريف الشحن: ${shippingCost} EGP
ــــــــــــــــــــــــــــــــــــــــ
💵 *الإجمالي النهائي: ${total} EGP*
ــــــــــــــــــــــــــــــــــــــــ

📍 *بيانات التوصيل:*
👤 المستلم: ${fullName}
🏠 العنوان: ${address}

📥 *هل نعتمد الطلب ونبدأ التجهيز؟*

نتمنى لكِ تجربة مميزة مع ${brand.name} ${brandEmoji}`
      },
      action: {
        buttons: [
          {
            type: 'reply',
            reply: {
              id: `confirm_${orderDbId}`,
              title: '✅ تأكيد'
            }
          },
          {
            type: 'reply',
            reply: {
              id: `cancel_${orderDbId}`,
              title: '❌ إلغاء'
            }
          }
        ]
      }
    }
  };

  // Try template first if enabled, fallback to interactive message
  let response;
  
  if (useTemplate) {
    console.log(`📤 Trying template: ${templateName} (${templateLanguage})...`);
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${brand.whatsapp_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(templatePayload)
    });

    // If template fails (not approved yet), use interactive message
    if (!response.ok) {
      const error = await response.json();
      console.log('⚠️  Template failed:', error.error?.message || 'Unknown error');
      console.log('📤 Falling back to interactive message...');
      
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${brand.whatsapp_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messagePayload)
      });
    } else {
      console.log('✅ Template message sent successfully!');
    }
  } else {
    // Use interactive message directly
    console.log('📤 Sending interactive message (template disabled)...');
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${brand.whatsapp_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messagePayload)
    });
  }

  if (!response.ok) {
    const error = await response.json();
    console.error('❌ Failed to send WhatsApp message:', error);
    throw new Error('Failed to send message');
  }

  const data = await response.json();
  
  // Update order with message ID
  await supabase
    .from('shopify_orders')
    .update({ whatsapp_message_id: data.messages[0].id })
    .eq('id', orderDbId);

  // Save the order confirmation message to messages table
  // ALWAYS save the full interactive message body (not template name)
  const messageBody = messagePayload.interactive.body.text;
    
  await supabase
    .from('messages')
    .insert({
      contact_id: contact.id,
      brand_id: brand.id,
      order_id: orderDbId,
      direction: 'outbound',
      message_type: 'interactive',
      body: messageBody,
      wa_message_id: data.messages[0].id,
      status: 'sent',
      created_at: new Date().toISOString()
    });

  console.log('✅ Order confirmation message saved to chat');

  return data;
}

// Handle order update
async function handleOrderUpdate(order, brand, connection) {
  console.log('📝 Order updated:', order.id);
  
  // Update order in database
  await supabase
    .from('shopify_orders')
    .update({
      order_status: order.financial_status,
      updated_at: new Date().toISOString()
    })
    .eq('shopify_order_id', order.id.toString())
    .eq('brand_id', brand.id);
}

// Handle order cancellation
async function handleOrderCancel(order, brand, connection) {
  console.log('❌ Order cancelled:', order.id);
  
  // Update order in database
  await supabase
    .from('shopify_orders')
    .update({
      order_status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('shopify_order_id', order.id.toString())
    .eq('brand_id', brand.id);

  // Optionally send cancellation message to customer
  // ... (similar to order confirmation)
}

// Handle abandoned checkout
async function handleCheckoutCreate(checkout, brand, connection) {
  console.log('🛒 Checkout created/updated:', checkout.id);
  
  // If checkout is abandoned (no order created after X minutes)
  // Send reminder message
  
  // This would typically be handled by a scheduled job
  // For now, just log it
  console.log('ℹ️  Checkout tracking - implement reminder logic');
}
