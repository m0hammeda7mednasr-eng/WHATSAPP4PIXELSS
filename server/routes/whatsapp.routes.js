/**
 * WhatsApp Webhook Routes
 * Handles WhatsApp webhook verification and incoming messages
 */

import express from 'express';
import { asyncHandler } from '../utils/errors.js';
import { webhookLimiter } from '../middleware/rateLimiter.js';
import * as whatsappController from '../controllers/whatsapp.controller.js';

const router = express.Router();

// Apply webhook rate limiter
router.use(webhookLimiter);

/**
 * GET /webhook/whatsapp
 * Webhook verification
 */
router.get('/', asyncHandler(whatsappController.verifyWebhook));

/**
 * POST /webhook/whatsapp
 * Receive incoming messages and events
 */
router.post('/', asyncHandler(whatsappController.handleWebhook));

export default router;
