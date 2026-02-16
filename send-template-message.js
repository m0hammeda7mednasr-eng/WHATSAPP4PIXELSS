// Send Template Message (First Contact)
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// ⚠️ غير الرقم ده برقم العميل
const CUSTOMER_PHONE = '201234567890'; // رقم العميل بدون + أو مسافات

async function sendTemplateMessage() {
  console.log('\n📤 Sending Template Message (First Contact)...\n');

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
  console.log('📱 Sending to: +' + CUSTOMER_PHONE);
  console.log('');

  // Send template message
  const url = `https://graph.facebook.com/v21.0/${brand.phone_number_id}/messages`;
  
  // Using hello_world template (pre-approved by Meta)
  const payload = {
    messaging_product: 'whatsapp',
    to: CUSTOMER_PHONE,
    type: 'template',
    template: {
      name: 'hello_world',
      language: {
        code: 'en_US'
      }
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
      console.log('✅ Template message sent successfully!');
      console.log('📨 Message ID:', data.messages[0].id);
      console.log('');
      console.log('🎉 Customer can now reply and start conversation!');
      console.log('');
      console.log('📝 Next steps:');
      console.log('1. Customer receives "Hello World" message');
      console.log('2. Customer can reply');
      console.log('3. You have 24 hours to send any message');
      console.log('4. After 24 hours, need template again');
      console.log('');
    } else {
      console.log('❌ Failed to send template message!');
      console.log('Status:', response.status);
      console.log('Error:', data.error?.message || 'Unknown error');
      console.log('Error Code:', data.error?.code);
      console.log('');
      
      if (data.error?.code === 132000) {
        console.log('⚠️  Template not found or not approved!');
        console.log('');
        console.log('📝 To create a custom template:');
        console.log('1. Go to: https://developers.facebook.com');
        console.log('2. Select your app');
        console.log('3. WhatsApp → Message Templates');
        console.log('4. Create Template → Category: TRANSACTIONAL');
        console.log('5. Add your order confirmation message');
        console.log('6. Submit for review (24 hours)');
        console.log('');
        console.log('Example template:');
        console.log('---');
        console.log('Name: order_confirmation');
        console.log('Category: TRANSACTIONAL');
        console.log('Language: Arabic');
        console.log('');
        console.log('Body:');
        console.log('مرحباً {{1}}! تم استلام طلبك رقم {{2}}');
        console.log('المنتجات: {{3}}');
        console.log('الإجمالي: {{4}} جنيه');
        console.log('---');
        console.log('');
      }

      if (data.error?.code === 131026) {
        console.log('⚠️  Phone number not in allowed list!');
        console.log('');
        console.log('For testing, add the number to test list:');
        console.log('1. Meta Developer Console');
        console.log('2. WhatsApp → API Setup');
        console.log('3. Manage phone number list');
        console.log('4. Add: ' + CUSTOMER_PHONE);
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

console.log('📋 Template Message Info:\n');
console.log('Template messages allow you to send the FIRST message to a customer');
console.log('without them messaging you first.\n');
console.log('Using: hello_world template (pre-approved by Meta)');
console.log('This is just for testing. Create your own template for production.\n');

sendTemplateMessage();
