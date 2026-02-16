// 🧪 Test Webhook After Deploy - اختبار الـ webhook بعد الرفع
async function testWebhookAfterDeploy() {
  console.log('🧪 TESTING WEBHOOK AFTER DEPLOY');
  console.log('================================');

  // Wait for deployment
  console.log('⏳ Waiting 30 seconds for Vercel deployment...');
  await new Promise(resolve => setTimeout(resolve, 30000));

  const webhookUrls = [
    'https://wahtsapp.vercel.app/api/webhook',
    'https://wahtsapp-git-main-m0hammedahmed.vercel.app/api/webhook',
    'https://wahtsapp-m0hammedahmed.vercel.app/api/webhook'
  ];

  console.log('\n📋 Testing webhook endpoints...');

  for (const url of webhookUrls) {
    try {
      console.log(`\n🌐 Testing: ${url}`);
      
      // Test GET request (webhook verification)
      const getResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(`   GET Status: ${getResponse.status}`);
      
      if (getResponse.status === 200) {
        console.log('   ✅ Endpoint is working!');
      } else if (getResponse.status === 403) {
        console.log('   ✅ Endpoint exists (needs verification token)');
      } else if (getResponse.status === 405) {
        console.log('   ✅ Endpoint exists (Method Not Allowed for GET without params)');
      } else if (getResponse.status === 404) {
        console.log('   ❌ Still returning 404');
      } else {
        console.log(`   ⚠️  Unexpected status: ${getResponse.status}`);
      }

      // Test POST request (webhook processing)
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
                    phone_number_id: '1012755295246742'
                  },
                  messages: [
                    {
                      from: '201234567890',
                      id: 'test_message',
                      timestamp: Math.floor(Date.now() / 1000).toString(),
                      type: 'text',
                      text: {
                        body: 'Test message'
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testPayload)
      });

      console.log(`   POST Status: ${postResponse.status}`);
      
      if (postResponse.ok) {
        const responseData = await postResponse.json();
        console.log('   ✅ POST request successful!');
        console.log('   📄 Response:', responseData);
        
        console.log('\n🎉 WEBHOOK IS WORKING!');
        console.log('✅ The webhook endpoint is now accessible');
        console.log('✅ Button clicks should now work properly');
        console.log('\n🎯 Next steps:');
        console.log('1. Test with a real button click from WhatsApp');
        console.log('2. Check if orders get fulfilled automatically');
        
        return true;
      } else {
        const errorText = await postResponse.text();
        console.log(`   ❌ POST failed: ${errorText}`);
      }

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n❌ All webhook endpoints still not working');
  console.log('🔧 Possible solutions:');
  console.log('1. Check Vercel deployment logs');
  console.log('2. Verify api/webhook.js file structure');
  console.log('3. Check environment variables in Vercel');
  console.log('4. Try manual deployment in Vercel dashboard');

  return false;
}

// Run the test
testWebhookAfterDeploy().then((success) => {
  if (success) {
    console.log('\n🎉 SUCCESS! Webhook is working!');
  } else {
    console.log('\n❌ Webhook still not working');
  }
  process.exit(0);
}).catch(error => {
  console.error('❌ Test error:', error);
  process.exit(1);
});