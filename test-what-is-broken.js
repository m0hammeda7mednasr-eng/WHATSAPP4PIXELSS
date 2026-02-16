// 🔍 Test What Is Broken - اختبار إيه اللي مكسور
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rmpgofswkpjxionzythf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testWhatIsBroken() {
  console.log('🔍 TESTING WHAT IS BROKEN');
  console.log('=========================');
  console.log('اختبار سريع لمعرفة إيه اللي مش شغال');

  const results = {
    database: '❓',
    webhook: '❓',
    shopify: '❓',
    frontend: '❓',
    buttons: '❓'
  };

  // 1. Quick Database Test
  console.log('\n📋 1. Database Test...');
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Database: BROKEN');
      console.log('   Error:', error.message);
      results.database = '❌';
    } else {
      console.log('✅ Database: WORKING');
      results.database = '✅';
    }
  } catch (e) {
    console.log('❌ Database: BROKEN');
    console.log('   Error:', e.message);
    results.database = '❌';
  }

  // 2. Quick Webhook Test
  console.log('\n📋 2. Webhook Test...');
  try {
    const response = await fetch('https://wahtsapp.vercel.app/api/webhook', {
      method: 'GET'
    });
    
    if (response.status === 200 || response.status === 405) {
      console.log('✅ Webhook: WORKING');
      console.log('   Status:', response.status);
      results.webhook = '✅';
    } else if (response.status === 404) {
      console.log('❌ Webhook: BROKEN (404)');
      results.webhook = '❌';
    } else {
      console.log('⚠️  Webhook: ISSUES');
      console.log('   Status:', response.status);
      results.webhook = '⚠️';
    }
  } catch (e) {
    console.log('❌ Webhook: BROKEN');
    console.log('   Error:', e.message);
    results.webhook = '❌';
  }

  // 3. Quick Shopify Test
  console.log('\n📋 3. Shopify Test...');
  try {
    const { data: shopifyConns } = await supabase
      .from('shopify_connections')
      .select('*')
      .eq('is_active', true)
      .limit(1);

    if (shopifyConns && shopifyConns.length > 0) {
      console.log('✅ Shopify: CONNECTED');
      results.shopify = '✅';
    } else {
      console.log('⚠️  Shopify: NOT CONNECTED');
      results.shopify = '⚠️';
    }
  } catch (e) {
    console.log('❌ Shopify: BROKEN');
    console.log('   Error:', e.message);
    results.shopify = '❌';
  }

  // 4. Quick Frontend Test
  console.log('\n📋 4. Frontend Test...');
  try {
    const response = await fetch('https://wahtsapp.vercel.app', {
      method: 'GET'
    });
    
    if (response.status === 200) {
      console.log('✅ Frontend: WORKING');
      results.frontend = '✅';
    } else {
      console.log('❌ Frontend: BROKEN');
      console.log('   Status:', response.status);
      results.frontend = '❌';
    }
  } catch (e) {
    console.log('❌ Frontend: BROKEN');
    console.log('   Error:', e.message);
    results.frontend = '❌';
  }

  // 5. Quick Button Test
  console.log('\n📋 5. Button Functionality Test...');
  try {
    const { data: recentMessages } = await supabase
      .from('messages')
      .select('*')
      .eq('message_type', 'interactive')
      .order('created_at', { ascending: false })
      .limit(1);

    if (recentMessages && recentMessages.length > 0) {
      console.log('✅ Buttons: RECENT ACTIVITY FOUND');
      results.buttons = '✅';
    } else {
      console.log('⚠️  Buttons: NO RECENT ACTIVITY');
      results.buttons = '⚠️';
    }
  } catch (e) {
    console.log('❌ Buttons: CANNOT TEST');
    console.log('   Error:', e.message);
    results.buttons = '❌';
  }

  // Summary
  console.log('\n📊 QUICK DIAGNOSIS SUMMARY');
  console.log('===========================');
  
  Object.entries(results).forEach(([component, status]) => {
    console.log(`${status} ${component.toUpperCase()}`);
  });

  // Count issues
  const broken = Object.values(results).filter(status => status === '❌').length;
  const issues = Object.values(results).filter(status => status === '⚠️').length;
  const working = Object.values(results).filter(status => status === '✅').length;

  console.log('\n📈 HEALTH SCORE:');
  console.log(`✅ Working: ${working}/5`);
  console.log(`⚠️  Issues: ${issues}/5`);
  console.log(`❌ Broken: ${broken}/5`);

  // Recommendations
  console.log('\n🔧 IMMEDIATE ACTIONS NEEDED:');
  console.log('=============================');

  if (results.database === '❌') {
    console.log('🚨 CRITICAL: Database is broken');
    console.log('   → Check Supabase connection');
    console.log('   → Verify API keys');
  }

  if (results.webhook === '❌') {
    console.log('🚨 CRITICAL: Webhook is broken');
    console.log('   → Run: vercel --prod');
    console.log('   → Check deployment status');
  }

  if (results.frontend === '❌') {
    console.log('🚨 CRITICAL: Frontend is broken');
    console.log('   → Check Vercel deployment');
    console.log('   → Run: npm run build');
  }

  if (results.shopify === '⚠️') {
    console.log('⚠️  WARNING: Shopify not connected');
    console.log('   → Set up Shopify integration');
    console.log('   → Check OAuth flow');
  }

  if (results.buttons === '⚠️') {
    console.log('⚠️  WARNING: No recent button activity');
    console.log('   → Test with real WhatsApp messages');
    console.log('   → Check Meta webhook configuration');
  }

  // Quick fix suggestions
  console.log('\n⚡ QUICK FIXES:');
  console.log('===============');

  if (broken > 0) {
    console.log('🔧 Run: quick-fix-deployment.bat');
    console.log('🔧 Run: vercel --prod');
    console.log('🔧 Check Vercel dashboard for errors');
  }

  if (issues > 0) {
    console.log('🔧 Complete Shopify setup in dashboard');
    console.log('🔧 Test WhatsApp integration');
    console.log('🔧 Update Meta webhook URL');
  }

  if (working === 5) {
    console.log('🎉 Everything looks good!');
    console.log('🔧 Test with real customer interactions');
  }

  console.log('\n📋 NEXT STEP:');
  console.log('==============');
  
  if (broken >= 3) {
    console.log('🚨 System needs major fixes');
    console.log('   Run: quick-fix-deployment.bat');
  } else if (broken >= 1) {
    console.log('⚠️  System has critical issues');
    console.log('   Fix the broken components first');
  } else if (issues >= 1) {
    console.log('✅ System mostly working');
    console.log('   Address the warnings');
  } else {
    console.log('🎉 System appears healthy');
    console.log('   Test with real usage');
  }
}

// Run the test
testWhatIsBroken().then(() => {
  console.log('\n🏁 Quick diagnosis completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});