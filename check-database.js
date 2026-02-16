import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rmpgofswkpjxionzythf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('🔍 Checking database...\n');
console.log('URL:', SUPABASE_URL);

async function check() {
  // Check brands
  const { data: brands, error: brandsError } = await supabase
    .from('brands')
    .select('*');
  
  console.log('\n📊 Brands:');
  if (brandsError) {
    console.log('❌ Error:', brandsError.message);
  } else {
    console.log(`✅ Found ${brands.length} brands`);
    brands.forEach(b => console.log(`   - ${b.name} (${b.phone_number_id})`));
  }

  // Check contacts
  const { data: contacts, error: contactsError } = await supabase
    .from('contacts')
    .select('*');
  
  console.log('\n📊 Contacts:');
  if (contactsError) {
    console.log('❌ Error:', contactsError.message);
  } else {
    console.log(`✅ Found ${contacts.length} contacts`);
  }

  // Check messages
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('*');
  
  console.log('\n📊 Messages:');
  if (messagesError) {
    console.log('❌ Error:', messagesError.message);
  } else {
    console.log(`✅ Found ${messages.length} messages`);
  }

  // Check users
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*');
  
  console.log('\n📊 Users:');
  if (usersError) {
    console.log('❌ Error:', usersError.message);
  } else {
    console.log(`✅ Found ${users.length} users`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Check complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

check();
