// اختبار إرسال رسالة من الـ App
import 'dotenv/config';

async function testSendMessage() {
  console.log('📤 Testing send message API...\n');

  // بيانات الرسالة
  const testData = {
    contact_id: 1, // غيّر ده لـ contact_id موجود عندك
    brand_id: 1,   // غيّر ده لـ brand_id موجود عندك
    message: 'مرحباً! هذه رسالة تجريبية من النظام 🚀',
  };

  console.log('📝 Sending:', testData);

  try {
    const response = await fetch('http://localhost:3001/api/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('\n✅ Success!');
      console.log('Message ID:', result.message_id);
      console.log('WhatsApp Message ID:', result.wa_message_id);
      console.log('\n💡 Check your WhatsApp to see the message!');
    } else {
      console.log('\n❌ Failed:', result.error);
      console.log('\n💡 Make sure:');
      console.log('   1. contact_id and brand_id exist in database');
      console.log('   2. brand has whatsapp_token configured');
      console.log('   3. webhook server is running');
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n💡 Make sure webhook server is running:');
    console.log('   npm run server');
  }
}

testSendMessage();
