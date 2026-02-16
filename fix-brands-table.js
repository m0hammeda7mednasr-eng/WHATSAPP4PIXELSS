import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rmpgofswkpjxionzythf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('🔧 Fixing brands table...\n');

async function fixTable() {
  console.log('⚠️  Cannot add columns using anon key!');
  console.log('\n📋 Please run this SQL in Supabase SQL Editor:');
  console.log('👉 https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/sql/new\n');
  console.log('Copy and paste this SQL:\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`
-- Add whatsapp_token column to brands table
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS whatsapp_token TEXT;

-- Update existing brands with placeholder token
UPDATE brands 
SET whatsapp_token = 'your_token_here' 
WHERE whatsapp_token IS NULL;

-- Show updated brands
SELECT id, name, phone_number_id, whatsapp_token 
FROM brands;
  `);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('✅ After running the SQL, refresh the page and try again!');
}

fixTable();
