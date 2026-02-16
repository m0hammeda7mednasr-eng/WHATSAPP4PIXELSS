import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rmpgofswkpjxionzythf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('🧪 Testing Interactive Buttons System');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function testSystem() {
  try {
    // 1. Check database columns
    console.log('📋 Step 1: Checking database columns...');
    
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('id, name, brand_emoji, existing_customer_message, confirmation_message, cancellation_message, reminder_message')
      .limit(1);
    
    if (brandsError) {
      console.error('❌ Error fetching brands:', brandsError);
      return;
    }
    
    if (!brands || brands.length === 0) {
      console.error('❌ No brands found');
      return;
    }
    
    const brand = brands[0];
    console.log('✅ Brand found:', brand.name);
    console.log('✅ Brand emoji:', brand.brand_emoji || '(not set)');
    console.log('✅ Existing customer message:', brand.existing_customer_message ? 'Set' : 'Not set');
    console.log('✅ Confirmation message:', brand.confirmation_message ? 'Set' : 'Not set');
    console.log('✅ Cancellation message:', brand.cancellation_message ? 'Set' : 'Not set');
    console.log('✅ Reminder message:', brand.reminder_message ? 'Set' : 'Not set');
    console.log();
    
    // 2. Check orders table
    console.log('📋 Step 2: Checking orders table...');
    
    const { data: orders, error: ordersError } = await supabase
      .from('shopify_orders')
      .select('id, shopify_order_number, confirmation_status, reminder_sent, customer_response')
      .limit(5)
      .order('created_at', { ascending: false });
    
    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError);
      return;
    }
    
    console.log(`✅ Found ${orders?.length || 0} recent orders`);
    
    if (orders && orders.length > 0) {
      console.log('\nRecent orders:');
      orders.forEach(order => {
        console.log(`  • Order #${order.shopify_order_number}`);
        console.log(`    Status: ${order.confirmation_status}`);
        console.log(`    Reminder sent: ${order.reminder_sent ? 'Yes' : 'No'}`);
        console.log(`    Customer response: ${order.customer_response || 'None'}`);
        console.log();
      });
    }
    
    // 3. Check backend server
    console.log('📋 Step 3: Checking backend server...');
    
    try {
      const response = await fetch('http://localhost:3001/health');
      if (response.ok) {
        console.log('✅ Backend server is running');
      } else {
        console.log('⚠️  Backend server returned error:', response.status);
      }
    } catch (error) {
      console.log('❌ Backend server is not running');
      console.log('   Start it with: cd server && node webhook-server-simple.js');
    }
    console.log();
    
    // 4. Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 System Status Summary');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Database: Ready');
    console.log('✅ Columns: All present');
    console.log('✅ Brand settings:', brand.existing_customer_message ? 'Configured' : 'Using defaults');
    console.log();
    console.log('🎯 Next steps:');
    console.log('1. Make sure backend is running: cd server && node webhook-server-simple.js');
    console.log('2. Make sure cron is running: cd server && node cron-reminder.js');
    console.log('3. Make sure ngrok is running: ngrok http 3001');
    console.log('4. Create a test order in Shopify');
    console.log('5. Check WhatsApp for message with buttons');
    console.log();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testSystem();
