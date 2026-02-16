// فحص الـ contact
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkContact() {
  const contact_id = '9fd59324-5eeb-44e5-9068-e3850e9f1838';
  const brand_id = 'd1678581-bc57-4d01-9f35-b0bdc4edcd77';

  console.log('🔍 Checking contact...');
  console.log('Contact ID:', contact_id);
  console.log('Brand ID:', brand_id);

  // 1. جيب الـ contact بدون filter على brand_id
  const { data: allContacts, error: allError } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', contact_id);

  console.log('\n📊 All contacts with this ID:');
  console.log('Count:', allContacts?.length || 0);
  if (allContacts && allContacts.length > 0) {
    allContacts.forEach(c => {
      console.log('  - ID:', c.id);
      console.log('    Brand ID:', c.brand_id);
      console.log('    Name:', c.name);
      console.log('    Phone:', c.wa_id);
      console.log('');
    });
  }

  // 2. جيب الـ contact مع filter على brand_id
  const { data: filteredContacts, error: filteredError } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', contact_id)
    .eq('brand_id', brand_id);

  console.log('📊 Contacts with this ID and Brand ID:');
  console.log('Count:', filteredContacts?.length || 0);
  if (filteredContacts && filteredContacts.length > 0) {
    filteredContacts.forEach(c => {
      console.log('  - ID:', c.id);
      console.log('    Brand ID:', c.brand_id);
      console.log('    Name:', c.name);
      console.log('    Phone:', c.wa_id);
    });
  }

  if (filteredError) {
    console.error('\n❌ Error:', filteredError);
  }

  // 3. جيب كل الـ brands
  const { data: brands } = await supabase
    .from('brands')
    .select('id, name');

  console.log('\n📊 Available brands:');
  brands?.forEach(b => {
    console.log('  - ID:', b.id);
    console.log('    Name:', b.name);
    console.log('');
  });
}

checkContact();
