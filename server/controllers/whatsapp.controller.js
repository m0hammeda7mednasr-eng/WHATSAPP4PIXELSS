/**
 * WhatsApp Webhook Controller
 * Handles WhatsApp webhook verification and incoming messages
 */

import { getSupabaseClient } from '../db/client.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';
import { UnauthorizedError, NotFoundError } from '../utils/errors.js';
import WhatsAppService from '../services/whatsapp.service.js';

/**
 * Verify webhook
 */
export async function verifyWebhook(req, res) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  logger.info('Webhook verification request', {
    correlationId: req.correlationId,
    mode,
  });

  if (mode === 'subscribe' && token === env.webhook.verifyToken) {
    logger.info('Webhook verified successfully', {
      correlationId: req.correlationId,
    });
    res.status(200).send(challenge);
  } else {
    logger.warn('Webhook verification failed', {
      correlationId: req.correlationId,
      mode,
    });
    throw new UnauthorizedError('Webhook verification failed');
  }
}

/**
 * Handle incoming webhook
 */
export async function handleWebhook(req, res) {
  const supabase = getSupabaseClient();

  logger.info('Received WhatsApp webhook', {
    correlationId: req.correlationId,
  });

  const body = req.body;
  const entry = body.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;
  const messages = value?.messages?.[0];
  const contacts = value?.contacts?.[0];

  if (!messages) {
    logger.debug('No message in webhook', {
      correlationId: req.correlationId,
    });
    return res.status(200).json({ success: true, message: 'No message to process' });
  }

  const wa_id = messages.from;
  const phone_number_id = value.metadata?.phone_number_id;
  const message_type = messages.type;
  const wa_message_id = messages.id;
  const timestamp = messages.timestamp;

  logger.info('Processing message', {
    correlationId: req.correlationId,
    from: `***${wa_id.slice(-4)}`,
    type: message_type,
    phoneNumberId: phone_number_id,
  });

  // Handle button clicks (Interactive Messages)
  if (message_type === 'interactive') {
    await handleButtonClick(req, messages, phone_number_id, wa_id);
    return res.status(200).json({ success: true });
  }

  // Extract message content
  let body_text = '';
  let media_url = null;

  switch (message_type) {
    case 'text':
      body_text = messages.text?.body || '';
      break;
    case 'image':
      body_text = messages.image?.caption || '[صورة]';
      media_url = messages.image?.id;
      break;
    case 'video':
      body_text = messages.video?.caption || '[فيديو]';
      media_url = messages.video?.id;
      break;
    case 'audio':
      body_text = '[رسالة صوتية]';
      media_url = messages.audio?.id;
      break;
    case 'document':
      body_text = messages.document?.filename || '[مستند]';
      media_url = messages.document?.id;
      break;
    default:
      body_text = `[${message_type}]`;
  }

  const contact_name = contacts?.profile?.name || wa_id;

  // Find brand by phone_number_id
  const { data: brandData, error: brandError } = await supabase
    .from('brands')
    .select('id, name')
    .eq('phone_number_id', phone_number_id)
    .single();

  if (brandError || !brandData) {
    logger.error('Brand not found', {
      correlationId: req.correlationId,
      phoneNumberId: phone_number_id,
    });
    throw new NotFoundError('Brand');
  }

  const brand_id = brandData.id;

  // Create or update contact
  const { data: contactData, error: contactError } = await supabase
    .from('contacts')
    .upsert(
      {
        brand_id,
        wa_id,
        name: contact_name,
        last_message_at: new Date().toISOString(),
      },
      {
        onConflict: 'brand_id,wa_id',
      }
    )
    .select()
    .single();

  if (contactError) {
    logger.error('Failed to create/update contact', {
      correlationId: req.correlationId,
      error: contactError.message,
    });
    throw contactError;
  }

  const contact_id = contactData.id;

  // Save message
  const { data: messageData, error: messageError } = await supabase
    .from('messages')
    .insert({
      contact_id,
      brand_id,
      direction: 'inbound',
      message_type,
      body: body_text,
      media_url,
      status: 'delivered',
      wa_message_id,
      created_at: new Date(parseInt(timestamp) * 1000).toISOString(),
    })
    .select()
    .single();

  if (messageError) {
    logger.error('Failed to save message', {
      correlationId: req.correlationId,
      error: messageError.message,
    });
    throw messageError;
  }

  logger.info('Message processed successfully', {
    correlationId: req.correlationId,
    messageId: messageData.id,
  });

  res.status(200).json({
    success: true,
    message_id: messageData.id,
  });
}

/**
 * Handle button click from interactive message
 */
