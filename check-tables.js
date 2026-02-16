// Check if Shopify tables exist
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkTables() {
  console.log('🔍 Checking database tables...\n');

  // Check shopify_connections table
  console.log('1. Checking shopify_connections table...');
  try {
    const { data, error } = await supabase
      .from('shopify_connections')
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        console.log('   ❌ Table does NOT exist!');
        console.log('   💡 You need to run: database-shopify-integration.sql');
      } else {
        console.log('   ❌ Error:', error.message);
      }
    } else {
      console.log('   ✅ Table exists!');
      console.log(`   📊 Records: ${data?.length || 0}`);
    }
  } catch (err) {
    console.log('   ❌ Error:', err.message);
  }

  console.log('');

  // Check shopify_orders table
  console.log('2. Checking shopify_orders table...');
  try {
    const { data, error } = await supabase
      .from('shopify_orders')
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        console.log('   ❌ Table does NOT exist!');
      } else {
        console.log('   ❌ Error:', error.message);
      }
    } else {
      console.log('   ✅ Table exists!');
      console.log(`   📊 Records: ${data?.length || 0}`);
    }
  } catch (err) {
    console.log('   ❌ Error:', err.message);
  }

  console.log('');

  // Check brands table columns
  console.log('3. Checking brands table columns...');
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('id, name, shopify_connected, shopify_store_url')
      .limit(1);

    if (error) {
      if (error.code === '42703') {
        console.log('   ❌ Shopify columns do NOT exist!');
        console.log('   💡 You need to run: add-shopify-columns.sql');
      } else {
        console.log('   ❌ Error:', error.message);
      }
    } else {
      console.log('   ✅ Shopify columns exist!');
    }
  } catch (err) {
    console.log('   ❌ Error:', err.message);
  }

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 Summary:');
  console.log('');
  console.log('If you see ❌ errors above, you need to:');
  console.log('1. Open Supabase SQL Editor');
  console.log('2. Run the SQL files mentioned above');
  console.log('3. Try connecting Shopify again');
}

checkTables();
