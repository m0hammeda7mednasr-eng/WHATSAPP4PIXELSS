// 🧪 Test Send Message - اختبار الإرسال
async function testSendMessage() {
  console.log('🧪 اختبار إرسال الرسائل');
  console.log('====================');

  // بيانات الاختبار - حط بياناتك هنا
  const PHONE_NUMBER_ID = '123456789'; // حط الـ phone number ID بتاعك
  const ACCESS_TOKEN = 'your_token_here'; // حط الـ token بتاعك
  const TO_NUMBER = '201234567890'; // حط رقم الاختبار

  const testMessage = {
    messaging_product: 'whatsapp',
    to: TO_NUMBER,
    type: 'text',
    text: {
      body: 'اختبار إرسال رسالة من النظام 🧪'
    }
  };

  console.log(`📱 Phone Number ID: ${PHONE_NUMBER_ID}`);
  console.log(`🔑 Token: ${ACCESS_TOKEN.substring(0, 20)}...`);
  console.log(`📞 To: ${TO_NUMBER}`);

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testMessage)
      }
    );

    console.log(`📥 Response Status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ رسالة اتبعتت بنجاح!');
      console.log('📥 Response:', data);
      return true;
    } else {
      const error = await response.json();
      console.log('❌ فشل الإرسال!');
      console.log('📥 Error:', error);
      
      // تشخيص الأخطاء الشائعة
      if (response.status === 401) {
        console.log('🔍 المشكلة: Token غلط أو منتهي');
      } else if (response.status === 400) {
        console.log('🔍 المشكلة: Phone Number ID غلط أو البيانات غلط');
      } else if (response.status === 403) {
        console.log('🔍 المشكلة: مافيش صلاحية للإرسال');
      }
      
      return false;
    }

  } catch (error) {
    console.error('❌ Network Error:', error.message);
    return false;
  }
}

// تشغيل الاختبار
testSendMessage().then((success) => {
  if (success) {
    console.log('\n🎉 الإرسال شغال!');
  } else {
    console.log('\n💔 الإرسال مش شغال - شوف الأخطاء فوق');
  }
}).catch(error => {
  console.error('❌ Test failed:', error);
});

// تعليمات الاستخدام
console.log('\n📋 تعليمات:');
console.log('1. حط الـ PHONE_NUMBER_ID بتاعك');
console.log('2. حط الـ ACCESS_TOKEN بتاعك');
console.log('3. حط رقم للاختبار');
console.log('4. شغل الاختبار: node test-send-message-now.js');