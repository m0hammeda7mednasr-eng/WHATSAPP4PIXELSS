// Test Template System
// Tests both new and existing customer scenarios

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rmpgofswkpjxionzythf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const WEBHOOK_URL = 'http://localhost:3001/api/shopify/webhook';

console.log('🧪 Testing Template System\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Test 1: New Customer (should use Template)
async function testNewCustomer() {
  console.log('📋 TEST 1: New Customer (Should use Template)\n');
  
  const newPhone = '201234567890'; // New phone number
  
  // Check if contact exists
  const { data: existingContact } = await supabase
    .from('contacts')
    .select('id')
    .eq('wa_id', newPhone)
    .limit(1);
  
  if (existingContact && existingContact.length > 0) {
    console.log('⚠️  Contact already exists, deleting for test...');
    await supabase
      .from('contacts')
      .delete()
      .eq('wa_id', newPhone);
    console.log('✅ Contact deleted\n');
  }
  
  const testOrder = {
    id: Math.floor(Math.random() * 1000000),
    order_number: Math.floor(Math.random() * 10000),
    financial_status: 'pending',
    currency: 'EGP',
    current_subtotal_price: '500',
    total_shipping_price_set: {
      shop_money: { amount: '50' }
    },
    current_total_price: '550',
    customer: {
      first_name: 'أحمد',
      last_name: 'محمد',
      phone: newPhone,
      email: 'test@example.com'
    },
    shipping_address: {
      first_name: 'أحمد',
      last_name: 'محمد',
      phone: newPhone,
      address1: 'شارع التحرير',
      city: 'القاهرة'
    },
    line_items: [
      {
        title: 'طرحة ستان',
        variant_title: 'لافندر',
        quantity: 1,
        price: '500'
      }
    ]
  };
  
  console.log('📤 Sending test order for NEW customer...');
  console.log('📱 Phone:', newPhone);
  console.log('💰 Total:', testOrder.current_total_price, 'EGP\n');
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-shopify-shop-domain': 'qpcich-gi.myshopify.com',
        'x-shopify-topic': 'orders/create'
      },
      body: JSON.stringify(testOrder)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Webhook processed successfully');
      console.log('📋 Expected: Template message (moon2)');
      console.log('💡 Check server logs for: "NEW CUSTOMER - Fetching template"\n');
    } else {
      console.log('❌ Webhook failed:', result);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Test 2: Existing Customer (should use regular text)
async function testExistingCustomer() {
  console.log('📋 TEST 2: Existing Customer (Should use Regular Text)\n');
  
  const existingPhone = '201066184859'; // Existing phone number
  
  // Make sure contact exists
  const { data: existingContact } = await supabase
    .from('contacts')
    .select('id, name')
    .eq('wa_id', existingPhone)
    .limit(1);
  
  if (!existingContact || existingContact.length === 0) {
    console.log('⚠️  Contact does not exist, creating for test...');
    
    const { data: brand } = await supabase
      .from('brands')
      .select('id')
      .limit(1)
      .single();
    
    await supabase
      .from('contacts')
      .insert({
        brand_id: brand.id,
        wa_id: existingPhone,
        name: 'محمد أحمد',
        last_message_at: new Date().toISOString()
      });
    
    console.log('✅ Contact created\n');
  } else {
    console.log('✅ Contact exists:', existingContact[0].name, '\n');
  }
  
  const testOrder = {
    id: Math.floor(Math.random() * 1000000),
    order_number: Math.floor(Math.random() * 10000),
    financial_status: 'pending',
    currency: 'EGP',
    current_subtotal_price: '800',
    total_shipping_price_set: {
      shop_money: { amount: '50' }
    },
    current_total_price: '850',
    customer: {
      first_name: 'محمد',
      last_name: 'أحمد',
      phone: existingPhone,
      email: 'existing@example.com'
    },
    shipping_address: {
      first_name: 'محمد',
      last_name: 'أحمد',
      phone: existingPhone,
      address1: 'شارع الهرم',
      city: 'الجيزة'
    },
    line_items: [
      {
        title: 'فستان سواريه',
        variant_title: 'أسود',
        quantity: 1,
        price: '800'
      }
    ]
  };
  
  console.log('📤 Sending test order for EXISTING customer...');
  console.log('📱 Phone:', existingPhone);
  console.log('💰 Total:', testOrder.current_total_price, 'EGP\n');
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-shopify-shop-domain': 'qpcich-gi.myshopify.com',
        'x-shopify-topic': 'orders/create'
      },
      body: JSON.stringify(testOrder)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Webhook processed successfully');
      console.log('📋 Expected: Regular text message (no template)');
      console.log('💡 Check server logs for: "EXISTING CUSTOMER - Using regular text"\n');
    } else {
      console.log('❌ Webhook failed:', result);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run tests
async function runTests() {
  console.log('🚀 Starting tests...\n');
  
  // Wait a bit between tests
  await testNewCustomer();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await testExistingCustomer();
  
  console.log('✅ Tests completed!\n');
  console.log('📊 Summary:');
  console.log('   • Test 1: New customer → Should use Template (moon2)');
  console.log('   • Test 2: Existing customer → Should use Regular text\n');
  console.log('💡 Check server logs to verify the correct message type was used\n');
}

runTests().catch(console.error);
