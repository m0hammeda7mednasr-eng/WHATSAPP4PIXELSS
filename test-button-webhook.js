// Test WhatsApp Webhook for Button Clicks
require('dotenv').config();

async function testWebhook() {
  console.log('🔍 Testing WhatsApp Webhook Configuration...\n');

  const webhookUrl = 'https://wahtsapp2.vercel.app/api/webhook';
  const verifyToken = 'whatsapp_crm_2024';

  // Test 1: Webhook Verification
  console.log('📋 Test 1: Webhook Verification');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const verifyUrl = `${webhookUrl}?hub.mode=subscribe&hub.verify_token=${verifyToken}&hub.challenge=test123`;
    const response = await fetch(verifyUrl);
    const text = await response.text();
    
    if (text === 'test123') {
      console.log('✅ Webhook verification: SUCCESS');
      console.log('   Response:', text);
    } else {
      console.log('❌ Webhook verification: FAILED');
      console.log('   Expected: test123');
      console.log('   Got:', text);
    }
  } catch (error) {
    console.log('❌ Webhook verification: ERROR');
    console.log('   Error:', error.message);
  }

  console.log('\n');

  // Test 2: Check Meta Configuration
  console.log('📋 Test 2: Meta Developer Console Configuration');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('يجب التحقق من الإعدادات التالية في Meta:');
  console.log('');
  console.log('🔗 URL: https://developers.facebook.com/apps');
  console.log('');
  console.log('📍 المسار: WhatsApp → Configuration → Webhook');
  console.log('');
  console.log('✅ Callback URL:');
  console.log('   ' + webhookUrl);
  console.log('');
  console.log('✅ Verify Token:');
  console.log('   ' + verifyToken);
  console.log('');
  console.log('✅ Webhook Fields (يجب تفعيلها):');
  console.log('   ☑️  messages (مهم جداً!)');
  console.log('   ☑️  message_status (اختياري)');
  console.log('');

  // Test 3: Simulate Button Click
  console.log('\n📋 Test 3: Simulate Button Click');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('لاختبار الـ Button Click:');
  console.log('');
  console.log('1️⃣  افتح WhatsApp على موبايلك');
  console.log('2️⃣  ابعت رسالة للبراند من رقمك');
  console.log('3️⃣  البراند يرد عليك برسالة فيها buttons');
  console.log('4️⃣  اضغط على Button (تأكيد أو إلغاء)');
  console.log('5️⃣  لازم يرجعلك رد فوراً ✅');
  console.log('');

  // Test 4: Check Vercel Logs
  console.log('\n📋 Test 4: Check Vercel Logs');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('🔗 URL: https://vercel.com/dashboard');
  console.log('');
  console.log('📍 المسار: wahtsapp2 → Logs');
  console.log('');
  console.log('🔍 ابحث عن:');
  console.log('   - "button clicked"');
  console.log('   - "interactive"');
  console.log('   - "Button clicked:"');
  console.log('');
  console.log('لو مفيش logs → Webhook مش واصل للسيرفر');
  console.log('');

  // Summary
  console.log('\n📊 الخلاصة');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('✅ الـ Webhook يشتغل لو:');
  console.log('   1. Webhook Verification ناجح');
  console.log('   2. Meta Configuration صحيحة');
  console.log('   3. Subscribe to "messages" مفعل');
  console.log('   4. Vercel Logs تظهر button clicks');
  console.log('');
  console.log('❌ الـ Webhook مش شغال لو:');
  console.log('   1. Verification فشل');
  console.log('   2. مفيش logs في Vercel');
  console.log('   3. مفيش رد للعميل لما يضغط Button');
  console.log('');
  console.log('🔧 الحل:');
  console.log('   1. افتح Meta Developer Console');
  console.log('   2. WhatsApp → Configuration → Webhook');
  console.log('   3. تأكد من URL و Token');
  console.log('   4. اضغط Subscribe على "messages"');
  console.log('   5. اضغط Test → Send Test');
  console.log('   6. لازم يطلع Success ✅');
  console.log('');
}

testWebhook().catch(console.error);
