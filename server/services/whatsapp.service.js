/**
 * WhatsApp Business API Service
 * Handles all WhatsApp API interactions
 */

import { logger } from '../utils/logger.js';
import { ExternalAPIError } from '../utils/errors.js';
import { retry, RETRY_PRESETS } from '../utils/retry.js';

const WHATSAPP_API_VERSION = 'v18.0';
const WHATSAPP_API_BASE = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;

export class WhatsAppService {
  /**
   * Send text message
   */
  static async sendTextMessage(phoneNumberId, token, to, text) {
    logger.debug('Sending text message', {
      to: `***${to.slice(-4)}`,
      textLength: text.length,
    });

    return retry(
      async () => {
        const response = await fetch(
          `${WHATSAPP_API_BASE}/${phoneNumberId}/messages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to,
              type: 'text',
              text: { body: text },
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new ExternalAPIError(
            'WhatsApp',
            data.error?.message || 'Failed to send message',
            data
          );
        }

        logger.info('Text message sent', {
          messageId: data.messages?.[0]?.id,
          to: `***${to.slice(-4)}`,
        });

        return data;
      },
      RETRY_PRESETS.externalAPI
    );
  }

  /**
   * Send interactive message with buttons
   */
  static async sendInteractiveMessage(phoneNumberId, token, to, messageText, buttons) {
    logger.debug('Sending interactive message', {
      to: `***${to.slice(-4)}`,
      buttonCount: buttons.length,
    });

    return retry(
      async () => {
        const response = await fetch(
          `${WHATSAPP_API_BASE}/${phoneNumberId}/messages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              recipient_type: 'individual',
              to,
              type: 'interactive',
              interactive: {
                type: 'button',
                body: {
                  text: messageText,
                },
                action: {
                  buttons: buttons.map((btn) => ({
                    type: 'reply',
                    reply: {
                      id: btn.id,
                      title: btn.title,
                    },
                  })),
                },
              },
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new ExternalAPIError(
            'WhatsApp',
            data.error?.message || 'Failed to send interactive message',
            data
          );
        }

        logger.info('Interactive message sent', {
          messageId: data.messages?.[0]?.id,
          to: `***${to.slice(-4)}`,
        });

        return data;
      },
      RETRY_PRESETS.externalAPI
    );
  }

  /**
   * Send template message
   */
  static async sendTemplateMessage(phoneNumberId, token, to, templateName, languageCode, components) {
    logger.debug('Sending template message', {
      to: `***${to.slice(-4)}`,
      template: templateName,
    });

    return retry(
      async () => {
        const response = await fetch(
          `${WHATSAPP_API_BASE}/${phoneNumberId}/messages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to,
              type: 'template',
              template: {
                name: templateName,
                language: { code: languageCode },
                components,
              },
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new ExternalAPIError(
            'WhatsApp',
            data.error?.message || 'Failed to send template message',
            data
          );
        }

        logger.info('Template message sent', {
          messageId: data.messages?.[0]?.id,
          to: `***${to.slice(-4)}`,
          template: templateName,
        });

        return data;
      },
      RETRY_PRESETS.externalAPI
    );
  }

  /**
   * Verify webhook signature (if needed in future)
   */
  static verifyWebhookSignature(signature, body, secret) {
    // TODO: Implement signature verification
    // For now, we rely on verify_token
    return true;
  }
}

export default WhatsAppService;
