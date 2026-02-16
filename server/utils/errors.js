/**
 * Custom Error Classes and Error Handler Middleware
 */

export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

export class ExternalAPIError extends AppError {
  constructor(service, message, originalError = null) {
    super(`${service} API Error: ${message}`, 502);
    this.name = 'ExternalAPIError';
    this.service = service;
    this.originalError = originalError;
  }
}

/**
 * Global Error Handler Middleware
 */
export function errorHandler(err, req, res, next) {
  const { logger } = await import('./logger.js');

  // Default to 500 server error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Log error
  if (err.isOperational) {
    logger.warn('Operational Error', {
      name: err.name,
      message: err.message,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
    });
  } else {
    logger.error('Unexpected Error', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Don't leak error details in production
  const { env } = await import('../config/env.js');
  const response = {
    success: false,
    error: message,
    ...(err.details && { details: err.details }),
    ...(env.server.isDevelopment && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
}

/**
 * Async Handler Wrapper
 * Catches async errors and passes to error handler
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * 404 Handler
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
  });
}
