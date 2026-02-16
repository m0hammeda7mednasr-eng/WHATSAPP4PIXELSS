/**
 * Structured Logger with PII Masking
 * Prevents sensitive data from appearing in logs
 */

import { env } from '../config/env.js';

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

class Logger {
  constructor() {
    this.level = env.server.isDevelopment ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;
  }

  /**
   * Mask sensitive data in logs
   */
  maskSensitive(data) {
    if (typeof data === 'string') {
      // Mask tokens (show first 10 chars only)
      if (data.length > 20 && (data.includes('Bearer') || data.startsWith('EAA'))) {
        return `${data.substring(0, 10)}...${data.substring(data.length - 4)}`;
      }
      // Mask phone numbers
      if (/^\d{10,15}$/.test(data)) {
        return `***${data.substring(data.length - 4)}`;
      }
      return data;
    }

    if (typeof data === 'object' && data !== null) {
      const masked = { ...data };
      
      // Mask common sensitive fields
      const sensitiveFields = [
        'token', 'password', 'secret', 'api_key', 'apiKey',
        'whatsapp_token', 'access_token', 'authorization',
      ];

      Object.keys(masked).forEach((key) => {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          masked[key] = this.maskSensitive(masked[key]);
        } else if (typeof masked[key] === 'object') {
          masked[key] = this.maskSensitive(masked[key]);
        }
      });

      return masked;
    }

    return data;
  }

  /**
   * Format log message
   */
  format(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const maskedMeta = this.maskSensitive(meta);
    
    return {
      timestamp,
      level,
      message,
      ...maskedMeta,
    };
  }

  /**
   * Log methods
   */
  error(message, meta = {}) {
    const log = this.format(LOG_LEVELS.ERROR, message, meta);
    console.error('❌', JSON.stringify(log, null, 2));
  }

  warn(message, meta = {}) {
    const log = this.format(LOG_LEVELS.WARN, message, meta);
    console.warn('⚠️ ', JSON.stringify(log, null, 2));
  }

  info(message, meta = {}) {
    const log = this.format(LOG_LEVELS.INFO, message, meta);
    console.log('ℹ️ ', JSON.stringify(log, null, 2));
  }

  debug(message, meta = {}) {
    if (env.server.isDevelopment) {
      const log = this.format(LOG_LEVELS.DEBUG, message, meta);
      console.log('🔍', JSON.stringify(log, null, 2));
    }
  }

  /**
   * HTTP request logger
   */
  http(req, res, duration) {
    this.info('HTTP Request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  }
}

export const logger = new Logger();
export default logger;
