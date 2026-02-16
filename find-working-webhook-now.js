// 🔍 Find Working Webhook NOW!
// هنلاقي الـ webhook اللي شغال فعلاً

async function findWorkingWebhookNow() {
  console.log('🔍 البحث عن الـ Webhook الشغال...');
  console.log('================================');

  const VERIFY_TOKEN = 'whatsapp_crm_2024';
  const TEST_CHALLENGE = 'test_now_123';

  // الـ URLs المحتملة (حط الـ URLs بتاعتك هنا)
  const possibleUrls = [
    // Vercel URLs (الأكثر احتمالاً)
    'https://whatsapp-crm-4pixels.vercel.app/api/webhook',
    'https://4pixels-whatsapp.vercel.app/api/webhook', 
    'https://4pixelswhatsapp.vercel.app/api/webhook',
    
    // Railway URLs
    'https://whatsapp-crm-production.up.railway.app/api/webhook',
    'https://4pixels-whatsapp-production.up.railway.app/api/webhook',
    
    // Render URLs
    'https://whatsapp-crm-4pixels.onrender.com/api/webhook',
    'https://4pixels-whatsapp.onrender.com/api/webhook',
    
    // Netlify (للتأكد)
    'https://4pixelswhatsap.netlify.app/.netlify/functions/webhook',
    'https://4pixelswhatsap.netlify.app/api/webhook',
    
    // Local testing
    'http://localhost:3000/api/webhook',
    'http://localhost:8080/api/webhook'
  ];

  console.log(`🎯 هنجرب ${possibleUrls.length} URLs...\n`);

  let workingUrls = [];

  for (let i = 0; i < possibleUrls.length; i++) {
    const url = possibleUrls[i];
    console.log(`${i + 1}. 🧪 جاري اختبار: ${url}`);
    
    try {
      const testUrl = `${url}?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=${TEST_CHALLENGE}`;
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'WhatsApp/1.0'
        }
      });

      console.log(`   📊 Status: ${response.status}`);

      if (response.status === 200) {
        const responseText = await response.text();
        console.log(`   📥 Response: "${responseText}"`);
        
        if (responseText === TEST_CHALLENGE) {
          console.log('   🎉 يشتغل! ✅');
          workingUrls.push(url);
        } else {
          console.log('   ❌ Response غلط');
        }
      } else if (response.status === 503) {
        console.log('   ❌ Service Unavailable - مش deployed');
      } else if (response.status === 404) {
        console.log('   ❌ Not Found - الـ endpoint مش موجود');
      } else {
        console.log('   ❌ Error');
      }

    } catch (error) {
      if (error.message.includes('fetch')) {
        console.log('   🌐 مش قادر يوصل للـ URL');
      } else {
        console.log(`   ❌ خطأ: ${error.message}`);
      }
    }
    
    console.log(''); // سطر فاضي
  }

  // النتائج
  console.log('='.repeat(40));
  console.log('📊 النتائج النهائية');
  console.log('='.repeat(40));

  if (workingUrls.length > 0) {
    console.log(`\n🎉 لقيت ${workingUrls.length} webhook شغال!`);
    
    workingUrls.forEach((url, index) => {
      console.log(`\n${index + 1}. ✅ ${url}`);
    });
    
    console.log('\n📋 استخدم ده في Meta Business Manager:');
    console.log(`   Callback URL: ${workingUrls[0]}`);
    console.log(`   Verify Token: ${VERIFY_TOKEN}`);
    
    console.log('\n🎯 الخطوات التالية:');
    console.log('1. انسخ الـ URL فوق');
    console.log('2. اروح Meta Business Manager');
    console.log('3. حدث الـ webhook settings');
    console.log('4. جرب رسالة حقيقية على WhatsApp');
    
    return workingUrls[0];
    
  } else {
    console.log('\n❌ مافيش webhook شغال!');
    console.log('\n💡 الحلول:');
    console.log('1. ارفع على Vercel أو Railway');
    console.log('2. تأكد من الـ environment variables');
    console.log('3. جرب تشغل local أول: npm run dev');
    
    console.log('\n🔧 URLs للتجربة اليدوية:');
    console.log('- https://vercel.com (أسهل حل)');
    console.log('- https://railway.app (مجاني)');
    console.log('- https://render.com (بديل)');
    
    return null;
  }
}

// تشغيل البحث
findWorkingWebhookNow().then((workingUrl) => {
  if (workingUrl) {
    console.log(`\n🚀 SUCCESS! استخدم الـ webhook ده: ${workingUrl}`);
  } else {
    console.log('\n💔 مافيش webhook شغال. لازم deployment جديد.');
  }
}).catch(error => {
  console.error('❌ فشل البحث:', error);
});