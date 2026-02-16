// Diagnose Fulfillment Issue
// This will help us understand why fulfillment is not working

const SHOP_URL = 'YOUR_SHOP.myshopify.com'; // ⚠️ غيّر ده
const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN'; // ⚠️ غيّر ده
const ORDER_ID = '1017'; // ⚠️ غيّر ده لـ Order ID من الصورة

async function diagnoseFulfillment() {
  console.log('🔍 Diagnosing Fulfillment Issue...\n');
  console.log('=' .repeat(60));

  try {
    // 1. Get Order Details
    console.log('\n1️⃣  Getting order details...');
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
    console.log('   ID:', order.id);
    console.log('   Status:', order.fulfillment_status || 'unfulfilled');
    console.log('   Financial Status:', order.financial_status);
    console.log('   Location ID:', order.location_id);
    console.log('   Line Items:', order.line_items.length);

    // Show line items
    console.log('\n📦 Line Items:');
    order.line_items.forEach((item, i) => {
      console.log(`   ${i + 1}. ${item.name}`);
      console.log(`      ID: ${item.id}`);
      console.log(`      Quantity: ${item.quantity}`);
      console.log(`      Fulfillable: ${item.fulfillable_quantity}`);
      console.log(`      Fulfilled: ${item.fulfillment_status || 'unfulfilled'}`);
    });

    // 2. Check if already fulfilled
    if (order.fulfillment_status === 'fulfilled') {
      console.log('\n⚠️  Order is already fulfilled!');
      return;
    }

    // 3. Get fulfillable items
    const fulfillableItems = order.line_items.filter(item => item.fulfillable_quantity > 0);
    
    if (fulfillableItems.length === 0) {
      console.log('\n⚠️  No items to fulfill!');
      return;
    }

    console.log('\n✅ Can fulfill', fulfillableItems.length, 'items');

    // 4. Try Method 1: New Fulfillment API
    console.log('\n2️⃣  Trying Method 1: New Fulfillment API...');
    
    const method1Payload = {
      fulfillment: {
        location_id: order.location_id,
        tracking_number: `WA-TEST-${Date.now()}`,
        notify_customer: false,
        line_items: fulfillableItems.map(item => ({
          id: item.id,
          quantity: item.fulfillable_quantity
        }))
      }
    };

    console.log('📤 Payload:', JSON.stringify(method1Payload, null, 2));

    const method1Response = await fetch(
      `https://${SHOP_URL}/admin/api/2024-01/orders/${ORDER_ID}/fulfillments.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': ACCESS_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(method1Payload)
      }
    );

    const method1Data = await method1Response.json();

    if (method1Response.ok) {
      console.log('✅ Method 1 SUCCESS!');
      console.log('   Fulfillment ID:', method1Data.fulfillment?.id);
      console.log('   Status:', method1Data.fulfillment?.status);
      console.log('\n🎉 Order fulfilled successfully!');
      return;
    }

    console.log('❌ Method 1 failed:', method1Data);
    console.log('   Status:', method1Response.status);
    console.log('   Errors:', JSON.stringify(method1Data.errors, null, 2));

    // 5. Try Method 2: Without location_id
    console.log('\n3️⃣  Trying Method 2: Without location_id...');
    
    const method2Payload = {
      fulfillment: {
        tracking_number: `WA-TEST-${Date.now()}`,
        notify_customer: false,
        line_items: fulfillableItems.map(item => ({
          id: item.id,
          quantity: item.fulfillable_quantity
        }))
      }
    };

    const method2Response = await fetch(
      `https://${SHOP_URL}/admin/api/2024-01/orders/${ORDER_ID}/fulfillments.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': ACCESS_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(method2Payload)
      }
    );

    const method2Data = await method2Response.json();

    if (method2Response.ok) {
      console.log('✅ Method 2 SUCCESS!');
      console.log('   Fulfillment ID:', method2Data.fulfillment?.id);
      console.log('\n🎉 Order fulfilled successfully!');
      return;
    }

    console.log('❌ Method 2 failed:', method2Data);

    // 6. Check Locations
    console.log('\n4️⃣  Checking available locations...');
    
    const locationsResponse = await fetch(
      `https://${SHOP_URL}/admin/api/2024-01/locations.json`,
      {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': ACCESS_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );

    if (locationsResponse.ok) {
      const locationsData = await locationsResponse.json();
      console.log('✅ Available locations:');
      locationsData.locations.forEach((loc, i) => {
        console.log(`   ${i + 1}. ${loc.name}`);
        console.log(`      ID: ${loc.id}`);
        console.log(`      Active: ${loc.active}`);
      });
    }

    // 7. Summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 SUMMARY');
    console.log('=' .repeat(60));
    console.log('❌ Fulfillment failed with both methods');
    console.log('\n💡 Possible reasons:');
    console.log('   1. Access token missing fulfillment permissions');
    console.log('   2. Location ID is incorrect');
    console.log('   3. Order is not in correct status');
    console.log('   4. Shopify app needs more permissions');
    console.log('\n📋 Next steps:');
    console.log('   1. Check Shopify App permissions');
    console.log('   2. Make sure app has "write_fulfillments" scope');
    console.log('   3. Try with correct location_id');
    console.log('   4. Check order financial status');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

diagnoseFulfillment();

// ============================================
// INSTRUCTIONS
// ============================================
// 
// 1. Update these values:
//    - SHOP_URL (your-store.myshopify.com)
//    - ACCESS_TOKEN (from Shopify connection)
//    - ORDER_ID (from the screenshot: 1017)
//
// 2. Run:
//    node diagnose-fulfillment.js
//
// 3. Check the output to see why fulfillment fails
//
// ============================================
