import pg from 'pg';
import fs from 'fs';

const { Client } = pg;

const connectionString = 'postgresql://postgres.rmpgofswkpjxionzythf:01066184859mM@aws-1-eu-west-1.pooler.supabase.com:5432/postgres';

async function migrateToMultiTenant() {
  const client = new Client({ connectionString });
  
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');
    
    console.log('📝 Reading migration SQL file...');
    const sql = fs.readFileSync('migrate-to-multi-tenant.sql', 'utf8');
    
    console.log('🚀 Migrating to Multi-Tenant architecture...\n');
    await client.query(sql);
    
    console.log('✅ Migration completed successfully!\n');
    console.log('📊 Changes applied:');
    console.log('   ✅ brands table created');
    console.log('   ✅ brand_id added to contacts');
    console.log('   ✅ brand_id added to messages');
    console.log('   ✅ Sample brands inserted (4 Pixels, Lamsa)');
    console.log('   ✅ Existing data migrated');
    console.log('   ✅ Indexes created');
    console.log('   ✅ RLS policies updated');
    console.log('   ✅ Triggers created\n');
    console.log('🎉 Multi-Tenant CRM is ready!');
    console.log('📱 Open: http://localhost:5177/\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrateToMultiTenant();
