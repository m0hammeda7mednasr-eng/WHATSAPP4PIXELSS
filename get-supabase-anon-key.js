// Get Supabase Anon Key from .env file
import dotenv from 'dotenv';
dotenv.config();

console.log('\n🔑 Supabase Configuration:\n');
console.log('='.repeat(60));

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.log('❌ Missing Supabase configuration in .env file!\n');
  console.log('Please add these to your .env file:');
  console.log('VITE_SUPABASE_URL=your-url');
  console.log('VITE_SUPABASE_ANON_KEY=your-key');
  console.log('\n📝 You can find these in Supabase Dashboard:');
  console.log('   Settings → API → Project URL & anon/public key');
  process.exit(1);
}

console.log('✅ Supabase URL:');
console.log(url);
console.log('');
console.log('✅ Supabase Anon Key:');
console.log(key);
console.log('');
console.log('='.repeat(60));
console.log('\n📋 Copy these to Vercel Environment Variables:\n');
console.log('1. Go to: https://vercel.com/dashboard');
console.log('2. Select your project: wahtsapp2');
console.log('3. Settings → Environment Variables');
console.log('4. Add:');
console.log('');
console.log('   Name: VITE_SUPABASE_URL');
console.log('   Value: ' + url);
console.log('   Environment: Production, Preview, Development');
console.log('');
console.log('   Name: VITE_SUPABASE_ANON_KEY');
console.log('   Value: ' + key);
console.log('   Environment: Production, Preview, Development');
console.log('');
console.log('   Name: WEBHOOK_VERIFY_TOKEN');
console.log('   Value: whatsapp_crm_2024');
console.log('   Environment: Production, Preview, Development');
console.log('');
console.log('5. Redeploy your project');
console.log('');
