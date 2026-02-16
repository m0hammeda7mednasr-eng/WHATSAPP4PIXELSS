// Fix RLS Policies Automatically
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.log('\n❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env file!\n');
  console.log('You need the Service Role Key (not anon key) to modify RLS policies.\n');
  console.log('📝 Get it from Supabase Dashboard:');
  console.log('   Settings → API → service_role key (secret)\n');
  console.log('Add to .env:');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key\n');
  console.log('⚠️  OR run the SQL manually in Supabase SQL Editor:\n');
  console.log('Copy the content of: fix-shopify-rls.sql\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLS() {
  console.log('\n🔧 Fixing RLS Policies...\n');

  try {
    // Drop existing policies
    console.log('1️⃣ Dropping old policies...');
    
    const dropPolicies = `
      DROP POLICY IF EXISTS "Authenticated users can view shopify connections" ON shopify_connections;
      DROP POLICY IF EXISTS "Authenticated users can insert shopify connections" ON shopify_connections;
      DROP POLICY IF EXISTS "Authenticated users can update shopify connections" ON shopify_connections;
      DROP POLICY IF EXISTS "Authenticated users can view shopify orders" ON shopify_orders;
      DROP POLICY IF EXISTS "Authenticated users can insert shopify orders" ON shopify_orders;
      DROP POLICY IF EXISTS "Authenticated users can update shopify orders" ON shopify_orders;
      DROP POLICY IF EXISTS "Authenticated users can view webhook logs" ON shopify_webhook_logs;
      DROP POLICY IF EXISTS "Authenticated users can insert webhook logs" ON shopify_webhook_logs;
    `;

    const { error: dropError } = await supabase.rpc('exec_sql', { sql: dropPolicies });
    if (dropError) {
      console.log('⚠️  Could not drop policies (they might not exist)');
    } else {
      console.log('✅ Old policies dropped');
    }

    // Create new policies
    console.log('\n2️⃣ Creating new policies...');
    
    const createPolicies = `
      CREATE POLICY "Allow all access to shopify connections"
        ON shopify_connections FOR ALL
        USING (true) WITH CHECK (true);

      CREATE POLICY "Allow all access to shopify orders"
        ON shopify_orders FOR ALL
        USING (true) WITH CHECK (true);

      CREATE POLICY "Allow all access to webhook logs"
        ON shopify_webhook_logs FOR ALL
        USING (true) WITH CHECK (true);
    `;

    const { error: createError } = await supabase.rpc('exec_sql', { sql: createPolicies });
    if (createError) {
      console.log('❌ Error creating policies:', createError.message);
      console.log('\n⚠️  Please run the SQL manually in Supabase SQL Editor:');
      console.log('Copy the content of: fix-shopify-rls.sql\n');
      process.exit(1);
    }

    console.log('✅ New policies created');
    console.log('\n🎉 RLS Policies fixed successfully!\n');
    console.log('Now you can try Shopify OAuth again.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  Please run the SQL manually in Supabase SQL Editor:');
    console.log('Copy the content of: fix-shopify-rls.sql\n');
    process.exit(1);
  }
}

fixRLS();
