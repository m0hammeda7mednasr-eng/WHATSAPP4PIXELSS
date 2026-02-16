// Check Button Setup - Diagnose Issues
import { createClient } from '@supabase/supabase-js';

// ⚠️ Update these
const SUPABASE_URL = 'https://rmpgofswkpjxionzythf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM';
const PHONE_NUMBER_ID = 'YOUR_PHONE_NUMBER_ID'; // ⚠️ غيّر ده

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkSetup() {
  console.log('🔍 Checking Button Setup...\n');
  console.log('=' .repeat(60));

  // 1. Check Brand
  console.log('\n1️⃣  Checking Brand...');
  const { data: brand, error: brandError } = await supabase
    .from('brands')
    .select('*')
    .eq('phone_number_id', PHONE_NUMBER_ID)
    .single();

  if (brandError) {
    console.log('❌ Brand Error:', brandError.message);
    console.log('\n💡 Solution:');
    console.log('   Add brand in Supabase with this phone_number_id');
    return;
  }

  if (!brand) {
    console.log('❌ Brand not found');
    console.log('\n💡 Solution:');
    console.log('   INSERT INTO brands (name, phone_number_id, whatsapp_token)');
    console.log('   VALUES (\'Your Brand\', \'' + PHONE_NUMBER_ID + '\', \'YOUR_TOKEN\');');
    return;
  }

  console.log('✅ Brand found:', brand.name);
  console.log('   ID:', brand.id);
  console.log('   WhatsApp Token:', brand.whatsapp_token ? '✅ Set' : '❌ Missing');

  // 2. Check Shopify Connection
  console.log('\n2️⃣  Checking Shopify Connection...');
  const { data: shopifyConn, error: connError } = await supabase
    .from('shopify_connections')
    .select('*')
    .eq('brand_id', brand.id)
    .eq('is_active', true)
    .single();

  if (connError) {
    console.log('❌ Shopify Connection Error:', connError.message);
    console.log('\n💡 Solution:');
    console.log('   Connect Shopify in Settings → Shopify Settings');
    return;
  }

  if (!shopifyConn) {
    console.log('❌ Shopify not connected');
    console.log('\n💡 Solution:');
    console.log('   Go to Settings → Shopify Settings → Connect to Shopify');
    return;
  }

  console.log('✅ Shopify connected:', shopifyConn.shop_url);
  console.log('   Access Token:', shopifyConn.access_token ? '✅ Set' : '❌ Missing');

  // 3. Check Recent Orders
  console.log('\n3️⃣  Checking Recent Orders...');
  const { data: orders, error: ordersError } = await supabase
    .from('shopify_orders')
    .select('*')
    .eq('brand_id', brand.id)
    .order('created_at', { ascending: false })
    .limit(5);

  if (ordersError) {
    console.log('❌ Orders Error:', ordersError.message);
    return;
  }

  if (!orders || orders.length === 0) {
    console.log('⚠️  No orders found');
    console.log('\n💡 Solution:');
    console.log('   Create a test order from Shopify');
    return;
  }

  console.log('✅ Found', orders.length, 'recent orders:');
  orders.forEach((order, i) => {
    console.log(`\n   ${i + 1}. Order #${order.shopify_order_number || order.shopify_order_id}`);
    console.log('      Status:', order.confirmation_status || 'pending');
    console.log('      Customer:', order.customer_name || 'N/A');
    console.log('      Phone:', order.customer_phone || 'N/A');
  });

  // 4. Check RLS Policies
  console.log('\n4️⃣  Checking Database Permissions...');
  
  // Try to update a test order
  if (orders.length > 0) {
    const testOrder = orders[0];
    const { error: updateError } = await supabase
      .from('shopify_orders')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', testOrder.id);

    if (updateError) {
      console.log('❌ Cannot update orders:', updateError.message);
      console.log('\n💡 Solution:');
      console.log('   Check RLS policies in Supabase');
      console.log('   Table Editor → shopify_orders → RLS');
      console.log('\n   Run this SQL:');
      console.log('   ALTER TABLE shopify_orders DISABLE ROW LEVEL SECURITY;');
    } else {
      console.log('✅ Can update orders');
    }
  }

  // 5. Check Template Settings
  console.log('\n5️⃣  Checking Template Settings...');
  console.log('   Use Template:', brand.use_template ? '✅ Yes' : '❌ No');
  console.log('   Template Name:', brand.template_name || 'Not set');
  console.log('   Template Language:', brand.template_language || 'Not set');
  console.log('   Confirmation Message:', brand.order_confirmation_message ? '✅ Set' : '⚠️  Using default');
  console.log('   Cancellation Message:', brand.order_cancellation_message ? '✅ Set' : '⚠️  Using default');

  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 SUMMARY');
  console.log('=' .repeat(60));
  
  const checks = [
    { name: 'Brand', status: !!brand },
    { name: 'WhatsApp Token', status: !!brand?.whatsapp_token },
    { name: 'Shopify Connection', status: !!shopifyConn },
    { name: 'Shopify Access Token', status: !!shopifyConn?.access_token },
    { name: 'Has Orders', status: orders && orders.length > 0 }
  ];

  checks.forEach(check => {
    console.log(check.status ? '✅' : '❌', check.name);
  });

  const allGood = checks.every(c => c.status);
  
  if (allGood) {
    console.log('\n🎉 Everything looks good!');
    console.log('\n📋 Next steps:');
    console.log('   1. Deploy to Vercel');
    console.log('   2. Test button click');
    console.log('   3. Check Vercel logs');
  } else {
    console.log('\n⚠️  Some issues found. Fix them and try again.');
  }

  console.log('\n' + '=' .repeat(60));
}

checkSetup().catch(console.error);
