/**
 * Application Constants
 */

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  DOCUMENT: 'document',
  INTERACTIVE: 'interactive',
};

export const MESSAGE_DIRECTIONS = {
  INBOUND: 'inbound',
  OUTBOUND: 'outbound',
};

export const MESSAGE_STATUS = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed',
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
};

export const CUSTOMER_RESPONSE = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
};

export const SHOPIFY_SCOPES = [
  'read_orders',
  'write_orders',
  'read_products',
  'read_customers',
  'write_fulfillments',
];

export const WHATSAPP_API_VERSION = 'v18.0';

export const RATE_LIMITS = {
  WEBHOOK: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // max requests per window
  },
  API: {
    windowMs: 15 * 60 * 1000,
    max: 100,
  },
};

export const RETRY_CONFIG = {
  retries: 3,
  minTimeout: 1000,
  maxTimeout: 5000,
  factor: 2,
};

export const REMINDER_DELAY_HOURS = 1;
export const CRON_INTERVAL_MINUTES = 5;
