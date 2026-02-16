// اختبار إنشاء contact جديد
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testContactCreation() {
  console.log('🧪 Testing contact creation...\n');

  // 1. جيب أول brand
  const { data: brands, error: brandError } = await supabase
    .from('brands')
    .select('*')
    .limit(1);

  if (brandError || !brands || brands.length === 0) {
    console.error('❌ No brands found. Please create a brand first.');
    return;
  }

  const brand = brands[0];
  console.log('✅ Using brand:', brand.name, '(ID:', brand.id, ')');

  // 2. إنشاء contact جديد
  const testPhone = '201234567890'; // رقم تجريبي
  const testName = 'Test Contact ' + Date.now();

  console.log('\n📝 Creating contact...');
  console.log('   Phone:', testPhone);
  console.log('   Name:', testName);
  console.log('   Brand ID:', brand.id);

  const { data: contact, error: contactError } = await supabase
    .from('contacts')
    .upsert({
      brand_id: brand.id,
      wa_id: testPhone,
      name: testName,
      last_message_at: new Date().toISOString()
    }, {
      onConflict: 'brand_id,wa_id',
      ignoreDuplicates: false
    })
    .select()
    .single();

  if (contactError) {
    console.error('\n❌ Error creating contact:', contactError);
    return;
  }

  console.log('\n✅ Contact created successfully!');
  console.log('   ID:', contact.id);
  console.log('   Name:', contact.name);
  console.log('   Phone:', contact.wa_id);
  console.log('   Brand ID:', contact.brand_id);

  // 3. تأكد إن الـ contact موجود
  console.log('\n🔍 Verifying contact...');
  const { data: verifyContact, error: verifyError } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', contact.id)
    .eq('brand_id', brand.id)
    .single();

  if (verifyError) {
    console.error('❌ Verification failed:', verifyError);
    return;
  }

  console.log('✅ Contact verified!');
  console.log('   Full data:', verifyContact);

  console.log('\n🎉 Test completed successfully!');
  console.log('💡 You can now try sending a message to this contact in the UI');
}

testContactCreation();
