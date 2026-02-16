// Test Button Click - Simple Version
// This will help us see what's happening

const testButtonClick = {
  object: 'whatsapp_business_account',
  entry: [
    {
      id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
      changes: [
        {
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '15550000000',
              phone_number_id: '123456789' // ⚠️ غيّر ده لـ phone_number_id بتاعك
            },
            contacts: [
              {
                profile: {
                  name: 'أحمد محمد'
                },
                wa_id: '201234567890' // ⚠️ غيّر ده لرقم العميل
              }
            ],
            messages: [
              {
                from: '201234567890', // ⚠️ غيّر ده لرقم العميل
                id: 'wamid.test123',
                timestamp: Math.floor(Date.now() / 1000).toString(),
                type: 'interactive', // ✅ Interactive button
                interactive: {
                  type: 'button_reply',
                  button_reply: {
                    id: 'confirm_1234567890', // ⚠️ غيّر ده لـ order ID حقيقي
                    title: 'تأكيد الطلب ✅'
                  }
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

async function testButton() {
  console.log('🧪 Testing button click...\n');
  
  console.log('⚠️  IMPORTANT: Update these values:');
  console.log('   1. phone_number_id (from Meta)');
  console.log('   2. wa_id (customer phone)');
  console.log('   3. order ID in button payload\n');

  try {
    // Test with your Vercel URL
    const vercelUrl = 'https://your-project.vercel.app'; // ⚠️ غيّر ده
    
    console.log('📤 Sending test webhook to:', vercelUrl);
    
    const response = await fetch(`${vercelUrl}/api/webhook/whatsapp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testButtonClick)
    });

    const data = await response.json();

    console.log('\n📊 Response Status:', response.status);
    console.log('📊 Response Data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ Webhook received successfully!');
      console.log('\n📋 Next steps:');
      console.log('   1. Check Vercel logs (Functions tab)');
      console.log('   2. Look for "🔘 Interactive Button clicked"');
      console.log('   3. Check if order was updated in database');
      console.log('   4. Check if Shopify was updated');
    } else {
      console.log('\n❌ Webhook failed!');
      console.log('Error:', data.error || 'Unknown error');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

// Run test
testButton();

// ============================================
// INSTRUCTIONS
// ============================================
// 
// 1. Update these values in the code above:
//    - phone_number_id (line 12)
//    - wa_id (lines 16, 22)
//    - order ID (line 26)
//    - vercelUrl (line 51)
//
// 2. Make sure you have:
//    - Brand in database with this phone_number_id
//    - Shopify connection active
//    - Order exists in shopify_orders table
//
// 3. Run the test:
//    node test-button-now.js
//
// 4. Check Vercel logs:
//    - Go to Vercel Dashboard
//    - Click on your project
//    - Go to Functions tab
//    - Find /api/webhook/whatsapp
//    - Look for the logs
//
// ============================================
