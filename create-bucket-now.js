// Create Storage Bucket Automatically
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Use SERVICE ROLE key for admin operations
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

console.log('\n📦 إنشاء Storage Bucket...\n');

async function createBucket() {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.error('❌ خطأ في قراءة Buckets:', listError.message);
      console.log('\n💡 الحل اليدوي:\n');
      console.log('1. افتح: https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/storage/buckets');
      console.log('2. اضغط "New bucket"');
      console.log('3. Name: whatsapp-media');
      console.log('4. Public: ✅');
      console.log('5. Create\n');
      return false;
    }

    const exists = buckets?.find(b => b.name === 'whatsapp-media');
    
    if (exists) {
      console.log('✅ Bucket موجود بالفعل!');
      console.log('📦 Name:', exists.name);
      console.log('🌐 Public:', exists.public ? 'Yes' : 'No');
      console.log('\n🎉 يمكنك الآن إرسال الصور!\n');
      return true;
    }

    // Try to create bucket
    console.log('🔨 جاري إنشاء Bucket...');
    
    const { data, error } = await supabaseAdmin.storage.createBucket('whatsapp-media', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: null // Allow all types
    });

    if (error) {
      console.error('❌ فشل الإنشاء:', error.message);
      console.log('\n💡 السبب المحتمل: تحتاج صلاحيات Admin\n');
      console.log('الحل اليدوي (دقيقة واحدة):\n');
      console.log('1. افتح: https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/storage/buckets');
      console.log('2. اضغط "New bucket"');
      console.log('3. Name: whatsapp-media');
      console.log('4. Public: ✅ (مهم جداً!)');
      console.log('5. File size limit: 50 MB');
      console.log('6. اضغط "Create bucket"\n');
      console.log('بعدها جرب ترسل الصورة تاني!\n');
      return false;
    }

    console.log('✅ تم إنشاء Bucket بنجاح!');
    console.log('📦 Name: whatsapp-media');
    console.log('🌐 Public: Yes');
    console.log('💾 Max Size: 50MB');
    console.log('\n🎉 يمكنك الآن إرسال الصور!\n');
    return true;

  } catch (error) {
    console.error('❌ خطأ:', error.message);
    console.log('\n💡 الحل اليدوي:\n');
    console.log('افتح: https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/storage/buckets');
    console.log('وأنشئ bucket اسمه "whatsapp-media" واجعله Public\n');
    return false;
  }
}

createBucket().then((success) => {
  if (success) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ جاهز! جرب ترسل صورة دلوقتي');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
  process.exit(success ? 0 : 1);
});
