// Complete Shopify Integration Test
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rmpgofswkpjxionzythf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('🧪 Starting Complete Shopify Integration Test\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Test 1: Check Database Tables
async function testDatabaseTables() {
  console.log('📋 TEST 1: Checking Database Tables');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const tables = [
    'brands',
    'contacts',
    'messages',
    'shopify_connections',
    'shopify_orders',
    'shopify_webhook_logs'
  ];

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table}: ERROR - ${error.message}`);
      } else {
        console.log(`✅ ${table}: ${count || 0} records`);
      }
    } catch (err) {
      console.log(`❌ ${table}: EXCEPTION - ${err.message}`);
    }
  }
  console.log('');
}

// Test 2: Check Shopify Connections
async function testShopifyConnections() {
  console.log('🔗 TEST 2: Checking Shopify Connections');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const { data: connections, error } = await supabase
      .from('shopify_connections')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.log('❌ Error fetching connections:', error.message);
      return null;
    }

    if (!connections || connections.length === 0) {
      console.log('⚠️  No active Shopify connections found');
      return null;
    }

    console.log(`✅ Found ${connections.length} active connection(s):\n`);
    
    for (const conn of connections) {
      console.log(`   📍 Shop: ${conn.shop_url}`);
      console.log(`   🔑 Brand ID: ${conn.brand_id}`);
      console.log(`   📅 Connected: ${new Date(conn.created_at).toLocaleString()}`);
      console.log(`   🔐 Has Token: ${conn.access_token ? 'Yes' : 'No'}`);
      console.log('');
    }

    return connections[0];
  } catch (err) {
    console.log('❌ Exception:', err.message);
    return null;
  }
}

// Test 3: Check Brand Details
async function testBrandDetails(brandId) {
  console.log('🏢 TEST 3: Checking Brand Details');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (!brandId) {
    console.log('⚠️  No brand ID provided, skipping test\n');
    return null;
  }

  try {
    const { data: brand, error } = await supabase
      .from('brands')
      .select('*')
      .eq('id', brandId)
      .single();

    if (error) {
      console.log('❌ Error fetching brand:', error.message);
      return null;
    }

    console.log('✅ Brand Details:');
    console.log(`   📛 Name: ${brand.name}`);
    console.log(`   📱 Phone Number ID: ${brand.phone_number_id || 'Not set'}`);
    console.log(`   🔑 WhatsApp Token: ${brand.whatsapp_token ? (brand.whatsapp_token.substring(0, 20) + '...') : 'Not set'}`);
    console.log(`   🛍️  Shopify Store: ${brand.shopify_store_url || 'Not connected'}`);
    console.log(`   ✅ Shopify Connected: ${brand.shopify_connected ? 'Yes' : 'No'}`);
    console.log('');

    return brand;
  } catch (err) {
    console.log('❌ Exception:', err.message);
    return null;
  }
}

// Test 4: Check Contacts
async function testContacts(brandId) {
  console.log('👥 TEST 4: Checking Contacts');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (!brandId) {
    console.log('⚠️  No brand ID provided, skipping test\n');
    return;
  }

  try {
    const { data: contacts, error, count } = await supabase
      .from('contacts')
      .select('*', { count: 'exact' })
      .eq('brand_id', brandId)
      .limit(5);

    if (error) {
      console.log('❌ Error fetching contacts:', error.message);
      return;
    }

    console.log(`✅ Found ${count || 0} contact(s) for this brand`);
    
    if (contacts && contacts.length > 0) {
      console.log('\n   Recent contacts:');
      contacts.forEach((contact, i) => {
        console.log(`   ${i + 1}. ${contact.name} (${contact.wa_id})`);
      });
    }
    console.log('');
  } catch (err) {
    console.log('❌ Exception:', err.message);
  }
}

// Test 5: Check Orders
async function testOrders(brandId) {
  console.log('📦 TEST 5: Checking Shopify Orders');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (!brandId) {
    console.log('⚠️  No brand ID provided, skipping test\n');
    return;
  }

  try {
    const { data: orders, error, count } = await supabase
      .from('shopify_orders')
      .select('*', { count: 'exact' })
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.log('❌ Error fetching orders:', error.message);
      return;
    }

    console.log(`✅ Found ${count || 0} order(s) for this brand`);
    
    if (orders && orders.length > 0) {
      console.log('\n   Recent orders:');
      orders.forEach((order, i) => {
        console.log(`   ${i + 1}. Order #${order.shopify_order_number || order.shopify_order_id}`);
        console.log(`      💰 Total: ${order.total_price} ${order.currency}`);
        console.log(`      📱 Phone: ${order.customer_phone}`);
        console.log(`      📊 Status: ${order.confirmation_status}`);
        console.log(`      📅 Date: ${new Date(order.created_at).toLocaleString()}`);
      });
    }
    console.log('');
  } catch (err) {
    console.log('❌ Exception:', err.message);
  }
}

