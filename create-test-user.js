import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('🚀 Creating test user...\n');

// Test credentials
const email = 'test@example.com';
const password = 'test123456';

async function createUser() {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      console.error('❌ Error:', error.message);
      
      if (error.message.includes('Email not confirmed')) {
        console.log('\n⚠️  Email confirmation is required!');
        console.log('\n📋 Steps to fix:');
        console.log('1. Go to: https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/auth/users');
        console.log('2. Find the user and click "Confirm email"');
        console.log('\nOR disable email confirmation:');
        console.log('1. Go to: https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/auth/providers');
        console.log('2. Scroll to "Email" section');
        console.log('3. Disable "Confirm email"');
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

createUser();
