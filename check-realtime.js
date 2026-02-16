// فحص الـ Realtime
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🔔 Checking Supabase Realtime...\n');

// Test 1: Check if we can subscribe
const channel = supabase
  .channel('test-realtime')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'messages',
    },
    (payload) => {
      console.log('✅ Realtime event received!');
      console.log('   Event:', payload.eventType);
      console.log('   Data:', payload.new?.body || payload.old?.body);
    }
  )
  .subscribe((status) => {
    console.log('📡 Subscription status:', status);
    
    if (status === 'SUBSCRIBED') {
      console.log('\n✅ Realtime is working!');
      console.log('💡 The issue might be in the React app.');
      console.log('\nPossible fixes:');
      console.log('1. Check browser console for errors');
      console.log('2. Make sure Supabase Realtime is enabled in dashboard');
      console.log('3. Check if messages table has Realtime enabled');
      console.log('\nTo enable Realtime in Supabase:');
      console.log('1. Go to: https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/database/replication');
      console.log('2. Enable Realtime for "messages" table');
      console.log('3. Refresh the React app\n');
    } else if (status === 'CHANNEL_ERROR') {
      console.log('\n❌ Realtime subscription failed!');
      console.log('💡 Realtime might not be enabled in Supabase.');
      console.log('\nTo fix:');
      console.log('1. Go to Supabase Dashboard');
      console.log('2. Database → Replication');
      console.log('3. Enable Realtime for "messages" table\n');
    }
  });

// Keep alive for 5 seconds
setTimeout(() => {
  console.log('Closing...');
  supabase.removeChannel(channel);
  process.exit(0);
}, 5000);
