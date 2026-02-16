// WhatsApp Webhook Handler for Vercel - Updated for deployment
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'whatsapp_crm_2024';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET - Webhook Verification
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log('📥 Webhook verification request:', { mode, token, challenge, expectedToken: VERIFY_TOKEN });

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook verified successfully');
      // Return challenge as plain text (not JSON)
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send(challenge);
    } else {
      console.log('❌ Webhook verification failed - mode:', mode, 'token match:', token === VERIFY_TOKEN);
      return res.status(403).send('Forbidden');
    }
  }

  // POST - Receive Messages
  if (req.method === 'POST') {
    try {
      const body = req.body;
      console.log('📨 Webhook received:', JSON.stringify(body, null, 2));

      // Check if it's a WhatsApp message
      if (body.object === 'whatsapp_business_account') {
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;

        if (!value) {
          return res.status(200).json({ success: true, message: 'No value in webhook' });
        }

        // Get phone number ID (brand)
        const phoneNumberId = value.metadata?.phone_number_id;
        
        // Find brand by phone_number_id - GET ALL FIELDS!
        const { data: brand } = await supabase
          .from('brands')
          .select('*')
          .eq('phone_number_id', phoneNumberId)
          .single();

        if (!brand) {
          console.log('⚠️  Brand not found for phone_number_id:', phoneNumberId);
          return res.status(200).json({ success: true, message: 'Brand not found' });
        }

        console.log('✅ Brand found:', brand.name);
        console.log('   Token exists:', brand.whatsapp_token ? 'Yes' : 'No');

        // Process messages
        if (value.messages && value.messages.length > 0) {
          for (const message of value.messages) {
            await processInboundMessage(message, brand, value.contacts?.[0]);
          }
        }

        // Process statuses
        if (value.statuses && value.statuses.length > 0) {
          for (const status of value.statuses) {
            await processMessageStatus(status, brand.id);
          }
        }
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('❌ Webhook error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

async function processInboundMessage(message, brand, contact) {
  try {
    const waId = message.from;
    const messageType = message.type;
    const timestamp = new Date(parseInt(message.timestamp) * 1000);

    // Find or create contact
    let { data: existingContact } = await supabase
      .from('contacts')
      .select('id')
      .eq('brand_id', brand.id)
      .eq('wa_id', waId)
      .single();

    let contactId;

    if (!existingContact) {
      // Create new contact
      const { data: newContact, error } = await supabase
        .from('contacts')
        .insert({
          brand_id: brand.id,
          wa_id: waId,
          name: contact?.profile?.name || waId,
          last_message_at: timestamp
        })
        .select('id')
        .single();

      if (error) throw error;
      contactId = newContact.id;
      console.log('✅ New contact created:', waId);
    } else {
      contactId = existingContact.id;
      
      // Update last_message_at
      await supabase
        .from('contacts')
        .update({ last_message_at: timestamp })
        .eq('id', contactId);
    }

    // Extract message content
    let messageBody = '';
    let mediaUrl = null;
    let mediaType = null;
    let buttonId = null;

    if (messageType === 'text') {
      messageBody = message.text?.body || '';
    } else if (messageType === 'interactive') {
      // Handle button replies
      const interactive = message.interactive;
      if (interactive?.type === 'button_reply') {
        buttonId = interactive.button_reply?.id;
        const buttonTitle = interactive.button_reply?.title;
        messageBody = `[Button: ${buttonTitle}]`;
        
        console.log('🔘 Button clicked:', buttonId, buttonTitle);
        
        // Handle button click (confirm/cancel order)
        if (buttonId) {
          try {
            await handleButtonClickAction(buttonId, waId, brand);
            console.log('✅ Button handled successfully');
          } catch (error) {
            console.error('❌ Error handling button click:', error);
          }
        }
      }
    } else if (messageType === 'image') {
      messageBody = message.image?.caption || '[Image]';
      mediaUrl = message.image?.id;
      mediaType = 'image';
    } else if (messageType === 'document') {
      messageBody = message.document?.caption || '[Document]';
      mediaUrl = message.document?.id;
      mediaType = 'document';
    } else if (messageType === 'audio') {
      messageBody = '[Audio]';
      mediaUrl = message.audio?.id;
      mediaType = 'audio';
    } else if (messageType === 'video') {
      messageBody = message.video?.caption || '[Video]';
      mediaUrl = message.video?.id;
      mediaType = 'video';
    }

    // Save message
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        contact_id: contactId,
        brand_id: brand.id,
        direction: 'inbound',
        message_type: messageType,
        body: messageBody,
        media_url: mediaUrl,
        media_type: mediaType,
        wa_message_id: message.id,
        status: 'read',
        created_at: timestamp
      });

    if (messageError) throw messageError;

    console.log('✅ Message saved:', message.id);
  } catch (error) {
    console.error('❌ Error processing inbound message:', error);
  }
}

async function processMessageStatus(status, brandId) {
  try {
    const waMessageId = status.id;
    const newStatus = status.status; // sent, delivered, read, failed

    // Update message status
    const { error } = await supabase
      .from('messages')
      .update({ status: newStatus })
      .eq('wa_message_id', waMessageId)
      .eq('brand_id', brandId);

    if (error) throw error;

    console.log('✅ Message status updated:', waMessageId, '→', newStatus);
  } catch (error) {
    console.error('❌ Error processing status:', error);
  }
}

// Handle button click action
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

    // Get order from database using shopify_order_id
    const { data: order, error: orderError } = await supabase
      .from('shopify_orders')
      .select('*')
      .eq('shopify_order_id', orderId)
      .eq('brand_id', brand.id)
      .single();

    if (orderError || !order) {
      console.error('❌ Order not found in database:', orderId);
      return { success: false, error: 'Order not found' };
    }

    // Update Shopify based on action
    let confirmationMessage;

    if (action === 'confirm') {
      console.log('✅ Confirming and fulfilling order...');

      // STEP 1: Fulfill order using SIMPLE API (like manual fulfillment)
      let orderFulfilled = false;
      
      try {
        console.log('📦 Step 1: Creating simple fulfillment (like manual)...');
        
        // Use the simple fulfillment method that works manually
        const simpleFulfillmentPayload = {
          fulfillment: {
            notify_customer: false,
            tracking_number: `WA-${Date.now()}`,
            tracking_company: 'WhatsApp CRM'
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
          console.log('🎉 SIMPLE FULFILLMENT SUCCESS!');
          console.log('✅ Fulfillment ID:', simpleFulfillmentData.fulfillment?.id);
          orderFulfilled = true;
        } else {
          const simpleError = await simpleFulfillmentResponse.json();
          console.error('❌ Simple fulfillment failed:', simpleError);
          
          // Only try NEW API as fallback if simple fails
          console.log('🔄 Trying NEW API as fallback...');
          
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
                console.log('🎉 NEW API FULFILLMENT SUCCESS (fallback)!');
                console.log('✅ Fulfillment ID:', newFulfillmentData.fulfillment?.id);
                orderFulfilled = true;
              } else {
                const newError = await newFulfillmentResponse.json();
                console.error('❌ NEW API fulfillment also failed:', newError);
              }
            } else {
              console.error('❌ No fulfillment orders found');
            }
          } else {
            const fulfillmentOrdersError = await fulfillmentOrdersResponse.json();
            console.error('❌ Failed to get fulfillment orders:', fulfillmentOrdersError);
          }
        }
      } catch (fulfillError) {
        console.error('⚠️  Failed to fulfill order:', fulfillError.message);
      }

      // STEP 2: Add confirmed tag to Shopify (after fulfillment)
      console.log('🏷️  Step 2: Adding confirmed tag...');
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
                tags: orderFulfilled ? 'whatsapp-confirmed,whatsapp-fulfilled' : 'whatsapp-confirmed',
                note: `تم التأكيد عبر WhatsApp في ${new Date().toLocaleString('ar-EG')}${orderFulfilled ? ' وتم الشحن تلقائياً' : ''}`
              }
            })
          }
        );

        if (tagResponse.ok) {
          console.log('✅ Tags added successfully');
        } else {
          console.log('⚠️  Failed to add tags');
        }
      } catch (tagError) {
        console.error('⚠️  Tag error:', tagError);
      }

      // STEP 3: Update database based on fulfillment result
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

      // STEP 4: Set confirmation message based on fulfillment result
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

    } else if (action === 'cancel') {
      console.log('❌ Cancelling order...');
      
      // Add cancelled tag to Shopify
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
                tags: 'whatsapp-cancelled',
                note: `تم الإلغاء عبر WhatsApp في ${new Date().toLocaleString('ar-EG')}`
              }
            })
          }
        );

        if (tagResponse.ok) {
          console.log('✅ Cancelled tag added');
        }
      } catch (tagError) {
        console.error('⚠️  Tag error:', tagError);
      }

      // Update order status in database
      await supabase
        .from('shopify_orders')
        .update({
          confirmation_status: 'cancelled',
          order_status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', order.id);

      // Set cancellation message
      confirmationMessage = `❌ تم إلغاء طلبك

📦 رقم الطلب: #${order.shopify_order_number}

تم إلغاء الطلب بنجاح.
يمكنك الطلب مرة أخرى في أي وقت.

شكراً لك 🙏`;
    }

    // Send confirmation message to customer
    await sendWhatsAppMessage(
      brand.phone_number_id,
      brand.whatsapp_token,
      wa_id,
      confirmationMessage
    );

    // Get contact
    const { data: contact } = await supabase
      .from('contacts')
      .select('id')
      .eq('brand_id', brand.id)
      .eq('wa_id', wa_id)
      .single();

    // Save confirmation message
    if (contact) {
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
    }

    return {
      success: true,
      action,
      order_id: orderId,
      message: confirmationMessage
    };

  } catch (error) {
    console.error('❌ Error handling button click:', error);
    return { success: false, error: error.message };
  }
}

