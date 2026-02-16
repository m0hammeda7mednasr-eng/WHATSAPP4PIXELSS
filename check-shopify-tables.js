// Check if Shopify tables exist
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rmpgofswkpjxionzythf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkTables() {
  console.log('🔍 Checking Shopify tables...\n');
  
  // Check shopify_connections
  const { data: connections, error: connError } = await supabase
    .from('shopify_connections')
    .select('*')
    .limit(1);

  if (connError) {
    console.log('❌ shopify_connections table: NOT FOUND');
    console.log('   Error:', connError.message);
  } else {
    console.log('✅ shopify_connections table: EXISTS');
    console.log('   Records:', connections?.length || 0);
  }

  // Check shopify_orders
  const { data: orders, error: ordersError } = await supabase
    .from('shopify_orders')
    .select('*')
    .limit(1);

  if (ordersError) {
    console.log('❌ shopify_orders table: NOT FOUND');
    console.log('   Error:', ordersError.message);
  } else {
    console.log('✅ shopify_orders table: EXISTS');
    console.log('   Records:', orders?.length || 0);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

checkTables();
