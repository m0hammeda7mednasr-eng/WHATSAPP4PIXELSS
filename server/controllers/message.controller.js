/**
 * Message Controller
 * Handles message sending operations
 */

import { getSupabaseClient } from '../db/client.js';
import { logger } from '../utils/logger.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import WhatsAppService from '../services/whatsapp.service.js';

/**
 * Send message to contact
 */
export async function sendMessage(req, res) {
  const { contact_id, brand_id, message, media_url, message_type } = req.validated.body;
  const supabase = getSupabaseClient();

  logger.info('Sending message', {
    correlationId: req.correlationId,
    contactId: contact_id,
    brandId: brand_id,
    messageType: message_type,
  });

  // Get contact info
  const { data: contact, error: contactError } = await supabase
    .from('contacts')
    .select('wa_id, name')
    .eq('id', contact_id)
    .single();

  if (contactError || !contact) {
    throw new NotFoundError('Contact');
  }

  // Get brand info (WhatsApp credentials)
  const { data: brand, error: brandError } = await supabase
    .from('brands')
    .select('phone_number_id, whatsapp_token')
    .eq('id', brand_id)
    .single();

  if (brandError || !brand) {
    throw new NotFoundError('Brand');
  }

  let wa_message_id = `local_${Date.now()}`;
  let mode = 'local_only';

  // Send to WhatsApp if token exists
  if (brand.whatsapp_token && brand.whatsapp_token !== 'your_token_here') {
    try {
      const whatsappData = await WhatsAppService.sendTextMessage(
        brand.phone_number_id,
        brand.whatsapp_token,
        contact.wa_id,
        message
      );

      wa_message_id = whatsappData.messages?.[0]?.id;
      mode = 'whatsapp_sent';

      logger.info('Message sent to WhatsApp', {
        correlationId: req.correlationId,
        messageId: wa_message_id,
      });
    } catch (error) {
      logger.error('Failed to send to WhatsApp', {
        correlationId: req.correlationId,
        error: error.message,
      });
      throw error;
    }
  } else {
    logger.warn('No WhatsApp token configured, saving locally only', {
      correlationId: req.correlationId,
      brandId: brand_id,
    });
  }

  // Save message to database
  const { data: messageData, error: messageError } = await supabase
    .from('messages')
    .insert({
      contact_id,
      brand_id,
      direction: 'outbound',
      message_type,
      body: message,
      media_url,
      status: 'sent',
      wa_message_id,
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

  logger.info('Message saved to database', {
    correlationId: req.correlationId,
    messageId: messageData.id,
  });

  res.json({
    success: true,
    message_id: messageData.id,
    wa_message_id,
    mode,
  });
}
