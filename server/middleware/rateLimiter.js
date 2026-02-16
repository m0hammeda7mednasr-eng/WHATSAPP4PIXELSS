/**
 * Rate Limiting Middleware
 * Protects against DDoS and API abuse
 */

import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger.js';

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later.',
    });
  },
});

/**
 * Webhook rate limiter (more permissive)
 */
export const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Higher limit for webhooks
  message: {
    success: false,
    error: 'Webhook rate limit exceeded.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for verified webhooks
    // You can add custom logic here
    return false;
  },
});

/**
 * Strict rate limiter for sensitive operations
 */
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Very strict
  message: {
    success: false,
    error: 'Too many attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
