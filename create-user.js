import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rmpgofswkpjxionzythf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
  console.log('🔐 Creating test user...\n');
  
  const email = 'moh@gmail.com';
  const password = '01066184859';
  
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  });
  
  if (error) {
    console.error('❌ Error:', error.message);
  } else {
    console.log('✅ User created successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('\n🚀 Now you can login at: http://localhost:5177/');
  }
}

createTestUser();
