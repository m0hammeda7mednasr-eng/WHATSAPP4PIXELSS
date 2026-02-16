// WhatsApp Webhook Handler for Netlify - Fixed Version
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
let supabase;
try {
  supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );
} catch (error) {
  console.error('❌ Supabase initialization error:', error);
}

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'whatsapp_crm_2024';

exports.handler = async (event, context) => {
  console.log('🚀 Webhook called:', event.httpMethod, event.path);
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // GET - Webhook Verification
  if (event.httpMethod === 'GET') {
    try {
      const params = event.queryStringParameters || {};
      const mode = params['hub.mode'];
      const token = params['hub.verify_token'];
      const challenge = params['hub.challenge'];

      console.log('📥 Webhook verification request:', { mode, token, challenge });

      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('✅ Webhook verified successfully');
        return {
          statusCode: 200,
          headers: { ...headers, 'Content-Type': 'text/plain' },
          body: challenge,
        };
      } else {
        console.log('❌ Webhook verification failed - token mismatch');
        console.log('Expected token:', VERIFY_TOKEN);
        console.log('Received token:', token);
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ error: 'Forbidden - Invalid verify token' }),
        };
      }
    } catch (error) {
      console.error('❌ GET request error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Internal server error during verification' }),
      };
    }
  }

  // POST - Process Messages
  if (event.httpMethod === 'POST') {
    try {
      if (!event.body) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'No body provided' }),
        };
      }

      const body = JSON.parse(event.body);
      console.log('📨 Webhook received:', JSON.stringify(body, null, 2));

      // Check if Supabase is initialized
      if (!supabase) {
        console.error('❌ Supabase not initialized');
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Database connection failed' }),
        };
      }

      // Check if it's a WhatsApp message
      if (body.object === 'whatsapp_business_account') {
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;

        if (!value) {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: 'No value in webhook' }),
          };
        }

        // Get phone number ID (brand)
        const phoneNumberId = value.metadata?.phone_number_id;
        
        if (!phoneNumberId) {
          console.log('⚠️  No phone_number_id in webhook');
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: 'No phone_number_id' }),
          };
        }
        
        // Find brand by phone_number_id
        const { data: brand, error: brandError } = await supabase
          .from('brands')
          .select('*')
          .eq('phone_number_id', phoneNumberId)
          .single();

        if (brandError || !brand) {
          console.log('⚠️  Brand not found for phone_number_id:', phoneNumberId);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: 'Brand not found' }),
          };
        }

        console.log('✅ Brand found:', brand.name);

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

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true }),
      };
    } catch (error) {
      console.error('❌ POST request error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, error: error.message }),
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
};

// Process inbound message
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
      
      await supabase
        .from('contacts')
        .update({ last_message_at: timestamp })
        .eq('id', contactId);
    }

    // Extract message content
    let messageBody = '';
    let buttonId = null;

    if (messageType === 'text') {
      messageBody = message.text?.body || '';
    } else if (messageType === 'interactive') {
      const interactive = message.interactive;
      if (interactive?.type === 'button_reply') {
        buttonId = interactive.button_reply?.id;
        const buttonTitle = interactive.button_reply?.title;
        messageBody = `[Button: ${buttonTitle}]`;
        
        console.log('🔘 Button clicked:', buttonId, buttonTitle);
        
        // Handle button click
        if (buttonId) {
          try {
            await handleButtonClick(buttonId, waId, brand);
            console.log('✅ Button handled successfully');
          } catch (error) {
            console.error('❌ Error handling button click:', error);
          }
        }
      }
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

// Handle button click - SIMPLIFIED FULFILLMENT (NO PAYMENT)
async function handleButtonClick(buttonId, wa_id, brand) {
  try {
    console.log('🔘 Processing button click:', { buttonId, wa_id, brand_id: brand.id });

    // Parse button ID
    const [action, ...orderIdParts] = buttonId.split('_');
    const orderId = orderIdParts.join('_');

    if (!['confirm', 'cancel'].includes(action)) {
      console.log('⚠️  Unknown button action:', action);
      return;
    }

    // Get Shopify connection
    const { data: shopifyConn } = await supabase
      .from('shopify_connections')
      .select('*')
      .eq('brand_id', brand.id)
      .eq('is_active', true)
      .single();

    if (!shopifyConn) {
      console.error('❌ Shopify not connected');
      return;
    }

    console.log('✅ Shopify connection found:', shopifyConn.shop_url);

    // Get order
    const { data: order } = await supabase
      .from('shopify_orders')
      .select('*')
      .eq('shopify_order_id', orderId)
      .eq('brand_id', brand.id)
      .single();

    if (!order) {
      console.error('❌ Order not found:', orderId);
      return;
    }

    console.log('✅ Order found:', order.shopify_order_number);

    if (action === 'confirm') {
      console.log('✅ Confirming and fulfilling order (NO PAYMENT)...');

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
        }
      } catch (fulfillError) {
        console.error('⚠️  Failed to fulfill order:', fulfillError.message);
      }

      // STEP 2: Add confirmed tag to Shopify (after fulfillment attempt)
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

      // STEP 4: Send confirmation message based on fulfillment result
      const confirmationMessage = orderFulfilled 
        ? `✅ تم تأكيد وشحن طلبك بنجاح!

📦 رقم الطلب: #${order.shopify_order_number}

تم تجهيز طلبك للشحن وسيصلك قريباً إن شاء الله 🚚

شكراً لثقتك في ${brand.name} 🙏`
        : `✅ تم تأكيد طلبك بنجاح!

📦 رقم الطلب: #${order.shopify_order_number}

سيتم تجهيز طلبك وشحنه قريباً 📦

شكراً لثقتك في ${brand.name} 🙏`;

      // Send WhatsApp confirmation message
      if (brand.whatsapp_token) {
        try {
          const messageResponse = await fetch(
            `https://graph.facebook.com/v18.0/${brand.phone_number_id}/messages`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${brand.whatsapp_token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: wa_id,
                type: 'text',
                text: { body: confirmationMessage }
              })
            }
          );

          if (messageResponse.ok) {
            console.log('✅ Confirmation message sent');
            
            // Save confirmation message to database
            const { data: contact } = await supabase
              .from('contacts')
              .select('id')
              .eq('brand_id', brand.id)
              .eq('wa_id', wa_id)
              .single();

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
          } else {
            const msgError = await messageResponse.json();
            console.error('❌ Message send failed:', msgError);
          }
        } catch (msgError) {
          console.error('❌ Message send error:', msgError);
        }
      }

    } else if (action === 'cancel') {
      console.log('❌ Cancelling order...');
      
      // Add cancelled tag
      try {
        await fetch(
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
        console.log('✅ Cancelled tag added');
      } catch (tagError) {
        console.error('⚠️  Tag error:', tagError);
      }

      // Update database
      await supabase
        .from('shopify_orders')
        .update({
          confirmation_status: 'cancelled',
          order_status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', order.id);

      console.log('✅ Order cancelled in database');
    }

    console.log('✅ Button click processed successfully');

  } catch (error) {
    console.error('❌ Error handling button click:', error);
  }
}

// Process message status
async function processMessageStatus(status, brandId) {
  try {
    await supabase
      .from('messages')
      .update({ status: status.status })
      .eq('wa_message_id', status.id)
      .eq('brand_id', brandId);
  } catch (error) {
    console.error('❌ Error processing status:', error);
  }
}