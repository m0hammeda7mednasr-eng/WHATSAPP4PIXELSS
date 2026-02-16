// Send Test WhatsApp Message
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// ⚠️ غير الرقم ده برقمك (لازم يكون مضاف في Test Numbers)
const TEST_PHONE = '201288429700'; // رقمك بدون + أو مسافات

async function sendTestMessage() {
  console.log('\n📤 Sending Test WhatsApp Message...\n');

  // Get brand info
  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('name', '4 Pixels')
    .single();

  if (!brand) {
    console.log('❌ Brand not found!');
    return;
  }

  console.log('📋 Using Brand: ' + brand.name);
  console.log('📞 Phone Number ID: ' + brand.phone_number_id);
  console.log('📱 Sending to: +' + TEST_PHONE);
  console.log('');

  // Send message
  const url = `https://graph.facebook.com/v21.0/${brand.phone_number_id}/messages`;
  
  const payload = {
    messaging_product: 'whatsapp',
    to: TEST_PHONE,
    type: 'text',
    text: {
      body: '🎉 مرحباً! هذه رسالة تجريبية من WhatsApp CRM.\n\nالنظام يعمل بنجاح! ✅'
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${brand.whatsapp_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Message sent successfully!');
      console.log('📨 Message ID:', data.messages[0].id);
      console.log('');
      console.log('🎉 Check your WhatsApp now!');
      console.log('');
    } else {
      console.log('❌ Failed to send message!');
      console.log('Status:', response.status);
      console.log('Error:', data.error?.message || 'Unknown error');
      console.log('');
      
      if (data.error?.code === 131026) {
        console.log('⚠️  Recipient phone number not in allowed list!');
        console.log('');
        console.log('📝 To fix this:');
        console.log('1. Go to: https://developers.facebook.com');
        console.log('2. Select your app');
        console.log('3. WhatsApp → API Setup');
        console.log('4. Under "To" field → Manage phone number list');
        console.log('5. Add your phone number: ' + TEST_PHONE);
        console.log('6. Verify with the code sent to WhatsApp');
        console.log('7. Try again!');
        console.log('');
      }
      
      if (data.error?.code === 131047) {
        console.log('⚠️  Re-engagement message required!');
        console.log('');
        console.log('This means:');
        console.log('- The recipient hasn\'t messaged you in 24+ hours');
        console.log('- You need to use a Template Message');
        console.log('- OR wait for them to message you first');
        console.log('');
      }

      if (data.error?.code === 190) {
        console.log('⚠️  Token is invalid or expired!');
        console.log('Get a new token from Meta Developer Console.');
        console.log('');
      }
    }
  } catch (err) {
    console.log('❌ Network error:', err.message);
  }
}

sendTestMessage();
