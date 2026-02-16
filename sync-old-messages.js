// Sync old messages from WhatsApp to database
// This will fetch recent messages and save them to the CRM

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function syncMessages() {
  try {
    console.log('🔄 Starting message sync...\n');

    // Get all brands
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('*');

    if (brandsError) throw brandsError;

    console.log(`📱 Found ${brands.length} brands\n`);

    for (const brand of brands) {
      console.log(`\n🏢 Processing brand: ${brand.name}`);
      console.log(`   Phone ID: ${brand.phone_number_id}`);

      if (!brand.whatsapp_token || !brand.phone_number_id) {
        console.log('   ⚠️  Missing WhatsApp credentials, skipping...');
        continue;
      }

      // Fetch recent messages from WhatsApp
      const url = `https://graph.facebook.com/v21.0/${brand.phone_number_id}/messages`;
      
      // Note: WhatsApp doesn't provide a "get messages" endpoint
      // Messages are only received via webhooks
      // So we can't sync old messages retroactively
      
      console.log('   ℹ️  WhatsApp only sends messages via webhooks');
      console.log('   ℹ️  Old messages cannot be synced retroactively');
      console.log('   ✅ New messages will appear automatically');
    }

    console.log('\n\n✅ Sync complete!');
    console.log('\n📝 Note: WhatsApp API only sends messages via webhooks.');
    console.log('   Old messages before webhook setup cannot be retrieved.');
    console.log('   New messages will appear in the CRM automatically.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

syncMessages();
