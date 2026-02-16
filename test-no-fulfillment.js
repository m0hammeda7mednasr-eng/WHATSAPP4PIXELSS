// Test Order Confirmation WITHOUT Auto-Fulfillment
// هذا السكريبت يختبر النظام الجديد (تأكيد بدون Fulfillment)

require('dotenv').config();

const testOrderConfirmation = async () => {
  console.log('🧪 Testing Order Confirmation (No Auto-Fulfillment)');
  console.log('================================================\n');

  // معلومات الاختبار
  const testData = {
    phone_number: '01234567890', // غيّر للرقم الحقيقي
    order_id: '6234567890123', // Order ID من Shopify
    order_number: '1001',
    customer_name: 'أحمد محمد',
    total: '500 جنيه',
    brand_id: 'YOUR_BRAND_ID', // من Supabase
    items: [
      { name: 'تيشيرت أبيض', quantity: 2 },
      { name: 'بنطلون جينز', quantity: 1 }
    ]
  };

  console.log('📋 Test Data:');
  console.log(JSON.stringify(testData, null, 2));
  console.log('\n');

  try {
    // 1. Send order confirmation
    console.log('📤 Step 1: Sending order confirmation...');
    const confirmResponse = await fetch('YOUR_VERCEL_URL/api/shopify/send-order-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    const confirmData = await confirmResponse.json();
    console.log('✅ Confirmation sent:', confirmData);
    console.log('\n');

    // 2. Simulate button click (confirm)
    console.log('🔘 Step 2: Simulating "Confirm" button click...');
    console.log('⏳ Wait for customer to click button in WhatsApp...');
    console.log('💡 Or manually trigger webhook with button_id: confirm_' + testData.order_id);
    console.log('\n');

    // 3. Expected results
    console.log('📊 Expected Results:');
    console.log('==================');
    console.log('✅ Customer receives confirmation message with buttons');
    console.log('✅ When customer clicks "Confirm":');
    console.log('   - Receives: "تم تأكيد طلبك #1001 - سيتم تجهيز طلبك وشحنه قريباً"');
    console.log('   - Order in Shopify gets tag: "whatsapp-confirmed"');
    console.log('   - Order status: UNFULFILLED (not fulfilled automatically)');
    console.log('   - Note added: "تم التأكيد عبر WhatsApp (بدون Fulfillment تلقائي)"');
    console.log('\n');

    console.log('🔍 How to Verify:');
    console.log('=================');
    console.log('1. Check WhatsApp: Customer should receive message with buttons');
    console.log('2. Click "تأكيد الطلب" button');
    console.log('3. Check WhatsApp: Customer should receive confirmation');
    console.log('4. Check Shopify Dashboard:');
    console.log('   - Go to Orders');
    console.log('   - Find order #' + testData.order_number);
    console.log('   - Check Tags: Should have "whatsapp-confirmed"');
    console.log('   - Check Status: Should be "Unfulfilled" (NOT Fulfilled)');
    console.log('   - Check Notes: Should have confirmation note');
    console.log('\n');

    console.log('✅ Manual Fulfillment:');
    console.log('=====================');
    console.log('When you are ready to ship:');
    console.log('1. Open order in Shopify');
    console.log('2. Click "Fulfill items"');
    console.log('3. Select items to fulfill');
    console.log('4. Click "Fulfill"');
    console.log('\n');

    console.log('🎉 Test completed! Check the results above.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  }
};

// Instructions
console.log('📝 Before running this test:');
console.log('============================');
console.log('1. Update testData with real values:');
console.log('   - phone_number: Real WhatsApp number');
console.log('   - order_id: Real Shopify order ID');
console.log('   - brand_id: Your brand ID from Supabase');
console.log('2. Update YOUR_VERCEL_URL with your Vercel deployment URL');
console.log('3. Make sure Shopify is connected');
console.log('4. Make sure WhatsApp token is valid');
console.log('\n');

// Run test
testOrderConfirmation();
