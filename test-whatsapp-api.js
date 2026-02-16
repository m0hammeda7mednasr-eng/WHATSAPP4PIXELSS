// اختبار WhatsApp API مباشرة
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testWhatsAppAPI() {
  console.log('🧪 Testing WhatsApp API Configuration...\n');

  // 1. جيب الـ brand من database
  const { data: brands, error } = await supabase
    .from('brands')
    .select('*')
    .limit(1);

  if (error || !brands || brands.length === 0) {
    console.error('❌ No brands found');
    return;
  }

  const brand = brands[0];
  console.log('📊 Brand Information:');
  console.log('   Name:', brand.name);
  console.log('   Phone Number ID:', brand.phone_number_id);
  console.log('   Token:', brand.whatsapp_token ? brand.whatsapp_token.substring(0, 20) + '...' : 'Not set');
  console.log('');

  // 2. Validation
  console.log('🔍 Validation:');
  
  if (!brand.whatsapp_token) {
    console.log('   ❌ Token: Not configured');
    return;
  }
  
  if (!brand.whatsapp_token.startsWith('EAA')) {
    console.log('   ❌ Token: Invalid format (should start with EAA)');
    console.log('   Current:', brand.whatsapp_token.substring(0, 10));
    return;
  }
  console.log('   ✅ Token: Valid format');

  if (!brand.phone_number_id) {
    console.log('   ❌ Phone Number ID: Not configured');
    return;
  }

  if (brand.phone_number_id.length < 10) {
    console.log('   ❌ Phone Number ID: Too short');
    console.log('   Current length:', brand.phone_number_id.length);
    console.log('   Expected: ~15 digits');
    return;
  }
  console.log('   ✅ Phone Number ID: Valid length');

  // 3. اختبر الـ API
  console.log('\n📤 Testing WhatsApp API...');
  console.log('   Endpoint:', `https://graph.facebook.com/v18.0/${brand.phone_number_id}/messages`);
  
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${brand.phone_number_id}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${brand.whatsapp_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: '201234567890', // رقم تجريبي
          type: 'text',
          text: { body: 'Test message from API' }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.log('\n❌ API Error:');
      console.log('   Status:', response.status);
      console.log('   Error:', JSON.stringify(data, null, 2));
      
      if (data.error) {
        console.log('\n💡 Error Analysis:');
        
        if (data.error.message.includes('does not exist')) {
          console.log('   ❌ Phone Number ID is WRONG!');
          console.log('   The ID you provided:', brand.phone_number_id);
          console.log('   This is NOT a valid Phone Number ID.');
          console.log('');
          console.log('   📍 How to find the correct Phone Number ID:');
          console.log('   1. Go to: https://developers.facebook.com/apps');
          console.log('   2. Select your App');
          console.log('   3. Click: WhatsApp → API Setup');
          console.log('   4. Look for: "Send and receive messages" section');
          console.log('   5. Find: "Phone number ID" (next to your phone number)');
          console.log('   6. It should be a LONG number (~15 digits)');
          console.log('');
          console.log('   Example:');
          console.log('   ✗ Wrong: 1428083912314027 (App ID)');
          console.log('   ✗ Wrong: 2119173138836162 (Business ID)');
          console.log('   ✓ Correct: 106540529340398 (Phone Number ID)');
        } else if (data.error.message.includes('Invalid OAuth')) {
          console.log('   ❌ Token is INVALID or EXPIRED!');
          console.log('   Get a new token from Meta Developer Console');
        } else if (data.error.message.includes('permissions')) {
          console.log('   ❌ Token does not have permissions!');
          console.log('   Make sure the token has whatsapp_business_messaging permission');
        }
      }
    } else {
      console.log('\n✅ SUCCESS!');
      console.log('   Message ID:', data.messages?.[0]?.id);
      console.log('   WhatsApp API is working correctly! 🎉');
    }

  } catch (error) {
    console.error('\n❌ Network Error:', error.message);
  }
}

testWhatsAppAPI();