// Get order tags from Shopify
async function getShopifyOrderTags(shopUrl, accessToken, orderId) {
  try {
    const response = await fetch(
      `https://${shopUrl}/admin/api/2024-01/orders/${orderId}.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get order');
    }

    const data = await response.json();
    const tags = data.order.tags || '';
    return tags.split(',').map(tag => tag.trim()).filter(tag => tag);

  } catch (error) {
    console.error('❌ Error getting order tags:', error);
    return [];
  }
}

// Update order tags in Shopify
async function updateShopifyOrderTags(shopUrl, accessToken, orderId, tags) {
  try {
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
            tags: tags
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Shopify API error:', data);
      throw new Error(data.errors || 'Failed to update tags');
    }

    console.log('✅ Shopify order tags updated:', tags);
    return { success: true, data };

  } catch (error) {
    console.error('❌ Shopify tags update error:', error);
    throw error;
  }
}

// Confirm order in Shopify
async function confirmShopifyOrder(shopUrl, accessToken, orderId, tags) {
  try {
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
            tags: tags,
            note: `تم التأكيد عبر WhatsApp في ${new Date().toLocaleString('ar-EG')}`
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Shopify API error:', data);
      throw new Error(data.errors || 'Failed to update Shopify order');
    }

    console.log('✅ Shopify order confirmed with tags:', tags);
    return { success: true, data };

  } catch (error) {
    console.error('❌ Shopify confirm error:', error);
    throw error;
  }
}

// Fulfill order in Shopify (mark as fulfilled)
async function fulfillShopifyOrder(shopUrl, accessToken, orderId) {
  try {
    console.log('📦 Attempting to fulfill order:', orderId);

    // First, get order details
    const orderResponse = await fetch(
      `https://${shopUrl}/admin/api/2024-01/orders/${orderId}.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      console.error('Failed to get order:', errorData);
      throw new Error('Failed to get order details');
    }

    const orderData = await orderResponse.json();
    const order = orderData.order;

    console.log('📋 Order details:', {
      id: order.id,
      name: order.name,
      fulfillment_status: order.fulfillment_status,
      financial_status: order.financial_status,
      line_items_count: order.line_items?.length
    });

    // Check if already fulfilled
    if (order.fulfillment_status === 'fulfilled') {
      console.log('⚠️  Order already fulfilled');
      return { success: true, message: 'Already fulfilled' };
    }

    // Check if order is paid
    if (order.financial_status !== 'paid' && order.financial_status !== 'authorized') {
      console.log('⚠️  Order not paid yet, skipping fulfillment');
      return { success: false, message: 'Order not paid' };
    }

    // Get fulfillment orders (new API)
    const fulfillmentOrdersResponse = await fetch(
      `https://${shopUrl}/admin/api/2024-01/orders/${orderId}/fulfillment_orders.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!fulfillmentOrdersResponse.ok) {
      console.error('Failed to get fulfillment orders');
      // Fallback to old method
      return await fulfillOrderOldMethod(shopUrl, accessToken, orderId, order);
    }

    const fulfillmentOrdersData = await fulfillmentOrdersResponse.json();
    const fulfillmentOrders = fulfillmentOrdersData.fulfillment_orders || [];

    console.log('📦 Fulfillment orders:', fulfillmentOrders.length);

    if (fulfillmentOrders.length === 0) {
      console.log('⚠️  No fulfillment orders found');
      return { success: false, message: 'No fulfillment orders' };
    }

    // Fulfill each fulfillment order
    for (const fulfillmentOrder of fulfillmentOrders) {
      if (fulfillmentOrder.status === 'open') {
        console.log('📤 Creating fulfillment for:', fulfillmentOrder.id);

        const fulfillmentPayload = {
          fulfillment: {
            line_items_by_fulfillment_order: [
              {
                fulfillment_order_id: fulfillmentOrder.id
              }
            ],
            notify_customer: false
          }
        };

        const createFulfillmentResponse = await fetch(
          `https://${shopUrl}/admin/api/2024-01/fulfillments.json`,
          {
            method: 'POST',
            headers: {
              'X-Shopify-Access-Token': accessToken,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(fulfillmentPayload)
          }
        );

        const fulfillmentData = await createFulfillmentResponse.json();

        if (!createFulfillmentResponse.ok) {
          console.error('❌ Fulfillment creation failed:', JSON.stringify(fulfillmentData, null, 2));
          throw new Error('Failed to create fulfillment');
        }

        console.log('✅ Fulfillment created successfully!');
      }
    }

    return { success: true, message: 'Order fulfilled' };

  } catch (error) {
    console.error('❌ Shopify fulfill error:', error.message);
    console.error('   Full error:', error);
    throw error;
  }
}

