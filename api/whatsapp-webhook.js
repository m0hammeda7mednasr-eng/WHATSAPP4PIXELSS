// WhatsApp Webhook Handler - Alternative endpoint
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'whatsapp_crm_2024';

export default async function handler(req, res) {
  // CORS headers
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

    console.log('📥 Webhook verification:', { mode, token, challenge });

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook verified successfully');
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send(challenge);
    } else {
      console.log('❌ Webhook verification failed');
      return res.status(403).send('Forbidden');
    }
  }

  // POST - Process Messages
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
        
        // Find brand by phone_number_id
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

// Handle button click
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
      console.log('✅ Confirming and fulfilling order...');

      // Add tag
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
                tags: 'whatsapp-confirmed',
                note: `تم التأكيد عبر WhatsApp في ${new Date().toLocaleString('ar-EG')}`
              }
            })
          }
        );
        console.log('✅ Tag added');
      } catch (tagError) {
        console.error('⚠️  Tag error:', tagError);
      }

      // Fulfill order
      let orderFulfilled = false;
      
      try {
        console.log('📦 Creating fulfillment...');
        
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

        if (fulfillmentOrdersResponse.ok) {
          const fulfillmentOrdersData = await fulfillmentOrdersResponse.json();
          
          if (fulfillmentOrdersData.fulfillment_orders?.length > 0) {
            const fulfillmentOrderId = fulfillmentOrdersData.fulfillment_orders[0].id;
            console.log('✅ Found fulfillment order ID:', fulfillmentOrderId);
            
            // Create fulfillment
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

            const fulfillmentResponse = await fetch(
              `https://${shopifyConn.shop_url}/admin/api/2024-01/fulfillments.json`,
              {
                method: 'POST',
                headers: {
                  'X-Shopify-Access-Token': shopifyConn.access_token,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(fulfillmentPayload)
              }
            );

            if (fulfillmentResponse.ok) {
              const fulfillmentData = await fulfillmentResponse.json();
              console.log('🎉 FULFILLMENT SUCCESS!');
              console.log('✅ Fulfillment ID:', fulfillmentData.fulfillment?.id);
              orderFulfilled = true;
            } else {
              const fulfillmentError = await fulfillmentResponse.json();
              console.error('❌ Fulfillment failed:', fulfillmentError);
            }
          }
        }
      } catch (fulfillError) {
        console.error('⚠️  Fulfillment error:', fulfillError);
      }

      // Update database
      const finalStatus = orderFulfilled ? 'fulfilled' : 'confirmed';
      
      await supabase
        .from('shopify_orders')
        .update({
          confirmation_status: 'confirmed',
          order_status: finalStatus,
          confirmed_at: new Date().toISOString()
        })
        .eq('id', order.id);
        
      console.log('✅ Order status updated to:', finalStatus);

      // Send confirmation message
      const confirmationMessage = orderFulfilled 
        ? `✅ تم تأكيد وشحن طلبك بنجاح!\n\n📦 رقم الطلب: #${order.shopify_order_number}\n\nتم تجهيز طلبك للشحن وسيصلك قريباً إن شاء الله 🚚\n\nشكراً لثقتك في ${brand.name} 🙏`
        : `✅ تم تأكيد طلبك بنجاح!\n\n📦 رقم الطلب: #${order.shopify_order_number}\n\nسيتم تجهيز طلبك وشحنه قريباً 📦\n\nشكراً لثقتك في ${brand.name} 🙏`;

      // Send WhatsApp message
      if (brand.whatsapp_token) {
        try {
          await fetch(
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
          console.log('✅ Confirmation message sent');
        } catch (msgError) {
          console.error('❌ Message send error:', msgError);
        }
      }
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