// اختبار سريع لرسالة من n8n
// شغّل الملف ده عشان تتأكد إن كل حاجة شغالة

const testN8nMessage = async () => {
  console.log('🧪 Testing n8n Message Flow...\n');

  const payload = {
    phone_number: '201012345678',  // ⚠️ غيّر الرقم ده لرقم حقيقي
    message: 'تم تأكيد طلبك! شكراً لك 🎉',
    message_type: 'text'
  };

  console.log('📤 Sending confirmation message...');
  console.log('To:', payload.phone_number);
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
      console.log('✅ SUCCESS! الرسالة اتبعتت بنجاح\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 النتيجة:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ Contact ID:', result.contact_id);
      console.log('✅ Message ID:', result.message_id);
      console.log('✅ WhatsApp ID:', result.wa_message_id);
      console.log('✅ Brand ID:', result.brand_id);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      console.log('🎯 اللي حصل:');
      console.log('1. ✅ الرسالة اتبعتت على WhatsApp');
      console.log('2. ✅ الـ Contact اتنشأ/اتحدث في الـ database');
      console.log('3. ✅ الرسالة اتحفظت في الـ messages table');
      console.log('4. ✅ الشات هيظهر في ChatList');
      console.log('5. ✅ الرسالة هتظهر في ChatWindow\n');
      
      console.log('💡 افتح الـ app دلوقتي وشوف:');
      console.log('   - الشات ظاهر في القائمة على اليسار');
      console.log('   - الرسالة ظاهرة في الشات');
      console.log('   - الوقت محدث\n');
    } else {
      console.log('❌ FAILED!\n');
      console.log('Error:', result.error);
      if (result.details) {
        console.log('Details:', result.details);
      }
      console.log('');
      console.log('🔧 الحلول:');
      console.log('1. تأكد إن webhook server شغال: npm run webhook');
      console.log('2. تأكد إن WhatsApp Token مضبوط في Settings');
      console.log('3. تأكد إن Phone Number ID صحيح');
      console.log('4. تأكد إن رقم العميل صحيح (201234567890)');
    }
  } catch (error) {
    console.log('❌ CONNECTION ERROR!\n');
    console.log('Error:', error.message);
    console.log('');
    console.log('🔧 الحل:');
    console.log('شغّل الـ webhook server الأول:');
    console.log('   npm run webhook');
  }
};

// Run test
testN8nMessage();