async function handleButtonClick(req, messages, phone_number_id, wa_id) {
  const supabase = getSupabaseClient();
  const buttonReply = messages.interactive?.button_reply;
  const buttonId = buttonReply?.id;

  logger.info('Button clicked', {
    correlationId: req.correlationId,
    buttonId,
    title: buttonReply?.title,
  });

  if (!buttonId) return;

  // Extract action and order ID from button ID
  const [action, orderId] = buttonId.split('_');

  // Find brand
  const { data: brandData, error: brandError } = await supabase
    .from('brands')
    .select('*')
    .eq('phone_number_id', phone_number_id)
    .single();

  if (brandError || !brandData) {
    logger.error('Brand not found for button click', {
      correlationId: req.correlationId,
      phoneNumberId: phone_number_id,
    });
    return;
  }

  // Find contact
  const { data: contactData, error: contactError } = await supabase
    .from('contacts')
    .select('*')
    .eq('brand_id', brandData.id)
    .eq('wa_id', wa_id)
    .single();

  if (contactError || !contactData) {
    logger.error('Contact not found for button click', {
      correlationId: req.correlationId,
    });
    return;
  }

  if (action === 'confirm') {
    await handleOrderConfirmation(req, orderId, contactData, brandData);
  } else if (action === 'cancel') {
    await handleOrderCancellation(req, orderId, contactData, brandData);
  }
}

/**
 * Handle order confirmation
 */
async function handleOrderConfirmation(req, orderId, contact, brand) {
  const supabase = getSupabaseClient();

  logger.info('Processing order confirmation', {
    correlationId: req.correlationId,
    orderId,
  });

  // Get order details
  const { data: order, error: orderError } = await supabase
    .from('shopify_orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    logger.error('Order not found', {
      correlationId: req.correlationId,
      orderId,
    });
    return;
  }

  // Update order status
  await supabase
    .from('shopify_orders')
    .update({
      confirmation_status: 'confirmed',
      customer_response: 'confirmed',
      response_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  // Get confirmation message
  let messageText =
    brand.confirmation_message ||
    `✅ *تم تأكيد طلبك بنجاح!*

شكراً {customer_name}! 🎉

🧾 رقم الطلب: #{order_number}

نحن الآن نجهز طلبك بعناية، وسيتم التواصل معك قريباً لترتيب موعد التوصيل 🚚

شكراً لثقتك في {brand_name} 💙`;

  // Replace variables
  messageText = messageText
    .replace(/{customer_name}/g, contact.name)
    .replace(/{order_number}/g, order.shopify_order_number)
    .replace(/{brand_name}/g, brand.name);

  // Send confirmation message
  try {
    await WhatsAppService.sendTextMessage(
      brand.phone_number_id,
      brand.whatsapp_token,
      contact.wa_id,
      messageText
    );

    logger.info('Confirmation message sent', {
      correlationId: req.correlationId,
      orderId,
    });
  } catch (error) {
    logger.error('Failed to send confirmation message', {
      correlationId: req.correlationId,
      error: error.message,
    });
  }
}

/**
 * Handle order cancellation
 */
async function handleOrderCancellation(req, orderId, contact, brand) {
  const supabase = getSupabaseClient();

  logger.info('Processing order cancellation', {
    correlationId: req.correlationId,
    orderId,
  });

  // Get order details
  const { data: order, error: orderError } = await supabase
    .from('shopify_orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    logger.error('Order not found', {
      correlationId: req.correlationId,
      orderId,
    });
    return;
  }

  // Update order status
  await supabase
    .from('shopify_orders')
    .update({
      confirmation_status: 'cancelled',
      customer_response: 'cancelled',
      response_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  // Get cancellation message
  let messageText =
    brand.cancellation_message ||
    `❌ *تم إلغاء طلبك*

{customer_name}، تم إلغاء طلب رقم #{order_number} بنجاح.

نأسف لعدم إتمام الطلب. يمكنك الطلب مرة أخرى في أي وقت.

نتمنى خدمتك قريباً 💙`;

  // Replace variables
  messageText = messageText
    .replace(/{customer_name}/g, contact.name)
    .replace(/{order_number}/g, order.shopify_order_number)
    .replace(/{brand_name}/g, brand.name);

  // Send cancellation message
  try {
    await WhatsAppService.sendTextMessage(
      brand.phone_number_id,
      brand.whatsapp_token,
      contact.wa_id,
      messageText
    );

    logger.info('Cancellation message sent', {
      correlationId: req.correlationId,
      orderId,
    });
  } catch (error) {
    logger.error('Failed to send cancellation message', {
      correlationId: req.correlationId,
      error: error.message,
    });
  }
}
