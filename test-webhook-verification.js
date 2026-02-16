// Test WhatsApp Webhook Verification
// This simulates what Meta does when verifying your webhook

const WEBHOOK_URL = 'https://wahtsapp2.vercel.app/api/webhook';
const VERIFY_TOKEN = 'whatsapp_crm_2024';

async function testWebhookVerification() {
  console.log('🧪 Testing WhatsApp Webhook Verification...\n');

  try {
    // Simulate Meta's verification request
    const challenge = 'test_challenge_' + Date.now();
    const url = `${WEBHOOK_URL}?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=${challenge}`;

    console.log('📤 Sending verification request...');
    console.log('URL:', url);
    console.log('Expected response:', challenge);
    console.log('');

    const response = await fetch(url, {
      method: 'GET'
    });

    console.log('📥 Response received:');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);

    const responseText = await response.text();
    console.log('Body:', responseText);
    console.log('');

    // Check if verification succeeded
    if (response.status === 200 && responseText === challenge) {
      console.log('✅ SUCCESS! Webhook verification works correctly!');
      console.log('');
      console.log('📋 Next steps:');
      console.log('1. Go to Meta Developer Console');
      console.log('2. WhatsApp → Configuration → Webhook');
      console.log('3. Enter:');
      console.log('   Callback URL: ' + WEBHOOK_URL);
      console.log('   Verify Token: ' + VERIFY_TOKEN);
      console.log('4. Click "Verify and Save"');
      console.log('5. Subscribe to: messages, message_status');
      return true;
    } else {
      console.log('❌ FAILED! Webhook verification not working');
      console.log('');
      console.log('🔧 Troubleshooting:');
      console.log('1. Check if webhook is deployed on Vercel');
      console.log('2. Check Environment Variables in Vercel:');
      console.log('   - WEBHOOK_VERIFY_TOKEN = whatsapp_crm_2024');
      console.log('   - VITE_SUPABASE_URL');
      console.log('   - VITE_SUPABASE_ANON_KEY');
      console.log('3. Redeploy the project');
      console.log('4. Try again');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing webhook:', error.message);
    console.log('');
    console.log('🔧 Possible issues:');
    console.log('1. Webhook not deployed yet');
    console.log('2. Network/firewall blocking request');
    console.log('3. Vercel deployment failed');
    return false;
  }
}

// Test with wrong token
async function testWrongToken() {
  console.log('\n🧪 Testing with wrong token (should fail)...\n');

  try {
    const challenge = 'test_challenge_' + Date.now();
    const url = `${WEBHOOK_URL}?hub.mode=subscribe&hub.verify_token=wrong_token&hub.challenge=${challenge}`;

    const response = await fetch(url, {
      method: 'GET'
    });

    console.log('Status:', response.status);
    const responseText = await response.text();
    console.log('Body:', responseText);

    if (response.status === 403) {
      console.log('✅ Correctly rejected wrong token!');
      return true;
    } else {
      console.log('⚠️  Should have rejected wrong token');
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

// Run tests
(async () => {
  const test1 = await testWebhookVerification();
  const test2 = await testWrongToken();

  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Results:');
  console.log('='.repeat(60));
  console.log('Correct token:', test1 ? '✅ PASS' : '❌ FAIL');
  console.log('Wrong token:', test2 ? '✅ PASS' : '❌ FAIL');
  console.log('='.repeat(60));

  if (test1 && test2) {
    console.log('\n🎉 All tests passed! Webhook is ready for Meta!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the troubleshooting steps above.');
  }
})();
