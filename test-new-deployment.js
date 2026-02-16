// 🧪 Test New Deployment
// اختبار الـ deployment الجديد

async function testNewDeployment() {
  console.log('🧪 اختبار الـ Deployment الجديد');
  console.log('==============================');

  const VERIFY_TOKEN = 'whatsapp_crm_2024';
  const TEST_CHALLENGE = 'test_deployment_123';

  // حط الـ URL بتاع الـ deployment الجديد هنا
  const deploymentUrl = process.argv[2] || 'https://your-app.vercel.app';
  const webhookUrl = `${deploymentUrl}/api/webhook`;

  console.log(`🎯 Testing: ${webhookUrl}`);
  console.log(`🔑 Token: ${VERIFY_TOKEN}\n`);

  try {
    // Test webhook verification
    const testUrl = `${webhookUrl}?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=${TEST_CHALLENGE}`;
    
    console.log('📤 Sending verification request...');
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WhatsApp/1.0'
      }
    });

    console.log(`📥 Response Status: ${response.status}`);

    if (response.status === 200) {
      const responseText = await response.text();
      console.log(`📥 Response Body: "${responseText}"`);
      
      if (responseText === TEST_CHALLENGE) {
        console.log('\n🎉 SUCCESS! الـ Webhook شغال!');
        console.log('✅ Verification passed');
        
        // Test POST request
        console.log('\n🔍 Testing POST request...');
        
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
                          body: 'Test message from new deployment'
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

        const postResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'WhatsApp/1.0'
          },
          body: JSON.stringify(testPayload)
        });

        console.log(`📥 POST Status: ${postResponse.status}`);

        if (postResponse.ok) {
          const postData = await postResponse.json();
          console.log('✅ POST request successful!');
          console.log('📥 Response:', postData);
        } else {
          const postError = await postResponse.text();
          console.log('⚠️  POST request failed:', postError);
        }
        
        console.log('\n📋 Use in Meta Business Manager:');
        console.log(`   Callback URL: ${webhookUrl}`);
        console.log(`   Verify Token: ${VERIFY_TOKEN}`);
        
        console.log('\n🎯 Next Steps:');
        console.log('1. Copy the callback URL above');
        console.log('2. Go to Meta Business Manager');
        console.log('3. Update webhook settings');
        console.log('4. Test with real WhatsApp messages');
        
        return true;
        
      } else {
        console.log('\n❌ VERIFICATION FAILED!');
        console.log(`   Expected: "${TEST_CHALLENGE}"`);
        console.log(`   Got: "${responseText}"`);
      }
    } else if (response.status === 404) {
      console.log('\n❌ NOT FOUND (404)');
      console.log('   الـ webhook endpoint مش موجود');
      console.log('   تأكد إن الـ deployment شغال صح');
    } else if (response.status === 503) {
      console.log('\n❌ SERVICE UNAVAILABLE (503)');
      console.log('   الـ deployment مش شغال');
      console.log('   جرب deploy تاني');
    } else {
      const errorText = await response.text();
      console.log('\n❌ ERROR');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${errorText}`);
    }

  } catch (error) {
    console.error('\n❌ Network Error:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Possible solutions:');
      console.log('1. Check if the deployment URL is correct');
      console.log('2. Verify the deployment is live');
      console.log('3. Check internet connection');
    }
  }

  return false;
}

// Usage instructions
if (!process.argv[2]) {
  console.log('📋 Usage:');
  console.log('node test-new-deployment.js https://your-app.vercel.app');
  console.log('');
  console.log('🎯 Examples:');
  console.log('node test-new-deployment.js https://whatsapp-crm.vercel.app');
  console.log('node test-new-deployment.js https://4pixels-whatsapp.vercel.app');
  console.log('');
  console.log('⚠️  Replace with your actual deployment URL!');
  process.exit(1);
}

// Run the test
testNewDeployment().then((success) => {
  if (success) {
    console.log('\n🚀 Deployment is working! Ready to use.');
  } else {
    console.log('\n💔 Deployment test failed. Check deployment.');
  }
}).catch(error => {
  console.error('❌ Test failed:', error);
});