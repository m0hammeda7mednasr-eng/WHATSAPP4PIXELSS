// 🧪 Test Fixed Netlify Webhook
// Testing the fixed webhook deployment

async function testFixedNetlifyWebhook() {
  console.log('🧪 Testing FIXED Netlify Webhook');
  console.log('==================================');

  const NETLIFY_URL = 'https://4pixelswhatsap.netlify.app';
  const WEBHOOK_URL = `${NETLIFY_URL}/.netlify/functions/webhook`;
  const VERIFY_TOKEN = 'whatsapp_crm_2024';
  const TEST_CHALLENGE = 'test_challenge_123';

  console.log(`\n📋 Testing webhook at: ${WEBHOOK_URL}`);
  console.log(`🔑 Verify token: ${VERIFY_TOKEN}`);

  try {
    // Test webhook verification (GET request)
    console.log('\n🔍 Step 1: Testing webhook verification...');
    
    const verificationUrl = `${WEBHOOK_URL}?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=${TEST_CHALLENGE}`;
    
    console.log(`📤 GET: ${verificationUrl}`);

    const response = await fetch(verificationUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WhatsApp-Test/1.0'
      }
    });

    console.log(`📥 Response Status: ${response.status}`);
    console.log(`📥 Response Headers:`, Object.fromEntries(response.headers.entries()));

    if (response.status === 200) {
      const responseText = await response.text();
      console.log(`📥 Response Body: "${responseText}"`);
      
      if (responseText === TEST_CHALLENGE) {
        console.log('✅ WEBHOOK VERIFICATION SUCCESS!');
        console.log('✅ Challenge returned correctly');
        
        console.log(`\n🎯 WORKING WEBHOOK FOUND!`);
        console.log(`📋 Use these in Meta Business Manager:`);
        console.log(`   Callback URL: ${WEBHOOK_URL}`);
        console.log(`   Verify Token: ${VERIFY_TOKEN}`);
        
        // Test POST request
        console.log('\n🔍 Step 2: Testing POST request...');
        
        const testPayload = {
          object: 'whatsapp_business_account',
          entry: [
            {
              id: 'test_entry',
              changes: [
                {
                  value: {
                    messaging_product: 'whatsapp',
                    metadata: {
                      display_phone_number: '15550559999',
                      phone_number_id: '123456789'
                    },
                    messages: [
                      {
                        from: '201234567890',
                        id: `test_msg_${Date.now()}`,
                        timestamp: Math.floor(Date.now() / 1000).toString(),
                        type: 'text',
                        text: {
                          body: 'Test message from fixed webhook test'
                        }
                      }
                    ]
                  },
                  field: 'messages'
                }
              ]
            }
          ]
        };

        const postResponse = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'WhatsApp-Test/1.0'
          },
          body: JSON.stringify(testPayload)
        });

        console.log(`📥 POST Response Status: ${postResponse.status}`);

        if (postResponse.ok) {
          const postResponseData = await postResponse.json();
          console.log('✅ POST request successful!');
          console.log('📥 Response:', postResponseData);
        } else {
          const postError = await postResponse.text();
          console.log('⚠️  POST request failed:', postError);
        }
        
        return true;
        
      } else {
        console.log('❌ VERIFICATION FAILED!');
        console.log(`   Expected: "${TEST_CHALLENGE}"`);
        console.log(`   Got: "${responseText}"`);
      }
    } else if (response.status === 503) {
      console.log('❌ SERVICE UNAVAILABLE (503)');
      console.log('   This means the Netlify function is not deployed properly');
      console.log('   You need to redeploy to Netlify');
      
      const errorText = await response.text();
      console.log(`   Error: ${errorText}`);
      
    } else {
      const errorText = await response.text();
      console.log('❌ WEBHOOK VERIFICATION FAILED!');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${errorText}`);
    }

  } catch (error) {
    console.error('❌ Network Error:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Possible solutions:');
      console.log('1. Check if Netlify site is deployed');
      console.log('2. Verify the URL is correct');
      console.log('3. Check internet connection');
    }
  }

  return false;
}

// Test different webhook URLs
async function testMultipleUrls() {
  console.log('\n🔍 Testing multiple webhook URLs...\n');
  
  const urls = [
    'https://4pixelswhatsap.netlify.app/.netlify/functions/webhook',
    'https://4pixelswhatsap.netlify.app/api/webhook',
    'https://4pixelswhatsap.netlify.app/webhook'
  ];
  
  for (const url of urls) {
    console.log(`\n🧪 Testing: ${url}`);
    
    try {
      const response = await fetch(`${url}?hub.mode=subscribe&hub.verify_token=whatsapp_crm_2024&hub.challenge=test123`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`   Status: ${response.status}`);
      
      if (response.status === 200) {
        const text = await response.text();
        if (text === 'test123') {
          console.log(`   ✅ WORKING! Use this URL: ${url}`);
          return url;
        } else {
          console.log(`   ⚠️  Wrong response: ${text}`);
        }
      } else {
        const error = await response.text();
        console.log(`   ❌ Error: ${error}`);
      }
    } catch (error) {
      console.log(`   ❌ Network error: ${error.message}`);
    }
  }
  
  return null;
}

// Run the tests
async function runAllTests() {
  console.log('🚀 Starting comprehensive webhook tests...\n');
  
  // Test the main webhook
  const mainSuccess = await testFixedNetlifyWebhook();
  
  if (!mainSuccess) {
    console.log('\n🔍 Main webhook failed, testing alternative URLs...');
    const workingUrl = await testMultipleUrls();
    
    if (workingUrl) {
      console.log(`\n🎉 Found working webhook: ${workingUrl}`);
      console.log('\n📋 Use this in Meta Business Manager:');
      console.log(`   Callback URL: ${workingUrl}`);
      console.log(`   Verify Token: whatsapp_crm_2024`);
    } else {
      console.log('\n❌ No working webhook found');
      console.log('\n💡 Next steps:');
      console.log('1. Redeploy to Netlify');
      console.log('2. Check environment variables');
      console.log('3. Verify Netlify function is deployed');
    }
  }
}

// Run all tests
runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error);
});