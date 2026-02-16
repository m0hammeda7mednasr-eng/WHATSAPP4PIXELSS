/**
 * Shopify Routes
 * Handles Shopify OAuth and webhooks
 */

import express from 'express';
import { asyncHandler } from '../utils/errors.js';
import { validate, schemas } from '../utils/validation.js';
import { webhookLimiter } from '../middleware/rateLimiter.js';
import * as shopifyController from '../controllers/shopify.controller.js';

const router = express.Router();

/**
 * GET /api/shopify/oauth/install
 * Start Shopify OAuth flow
 */
router.get(
  '/oauth/install',
  validate(schemas.shopifyOAuthInstall),
  asyncHandler(shopifyController.startOAuth)
);

/**
 * GET /api/shopify/oauth/callback
 * Shopify OAuth callback
 */
router.get(
  '/oauth/callback',
  validate(schemas.shopifyOAuthCallback),
  asyncHandler(shopifyController.handleOAuthCallback)
);

/**
 * POST /api/shopify/webhook
 * Receive Shopify webhooks
 */
router.post(
  '/webhook',
  webhookLimiter,
  asyncHandler(shopifyController.handleWebhook)
);

export default router;
