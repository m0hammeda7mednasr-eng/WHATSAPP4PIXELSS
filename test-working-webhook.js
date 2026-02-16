// 🧪 Test Working Webhook - Find the webhook that actually works
// This will test multiple webhook endpoints to find one that works

async function testWorkingWebhook() {
  console.log('🧪 Testing Working Webhook Endpoints');
  console.log('=====================================');

  const VERIFY_TOKEN = 'whatsapp_crm_2024';
  const TEST_CHALLENGE = 'test_challenge_123';

  // List of possible webhook URLs to test
  const webhookUrls = [
    // Netlify URLs
    'https://4pixelswhatsap.netlify.app/.netlify/functions/webhook',
    'https://4pixelswhatsap.netlify.app/api/webhook',
    
    // If you have Vercel deployment
    'https://your-vercel-app.vercel.app/api/webhook',
    'https://your-vercel-app.vercel.app/api/webhook-working',
    
    // If you have Railway deployment  
    'https://your-railway-app.railway.app/api/webhook',
    
    // Local testing (if running locally)
    'http://localhost:3000/api/webhook',
    'http://localhost:8080/api/webhook'
  ];

  console.log(`🔑 Using verify token: ${VERIFY_TOKEN}`);
  console.log(`🎯 Testing ${webhookUrls.length} webhook URLs...\n`);

  let workingWebhooks = [];

  for (let i = 0; i < webhookUrls.length; i++) {
    const url = webhookUrls[i];
    console.log(`\n${i + 1}. 🧪 Testing: ${url}`);
    
    try {
      const verificationUrl = `${url}?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=${TEST_CHALLENGE}`;
      
      console.log('   📤 Sending GET request...');
      
      const response = await fetch(verificationUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'WhatsApp-Test/1.0'
        },
        timeout: 10000 // 10 second timeout
      });

      console.log(`   📥 Status: ${response.status}`);

      if (response.status === 200) {
        const responseText = await response.text();
        console.log(`   📥 Response: "${responseText}"`);
        
        if (responseText === TEST_CHALLENGE) {
          console.log('   ✅ WEBHOOK VERIFICATION SUCCESS!');
          workingWebhooks.push(url);
          
          // Test POST request too
          console.log('   🔍 Testing POST request...');
          
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
                            body: 'Test message from working webhook test'
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

          const postResponse = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'WhatsApp-Test/1.0'
            },
            body: JSON.stringify(testPayload)
          });

          console.log(`   📥 POST Status: ${postResponse.status}`);

          if (postResponse.ok) {
            const postData = await postResponse.json();
            console.log('   ✅ POST request successful!');
            console.log('   📥 POST Response:', postData);
          } else {
            const postError = await postResponse.text();
            console.log('   ⚠️  POST request failed:', postError);
          }
          
        } else {
          console.log('   ❌ Wrong challenge response');
          console.log(`      Expected: "${TEST_CHALLENGE}"`);
          console.log(`      Got: "${responseText}"`);
        }
      } else if (response.status === 503) {
        console.log('   ❌ Service Unavailable (503) - Function not deployed');
      } else if (response.status === 404) {
        console.log('   ❌ Not Found (404) - Endpoint does not exist');
      } else if (response.status === 403) {
        console.log('   ❌ Forbidden (403) - Token mismatch or access denied');
      } else {
        const errorText = await response.text();
        console.log(`   ❌ Error: ${errorText}`);
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('   ⏰ Timeout - Request took too long');
      } else if (error.message.includes('fetch')) {
        console.log('   🌐 Network error - Cannot reach endpoint');
      } else {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));

  if (workingWebhooks.length > 0) {
    console.log(`\n🎉 Found ${workingWebhooks.length} working webhook(s):`);
    
    workingWebhooks.forEach((url, index) => {
      console.log(`\n${index + 1}. ✅ ${url}`);
    });
    
    console.log('\n📋 Use in Meta Business Manager:');
    console.log(`   Callback URL: ${workingWebhooks[0]}`);
    console.log(`   Verify Token: ${VERIFY_TOKEN}`);
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Copy the callback URL above');
    console.log('2. Go to Meta Business Manager');
    console.log('3. Update webhook settings');
    console.log('4. Test with real WhatsApp messages');
    
    return workingWebhooks[0];
    
  } else {
    console.log('\n❌ No working webhooks found!');
    console.log('\n💡 Possible solutions:');
    console.log('1. Deploy to a working platform (Vercel, Railway, Render)');
    console.log('2. Check environment variables are set correctly');
    console.log('3. Verify the webhook function is deployed properly');
    console.log('4. Try running locally first: npm run dev');
    
    console.log('\n🔧 Quick fixes to try:');
    console.log('- Redeploy to Netlify');
    console.log('- Deploy to Vercel instead');
    console.log('- Use Railway for hosting');
    console.log('- Check Netlify function logs');
    
    return null;
  }
}

// Test specific webhook URL
async function testSpecificWebhook(url) {
  console.log(`\n🎯 Testing specific webhook: ${url}`);
  
  const VERIFY_TOKEN = 'whatsapp_crm_2024';
  const TEST_CHALLENGE = 'test_specific_123';
  
  try {
    const verificationUrl = `${url}?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=${TEST_CHALLENGE}`;
    
    const response = await fetch(verificationUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log(`Status: ${response.status}`);

    if (response.status === 200) {
      const responseText = await response.text();
      if (responseText === TEST_CHALLENGE) {
        console.log('✅ This webhook is working!');
        return true;
      } else {
        console.log(`❌ Wrong response: ${responseText}`);
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ Error: ${errorText}`);
    }
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
  }
  
  return false;
}

// Run the test
if (process.argv[2]) {
  // Test specific URL if provided
  testSpecificWebhook(process.argv[2]);
} else {
  // Test all URLs
  testWorkingWebhook().then((workingUrl) => {
    if (workingUrl) {
      console.log(`\n🚀 SUCCESS! Use this webhook: ${workingUrl}`);
    } else {
      console.log('\n💔 No working webhook found. Check deployment.');
    }
  }).catch(error => {
    console.error('❌ Test failed:', error);
  });
}