// Fallback: Old fulfillment method
async function fulfillOrderOldMethod(shopUrl, accessToken, orderId, order) {
  try {
    console.log('📦 Using old fulfillment method...');

    // Prepare line items for fulfillment
    const lineItemsForFulfillment = order.line_items
      .filter(item => item.fulfillable_quantity > 0)
      .map(item => ({
        id: item.id,
        quantity: item.fulfillable_quantity
      }));

    if (lineItemsForFulfillment.length === 0) {
      console.log('⚠️  No items to fulfill');
      return { success: false, message: 'No fulfillable items' };
    }

    console.log('📦 Fulfilling items:', lineItemsForFulfillment);

    const fulfillmentPayload = {
      fulfillment: {
        notify_customer: false,
        line_items: lineItemsForFulfillment
      }
    };

    const fulfillmentResponse = await fetch(
      `https://${shopUrl}/admin/api/2024-01/orders/${orderId}/fulfillments.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fulfillmentPayload)
      }
    );

    const data = await fulfillmentResponse.json();

    if (!fulfillmentResponse.ok) {
      console.error('❌ Old method fulfillment error:', JSON.stringify(data, null, 2));
      throw new Error('Failed to fulfill order (old method)');
    }

    console.log('✅ Order fulfilled successfully (old method)!');
    return { success: true, data };

  } catch (error) {
    console.error('❌ Old method error:', error.message);
    throw error;
  }
}

// Cancel order in Shopify
async function cancelShopifyOrder(shopUrl, accessToken, orderId) {
  try {
    const response = await fetch(
      `https://${shopUrl}/admin/api/2024-01/orders/${orderId}/cancel.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: 'customer',
          email: false,
          refund: false
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Shopify API error:', data);
      throw new Error(data.errors || 'Failed to cancel Shopify order');
    }

    console.log('✅ Shopify order cancelled');
    return { success: true, data };

  } catch (error) {
    console.error('❌ Shopify cancel error:', error);
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
