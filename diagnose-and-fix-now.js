// 🔍 Diagnose and Fix System Issues - تشخيص وإصلاح مشاكل النظام
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rmpgofswkpjxionzythf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function diagnoseAndFix() {
  console.log('🔍 DIAGNOSING SYSTEM ISSUES');
  console.log('============================');
  console.log('تشخيص مشاكل النظام وإصلاحها');

  const issues = [];
  const fixes = [];

  try {
    // 1. Test Database Connection
    console.log('\n📋 1. Testing Database Connection...');
    console.log('====================================');
    
    try {
      const { data: brands, error: brandsError } = await supabase
        .from('brands')
        .select('*')
        .limit(1);

      if (brandsError) {
        console.error('❌ Database connection failed:', brandsError.message);
        issues.push('Database connection failed');
        fixes.push('Check Supabase URL and API key');
      } else {
        console.log('✅ Database connection successful');
        console.log(`   Found ${brands?.length || 0} brands`);
        
        if (brands && brands.length > 0) {
          const brand = brands[0];
          console.log(`   Brand: ${brand.name}`);
          console.log(`   Phone Number ID: ${brand.phone_number_id || 'Missing'}`);
          console.log(`   WhatsApp Token: ${brand.whatsapp_token ? 'Present' : 'Missing'}`);
          
          if (!brand.phone_number_id) {
            issues.push('Brand missing phone_number_id');
            fixes.push('Add phone_number_id to brand settings');
          }
          
          if (!brand.whatsapp_token) {
            issues.push('Brand missing WhatsApp token');
            fixes.push('Add WhatsApp token to brand settings');
          }
        } else {
          issues.push('No brands found in database');
          fixes.push('Create at least one brand in the system');
        }
      }
    } catch (dbError) {
      console.error('❌ Database test failed:', dbError.message);
      issues.push('Database connection error');
      fixes.push('Check network connection and Supabase status');
    }

    // 2. Test Webhook Endpoints
    console.log('\n📋 2. Testing Webhook Endpoints...');
    console.log('===================================');
    
    const webhookUrls = [
      'https://wahtsapp.vercel.app/api/webhook',
      'https://wahtsapp-git-main-m0hammedahmed.vercel.app/api/webhook',
      'https://wahtsapp-m0hammedahmed.vercel.app/api/webhook'
    ];

    let workingWebhooks = 0;
    
    for (const webhookUrl of webhookUrls) {
      try {
        console.log(`\n🌐 Testing: ${webhookUrl}`);
        
        const response = await fetch(webhookUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log(`   Status: ${response.status}`);
        
        if (response.status === 200 || response.status === 405) {
          console.log('   ✅ Endpoint is accessible');
          workingWebhooks++;
        } else if (response.status === 404) {
          console.log('   ❌ Endpoint not found');
          issues.push(`Webhook endpoint 404: ${webhookUrl}`);
        } else {
          console.log('   ⚠️  Unexpected response');
          issues.push(`Webhook endpoint issue: ${webhookUrl}`);
        }
      } catch (fetchError) {
        console.log(`   ❌ Failed to reach: ${fetchError.message}`);
        issues.push(`Cannot reach webhook: ${webhookUrl}`);
      }
    }

    if (workingWebhooks === 0) {
      issues.push('No working webhook endpoints found');
      fixes.push('Deploy the project to Vercel or check deployment status');
    } else {
      console.log(`\n✅ Found ${workingWebhooks} working webhook endpoints`);
    }

    // 3. Test Shopify Integration
    console.log('\n📋 3. Testing Shopify Integration...');
    console.log('====================================');
    
    try {
      const { data: shopifyConns } = await supabase
        .from('shopify_connections')
        .select('*')
        .eq('is_active', true)
        .limit(1);

      if (shopifyConns && shopifyConns.length > 0) {
        const shopifyConn = shopifyConns[0];
        console.log('✅ Shopify connection found');
        console.log(`   Shop URL: ${shopifyConn.shop_url}`);
        console.log(`   Access Token: ${shopifyConn.access_token ? 'Present' : 'Missing'}`);
        
        if (!shopifyConn.access_token) {
          issues.push('Shopify connection missing access token');
          fixes.push('Re-authenticate with Shopify');
        } else {
          // Test Shopify API
          try {
            const shopifyResponse = await fetch(
              `https://${shopifyConn.shop_url}/admin/api/2024-01/shop.json`,
              {
                headers: {
                  'X-Shopify-Access-Token': shopifyConn.access_token,
                  'Content-Type': 'application/json'
                }
              }
            );

            if (shopifyResponse.ok) {
              const shopData = await shopifyResponse.json();
              console.log('✅ Shopify API connection successful');
              console.log(`   Shop Name: ${shopData.shop?.name}`);
            } else {
              console.log('❌ Shopify API connection failed');
              issues.push('Shopify API authentication failed');
              fixes.push('Check Shopify access token validity');
            }
          } catch (shopifyError) {
            console.log('❌ Shopify API test failed:', shopifyError.message);
            issues.push('Shopify API connection error');
            fixes.push('Check Shopify connection settings');
          }
        }
      } else {
        console.log('⚠️  No active Shopify connections found');
        issues.push('No Shopify connections configured');
        fixes.push('Set up Shopify integration in the dashboard');
      }
    } catch (shopifyTestError) {
      console.error('❌ Shopify test failed:', shopifyTestError.message);
      issues.push('Shopify integration test failed');
      fixes.push('Check Shopify database tables');
    }

    // 4. Test Recent Activity
    console.log('\n📋 4. Testing Recent Activity...');
    console.log('=================================');
    
    try {
      // Check recent messages
      const { data: recentMessages } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentMessages && recentMessages.length > 0) {
        console.log(`✅ Found ${recentMessages.length} recent messages`);
        
        const buttonClicks = recentMessages.filter(msg => 
          msg.message_type === 'interactive' && msg.body?.includes('[Button:')
        );
        
        if (buttonClicks.length > 0) {
          console.log(`   📱 ${buttonClicks.length} button clicks found`);
          
          // Check if orders were updated after button clicks
          const { data: recentOrders } = await supabase
            .from('shopify_orders')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(5);

          if (recentOrders && recentOrders.length > 0) {
            const fulfilledOrders = recentOrders.filter(order => order.order_status === 'fulfilled');
            console.log(`   📦 ${fulfilledOrders.length} fulfilled orders found`);
            
            if (buttonClicks.length > 0 && fulfilledOrders.length === 0) {
              issues.push('Button clicks not resulting in order fulfillment');
              fixes.push('Check webhook button handler logic');
            }
          }
        } else {
          console.log('   ⚠️  No button clicks found');
          issues.push('No recent button interactions');
          fixes.push('Test button functionality with real WhatsApp messages');
        }
      } else {
        console.log('⚠️  No recent messages found');
        issues.push('No recent message activity');
        fixes.push('Send test messages to verify webhook is receiving data');
      }
    } catch (activityError) {
      console.error('❌ Activity test failed:', activityError.message);
      issues.push('Cannot check recent activity');
      fixes.push('Check database permissions and table structure');
    }

    // 5. Test Frontend Access
    console.log('\n📋 5. Testing Frontend Access...');
    console.log('==================================');
    
    const frontendUrls = [
      'https://wahtsapp.vercel.app',
      'https://wahtsapp-git-main-m0hammedahmed.vercel.app'
    ];

    let workingFrontends = 0;
    
    for (const frontendUrl of frontendUrls) {
      try {
        console.log(`\n🌐 Testing: ${frontendUrl}`);
        
        const response = await fetch(frontendUrl, {
          method: 'GET'
        });

        console.log(`   Status: ${response.status}`);
        
        if (response.status === 200) {
          console.log('   ✅ Frontend is accessible');
          workingFrontends++;
        } else {
          console.log('   ❌ Frontend not accessible');
          issues.push(`Frontend not accessible: ${frontendUrl}`);
        }
      } catch (fetchError) {
        console.log(`   ❌ Failed to reach: ${fetchError.message}`);
        issues.push(`Cannot reach frontend: ${frontendUrl}`);
      }
    }

    if (workingFrontends === 0) {
      issues.push('No working frontend URLs found');
      fixes.push('Check Vercel deployment status');
    }

    // 6. Summary and Recommendations
    console.log('\n📋 6. DIAGNOSIS SUMMARY');
    console.log('=======================');
    
    if (issues.length === 0) {
      console.log('🎉 NO ISSUES FOUND!');
      console.log('System appears to be working correctly.');
    } else {
      console.log(`⚠️  FOUND ${issues.length} ISSUES:`);
      console.log('================================');
      
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. ❌ ${issue}`);
      });
      
      console.log('\n🔧 RECOMMENDED FIXES:');
      console.log('=====================');
      
      fixes.forEach((fix, index) => {
        console.log(`${index + 1}. 🔧 ${fix}`);
      });
    }

    // 7. Specific Action Plan
    console.log('\n📋 7. ACTION PLAN');
    console.log('=================');
    
    if (issues.some(issue => issue.includes('webhook'))) {
      console.log('\n🚀 WEBHOOK ISSUES DETECTED:');
      console.log('===========================');
      console.log('1. Run: vercel --prod');
      console.log('2. Check Vercel dashboard for deployment errors');
      console.log('3. Verify environment variables are set');
      console.log('4. Test webhook URL manually');
    }
    
    if (issues.some(issue => issue.includes('Database'))) {
      console.log('\n💾 DATABASE ISSUES DETECTED:');
      console.log('============================');
      console.log('1. Check Supabase dashboard');
      console.log('2. Verify database tables exist');
      console.log('3. Check RLS policies');
      console.log('4. Test connection manually');
    }
    
    if (issues.some(issue => issue.includes('Shopify'))) {
      console.log('\n🛒 SHOPIFY ISSUES DETECTED:');
      console.log('===========================');
      console.log('1. Re-authenticate with Shopify');
      console.log('2. Check app permissions');
      console.log('3. Verify webhook subscriptions');
      console.log('4. Test API access manually');
    }
    
    if (issues.some(issue => issue.includes('button'))) {
      console.log('\n🔘 BUTTON ISSUES DETECTED:');
      console.log('==========================');
      console.log('1. Check webhook button handler code');
      console.log('2. Verify Meta webhook URL is correct');
      console.log('3. Test with real button clicks');
      console.log('4. Check function logs for errors');
    }

    // 8. Quick Fix Commands
    console.log('\n📋 8. QUICK FIX COMMANDS');
    console.log('========================');
    
    console.log('\n🔧 Deploy/Redeploy:');
    console.log('vercel --prod');
    
    console.log('\n🧪 Test System:');
    console.log('node test-fulfill-only-no-payment.js');
    
    console.log('\n🔍 Debug Webhook:');
    console.log('node debug-button-vs-manual-fulfillment.js');
    
    console.log('\n📱 Test WhatsApp:');
    console.log('Send a message to your WhatsApp number and check dashboard');

  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
    console.log('\n🆘 CRITICAL ERROR:');
    console.log('==================');
    console.log('The diagnosis script itself failed.');
    console.log('This might indicate a fundamental system issue.');
    console.log('');
    console.log('Try these basic steps:');
    console.log('1. Check internet connection');
    console.log('2. Verify Node.js is installed');
    console.log('3. Run: npm install');
    console.log('4. Check if .env file exists');
  }
}

// Run diagnosis
diagnoseAndFix().then(() => {
  console.log('\n🏁 Diagnosis completed');
  console.log('\nNext: Fix the identified issues and test again');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});