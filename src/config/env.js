/**
 * Environment Configuration with Validation
 * Validates all required environment variables at startup
 */

import { z } from 'zod';

const envSchema = z.object({
  // Supabase
  VITE_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  
  // API
  VITE_API_URL: z.string().url('Invalid API URL'),
  VITE_APP_URL: z.string().url('Invalid App URL'),
  
  // Webhook (optional for frontend)
  WEBHOOK_VERIFY_TOKEN: z.string().optional(),
  WEBHOOK_PORT: z.string().regex(/^\d+$/).transform(Number).optional(),
});

// Validate environment variables
let config;
try {
  config = envSchema.parse(import.meta.env);
} catch (error) {
  console.error('❌ Environment validation failed:');
  if (error instanceof z.ZodError) {
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
  }
  throw new Error('Invalid environment configuration');
}

export const env = {
  supabase: {
    url: config.VITE_SUPABASE_URL,
    anonKey: config.VITE_SUPABASE_ANON_KEY,
  },
  api: {
    url: config.VITE_API_URL,
    appUrl: config.VITE_APP_URL,
  },
  webhook: {
    verifyToken: config.WEBHOOK_VERIFY_TOKEN,
    port: config.WEBHOOK_PORT,
  },
};

export default env;
