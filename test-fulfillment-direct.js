// Direct Fulfillment Test - اختبار مباشر للـ Fulfillment
// هذا الملف يختبر الـ fulfillment مباشرة بدون webhook

const testDirectFulfillment = async () => {
  console.log('🔧 اختبار مباشر للـ Fulfillment');
  console.log('===============================\n');

  // معلومات مطلوبة (غيّرها بالمعلومات الحقيقية)
  const testConfig = {
    shopUrl: 'wvvtha-mi.myshopify.com',
    accessToken: 'YOUR_ACCESS_TOKEN', // من Shopify App
    orderId: 'YOUR_ORDER_ID', // Order ID من Shopify
    phoneNumberId: 'YOUR_PHONE_NUMBER_ID', // من Meta
    waId: 'YOUR_WHATSAPP_NUMBER' // رقم واتساب
  };

  console.log('📋 Test Configuration:');
  console.log('Shop URL:', testConfig.shopUrl);
  console.log('Order ID:', testConfig.orderId);
  console.log('Access Token:', testConfig.accessToken ? 'EXISTS' : 'MISSING');
  console.log('\n');

  try {
    // Step 1: Test Order API
    console.log('📥 Step 1: Testing Order API...');
    const orderUrl = `https://${testConfig.shopUrl}/admin/api/2024-01/orders/${testConfig.orderId}.json`;
    console.log('Order URL:', orderUrl);

    // Step 2: Test Fulfillment Orders API
    console.log('📦 Step 2: Testing Fulfillment Orders API...');
    const fulfillmentOrdersUrl = `https://${testConfig.shopUrl}/admin/api/2024-01/orders/${testConfig.orderId}/fulfillment_orders.json`;
    console.log('Fulfillment Orders URL:', fulfillmentOrdersUrl);

    // Step 3: Test Fulfillment API
    console.log('🚀 Step 3: Testing Fulfillment API...');
    const fulfillmentUrl = `https://${testConfig.shopUrl}/admin/api/2024-01/fulfillments.json`;
    console.log('Fulfillment URL:', fulfillmentUrl);

    console.log('\n🧪 Manual Test Commands:');
    console.log('========================');
    
    console.log('1. Test Order API:');
    console.log(`curl -X GET "${orderUrl}" \\`);
    console.log(`  -H "X-Shopify-Access-Token: ${testConfig.accessToken}" \\`);
    console.log(`  -H "Content-Type: application/json"`);
    console.log('');

    console.log('2. Test Fulfillment Orders API:');
    console.log(`curl -X GET "${fulfillmentOrdersUrl}" \\`);
    console.log(`  -H "X-Shopify-Access-Token: ${testConfig.accessToken}" \\`);
    console.log(`  -H "Content-Type: application/json"`);
    console.log('');

    console.log('3. Test Button Click API:');
    console.log(`curl -X POST "https://YOUR_DOMAIN.netlify.app/.netlify/functions/handle-button-click" \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{`);
    console.log(`    "button_id": "confirm_${testConfig.orderId}",`);
    console.log(`    "wa_id": "${testConfig.waId}",`);
    console.log(`    "phone_number_id": "${testConfig.phoneNumberId}"`);
    console.log(`  }'`);
    console.log('');

    console.log('🔍 What to Check:');
    console.log('=================');
    console.log('1. Order API Response:');
    console.log('   - financial_status should be "paid"');
    console.log('   - fulfillment_status should be "unfulfilled"');
    console.log('   - location_id should exist');
    console.log('');

    console.log('2. Fulfillment Orders API Response:');
    console.log('   - Should return array of fulfillment_orders');
    console.log('   - Each should have an "id" field');
    console.log('   - Status should be "open" or "scheduled"');
    console.log('');

    console.log('3. Button Click API Response:');
    console.log('   - Should return success: true');
    console.log('   - Should show fulfillment result');
    console.log('   - Check logs for detailed errors');
    console.log('');

    console.log('🚨 Common Issues:');
    console.log('=================');
    console.log('1. Access Token Invalid:');
    console.log('   - Error: "Unauthorized" or 401');
    console.log('   - Solution: Generate new token');
    console.log('');

    console.log('2. Order Not Paid:');
    console.log('   - financial_status: "pending"');
    console.log('   - Solution: Mark as paid in Shopify');
    console.log('');

    console.log('3. No Fulfillment Orders:');
    console.log('   - Empty fulfillment_orders array');
    console.log('   - Solution: Check order has items');
    console.log('');

    console.log('4. Webhook Not Working:');
    console.log('   - No logs in Netlify/Vercel');
    console.log('   - Solution: Check webhook URL');
    console.log('');

    console.log('📞 Next Steps:');
    console.log('==============');
    console.log('1. Update testConfig with real values');
    console.log('2. Run the curl commands above');
    console.log('3. Send me the responses');
    console.log('4. I will identify the exact issue');
    console.log('');

    console.log('💡 Quick Debug:');
    console.log('===============');
    console.log('If you want quick debug, send me:');
    console.log('1. Order ID');
    console.log('2. Shop URL');
    console.log('3. Screenshot of order in Shopify');
    console.log('4. Screenshot of Netlify/Vercel logs');
    console.log('5. Webhook URL from Meta Developer Console');

  } catch (error) {
    console.error('❌ Test setup error:', error);
  }
};

// Instructions
console.log('📝 Instructions:');
console.log('================');
console.log('1. Update testConfig with your real values');
console.log('2. Run: node test-fulfillment-direct.js');
console.log('3. Copy and run the curl commands');
console.log('4. Send me the results');
console.log('');

// Run test
testDirectFulfillment();