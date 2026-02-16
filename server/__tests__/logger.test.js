/**
 * Logger Tests
 */

import { describe, it, expect } from 'vitest';
import { logger } from '../utils/logger.js';

describe('Logger', () => {
  it('should mask sensitive tokens', () => {
    const token = 'EAABwzLixnjYBO1234567890abcdefghijklmnop';
    const masked = logger.maskSensitive(token);
    expect(masked).not.toBe(token);
    expect(masked).toContain('...');
    expect(masked.length).toBeLessThan(token.length);
  });

  it('should mask phone numbers', () => {
    const phone = '201234567890';
    const masked = logger.maskSensitive(phone);
    expect(masked).toBe('***7890');
  });

  it('should mask sensitive fields in objects', () => {
    const data = {
      username: 'john',
      password: 'secret123',
      whatsapp_token: 'EAABwzLixnjYBO123',
    };
    const masked = logger.maskSensitive(data);
    expect(masked.username).toBe('john');
    expect(masked.password).not.toBe('secret123');
    expect(masked.whatsapp_token).not.toBe('EAABwzLixnjYBO123');
  });
});
