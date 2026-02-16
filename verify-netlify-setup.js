// 🔍 Verify Netlify Setup Before Deployment
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

function verifyNetlifySetup() {
  console.log('🔍 Verifying Netlify Setup');
  console.log('==========================');

  let allGood = true;

  // Check 1: netlify.toml exists
  console.log('\n📋 1. Checking netlify.toml...');
  if (existsSync('netlify.toml')) {
    console.log('✅ netlify.toml exists');
    
    const netlifyConfig = readFileSync('netlify.toml', 'utf8');
    if (netlifyConfig.includes('functions') && netlifyConfig.includes('webhook')) {
      console.log('✅ Functions configuration found');
    } else {
      console.log('⚠️  Functions configuration might be incomplete');
    }
  } else {
    console.log('❌ netlify.toml missing');
    allGood = false;
  }

  // Check 2: Webhook function exists
  console.log('\n📋 2. Checking webhook function...');
  if (existsSync('netlify/functions/webhook.js')) {
    console.log('✅ netlify/functions/webhook.js exists');
    
    const webhookCode = readFileSync('netlify/functions/webhook.js', 'utf8');
    
    // Check for key components
    const checks = [
      { name: 'exports.handler', pattern: 'exports.handler' },
      { name: 'Webhook verification', pattern: 'hub.verify_token' },
      { name: 'Button click handling', pattern: 'handleButtonClick' },
      { name: 'Order fulfillment', pattern: 'fulfillment' },
      { name: 'Supabase integration', pattern: 'supabase' }
    ];

    checks.forEach(check => {
      if (webhookCode.includes(check.pattern)) {
        console.log(`✅ ${check.name} implemented`);
      } else {
        console.log(`❌ ${check.name} missing`);
        allGood = false;
      }
    });
  } else {
    console.log('❌ netlify/functions/webhook.js missing');
    allGood = false;
  }

  // Check 3: Package.json build script
  console.log('\n📋 3. Checking package.json...');
  if (existsSync('package.json')) {
    console.log('✅ package.json exists');
    
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    if (packageJson.scripts && packageJson.scripts.build) {
      console.log('✅ Build script found:', packageJson.scripts.build);
    } else {
      console.log('⚠️  Build script missing');
    }

    // Check dependencies
    const requiredDeps = ['@supabase/supabase-js', 'react', 'vite'];
    requiredDeps.forEach(dep => {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        console.log(`✅ ${dep} dependency found`);
      } else {
        console.log(`⚠️  ${dep} dependency missing`);
      }
    });
  } else {
    console.log('❌ package.json missing');
    allGood = false;
  }

  // Check 4: Environment variables template
  console.log('\n📋 4. Checking environment setup...');
  if (existsSync('.env.example')) {
    console.log('✅ .env.example exists');
  } else {
    console.log('⚠️  .env.example missing (not critical)');
  }

  // Check 5: Git setup
  console.log('\n📋 5. Checking git setup...');
  if (existsSync('.git')) {
    console.log('✅ Git repository initialized');
  } else {
    console.log('⚠️  Git not initialized - run: git init');
  }

  if (existsSync('.gitignore')) {
    console.log('✅ .gitignore exists');
  } else {
    console.log('⚠️  .gitignore missing');
  }

  // Final assessment
  console.log('\n📊 FINAL ASSESSMENT');
  console.log('===================');

  if (allGood) {
    console.log('🎉 ALL CHECKS PASSED!');
    console.log('✅ Ready for Netlify deployment');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Run: deploy-to-netlify.bat');
    console.log('2. Deploy on netlify.com');
    console.log('3. Add environment variables');
    console.log('4. Update Meta webhook URL');
  } else {
    console.log('⚠️  SOME ISSUES FOUND');
    console.log('Please fix the issues above before deploying');
  }

  console.log('\n🔗 Required Environment Variables for Netlify:');
  console.log('VITE_SUPABASE_URL=https://rmpgofswkpjxionzythf.supabase.co');
  console.log('VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
  console.log('WEBHOOK_VERIFY_TOKEN=whatsapp_crm_2024');

  console.log('\n🎯 Your webhook URL will be:');
  console.log('https://YOUR-SITE-NAME.netlify.app/.netlify/functions/webhook');
}

// Run verification
verifyNetlifySetup();