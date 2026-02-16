/**
 * Message Routes
 * Handles sending messages
 */

import express from 'express';
import { asyncHandler } from '../utils/errors.js';
import { validate, schemas } from '../utils/validation.js';
import * as messageController from '../controllers/message.controller.js';

const router = express.Router();

/**
 * POST /api/messages/send
 * Send a message to a contact
 */
router.post(
  '/send',
  validate(schemas.sendMessage),
  asyncHandler(messageController.sendMessage)
);

export default router;
