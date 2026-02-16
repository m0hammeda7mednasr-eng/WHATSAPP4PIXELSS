import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rmpgofswkpjxionzythf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('🚀 Setting up authentication...\n');
console.log('📍 Supabase URL:', SUPABASE_URL);

const email = 'admin@test.com';
const password = 'admin123456';

async function setup() {
  try {
    console.log('\n📝 Creating user...');
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      if (error.message.includes('already registered')) {
        console.log('✅ User already exists!');
        console.log('\n📧 Email:', email);
        console.log('🔑 Password:', password);
        console.log('\n✅ You can login at: http://localhost:5173');
        return;
      }
      
      console.error('❌ Error:', error.message);
      
      if (error.message.includes('not authorized')) {
        console.log('\n⚠️  Email signup might be disabled!');
        console.log('\n📋 Steps to enable:');
        console.log('1. Go to: https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/auth/providers');
        console.log('2. Find "Email" provider');
        console.log('3. Make sure "Enable Email provider" is ON');
        console.log('4. Disable "Confirm email" for testing');
        console.log('5. Click "Save"');
      }
      
      return;
    }

    console.log('✅ User created successfully!');
    console.log('\n📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('\n✅ You can now login at: http://localhost:5173');
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

setup();
