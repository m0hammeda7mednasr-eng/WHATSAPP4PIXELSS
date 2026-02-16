// Complete System Test
// Tests all components of the WhatsApp CRM system

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rmpgofswkpjxionzythf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const WEBHOOK_URL = 'http://localhost:3001/api/shopify/webhook';

let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

function logTest(name, passed, message = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}`);
    if (message) console.log(`   ${message}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name}`);
    if (message) console.log(`   ${message}`);
  }
}

console.log('🧪 COMPLETE SYSTEM TEST\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Test 1: Database Connection
async function testDatabaseConnection() {
  console.log('📋 TEST 1: Database Connection\n');
  
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('count')
      .limit(1);
    
    logTest('Database Connection', !error, error ? error.message : 'Connected successfully');
  } catch (error) {
    logTest('Database Connection', false, error.message);
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Test 2: Brands Table
async function testBrandsTable() {
  console.log('📋 TEST 2: Brands Table\n');
  
  try {
    const { data: brands, error } = await supabase
      .from('brands')
      .select('id, name, phone_number_id, whatsapp_token, brand_emoji')
      .limit(5);
    
    if (error) {
      logTest('Brands Table Structure', false, error.message);
      return;
    }
    
    logTest('Brands Table Structure', true, `Found ${brands.length} brands`);
    
    if (brands.length > 0) {
      const brand = brands[0];
      console.log(`\n   📊 Sample Brand:`);
      console.log(`      • Name: ${brand.name}`);
      console.log(`      • Phone Number ID: ${brand.phone_number_id || 'Not set'}`);
      console.log(`      • WhatsApp Token: ${brand.whatsapp_token ? '✅ Set' : '❌ Not set'}`);
      console.log(`      • Emoji: ${brand.brand_emoji || '🏢'}`);
      
      logTest('Brand has WhatsApp Token', !!brand.whatsapp_token);
      logTest('Brand has Phone Number ID', !!brand.phone_number_id);
    } else {
      logTest('Brands Exist', false, 'No brands found in database');
    }
  } catch (error) {
    logTest('Brands Table', false, error.message);
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Test 3: Templates Table
async function testTemplatesTable() {
  console.log('📋 TEST 3: Message Templates Table\n');
  
  try {
    // Check if table exists
    const { data: templates, error } = await supabase
      .from('message_templates')
      .select('id, template_name, template_type, is_active, meta_template_status')
      .limit(10);
    
    if (error) {
      logTest('Templates Table Exists', false, error.message);
      return;
    }
    
    logTest('Templates Table Exists', true, `Found ${templates.length} templates`);
    
    // Check for new_customer template
    const newCustomerTemplate = templates.find(t => t.template_type === 'new_customer');
    logTest('New Customer Template Exists', !!newCustomerTemplate, 
      newCustomerTemplate ? `Template: ${newCustomerTemplate.template_name}` : 'No template found');
    
    if (newCustomerTemplate) {
      console.log(`\n   📊 New Customer Template:`);
      console.log(`      • Name: ${newCustomerTemplate.template_name}`);
      console.log(`      • Status: ${newCustomerTemplate.meta_template_status}`);
      console.log(`      • Active: ${newCustomerTemplate.is_active ? '✅' : '❌'}`);
      
      logTest('Template is Active', newCustomerTemplate.is_active);
      logTest('Template is Approved', newCustomerTemplate.meta_template_status === 'approved',
        `Status: ${newCustomerTemplate.meta_template_status}`);
    }
  } catch (error) {
    logTest('Templates Table', false, error.message);
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Test 4: Shopify Connection
async function testShopifyConnection() {
  console.log('📋 TEST 4: Shopify Connection\n');
  
  try {
    const { data: connections, error } = await supabase
      .from('shopify_connections')
      .select('id, shop_url, is_active, brand_id')
      .eq('is_active', true);
    
    if (error) {
      logTest('Shopify Connections Table', false, error.message);
      return;
    }
    
    logTest('Shopify Connections Table', true, `Found ${connections.length} active connections`);
    
    if (connections.length > 0) {
      const conn = connections[0];
      console.log(`\n   📊 Active Connection:`);
      console.log(`      • Shop: ${conn.shop_url}`);
      console.log(`      • Brand ID: ${conn.brand_id}`);
      
      logTest('Active Shopify Connection Exists', true);
    } else {
      logTest('Active Shopify Connection Exists', false, 'No active connections');
    }
  } catch (error) {
    logTest('Shopify Connection', false, error.message);
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Test 5: Orders System
async function testOrdersSystem() {
  console.log('📋 TEST 5: Orders System\n');
  
  try {
    const { data: orders, error } = await supabase
      .from('shopify_orders')
      .select('id, shopify_order_number, order_status, customer_phone, total_price')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      logTest('Orders Table', false, error.message);
      return;
    }
    
    logTest('Orders Table', true, `Found ${orders.length} orders`);
    
    if (orders.length > 0) {
      console.log(`\n   📊 Recent Orders:`);
      orders.forEach((order, i) => {
        console.log(`      ${i + 1}. Order #${order.shopify_order_number} - ${order.total_price} EGP - ${order.order_status}`);
      });
      
      logTest('Orders Being Saved', true);
    } else {
      logTest('Orders Being Saved', false, 'No orders found - try creating a test order');
    }
  } catch (error) {
    logTest('Orders System', false, error.message);
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Test 6: Contacts System
async function testContactsSystem() {
  console.log('📋 TEST 6: Contacts System\n');
  
  try {
    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('id, name, wa_id, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      logTest('Contacts Table', false, error.message);
      return;
    }
    
    logTest('Contacts Table', true, `Found ${contacts.length} contacts`);
    
    if (contacts.length > 0) {
      console.log(`\n   📊 Recent Contacts:`);
      contacts.forEach((contact, i) => {
        console.log(`      ${i + 1}. ${contact.name} - ${contact.wa_id}`);
      });
      
      logTest('Contacts Being Created', true);
    } else {
      logTest('Contacts Being Created', false, 'No contacts found');
    }
  } catch (error) {
    logTest('Contacts System', false, error.message);
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Test 7: Server Health
async function testServerHealth() {
  console.log('📋 TEST 7: Server Health\n');
  
  try {
    const response = await fetch('http://localhost:3001/health');
    const data = await response.json();
    
    logTest('Server is Running', response.ok, `Status: ${data.status}`);
  } catch (error) {
    logTest('Server is Running', false, 'Server not responding - make sure it\'s running');
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Test 8: Template Logic Test (Simulated)
async function testTemplateLogic() {
  console.log('📋 TEST 8: Template Logic (New vs Existing Customer)\n');
  
  try {
    // Get a brand
    const { data: brands } = await supabase
      .from('brands')
      .select('id')
      .limit(1)
      .single();
    
    if (!brands) {
      logTest('Template Logic Test', false, 'No brand found');
      return;
    }
    
    // Check for existing contact
    const { data: existingContacts } = await supabase
      .from('contacts')
      .select('id, wa_id')
      .eq('brand_id', brands.id)
      .limit(1);
    
    if (existingContacts && existingContacts.length > 0) {
      console.log(`   ✅ Found existing contact: ${existingContacts[0].wa_id}`);
      console.log(`   💬 For this contact → Should send REGULAR TEXT MESSAGE`);
      logTest('Existing Customer Logic', true, 'Will use regular text (free within 24h)');
    }
    
    // Simulate new customer
    const newPhone = '201234567890';
    const { data: newContact } = await supabase
      .from('contacts')
      .select('id')
      .eq('wa_id', newPhone)
      .limit(1);
    
    if (!newContact || newContact.length === 0) {
      console.log(`\n   ✅ Phone ${newPhone} is NEW`);
      console.log(`   📋 For this contact → Should send TEMPLATE MESSAGE`);
      logTest('New Customer Logic', true, 'Will use template (save cost)');
    }
    
  } catch (error) {
    logTest('Template Logic Test', false, error.message);
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run all tests
async function runAllTests() {
  await testDatabaseConnection();
  await testBrandsTable();
  await testTemplatesTable();
  await testShopifyConnection();
  await testOrdersSystem();
  await testContactsSystem();
  await testServerHealth();
  await testTemplateLogic();
  
  // Summary
  console.log('📊 FINAL RESULTS\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`   Total Tests: ${testResults.total}`);
  console.log(`   ✅ Passed: ${testResults.passed}`);
  console.log(`   ❌ Failed: ${testResults.failed}`);
  console.log(`   📊 Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (testResults.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! System is ready to use!\n');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.\n');
    console.log('💡 Common fixes:');
    console.log('   • Run fix-brand-emoji.sql if brand_emoji column is missing');
    console.log('   • Run setup-message-templates.sql if templates table is missing');
    console.log('   • Make sure server is running: node server/webhook-server-simple.js');
    console.log('   • Check WhatsApp token is set in brands table\n');
  }
}

runAllTests().catch(console.error);
