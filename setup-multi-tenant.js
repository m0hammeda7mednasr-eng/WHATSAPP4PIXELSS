import pg from 'pg';
import fs from 'fs';

const { Client } = pg;

const connectionString = 'postgresql://postgres.rmpgofswkpjxionzythf:01066184859mM@aws-1-eu-west-1.pooler.supabase.com:5432/postgres';

async function setupMultiTenant() {
  const client = new Client({ connectionString });
  
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');
    
    console.log('📝 Reading SQL file...');
    const sql = fs.readFileSync('database-multi-tenant-setup.sql', 'utf8');
    
    console.log('🚀 Setting up Multi-Tenant WhatsApp CRM...\n');
    await client.query(sql);
    
    console.log('✅ Multi-Tenant setup completed successfully!\n');
    console.log('📊 Tables created:');
    console.log('   - brands (WhatsApp Numbers)');
    console.log('   - contacts (Customers per Brand)');
    console.log('   - messages (Chat History)\n');
    console.log('🔒 Row Level Security enabled');
    console.log('📦 Sample data inserted:');
    console.log('   - 2 Brands: 4 Pixels, Lamsa');
    console.log('   - 5 Contacts');
    console.log('   - Sample messages\n');
    console.log('🎉 Ready to use!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupMultiTenant();
