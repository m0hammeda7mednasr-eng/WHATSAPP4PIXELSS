/**
 * Supabase Client Singleton
 * Single instance shared across the application
 */

import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

let supabaseInstance = null;

/**
 * Get or create Supabase client instance
 */
export function getSupabaseClient() {
  if (!supabaseInstance) {
    logger.info('Initializing Supabase client', {
      url: env.supabase.url,
    });
    
    supabaseInstance = createClient(
      env.supabase.url,
      env.supabase.anonKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }
  
  return supabaseInstance;
}

/**
 * Test database connection
 */
export async function testConnection() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('brands')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection failed', {
      error: error.message,
    });
    return false;
  }
}

export default getSupabaseClient;
