// Script to help get the anon key
// The anon key is usually a JWT token that looks like: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

const projectRef = 'rmpgofswkpjxionzythf';
const projectUrl = `https://${projectRef}.supabase.co`;

console.log('🔍 Trying to fetch Supabase configuration...\n');

// Try to get the anon key from the public endpoint
fetch(`${projectUrl}/rest/v1/`)
  .then(res => {
    console.log('✅ Supabase project is accessible!');
    console.log('📍 Project URL:', projectUrl);
    console.log('\n⚠️  You need to get the anon key manually from:');
    console.log(`   https://supabase.com/dashboard/project/${projectRef}/settings/api\n`);
  })
  .catch(err => {
    console.log('⚠️  Could not connect to Supabase REST API');
    console.log('   This is normal - you need the anon key first!\n');
    console.log('📍 Project URL:', projectUrl);
    console.log('🔗 Get your keys from:');
    console.log(`   https://supabase.com/dashboard/project/${projectRef}/settings/api\n`);
  });
