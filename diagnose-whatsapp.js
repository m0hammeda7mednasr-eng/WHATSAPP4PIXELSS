// Diagnose WhatsApp Message Sending Issues
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('\n🔍 Diagnosing WhatsApp Setup...\n');
console.log('='.repeat(60));

// Check 1: Environment Variables
console.log('\n1️⃣ Checking Environment Variables...\n');

const requiredVars = {
  'VITE_SUPABASE_URL': process.env.VITE_SUPABASE_URL,
  'VITE_SUPABASE_ANON_KEY': process.env.VITE_SUPABASE_ANON_KEY
};

let hasAllVars = true;
for (const [key, value] of Object.entries(requiredVars)) {
  if (value) {
    console.log(`✅ ${key}: ${value.substring(0, 30)}...`);
  } else {
    console.log(`❌ ${key}: MISSING!`);
    hasAllVars = false;
  }
}

if (!hasAllVars) {
  console.log('\n⚠️  Missing environment variables! Check your .env file.\n');
  process.exit(1);
}

// Check 2: Database Connection
console.log('\n2️⃣ Checking Database Connection...\n');

try {
  const { data: brands, error } = await supabase
    .from('brands')
    .select('id, name, whatsapp_token, phone_number_id')
    .limit(5);

  if (error) {
    console.log('❌ Database connection failed:', error.message);
    process.exit(1);
  }

  if (!brands || brands.length === 0) {
    console.log('❌ No brands found in database!');
    console.log('\nYou need to create a brand first.');
    console.log('Run: node create-test-brand.js\n');
    process.exit(1);
  }

  console.log(`✅ Found ${brands.length} brand(s):\n`);
  
  for (const brand of brands) {
    console.log(`   Brand: ${brand.name}`);
    console.log(`   ID: ${brand.id}`);
    console.log(`   Token: ${brand.whatsapp_token ? brand.whatsapp_token.substring(0, 20) + '...' : '❌ MISSING'}`);
    console.log(`   Phone Number ID: ${brand.phone_number_id || '❌ MISSING'}`);
    console.log('');
  }

  // Check 3: WhatsApp API Configuration
  console.log('3️⃣ Checking WhatsApp API Configuration...\n');

  const testBrand = brands[0];
  
  if (!testBrand.whatsapp_token) {
    console.log('❌ WhatsApp Token is missing!');
    console.log('\nAdd it in Settings → Profile → WhatsApp Token\n');
    process.exit(1);
  }

  if (!testBrand.phone_number_id) {
    console.log('❌ Phone Number ID is missing!');
    console.log('\nAdd it in Settings → Profile → Phone Number ID\n');
    process.exit(1);
  }

  console.log('✅ WhatsApp Token: Present');
  console.log('✅ Phone Number ID: Present');

  // Check 4: Test WhatsApp API
  console.log('\n4️⃣ Testing WhatsApp API Connection...\n');

  const testUrl = `https://graph.facebook.com/v21.0/${testBrand.phone_number_id}`;
  
  try {
    const response = await fetch(testUrl, {
      headers: {
        'Authorization': `Bearer ${testBrand.whatsapp_token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ WhatsApp API Connection: SUCCESS');
      console.log(`   Phone Number: ${data.display_phone_number || 'N/A'}`);
      console.log(`   Verified: ${data.verified_name || 'N/A'}`);
    } else {
      const error = await response.json();
      console.log('❌ WhatsApp API Connection: FAILED');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${error.error?.message || 'Unknown error'}`);
      
      if (response.status === 401) {
        console.log('\n⚠️  Token is invalid or expired!');
        console.log('Get a new token from Meta Developer Console.\n');
      }
      
      if (response.status === 404) {
        console.log('\n⚠️  Phone Number ID is incorrect!');
        console.log('Check your Phone Number ID in Meta Developer Console.\n');
      }
    }
  } catch (err) {
    console.log('❌ Network Error:', err.message);
  }

  // Check 5: Test Sending Message
  console.log('\n5️⃣ Testing Message Sending...\n');
  console.log('⚠️  To test sending, you need a valid recipient number.');
  console.log('The number must:');
  console.log('   - Be in E.164 format (e.g., 201234567890)');
  console.log('   - Have started a conversation with your business');
  console.log('   - OR use a Template Message for first contact\n');

  // Check 6: Check Contacts
  console.log('6️⃣ Checking Contacts...\n');

  const { data: contacts, error: contactsError } = await supabase
    .from('contacts')
    .select('id, name, wa_id, brand_id')
    .eq('brand_id', testBrand.id)
    .limit(5);

  if (contactsError) {
    console.log('❌ Error fetching contacts:', contactsError.message);
  } else if (!contacts || contacts.length === 0) {
    console.log('⚠️  No contacts found for this brand.');
    console.log('Add a contact first before sending messages.\n');
  } else {
    console.log(`✅ Found ${contacts.length} contact(s):\n`);
    for (const contact of contacts) {
      console.log(`   ${contact.name} (${contact.wa_id})`);
    }
    console.log('');
  }

  // Summary
  console.log('='.repeat(60));
  console.log('\n📊 Diagnosis Summary:\n');
  
  const issues = [];
  
  if (!testBrand.whatsapp_token) issues.push('Missing WhatsApp Token');
  if (!testBrand.phone_number_id) issues.push('Missing Phone Number ID');
  if (!contacts || contacts.length === 0) issues.push('No contacts available');
  
  if (issues.length === 0) {
    console.log('✅ Everything looks good!');
    console.log('\nIf messages still not sending, check:');
    console.log('1. Recipient number format (must be E.164)');
    console.log('2. Recipient has started conversation first');
    console.log('3. WhatsApp Business Account is not restricted');
    console.log('4. Message template is approved (for first contact)');
    console.log('\nTry sending a test message:');
    console.log('   node test-send-message.js\n');
  } else {
    console.log('❌ Issues found:\n');
    issues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
    console.log('\nFix these issues and try again.\n');
  }

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
