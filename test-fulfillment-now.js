// Test Fulfillment Directly
// This will test all 4 fulfillment methods

const SHOP_URL = 'YOUR_SHOP.myshopify.com'; // ⚠️ غيّر ده
const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN'; // ⚠️ غيّر ده (من Database)
const ORDER_ID = '1020'; // ⚠️ غيّر ده (من الصورة)

async function testAllMethods() {
  console.log('🧪 Testing All Fulfillment Methods...\n');
  console.log('=' .repeat(60));

  try {
    // Get order details first
    console.log('\n📥 Getting order details...');
    const orderResponse = await fetch(
      `https://${SHOP_URL}/admin/api/2024-01/orders/${ORDER_ID}.json`,
      {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': ACCESS_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!orderResponse.ok) {
      const error = await orderResponse.json();
      console.error('❌ Failed to get order:', error);
      return;
    }

    const orderData = await orderResponse.json();
    const order = orderData.order;

    console.log('✅ Order found:', order.name);
    console.log('   Status:', order.fulfillment_status || 'unfulfilled');
    console.log('   Financial:', order.financial_status);
    console.log('   Location ID:', order.location_id);

    if (order.fulfillment_status === 'fulfilled') {
      console.log('\n⚠️  Order already fulfilled!');
      console.log('   Create a new order to test.');
      return;
    }

    const fulfillableItems = order.line_items.filter(item => item.fulfillable_quantity > 0);
    
    if (fulfillableItems.length === 0) {
      console.log('\n⚠️  No items to fulfill!');
      return;
    }

    console.log('   Items to fulfill:', fulfillableItems.length);

    // Method 1: With location_id
    console.log('\n1️⃣  Method 1: REST API with location_id');
    let result = await testMethod1(order, fulfillableItems);
    if (result.success) {
      console.log('✅ SUCCESS! Order fulfilled with Method 1');
      return;
    }

    // Method 2: Without location_id
    console.log('\n2️⃣  Method 2: REST API without location_id');
    result = await testMethod2(order, fulfillableItems);
    if (result.success) {
      console.log('✅ SUCCESS! Order fulfilled with Method 2');
      return;
    }

    // Method 3: Minimal
    console.log('\n3️⃣  Method 3: REST API minimal');
    result = await testMethod3(order);
    if (result.success) {
      console.log('✅ SUCCESS! Order fulfilled with Method 3');
      return;
    }

    // Method 4: GraphQL
    console.log('\n4️⃣  Method 4: GraphQL API');
    result = await testMethod4(order);
    if (result.success) {
      console.log('✅ SUCCESS! Order fulfilled with Method 4 (GraphQL)');
      return;
    }

    console.log('\n❌ All methods failed!');
    console.log('\n💡 Possible issues:');
    console.log('   1. App missing write_fulfillments permission');
    console.log('   2. Order status not paid/authorized');
    console.log('   3. Access token expired');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

async function testMethod1(order, items) {
  try {
    const payload = {
      fulfillment: {
        location_id: order.location_id,
        tracking_number: `TEST-${Date.now()}`,
        notify_customer: false,
        line_items: items.map(item => ({
          id: item.id,
          quantity: item.fulfillable_quantity
        }))
      }
    };

    const response = await fetch(
      `https://${SHOP_URL}/admin/api/2024-01/orders/${ORDER_ID}/fulfillments.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': ACCESS_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log('   ✅ Success!');
      console.log('   Fulfillment ID:', data.fulfillment?.id);
      return { success: true, data };
    }

    console.log('   ❌ Failed:', data.errors || data);
    return { success: false, error: data };
  } catch (error) {
    console.log('   ❌ Error:', error.message);
    return { success: false, error };
  }
}

async function testMethod2(order, items) {
  try {
    const payload = {
      fulfillment: {
        tracking_number: `TEST-${Date.now()}`,
        notify_customer: false,
        line_items: items.map(item => ({
          id: item.id,
          quantity: item.fulfillable_quantity
        }))
      }
    };

    const response = await fetch(
      `https://${SHOP_URL}/admin/api/2024-01/orders/${ORDER_ID}/fulfillments.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': ACCESS_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log('   ✅ Success!');
      console.log('   Fulfillment ID:', data.fulfillment?.id);
      return { success: true, data };
    }

    console.log('   ❌ Failed:', data.errors || data);
    return { success: false, error: data };
  } catch (error) {
    console.log('   ❌ Error:', error.message);
    return { success: false, error };
  }
}

async function testMethod3(order) {
  try {
    const payload = {
      fulfillment: {
        notify_customer: false
      }
    };

    const response = await fetch(
      `https://${SHOP_URL}/admin/api/2024-01/orders/${ORDER_ID}/fulfillments.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': ACCESS_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log('   ✅ Success!');
      console.log('   Fulfillment ID:', data.fulfillment?.id);
      return { success: true, data };
    }

    console.log('   ❌ Failed:', data.errors || data);
    return { success: false, error: data };
  } catch (error) {
    console.log('   ❌ Error:', error.message);
    return { success: false, error };
  }
}

async function testMethod4(order) {
  try {
    const mutation = `
      mutation fulfillmentCreateV2($fulfillment: FulfillmentV2Input!) {
        fulfillmentCreateV2(fulfillment: $fulfillment) {
          fulfillment {
            id
            status
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      fulfillment: {
        lineItemsByFulfillmentOrder: [{
          fulfillmentOrderId: `gid://shopify/Order/${ORDER_ID}`
        }],
        notifyCustomer: false
      }
    };

    const response = await fetch(
      `https://${SHOP_URL}/admin/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': ACCESS_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: mutation, variables })
      }
    );

    const data = await response.json();

    if (response.ok && !data.errors && 
        data.data?.fulfillmentCreateV2?.userErrors?.length === 0) {
      console.log('   ✅ Success!');
      console.log('   Fulfillment ID:', data.data.fulfillmentCreateV2.fulfillment?.id);
      return { success: true, data };
    }

    console.log('   ❌ Failed:', data.errors || data.data?.fulfillmentCreateV2?.userErrors);
    return { success: false, error: data };
  } catch (error) {
    console.log('   ❌ Error:', error.message);
    return { success: false, error };
  }
}

// Run test
testAllMethods();

// ============================================
// INSTRUCTIONS
// ============================================
// 
// 1. Get your values:
//    - SHOP_URL: من Shopify (e.g., moon-store.myshopify.com)
//    - ACCESS_TOKEN: من Database (shopify_connections table)
//    - ORDER_ID: من الصورة (1020)
//
// 2. Update the values above
//
// 3. Run:
//    node test-fulfillment-now.js
//
// 4. Check which method works!
//
// ============================================
