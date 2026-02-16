// اختبار External Message API
// هذا الملف يحاكي إرسال رسالة من n8n أو أي automation خارجي

const testExternalMessage = async () => {
  console.log('🧪 Testing External Message API...\n');

  // البيانات المطلوبة
  const payload = {
    phone_number: '201012345678',  // غيّر الرقم ده لرقم حقيقي
    message: 'مرحباً! هذه رسالة تجريبية من External API 🚀',
    message_type: 'text',
    // brand_id: 'your-brand-id-here'  // اختياري
  };

  console.log('📤 Sending message...');
  console.log('Phone:', payload.phone_number);
  console.log('Message:', payload.message);
  console.log('');

  try {
    const response = await fetch('http://localhost:3001/api/external-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('✅ SUCCESS!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Message ID:', result.message_id);
      console.log('WhatsApp Message ID:', result.wa_message_id);
      console.log('Contact ID:', result.contact_id);
      console.log('Brand ID:', result.brand_id);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      console.log('✅ الرسالة اتبعتت على WhatsApp');
      console.log('✅ الرسالة اتحفظت في الـ database');
      console.log('✅ الرسالة هتظهر في الشات دلوقتي!');
      console.log('');
      console.log('💡 افتح الـ app وشوف الشات - الرسالة المفروض تكون ظاهرة');
    } else {
      console.log('❌ FAILED!');
      console.log('Error:', result.error);
      console.log('Details:', result.details || 'No details');
      console.log('');
      console.log('💡 تأكد من:');
      console.log('   1. الـ webhook server شغال (npm run webhook)');
      console.log('   2. الـ WhatsApp Token مضبوط في Settings');
      console.log('   3. الـ Phone Number ID صحيح');
      console.log('   4. رقم العميل صحيح');
    }
  } catch (error) {
    console.log('❌ ERROR!');
    console.log('Error:', error.message);
    console.log('');
    console.log('💡 تأكد إن الـ webhook server شغال:');
    console.log('   npm run webhook');
  }
};

// تشغيل الاختبار
testExternalMessage();
