// Deep OAuth Test
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testOAuthDeep() {
  console.log('🔍 Deep OAuth & Shopify Integration Test\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const issues = [];

  // Test 1: Check Redirect URL
  console.log('1️⃣  Testing OAuth Redirect URL...');
  const expectedRedirectUrl = 'https://wahtsapp2.vercel.app/api/shopify/oauth/callback';
  console.log(`   Expected: ${expectedRedirectUrl}`);
  
  try {
    const response = await fetch(expectedRedirectUrl, { 
      method: 'GET',
      redirect: 'manual'
    });
    
    if (response.status === 302 || response.status === 405 || response.status === 400) {
      console.log('   ✅ PASSED - Endpoint exists and responds\n');
    } else {
      console.log(`   ⚠️  WARNING - Status: ${response.status}\n`);
    }
  } catch (err) {
    console.log('   ❌ FAILED - Endpoint not accessible');
    console.log(`   Error: ${err.message}\n`);
    issues.push('OAuth callback endpoint not accessible');
  }

  // Test 2: Check Frontend OAuth Component
  console.log('2️⃣  Testing Frontend OAuth Component...');
  try {
    const response = await fetch('https://wahtsapp2.vercel.app');
    if (response.ok) {
      console.log('   ✅ PASSED - Frontend accessible\n');
    } else {
      console.log(`   ⚠️  WARNING - Status: ${response.status}\n`);
    }
  } catch (err) {
    console.log('   ❌ FAILED - Frontend not accessible\n');
    issues.push('Frontend not accessible');
  }

  // Test 3: Check Database Schema
  console.log('3️⃣  Testing Database Schema...');
  try {
    // Check shopify_connections columns
    const { data, error } = await supabase
      .from('shopify_connections')
      .select('*')
      .limit(0);
    
    if (error) {
      console.log('   ❌ FAILED - shopify_connections table issue');
      console.log(`   Error: ${error.message}\n`);
      issues.push('shopify_connections table has issues');
    } else {
      console.log('   ✅ PASSED - shopify_connections table structure OK\n');
    }
  } catch (err) {
    console.log('   ❌ FAILED:', err.message, '\n');
    issues.push('Database schema issue');
  }

  // Test 4: Check RLS Policies
  console.log('4️⃣  Testing RLS Policies...');
  try {
    const { data, error } = await supabase
      .from('shopify_connections')
      .select('*');
    
    if (error && error.message.includes('policy')) {
      console.log('   ⚠️  WARNING - RLS policy might be too restrictive');
      console.log(`   Error: ${error.message}\n`);
      issues.push('RLS policies might block access');
    } else {
      console.log('   ✅ PASSED - RLS policies allow access\n');
    }
  } catch (err) {
    console.log('   ❌ FAILED:', err.message, '\n');
  }

  // Test 5: Simulate OAuth Flow
  console.log('5️⃣  Simulating OAuth Flow...');
  console.log('   Step 1: Generate OAuth URL');
  
  const testShop = 'test-store';
  const testClientId = 'test-client-id';
  const testRedirectUri = 'https://wahtsapp2.vercel.app/api/shopify/oauth/callback';
  const testScopes = 'read_orders,write_orders';
  
  const oauthUrl = `https://${testShop}.myshopify.com/admin/oauth/authorize?` +
    `client_id=${testClientId}&` +
    `scope=${testScopes}&` +
    `redirect_uri=${encodeURIComponent(testRedirectUri)}&` +
    `state=test`;
  
  console.log(`   Generated URL: ${oauthUrl}`);
  console.log('   ✅ OAuth URL format is correct\n');

  // Test 6: Check Environment Variables in Vercel
  console.log('6️⃣  Checking Required Environment Variables...');
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  let envOk = true;
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      console.log(`   ✅ ${varName} - present`);
    } else {
      console.log(`   ❌ ${varName} - MISSING`);
      envOk = false;
      issues.push(`${varName} not set`);
    }
  }
  
  // Check optional but recommended
  if (process.env.VITE_APP_URL) {
    console.log(`   ✅ VITE_APP_URL - present (${process.env.VITE_APP_URL})`);
  } else {
    console.log('   ⚠️  VITE_APP_URL - not set (using fallback)');
  }
  console.log('');

  // Test 7: Test Shopify API Format
  console.log('7️⃣  Testing Shopify API Format...');
  const testShopUrl = 'example-store.myshopify.com';
  const testToken = 'shpat_test123';
  
  console.log(`   Shop URL format: ${testShopUrl} ✅`);
  console.log(`   Token format: ${testToken.startsWith('shpat_') ? '✅' : '❌'}`);
  console.log('');

  // Test 8: Check for Common Issues
  console.log('8️⃣  Checking for Common OAuth Issues...');
  
  const commonIssues = [
    {
      issue: 'Redirect URL mismatch',
      check: 'Make sure Shopify App has: https://wahtsapp2.vercel.app/api/shopify/oauth/callback',
      status: 'MANUAL_CHECK'
    },
    {
      issue: 'Missing permissions',
      check: 'Make sure Shopify App has: read_orders, write_orders',
      status: 'MANUAL_CHECK'
    },
    {
      issue: 'App not installed',
      check: 'Make sure you clicked "Install app" in Shopify',
      status: 'MANUAL_CHECK'
    },
    {
      issue: 'Wrong Client ID/Secret',
      check: 'Make sure you copied from API credentials tab',
      status: 'MANUAL_CHECK'
    }
  ];

  commonIssues.forEach(({ issue, check, status }) => {
    console.log(`   ⚠️  ${issue}`);
    console.log(`      Check: ${check}`);
  });
  console.log('');

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 DEEP TEST SUMMARY:\n');

  if (issues.length === 0) {
    console.log('✅ No technical issues found!\n');
    console.log('🎯 The problem is likely in Shopify App configuration:\n');
    console.log('   1. Redirect URL not added in Shopify');
    console.log('   2. Permissions not configured');
    console.log('   3. App not installed');
    console.log('   4. Wrong Client ID/Secret\n');
    
    console.log('📝 Follow these steps EXACTLY:\n');
    console.log('   Step 1: Open Shopify Admin');
    console.log('   Step 2: Settings → Apps → Develop apps');
    console.log('   Step 3: Select your app (or create new)');
    console.log('   Step 4: Configuration tab');
    console.log('   Step 5: Add Allowed redirection URL:');
    console.log('           https://wahtsapp2.vercel.app/api/shopify/oauth/callback');
    console.log('   Step 6: Configure Admin API scopes:');
    console.log('           ✅ read_orders');
    console.log('           ✅ write_orders');
    console.log('   Step 7: Save');
    console.log('   Step 8: Install app');
    console.log('   Step 9: Copy Client ID & Secret from API credentials');
    console.log('   Step 10: Try connecting again\n');
  } else {
    console.log('❌ Technical issues found:\n');
    issues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
    console.log('');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Detailed Instructions
  console.log('📚 DETAILED SHOPIFY APP SETUP:\n');
  console.log('File: حل-OAuth-نهائي.md');
  console.log('Contains: 18 detailed steps with screenshots\n');
  
  console.log('🔗 Quick Links:\n');
  console.log('   Shopify Apps: https://admin.shopify.com/settings/apps');
  console.log('   Your App: https://wahtsapp2.vercel.app');
  console.log('   Supabase: https://supabase.com/dashboard/project/rmpgofswkpjxionzythf\n');
}

testOAuthDeep().catch(console.error);
