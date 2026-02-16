import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://rmpgofswkpjxionzythf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('🚀 Setting up database...\n');

async function setupDatabase() {
  try {
    // 1. Check if users table exists
    console.log('1️⃣ Checking users table...');
    const { data: usersCheck, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (usersError && usersError.message.includes('does not exist')) {
      console.log('❌ Users table not found');
      console.log('\n📋 Please run this SQL in Supabase:');
      console.log('👉 https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/sql/new\n');
      console.log('Copy and paste this SQL:\n');
      console.log('----------------------------------------');
      const usersSQL = readFileSync('add-users-table.sql', 'utf8');
      console.log(usersSQL);
      console.log('----------------------------------------\n');
    } else {
      console.log('✅ Users table exists');
    }

    // 2. Check if brands table exists
    console.log('\n2️⃣ Checking brands table...');
    const { data: brandsCheck, error: brandsError } = await supabase
      .from('brands')
      .select('id')
      .limit(1);

    if (brandsError && brandsError.message.includes('does not exist')) {
      console.log('❌ Brands table not found');
      console.log('\n📋 Please run this SQL in Supabase:');
      console.log('👉 https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/sql/new\n');
      console.log('Copy the content from: database-multi-tenant-setup.sql');
      console.log('And click RUN\n');
    } else {
      console.log('✅ Brands table exists');
      
      // Check if there are any brands
      const { data: brands, error: brandsListError } = await supabase
        .from('brands')
        .select('*');
      
      if (brands && brands.length > 0) {
        console.log(`✅ Found ${brands.length} brand(s):`);
        brands.forEach(brand => {
          console.log(`   - ${brand.name} (${brand.display_phone_number})`);
        });
      } else {
        console.log('⚠️  No brands found. You need to add one from Settings.');
      }
    }

    // 3. Check if user exists
    console.log('\n3️⃣ Checking users...');
    const { data: users, error: usersListError } = await supabase
      .from('users')
      .select('username');
    
    if (users && users.length > 0) {
      console.log(`✅ Found ${users.length} user(s):`);
      users.forEach(user => {
        console.log(`   - ${user.username}`);
      });
    } else {
      console.log('⚠️  No users found. Create one from the signup page.');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Make sure all SQL files are executed in Supabase');
    console.log('2. Create a user account from: http://localhost:5173');
    console.log('3. Login and add a brand from Settings');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

setupDatabase();
