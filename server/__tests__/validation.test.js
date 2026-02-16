/**
 * Validation Tests
 */

import { describe, it, expect } from 'vitest';
import { validateAndFormatPhone, sanitizeInput } from '../utils/validation.js';

describe('Phone Validation', () => {
  it('should format Egyptian phone numbers correctly', () => {
    expect(validateAndFormatPhone('01234567890')).toBe('201234567890');
    expect(validateAndFormatPhone('201234567890')).toBe('201234567890');
    expect(validateAndFormatPhone('+201234567890')).toBe('201234567890');
  });

  it('should remove non-numeric characters', () => {
    expect(validateAndFormatPhone('+20 123 456 7890')).toBe('201234567890');
    expect(validateAndFormatPhone('(012) 345-67890')).toBe('201234567890');
  });

  it('should throw error for invalid phone numbers', () => {
    expect(() => validateAndFormatPhone('123')).toThrow();
    expect(() => validateAndFormatPhone('12345678901234567890')).toThrow();
  });
});

describe('Input Sanitization', () => {
  it('should remove HTML tags', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
    expect(sanitizeInput('Hello <b>World</b>')).toBe('Hello bWorld/b');
  });

  it('should trim whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });

  it('should handle objects', () => {
    const input = {
      name: '<script>test</script>',
      message: '  hello  ',
    };
    const result = sanitizeInput(input);
    expect(result.name).toBe('scripttest/script');
    expect(result.message).toBe('hello');
  });
});
