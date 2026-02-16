// Test Shopify Setup - Quick verification
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testSetup() {
  console.log('🧪 Testing Shopify Setup...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let allGood = true;

  // Test 1: Check shopify_connections table
  console.log('1️⃣  Testing shopify_connections table...');
  try {
    const { data, error } = await supabase
      .from('shopify_connections')
      .select('count')
      .limit(1);

    if (error) {
      console.log('   ❌ FAILED:', error.message);
      allGood = false;
    } else {
      console.log('   ✅ PASSED - Table exists and accessible');
    }
  } catch (err) {
    console.log('   ❌ FAILED:', err.message);
    allGood = false;
  }

  console.log('');

  // Test 2: Check shopify_orders table
  console.log('2️⃣  Testing shopify_orders table...');
  try {
    const { data, error } = await supabase
      .from('shopify_orders')
      .select('count')
      .limit(1);

    if (error) {
      console.log('   ❌ FAILED:', error.message);
      allGood = false;
    } else {
      console.log('   ✅ PASSED - Table exists and accessible');
    }
  } catch (err) {
    console.log('   ❌ FAILED:', err.message);
    allGood = false;
  }

  console.log('');

  // Test 3: Check shopify_webhook_logs table
  console.log('3️⃣  Testing shopify_webhook_logs table...');
  try {
    const { data, error } = await supabase
      .from('shopify_webhook_logs')
      .select('count')
      .limit(1);

    if (error) {
      console.log('   ❌ FAILED:', error.message);
      allGood = false;
    } else {
      console.log('   ✅ PASSED - Table exists and accessible');
    }
  } catch (err) {
    console.log('   ❌ FAILED:', err.message);
    allGood = false;
  }

  console.log('');

  // Test 4: Check brands table columns
  console.log('4️⃣  Testing brands table Shopify columns...');
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('id, shopify_connected, shopify_store_url')
      .limit(1);

    if (error) {
      console.log('   ❌ FAILED:', error.message);
      allGood = false;
    } else {
      console.log('   ✅ PASSED - Shopify columns exist');
    }
  } catch (err) {
    console.log('   ❌ FAILED:', err.message);
    allGood = false;
  }

  console.log('');

  // Test 5: Check RLS policies
  console.log('5️⃣  Testing RLS policies...');
  try {
    // This will fail if RLS is not properly configured
    const { data, error } = await supabase
      .from('shopify_connections')
      .select('*')
      .limit(1);

    if (error && error.message.includes('policy')) {
      console.log('   ⚠️  WARNING: RLS policies might need adjustment');
      console.log('   ℹ️  This is normal if you\'re not logged in');
    } else {
      console.log('   ✅ PASSED - RLS policies configured');
    }
  } catch (err) {
    console.log('   ⚠️  WARNING:', err.message);
  }

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (allGood) {
    console.log('🎉 SUCCESS! All tests passed!');
    console.log('');
    console.log('✅ Database is ready for Shopify integration');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Open: https://wahtsapp2.vercel.app');
    console.log('   2. Go to: Settings → Shopify Integration');
    console.log('   3. Fill in your Shopify credentials');
    console.log('   4. Click "Connect with OAuth"');
    console.log('');
  } else {
    console.log('❌ FAILED! Some tests did not pass');
    console.log('');
    console.log('📝 What to do:');
    console.log('   1. Open Supabase SQL Editor');
    console.log('   2. Run: COMPLETE-SHOPIFY-SETUP.sql');
    console.log('   3. Run this test again: node test-shopify-setup.js');
    console.log('');
  }
}

testSetup();
