// Test Shopify Order Confirmation
// This script tests sending an order confirmation with interactive buttons

const testOrderConfirmation = async () => {
  console.log('🧪 Testing Shopify Order Confirmation...\n');

  const payload = {
    phone_number: '201066184859', // ⚠️ غيّر الرقم ده لرقم حقيقي
    order_id: 'test_order_' + Date.now(), // Shopify order ID
    order_number: '#TEST-' + Math.floor(Math.random() * 10000),
    customer_name: 'أحمد محمد',
    total: '500 جنيه',
    brand_id: 'd1678581-bc57-4d01-9f35-b0bdc4edcd77', // 4 Pixels brand
    items: [
      { name: 'تيشيرت أبيض', quantity: 2 },
      { name: 'بنطلون جينز', quantity: 1 }
    ]
  };

  console.log('📤 Sending order confirmation...');
  console.log('Phone:', payload.phone_number);
  console.log('Order:', payload.order_number);
  console.log('');

  try {
    // Try Vercel first, fallback to localhost
    const apiUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}/api/shopify/send-order-confirmation`
      : 'http://localhost:3001/api/shopify/send-order-confirmation';
    
    console.log('API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('✅ SUCCESS!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Message ID:', result.message_id);
      console.log('Contact ID:', result.contact_id);
      console.log('Order Tracked:', result.order_tracked);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      console.log('✅ الرسالة اتبعتت على WhatsApp مع الأزرار');
      console.log('✅ الطلب اتحفظ في الـ database');
      console.log('✅ العميل هيشوف زرارين: تأكيد ✅ / إلغاء ❌');
      console.log('');
      console.log('💡 دلوقتي:');
      console.log('   1. افتح WhatsApp على الرقم ده');
      console.log('   2. هتلاقي الرسالة مع الزرارين');
      console.log('   3. اضغط على أي زرار');
      console.log('   4. النظام هيحدث Shopify تلقائياً');
    } else {
      console.log('❌ FAILED!');
      console.log('Error:', result.error);
      console.log('');
      console.log('💡 تأكد من:');
      console.log('   1. الـ webhook server شغال (npm run webhook)');
      console.log('   2. الـ brand_id صحيح');
      console.log('   3. الـ WhatsApp Token مضبوط');
      console.log('   4. رقم العميل صحيح');
    }
  } catch (error) {
    console.log('❌ ERROR!');
    console.log('Error:', error.message);
    console.log('');
    console.log('💡 تأكد إن الـ webhook server شغال:');
    console.log('   npm run webhook');
  }
};

// Run test
testOrderConfirmation();
