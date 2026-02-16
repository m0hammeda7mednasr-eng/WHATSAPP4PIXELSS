// اختبار شامل للنظام بالكامل
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🧪 Testing Complete WhatsApp CRM System...\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

let allTestsPassed = true;

// ============================================
// Test 1: Database Connection
// ============================================
async function testDatabaseConnection() {
  console.log('📊 Test 1: Database Connection');
  try {
    const { data, error } = await supabase.from('brands').select('count');
    if (error) throw error;
    console.log('   ✅ Database connected successfully\n');
    return true;
  } catch (error) {
    console.log('   ❌ Database connection failed:', error.message);
    console.log('   💡 Check your .env file\n');
    return false;
  }
}

// ============================================
// Test 2: Brands Configuration
// ============================================
async function testBrandsConfiguration() {
  console.log('📊 Test 2: Brands Configuration');
  try {
    const { data: brands, error } = await supabase
      .from('brands')
      .select('*');

    if (error) throw error;

    if (!brands || brands.length === 0) {
      console.log('   ❌ No brands found');
      console.log('   💡 Run: node auto-setup.js\n');
      return false;
    }

    console.log(`   ✅ Found ${brands.length} brand(s):`);
    
    let allBrandsConfigured = true;
    brands.forEach((brand, i) => {
      console.log(`\n   Brand ${i + 1}: ${brand.name}`);
      
      // Check Token
      if (!brand.whatsapp_token || brand.whatsapp_token === 'your_token_here') {
        console.log('      ❌ Token: Not configured');
        allBrandsConfigured = false;
      } else if (!brand.whatsapp_token.startsWith('EAA')) {
        console.log('      ❌ Token: Invalid format');
        allBrandsConfigured = false;
      } else {
        console.log('      ✅ Token: Configured');
      }

      // Check Phone Number ID
      if (!brand.phone_number_id) {
        console.log('      ❌ Phone Number ID: Not configured');
        allBrandsConfigured = false;
      } else if (brand.phone_number_id.length < 10) {
        console.log(`      ❌ Phone Number ID: Too short (${brand.phone_number_id.length} digits)`);
        console.log(`      Current: ${brand.phone_number_id}`);
        allBrandsConfigured = false;
      } else {
        console.log('      ✅ Phone Number ID: Configured');
      }
    });

    console.log('');
    if (!allBrandsConfigured) {
      console.log('   💡 Fix: Open Settings in the app and configure WhatsApp credentials\n');
    }
    return allBrandsConfigured;

  } catch (error) {
    console.log('   ❌ Error:', error.message, '\n');
    return false;
  }
}

// ============================================
// Test 3: Webhook Server
// ============================================
async function testWebhookServer() {
  console.log('📊 Test 3: Webhook Server');
  try {
    const response = await fetch('http://localhost:3001/health');
    if (!response.ok) throw new Error('Server not responding');
    
    const data = await response.json();
    console.log('   ✅ Webhook server is running');
    console.log('   📍 URL: http://localhost:3001');
    console.log('   📍 Status:', data.status, '\n');
    return true;
  } catch (error) {
    console.log('   ❌ Webhook server is not running');
    console.log('   💡 Start it: npm run server');
    console.log('   💡 Or: node server/webhook-server.js\n');
    return false;
  }
}

// ============================================
// Test 4: React App
// ============================================
async function testReactApp() {
  console.log('📊 Test 4: React App');
  try {
    const response = await fetch('http://localhost:5177');
    if (!response.ok) throw new Error('App not responding');
    
    console.log('   ✅ React app is running');
    console.log('   📍 URL: http://localhost:5177\n');
    return true;
  } catch (error) {
    console.log('   ❌ React app is not running');
    console.log('   💡 Start it: npm run dev\n');
    return false;
  }
}

// ============================================
// Test 5: Send Message API
// ============================================
async function testSendMessageAPI() {
  console.log('📊 Test 5: Send Message API');
  
  // Get a test contact
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .limit(1);

  if (!contacts || contacts.length === 0) {
    console.log('   ⚠️  No contacts found to test');
    console.log('   💡 Create a contact from the app first\n');
    return null;
  }

  const contact = contacts[0];
  
  // Get brand
  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('id', contact.brand_id)
    .single();

  console.log('   Testing with:');
  console.log('   Contact:', contact.name);
  console.log('   Brand:', brand.name);

  try {
    const response = await fetch('http://localhost:3001/api/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contact_id: contact.id,
        brand_id: brand.id,
        message: 'Test message from system check 🧪'
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log('   ✅ Send message API working');
      if (result.mode === 'local_only') {
        console.log('   ⚠️  Mode: Local only (not sent to WhatsApp)');
        console.log('   💡 Configure WhatsApp token to send real messages\n');
        return null;
      } else {
        console.log('   ✅ Message sent to WhatsApp!');
        console.log('   📱 WhatsApp Message ID:', result.wa_message_id, '\n');
        return true;
      }
    } else {
      console.log('   ❌ Send failed:', result.error);
      if (result.error.includes('does not exist')) {
        console.log('   💡 Phone Number ID is incorrect\n');
      }
      return false;
    }
  } catch (error) {
    console.log('   ❌ API Error:', error.message, '\n');
    return false;
  }
}