// Test 6: Test Webhook Endpoint
async function testWebhookEndpoint() {
  console.log('🌐 TEST 6: Testing Webhook Endpoint');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const webhookUrl = 'http://localhost:3001/api/shopify/webhook';
  
  console.log(`📍 Testing: ${webhookUrl}`);
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-shopify-shop-domain': 'qpcich-gi.myshopify.com',
        'x-shopify-topic': 'orders/create'
      },
      body: JSON.stringify({
        id: 999999999,
        order_number: 9999,
        customer: {
          first_name: 'Test',
          last_name: 'Customer',
          phone: '01066184859'
        },
        shipping_address: {
          first_name: 'Test',
          last_name: 'Customer',
          phone: '01066184859',
          address1: 'Test Address',
          city: 'Cairo'
        },
        line_items: [
          {
            title: 'Test Product',
            quantity: 1,
            variant_title: 'Default'
          }
        ],
        current_total_price: '100.00',
        current_subtotal_price: '90.00',
        currency: 'EGP',
        financial_status: 'pending'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Webhook endpoint is responding');
      console.log('   Response:', JSON.stringify(data, null, 2));
    } else {
      console.log(`⚠️  Webhook returned status: ${response.status}`);
      const text = await response.text();
      console.log('   Response:', text);
    }
  } catch (err) {
    console.log('❌ Cannot connect to webhook endpoint');
    console.log('   Error:', err.message);
    console.log('   💡 Make sure the server is running: node webhook-server-simple.js');
  }
  console.log('');
}

// Test 7: Check Foreign Keys
async function testForeignKeys() {
  console.log('🔗 TEST 7: Checking Foreign Key Constraints');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          tc.table_name, 
          kcu.column_name, 
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name 
        FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_name IN ('shopify_orders', 'messages')
        ORDER BY tc.table_name;
      `
    });

    if (error) {
      console.log('⚠️  Cannot check FK constraints (need RPC function)');
      console.log('   This is OK - constraints might still exist');
    } else {
      console.log('✅ Foreign Key Constraints:');
      if (data && data.length > 0) {
        data.forEach(fk => {
          console.log(`   ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
        });
      } else {
        console.log('   ⚠️  No FK constraints found');
      }
    }
  } catch (err) {
    console.log('⚠️  Cannot check FK constraints:', err.message);
  }
  console.log('');
}

// Run all tests
async function runAllTests() {
  await testDatabaseTables();
  
  const connection = await testShopifyConnections();
  const brandId = connection?.brand_id;
  
  const brand = await testBrandDetails(brandId);
  
  await testContacts(brandId);
  await testOrders(brandId);
  await testWebhookEndpoint();
  await testForeignKeys();
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ All tests completed!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Summary
  console.log('📊 SUMMARY:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (!connection) {
    console.log('❌ No Shopify connection found');
    console.log('   👉 Go to Settings → Shopify Integration and connect your store');
  } else {
    console.log('✅ Shopify connection exists');
  }
  
  if (!brand) {
    console.log('❌ Brand not found');
  } else {
    if (!brand.whatsapp_token || brand.whatsapp_token === 'your_token_here') {
      console.log('⚠️  WhatsApp token not configured');
      console.log('   👉 Add WhatsApp token in Settings');
    } else {
      console.log('✅ WhatsApp token configured');
    }
  }
  
  console.log('\n💡 Next Steps:');
  console.log('   1. Make sure server is running: node webhook-server-simple.js');
  console.log('   2. Make sure ngrok is running: ngrok http 3001');
  console.log('   3. Configure webhook in Shopify Admin');
  console.log('   4. Create a test order in Shopify');
  console.log('   5. Check the server logs for webhook activity\n');
}

// Run tests
runAllTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
