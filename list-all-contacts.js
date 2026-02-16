// عرض كل الـ contacts الموجودة
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function listAllContacts() {
  console.log('📋 Listing all contacts...\n');

  const { data: contacts, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!contacts || contacts.length === 0) {
    console.log('⚠️  No contacts found in database!');
    console.log('\n💡 This means:');
    console.log('   1. RLS policies might be blocking access');
    console.log('   2. Or no contacts have been created yet');
    console.log('\n🔧 Try running the SQL policies first, then create a contact from the UI');
    return;
  }

  console.log(`✅ Found ${contacts.length} contacts:\n`);
  
  contacts.forEach((contact, index) => {
    console.log(`${index + 1}. ${contact.name}`);
    console.log(`   ID: ${contact.id}`);
    console.log(`   Phone: ${contact.wa_id}`);
    console.log(`   Brand ID: ${contact.brand_id}`);
    console.log(`   Created: ${new Date(contact.created_at).toLocaleString()}`);
    console.log('');
  });

  // جيب الـ brands كمان
  const { data: brands } = await supabase
    .from('brands')
    .select('*');

  if (brands && brands.length > 0) {
    console.log(`\n📊 Found ${brands.length} brands:\n`);
    brands.forEach((brand, index) => {
      console.log(`${index + 1}. ${brand.name}`);
      console.log(`   ID: ${brand.id}`);
      console.log(`   Phone Number ID: ${brand.phone_number_id}`);
      console.log('');
    });
  } else {
    console.log('\n⚠️  No brands found!');
  }
}

listAllContacts();
