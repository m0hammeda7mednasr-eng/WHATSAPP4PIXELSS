// Get Brand Info from Database
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rmpgofswkpjxionzythf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function getBrands() {
  console.log('📋 Getting all brands...\n');
  
  const { data: brands, error } = await supabase
    .from('brands')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!brands || brands.length === 0) {
    console.log('⚠️  No brands found');
    return;
  }

  brands.forEach((brand, index) => {
    console.log(`\n${index + 1}. ${brand.name}`);
    console.log(`   ID: ${brand.id}`);
    console.log(`   Phone: ${brand.phone_number}`);
    console.log(`   Phone Number ID: ${brand.phone_number_id || 'Not set'}`);
    console.log(`   Shopify Connected: ${brand.shopify_connected ? '✅ Yes' : '❌ No'}`);
    console.log(`   Shopify Store: ${brand.shopify_store_url || 'Not connected'}`);
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

getBrands();
