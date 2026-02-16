import pg from 'pg';
import fs from 'fs';

const { Client } = pg;

const connectionString = 'postgresql://postgres.rmpgofswkpjxionzythf:01066184859mM@aws-1-eu-west-1.pooler.supabase.com:5432/postgres';

async function setupDatabase() {
  const client = new Client({ connectionString });
  
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    console.log('📝 Reading SQL file...');
    const sql = fs.readFileSync('database-setup.sql', 'utf8');
    
    console.log('🚀 Executing database setup...');
    await client.query(sql);
    
    console.log('✅ Database setup completed successfully!');
    console.log('📊 Tables created: contacts, messages');
    console.log('🔒 Row Level Security enabled');
    console.log('📦 Sample data inserted');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();
