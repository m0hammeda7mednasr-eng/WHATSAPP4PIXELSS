// Test Media Features
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🧪 Testing Media Features...\n');

async function testStorageBucket() {
  console.log('1️⃣ Testing Storage Bucket...');
  
  try {
    // Check if bucket exists
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Error listing buckets:', error.message);
      return false;
    }
    
    const mediaBucket = buckets.find(b => b.name === 'whatsapp-media');
    
    if (mediaBucket) {
      console.log('✅ Bucket "whatsapp-media" exists');
      console.log('   Public:', mediaBucket.public ? 'Yes' : 'No');
      return true;
    } else {
      console.log('❌ Bucket "whatsapp-media" not found');
      console.log('   Please create it in Supabase Dashboard');
      console.log('   See: SETUP-STORAGE-BUCKET.md');
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testMessagesTable() {
  console.log('\n2️⃣ Testing Messages Table...');
  
  try {
    // Check if media_url column exists
    const { data, error } = await supabase
      .from('messages')
      .select('id, message_type, media_url')
      .limit(1);
    
    if (error) {
      console.error('❌ Error:', error.message);
      return false;
    }
    
    console.log('✅ Messages table supports media_url');
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testWebhookServer() {
  console.log('\n3️⃣ Testing Webhook Server...');
  
  try {
    const response = await fetch('http://localhost:3001/health');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Webhook server is running');
      console.log('   Status:', data.status);
      return true;
    } else {
      console.log('❌ Webhook server not responding');
      console.log('   Please start it: node server/webhook-server.js');
      return false;
    }
  } catch (error) {
    console.log('❌ Webhook server not running');
    console.log('   Please start it: node server/webhook-server.js');
    return false;
  }
}

async function runTests() {
  const results = {
    storage: await testStorageBucket(),
    messages: await testMessagesTable(),
    webhook: await testWebhookServer()
  };
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Test Results:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Storage Bucket:', results.storage ? '✅' : '❌');
  console.log('Messages Table:', results.messages ? '✅' : '❌');
  console.log('Webhook Server:', results.webhook ? '✅' : '❌');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (results.storage && results.messages && results.webhook) {
    console.log('🎉 All tests passed! You can now:');
    console.log('   1. Send images and files');
    console.log('   2. Record voice messages');
    console.log('   3. Delete chats');
    console.log('   4. Receive media from customers\n');
  } else {
    console.log('⚠️  Some features may not work. Please fix the issues above.\n');
  }
}

runTests();
