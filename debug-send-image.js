// Debug Image Sending Issue
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('\n🔍 فحص مشكلة إرسال الصور...\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function checkEverything() {
  const issues = [];
  
  // 1. Check Storage Bucket
  console.log('1️⃣  فحص Storage Bucket...');
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.log('   ❌ خطأ:', error.message);
      issues.push('Storage Bucket: لا يمكن الوصول');
    } else {
      const bucket = buckets?.find(b => b.name === 'whatsapp-media');
      if (bucket) {
        console.log('   ✅ Bucket موجود');
        console.log('   📦 Name:', bucket.name);
        console.log('   🌐 Public:', bucket.public ? 'Yes' : 'No');
        if (!bucket.public) {
          issues.push('Storage Bucket: ليس Public!');
        }
      } else {
        console.log('   ❌ Bucket غير موجود');
        issues.push('Storage Bucket: غير موجود');
      }
    }
  } catch (error) {
    console.log('   ❌ خطأ:', error.message);
    issues.push('Storage Bucket: خطأ في الاتصال');
  }
  console.log();

  // 2. Test File Upload
  console.log('2️⃣  اختبار رفع ملف...');
  try {
    const testContent = 'Test image upload';
    const testFile = new Blob([testContent], { type: 'text/plain' });
    const fileName = `test/${Date.now()}.txt`;

    const { error: uploadError } = await supabase.storage
      .from('whatsapp-media')
      .upload(fileName, testFile);

    if (uploadError) {
      console.log('   ❌ فشل الرفع:', uploadError.message);
      issues.push('File Upload: ' + uploadError.message);
    } else {
      console.log('   ✅ الرفع يعمل بنجاح');
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('whatsapp-media')
        .getPublicUrl(fileName);
      
      console.log('   🔗 URL:', publicUrl);
      
      // Clean up
      await supabase.storage.from('whatsapp-media').remove([fileName]);
      console.log('   🧹 تم حذف ملف الاختبار');
    }
  } catch (error) {
    console.log('   ❌ خطأ:', error.message);
    issues.push('File Upload: ' + error.message);
  }
  console.log();

  // 3. Check Webhook Server
  console.log('3️⃣  فحص Webhook Server...');
  try {
    const response = await fetch('http://localhost:3001/health', {
      method: 'GET',
      timeout: 3000
    });

    if (response.ok) {
      console.log('   ✅ Server شغال');
    } else {
      console.log('   ❌ Server مش بيرد');
      issues.push('Webhook Server: مش شغال');
    }
  } catch (error) {
    console.log('   ❌ Server مش شغال');
    issues.push('Webhook Server: مش شغال');
  }
  console.log();

  // 4. Check Brand Configuration
  console.log('4️⃣  فحص إعدادات البراند...');
  try {
    const { data: brands, error } = await supabase
      .from('brands')
      .select('*');

    if (error) throw error;

    if (!brands || brands.length === 0) {
      console.log('   ❌ لا توجد براندات');
      issues.push('Brands: لا توجد براندات');
    } else {
      for (const brand of brands) {
        console.log(`\n   📱 ${brand.name}:`);
        
        // Check Token
        if (!brand.whatsapp_token || brand.whatsapp_token === 'your_token_here') {
          console.log('      ❌ Token غير مضبوط');
          issues.push(`${brand.name}: Token غير مضبوط`);
        } else if (!brand.whatsapp_token.startsWith('EAA')) {
          console.log('      ⚠️  Token قد يكون خاطئ (لا يبدأ بـ EAA)');
          issues.push(`${brand.name}: Token قد يكون خاطئ`);
        } else {
          console.log('      ✅ Token موجود');
          
          // Test token validity
          try {
            const testResponse = await fetch(
              `https://graph.facebook.com/v18.0/${brand.phone_number_id}`,
              {
                headers: {
                  'Authorization': `Bearer ${brand.whatsapp_token}`
                }
              }
            );
            
            if (testResponse.ok) {
              console.log('      ✅ Token صالح');
            } else {
              const errorData = await testResponse.json();
              console.log('      ❌ Token منتهي أو خاطئ');
              console.log('      📝 Error:', errorData.error?.message || 'Unknown');
              issues.push(`${brand.name}: Token منتهي - ${errorData.error?.message}`);
            }
          } catch (e) {
            console.log('      ⚠️  لا يمكن التحقق من Token');
          }
        }
        
        // Check Phone Number ID
        if (!brand.phone_number_id || brand.phone_number_id === 'your_phone_number_id') {
          console.log('      ❌ Phone Number ID غير مضبوط');
          issues.push(`${brand.name}: Phone Number ID غير مضبوط`);
        } else {
          console.log('      ✅ Phone Number ID:', brand.phone_number_id);
        }
      }
    }
  } catch (error) {
    console.log('   ❌ خطأ:', error.message);
    issues.push('Brands: خطأ في القراءة');
  }
  console.log();

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 ملخص المشاكل:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (issues.length === 0) {
    console.log('✅ لا توجد مشاكل! كل شيء يعمل بشكل صحيح\n');
    console.log('💡 لو لسه الصورة مش بتتبعت، شوف:');
    console.log('   1. Console في المتصفح (F12)');
    console.log('   2. Logs الـ webhook server');
    console.log('   3. تأكد إن الصورة أصغر من 5 MB\n');
  } else {
    console.log('❌ تم العثور على المشاكل التالية:\n');
    issues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
    console.log('\n💡 الحلول:\n');
    
    if (issues.some(i => i.includes('Storage Bucket'))) {
      console.log('📦 Storage Bucket:');
      console.log('   - افتح: https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/storage/buckets');
      console.log('   - أنشئ bucket: whatsapp-media');
      console.log('   - اجعله Public ✅\n');
    }
    
    if (issues.some(i => i.includes('Token منتهي'))) {
      console.log('🔑 WhatsApp Token:');
      console.log('   - افتح: https://developers.facebook.com/apps');
      console.log('   - اختار تطبيقك → WhatsApp → API Setup');
      console.log('   - انسخ Token جديد');
      console.log('   - حدثه في Settings\n');
    }
    
    if (issues.some(i => i.includes('Webhook Server'))) {
      console.log('🌐 Webhook Server:');
      console.log('   - شغله: node server/webhook-server.js\n');
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

checkEverything().catch(console.error);
