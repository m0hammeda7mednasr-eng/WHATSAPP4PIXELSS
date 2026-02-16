/**
 * Retry Logic with Exponential Backoff
 */

import { logger } from './logger.js';

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry options
 * @returns {Promise} - Result of the function
 */
export async function retry(fn, options = {}) {
  const {
    retries = 3,
    minTimeout = 1000,
    maxTimeout = 5000,
    factor = 2,
    onRetry = null,
  } = options;

  let lastError;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < retries) {
        const timeout = Math.min(minTimeout * Math.pow(factor, attempt), maxTimeout);
        
        logger.warn('Retry attempt', {
          attempt: attempt + 1,
          maxRetries: retries,
          nextRetryIn: `${timeout}ms`,
          error: error.message,
        });
        
        if (onRetry) {
          onRetry(error, attempt);
        }
        
        await sleep(timeout);
      }
    }
  }
  
  logger.error('All retry attempts failed', {
    retries,
    error: lastError.message,
  });
  
  throw lastError;
}

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry configuration presets
 */
export const RETRY_PRESETS = {
  // For external API calls
  externalAPI: {
    retries: 3,
    minTimeout: 1000,
    maxTimeout: 5000,
    factor: 2,
  },
  
  // For database operations
  database: {
    retries: 2,
    minTimeout: 500,
    maxTimeout: 2000,
    factor: 2,
  },
  
  // For webhook deliveries
  webhook: {
    retries: 5,
    minTimeout: 2000,
    maxTimeout: 10000,
    factor: 2,
  },
};
