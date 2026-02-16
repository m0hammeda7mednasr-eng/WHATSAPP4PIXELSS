import pg from 'pg';

const { Client } = pg;

const connectionString = 'postgresql://postgres.rmpgofswkpjxionzythf:01066184859mM@aws-1-eu-west-1.pooler.supabase.com:5432/postgres';

async function fixPhoneNumberConstraint() {
  const client = new Client({ connectionString });
  
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');
    
    console.log('🔧 Fixing phone_number constraint...');
    
    // Make phone_number nullable
    await client.query(`
      ALTER TABLE contacts 
      ALTER COLUMN phone_number DROP NOT NULL
    `);
    
    console.log('✅ phone_number is now nullable');
    
    // Update existing contacts
    console.log('\n🔧 Updating existing contacts...');
    await client.query(`
      UPDATE contacts 
      SET phone_number = wa_id 
      WHERE phone_number IS NULL AND wa_id IS NOT NULL
    `);
    
    console.log('✅ Existing contacts updated');
    
    console.log('\n🎉 Fixed! Now run: node test-inbound-message.js');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

fixPhoneNumberConstraint();
