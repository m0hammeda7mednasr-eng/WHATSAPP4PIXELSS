// Debug script لفحص الرسائل في الـ database
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function debugMessages() {
  console.log('🔍 Debugging Messages...\n');

  // 1. جيب آخر 10 رسائل
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*, contacts(name, wa_id), brands(name)')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!messages || messages.length === 0) {
    console.log('⚠️  No messages found in database\n');
    return;
  }

  console.log(`📊 Found ${messages.length} recent messages:\n`);

  messages.forEach((msg, i) => {
    console.log(`${i + 1}. ${msg.direction === 'outbound' ? '→' : '←'} ${msg.contacts?.name || 'Unknown'}`);
    console.log(`   Brand: ${msg.brands?.name || 'Unknown'}`);
    console.log(`   Message: ${msg.body?.substring(0, 50)}${msg.body?.length > 50 ? '...' : ''}`);
    console.log(`   Status: ${msg.status}`);
    console.log(`   Created: ${new Date(msg.created_at).toLocaleString()}`);
    console.log(`   ID: ${msg.id}`);
    console.log('');
  });

  // 2. إحصائيات
  const outbound = messages.filter(m => m.direction === 'outbound').length;
  const inbound = messages.filter(m => m.direction === 'inbound').length;

  console.log('📊 Statistics:');
  console.log(`   Outbound (sent): ${outbound}`);
  console.log(`   Inbound (received): ${inbound}`);
  console.log(`   Total: ${messages.length}\n`);

  // 3. تحقق من الـ realtime
  console.log('🔔 Testing Realtime Subscription...');
  
  const channel = supabase
    .channel('test-messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      },
      (payload) => {
        console.log('✅ Realtime working! New message:', payload.new.body);
      }
    )
    .subscribe((status) => {
      console.log('   Subscription status:', status);
      
      if (status === 'SUBSCRIBED') {
        console.log('   ✅ Realtime is working!');
        console.log('   💡 Try sending a message from the app now...\n');
        
        // Keep listening for 10 seconds
        setTimeout(() => {
          console.log('   Stopping listener...');
          supabase.removeChannel(channel);
          process.exit(0);
        }, 10000);
      } else if (status === 'CHANNEL_ERROR') {
        console.log('   ❌ Realtime subscription failed!');
        console.log('   💡 Check Supabase Realtime settings\n');
        process.exit(1);
      }
    });
}

debugMessages();
