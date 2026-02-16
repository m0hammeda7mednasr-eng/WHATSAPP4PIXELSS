/**
 * HTTP Request Logger Middleware
 * Logs all incoming requests with correlation ID
 */

import { logger } from '../utils/logger.js';
import { randomUUID } from 'crypto';

export function requestLogger(req, res, next) {
  // Generate correlation ID for request tracking
  req.correlationId = randomUUID();
  
  // Add correlation ID to response headers
  res.setHeader('X-Correlation-ID', req.correlationId);
  
  const startTime = Date.now();
  
  // Log request
  logger.info('Incoming request', {
    correlationId: req.correlationId,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    logger.info('Request completed', {
      correlationId: req.correlationId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
    });
  });
  
  next();
}
