// Setup Everything - Professional Setup Script
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('\n🚀 بدء الإعداد الاحترافي للنظام...\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Step 1: Check Supabase Connection
async function checkSupabase() {
  console.log('1️⃣  فحص اتصال Supabase...');
  try {
    const { data, error } = await supabase.from('brands').select('count').limit(1);
    if (error && error.code !== 'PGRST116') throw error;
    console.log('   ✅ Supabase متصل بنجاح\n');
    return true;
  } catch (error) {
    console.error('   ❌ خطأ في الاتصال:', error.message);
    return false;
  }
}

// Step 2: Create Storage Bucket
async function createStorageBucket() {
  console.log('2️⃣  إنشاء Storage Bucket...');
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.find(b => b.name === 'whatsapp-media');
    
    if (exists) {
      console.log('   ✅ Bucket موجود بالفعل');
      console.log('   📦 Name: whatsapp-media');
      console.log('   🌐 Public:', exists.public ? 'Yes' : 'No\n');
      return true;
    }

    // Create bucket
    const { data, error } = await supabase.storage.createBucket('whatsapp-media', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('   ✅ Bucket موجود بالفعل\n');
        return true;
      }
      throw error;
    }

    console.log('   ✅ تم إنشاء Bucket بنجاح');
    console.log('   📦 Name: whatsapp-media');
    console.log('   🌐 Public: Yes');
    console.log('   💾 Max Size: 50MB\n');
    return true;
  } catch (error) {
    console.error('   ❌ خطأ:', error.message);
    console.log('   ℹ️  يمكنك إنشاءه يدوياً من Dashboard\n');
    return false;
  }
}

// Step 3: Check Database Tables
async function checkTables() {
  console.log('3️⃣  فحص جداول قاعدة البيانات...');
  try {
    const tables = ['brands', 'contacts', 'messages'];
    let allGood = true;

    for (const table of tables) {
      const { error } = await supabase.from(table).select('count').limit(1);
      if (error && error.code !== 'PGRST116') {
        console.log(`   ❌ جدول ${table} غير موجود`);
        allGood = false;
      } else {
        console.log(`   ✅ جدول ${table} موجود`);
      }
    }

    console.log();
    return allGood;
  } catch (error) {
    console.error('   ❌ خطأ:', error.message, '\n');
    return false;
  }
}

// Step 4: Check Webhook Server
async function checkWebhookServer() {
  console.log('4️⃣  فحص Webhook Server...');
  try {
    const response = await fetch('http://localhost:3001/health', {
      method: 'GET',
      timeout: 3000
    });

    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Webhook Server شغال');
      console.log('   🌐 URL: http://localhost:3001');
      console.log('   📊 Status:', data.status, '\n');
      return true;
    } else {
      throw new Error('Server not responding');
    }
  } catch (error) {
    console.log('   ⚠️  Webhook Server مش شغال');
    console.log('   💡 شغله بالأمر: node server/webhook-server.js\n');
    return false;
  }
}

// Step 5: Check Brands Configuration
async function checkBrands() {
  console.log('5️⃣  فحص إعدادات البراندات...');
  try {
    const { data: brands, error } = await supabase
      .from('brands')
      .select('*');

    if (error) throw error;

    if (!brands || brands.length === 0) {
      console.log('   ⚠️  لا توجد براندات');
      console.log('   💡 أنشئ براند من الموقع\n');
      return false;
    }

    console.log(`   ✅ عدد البراندات: ${brands.length}`);
    
    for (const brand of brands) {
      console.log(`\n   📱 ${brand.name}:`);
      console.log(`      - Phone Number ID: ${brand.phone_number_id || '❌ غير مضبوط'}`);
      console.log(`      - WhatsApp Token: ${brand.whatsapp_token ? '✅ موجود' : '❌ غير مضبوط'}`);
      
      if (brand.whatsapp_token && brand.whatsapp_token.startsWith('EAA')) {
        console.log(`      - Token Format: ✅ صحيح`);
      } else if (brand.whatsapp_token && brand.whatsapp_token !== 'your_token_here') {
        console.log(`      - Token Format: ⚠️  قد يكون خاطئ (يجب أن يبدأ بـ EAA)`);
      }
    }

    console.log();
    return true;
  } catch (error) {
    console.error('   ❌ خطأ:', error.message, '\n');
    return false;
  }
}

