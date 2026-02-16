// Direct Webhook Test - Simulates Shopify sending an order
import fetch from 'node-fetch';

console.log('🧪 Testing Shopify Webhook Directly\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const webhookUrl = 'http://localhost:3001/api/shopify/webhook';

// Sample order data (similar to what Shopify sends)
const testOrder = {
  id: 5555555555,
  order_number: 1234,
  email: 'test@example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  currency: 'EGP',
  current_total_price: '250.00',
  current_subtotal_price: '200.00',
  total_price: '250.00',
  subtotal_price: '200.00',
  financial_status: 'pending',
  fulfillment_status: null,
  customer: {
    id: 6666666666,
    email: 'test@example.com',
    first_name: 'أحمد',
    last_name: 'محمد',
    phone: '01066184859'
  },
  billing_address: {
    first_name: 'أحمد',
    last_name: 'محمد',
    address1: 'شارع التحرير',
    city: 'القاهرة',
    province: 'Cairo',
    country: 'Egypt',
    zip: '11511',
    phone: '01066184859'
  },
  shipping_address: {
    first_name: 'أحمد',
    last_name: 'محمد',
    address1: 'شارع التحرير',
    city: 'القاهرة',
    province: 'Cairo',
    country: 'Egypt',
    zip: '11511',
    phone: '01066184859'
  },
  line_items: [
    {
      id: 7777777777,
      title: 'تيشيرت قطن',
      quantity: 2,
      price: '75.00',
      variant_title: 'Large / أسود',
      product_id: 8888888888,
      variant_id: 9999999999
    },
    {
      id: 7777777778,
      title: 'بنطلون جينز',
      quantity: 1,
      price: '50.00',
      variant_title: 'Medium / أزرق',
      product_id: 8888888889,
      variant_id: 9999999998
    }
  ],
  shipping_lines: [
    {
      id: 1111111111,
      title: 'قياسي',
      price: '50.00',
      code: 'Standard'
    }
  ],
  total_shipping_price_set: {
    shop_money: {
      amount: '50.00',
      currency_code: 'EGP'
    }
  }
};

async function testWebhook() {
  console.log('📍 Webhook URL:', webhookUrl);
  console.log('🏪 Shop:', 'qpcich-gi.myshopify.com');
  console.log('📦 Order Number:', testOrder.order_number);
  console.log('💰 Total:', testOrder.total_price, 'EGP');
  console.log('📱 Customer Phone:', testOrder.customer.phone);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    console.log('📤 Sending webhook request...\n');

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-shopify-shop-domain': 'qpcich-gi.myshopify.com',
        'x-shopify-topic': 'orders/create',
        'x-shopify-hmac-sha256': 'test_hmac',
        'x-shopify-order-id': testOrder.id.toString(),
        'x-shopify-test': 'true'
      },
      body: JSON.stringify(testOrder)
    });

    console.log('📥 Response Status:', response.status, response.statusText);
    console.log('');

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Webhook Response:');
      console.log(JSON.stringify(data, null, 2));
      console.log('');
      
      if (data.success) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ SUCCESS! Webhook processed successfully');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
        console.log('💡 Next Steps:');
        console.log('   1. Check the server logs for detailed processing info');
        console.log('   2. Check Supabase database for new order record');
        console.log('   3. Check if WhatsApp message was sent (if token configured)');
        console.log('   4. Go to frontend and check Orders page');
      } else {
        console.log('⚠️  Webhook returned success=false');
        console.log('   Message:', data.message || 'No message');
      }
    } else {
      console.log('❌ Webhook returned error status');
      const text = await response.text();
      console.log('   Response:', text);
    }

  } catch (error) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ ERROR: Cannot connect to webhook');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('Error:', error.message);
    console.log('');
    console.log('💡 Possible reasons:');
    console.log('   1. Server is not running');
    console.log('   2. Server is running on different port');
    console.log('   3. Firewall blocking connection');
    console.log('');
    console.log('🔧 To fix:');
    console.log('   1. Open new terminal');
    console.log('   2. cd wahtsapp-main\\server');
    console.log('   3. node webhook-server-simple.js');
    console.log('   4. Wait for "Server running on http://localhost:3001"');
    console.log('   5. Run this test again');
  }

  console.log('');
}

testWebhook();
