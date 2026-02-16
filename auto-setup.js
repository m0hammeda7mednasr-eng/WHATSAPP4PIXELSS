// إعداد تلقائي كامل
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const { Client } = pg;

// استخدم service_role key للـ admin access
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// استخرج الـ connection string من الـ URL
const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];
const connectionString = `postgresql://postgres.${projectRef}:YOUR_PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`;

async function autoSetup() {
  console.log('🚀 Starting automatic setup...\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    // 1. تحقق من الـ brands الموجودة
    console.log('📊 Step 1: Checking existing brands...');
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('*');

    if (brandsError) {
      console.error('❌ Error reading brands:', brandsError);
      console.log('\n⚠️  RLS policies might be blocking access.');
      console.log('📋 Please run this SQL in Supabase SQL Editor:\n');
      printSQLSetup();
      return;
    }

    if (!brands || brands.length === 0) {
      console.log('⚠️  No brands found. Please run the SQL setup first.');
      console.log('\n📋 Copy and run this SQL in Supabase SQL Editor:\n');
      printSQLSetup();
      return;
    }

    console.log(`✅ Found ${brands.length} brand(s):`);
    brands.forEach((b, i) => {
      console.log(`   ${i + 1}. ${b.name} (ID: ${b.id})`);
    });

    const brand = brands[0];

    // 2. إنشاء contact تجريبي
    console.log('\n📊 Step 2: Creating test contact...');
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .upsert({
        brand_id: brand.id,
        wa_id: '201234567890',
        name: 'Test Contact - ' + new Date().toLocaleTimeString(),
        last_message_at: new Date().toISOString()
      }, {
        onConflict: 'brand_id,wa_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (contactError) {
      console.error('❌ Error creating contact:', contactError);
      return;
    }

    console.log('✅ Contact created:', contact.name);
    console.log('   ID:', contact.id);
    console.log('   Phone:', contact.wa_id);

    // 3. إنشاء رسالة تجريبية
    console.log('\n📊 Step 3: Creating test message...');
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        contact_id: contact.id,
        brand_id: brand.id,
        direction: 'inbound',
        message_type: 'text',
        body: 'مرحباً! هذه رسالة تجريبية من الإعداد التلقائي 🚀',
        status: 'delivered'
      })
      .select()
      .single();

    if (messageError) {
      console.error('❌ Error creating message:', messageError);
      return;
    }

    console.log('✅ Message created');

    // 4. الملخص النهائي
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Setup completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📋 What was created:');
    console.log('   ✅ Brand:', brand.name);
    console.log('   ✅ Contact:', contact.name);
    console.log('   ✅ Test message');
    console.log('\n🌐 Next steps:');
    console.log('   1. Open: http://localhost:5177');
    console.log('   2. Login with your account');
    console.log('   3. Select brand:', brand.name);
    console.log('   4. You should see:', contact.name);
    console.log('   5. Click and try sending a message!');
    console.log('\n💡 To send real WhatsApp messages:');
    console.log('   1. Go to Supabase Dashboard → Table Editor → brands');
    console.log('   2. Update whatsapp_token with your Meta token');
    console.log('   3. Update phone_number_id with your Meta phone ID');
    console.log('   4. Setup ngrok: ngrok http 3001');
    console.log('   5. Register webhook URL in Meta Developer Console');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
  }
}

function printSQLSetup() {
  console.log(`
-- ============================================
-- إعداد كامل للـ Database
-- ============================================

-- 1. إضافة whatsapp_token column
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS whatsapp_token TEXT;

-- 2. RLS Policies للـ anon key
DROP POLICY IF EXISTS "Allow anon to read brands" ON brands;
DROP POLICY IF EXISTS "Allow anon to read contacts" ON contacts;
DROP POLICY IF EXISTS "Allow anon to insert contacts" ON contacts;
DROP POLICY IF EXISTS "Allow anon to update contacts" ON contacts;
DROP POLICY IF EXISTS "Allow anon to read messages" ON messages;
DROP POLICY IF EXISTS "Allow anon to insert messages" ON messages;
DROP POLICY IF EXISTS "Allow anon to update messages" ON messages;

CREATE POLICY "Allow anon to read brands"
  ON brands FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon to read contacts"
  ON contacts FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon to insert contacts"
  ON contacts FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon to update contacts"
  ON contacts FOR UPDATE TO anon USING (true);

CREATE POLICY "Allow anon to read messages"
  ON messages FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon to insert messages"
  ON messages FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon to update messages"
  ON messages FOR UPDATE TO anon USING (true);

-- 3. تحديث الـ brands بـ token تجريبي
UPDATE brands 
SET whatsapp_token = 'your_token_here'
WHERE whatsapp_token IS NULL;
  `);
}

autoSetup();