// Step 6: Test Media Upload
async function testMediaUpload() {
  console.log('6️⃣  اختبار رفع الملفات...');
  try {
    // Create a small test file
    const testContent = 'Test file for WhatsApp CRM';
    const testFile = new Blob([testContent], { type: 'text/plain' });
    const fileName = `test/${Date.now()}.txt`;

    const { error: uploadError } = await supabase.storage
      .from('whatsapp-media')
      .upload(fileName, testFile);

    if (uploadError) throw uploadError;

    console.log('   ✅ رفع الملفات يعمل بنجاح');

    // Clean up test file
    await supabase.storage
      .from('whatsapp-media')
      .remove([fileName]);

    console.log('   🧹 تم حذف ملف الاختبار\n');
    return true;
  } catch (error) {
    console.error('   ❌ خطأ في رفع الملفات:', error.message);
    console.log('   💡 تأكد من أن الـ bucket public\n');
    return false;
  }
}

// Step 7: Check Realtime
async function checkRealtime() {
  console.log('7️⃣  فحص Realtime...');
  try {
    const channel = supabase.channel('test-channel');
    
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout'));
      }, 5000);

      channel
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {})
        .subscribe((status) => {
          clearTimeout(timeout);
          if (status === 'SUBSCRIBED') {
            resolve(true);
          } else if (status === 'CHANNEL_ERROR') {
            reject(new Error('Channel error'));
          }
        });
    });

    await supabase.removeChannel(channel);
    console.log('   ✅ Realtime يعمل بنجاح\n');
    return true;
  } catch (error) {
    console.log('   ⚠️  Realtime قد لا يعمل');
    console.log('   💡 النظام سيستخدم Auto-refresh (كل 2 ثانية)\n');
    return false;
  }
}

// Main Setup Function
async function setupEverything() {
  const results = {
    supabase: await checkSupabase(),
    storage: await createStorageBucket(),
    tables: await checkTables(),
    webhook: await checkWebhookServer(),
    brands: await checkBrands(),
    upload: false,
    realtime: false
  };

  // Only test upload if storage is ready
  if (results.storage) {
    results.upload = await testMediaUpload();
  }

  // Only test realtime if tables are ready
  if (results.tables) {
    results.realtime = await checkRealtime();
  }

  // Print Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 ملخص الإعداد:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('✅ = جاهز  |  ⚠️  = يحتاج إعداد  |  ❌ = خطأ\n');

  console.log(`${results.supabase ? '✅' : '❌'} Supabase Connection`);
  console.log(`${results.storage ? '✅' : '⚠️ '} Storage Bucket`);
  console.log(`${results.tables ? '✅' : '❌'} Database Tables`);
  console.log(`${results.webhook ? '✅' : '⚠️ '} Webhook Server`);
  console.log(`${results.brands ? '✅' : '⚠️ '} Brands Configuration`);
  console.log(`${results.upload ? '✅' : '⚠️ '} File Upload`);
  console.log(`${results.realtime ? '✅' : '⚠️ '} Realtime Updates`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Check if system is ready
  const critical = results.supabase && results.tables;
  const recommended = results.storage && results.webhook && results.brands;

  if (critical && recommended) {
    console.log('🎉 النظام جاهز بالكامل للاستخدام!\n');
    console.log('الخطوات التالية:');
    console.log('1. افتح الموقع: http://localhost:5177');
    console.log('2. سجل دخول');
    console.log('3. اذهب إلى Settings وأدخل بيانات WhatsApp');
    console.log('4. ابدأ المحادثات!\n');
    return true;
  } else if (critical) {
    console.log('⚠️  النظام يعمل لكن يحتاج بعض الإعدادات:\n');
    
    if (!results.webhook) {
      console.log('📌 شغل Webhook Server:');
      console.log('   node server/webhook-server.js\n');
    }
    
    if (!results.storage) {
      console.log('📌 أنشئ Storage Bucket يدوياً:');
      console.log('   https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/storage/buckets');
      console.log('   Name: whatsapp-media');
      console.log('   Public: Yes\n');
    }
    
    if (!results.brands) {
      console.log('📌 أضف براند من الموقع:');
      console.log('   Settings → WhatsApp Brands → Add Brand\n');
    }
    
    return false;
  } else {
    console.log('❌ النظام يحتاج إعداد أساسي:\n');
    
    if (!results.supabase) {
      console.log('📌 تحقق من ملف .env:');
      console.log('   VITE_SUPABASE_URL');
      console.log('   VITE_SUPABASE_ANON_KEY\n');
    }
    
    if (!results.tables) {
      console.log('📌 شغل SQL في Supabase:');
      console.log('   database-multi-tenant-setup.sql\n');
    }
    
    return false;
  }
}

// Run Setup
setupEverything().then((success) => {
  if (success) {
    console.log('✨ Setup completed successfully!\n');
    process.exit(0);
  } else {
    console.log('⚠️  Setup completed with warnings. Check the messages above.\n');
    process.exit(0);
  }
}).catch((error) => {
  console.error('\n❌ Setup failed:', error.message, '\n');
  process.exit(1);
});
