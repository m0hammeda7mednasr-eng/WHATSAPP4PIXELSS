import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('🚀 Setting up database...\n');
console.log('📍 Supabase URL:', SUPABASE_URL);
console.log('\n⚠️  IMPORTANT: You need to run the SQL manually in Supabase SQL Editor');
console.log('\n📋 Steps:');
console.log('1. Go to: https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/sql/new');
console.log('2. Copy the content from: database-multi-tenant-setup.sql');
console.log('3. Paste it in the SQL Editor');
console.log('4. Click "Run" button');
console.log('\n✅ After running the SQL, your database will be ready!');
console.log('\n📝 The SQL file will create:');
console.log('   - brands table (WhatsApp accounts)');
console.log('   - contacts table (customers)');
console.log('   - messages table (chat history)');
console.log('   - Sample data for testing');
