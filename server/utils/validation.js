/**
 * Request Validation Schemas using Zod
 */

import { z } from 'zod';
import { ValidationError } from './errors.js';

/**
 * Validation middleware factory
 */
export const validate = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    
    req.validated = validated;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      next(new ValidationError('Validation failed', details));
    } else {
      next(error);
    }
  }
};

/**
 * Common validation schemas
 */
export const schemas = {
  // Send Message
  sendMessage: z.object({
    body: z.object({
      contact_id: z.string().uuid('Invalid contact ID'),
      brand_id: z.string().uuid('Invalid brand ID'),
      message: z.string().min(1).max(4096, 'Message too long'),
      media_url: z.string().url().optional(),
      message_type: z.enum(['text', 'image', 'video', 'audio', 'document']).default('text'),
    }),
  }),

  // Shopify OAuth Install
  shopifyOAuthInstall: z.object({
    query: z.object({
      shop: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/, 'Invalid shop domain'),
      brand_id: z.string().uuid('Invalid brand ID'),
      client_id: z.string().min(1, 'Client ID required'),
      client_secret: z.string().min(1, 'Client secret required'),
    }),
  }),

  // Shopify OAuth Callback
  shopifyOAuthCallback: z.object({
    query: z.object({
      code: z.string().min(1, 'Authorization code required'),
      state: z.string().min(1, 'State required'),
      shop: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/, 'Invalid shop domain'),
    }),
  }),

  // WhatsApp Webhook Verification
  whatsappWebhookVerify: z.object({
    query: z.object({
      'hub.mode': z.literal('subscribe'),
      'hub.verify_token': z.string(),
      'hub.challenge': z.string(),
    }),
  }),

  // UUID param
  uuidParam: z.object({
    params: z.object({
      id: z.string().uuid('Invalid ID'),
    }),
  }),
};

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input) {
  if (typeof input === 'string') {
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .trim();
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    Object.keys(input).forEach((key) => {
      sanitized[key] = sanitizeInput(input[key]);
    });
    return sanitized;
  }
  
  return input;
}

/**
 * Phone number validation and formatting
 */
export function validateAndFormatPhone(phone) {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/[^0-9]/g, '');
  
  // Check if valid length (10-15 digits)
  if (cleaned.length < 10 || cleaned.length > 15) {
    throw new ValidationError('Invalid phone number length');
  }
  
  // Add country code if missing (default to Egypt +20)
  if (cleaned.startsWith('0')) {
    return '20' + cleaned.substring(1);
  }
  
  if (!cleaned.startsWith('20') && cleaned.length === 10) {
    return '20' + cleaned;
  }
  
  return cleaned;
}
