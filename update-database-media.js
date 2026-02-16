import pg from 'pg';
import fs from 'fs';

const { Client } = pg;

const connectionString = 'postgresql://postgres.rmpgofswkpjxionzythf:01066184859mM@aws-1-eu-west-1.pooler.supabase.com:5432/postgres';

async function updateDatabase() {
  const client = new Client({ connectionString });
  
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    console.log('📝 Reading SQL file...');
    const sql = fs.readFileSync('database-update-media.sql', 'utf8');
    
    console.log('🚀 Updating database for media support...');
    await client.query(sql);
    
    console.log('✅ Database updated successfully!');
    console.log('📸 Media columns added to messages table');
    console.log('🗄️  Storage bucket created: whatsapp-media');
    console.log('🔒 Storage policies configured');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

updateDatabase();
