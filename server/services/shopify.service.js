/**
 * Shopify API Service
 * Handles all Shopify API interactions
 */

import crypto from 'crypto';
import { logger } from '../utils/logger.js';
import { ExternalAPIError, UnauthorizedError } from '../utils/errors.js';
import { retry, RETRY_PRESETS } from '../utils/retry.js';

export class ShopifyService {
  /**
   * Verify webhook HMAC signature
   */
  static verifyWebhook(body, hmacHeader, secret) {
    if (!secret) {
      logger.warn('No Shopify webhook secret configured, skipping verification');
      return true;
    }

    const hash = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(body))
      .digest('base64');

    const isValid = hash === hmacHeader;

    if (!isValid) {
      logger.error('Shopify webhook verification failed', {
        expectedHash: hash.substring(0, 10) + '...',
        receivedHash: hmacHeader?.substring(0, 10) + '...',
      });
    }

    return isValid;
  }

  /**
   * Exchange authorization code for access token
   */
  static async exchangeCodeForToken(shop, clientId, clientSecret, code) {
    logger.debug('Exchanging code for access token', { shop });

    return retry(
      async () => {
        const response = await fetch(
          `https://${shop}/admin/oauth/access_token`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              client_id: clientId,
              client_secret: clientSecret,
              code,
            }),
          }
        );

        if (!response.ok) {
          const error = await response.text();
          throw new ExternalAPIError('Shopify', 'Failed to exchange code for token', error);
        }

        const data = await response.json();
        logger.info('Access token obtained', { shop });

        return data;
      },
      RETRY_PRESETS.externalAPI
    );
  }

  /**
   * Validate access token
   */
  static async validateToken(shop, accessToken) {
    logger.debug('Validating access token', { shop });

    return retry(
      async () => {
        const response = await fetch(
          `https://${shop}/admin/api/2024-01/shop.json`,
          {
            headers: {
              'X-Shopify-Access-Token': accessToken,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new UnauthorizedError('Invalid Shopify access token');
        }

        const data = await response.json();
        logger.info('Token validated', { shop: data.shop.name });

        return data;
      },
      RETRY_PRESETS.externalAPI
    );
  }

  /**
   * Get order details
   */
  static async getOrder(shop, accessToken, orderId) {
    logger.debug('Fetching order details', { shop, orderId });

    return retry(
      async () => {
        const response = await fetch(
          `https://${shop}/admin/api/2024-01/orders/${orderId}.json`,
          {
            headers: {
              'X-Shopify-Access-Token': accessToken,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new ExternalAPIError('Shopify', 'Failed to fetch order');
        }

        const data = await response.json();
        return data.order;
      },
      RETRY_PRESETS.externalAPI
    );
  }

  /**
   * Create fulfillment (mark order as fulfilled)
   */
  static async createFulfillment(shop, accessToken, orderId, lineItems) {
    logger.debug('Creating fulfillment', { shop, orderId });

    return retry(
      async () => {
        const response = await fetch(
          `https://${shop}/admin/api/2024-01/orders/${orderId}/fulfillments.json`,
          {
            method: 'POST',
            headers: {
              'X-Shopify-Access-Token': accessToken,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fulfillment: {
                line_items: lineItems,
                notify_customer: false,
              },
            }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new ExternalAPIError('Shopify', 'Failed to create fulfillment', error);
        }

        const data = await response.json();
        logger.info('Fulfillment created', { shop, orderId });

        return data.fulfillment;
      },
      RETRY_PRESETS.externalAPI
    );
  }

  /**
   * Cancel order
   */
  static async cancelOrder(shop, accessToken, orderId, reason = 'customer') {
    logger.debug('Cancelling order', { shop, orderId });

    return retry(
      async () => {
        const response = await fetch(
          `https://${shop}/admin/api/2024-01/orders/${orderId}/cancel.json`,
          {
            method: 'POST',
            headers: {
              'X-Shopify-Access-Token': accessToken,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              reason,
            }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new ExternalAPIError('Shopify', 'Failed to cancel order', error);
        }

        const data = await response.json();
        logger.info('Order cancelled', { shop, orderId });

        return data.order;
      },
      RETRY_PRESETS.externalAPI
    );
  }
}

export default ShopifyService;
