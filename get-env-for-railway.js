// Get Environment Variables for Railway
import 'dotenv/config';

console.log('\n📋 Copy these to Railway Variables:\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Variable Name: VITE_SUPABASE_URL');
console.log('Value:', process.env.VITE_SUPABASE_URL || '❌ Not found in .env');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Variable Name: VITE_SUPABASE_ANON_KEY');
console.log('Value:', process.env.VITE_SUPABASE_ANON_KEY || '❌ Not found in .env');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Variable Name: WEBHOOK_VERIFY_TOKEN');
console.log('Value: whatsapp_crm_2024');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Variable Name: WEBHOOK_PORT');
console.log('Value: 3001');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('💡 Steps:');
console.log('1. Go to Railway Dashboard');
console.log('2. Select your project');
console.log('3. Go to Variables tab');
console.log('4. Add each variable above');
console.log('5. Save and redeploy\n');
