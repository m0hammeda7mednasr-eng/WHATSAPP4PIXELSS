// Update WhatsApp Token Directly in Database
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function updateToken() {
  console.log('\n🔧 Update WhatsApp Token\n');
  console.log('='.repeat(60));

  // Get all brands
  const { data: brands, error } = await supabase
    .from('brands')
    .select('id, name, whatsapp_token, phone_number_id');

  if (error || !brands || brands.length === 0) {
    console.log('❌ No brands found!');
    rl.close();
    return;
  }

  console.log('\n📋 Available Brands:\n');
  brands.forEach((brand, index) => {
    console.log(`${index + 1}. ${brand.name}`);
    console.log(`   ID: ${brand.id}`);
    console.log(`   Current Token: ${brand.whatsapp_token ? brand.whatsapp_token.substring(0, 20) + '...' : 'Not set'}`);
    console.log(`   Phone Number ID: ${brand.phone_number_id || 'Not set'}`);
    console.log('');
  });

  // Select brand
  const brandIndex = await question('Select brand number (1, 2, etc.): ');
  const selectedBrand = brands[parseInt(brandIndex) - 1];

  if (!selectedBrand) {
    console.log('❌ Invalid selection!');
    rl.close();
    return;
  }

  console.log(`\n✅ Selected: ${selectedBrand.name}\n`);

  // Get new token
  console.log('📝 Enter your new WhatsApp Token:');
  console.log('   (Get it from: https://developers.facebook.com)');
  console.log('   (Should start with: EAA)\n');
  
  const newToken = await question('Token: ');

  if (!newToken || !newToken.startsWith('EAA')) {
    console.log('❌ Invalid token! Must start with EAA');
    rl.close();
    return;
  }

  // Optionally update Phone Number ID
  console.log('\n📝 Update Phone Number ID? (press Enter to skip)');
  const newPhoneId = await question('Phone Number ID: ');

  // Update database
  console.log('\n💾 Updating database...');

  const updateData = {
    whatsapp_token: newToken,
    updated_at: new Date().toISOString()
  };

  if (newPhoneId && newPhoneId.trim()) {
    updateData.phone_number_id = newPhoneId.trim();
  }

  const { error: updateError } = await supabase
    .from('brands')
    .update(updateData)
    .eq('id', selectedBrand.id);

  if (updateError) {
    console.log('❌ Update failed:', updateError.message);
    rl.close();
    return;
  }

  console.log('\n✅ Token updated successfully!\n');

  // Test the new token
  console.log('🧪 Testing new token...\n');

  const phoneId = newPhoneId || selectedBrand.phone_number_id;
  
  if (!phoneId) {
    console.log('⚠️  No Phone Number ID to test with.');
    console.log('Add Phone Number ID in Settings to enable testing.\n');
    rl.close();
    return;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${phoneId}`,
      {
        headers: {
          'Authorization': `Bearer ${newToken}`
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Token is valid!');
      console.log(`   Phone: ${data.display_phone_number || 'N/A'}`);
      console.log(`   Verified: ${data.verified_name || 'N/A'}`);
      console.log('\n🎉 You can now send messages!\n');
    } else {
      const error = await response.json();
      console.log('❌ Token test failed!');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${error.error?.message || 'Unknown'}`);
      console.log('\n⚠️  Token was saved but may not be valid.\n');
    }
  } catch (err) {
    console.log('❌ Network error:', err.message);
  }

  rl.close();
}

updateToken();
