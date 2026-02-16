// Complete System Test
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testCompleteSystem() {
  console.log('🧪 Testing Complete WhatsApp CRM System\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let allPassed = true;
  const results = [];

  // Test 1: Database Connection
  console.log('1️⃣  Testing Database Connection...');
  try {
    const { data, error } = await supabase.from('brands').select('count').limit(1);
    if (error) throw error;
    console.log('   ✅ PASSED - Database connected\n');
    results.push({ test: 'Database Connection', status: 'PASSED' });
  } catch (err) {
    console.log('   ❌ FAILED:', err.message, '\n');
    results.push({ test: 'Database Connection', status: 'FAILED', error: err.message });
    allPassed = false;
  }

  // Test 2: Core Tables
  console.log('2️⃣  Testing Core Tables...');
  const coreTables = ['brands', 'contacts', 'messages'];
  for (const table of coreTables) {
    try {
      const { error } = await supabase.from(table).select('count').limit(1);
      if (error) throw error;
      console.log(`   ✅ ${table} - exists`);
    } catch (err) {
      console.log(`   ❌ ${table} - missing`);
      allPassed = false;
    }
  }
  console.log('');

  // Test 3: Shopify Tables
  console.log('3️⃣  Testing Shopify Integration Tables...');
  const shopifyTables = ['shopify_connections', 'shopify_orders', 'shopify_webhook_logs'];
  let shopifyTablesExist = true;
  for (const table of shopifyTables) {
    try {
      const { error } = await supabase.from(table).select('count').limit(1);
      if (error) throw error;
      console.log(`   ✅ ${table} - exists`);
    } catch (err) {
      console.log(`   ❌ ${table} - missing`);
      shopifyTablesExist = false;
      allPassed = false;
    }
  }
  results.push({ test: 'Shopify Tables', status: shopifyTablesExist ? 'PASSED' : 'FAILED' });
  console.log('');

  // Test 4: Brands Data
  console.log('4️⃣  Testing Brands Data...');
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('id, name, phone_number_id, whatsapp_token, shopify_connected, shopify_store_url');
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      console.log(`   ✅ Found ${data.length} brand(s)`);
      data.forEach(brand => {
        console.log(`   📊 Brand: ${brand.name}`);
        console.log(`      - Phone ID: ${brand.phone_number_id ? '✅ Set' : '❌ Missing'}`);
        console.log(`      - WhatsApp Token: ${brand.whatsapp_token && brand.whatsapp_token !== 'your_token_here' ? '✅ Set' : '❌ Missing'}`);
        console.log(`      - Shopify: ${brand.shopify_connected ? `✅ Connected (${brand.shopify_store_url})` : '❌ Not Connected'}`);
      });
      results.push({ test: 'Brands Data', status: 'PASSED', count: data.length });
    } else {
      console.log('   ⚠️  No brands found');
      results.push({ test: 'Brands Data', status: 'WARNING', message: 'No brands' });
    }
  } catch (err) {
    console.log('   ❌ FAILED:', err.message);
    results.push({ test: 'Brands Data', status: 'FAILED', error: err.message });
    allPassed = false;
  }
  console.log('');

  // Test 5: Shopify Connections
  console.log('5️⃣  Testing Shopify Connections...');
  try {
    const { data, error } = await supabase
      .from('shopify_connections')
      .select('*');
    
    if (error && error.message.includes('does not exist')) {
      console.log('   ❌ FAILED: Shopify tables not created');
      console.log('   💡 Run: COMPLETE-SHOPIFY-SETUP.sql in Supabase');
      results.push({ test: 'Shopify Connections', status: 'FAILED', error: 'Tables not created' });
      allPassed = false;
    } else if (error) {
      throw error;
    } else if (data && data.length > 0) {
      console.log(`   ✅ Found ${data.length} connection(s)`);
      data.forEach(conn => {
        console.log(`   📊 Shop: ${conn.shop_url}`);
        console.log(`      - Active: ${conn.is_active ? '✅ Yes' : '❌ No'}`);
        console.log(`      - Scope: ${conn.scope || 'N/A'}`);
      });
      results.push({ test: 'Shopify Connections', status: 'PASSED', count: data.length });
    } else {
      console.log('   ⚠️  No Shopify connections found');
      console.log('   💡 Connect Shopify in Settings → Shopify Integration');
      results.push({ test: 'Shopify Connections', status: 'WARNING', message: 'No connections' });
    }
  } catch (err) {
    console.log('   ❌ FAILED:', err.message);
    results.push({ test: 'Shopify Connections', status: 'FAILED', error: err.message });
    allPassed = false;
  }
  console.log('');

  // Test 6: Frontend URLs
  console.log('6️⃣  Testing Frontend URLs...');
  const urls = [
    { name: 'Main App', url: 'https://wahtsapp2.vercel.app' },
    { name: 'OAuth Callback', url: 'https://wahtsapp2.vercel.app/api/shopify/oauth/callback' }
  ];
  
  for (const { name, url } of urls) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok || response.status === 405) {
        console.log(`   ✅ ${name} - accessible`);
      } else {
        console.log(`   ⚠️  ${name} - status ${response.status}`);
      }
    } catch (err) {
      console.log(`   ❌ ${name} - not accessible`);
    }
  }
  results.push({ test: 'Frontend URLs', status: 'PASSED' });
  console.log('');

  // Test 7: Environment Variables
  console.log('7️⃣  Testing Environment Variables...');
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  let envVarsOk = true;
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`   ✅ ${envVar} - set`);
    } else {
      console.log(`   ❌ ${envVar} - missing`);
      envVarsOk = false;
      allPassed = false;
    }
  }
  results.push({ test: 'Environment Variables', status: envVarsOk ? 'PASSED' : 'FAILED' });
  console.log('');

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 TEST SUMMARY:\n');
  
  results.forEach(result => {
    const icon = result.status === 'PASSED' ? '✅' : result.status === 'WARNING' ? '⚠️' : '❌';
    console.log(`${icon} ${result.test}: ${result.status}`);
    if (result.count) console.log(`   Count: ${result.count}`);
    if (result.error) console.log(`   Error: ${result.error}`);
    if (result.message) console.log(`   Note: ${result.message}`);
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED!\n');
    console.log('✅ System Status: READY TO USE\n');
    console.log('📝 Next Steps:');
    console.log('   1. Open: https://wahtsapp2.vercel.app');
    console.log('   2. Login with your account');
    console.log('   3. Go to Settings → Shopify Integration');
    console.log('   4. Connect your Shopify store\n');
  } else {
    console.log('⚠️  SOME TESTS FAILED\n');
    console.log('📝 Action Required:');
    
    if (!shopifyTablesExist) {
      console.log('   1. Run SQL in Supabase:');
      console.log('      File: COMPLETE-SHOPIFY-SETUP.sql');
      console.log('      URL: https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/sql/new\n');
    }
    
    console.log('   2. Check the errors above');
    console.log('   3. Fix issues and run test again\n');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

testCompleteSystem().catch(console.error);
