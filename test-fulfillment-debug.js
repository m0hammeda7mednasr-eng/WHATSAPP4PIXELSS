// Test Fulfillment Debug - اختبار سريع للـ Fulfillment
require('dotenv').config();

const testFulfillmentDebug = async () => {
  console.log('🔧 اختبار تشخيص الـ Fulfillment');
  console.log('===============================\n');

  // معلومات مطلوبة
  console.log('📋 معلومات مطلوبة منك:');
  console.log('======================');
  console.log('1. Order ID الذي جربت عليه');
  console.log('2. هل وصلت رسالة التأكيد الأولى (مع البوتونات)؟');
  console.log('3. هل وصلت رسالة التأكيد الثانية (بعد الضغط)؟');
  console.log('4. هل اتضاف Tag "whatsapp-confirmed" للأوردر؟');
  console.log('5. Financial Status للأوردر (paid/pending/etc.)');
  console.log('\n');

  // خطوات التحقق السريع
  console.log('⚡ خطوات التحقق السريع:');
  console.log('========================');
  
  console.log('1. تحقق من Deploy:');
  console.log('   - افتح: https://app.netlify.com أو https://vercel.com');
  console.log('   - تأكد أن آخر deploy نجح');
  console.log('   - تأكد أن التاريخ حديث (آخر 10 دقائق)');
  console.log('');

  console.log('2. تحقق من الأوردر:');
  console.log('   - افتح الأوردر في Shopify');
  console.log('   - شوف Financial Status');
  console.log('   - شوف Fulfillment Status');
  console.log('   - شوف Tags');
  console.log('');

  console.log('3. اعمل اختبار جديد:');
  console.log('   - اعمل أوردر جديد الآن');
  console.log('   - تأكد أن الدفع مكتمل');
  console.log('   - اضغط "تأكيد الطلب"');
  console.log('   - انتظر دقيقة واحدة');
  console.log('   - refresh الأوردر في Shopify');
  console.log('');

  // الأسباب الشائعة
  console.log('🚨 الأسباب الشائعة لعدم حدوث Fulfillment:');
  console.log('==========================================');
  console.log('1. الأوردر غير مدفوع (pending payment)');
  console.log('2. Deploy لم يكتمل بعد');
  console.log('3. مشكلة في Shopify API permissions');
  console.log('4. الأوردر مُفلل مسبقاً');
  console.log('5. مشكلة في webhook URL');
  console.log('');

  // حلول سريعة
  console.log('💡 حلول سريعة:');
  console.log('===============');
  
  console.log('الحل 1: تأكد من الدفع');
  console.log('   - افتح الأوردر في Shopify');
  console.log('   - لو Financial Status = "pending"');
  console.log('   - اضغط "Mark as paid" يدوياً');
  console.log('   - جرّب "تأكيد الطلب" تاني');
  console.log('');

  console.log('الحل 2: اعمل Manual Deploy');
  console.log('   - Netlify: Site settings → Deploys → Trigger deploy');
  console.log('   - Vercel: Project → Deployments → Redeploy');
  console.log('');

  console.log('الحل 3: تحقق من Logs');
  console.log('   - Netlify: Functions → handle-button-click → Logs');
  console.log('   - Vercel: Functions → api/shopify/handle-button-click → Logs');
  console.log('   - ابحث عن errors أو "Method X SUCCESS"');
  console.log('');

  // اختبار مباشر
  console.log('🧪 اختبار مباشر:');
  console.log('=================');
  console.log('جرّب الكود ده في browser console على صفحة الأوردر:');
  console.log('');
  console.log('```javascript');
  console.log('// اختبار مباشر للـ API');
  console.log('fetch("YOUR_NETLIFY_URL/.netlify/functions/handle-button-click", {');
  console.log('  method: "POST",');
  console.log('  headers: { "Content-Type": "application/json" },');
  console.log('  body: JSON.stringify({');
  console.log('    button_id: "confirm_YOUR_ORDER_ID",');
  console.log('    wa_id: "YOUR_PHONE_NUMBER",');
  console.log('    phone_number_id: "YOUR_PHONE_NUMBER_ID"');
  console.log('  })');
  console.log('})');
  console.log('.then(r => r.json())');
  console.log('.then(console.log);');
  console.log('```');
  console.log('');

  console.log('🎯 الخطوة التالية:');
  console.log('==================');
  console.log('أرسل لي:');
  console.log('1. Order ID');
  console.log('2. Financial Status');
  console.log('3. هل وصلت رسالة التأكيد؟');
  console.log('4. هل اتضاف Tag؟');
  console.log('5. Deploy status');
  console.log('');
  console.log('وهحل المشكلة فوراً! 🚀');
};

testFulfillmentDebug();