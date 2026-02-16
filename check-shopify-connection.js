// Check Shopify Connection Status
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rmpgofswkpjxionzythf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkConnection() {
  console.log('🔍 Checking Shopify connections...\n');
  
  const { data: connections, error } = await supabase
    .from('shopify_connections')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  if (!connections || connections.length === 0) {
    console.log('⚠️  No Shopify connections found');
    console.log('\n📋 To connect:');
    console.log('1. Go to Settings → Shopify Integration');
    console.log('2. Fill in shop name, Client ID, Client Secret');
    console.log('3. Click "Connect with OAuth"');
    console.log('4. Copy the URL and open in browser');
    console.log('5. Install the app in Shopify');
    return;
  }

  console.log(`✅ Found ${connections.length} connection(s):\n`);

  connections.forEach((conn, index) => {
    console.log(`${index + 1}. Brand ID: ${conn.brand_id}`);
    console.log(`   Shop: ${conn.shop_url}`);
    console.log(`   Status: ${conn.is_active ? '✅ Active' : '❌ Inactive'}`);
    console.log(`   Scope: ${conn.scope || 'N/A'}`);
    console.log(`   Connected: ${new Date(conn.created_at).toLocaleString()}`);
    console.log('');
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

checkConnection();
