// إنشاء brand تجريبي
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function createTestBrand() {
  console.log('🏢 Creating test brand...\n');

  const brandData = {
    name: 'Test Brand',
    phone_number_id: '123456789', // غيّر ده لـ phone_number_id الحقيقي من Meta
    display_phone_number: '+201234567890',
    whatsapp_token: 'your_whatsapp_token_here' // غيّر ده للـ token الحقيقي
  };

  console.log('📝 Brand data:', brandData);

  const { data: brand, error } = await supabase
    .from('brands')
    .insert(brandData)
    .select()
    .single();

  if (error) {
    console.error('\n❌ Error creating brand:', error);
    console.log('\n💡 Make sure:');
    console.log('   1. The brands table exists');
    console.log('   2. RLS policies allow anon to insert');
    console.log('   3. Run the SQL policies first');
    return;
  }

  console.log('\n✅ Brand created successfully!');
  console.log('   ID:', brand.id);
  console.log('   Name:', brand.name);
  console.log('   Phone Number ID:', brand.phone_number_id);

  console.log('\n🎉 Now you can create contacts and send messages!');
}

createTestBrand();
