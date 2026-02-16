// إعداد كامل للـ database
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function setupComplete() {
  console.log('🚀 Starting complete setup...\n');

  try {
    // 1. إنشاء brand
    console.log('📊 Step 1: Creating brand...');
    const { data: existingBrands } = await supabase
      .from('brands')
      .select('*')
      .limit(1);

    let brand;
    if (existingBrands && existingBrands.length > 0) {
      brand = existingBrands[0];
      console.log('✅ Brand already exists:', brand.name);
    } else {
      const { data: newBrand, error: brandError } = await supabase
        .from('brands')
        .insert({
          name: 'My WhatsApp Business',
          phone_number_id: '123456789',
          display_phone_number: '+201234567890',
          whatsapp_token: 'your_token_here'
        })
        .select()
        .single();

      if (brandError) {
        console.error('❌ Error creating brand:', brandError);
        console.log('\n⚠️  You need to run the SQL policies first!');
        console.log('📋 Copy this SQL and run it in Supabase SQL Editor:\n');
        console.log(getSQLPolicies());
        return;
      }

      brand = newBrand;
      console.log('✅ Brand created:', brand.name);
    }

    console.log('   Brand ID:', brand.id);
    console.log('   Phone Number ID:', brand.phone_number_id);

    // 2. إنشاء contact تجريبي
    console.log('\n📊 Step 2: Creating test contact...');
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .upsert({
        brand_id: brand.id,
        wa_id: '201234567890',
        name: 'Test Contact',
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
    console.log('   Contact ID:', contact.id);
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
        body: 'مرحباً! هذه رسالة تجريبية',
        status: 'delivered'
      })
      .select()
      .single();

    if (messageError) {
      console.error('❌ Error creating message:', messageError);
      return;
    }

    console.log('✅ Message created:', message.body);

    // 4. عرض الملخص
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Setup completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📋 Summary:');
    console.log('   ✅ Brand:', brand.name);
    console.log('   ✅ Contact:', contact.name, '(' + contact.wa_id + ')');
    console.log('   ✅ Message: 1 test message');
    console.log('\n🌐 Next steps:');
    console.log('   1. Open: http://localhost:5177');
    console.log('   2. Login with your account');
    console.log('   3. You should see the test contact');
    console.log('   4. Click on it and try sending a message');
    console.log('\n💡 To send real WhatsApp messages:');
    console.log('   1. Update brand.whatsapp_token in Supabase');
    console.log('   2. Update brand.phone_number_id with your Meta phone ID');
    console.log('   3. Setup ngrok and register webhook with Meta');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
  }
}

function getSQLPolicies() {
  return `
-- إصلاح RLS Policies
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
`;
}

setupComplete();
