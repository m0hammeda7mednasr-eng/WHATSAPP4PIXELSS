/**
 * Server Environment Configuration with Validation
 * Fail-fast on missing or invalid environment variables
 */

import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const envSchema = z.object({
  // Supabase
  SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  
  // Server
  PORT: z.string().regex(/^\d+$/).transform(Number).default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Webhook
  WEBHOOK_VERIFY_TOKEN: z.string().min(1, 'Webhook verify token is required'),
  
  // URLs
  API_URL: z.string().url('Invalid API URL').optional(),
  APP_URL: z.string().url('Invalid App URL').optional(),
  
  // CORS
  ALLOWED_ORIGINS: z.string().optional(),
  
  // Shopify (optional - stored in DB per brand)
  SHOPIFY_WEBHOOK_SECRET: z.string().optional(),
});

// Validate and parse environment variables
let config;
try {
  config = envSchema.parse({
    SUPABASE_URL: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
    PORT: process.env.PORT || process.env.WEBHOOK_PORT,
    NODE_ENV: process.env.NODE_ENV,
    WEBHOOK_VERIFY_TOKEN: process.env.WEBHOOK_VERIFY_TOKEN,
    API_URL: process.env.VITE_API_URL || process.env.API_URL,
    APP_URL: process.env.VITE_APP_URL || process.env.APP_URL,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
    SHOPIFY_WEBHOOK_SECRET: process.env.SHOPIFY_WEBHOOK_SECRET,
  });
  
  console.log('✅ Environment validation passed');
} catch (error) {
  console.error('❌ Environment validation failed:');
  if (error instanceof z.ZodError) {
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
  }
  console.error('\n💡 Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

export const env = {
  supabase: {
    url: config.SUPABASE_URL,
    anonKey: config.SUPABASE_ANON_KEY,
  },
  server: {
    port: config.PORT,
    nodeEnv: config.NODE_ENV,
    isDevelopment: config.NODE_ENV === 'development',
    isProduction: config.NODE_ENV === 'production',
  },
  webhook: {
    verifyToken: config.WEBHOOK_VERIFY_TOKEN,
    shopifySecret: config.SHOPIFY_WEBHOOK_SECRET,
  },
  urls: {
    api: config.API_URL || `http://localhost:${config.PORT}`,
    app: config.APP_URL || 'http://localhost:5173',
  },
  cors: {
    allowedOrigins: config.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  },
};

export default env;
