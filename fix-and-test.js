import pg from 'pg';

const { Client } = pg;

const connectionString = 'postgresql://postgres.rmpgofswkpjxionzythf:01066184859mM@aws-1-eu-west-1.pooler.supabase.com:5432/postgres';

async function fixAndTest() {
  const client = new Client({ connectionString });
  
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');
    
    // Check brands
    console.log('📊 Checking brands...');
    const brandsResult = await client.query('SELECT * FROM brands');
    console.log(`Found ${brandsResult.rows.length} brands:`);
    brandsResult.rows.forEach(b => {
      console.log(`  - ${b.name} (${b.display_phone_number})`);
    });
    
    // Check contacts
    console.log('\n📊 Checking contacts...');
    const contactsResult = await client.query('SELECT c.*, b.name as brand_name FROM contacts c LEFT JOIN brands b ON c.brand_id = b.id');
    console.log(`Found ${contactsResult.rows.length} contacts:`);
    contactsResult.rows.forEach(c => {
      console.log(`  - ${c.name} (Brand: ${c.brand_name || 'NULL'})`);
    });
    
    // Check messages
    console.log('\n📊 Checking messages...');
    const messagesResult = await client.query('SELECT COUNT(*) as count FROM messages');
    console.log(`Found ${messagesResult.rows[0].count} messages`);
    
    // Fix NULL brand_ids in contacts
    console.log('\n🔧 Fixing NULL brand_ids in contacts...');
    const fixContactsResult = await client.query(`
      UPDATE contacts 
      SET brand_id = (SELECT id FROM brands LIMIT 1)
      WHERE brand_id IS NULL
      RETURNING *
    `);
    if (fixContactsResult.rowCount > 0) {
      console.log(`✅ Fixed ${fixContactsResult.rowCount} contacts`);
    } else {
      console.log('✅ All contacts have brand_id');
    }
    
    // Fix NULL brand_ids in messages
    console.log('\n🔧 Fixing NULL brand_ids in messages...');
    const fixMessagesResult = await client.query(`
      UPDATE messages m
      SET brand_id = c.brand_id
      FROM contacts c
      WHERE m.contact_id = c.id AND m.brand_id IS NULL
      RETURNING m.*
    `);
    if (fixMessagesResult.rowCount > 0) {
      console.log(`✅ Fixed ${fixMessagesResult.rowCount} messages`);
    } else {
      console.log('✅ All messages have brand_id');
    }
    
    // Check for NULL wa_ids
    console.log('\n🔧 Checking wa_id in contacts...');
    const nullWaIdResult = await client.query('SELECT * FROM contacts WHERE wa_id IS NULL');
    if (nullWaIdResult.rows.length > 0) {
      console.log(`⚠️  Found ${nullWaIdResult.rows.length} contacts with NULL wa_id`);
      console.log('Fixing...');
      await client.query(`
        UPDATE contacts 
        SET wa_id = phone_number 
        WHERE wa_id IS NULL AND phone_number IS NOT NULL
      `);
      console.log('✅ Fixed!');
    } else {
      console.log('✅ All contacts have wa_id');
    }
    
    console.log('\n🎉 Database is ready!');
    console.log('\n📱 Test the app at: http://localhost:5177/');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

fixAndTest();
