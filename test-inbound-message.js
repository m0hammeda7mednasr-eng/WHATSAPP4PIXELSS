import pg from 'pg';

const { Client } = pg;

const connectionString = 'postgresql://postgres.rmpgofswkpjxionzythf:01066184859mM@aws-1-eu-west-1.pooler.supabase.com:5432/postgres';

async function testInboundMessage() {
  const client = new Client({ connectionString });
  
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');
    
    // Simulate receiving a message from WhatsApp
    console.log('📥 Simulating inbound message from WhatsApp...\n');
    
    const wa_id = '201111111111'; // Customer's WhatsApp ID
    const phone_number_id = '123456789'; // Your WhatsApp Phone ID (4 Pixels)
    const message_body = 'Hello! This is a test message from WhatsApp';
    const contact_name = 'Test Customer';
    
    // Step 1: Get brand_id
    console.log('1️⃣ Getting brand_id...');
    const brandResult = await client.query(
      'SELECT id FROM brands WHERE phone_number_id = $1 LIMIT 1',
      [phone_number_id]
    );
    
    if (brandResult.rows.length === 0) {
      console.log('❌ Brand not found! Creating one...');
      const createBrandResult = await client.query(
        `INSERT INTO brands (name, phone_number_id, display_phone_number) 
         VALUES ('Test Brand', $1, '+201234567890') 
         RETURNING id`,
        [phone_number_id]
      );
      var brand_id = createBrandResult.rows[0].id;
      console.log(`✅ Brand created: ${brand_id}`);
    } else {
      var brand_id = brandResult.rows[0].id;
      console.log(`✅ Brand found: ${brand_id}`);
    }
    
    // Step 2: Create or update contact
    console.log('\n2️⃣ Creating/updating contact...');
    const contactResult = await client.query(
      `INSERT INTO contacts (brand_id, wa_id, name, last_message_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (brand_id, wa_id) 
       DO UPDATE SET 
         name = EXCLUDED.name,
         last_message_at = NOW()
       RETURNING id`,
      [brand_id, wa_id, contact_name]
    );
    
    const contact_id = contactResult.rows[0].id;
    console.log(`✅ Contact ready: ${contact_id}`);
    
    // Step 3: Insert message
    console.log('\n3️⃣ Inserting message...');
    const messageResult = await client.query(
      `INSERT INTO messages (
        contact_id,
        brand_id,
        direction,
        message_type,
        body,
        status,
        wa_message_id,
        created_at
      )
      VALUES ($1, $2, 'inbound', 'text', $3, 'delivered', $4, NOW())
      RETURNING *`,
      [contact_id, brand_id, message_body, 'wamid.test' + Date.now()]
    );
    
    console.log('✅ Message inserted!');
    console.log('\n📊 Message details:');
    console.log('   ID:', messageResult.rows[0].id);
    console.log('   Contact:', contact_name);
    console.log('   Brand:', brand_id);
    console.log('   Body:', message_body);
    console.log('   Direction:', messageResult.rows[0].direction);
    console.log('   Status:', messageResult.rows[0].status);
    
    console.log('\n🎉 Success! Check your UI - the message should appear!');
    console.log('👉 http://localhost:5177/\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

testInboundMessage();
