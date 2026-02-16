import pg from 'pg';
import fs from 'fs';

const { Client } = pg;

const connectionString = 'postgresql://postgres.rmpgofswkpjxionzythf:01066184859mM@aws-1-eu-west-1.pooler.supabase.com:5432/postgres';

async function setupUserSettings() {
  const client = new Client({ connectionString });
  
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    console.log('📝 Reading SQL file...');
    const sql = fs.readFileSync('database-add-user-settings.sql', 'utf8');
    
    console.log('🚀 Creating user_settings table...');
    await client.query(sql);
    
    console.log('✅ User settings table created successfully!');
    console.log('⚙️  Users can now save their webhook URLs');
    console.log('🔒 Row Level Security enabled');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

setupUserSettings();
