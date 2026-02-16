import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rmpgofswkpjxionzythf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStorage() {
  console.log('🗄️  Setting up Supabase Storage...\n');

  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
      console.log('\n⚠️  You need to create the bucket manually:');
      console.log('1. Go to: https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/storage/buckets');
      console.log('2. Click "New bucket"');
      console.log('3. Name: whatsapp-media');
      console.log('4. Enable "Public bucket"');
      console.log('5. Click "Create"\n');
      return;
    }

    const bucketExists = buckets.some(b => b.name === 'whatsapp-media');

    if (bucketExists) {
      console.log('✅ Storage bucket "whatsapp-media" already exists!');
    } else {
      console.log('⚠️  Bucket does not exist. Creating it requires service_role key.');
      console.log('\n📋 Please create it manually:');
      console.log('1. Go to: https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/storage/buckets');
      console.log('2. Click "New bucket"');
      console.log('3. Name: whatsapp-media');
      console.log('4. Enable "Public bucket"');
      console.log('5. Click "Create"\n');
    }

    // Test upload
    console.log('🧪 Testing storage access...');
    const testFile = new Blob(['test'], { type: 'text/plain' });
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('whatsapp-media')
      .upload('test/test.txt', testFile);

    if (uploadError) {
      if (uploadError.message.includes('not found')) {
        console.log('❌ Bucket not found. Please create it manually (see instructions above).');
      } else {
        console.log('⚠️  Upload test failed:', uploadError.message);
      }
    } else {
      console.log('✅ Storage is working correctly!');
      
      // Clean up test file
      await supabase.storage.from('whatsapp-media').remove(['test/test.txt']);
      console.log('✅ Test file cleaned up');
    }

    console.log('\n🎉 Setup complete! Your app is ready to use.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setupStorage();