// ============================================
// Test 6: Webhook Endpoint
// ============================================
async function testWebhookEndpoint() {
  console.log('📊 Test 6: Webhook Endpoint');
  try {
    const response = await fetch(
      'http://localhost:3001/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=whatsapp_crm_2024&hub.challenge=test123'
    );
    
    const text = await response.text();
    
    if (text === 'test123') {
      console.log('   ✅ Webhook verification working');
      console.log('   📍 Endpoint: /webhook/whatsapp');
      console.log('   🔑 Token: whatsapp_crm_2024\n');
      return true;
    } else {
      console.log('   ❌ Webhook verification failed\n');
      return false;
    }
  } catch (error) {
    console.log('   ❌ Webhook endpoint error:', error.message, '\n');
    return false;
  }
}

// ============================================
// Test 7: Realtime Subscriptions
// ============================================
async function testRealtimeSubscriptions() {
  console.log('📊 Test 7: Realtime Subscriptions');
  try {
    const channel = supabase.channel('test-channel');
    
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);
      
      channel.subscribe((status) => {
        clearTimeout(timeout);
        if (status === 'SUBSCRIBED') {
          resolve();
        } else if (status === 'CHANNEL_ERROR') {
          reject(new Error('Channel error'));
        }
      });
    });

    await supabase.removeChannel(channel);
    console.log('   ✅ Realtime subscriptions working\n');
    return true;
  } catch (error) {
    console.log('   ❌ Realtime subscriptions failed:', error.message);
    console.log('   💡 Check Supabase Realtime settings\n');
    return false;
  }
}

// ============================================
// Run All Tests
// ============================================
async function runAllTests() {
  const results = {
    database: await testDatabaseConnection(),
    brands: await testBrandsConfiguration(),
    webhookServer: await testWebhookServer(),
    reactApp: await testReactApp(),
    webhook: await testWebhookEndpoint(),
    sendAPI: await testSendMessageAPI(),
    realtime: await testRealtimeSubscriptions(),
  };

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Test Results Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const tests = [
    { name: 'Database Connection', result: results.database, critical: true },
    { name: 'Brands Configuration', result: results.brands, critical: true },
    { name: 'Webhook Server', result: results.webhookServer, critical: true },
    { name: 'React App', result: results.reactApp, critical: true },
    { name: 'Webhook Endpoint', result: results.webhook, critical: true },
    { name: 'Send Message API', result: results.sendAPI, critical: false },
    { name: 'Realtime Subscriptions', result: results.realtime, critical: true },
  ];

  let criticalFailures = 0;
  let warnings = 0;

  tests.forEach(test => {
    const icon = test.result === true ? '✅' : test.result === false ? '❌' : '⚠️';
    console.log(`${icon} ${test.name}`);
    
    if (test.result === false && test.critical) {
      criticalFailures++;
    } else if (test.result === null) {
      warnings++;
    }
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (criticalFailures === 0 && warnings === 0) {
    console.log('🎉 All tests passed! System is fully operational!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ You can now:');
    console.log('   1. Send messages from the app');
    console.log('   2. Messages will be sent to WhatsApp');
    console.log('   3. Setup webhook to receive messages');
    console.log('\n💡 Next step: Setup webhook with ngrok');
    console.log('   Run: ngrok http 3001');
    console.log('   Then register the URL in Meta Developer Console\n');
  } else if (criticalFailures === 0) {
    console.log('⚠️  System is working but needs configuration');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Core functionality working');
    console.log('⚠️  WhatsApp integration needs setup');
    console.log('\n💡 To send real WhatsApp messages:');
    console.log('   1. Open Settings in the app');
    console.log('   2. Configure WhatsApp Token and Phone Number ID');
    console.log('   3. Get them from: https://developers.facebook.com/apps\n');
  } else {
    console.log('❌ System has critical issues');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Please fix the issues above and run the test again.\n');
  }
}

runAllTests();
