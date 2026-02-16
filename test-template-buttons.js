// Test Template Button Handling
// This simulates what Meta sends when a button is clicked in a Template Message

const testTemplateButtonWebhook = {
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
              phone_number_id: 'YOUR_PHONE_NUMBER_ID' // ⚠️ غيّر ده
            },
            contacts: [
              {
                profile: {
                  name: 'أحمد محمد'
                },
                wa_id: '201234567890' // ⚠️ غيّر ده
              }
            ],
            messages: [
              {
                from: '201234567890', // ⚠️ غيّر ده
                id: 'wamid.test123',
                timestamp: Math.floor(Date.now() / 1000).toString(),
                type: 'button', // ✅ Template buttons use type 'button'
                button: {
                  payload: 'confirm_1234567890', // ✅ This is the button payload
                  text: 'تأكيد الطلب ✅' // ✅ This is the button text
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

const testInteractiveButtonWebhook = {
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
              phone_number_id: 'YOUR_PHONE_NUMBER_ID' // ⚠️ غيّر ده
            },
            contacts: [
              {
                profile: {
                  name: 'أحمد محمد'
                },
                wa_id: '201234567890' // ⚠️ غيّر ده
              }
            ],
            messages: [
              {
                from: '201234567890', // ⚠️ غيّر ده
                id: 'wamid.test456',
                timestamp: Math.floor(Date.now() / 1000).toString(),
                type: 'interactive', // ✅ Interactive buttons use type 'interactive'
                interactive: {
                  type: 'button_reply',
                  button_reply: {
                    id: 'confirm_1234567890', // ✅ This is the button ID
                    title: 'تأكيد الطلب ✅' // ✅ This is the button title
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

async function testWebhook(webhookData, testName) {
  console.log(`\n🧪 Testing: ${testName}`);
  console.log('=' .repeat(50));

  try {
    const response = await fetch('http://localhost:3000/api/webhook/whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookData)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Success:', data);
    } else {
      console.log('❌ Error:', data);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Template Button Tests...\n');
  
  console.log('⚠️  IMPORTANT: Update these values first:');
  console.log('   - YOUR_PHONE_NUMBER_ID');
  console.log('   - 201234567890 (customer phone)');
  console.log('   - confirm_1234567890 (order ID)\n');

  // Test 1: Template Button (quick_reply)
  await testWebhook(testTemplateButtonWebhook, 'Template Button Click (confirm)');

  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 2: Interactive Button
  await testWebhook(testInteractiveButtonWebhook, 'Interactive Button Click (confirm)');

  console.log('\n✅ Tests completed!');
  console.log('\n📋 Check your Vercel logs to see:');
  console.log('   - "🔘 Template Button clicked: confirm_1234567890"');
  console.log('   - "✅ Template button handled: {...}"');
  console.log('   - Order status updated in database');
  console.log('   - Fulfillment created in Shopify');
}

// Run tests
runTests().catch(console.error);

// ============================================
// HOW TO USE THIS TEST
// ============================================
// 
// 1. Update the values:
//    - YOUR_PHONE_NUMBER_ID (from Meta)
//    - 201234567890 (customer phone)
//    - confirm_1234567890 (real order ID from database)
//
// 2. Make sure you have:
//    - Brand configured with phone_number_id
//    - Shopify connection active
//    - Order exists in shopify_orders table
//
// 3. Run the test:
//    node test-template-buttons.js
//
// 4. Check results:
//    - Vercel logs (Functions tab)
//    - Database (shopify_orders table)
//    - Shopify admin (order tags & fulfillment)
//
// ============================================
