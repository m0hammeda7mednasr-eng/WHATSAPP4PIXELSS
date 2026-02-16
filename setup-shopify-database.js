// Setup Shopify Database Tables
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function setupDatabase() {
  console.log('🔧 Setting up Shopify database tables...\n');

  try {
    // Check if tables exist
    const { data: tables, error } = await supabase
      .from('shopify_connections')
      .select('id')
      .limit(1);

    if (error && error.code === '42P01') {
      console.log('❌ Tables not found!');
      console.log('');
      console.log('📋 Please run this SQL in Supabase SQL Editor:');
      console.log('');
      console.log('1. Go to: https://supabase.com/dashboard');
      console.log('2. Select your project');
      console.log('3. Go to SQL Editor');
      console.log('4. Copy content from: database-shopify-integration.sql');
      console.log('5. Run it');
      console.log('');
      return;
    }

    console.log('✅ Tables exist!');
    console.log('');

    // Get brands
    const { data: brands } = await supabase
      .from('brands')
      .select('id, name, phone_number_id');

    if (!brands || brands.length === 0) {
      console.log('❌ No brands found!');
      console.log('Please create a brand first.');
      return;
    }

    console.log('📋 Available Brands:');
    brands.forEach((brand, i) => {
      console.log(`${i + 1}. ${brand.name} (${brand.id})`);
    });
    console.log('');

    // Check Shopify connections
    const { data: connections } = await supabase
      .from('shopify_connections')
      .select('*');

    if (!connections || connections.length === 0) {
      console.log('⚠️  No Shopify connections found!');
      console.log('');
      console.log('To add a connection, run this SQL:');
      console.log('');
      console.log(`INSERT INTO shopify_connections (
  brand_id,
  shop_url,
  access_token,
  is_active
) VALUES (
  '${brands[0].id}',
  'your-store.myshopify.com',
  'shpat_xxxxxxxxxxxxx',
  true
);`);
      console.log('');
    } else {
      console.log('✅ Shopify Connections:');
      connections.forEach(conn => {
        console.log(`   - ${conn.shop_url} (${conn.is_active ? 'Active' : 'Inactive'})`);
      });
      console.log('');
    }

    console.log('✅ Database setup complete!');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('1. Start backend: npm run webhook');
    console.log('2. Start frontend: npm run dev');
    console.log('3. Test: node test-shopify-order-confirmation.js');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setupDatabase();
