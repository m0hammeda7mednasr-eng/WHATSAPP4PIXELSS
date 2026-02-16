// Quick Token Update
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const NEW_TOKEN = 'EAAeHYHIoasIBQlUTGXZABklDKNZAjJTHbHtgAf7UYx7VMMsRwzdXjKV28UlVetI3jnj1rbbSQoPsZCnPNyUkkvfbJipU4gfoqQZBAMBTvmTq2M8hiM0MwuZC0iZAl2TAEQ0qgfyNw42OJOdZAJCVaIMtrHggikdlKRXk7u3LoQbX8UHfZC476XMTfDn64tTn2d1bEVKp77idWdAh1JJVjY7pf8CLvISIFCeeOgwIiXgIybl5p8C9ksTheUVcjZCN8H9vKUi1dTJZBs8BuimFLAI28E';
const BRAND_ID = 'd1678581-bc57-4d01-9f35-b0bdc4edcd77'; // 4 Pixels

async function updateAndTest() {
  console.log('\n🔧 Updating Token for 4 Pixels...\n');

  // Update token
  const { error } = await supabase
    .from('brands')
    .update({
      whatsapp_token: NEW_TOKEN,
      updated_at: new Date().toISOString()
    })
    .eq('id', BRAND_ID);

  if (error) {
    console.log('❌ Update failed:', error.message);
    return;
  }

  console.log('✅ Token updated in database!\n');

  // Get brand info
  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('id', BRAND_ID)
    .single();

  if (!brand) {
    console.log('❌ Brand not found!');
    return;
  }

  console.log('📋 Brand Info:');
  console.log(`   Name: ${brand.name}`);
  console.log(`   Phone Number ID: ${brand.phone_number_id}`);
  console.log(`   Token: ${brand.whatsapp_token.substring(0, 30)}...`);
  console.log('');

  // Test token
  console.log('🧪 Testing WhatsApp API...\n');

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${brand.phone_number_id}`,
      {
        headers: {
          'Authorization': `Bearer ${NEW_TOKEN}`
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Token is VALID!');
      console.log(`   Phone: ${data.display_phone_number || 'N/A'}`);
      console.log(`   Verified Name: ${data.verified_name || 'N/A'}`);
      console.log(`   Quality Rating: ${data.quality_rating || 'N/A'}`);
      console.log('\n🎉 You can now send messages!\n');
      
      // Test sending capability
      console.log('📝 To send a test message:');
      console.log('   1. Add your phone number in Meta Developer Console');
      console.log('   2. Or have a customer message you first');
      console.log('   3. Then use the Dashboard to reply\n');
      
    } else {
      const error = await response.json();
      console.log('❌ Token test FAILED!');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${error.error?.message || 'Unknown'}`);
      
      if (response.status === 190) {
        console.log('\n⚠️  Token is invalid or expired!');
        console.log('   Get a new token from Meta Developer Console.\n');
      }
    }
  } catch (err) {
    console.log('❌ Network error:', err.message);
  }
}

updateAndTest();
