// 🧪 Test Simple Webhook
async function testSimpleWebhook() {
  console.log('🧪 Testing Simple Webhook');
  console.log('========================');

  const WEBHOOK_URL = process.argv[2] || 'http://localhost:3000/webhook';
  const VERIFY_TOKEN = 'whatsapp_crm_2024';
  const TEST_CHALLENGE = 'test123';

  console.log(`🎯 Testing: ${WEBHOOK_URL}`);

  try {
    const testUrl = `${WEBHOOK_URL}?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=${TEST_CHALLENGE}`;
    
    const response = await fetch(testUrl);
    console.log(`📥 Status: ${response.status}`);

    if (response.status === 200) {
      const responseText = await response.text();
      if (responseText === TEST_CHALLENGE) {
        console.log('🎉 SUCCESS! Webhook is working!');
        console.log(`📋 Use this in Meta:`);
        console.log(`   URL: ${WEBHOOK_URL}`);
        console.log(`   Token: ${VERIFY_TOKEN}`);
        return true;
      }
    }
    
    console.log('❌ Test failed');
    return false;

  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

testSimpleWebhook();